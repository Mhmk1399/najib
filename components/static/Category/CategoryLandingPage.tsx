"use client";

import Image from "next/image";

import Link from "next/link";

import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  CategoryPageData,
  CategorySubcategory,
} from "@/types/category-page";

import {
  catalogPageCopy,
  type CatalogPageCopy,
} from "@/lib/i18n/catalog-page-copy";

import {
  getHtmlLang,
  getLocaleDirection,
  type Locale,
} from "@/lib/i18n/config";

import { localizedHref } from "@/lib/i18n/routes";

import { brandColors, lightTokens } from "@/theme/theme-colors";

import { ArrowRightIcon, Button } from "@/components/ui/Button";

import { estedad } from "@/next-persian-fonts/estedad";

/* ==========================================================================

   TYPES

============================================================================ */

type CategoryLandingPageProps = {
  data: CategoryPageData;

  locale: Locale;
};

const CATEGORY_THEME_VARS = {
  "--category-white": brandColors.white.hex,

  "--category-black": "#0B0B0B",

  "--category-black-rgb": "11 11 11",

  "--category-cream": lightTokens.surfaceBrand,

  "--category-muted": lightTokens.textMuted,

  "--category-border": lightTokens.border,

  "--category-copper": brandColors.copper.hex,
} as CSSProperties;

function DirectionalArrowIcon({ locale }: { locale: Locale }) {
  const direction = getLocaleDirection(locale);

  return (
    <span
      aria-hidden="true"
      className={`inline-grid size-4 shrink-0 place-items-center ${
        direction === "rtl" ? "[&>svg]:rotate-180" : ""
      }`}
    >
      <ArrowRightIcon />
    </span>
  );
}

function textOverlayGradientAngle(locale: Locale) {
  return getLocaleDirection(locale) === "rtl" ? "270deg" : "90deg";
}

/* ==========================================================================

   PAGE

============================================================================ */

export function CategoryLandingPage({
  data,

  locale,
}: CategoryLandingPageProps) {
  const direction = getLocaleDirection(locale);

  const copy = catalogPageCopy[locale];

  return (
    <main
      dir={direction}
      lang={getHtmlLang(locale)}
      style={CATEGORY_THEME_VARS}
      className="

        w-full

        overflow-hidden



        bg-white

        text-start

        text-[var(--category-black)]

      "
    >
      {/* ===============================================================

          HERO

      ================================================================ */}

      <CategoryHero data={data} locale={locale} />

      {/* ===============================================================

          INTRO

      ================================================================ */}

      <CategoryIntro data={data} />

      {/* ===============================================================

          SUBCATEGORIES

      ================================================================ */}

      <CategoryCollections data={data} locale={locale} copy={copy} />

      {/* ===============================================================

          FEATURE

      ================================================================ */}

      <CategoryFeature data={data} locale={locale} />

      {/* ===============================================================

          FINAL CTA

      ================================================================ */}

      <CategoryFinalCTA data={data} locale={locale} />
    </main>
  );
}

/* ==========================================================================

   HERO

============================================================================ */

