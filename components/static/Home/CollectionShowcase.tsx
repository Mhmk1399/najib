"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useRef,
  useEffect,
} from "react";
import { useQuery } from "@tanstack/react-query";

import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/Button";
import {
  getHtmlLang,
  getLocaleDirection,
  type Locale,
} from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/routes";

type CollectionImage = {
  id: string;
  url: string;
  alt?: string;
  objectFit?: string;
  objectPosition?: string;
};

type CollectionProduct = {
  id: string;
  slug: string;
  name: string;
  href: string;
  priceMinor?: number;
  currency?: string;
  image?: CollectionImage | null;
  imagePosition?: string;
};

type StorefrontCollection = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  heroObjectFit?: string;
  heroObjectPosition?: string;
  heroImage?: CollectionImage | null;
  products: CollectionProduct[];
};

type CollectionsPayload = { items: StorefrontCollection[] };

type CollectionShowcaseProps = {
  locale: Locale;
  className?: string;
};

const fallbackImage = "/assets/images/banner.webp";

const copy = {
  fa: {
    eyebrow: "روایت‌های منتخب",
    title: "مجموعه‌هایی برای ماندن",
    description:
      "هر مجموعه، انتخابی دقیق از قطعاتی است که کنار هم معنا پیدا می‌کنند.",
    productLabel: "محصولات مجموعه",
    productAction: "مشاهده محصول",
    scrollHint: "برای دیدن بیشتر بکشید",
    fetchError: "دریافت مجموعه‌ها ناموفق بود.",
  },
  en: {
    eyebrow: "Curated stories",
    title: "Collections with a point of view",
    description:
      "Considered pieces, brought together to create a complete visual language.",
    productLabel: "Collection pieces",
    productAction: "View product",
    scrollHint: "Scroll to explore more",
    fetchError: "Collections could not be loaded.",
  },
  ar: {
    eyebrow: "قصص مختارة",
    title: "مجموعات لها حضورها",
    description: "قطع مختارة بعناية، تجتمع لتصنع لغة بصرية متكاملة.",
    productLabel: "قطع المجموعة",
    productAction: "عرض المنتج",
    scrollHint: "اسحب لرؤية المزيد",
    fetchError: "تعذر تحميل المجموعات.",
  },
} as const;

async function fetchCollections(locale: Locale, signal: AbortSignal) {
  const response = await fetch(`/api/storefront/collections?locale=${locale}`, {
    signal,
    headers: { Accept: "application/json" },
  });

  if (!response.ok) throw new Error(copy[locale].fetchError);
  return (await response.json()) as CollectionsPayload;
}

function formatMoney(
  value: number | undefined,
  currency: string | undefined,
  locale: Locale,
) {
  if (typeof value !== "number") return null;

  try {
    return new Intl.NumberFormat(getHtmlLang(locale), {
      style: "currency",
      currency: currency || "IRR",
      maximumFractionDigits: 0,
    }).format(value / 100);
  } catch {
    return new Intl.NumberFormat(getHtmlLang(locale)).format(value / 100);
  }
}

