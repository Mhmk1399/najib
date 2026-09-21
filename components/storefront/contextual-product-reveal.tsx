"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  Maximize2,
  Sparkles,
  X,
} from "lucide-react";
import {
  type CSSProperties,
  type TouchEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  IMAGE_STORY_PRODUCT_REVEAL_EVENT,
  type ImageStoryLocalizedText,
  type ImageStoryProductRevealImage,
  type ImageStoryProductRevealRequest,
} from "@/components/storefront/image-story-product-reveal";
import {
  formatStoryMoney,
  formatStoryNumber,
  imageStoryCopy,
  localizedStoryText,
} from "@/lib/i18n/image-story-i18n";
import {
  getHtmlLang,
  getLocaleDirection,
  type Locale,
} from "@/lib/i18n/config";
import { getLocaleFromPathname, localizedHref } from "@/lib/i18n/routes";

type CatalogImageAsset = {
  _id: string;
  url: string;
  alt?: ImageStoryLocalizedText;
  objectFit?: string;
  objectPosition?: string;
};

type CatalogProductRecord = {
  _id: string;
  name: ImageStoryLocalizedText;
  slug: string;
  description?: ImageStoryLocalizedText;
  basePriceMinor: number;
  currency: string;
  primaryImageId?: string | null;
  primaryImageObjectFit?: string;
  primaryImageObjectPosition?: string;
  imageIds?: string[];
};

type CatalogTaxonomyRecord = {
  _id: string;
  name: ImageStoryLocalizedText;
  slug: string;
};

type CatalogColorRecord = {
  _id: string;
  name: ImageStoryLocalizedText;
  hex?: string;
};

type CatalogSizeRecord = {
  _id: string;
  name: ImageStoryLocalizedText;
  code?: string;
};

type ProductDetailPayload = {
  product: CatalogProductRecord;
  category?: CatalogTaxonomyRecord | null;
  subcategory?: CatalogTaxonomyRecord | null;
  images: CatalogImageAsset[];
  colors?: CatalogColorRecord[];
  sizes?: CatalogSizeRecord[];
};

type RevealState = {
  request: ImageStoryProductRevealRequest;
  mount: HTMLElement;
  pathname: string | null;
};

type ProductRevealImage = {
  id: string;
  url: string;
  alt: string;
  objectFit?: string;
  objectPosition?: string;
};

type LenisLike = {
  scrollTo: (
    target: HTMLElement,
    options?: { offset?: number; duration?: number; immediate?: boolean },
  ) => void;
};

type LenisWindow = Window & {
  __lenis?: LenisLike;
};

const FALLBACK_IMAGE = "/assets/images/banner.webp";
const productQueryOptions = {
  staleTime: 12 * 60 * 60_000,
  gcTime: 24 * 60 * 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false,
  retry: 1,
} as const;
async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    headers: {
      Accept: "application/json",
      ...Object.fromEntries(new Headers(init?.headers).entries()),
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Product could not be loaded.");
  }

  return (await response.json()) as T;
}

function text(
  value: ImageStoryLocalizedText | null | undefined,
  locale: Locale,
  fallback = "",
) {
  return localizedStoryText(value, locale, fallback);
}

function idOf(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toString" in value) {
    return String(value);
  }
  return "";
}

function imageFit(value: string | undefined): CSSProperties["objectFit"] {
  if (
    value === "contain" ||
    value === "cover" ||
    value === "fill" ||
    value === "none" ||
    value === "scale-down"
  ) {
    return value;
  }

  return "cover";
}