function CategoryHero({
  data,

  locale,
}: {
  data: CategoryPageData;

  locale: Locale;
}) {
  const { ref, revealed } = useRevealOnce<HTMLElement>();

  const hero = data.hero;

  return (
    <section
      ref={ref}
      aria-labelledby="category-hero-title"
      data-image-story-id={hero.imageAssetId}
      data-image-story-url={hero.image}
      style={
        {
          "--hero-mobile-position": hero.mobileImagePosition ?? "center",

          "--hero-desktop-position": hero.desktopImagePosition ?? "center",

          "--category-text-gradient-angle": textOverlayGradientAngle(locale),
        } as CSSProperties
      }
      className="

        relative

        isolate&#x20;



        min-h-[100svh]



        w-full

        overflow-hidden



        bg-[#0B0B0B]

        text-white

      "
    >
      {/* =====================================================

          BACKGROUND IMAGE

      ====================================================== */}

      <Image
        src={hero.image}
        alt={hero.imageAlt ?? data.name}
        fill
        priority
        sizes="100vw"
        draggable={false}
        className="

          -z-30



          object-cover



          object-[var(--hero-mobile-position)]



          md:object-[var(--hero-desktop-position)]

        "
      />

      {/* =====================================================

          DESKTOP RTL GRADIENT

      ====================================================== */}

      <div
        aria-hidden="true"
        className="

          pointer-events-none



          absolute

          inset-0

          -z-20



          bg-[linear-gradient(var(--category-text-gradient-angle),rgb(var(--category-black-rgb)/0.92)_0%,rgb(var(--category-black-rgb)/0.64)_32%,rgb(var(--category-black-rgb)/0.12)_70%,rgb(var(--category-black-rgb)/0.10)_100%)]



          max-md:bg-[linear-gradient(180deg,rgb(var(--category-black-rgb)/0.06)_0%,rgb(var(--category-black-rgb)/0.12)_38%,rgb(var(--category-black-rgb)/0.88)_100%)]

        "
      />

      {/* =====================================================

          VIGNETTE

      ====================================================== */}

      <div
        aria-hidden="true"
        className="

          pointer-events-none



          absolute

          inset-0

          -z-10



          bg-[radial-gradient(circle_at_center,transparent_40%,rgb(var(--category-black-rgb)/0.32)_120%)]

        "
      />

      {/* =====================================================

          CONTENT

      ====================================================== */}

      <div
        className="

          relative

          z-10



          flex



          min-h-[100svh]



          items-end -mt-20 lg:mt-0



          px-6



          pb-28

          pt-28



          sm:px-8



          md:items-center

          md:px-[7vw]

          md:pb-0



          text-start

        "
      >
        <div
          className={`

            rtl:ml-auto

            ltr:mr-auto

            w-full

            max-w-[680px]



            text-start



            transition-[opacity,transform]

            duration-[900ms]



            ease-[cubic-bezier(0.22,1,0.36,1)]



            motion-reduce:transform-none

            motion-reduce:transition-none



            ${
              revealed
                ? `

                  translate-y-0

                  opacity-100

                `
                : `

                  translate-y-10

                  opacity-0

                `
            }

          `}
        >
          {/* =================================================

              EYEBROW

          ================================================= */}

          {/* {hero.eyebrow && (

            <div

              className="

                mb-5



                flex

                items-center

                gap-3



                text-[9px]

                font-semibold



                uppercase

                tracking-[0.23em]



                text-[var(--category-copper)]



                sm:text-[11px]

              "

            >

              <span>{hero.eyebrow}</span>



              <span

                className="

                  h-px

                  w-6



                  bg-[var(--category-copper)]

                "

              />

            </div>

          )} */}

          {/* =================================================

              TITLE

          ================================================= */}

          <h1
            id="category-hero-title"
            className="

              whitespace-pre-line







              text-2xl

              font-bold



              leading-[0.9]

              tracking-[-0.06em]



              text-white



              md:text-5xl

            "
          >
            {hero.title}
          </h1>

          {/* =================================================

              DESCRIPTION

          ================================================= */}

          <p
            className={`

              mt-3 lg:mt-7



              max-w-[460px] ${estedad.className}



              text-[11px]



              leading-[1.85]



              text-white/62



              sm:text-[14px]

            `}
          >
            {hero.description}
          </p>

          {/* =================================================

              DESKTOP CTA

          ================================================= */}

          <div
            className="

              mt-8



              hidden



              w-full

              max-w-[250px]



              md:block

            "
          >
            <Button
              href={localizedHref(hero.action.href, locale)}
              variant="cream"
              size="lg"
              icon={<DirectionalArrowIcon locale={locale} />}
              fullWidth
            >
              {hero.action.label}
            </Button>
          </div>
        </div>
      </div>

      {/* =====================================================

          MOBILE FIXED BOTTOM CTA

      ====================================================== */}

      <div
        className="

          absolute



          inset-x-4



          bottom-[max(118px,env(safe-area-inset-bottom))]



          z-20



          md:hidden

        "
      >
        <Button
          href={localizedHref(hero.action.href, locale)}
          variant="cream"
          size="lg"
          fullWidth
          icon={<DirectionalArrowIcon locale={locale} />}
          target="_blank"
          aria-label={hero.action.label}
        >
          {hero.action.label}
        </Button>
      </div>
    </section>
  );
}

/* ==========================================================================

   INTRO

============================================================================ */

function CategoryIntro({ data }: { data: CategoryPageData }) {
  const intro = data.intro;

  return (
    <section
      aria-label={intro.title || data.name}
      className="

        w-full



        bg-white

      "
    >
      <div
        className="

          mx-auto



          flex



          max-w-[1000px]



          w-full

          flex-col

          items-start



          px-6



          py-16



          text-start



          sm:px-8

          sm:py-20



          lg:py-24

        "
      >
        {intro.eyebrow && (
          <div
            className="

              mb-5



              flex

              items-center

              gap-3



              text-[12px]

              font-semibold



              uppercase

              tracking-[0.23em]



              text-[var(--category-copper)]

            "
          >
            <span
              className="

                h-px

                w-5



                bg-[var(--category-copper)]

              "
            />

            <span>{intro.eyebrow}</span>

            <span
              className="

                h-px

                w-5



                bg-[var(--category-copper)]

              "
            />
          </div>
        )}

        {intro.title && (
          <h2
            className="

              max-w-[720px]







              text-[clamp(2.5rem,9vw,4.4rem)]



              leading-[0.98]

              tracking-[-0.05em]



              text-black

            "
          >
            {intro.title}
          </h2>
        )}

        <p
          className={`

            max-w-[760px]



            text-[11px] ${estedad.className}



            leading-[1.9]



            text-[var(--category-muted)]



            sm:text-[12px]



            ${intro.title ? "mt-6" : ""}

          `}
        >
          {intro.description}
        </p>
      </div>
    </section>
  );
}

/* ==========================================================================

   HORIZONTAL SUBCATEGORY RAIL

============================================================================ */

type RtlScrollType = "default" | "negative" | "reverse";

type RailDragState = {
  active: boolean;
  pointerId: number;
  startX: number;
  startScroll: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  distance: number;
};

let cachedRtlScrollType: RtlScrollType | null = null;

function getRtlScrollType(): RtlScrollType {
  if (cachedRtlScrollType) return cachedRtlScrollType;

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

  document.body.removeChild(outer);
  return cachedRtlScrollType;
}

function getNormalizedScrollLeft(element: HTMLElement, isRtl: boolean) {
  if (!isRtl) return element.scrollLeft;

  const max = Math.max(0, element.scrollWidth - element.clientWidth);

  switch (getRtlScrollType()) {
    case "negative":
      return max + element.scrollLeft;
    case "reverse":
      return max - element.scrollLeft;
    default:
      return element.scrollLeft;
  }
}

function setNormalizedScrollLeft(
  element: HTMLElement,
  value: number,
  isRtl: boolean,
) {
  const max = Math.max(0, element.scrollWidth - element.clientWidth);
  const next = Math.max(0, Math.min(value, max));

  if (!isRtl) {
    element.scrollLeft = next;
    return next;
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
      break;
  }

  return next;
}

function useHorizontalCategoryRail({
  enabled,
  isRtl,
}: {
  enabled: boolean;
  isRtl: boolean;
}) {
  const railRef = useRef<HTMLUListElement>(null);
  const inertiaFrameRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
  const suppressClickTimerRef = useRef<number | null>(null);
  const previousSnapTypeRef = useRef<string>("");
  const [dragging, setDragging] = useState(false);

  const dragRef = useRef<RailDragState>({
    active: false,
    pointerId: -1,
    startX: 0,
    startScroll: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
    distance: 0,
  });

  const stopInertia = () => {
    if (inertiaFrameRef.current !== null) {
      cancelAnimationFrame(inertiaFrameRef.current);
      inertiaFrameRef.current = null;
    }
  };

  const restoreSnap = () => {
    const rail = railRef.current;
    if (!rail) return;
    rail.style.scrollSnapType = previousSnapTypeRef.current;
  };

  const startInertia = (initialVelocity: number) => {
    const rail = railRef.current;
    if (!rail || Math.abs(initialVelocity) < 0.015) {
      restoreSnap();
      return;
    }

    stopInertia();

    let velocity = initialVelocity;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const currentRail = railRef.current;
      if (!currentRail) {
        inertiaFrameRef.current = null;
        return;
      }

      const dt = Math.min(32, Math.max(1, now - lastTime));
      lastTime = now;

      const current = getNormalizedScrollLeft(currentRail, isRtl);
      const max = Math.max(
        0,
        currentRail.scrollWidth - currentRail.clientWidth,
      );
      const requested = current + velocity * dt;
      const next = setNormalizedScrollLeft(currentRail, requested, isRtl);
      const hitEdge = next <= 0 || next >= max;

      velocity *= Math.pow(0.9, dt / 16.67);

      if (hitEdge || Math.abs(velocity) < 0.012) {
        inertiaFrameRef.current = null;
        restoreSnap();
        return;
      }

      inertiaFrameRef.current = requestAnimationFrame(tick);
    };

    inertiaFrameRef.current = requestAnimationFrame(tick);
  };

  const releaseDrag = (event?: ReactPointerEvent<HTMLUListElement>) => {
    const rail = railRef.current;
    const drag = dragRef.current;

    if (!drag.active) return;

    drag.active = false;
    setDragging(false);

    if (rail && event && rail.hasPointerCapture(event.pointerId)) {
      rail.releasePointerCapture(event.pointerId);
    }

    if (drag.distance > 5) {
      suppressClickRef.current = true;

      if (suppressClickTimerRef.current !== null) {
        window.clearTimeout(suppressClickTimerRef.current);
      }

      suppressClickTimerRef.current = window.setTimeout(() => {
        suppressClickRef.current = false;
        suppressClickTimerRef.current = null;
      }, 100);
    }

    startInertia(drag.velocity);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLUListElement>) => {
    if (!enabled || event.pointerType !== "mouse" || event.button !== 0) return;

    const rail = railRef.current;
    if (!rail) return;

    stopInertia();

    previousSnapTypeRef.current = rail.style.scrollSnapType;
    rail.style.scrollSnapType = "none";

    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScroll: getNormalizedScrollLeft(rail, isRtl),
      lastX: event.clientX,
      lastTime: performance.now(),
      velocity: 0,
      distance: 0,
    };

    rail.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLUListElement>) => {
    const rail = railRef.current;
    const drag = dragRef.current;

    if (
      !enabled ||
      !rail ||
      !drag.active ||
      drag.pointerId !== event.pointerId
    ) {
      return;
    }

    event.preventDefault();

    const now = performance.now();
    const totalDelta = event.clientX - drag.startX;
    const stepDelta = event.clientX - drag.lastX;
    const dt = Math.max(1, now - drag.lastTime);

    const nextScroll = drag.startScroll - totalDelta * 1.04;
    setNormalizedScrollLeft(rail, nextScroll, isRtl);

    const stepVelocity = (-stepDelta * 1.04) / dt;
    drag.velocity = drag.velocity * 0.68 + stepVelocity * 0.32;
    drag.distance = Math.max(drag.distance, Math.abs(totalDelta));
    drag.lastX = event.clientX;
    drag.lastTime = now;
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLUListElement>) => {
    releaseDrag(event);
  };

  const onPointerCancel = (event: ReactPointerEvent<HTMLUListElement>) => {
    releaseDrag(event);
  };

  const onClickCapture = (event: ReactMouseEvent<HTMLUListElement>) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
  };

  useEffect(() => {
    if (enabled) return;

    if (inertiaFrameRef.current !== null) {
      cancelAnimationFrame(inertiaFrameRef.current);
      inertiaFrameRef.current = null;
    }

    dragRef.current.active = false;
    setDragging(false);

    const rail = railRef.current;
    if (rail) {
      rail.style.scrollSnapType = previousSnapTypeRef.current;
    }
  }, [enabled]);

  useEffect(() => {
    return () => {
      if (inertiaFrameRef.current !== null) {
        cancelAnimationFrame(inertiaFrameRef.current);
      }

      if (suppressClickTimerRef.current !== null) {
        window.clearTimeout(suppressClickTimerRef.current);
      }
    };
  }, []);

  return {
    railRef,
    dragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onClickCapture,
  };
}

