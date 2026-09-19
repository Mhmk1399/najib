"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
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

type ProductDetailPayload = {
  product: CatalogProductRecord;
  category?: CatalogTaxonomyRecord | null;
  subcategory?: CatalogTaxonomyRecord | null;
  images: CatalogImageAsset[];
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
const numberFormatter = new Intl.NumberFormat("fa-IR");

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
    throw new Error(body?.error ?? "دریافت محصول ناموفق بود.");
  }

  return (await response.json()) as T;
}

function fa(value: ImageStoryLocalizedText | null | undefined, fallback = "") {
  return (
    value?.fa?.trim() || value?.en?.trim() || value?.ar?.trim() || fallback
  );
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

function formatMoney(minor: number | undefined, currency: string | undefined) {
  if (typeof minor !== "number") return "";

  try {
    return new Intl.NumberFormat("fa-IR", {
      style: "currency",
      currency: currency || "IRR",
      maximumFractionDigits: 0,
    }).format(minor / 100);
  } catch {
    return `${numberFormatter.format(minor / 100)} ${currency ?? ""}`.trim();
  }
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

  const anchor = source.matches("section")
    ? source
    : (Element.prototype.closest.call(source, "section") ?? source);
  const adjacentMount = anchor.nextElementSibling;

  if (
    adjacentMount instanceof HTMLElement &&
    adjacentMount.dataset.contextualProductReveal === "true"
  ) {
    return adjacentMount;
  }

  const mount = document.createElement("div");
  mount.dataset.contextualProductReveal = "true";
  anchor.insertAdjacentElement("afterend", mount);

  return mount;
}

function productImages(
  payload: ProductDetailPayload | undefined,
  fallbackImage: ImageStoryProductRevealImage | null | undefined,
): ProductRevealImage[] {
  if (!payload) {
    return fallbackImage?.url
      ? [
          {
            id: fallbackImage.id ?? "preview",
            url: fallbackImage.url,
            alt: fa(fallbackImage.alt, "پیش‌نمایش محصول"),
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
        alt: fa(image.alt, fa(payload.product.name, payload.product.slug)),
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
        alt: fa(
          fallbackImage.alt,
          fa(payload.product.name, payload.product.slug),
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
      alt: fa(payload.product.name, payload.product.slug),
      objectFit: "cover",
      objectPosition: "center",
    },
  ];
}

function imageLayout(index: number, count: number) {
  if (count === 1) return "col-span-2 aspect-[4/3] sm:col-span-4";
  if (index === 0) {
    return "col-span-2 aspect-[4/3] sm:row-span-2 sm:aspect-auto sm:min-h-[420px]";
  }

  return "aspect-[4/5] min-h-[180px] sm:min-h-[205px]";
}

function scrollToReveal(element: HTMLElement) {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const lenis = (window as LenisWindow).__lenis;

  if (lenis && !reduceMotion) {
    lenis.scrollTo(element, { offset: -88, duration: 0.82 });
    return;
  }

  element.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
}

export function ContextualProductReveal() {
  const pathname = usePathname();
  const sectionRef = useRef<HTMLElement>(null);
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
  const activeMount = activeReveal?.mount;
  const activeProductSlug = activeReveal?.request.product.slug;
  const slug = activeReveal?.request.product.slug ?? "";
  const productQuery = useQuery({
    queryKey: ["storefront", "product-detail", slug],
    queryFn: ({ signal }) =>
      fetchJson<ProductDetailPayload>(`/api/storefront/products/${slug}`, {
        signal,
      }),
    enabled: Boolean(slug),
    ...productQueryOptions,
  });

  useEffect(() => {
    if (!activeMount || !activeProductSlug) return;

    const frame = window.requestAnimationFrame(() => {
      if (sectionRef.current) scrollToReveal(sectionRef.current);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeMount, activeProductSlug]);

  const images = useMemo(
    () => productImages(productQuery.data, activeReveal?.request.product.image),
    [activeReveal?.request.product.image, productQuery.data],
  );

  function closeReveal() {
    const current = revealRef.current;
    revealRef.current = null;
    setReveal(null);
    window.requestAnimationFrame(() => current?.mount.remove());
  }

  if (!activeReveal) return null;

  const product = productQuery.data?.product;
  const requestedProduct = activeReveal.request.product;
  const title = product
    ? fa(product.name, product.slug)
    : fa(
        requestedProduct.label,
        fa(requestedProduct.name, requestedProduct.slug),
      );
  const description = product ? fa(product.description) : "";
  const category =
    productQuery.data?.subcategory ?? productQuery.data?.category;
  const price = product
    ? formatMoney(product.basePriceMinor, product.currency)
    : "";
  const isLoading = productQuery.isLoading && !productQuery.data;
  const detailsHref = requestedProduct.href || `/shop/${requestedProduct.slug}`;

  const revealPanel = (
    <section
      ref={sectionRef}
      dir="rtl"
      lang="fa"
      aria-labelledby="contextual-product-reveal-title"
      className="relative isolate scroll-mt-24 overflow-hidden bg-[#0A0908] px-3 py-7 text-white sm:scroll-mt-28 sm:px-5 sm:py-10 lg:px-8 lg:py-14"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-30 bg-[linear-gradient(180deg,#11100E_0%,#080706_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-44 -z-20 size-[520px] rounded-full bg-[#B7835A]/[0.12] blur-[110px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-52 -left-20 -z-20 size-[560px] rounded-full bg-white/[0.055] blur-[140px]"
      />

      <div className="relative mx-auto w-full max-w-[1500px] overflow-hidden rounded-[30px] border border-white/[0.16] bg-[#11100F]/[0.56] shadow-[0_34px_120px_rgba(0,0,0,0.42),0_8px_28px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-[32px] backdrop-saturate-[160%] sm:rounded-[34px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(150deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.038)_22%,transparent_48%,rgba(183,131,90,0.045)_100%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),rgba(183,131,90,0.94),rgba(255,255,255,0.35),transparent)]"
        />

        <div className="relative z-10 px-4 py-7 sm:px-7 sm:py-9 lg:px-10 lg:py-11">
          <header className="mx-auto flex max-w-[920px] flex-col items-center text-center">
            <div className="flex items-center justify-center gap-3 text-[9px] font-medium text-[#C69A73] sm:text-[10px]">
              <span className="h-px w-7 bg-[#B7835A]/80" aria-hidden="true" />
              {
                "\u0627\u0646\u062a\u062e\u0627\u0628 \u0627\u0632 \u0647\u0645\u06cc\u0646 \u062a\u0635\u0648\u06cc\u0631"
              }
              <span className="h-px w-7 bg-[#B7835A]/80" aria-hidden="true" />
            </div>

            <h2
              id="contextual-product-reveal-title"
              className="mt-4 max-w-[780px] text-balance text-[clamp(2rem,8vw,3.6rem)] font-semibold leading-[1.12] tracking-[-0.035em] text-white sm:mt-5 lg:text-[clamp(2.8rem,4.1vw,4.4rem)]"
            >
              {title}
            </h2>

            {category ? (
              <p className="mt-2 text-[10px] leading-5 text-white/44 sm:text-[11px]">
                {fa(category.name, category.slug)}
              </p>
            ) : null}

            {description ? (
              <p className="mt-4 max-w-[660px] text-pretty text-[11px] leading-7 text-white/56 sm:text-[12px] sm:leading-7">
                {description}
              </p>
            ) : (
              <p className="mt-4 max-w-[560px] text-[11px] leading-7 text-white/48 sm:text-[12px]">
                {
                  "\u062a\u0635\u0627\u0648\u06cc\u0631 \u0648 \u062c\u0632\u0626\u06cc\u0627\u062a \u0627\u06cc\u0646 \u0627\u0646\u062a\u062e\u0627\u0628 \u0631\u0627 \u062f\u0631 \u0627\u062f\u0627\u0645\u0647 \u0628\u0628\u06cc\u0646\u06cc\u062f."
                }
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {price ? (
                <span className="inline-flex min-h-10 items-center rounded-full border border-white/[0.14] bg-white/[0.055] px-4 text-[10px] text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
                  {price}
                </span>
              ) : null}

              <Link
                href={detailsHref}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#B7835A]/65 bg-[#B7835A]/[0.14] px-4 text-[10px] font-semibold text-[#E5C6A7] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl transition-[border-color,background-color,color,transform] duration-200 hover:-translate-y-0.5 hover:border-[#D5B08D]/80 hover:bg-[#B7835A]/[0.22] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D2B08D]/75 active:translate-y-0"
              >
                {
                  "\u0635\u0641\u062d\u0647 \u062c\u0632\u0626\u06cc\u0627\u062a \u0645\u062d\u0635\u0648\u0644"
                }
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </Link>

              <button
                type="button"
                className="grid size-10 cursor-pointer place-items-center rounded-full border border-white/[0.14] bg-white/[0.045] text-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-[border-color,background-color,color] duration-200 hover:border-white/32 hover:bg-white/[0.09] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D2B08D]/75"
                aria-label={
                  "\u0628\u0633\u062a\u0646 \u067e\u06cc\u0634\u200c\u0646\u0645\u0627\u06cc\u0634 \u0645\u062d\u0635\u0648\u0644"
                }
                title={
                  "\u0628\u0633\u062a\u0646 \u067e\u06cc\u0634\u200c\u0646\u0645\u0627\u06cc\u0634"
                }
                onClick={closeReveal}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="mx-auto mt-7 h-px max-w-[1020px] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.11),transparent)] sm:mt-9" />

          <ProductGallery
            images={images}
            isLoading={isLoading}
            isError={productQuery.isError}
            detailsHref={detailsHref}
            productTitle={title}
          />

          <div className="mx-auto mt-7 flex max-w-[1240px] flex-col items-center justify-between gap-3 border-t border-white/[0.09] pt-5 text-[9.5px] text-white/42 sm:mt-9 sm:flex-row sm:text-[10px]">
            <span>
              {numberFormatter.format(images.length)}{" "}
              {"\u062a\u0635\u0648\u06cc\u0631 \u0645\u062d\u0635\u0648\u0644"}
            </span>
            <Link
              href={detailsHref}
              className="inline-flex items-center gap-1.5 text-[#C99D76] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D2B08D]/75"
            >
              {
                "\u0627\u062f\u0627\u0645\u0647 \u062f\u0631 \u0635\u0641\u062d\u0647 \u0645\u062d\u0635\u0648\u0644"
              }
              <ArrowLeft className="size-3.5" aria-hidden="true" />
            </Link>
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
};

function ProductGallery({
  images,
  isLoading,
  isError,
  detailsHref,
  productTitle,
}: ProductGalleryProps) {
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const modalImage = modalIndex === null ? null : (images[modalIndex] ?? null);

  useEffect(() => {
    if (modalIndex === null) return;
    if (modalIndex < images.length) return;
    setModalIndex(images.length ? images.length - 1 : null);
  }, [images.length, modalIndex]);

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label={
          "\u062f\u0631 \u062d\u0627\u0644 \u062f\u0631\u06cc\u0627\u0641\u062a \u062a\u0635\u0627\u0648\u06cc\u0631 \u0645\u062d\u0635\u0648\u0644"
        }
        className="mx-auto mt-5 flex min-h-[300px] max-w-[1240px] items-center justify-center overflow-hidden rounded-[24px] border border-white/[0.12] bg-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl sm:mt-7 sm:min-h-[420px]"
      >
        <div className="flex flex-col items-center text-center">
          <span className="relative grid size-14 place-items-center rounded-full border border-[#B7835A]/50 bg-[#B7835A]/[0.08] text-[#E2BE99] shadow-[0_12px_40px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)]">
            <Sparkles className="size-5" aria-hidden="true" />
            <Loader2
              className="absolute size-8 animate-spin text-white/72"
              aria-hidden="true"
            />
          </span>
          <span className="mt-4 text-[10px] text-white/48">
            {
              "\u062f\u0631 \u062d\u0627\u0644 \u0622\u0645\u0627\u062f\u0647\u200c\u0633\u0627\u0632\u06cc \u06af\u0627\u0644\u0631\u06cc"
            }
          </span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto mt-7 flex min-h-[210px] max-w-[900px] flex-col items-center justify-center rounded-[24px] border border-white/[0.12] bg-white/[0.03] px-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-2xl">
        <p className="text-[12px] leading-7 text-white/56">
          {
            "\u0646\u0645\u0627\u06cc\u0634 \u06a9\u0627\u0645\u0644 \u062a\u0635\u0627\u0648\u06cc\u0631 \u062f\u0631 \u062d\u0627\u0644 \u062d\u0627\u0636\u0631 \u0645\u0645\u06a9\u0646 \u0646\u06cc\u0633\u062a."
          }
        </p>
        <Link
          href={detailsHref}
          className="mt-4 inline-flex items-center gap-2 text-[10px] font-medium text-[#C99D76] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D2B08D]/75"
        >
          {
            "\u0645\u0634\u0627\u0647\u062f\u0647 \u062f\u0631 \u0635\u0641\u062d\u0647 \u0645\u062d\u0635\u0648\u0644"
          }
          <ArrowLeft className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto mt-5 grid max-w-[1240px] grid-cols-2 gap-2.5 sm:mt-7 sm:grid-cols-4 sm:gap-3">
        {images.map((image, index) => (
          <figure
            key={image.id}
            className={
              "group relative overflow-hidden rounded-[22px] border border-white/[0.12] bg-white/[0.04] shadow-[0_12px_36px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl " +
              imageLayout(index, images.length)
            }
          >
            <button
              type="button"
              onClick={() => setModalIndex(index)}
              aria-label={
                "\u0645\u0634\u0627\u0647\u062f\u0647 \u06a9\u0627\u0645\u0644 \u062a\u0635\u0648\u06cc\u0631 " +
                numberFormatter.format(index + 1) +
                " \u0627\u0632 " +
                productTitle
              }
              className="relative block size-full cursor-zoom-in overflow-hidden text-right outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#D2B08D]/90"
            >
              <Image
                src={image.url}
                alt={image.alt + " - " + numberFormatter.format(index + 1)}
                fill
                sizes={
                  index === 0
                    ? "(max-width: 639px) calc(100vw - 48px), (max-width: 1023px) 66vw, 50vw"
                    : "(max-width: 639px) calc((100vw - 54px) / 2), (max-width: 1023px) 25vw, 18vw"
                }
                loading={index === 0 ? "eager" : "lazy"}
                className="object-cover transition-transform duration-700 group-hover:scale-[1.035] motion-reduce:transition-none"
                style={{
                  objectFit: imageFit(image.objectFit),
                  objectPosition: image.objectPosition ?? "center",
                }}
              />

              <span
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(180deg,transparent_54%,rgba(0,0,0,0.50)_100%)] opacity-60 transition-opacity duration-300 group-hover:opacity-90"
              />
              <span className="absolute bottom-3 left-3 inline-flex min-h-8 items-center gap-1.5 rounded-full border border-white/[0.18] bg-black/[0.28] px-2.5 text-[8px] text-white/78 opacity-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-xl transition-[opacity,transform] duration-300 group-hover:opacity-100 group-focus-within:opacity-100 sm:text-[9px]">
                <Maximize2 className="size-3" aria-hidden="true" />
                {
                  "\u0645\u0634\u0627\u0647\u062f\u0647 \u06a9\u0627\u0645\u0644"
                }
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
              activeIndex={modalIndex ?? 0}
              productTitle={productTitle}
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
};

function ProductImageModal({
  images,
  activeIndex,
  productTitle,
  onChange,
  onClose,
}: ProductImageModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const activeIndexRef = useRef(activeIndex);
  const imagesLengthRef = useRef(images.length);
  const onChangeRef = useRef(onChange);
  const onCloseRef = useRef(onClose);
  const [imageLoaded, setImageLoaded] = useState(false);
  const activeImage = images[activeIndex] ?? images[0];
  const hasMultiple = images.length > 1;

  activeIndexRef.current = activeIndex;
  imagesLengthRef.current = images.length;
  onChangeRef.current = onChange;
  onCloseRef.current = onClose;

  function previousImage() {
    if (!hasMultiple) return;
    onChange((activeIndex - 1 + images.length) % images.length);
  }

  function nextImage() {
    if (!hasMultiple) return;
    onChange((activeIndex + 1) % images.length);
  }

  useEffect(() => {
    setImageLoaded(false);
  }, [activeIndex, activeImage?.url]);

  useEffect(() => {
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

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
      document.body.style.overflow = previousOverflow;
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
      dir="rtl"
      lang="fa"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[1001000000000000000000000] flex items-center justify-center bg-black/[0.82] px-2.5 pb-[max(10px,env(safe-area-inset-bottom))] pt-[max(10px,env(safe-area-inset-top))] backdrop-blur-[26px] sm:px-5 sm:py-5"
    >
      <div className="relative flex h-[calc(100dvh-20px)] w-full max-w-[1380px] flex-col overflow-hidden rounded-[28px] border border-white/[0.15] bg-[#0B0B0B]/[0.64] shadow-[0_42px_160px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-[38px] backdrop-saturate-[150%] sm:h-[min(92dvh,920px)] sm:rounded-[34px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.105)_0%,rgba(255,255,255,0.025)_27%,transparent_54%,rgba(255,255,255,0.015)_100%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-12 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.28),rgba(183,131,90,0.62),rgba(255,255,255,0.28),transparent)]"
        />

        <header className="relative z-20 flex min-h-[68px] items-center justify-center border-b border-white/[0.09] px-16 sm:min-h-[74px] sm:px-28">
          <div className="min-w-0 text-center">
            <p
              id="product-image-modal-title"
              className="truncate text-[11px] font-semibold text-white/90 sm:text-[12px]"
            >
              {productTitle}
            </p>
            <p
              id="product-image-modal-description"
              className="mt-0.5 text-[8.5px] text-white/42 sm:text-[9px]"
            >
              تصویر {numberFormatter.format(activeIndex + 1)} از{" "}
              {numberFormatter.format(images.length)}
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="بستن نمایش تصویر"
            title="بستن"
            className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/[0.18] bg-black/[0.30] text-black/99 shadow-[0_8px_28px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-xl transition-[border-color,background-color,color,transform] hover:border-white/42 hover:bg-white/[0.10] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/75 active:scale-[0.96] sm:right-5"
          >
            <X className="size-4 text-white"  aria-hidden="true" />
          </button>

          <a
            href={activeImage.url}
            target="_blank"
            rel="noreferrer"
            className="absolute left-3 top-1/2 hidden min-h-10 -translate-y-1/2 items-center gap-2 rounded-full border border-white/[0.14] bg-black/[0.24] px-3.5 text-[9px] text-white/64 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl transition-[border-color,background-color,color] hover:border-white/34 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:left-5 sm:inline-flex"
          >
            باز کردن تصویر اصلی
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </header>

        <div className="relative z-10 min-h-0 flex-1 p-2.5 sm:p-4">
          <div className="relative size-full overflow-hidden rounded-[22px] border border-white/[0.09] bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.045),rgba(0,0,0,0.18)_44%,rgba(0,0,0,0.36)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] sm:rounded-[26px]">
            {!imageLoaded ? (
              <div className="absolute inset-0 z-10 grid place-items-center">
                <span className="relative grid size-14 place-items-center rounded-full border border-white/[0.16] bg-black/[0.30] text-white/80 shadow-[0_12px_40px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.09)] backdrop-blur-xl">
                  <Sparkles className="size-5" aria-hidden="true" />
                  <Loader2
                    className="absolute size-8 animate-spin text-white/58"
                    aria-hidden="true"
                  />
                </span>
              </div>
            ) : null}

            <Image
              key={activeImage.id}
              src={activeImage.url}
              alt={activeImage.alt}
              fill
              priority
              sizes="100vw"
              onLoad={() => setImageLoaded(true)}
              className="select-none object-contain"
              style={{ objectPosition: "center" }}
            />

            {hasMultiple ? (
              <>
                <button
                  type="button"
                  onClick={previousImage}
                  aria-label="تصویر قبلی"
                  className="absolute right-3 top-1/2 z-20 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/[0.16]  text-white shadow-[0_8px_28px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-[border-color,background-color,color,transform] hover:border-white/40 hover:bg-white/[0.09] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 active:scale-[0.96] sm:right-5"
                >
                  <ChevronRight className="size-5 text-white" aria-hidden="true"  />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  aria-label="تصویر بعدی"
                  className="absolute left-3 top-1/2 z-20 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/[0.16]  text-white shadow-[0_8px_28px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-[border-color,background-color,color,transform] hover:border-white/40 hover:bg-white/[0.09] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 active:scale-[0.96] sm:left-5"
                >
                  <ChevronLeft className="size-5 text-white" aria-hidden="true" />
                </button>
              </>
            ) : null}
          </div>
        </div>

        <footer className="relative z-20 flex min-h-[74px] items-center justify-between gap-3 border-t border-white/[0.09] bg-black/[0.12] px-3 py-2 backdrop-blur-xl sm:px-5">
          <div className="min-w-0 flex-1 overflow-x-auto">
            <div className="flex w-max items-center gap-2">
              {images.map((image, index) => {
                const active = index === activeIndex;

                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => onChange(index)}
                    aria-label={`نمایش تصویر ${numberFormatter.format(index + 1)}`}
                    aria-current={active ? "true" : undefined}
                    className={
                      "relative h-12 w-10 shrink-0 cursor-pointer overflow-hidden rounded-[9px] border bg-black/[0.22] transition-[border-color,opacity,transform,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 " +
                      (active
                        ? "border-white/60 opacity-100 shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
                        : "border-white/[0.10] opacity-[0.48] hover:border-white/30 hover:opacity-[0.88]")
                    }
                  >
                    <Image
                      src={image.url}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                      style={{
                        objectPosition: image.objectPosition ?? "center",
                      }}
                    />
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-2 bottom-0 h-px bg-[#B7835A]/80"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <a
            href={activeImage.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border border-white/[0.15] bg-white/[0.045] px-3 text-[8.5px] font-medium text-white/66 shadow-[inset_0_1px_0_rgba(255,255,255,0.065)] transition-[border-color,background-color,color] hover:border-white/34 hover:bg-white/[0.09] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:hidden"
          >
            تصویر اصلی
            <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        </footer>
      </div>
    </div>
  );
}