function escapeSelectorValue(value: string) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }

  return value.replace(/[\\"]/g, "\\$&");
}

function resolveRevealSource(request: ImageStoryProductRevealRequest) {
  if (request.sourceElement?.isConnected) return request.sourceElement;

  if (request.storyId) {
    const source = document.querySelector<HTMLElement>(
      `[data-image-story-id="${escapeSelectorValue(request.storyId)}"]`,
    );
    if (source) return source;
  }

  if (request.storyUrl) {
    return document.querySelector<HTMLElement>(
      `[data-image-story-url="${escapeSelectorValue(request.storyUrl)}"]`,
    );
  }

  return null;
}

function ensureRevealMount(request: ImageStoryProductRevealRequest) {
  const source = resolveRevealSource(request);
  if (!source) return null;

  const existingMount = document.querySelector<HTMLElement>(
    '[data-contextual-product-reveal="true"]',
  );
  if (existingMount) return existingMount;

  const mount = document.createElement("div");
  mount.dataset.contextualProductReveal = "true";
  document.body.appendChild(mount);

  return mount;
}

function productImages(
  payload: ProductDetailPayload | undefined,
  fallbackImage: ImageStoryProductRevealImage | null | undefined,
  locale: Locale,
  previewAlt: string,
): ProductRevealImage[] {
  if (!payload) {
    return fallbackImage?.url
      ? [
          {
            id: fallbackImage.id ?? "preview",
            url: fallbackImage.url,
            alt: text(fallbackImage.alt, locale, previewAlt),
            objectFit: fallbackImage.objectFit,
            objectPosition: fallbackImage.objectPosition,
          },
        ]
      : [];
  }

  const imageMap = new Map(
    payload.images.map((image) => [idOf(image._id), image]),
  );
  const ids = [
    payload.product.primaryImageId,
    ...(Array.isArray(payload.product.imageIds)
      ? payload.product.imageIds
      : []),
  ]
    .filter(Boolean)
    .map(String);
  const uniqueIds = [...new Set(ids)];
  const images = uniqueIds.reduce<ProductRevealImage[]>(
    (items, imageId, index) => {
      const image = imageMap.get(imageId);
      if (!image?.url) return items;

      items.push({
        id: `${payload.product._id}-${index + 1}`,
        url: image.url,
        alt: text(
          image.alt,
          locale,
          text(payload.product.name, locale, payload.product.slug),
        ),
        objectFit:
          index === 0
            ? (payload.product.primaryImageObjectFit ?? image.objectFit)
            : image.objectFit,
        objectPosition:
          index === 0
            ? (payload.product.primaryImageObjectPosition ??
              image.objectPosition)
            : image.objectPosition,
      });

      return items;
    },
    [],
  );

  if (images.length) return images.slice(0, 5);

  if (fallbackImage?.url) {
    return [
      {
        id: fallbackImage.id ?? "preview",
        url: fallbackImage.url,
        alt: text(
          fallbackImage.alt,
          locale,
          text(payload.product.name, locale, payload.product.slug),
        ),
        objectFit: fallbackImage.objectFit,
        objectPosition: fallbackImage.objectPosition,
      },
    ];
  }

  return [
    {
      id: "fallback",
      url: FALLBACK_IMAGE,
      alt: text(payload.product.name, locale, payload.product.slug),
      objectFit: "cover",
      objectPosition: "center",
    },
  ];
}

function scrollToSource(element: HTMLElement) {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const lenis = (window as LenisWindow).__lenis;

  if (lenis && !reduceMotion) {
    lenis.scrollTo(element, { offset: -104, duration: 0.72 });
    return;
  }

  element.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "center",
  });
}