/* ==========================================================================

   COLLECTIONS

============================================================================ */

function CategoryCollections({
  data,
  locale,
  copy,
}: {
  data: CategoryPageData;
  locale: Locale;
  copy: CatalogPageCopy;
}) {
  const direction = getLocaleDirection(locale);
  const hasHorizontalRail = data.subcategories.length > 3;
  const rail = useHorizontalCategoryRail({
    enabled: hasHorizontalRail,
    isRtl: direction === "rtl",
  });

  return (
    <section
      aria-labelledby="category-subcategories-heading"
      className="w-full bg-white pb-16 sm:pb-20 lg:pb-28"
    >
      <h2 id="category-subcategories-heading" className="sr-only">
        {data.name}
      </h2>

      <div className="relative mx-auto w-full max-w-[1600px]">
        <ul
          ref={rail.railRef}
          data-dragging={rail.dragging ? "true" : "false"}
          onPointerDown={rail.onPointerDown}
          onPointerMove={rail.onPointerMove}
          onPointerUp={rail.onPointerUp}
          onPointerCancel={rail.onPointerCancel}
          onClickCapture={rail.onClickCapture}
          onDragStart={(event) => event.preventDefault()}
          className={
            hasHorizontalRail
              ? [
                  "m-0 flex list-none flex-nowrap gap-1 overflow-x-auto overscroll-x-contain py-0",
                  "px-4 scroll-px-4 sm:px-8 sm:scroll-px-8 lg:px-12 lg:scroll-px-12",
                  "snap-x snap-proximity",
                  "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                  "lg:cursor-grab data-[dragging=true]:lg:cursor-grabbing",
                  "data-[dragging=true]:select-none",
                ].join(" ")
              : [
                  "m-0 grid list-none grid-cols-1 gap-1 px-4 py-0",
                  "sm:grid-cols-2 sm:px-8",
                  "lg:grid-cols-3 lg:px-12",
                ].join(" ")
          }
        >
          {data.subcategories.map((category) => (
            <li
              key={category.id}
              className={
                hasHorizontalRail
                  ? "min-w-0 shrink-0 basis-[82%] snap-start sm:basis-[48%] lg:basis-[calc((100%-8px)/3)]"
                  : "min-w-0"
              }
            >
              <CategoryCard
                category={category}
                locale={locale}
                inHorizontalRail={hasHorizontalRail}
              />
            </li>
          ))}
        </ul>

        {hasHorizontalRail ? (
          <>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-5 bg-gradient-to-r from-white via-white/72 to-transparent sm:w-8 lg:w-10"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-5 bg-gradient-to-l from-white via-white/72 to-transparent sm:w-8 lg:w-10"
            />
          </>
        ) : null}
      </div>

      <div className="px-6 pt-6 sm:hidden">
        <Button
          href={localizedHref(`/shop?category=${data.slug}`, locale)}
          variant="black"
          size="lg"
          icon={<DirectionalArrowIcon locale={locale} />}
          fullWidth
        >
          {copy.viewAllNamed(data.name)}
        </Button>
      </div>
    </section>
  );
}