function imageObjectFit(value?: string): CSSProperties["objectFit"] {
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

export function CollectionShowcase({
  locale,
  className = "",
}: CollectionShowcaseProps) {
  const direction = getLocaleDirection(locale);
  const content = copy[locale];
  const query = useQuery({
    queryKey: ["storefront", "home-collections", locale],
    queryFn: ({ signal }) => fetchCollections(locale, signal),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  });

  const collections = query.data?.items ?? [];
  const singleCollection = collections.length === 1;

  if (query.isSuccess && collections.length === 0) return null;
  if (query.isError) return null;

  return (
    <section
      dir={direction}
      lang={getHtmlLang(locale)}
      aria-labelledby="home-collections-title"
      className={`relative w-full overflow-hidden bg-[#F3F0E9] text-[#171513] ${className}`}
    >
      {/* Ambient editorial background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,rgba(173,99,60,0.075),transparent_27%),radial-gradient(circle_at_92%_18%,rgba(255,255,255,0.78),transparent_30%),linear-gradient(180deg,#F6F3ED_0%,#EFEBE3_100%)]"
      />

      <header className="relative mx-auto flex max-w-[840px] flex-col items-center px-5 pb-9 pt-14 text-center sm:px-7 sm:pb-11 sm:pt-16 lg:pb-13 lg:pt-20">
        <div className="inline-flex items-center gap-2.5 border border-[#AD633C]/15 bg-white/45 px-3.5 py-1.5 text-[7.5px] font-semibold uppercase tracking-[0.22em] text-[#A45D38] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-sm">
          <span aria-hidden="true" className="h-px w-5 bg-[#AD633C]/65" />
          <span>{content.eyebrow}</span>
          <span aria-hidden="true" className="h-px w-5 bg-[#AD633C]/65" />
        </div>

        <h2
          id="home-collections-title"
          className="mt-4 max-w-[760px] text-balance text-[clamp(2.2rem,7vw,4.8rem)] font-normal leading-[0.94] tracking-[-0.055em] text-[#171513]"
        >
          {content.title}
        </h2>

        <p className="mt-5 max-w-[520px] text-[10.5px] leading-[1.9] text-[#686159] sm:text-[11.5px]">
          {content.description}
        </p>
      </header>

      <div
        className={[
          "relative mx-auto grid w-full max-w-[1580px] gap-3 px-3 pb-4 sm:px-4 lg:gap-4 lg:px-4 lg:pb-5",
          singleCollection ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2",
        ].join(" ")}
      >
        {query.isLoading
          ? ["one", "two"].map((item) => (
              <div
                key={item}
                aria-hidden="true"
                className="overflow-hidden border border-black/[0.06] bg-[#E6E0D7] shadow-[0_26px_80px_-58px_rgba(40,30,22,0.45)]"
              >
                <div className="aspect-[1.5/1] animate-pulse bg-[#D9D2C8] motion-reduce:animate-none" />
                <div className="h-[172px] animate-pulse bg-[#EAE5DD] motion-reduce:animate-none" />
              </div>
            ))
          : collections.map((collection, index) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                locale={locale}
                content={content}
                single={singleCollection}
                priority={index === 0}
                index={index}
              />
            ))}
      </div>
    </section>
  );
}

function CollectionCard({
  collection,
  locale,
  content,
  single,
  priority,
  index,
}: {
  collection: StorefrontCollection;
  locale: Locale;
  content: (typeof copy)[Locale];
  single: boolean;
  priority: boolean;
  index: number;
}) {
  const isRtl = getLocaleDirection(locale) === "rtl";
  const hero = collection.heroImage;
  const products = collection.products;
  const hasHorizontalRail = products.length > 3;
  const ActionIcon = isRtl ? ArrowLeftIcon : ArrowRightIcon;
  const numberFormatter = new Intl.NumberFormat(getHtmlLang(locale));

  return (
    <article className="group/collection relative isolate overflow-hidden border border-black/[0.065] bg-[#E8E3DA] shadow-[0_28px_90px_-62px_rgba(35,27,20,0.5)] transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-black/[0.10] hover:shadow-[0_34px_100px_-58px_rgba(35,27,20,0.58)] motion-reduce:transition-none ">
      {/* Hero */}
      <div
        data-image-story-id={hero?.id}
        data-image-story-url={hero?.url}
        className={[
          "relative overflow-hidden bg-[#CBC3B8]",
          single
            ? "aspect-[1.32/1] sm:aspect-[1.72/1] lg:aspect-[2.35/1]"
            : "aspect-[1.3/1] sm:aspect-[1.48/1]",
        ].join(" ")}
      >
        <Image
          src={hero?.url || fallbackImage}
          alt={hero?.alt || collection.name}
          fill
          priority={priority}
          sizes={
            single
              ? "(max-width: 1023px) 100vw, 1680px"
              : "(max-width: 1023px) 100vw, 50vw"
          }
          className="transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/collection:scale-[1.035] motion-reduce:transform-none"
          style={{
            objectFit: imageObjectFit(
              collection.heroObjectFit || hero?.objectFit,
            ),
            objectPosition:
              collection.heroObjectPosition || hero?.objectPosition || "center",
          }}
          draggable={false}
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_5%,transparent_30%,rgba(7,6,5,0.17)_55%,rgba(7,6,5,0.82)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.17),transparent_28%),radial-gradient(circle_at_82%_100%,rgba(173,99,60,0.16),transparent_34%)]"
        />

        <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2.5 sm:inset-x-5 sm:top-5">
          <span className="inline-flex min-h-7 items-center border border-white/20 bg-black/18 px-2.5 text-[7.5px] font-medium tracking-[0.08em] text-white/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md">
            {String(index + 1).padStart(2, "0")}
          </span>

          <span className="inline-flex min-h-7 items-center gap-1.5 border border-white/20 bg-black/18 px-2.5 text-[7.5px] font-medium text-white/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md">
            <span className="size-1.5 bg-[#D69A70]" />
            {numberFormatter.format(products.length)} {content.productLabel}
          </span>
        </div>

        <div
          className={[
            "absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 text-white sm:inset-x-6 sm:bottom-6",
            single ? "lg:inset-x-8 lg:bottom-7" : "",
          ].join(" ")}
        >
          <div className="min-w-0 max-w-[700px]">
            <p className="flex items-center gap-2 text-[7.5px] font-semibold uppercase tracking-[0.18em] text-white/62">
              <span aria-hidden="true" className="h-px w-5 bg-white/45" />
              {content.eyebrow}
            </p>

            <h3
              className={[
                "mt-2 text-balance font-normal leading-[0.96] tracking-[-0.045em]",
                single
                  ? "text-[clamp(2rem,6.4vw,4.4rem)]"
                  : "text-[clamp(1.8rem,4.6vw,3.3rem)]",
              ].join(" ")}
            >
              {collection.name}
            </h3>

            {collection.description ? (
              <p
                className={[
                  "mt-2.5 line-clamp-2 text-[9.5px] leading-5 text-white/70 sm:text-[10.5px] sm:leading-5",
                  single ? "max-w-[590px]" : "max-w-[430px]",
                ].join(" ")}
              >
                {collection.description}
              </p>
            ) : null}
          </div>

          <span className="grid size-10 shrink-0 place-items-center border border-white/28 bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_24px_rgba(0,0,0,0.14)] backdrop-blur-md transition-[transform,background-color,border-color] duration-300 group-hover/collection:-translate-x-0.5 group-hover/collection:border-white/55 group-hover/collection:bg-white/16 motion-reduce:transition-none sm:size-11">
            <ActionIcon aria-hidden="true" />
          </span>
        </div>
      </div>

      {/* Product section */}
      {products.length ? (
        <div className="relative bg-[#E8E3DA]">
          <div className="flex min-h-11 items-center justify-between gap-3 border-t border-black/[0.065] px-3.5 sm:px-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="size-1.5 shrink-0 bg-[#AD633C]" />
              <span className="truncate text-[8.5px] font-semibold text-[#28231F] sm:text-[9px]">
                {content.productLabel}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              {hasHorizontalRail ? (
                <span className="hidden text-[7px] font-medium text-[#8A8178] sm:inline">
                  {content.scrollHint}
                </span>
              ) : null}

              <span className="inline-flex min-w-7 items-center justify-center border border-black/[0.07] bg-white/40 px-2 py-1 text-[7.5px] font-semibold tabular-nums text-[#6E655C]">
                {numberFormatter.format(products.length)}
              </span>
            </div>
          </div>

          <div className="relative border-t border-black/[0.055] bg-[#D7D0C7]">
            {hasHorizontalRail ? (
              <>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 z-20 w-7 bg-gradient-to-r from-[#E8E3DA] via-[#E8E3DA]/72 to-transparent sm:w-10"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-0 z-20 w-7 bg-gradient-to-l from-[#E8E3DA] via-[#E8E3DA]/72 to-transparent sm:w-10"
                />
              </>
            ) : null}

            <DraggableProductRail enabled={hasHorizontalRail} isRtl={isRtl}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  locale={locale}
                  content={content}
                  isRtl={isRtl}
                  scrollable={hasHorizontalRail}
                  singleCollection={single}
                />
              ))}
            </DraggableProductRail>
          </div>
        </div>
      ) : null}
    </article>
  );
}