export function ContextualProductReveal() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const direction = getLocaleDirection(locale);
  const htmlLang = getHtmlLang(locale);
  const copy = imageStoryCopy[locale].reveal;
  const sectionRef = useRef<HTMLElement>(null);
  const exitButtonRef = useRef<HTMLButtonElement>(null);
  const revealRef = useRef<RevealState | null>(null);
  const [reveal, setReveal] = useState<RevealState | null>(null);

  useEffect(() => {
    const onReveal = (event: Event) => {
      const request = (event as CustomEvent<ImageStoryProductRevealRequest>)
        .detail;
      if (!request?.product?.slug) return;

      const mount = ensureRevealMount(request);
      if (!mount) return;

      const previous = revealRef.current;
      const next = { request, mount, pathname } satisfies RevealState;
      revealRef.current = next;
      setReveal(next);

      if (previous?.mount !== mount) {
        window.requestAnimationFrame(() => previous?.mount.remove());
      }
    };

    window.addEventListener(IMAGE_STORY_PRODUCT_REVEAL_EVENT, onReveal);
    return () =>
      window.removeEventListener(IMAGE_STORY_PRODUCT_REVEAL_EVENT, onReveal);
  }, [pathname]);

  useEffect(() => {
    const current = revealRef.current;
    if (!current || current.pathname === pathname) return;

    current.mount.remove();
    revealRef.current = null;
    const frame = window.requestAnimationFrame(() => {
      setReveal((value) => (value === current ? null : value));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(
    () => () => {
      revealRef.current?.mount.remove();
    },
    [],
  );

  const activeReveal = reveal?.pathname === pathname ? reveal : null;
  const slug = activeReveal?.request.product.slug ?? "";
  const productQuery = useQuery({
    queryKey: ["storefront", "product-detail", locale, slug],
    queryFn: ({ signal }) =>
      fetchJson<ProductDetailPayload>(`/api/storefront/products/${slug}`, {
        signal,
      }),
    enabled: Boolean(slug),
    ...productQueryOptions,
  });

  useEffect(() => {
    if (!activeReveal) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;
    const previousHtmlOverscroll =
      document.documentElement.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overscrollBehavior = "none";

    const frame = window.requestAnimationFrame(() => {
      exitButtonRef.current?.focus({ preventScroll: true });
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
      document.documentElement.style.overscrollBehavior =
        previousHtmlOverscroll;
    };
  }, [activeReveal]);

  const images = useMemo(
    () =>
      productImages(
        productQuery.data,
        activeReveal?.request.product.image,
        locale,
        copy.previewAlt,
      ),
    [activeReveal?.request.product.image, copy.previewAlt, locale, productQuery.data],
  );

  const closeReveal = useCallback(
    (options: { returnToSource?: boolean } = {}) => {
      const current = revealRef.current;
      const source = current ? resolveRevealSource(current.request) : null;
      const scrollY = window.scrollY;
      revealRef.current = null;
      setReveal(null);
      window.requestAnimationFrame(() => {
        current?.mount.remove();

        if (options.returnToSource && source?.isConnected) {
          window.requestAnimationFrame(() => scrollToSource(source));
        } else if (!options.returnToSource || !source?.isConnected) {
          window.requestAnimationFrame(() => window.scrollTo(0, scrollY));
        }
      });
    },
    [],
  );

  useEffect(() => {
    if (!activeReveal) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeReveal({ returnToSource: true });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeReveal, closeReveal]);

  if (!activeReveal) return null;

  const product = productQuery.data?.product;
  const requestedProduct = activeReveal.request.product;
  const title = product
    ? text(product.name, locale, product.slug)
    : text(
        requestedProduct.label,
        locale,
        text(requestedProduct.name, locale, requestedProduct.slug),
      );
  const price = product
    ? formatStoryMoney(product.basePriceMinor, product.currency, locale)
    : "";
  const isLoading = productQuery.isLoading && !productQuery.data;
  const detailsHref = localizedHref(
    requestedProduct.href || `/shop/${requestedProduct.slug}`,
    locale,
  );
  const colors = productQuery.data?.colors ?? [];
  const sourceImageUrl =
    activeReveal.request.storyUrl ||
    requestedProduct.image?.url ||
    FALLBACK_IMAGE;

  const revealPanel = (
    <section
      ref={sectionRef}
      dir={direction}
      lang={htmlLang}
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      data-contextual-reveal="true"
      aria-labelledby="contextual-product-reveal-title"
      tabIndex={-1}
      className="fixed inset-0 z-[2147483600] isolate h-[100dvh] w-[100dvw] overflow-hidden overscroll-none bg-[#080706] text-white outline-none"
    >
      <Image
        src={sourceImageUrl}
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none scale-[1.08] object-cover object-center blur-[18px] opacity-[0.38] saturate-[0.78]"
        aria-hidden="true"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,4,3,0.76)_0%,rgba(7,6,5,0.48)_30%,rgba(6,5,4,0.68)_70%,rgba(5,4,3,0.96)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(210,168,126,0.08),transparent_34%),radial-gradient(circle_at_50%_92%,rgba(183,131,90,0.07),transparent_30%)]"
      />

      <div className="relative z-10 grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
        <header className="shrink-0 "></header>

        <div className="mx-auto grid min-h-0 w-full max-w-[1600px] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-4 sm:pt-4 lg:px-10 lg:pb-5 lg:pt-5">
          <div className="shrink-0 text-center">
            <h2
              id="contextual-product-reveal-title"
              className="mx-auto max-w-[760px] truncate text-[clamp(1.45rem,6vw,2.35rem)] font-semibold leading-[1.12] tracking-[-0.035em] text-white drop-shadow-[0_8px_28px_rgba(0,0,0,0.42)] lg:text-[clamp(1.85rem,2.7vw,2.75rem)]"
            >
              {title}
            </h2>
            <div className="relative mx-auto mt-3 lg:hidden min-h-10 w-full max-w-[760px] sm:mt-4 sm:min-h-11">
              <button
                ref={exitButtonRef}
                type="button"
                onClick={() => closeReveal({ returnToSource: true })}
                className="absolute inset-y-0 end-0 inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/[0.22] bg-black/[0.34] px-3.5 text-[9px] font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-2xl transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[#D8AE86]/75 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4BD97]/80 active:translate-y-0 sm:min-h-11 sm:px-4 sm:text-[10px]"
                aria-label={copy.exitPreview}
              >
                <X className="size-4" aria-hidden="true" />
                <span className="min-[390px]:inline">{copy.exit}</span>
              </button>

              <Link
                href={detailsHref}
                aria-label={copy.productPage}
                title={copy.productPage}
                className="absolute inset-y-0 start-0 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-[#B7835A]/55 bg-[#B7835A]/[0.12] px-3 text-[8.5px] font-semibold text-[#E4BD97] backdrop-blur-xl transition-[border-color,background-color,color] hover:border-[#D9AF87]/80 hover:bg-[#B7835A]/[0.22] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4BD97]/75 sm:min-h-11 sm:px-4 sm:text-[9.5px]"
              >
                <span className="min-[430px]:inline">{copy.productPage}</span>
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-2.5 flex min-h-9 flex-wrap items-center justify-center gap-3 sm:mt-3 sm:gap-4">
              {colors.length ? (
                <div
                  className="flex items-center gap-2"
                  aria-label={copy.colors}
                >
                  <span className="text-[9px] text-white/[0.52] sm:text-[10px]">
                    {copy.colors}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {colors.slice(0, 5).map((color) => (
                      <span
                        key={color._id}
                        title={text(color.name, locale)}
                        aria-label={text(color.name, locale)}
                        className="grid size-7 place-items-center rounded-full border border-white/[0.30] bg-black/[0.30] p-[4px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:size-8"
                      >
                        <span
                          aria-hidden="true"
                          className="block size-full rounded-full border border-white/[0.26]"
                          style={{ backgroundColor: color.hex ?? "#8b8178" }}
                        />
                      </span>
                    ))}
                  </span>
                </div>
              ) : null}

              {price ? (
                <>
                  {colors.length ? (
                    <span
                      aria-hidden="true"
                      className="h-5 w-px bg-white/[0.13]"
                    />
                  ) : null}
                  <strong className="text-[10px] font-semibold text-white/[0.9] sm:text-[11px]">
                    {price}
                  </strong>
                </>
              ) : null}
            </div>
          </div>

          <div className="min-h-0 py-3 sm:py-4 lg:py-5">
            <ProductGallery
              images={images}
              isLoading={isLoading}
              isError={productQuery.isError}
              detailsHref={detailsHref}
              productTitle={title}
              locale={locale}
              copy={copy}
            />
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-2.5 border-t border-white/[0.09] pt-3 sm:mx-auto sm:w-full sm:max-w-[520px] sm:gap-3 sm:pt-4">
            <Link
              href={detailsHref}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[#B7835A]/70 bg-[#B7835A]/[0.22] px-3 text-[9px] font-semibold text-[#E8C39E] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:border-[#E1B587] hover:bg-[#B7835A]/[0.34] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E7C8A8]/80 active:translate-y-0 sm:min-h-12 sm:text-[10px]"
            >
              {copy.productPage}
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => closeReveal({ returnToSource: true })}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-white/[0.18] bg-black/[0.28] px-3 text-[9px] font-semibold text-white/[0.82] backdrop-blur-xl transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/65 active:translate-y-0 sm:min-h-12 sm:text-[10px]"
            >
              {copy.back}
              <ArrowRight
                className={`size-3.5 ${direction === "ltr" ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  return createPortal(revealPanel, activeReveal.mount);
}

type ProductGalleryProps = {
  images: ProductRevealImage[];
  isLoading: boolean;
  isError: boolean;
  detailsHref: string;
  productTitle: string;
  locale: Locale;
  copy: (typeof imageStoryCopy)[Locale]["reveal"];
};

function ProductGallery({
  images,
  isLoading,
  isError,
  detailsHref,
  productTitle,
  locale,
  copy,
}: ProductGalleryProps) {
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const safeModalIndex =
    modalIndex === null
      ? null
      : Math.min(modalIndex, Math.max(images.length - 1, 0));
  const modalImage =
    safeModalIndex === null ? null : (images[safeModalIndex] ?? null);
  const columnCount = Math.max(images.length, 1);

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label={copy.loadingImages}
        className="flex h-full min-h-0 w-full items-center justify-center overflow-hidden rounded-[20px] border border-white/[0.11] bg-black/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-2xl"
      >
        <span className="relative grid size-14 place-items-center rounded-full border border-[#B7835A]/55 bg-black/[0.30] text-[#E4BE99] shadow-[0_12px_40px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.10)]">
          <Sparkles className="size-5" aria-hidden="true" />
          <Loader2
            className="absolute size-8 animate-spin text-white/[0.62]"
            aria-hidden="true"
          />
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full min-h-0 w-full flex-col items-center justify-center overflow-hidden rounded-[20px] border border-white/[0.11] bg-black/[0.18] px-5 text-center backdrop-blur-2xl">
        <p className="text-[11px] leading-6 text-white/[0.62]">
          {copy.imagesUnavailable}
        </p>
        <Link
          href={detailsHref}
          className="mt-3 inline-flex items-center gap-2 text-[9.5px] font-medium text-[#D0A179] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D2B08D]/75"
        >
          {copy.productPage}
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  if (!images.length) return null;

  return (
    <>
      <div
        className="grid h-full min-h-0 w-full gap-1.5 overflow-hidden sm:gap-2.5 lg:gap-3.5"
        style={{
          gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
        }}
      >
        {images.map((image, index) => (
          <figure
            key={image.id}
            className="group relative h-full min-h-0 min-w-0 overflow-hidden rounded-[12px] border border-white/[0.14] bg-black/[0.24] shadow-[0_16px_40px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl sm:rounded-[16px] lg:rounded-[18px]"
          >
            <button
              type="button"
              onClick={() => setModalIndex(index)}
              aria-label={
                copy.viewFullImage(formatStoryNumber(index + 1, locale), productTitle)
              }
              className="relative block h-full w-full cursor-zoom-in overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#E1B586]/90"
            >
              <Image
                src={image.url}
                alt={image.alt + " - " + formatStoryNumber(index + 1, locale)}
                fill
                sizes={
                  "(max-width: 639px) " +
                  Math.max(16, Math.floor(100 / columnCount)) +
                  "vw, " +
                  Math.max(14, Math.floor(100 / columnCount)) +
                  "vw"
                }
                loading={index === 0 ? "eager" : "lazy"}
                className="object-cover transition-transform duration-700 group-hover:scale-[1.025] motion-reduce:transition-none"
                style={{
                  objectFit: imageFit(image.objectFit),
                  objectPosition: image.objectPosition ?? "center",
                }}
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(180deg,transparent_62%,rgba(0,0,0,0.44)_100%)] opacity-45 transition-opacity duration-300 group-hover:opacity-80"
              />
              <span className="absolute bottom-2 start-2 grid size-7 place-items-center rounded-full border border-white/[0.18] bg-black/[0.34] text-white/[0.76] opacity-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.09)] backdrop-blur-xl transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 sm:bottom-3 sm:start-3 sm:size-8">
                <Maximize2 className="size-3.5" aria-hidden="true" />
              </span>
            </button>
            <figcaption className="sr-only">{image.alt}</figcaption>
          </figure>
        ))}
      </div>

      {modalImage && typeof document !== "undefined"
        ? createPortal(
            <ProductImageModal
              images={images}
              activeIndex={safeModalIndex ?? 0}
              productTitle={productTitle}
              locale={locale}
              copy={copy}
              onChange={setModalIndex}
              onClose={() => setModalIndex(null)}
            />,
            document.body,
          )
        : null}
    </>
  );
}

type ProductImageModalProps = {
  images: ProductRevealImage[];
  activeIndex: number;
  productTitle: string;
  onChange: (index: number) => void;
  onClose: () => void;
  locale: Locale;
  copy: (typeof imageStoryCopy)[Locale]["reveal"];
};

function ProductImageModal({
  images,
  activeIndex,
  productTitle,
  onChange,
  onClose,
  locale,
  copy,
}: ProductImageModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const activeIndexRef = useRef(activeIndex);
  const imagesLengthRef = useRef(images.length);
  const onChangeRef = useRef(onChange);
  const onCloseRef = useRef(onClose);
  const touchStartXRef = useRef<number | null>(null);
  const [loadedImageUrl, setLoadedImageUrl] = useState<string | null>(null);
  const activeImage = images[activeIndex] ?? images[0];
  const hasMultiple = images.length > 1;
  const thumbColumnCount = Math.max(images.length, 1);
  const imageLoaded = loadedImageUrl === activeImage?.url;

  useEffect(() => {
    activeIndexRef.current = activeIndex;
    imagesLengthRef.current = images.length;
    onChangeRef.current = onChange;
    onCloseRef.current = onClose;
  }, [activeIndex, images.length, onChange, onClose]);

  function previousImage() {
    if (!hasMultiple) return;
    onChange((activeIndex - 1 + images.length) % images.length);
  }

  function nextImage() {
    if (!hasMultiple) return;
    onChange((activeIndex + 1) % images.length);
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const startX = touchStartXRef.current;
    touchStartXRef.current = null;
    if (startX === null || !hasMultiple) return;

    const deltaX = (event.changedTouches[0]?.clientX ?? startX) - startX;
    if (Math.abs(deltaX) < 48) return;
    if (deltaX > 0) previousImage();
    else nextImage();
  }

  useEffect(() => {
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key === "ArrowLeft" && imagesLengthRef.current > 1) {
        event.preventDefault();
        onChangeRef.current(
          (activeIndexRef.current + 1) % imagesLengthRef.current,
        );
        return;
      }

      if (event.key === "ArrowRight" && imagesLengthRef.current > 1) {
        event.preventDefault();
        onChangeRef.current(
          (activeIndexRef.current - 1 + imagesLengthRef.current) %
            imagesLengthRef.current,
        );
        return;
      }

      if (event.key !== "Tab") return;
      const modal = modalRef.current;
      if (!modal) return;

      const focusable = Array.from(
        modal.querySelectorAll<HTMLElement>(
          'button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("aria-hidden"));

      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      previousFocusRef.current?.focus();
    };
  }, []);

  if (!activeImage) return null;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-image-modal-title"
      aria-describedby="product-image-modal-description"
      dir={getLocaleDirection(locale)}
      lang={getHtmlLang(locale)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[2147483640] grid h-[100dvh] w-[100dvw] place-items-center overflow-hidden bg-black/[0.84] p-2.5 pb-[max(10px,env(safe-area-inset-bottom))] pt-[max(10px,env(safe-area-inset-top))] backdrop-blur-[28px] touch-pan-y sm:p-5"
    >
      <div className="relative grid h-full w-full max-w-[1480px] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-[24px] border border-[#B7835A]/55 bg-[#090807]/[0.90] shadow-[0_46px_180px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-[36px] backdrop-saturate-[145%] sm:h-[min(94dvh,940px)] sm:rounded-[30px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(183,131,90,0.09),transparent_26%),linear-gradient(145deg,rgba(255,255,255,0.055)_0%,transparent_38%)]"
        />

        <header className="relative z-30 grid min-h-[72px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-white/[0.08] px-3 py-3 sm:min-h-[82px] sm:px-6">
          <a
            href={activeImage.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#B7835A]/55 bg-black/[0.26] px-3 text-[8.5px] text-white/[0.74] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl transition-[border-color,background-color,color] hover:border-[#D8AD84]/80 hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4BD97]/75 sm:min-h-11 sm:px-4 sm:text-[9.5px]"
          >
            <ExternalLink className="size-3.5" aria-hidden="true" />
            <span className="hidden min-[390px]:inline">
              {copy.originalImage}
            </span>
          </a>

          <div className="min-w-0 text-center">
            <p
              id="product-image-modal-title"
              className="truncate text-[12px] font-semibold text-white/[0.94] sm:text-[15px]"
            >
              {productTitle}
            </p>
            <p
              id="product-image-modal-description"
              className="mt-1 text-[8.5px] text-white/[0.48] sm:text-[9.5px]"
            >
              {formatStoryNumber(activeIndex + 1, locale)} /{" "}
              {formatStoryNumber(images.length, locale)}
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={copy.closeImageModal}
            title={copy.close}
            className="grid size-10 cursor-pointer place-items-center rounded-full border border-[#B7835A]/70 bg-black/[0.30] text-white shadow-[0_8px_28px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-[border-color,background-color,transform] hover:border-[#E0B487] hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5BE97]/80 active:scale-[0.96] sm:size-11"
          >
            <X className="size-4.5" aria-hidden="true" />
          </button>
        </header>

        <div className="relative z-10 min-h-0 p-2.5 sm:p-4">
          <div className="relative mx-auto flex h-full min-h-0 w-full max-w-[1280px] items-center justify-center overflow-hidden rounded-[20px] border border-white/[0.08] bg-black/[0.16] sm:rounded-[26px]">
            {!imageLoaded ? (
              <div className="absolute inset-0 z-20 grid place-items-center">
                <span className="relative grid size-14 place-items-center rounded-full border border-[#B7835A]/55 bg-black/[0.34] text-[#E3B98F] shadow-[0_12px_40px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
                  <Sparkles className="size-5" aria-hidden="true" />
                  <Loader2
                    className="absolute size-8 animate-spin text-white/55"
                    aria-hidden="true"
                  />
                </span>
              </div>
            ) : null}

            <div className="relative h-full w-full max-w-[820px]">
              <Image
                key={activeImage.id}
                src={activeImage.url}
                alt={activeImage.alt}
                fill
                priority
                sizes="(max-width: 639px) 100vw, 820px"
                onLoad={() => setLoadedImageUrl(activeImage.url)}
                className="select-none object-contain"
                style={{ objectPosition: "center" }}
              />
            </div>

            {hasMultiple ? (
              <>
                <button
                  type="button"
                  onClick={previousImage}
                  aria-label={copy.previousImage}
                  className="absolute start-2.5 top-1/2 z-30 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-[#B7835A]/65 bg-black/[0.42] text-white shadow-[0_8px_26px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl transition-[border-color,background-color,transform] hover:border-[#E0B487] hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5BE97]/80 active:scale-[0.96] sm:start-6 sm:size-12"
                >
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  aria-label={copy.nextImage}
                  className="absolute end-2.5 top-1/2 z-30 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-[#B7835A]/65 bg-black/[0.42] text-white shadow-[0_8px_26px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl transition-[border-color,background-color,transform] hover:border-[#E0B487] hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5BE97]/80 active:scale-[0.96] sm:end-6 sm:size-12"
                >
                  <ChevronRight className="size-5" aria-hidden="true" />
                </button>
              </>
            ) : null}
          </div>
        </div>

        <footer className="relative z-20 border-t border-white/[0.09] bg-black/[0.12] px-3 py-2.5 backdrop-blur-xl sm:px-6 sm:py-3">
          <div
            className="mx-auto grid w-full max-w-[430px] min-w-0 gap-2"
            style={{
              gridTemplateColumns: `repeat(${thumbColumnCount}, minmax(0, 1fr))`,
            }}
          >
            {images.map((image, index) => {
              const active = index === activeIndex;

              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => onChange(index)}
                  aria-label={
                    copy.showImage(formatStoryNumber(index + 1, locale))
                  }
                  aria-current={active ? "true" : undefined}
                  className={
                    "relative min-w-0 cursor-pointer overflow-hidden rounded-[9px] border bg-black/[0.22] transition-[border-color,opacity,transform,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E7C39F]/75 " +
                    (active
                      ? "border-[#E0B487] opacity-100 shadow-[0_0_0_1px_rgba(224,180,135,0.28),0_0_24px_rgba(183,131,90,0.13)]"
                      : "border-white/[0.10] opacity-[0.52] hover:border-white/[0.30] hover:opacity-[0.9]")
                  }
                >
                  <span className="relative block aspect-[4/5] w-full">
                    <Image
                      src={image.url}
                      alt=""
                      fill
                      sizes="86px"
                      className="object-cover"
                      style={{
                        objectPosition: image.objectPosition ?? "center",
                      }}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </footer>
      </div>
    </div>
  );
}