/* ==========================================================================

   CATEGORY CARD

============================================================================ */

function CategoryCard({
  category,

  locale,

  inHorizontalRail = false,
}: {
  category: CategorySubcategory;

  locale: Locale;

  inHorizontalRail?: boolean;
}) {
  const direction = getLocaleDirection(locale);

  return (
    <Link
      href={localizedHref(category.href, locale)}
      data-image-story-id={category.imageAssetId}
      data-image-story-url={category.image}
      className="

        group

        block

        relative

        isolate



        aspect-[4/5]

        w-full



        overflow-hidden



        bg-transparent



        focus-visible:outline-none

        focus-visible:ring-2

        focus-visible:ring-inset

        focus-visible:ring-[var(--category-copper)]

      "
    >
      <Image
        src={category.image}
        alt={category.imageAlt ?? category.title}
        fill
        loading="lazy"
        sizes={
          inHorizontalRail
            ? "(max-width: 639px) 82vw, (max-width: 1023px) 48vw, min(31vw, 500px)"
            : "(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc(50vw - 40px), min(31vw, 500px)"
        }
        draggable={false}
        style={{
          objectPosition: category.imagePosition ?? "center",
        }}
        className="

          -z-30



          object-cover



          transition-transform

          duration-[900ms]



          ease-[cubic-bezier(0.22,1,0.36,1)]



          group-hover:scale-[1.025]



          motion-reduce:transform-none

          motion-reduce:transition-none

        "
      />

      {/* gradient */}

      <div
        aria-hidden="true"
        className="

          pointer-events-none



          absolute

          inset-0

          -z-20



          bg-[linear-gradient(180deg,transparent_42%,rgb(var(--category-black-rgb)/0.08)_58%,rgb(var(--category-black-rgb)/0.78)_100%)]



          transition-opacity

          duration-500



          group-hover:opacity-95



          motion-reduce:transition-none

        "
      />

      {/* bottom */}

      <div
        className="

          absolute



          inset-x-0

          bottom-0



          flex

          items-end

          justify-between



          gap-6



          p-5



          sm:p-6



          lg:p-7

        "
      >
        <div className="min-w-0">
          <h3
            className="

              text-2xl



              md:text-4xl



              lg:text-[clamp(1.7rem,2.15vw,2.5rem)]



              leading-[1.05]



              text-white



              drop-shadow-[0_3px_18px_rgb(var(--category-black-rgb)/0.38)]

            "
          >
            {category.title}
          </h3>
        </div>

        <span
          className="

            grid

            size-11



            shrink-0

            place-items-center



            border

            border-white/45



            bg-black/10



            text-white



            backdrop-blur-[4px]



            transition-[background-color,color,border-color,transform]



            duration-300



            rtl:group-hover:-translate-x-1

            ltr:group-hover:translate-x-1



            group-hover:border-white

            group-hover:bg-white

            group-hover:text-black

          "
        >
          <span aria-hidden="true">{direction === "rtl" ? "←" : "→"}</span>
        </span>
      </div>
    </Link>
  );
}