type RtlScrollType = "default" | "negative" | "reverse";

let cachedRtlScrollType: RtlScrollType | null = null;

function getRtlScrollType(): RtlScrollType {
  if (cachedRtlScrollType) return cachedRtlScrollType;
  if (typeof document === "undefined") return "negative";

  const outer = document.createElement("div");
  const inner = document.createElement("div");

  outer.dir = "rtl";
  outer.style.width = "4px";
  outer.style.height = "1px";
  outer.style.position = "absolute";
  outer.style.top = "-1000px";
  outer.style.overflow = "scroll";
  outer.style.visibility = "hidden";

  inner.style.width = "8px";
  inner.style.height = "1px";
  outer.appendChild(inner);
  document.body.appendChild(outer);

  if (outer.scrollLeft > 0) {
    cachedRtlScrollType = "default";
  } else {
    outer.scrollLeft = 1;
    cachedRtlScrollType = outer.scrollLeft === 0 ? "negative" : "reverse";
  }

  outer.remove();
  return cachedRtlScrollType;
}

function getNormalizedScrollLeft(element: HTMLElement, isRtl: boolean) {
  if (!isRtl) return element.scrollLeft;

  const max = Math.max(0, element.scrollWidth - element.clientWidth);
  const value = element.scrollLeft;

  switch (getRtlScrollType()) {
    case "negative":
      return max + value;
    case "reverse":
      return max - value;
    default:
      return value;
  }
}

function setNormalizedScrollLeft(
  element: HTMLElement,
  value: number,
  isRtl: boolean,
) {
  const max = Math.max(0, element.scrollWidth - element.clientWidth);
  const next = Math.max(0, Math.min(max, value));

  if (!isRtl) {
    element.scrollLeft = next;
    return;
  }

  switch (getRtlScrollType()) {
    case "negative":
      element.scrollLeft = next - max;
      break;
    case "reverse":
      element.scrollLeft = max - next;
      break;
    default:
      element.scrollLeft = next;
  }
}

type DragState = {
  active: boolean;
  pointerId: number;
  startX: number;
  startScroll: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  distance: number;
};

function DraggableProductRail({
  enabled,
  isRtl,
  children,
}: {
  enabled: boolean;
  isRtl: boolean;
  children: ReactNode;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState>({
    active: false,
    pointerId: -1,
    startX: 0,
    startScroll: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
    distance: 0,
  });
  const suppressClickRef = useRef(false);
  const suppressClickTimerRef = useRef<number | null>(null);
  const inertiaFrameRef = useRef<number | null>(null);

  const stopInertia = () => {
    if (inertiaFrameRef.current !== null) {
      cancelAnimationFrame(inertiaFrameRef.current);
      inertiaFrameRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopInertia();
      if (suppressClickTimerRef.current !== null) {
        window.clearTimeout(suppressClickTimerRef.current);
      }
    };
  }, []);

  const clearSuppressedClickSoon = () => {
    if (suppressClickTimerRef.current !== null) {
      window.clearTimeout(suppressClickTimerRef.current);
    }

    suppressClickTimerRef.current = window.setTimeout(() => {
      suppressClickRef.current = false;
      suppressClickTimerRef.current = null;
    }, 80);
  };

  const restoreSnap = (element: HTMLDivElement) => {
    requestAnimationFrame(() => {
      element.style.removeProperty("scroll-snap-type");
    });
  };

  const startInertia = (element: HTMLDivElement, initialVelocity: number) => {
    stopInertia();

    let velocity = initialVelocity;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const deltaTime = Math.min(32, Math.max(1, now - lastTime));
      lastTime = now;

      const current = getNormalizedScrollLeft(element, isRtl);
      const next = current + velocity * deltaTime;
      const max = Math.max(0, element.scrollWidth - element.clientWidth);

      setNormalizedScrollLeft(element, next, isRtl);

      const atBoundary = next <= 0 || next >= max;
      velocity *= Math.pow(0.91, deltaTime / 16.67);

      if (Math.abs(velocity) < 0.025 || atBoundary) {
        inertiaFrameRef.current = null;
        restoreSnap(element);
        return;
      }

      inertiaFrameRef.current = requestAnimationFrame(tick);
    };

    if (Math.abs(velocity) < 0.035) {
      restoreSnap(element);
      return;
    }

    inertiaFrameRef.current = requestAnimationFrame(tick);
  };

  const finishDrag = (element: HTMLDivElement, pointerId: number) => {
    const state = dragRef.current;
    if (!state.active || state.pointerId !== pointerId) return;

    const dragged = state.distance > 4;
    const releaseVelocity = state.velocity;

    dragRef.current = {
      active: false,
      pointerId: -1,
      startX: 0,
      startScroll: 0,
      lastX: 0,
      lastTime: 0,
      velocity: 0,
      distance: 0,
    };

    element.removeAttribute("data-dragging");

    if (element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId);
    }

    if (dragged) {
      suppressClickRef.current = true;
      clearSuppressedClickSoon();
      startInertia(element, releaseVelocity);
    } else {
      restoreSnap(element);
    }
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled || event.pointerType !== "mouse" || event.button !== 0) return;

    stopInertia();

    if (suppressClickTimerRef.current !== null) {
      window.clearTimeout(suppressClickTimerRef.current);
      suppressClickTimerRef.current = null;
    }

    suppressClickRef.current = false;

    const now = performance.now();
    const currentScroll = getNormalizedScrollLeft(event.currentTarget, isRtl);

    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScroll: currentScroll,
      lastX: event.clientX,
      lastTime: now,
      velocity: 0,
      distance: 0,
    };

    // Mandatory snap is what makes mouse dragging feel "stuck". Disable it
    // only for the active mouse gesture; it returns after release/inertia.
    event.currentTarget.style.scrollSnapType = "none";
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = dragRef.current;
    if (!enabled || !state.active || state.pointerId !== event.pointerId)
      return;

    const totalDelta = event.clientX - state.startX;
    const stepDelta = event.clientX - state.lastX;
    if (!stepDelta) return;

    const now = performance.now();
    const deltaTime = Math.max(1, now - state.lastTime);
    const directionMultiplier = -1;

    // Normalized scroll coordinates are already physical left-to-right, so RTL must not flip the drag again.
    // Keep a light 1.18x gain so the rail feels responsive without overshooting.
    const dragDistance = totalDelta * 1.18 * directionMultiplier;
    const targetScroll = state.startScroll + dragDistance;

    setNormalizedScrollLeft(event.currentTarget, targetScroll, isRtl);

    const physicalStep = stepDelta * 1.18 * directionMultiplier;
    state.velocity = state.velocity * 0.62 + (physicalStep / deltaTime) * 0.38;
    state.lastX = event.clientX;
    state.lastTime = now;
    state.distance = Math.max(state.distance, Math.abs(totalDelta));

    if (state.distance > 4) {
      event.preventDefault();
      event.currentTarget.dataset.dragging = "true";
      suppressClickRef.current = true;
    }
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    finishDrag(event.currentTarget, event.pointerId);
  };

  const onPointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    finishDrag(event.currentTarget, event.pointerId);
  };

  const onClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;

    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;

    if (suppressClickTimerRef.current !== null) {
      window.clearTimeout(suppressClickTimerRef.current);
      suppressClickTimerRef.current = null;
    }
  };

  return (
    <div
      ref={railRef}
      onPointerDown={enabled ? onPointerDown : undefined}
      onPointerMove={enabled ? onPointerMove : undefined}
      onPointerUp={enabled ? onPointerUp : undefined}
      onPointerCancel={enabled ? onPointerCancel : undefined}
      onClickCapture={enabled ? onClickCapture : undefined}
      onDragStart={enabled ? (event) => event.preventDefault() : undefined}
      className={
        enabled
          ? "flex snap-x snap-proximity gap-px overflow-x-auto overscroll-x-contain bg-[#D7D0C7] px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:cursor-grab data-[dragging=true]:lg:cursor-grabbing data-[dragging=true]:lg:select-none"
          : "contents"
      }
    >
      {children}
    </div>
  );
}