/* ==========================================================================

   FEATURE

============================================================================ */

function CategoryFeature({
  data,

  locale,
}: {
  data: CategoryPageData;

  locale: Locale;
}) {
  const feature = data.feature;

  return (
    <section
      aria-labelledby="category-feature-title"
      data-image-story-id={feature.imageAssetId}
      data-image-story-url={feature.image}
      style={
        {
          "--feature-mobile-position": feature.mobileImagePosition ?? "center",

          "--feature-desktop-position":
            feature.desktopImagePosition ?? "center",

          "--category-text-gradient-angle": textOverlayGradientAngle(locale),
        } as CSSProperties
      }
      className="

        relative

        isolate



        min-h-[88svh]



        overflow-hidden



        bg-[#0B0B0B]

        text-white



        md:min-h-[100svh]

      "
    >
      <Image
        src={feature.image}
        alt={feature.imageAlt ?? feature.title}
        fill
        loading="lazy"
        sizes="100vw"
        draggable={false}
        className="

          -z-30



          object-cover



          object-[var(--feature-mobile-position)]



          md:object-[var(--feature-desktop-position)]

        "
      />

      <div
        aria-hidden="true"
        className="

          absolute

          inset-0

          -z-20



          bg-[linear-gradient(var(--category-text-gradient-angle),rgb(var(--category-black-rgb)/0.94)_0%,rgb(var(--category-black-rgb)/0.70)_40%,rgb(var(--category-black-rgb)/0.12)_75%)]



          max-md:bg-[linear-gradient(180deg,rgb(var(--category-black-rgb)/0.05)_0%,rgb(var(--category-black-rgb)/0.20)_40%,rgb(var(--category-black-rgb)/0.90)_100%)]

        "
      />

      <div
        className="

          relative

          z-10



          flex



          min-h-[88svh]



          items-end



          px-6

          py-16



          sm:px-8



          md:min-h-[100svh]



          md:items-center

          md:px-[7vw]



          text-start

        "
      >
        <div
          className="

            rtl:ml-auto

            ltr:mr-auto

            max-w-[620px]

            text-start

          "
        >
          {feature.eyebrow && (
            <div
              className="

                mb-5



                flex

                items-center

                gap-3



                text-[7px]

                font-semibold



                uppercase

                tracking-[0.22em]



                text-[var(--category-copper)]

              "
            >
              <span>{feature.eyebrow}</span>

              <span
                className="

                  h-px

                  w-6



                  bg-[var(--category-copper)]

                "
              />
            </div>
          )}

          <h2
            id="category-feature-title"
            className="

              flex

              flex-col







              text-[clamp(3.3rem,12vw,5rem)]



              leading-[0.93]

              tracking-[-0.055em]



              text-white



              md:text-[clamp(4.5rem,5.8vw,6.6rem)]

            "
          >
            <span>{feature.title}</span>

            {feature.italicTitle && (
              <span
                className="

                  mt-[0.1em]



                  italic



                  text-white/75

                "
              >
                {feature.italicTitle}
              </span>
            )}
          </h2>

          <p
            className={`

              mt-7



              max-w-[440px] ${estedad.className}



              text-[10px]



              leading-[1.85]



              text-white/58



              sm:text-[11px]

            `}
          >
            {feature.description}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================

   FINAL CTA

============================================================================ */

function CategoryFinalCTA({
  data,

  locale,
}: {
  data: CategoryPageData;

  locale: Locale;
}) {
  const cta = data.finalCTA;

  return (
    <section
      aria-labelledby="category-final-cta-title"
      className="

        bg-[var(--category-cream)]



        px-5



        py-14



        sm:px-8

        sm:py-20



        lg:px-12

        lg:py-24

      "
    >
      <div
        data-image-story-id={cta.imageAssetId}
        data-image-story-url={cta.image}
        className="

          mx-auto



          grid

          max-w-[1600px]



          overflow-hidden



          bg-white



          lg:grid-cols-[0.85fr_1.15fr]

        "
      >
        {/* =====================================================

            CONTENT

        ====================================================== */}

        <div
          className="

            flex



            flex-col



            justify-center



            text-start



            px-7

            py-10



            sm:px-10

            sm:py-14



            lg:px-14

          "
        >
          {cta.eyebrow && (
            <div
              className="

                mb-5



                flex

                items-center

                gap-3



                text-[7px]

                font-semibold



                uppercase

                tracking-[0.22em]



                text-[var(--category-copper)]

              "
            >
              {cta.eyebrow}

              <span
                className="

                  h-px

                  w-6



                  bg-[var(--category-copper)]

                "
              />
            </div>
          )}

          <h2
            id="category-final-cta-title"
            className="

              max-w-[540px]







              text-[clamp(2.8rem,9vw,4.8rem)]



              leading-[0.96]

              tracking-[-0.055em]



              text-black

            "
          >
            {cta.title}
          </h2>

          <p
            className={`

              mt-5



              max-w-[430px] ${estedad.className}



              text-[10px]



              leading-[1.8]



              text-[var(--category-muted)]



              sm:text-[11px]

            `}
          >
            {cta.description}
          </p>

          <div
            className="

              mt-8



              w-full

              max-w-[250px]

            "
          >
            <Button
              href={localizedHref(cta.action.href, locale)}
              variant="black"
              size="lg"
              icon={<DirectionalArrowIcon locale={locale} />}
              fullWidth
            >
              {cta.action.label}
            </Button>
          </div>
        </div>

        {/* =====================================================

            IMAGE

        ====================================================== */}

        <div
          className="

            relative



            min-h-[420px]



            sm:min-h-[520px]



            lg:min-h-[620px]

          "
        >
          <Image
            src={cta.image}
            alt={cta.imageAlt ?? cta.title}
            fill
            loading="lazy"
            sizes="

              (max-width: 1023px) 100vw,

              60vw

            "
            draggable={false}
            style={{
              objectPosition: cta.imagePosition ?? "center",
            }}
            className="

              object-cover

            "
          />
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================

   REVEAL

============================================================================ */

function useRevealOnce<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => {
        setRevealed(true);
      });

      return () => {
        cancelAnimationFrame(frame);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        requestAnimationFrame(() => {
          setRevealed(true);
        });

        observer.disconnect();
      },

      {
        threshold: 0.08,

        rootMargin: "0px 0px -5% 0px",
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return {
    ref,

    revealed,
  };
}