function ProductCard({
  product,
  locale,
  content,
  isRtl,
  scrollable,
  singleCollection,
}: {
  product: CollectionProduct;
  locale: Locale;
  content: (typeof copy)[Locale];
  isRtl: boolean;
  scrollable: boolean;
  singleCollection: boolean;
}) {
  const price = formatMoney(product.priceMinor, product.currency, locale);

  return (
    <Link
      href={localizedHref(product.href, locale)}
      data-image-story-id={product.image?.id}
      data-image-story-url={product.image?.url}
      className={[
        "group/product relative isolate bg-[#E8E3DA] p-2 outline-none transition-[background-color,transform] duration-300 hover:bg-[#F4F1EB] focus-visible:z-20 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#AD633C] motion-reduce:transition-none sm:p-2.5",
        scrollable
          ? singleCollection
            ? "w-[68vw] max-w-[310px] shrink-0 snap-start sm:w-[39vw] sm:max-w-[335px] lg:w-[29%] lg:max-w-none"
            : "w-[68vw] max-w-[285px] shrink-0 snap-start sm:w-[41vw] sm:max-w-[300px] lg:w-[30%] lg:max-w-none"
          : "min-w-0",
      ].join(" ")}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#D4CDC3] ">
        <Image
          src={product.image?.url || fallbackImage}
          alt={product.image?.alt || product.name}
          fill
          sizes={
            scrollable
              ? "(max-width: 639px) 68vw, (max-width: 1023px) 41vw, 15vw"
              : "(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 16vw"
          }
          className="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/product:scale-[1.045] motion-reduce:transform-none"
          style={{
            objectFit: imageObjectFit(product.image?.objectFit),
            objectPosition:
              product.imagePosition ||
              product.image?.objectPosition ||
              "center",
          }}
          draggable={false}
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(10,8,7,0.13)_100%)] opacity-0 transition-opacity duration-500 group-hover/product:opacity-100"
        />

        <span className="absolute bottom-2 end-2 grid size-7 translate-y-1 place-items-center border border-white/24 bg-black/24 text-white opacity-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md transition-[opacity,transform] duration-300 group-hover/product:translate-y-0 group-hover/product:opacity-100 motion-reduce:transition-none">
          {isRtl ? <ArrowLeftIcon /> : <ArrowRightIcon />}
        </span>
      </div>

      <div className="min-w-0 px-0.5 pb-0.5 pt-2.5">
        <strong className="block truncate text-[9.5px] font-semibold leading-5 text-[#27231F] sm:text-[10.5px]">
          {product.name}
        </strong>

        <div className="mt-1 flex min-w-0 items-end justify-between gap-2">
          <div className="min-w-0">
            {price ? (
              <span className="block truncate text-[8.5px] font-medium text-[#756C63]">
                {price}
              </span>
            ) : (
              <span className="block text-[8.5px] text-[#9A9188]">—</span>
            )}
          </div>

          <span className="inline-flex shrink-0 items-center gap-1 text-[7px] font-semibold text-[#A35E3A] transition-colors group-hover/product:text-[#7F4328] sm:text-[7.5px]">
            {content.productAction}
            {isRtl ? <ArrowLeftIcon /> : <ArrowRightIcon />}
          </span>
        </div>
      </div>
    </Link>
  );
}
