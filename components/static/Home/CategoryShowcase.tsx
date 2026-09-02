"use client";

import Link from "next/link";

import { type CSSProperties, useEffect, useRef, useState } from "react";

import { brandColors, lightTokens, themeClasses } from "@/theme/theme-colors";

/* ==========================================================================
   TYPES
============================================================================ */

export type CategoryItem = {
  id: string;

  name: string;

  href: string;

  image: string;

  imageAlt?: string;

  /**
   * Examples:
   *
   * "center"
   * "center 30%"
   * "60% center"
   */
  imagePosition?: string;
};

type CategoryShowcaseProps = {
  categories?: CategoryItem[];

  eyebrow?: string;

  title?: string;

  description?: string;

  className?: string;
};

/* ==========================================================================
   FAKE DATA

   فقط 3 کتگوری.
============================================================================ */

export const fakeCategories: CategoryItem[] = [
  {
    id: "tailoring",

    name: "Tailoring",

    href: "/tailoring",

    image: "/assets/images/suit.webp",

    imagePosition: "center",
  },

  {
    id: "fragrance",

    name: "Fragrance",

    href: "/fragrance",

    image: "/assets/images/kafsh.webp",

    imagePosition: "center",
  },

  {
    id: "clothing",

    name: "Clothing",

    href: "/clothing",

    image: "/assets/images/accessory.webp",

    imagePosition: "center",
  },
];

/* ==========================================================================
   COMPONENT
============================================================================ */

export function CategoryShowcase({
  categories = fakeCategories,

  eyebrow = "Explore Collection",

  title = "Explore Najibzadeh",

  description = "A considered world of tailoring, fragrance and objects shaped around modern living.",

  className = "",
}: CategoryShowcaseProps) {
  const { ref, revealed } = useRevealOnce<HTMLElement>();

  /**
   * این component عمداً بیشتر از 3 آیتم
   * render نمی‌کند.
   */
  const visibleCategories = categories.slice(0, 3);

  const themeVars = {
    "--cat-bg": lightTokens.surfaceBrand,

    "--cat-text": brandColors.black.hex,

    "--cat-muted": lightTokens.textMuted,

    "--cat-accent": brandColors.copper.hex,

    "--cat-black-rgb": brandColors.black.rgb,

    "--cat-white": brandColors.white.hex,

    "--cat-white-rgb": "255 255 255",
  } as CSSProperties;

  if (!visibleCategories.length) {
    return null;
  }

  return (
    <section
      ref={ref}
      style={themeVars}
      className={`
        relative
mb-8
        w-full
        overflow-hidden

        bg-[var(--cat-bg)]
        text-[var(--cat-text)]

        ${className}
      `}
    >
      {/* =====================================================
          INTRO
      ====================================================== */}

      <div
        className={`
          mx-auto

          flex
          w-full
          max-w-[760px]

          flex-col
          items-center

          px-6

          py-8 

          text-center

          transition-[opacity,transform]
          duration-700

          ease-[cubic-bezier(0.22,1,0.36,1)]

          sm:px-8
        

          

          ${
            revealed
              ? `
                translate-y-0
                opacity-100
              `
              : `
                translate-y-8
                opacity-0
              `
          }
        `}
      >
        {/* =================================================
            EYEBROW

            تنها استفاده Copper در component.
        ================================================= */}

        {/* <div
          className="
            mb-5

            flex
            items-center
            justify-center

            gap-3

            text-[7px]
            font-semibold

            uppercase
            tracking-[0.23em]

            text-[var(--cat-accent)]

            sm:text-[8px]
          "
        >
          <span
            className="
              h-px
              w-5

              bg-[var(--cat-accent)]
            "
          />

          <span>{eyebrow}</span>

          <span
            className="
              h-px
              w-5

              bg-[var(--cat-accent)]
            "
          />
        </div> */}

        {/* =================================================
            TITLE
        ================================================= */}

        <h2
          className="
            m-0

            max-w-[720px]

            font-serif

            text-[clamp(2.7rem,10vw,4rem)]
            font-normal

            leading-[0.96]
            tracking-[-0.05em]

            text-[var(--cat-text)]

             

            lg:text-[clamp(3.1rem,4.5vw,4.1rem)]
          "
        >
          {title}
        </h2>

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        {/* <p
          className="
            mt-5

            max-w-[500px]

            text-[10px]
            font-normal

            leading-[1.75]

            text-[var(--cat-muted)]

            sm:mt-6
            sm:text-[11px]

            lg:text-xs
          "
        >
          {description}
        </p> */}
      </div>

      {/* =====================================================
          CATEGORIES

          Mobile:
          horizontal native swipe

          Desktop:
          fixed 3-column grid

          NO GAP.
      ====================================================== */}

      <div
        className={`
          transition-[opacity,transform]
          duration-[850ms]

          ease-[cubic-bezier(0.22,1,0.36,1)]

          ${
            revealed
              ? `
                translate-y-0
                opacity-100

                delay-150
              `
              : `
                translate-y-10
                opacity-0
              `
          }
        `}
      >
        <div
          className="
            flex
            w-full

            gap-0

            overflow-x-auto
            overflow-y-hidden

            overscroll-x-contain

            snap-x
            snap-mandatory

            scroll-smooth

            touch-pan-x

            [scrollbar-width:none]

            [&::-webkit-scrollbar]:hidden

            md:grid
            md:grid-cols-3

            md:overflow-visible
            md:snap-none
          "
        >
          {visibleCategories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   CATEGORY CARD
============================================================================ */

function CategoryCard({
  category,
  index,
}: {
  category: CategoryItem;

  index: number;
}) {
  return (
    <Link
      href={category.href}
      draggable={false}
      aria-label={`Explore ${category.name}`}
      className={`
        group
        relative
        isolate

        block

        h-[62svh]
        min-h-[470px]

        /*
         * Mobile:
         * تقریباً یک کارت کامل + تکه‌ای از کارت بعد.
         *
         * gap نداریم.
         */
        basis-[88vw]
        shrink-0

        snap-start
        snap-always

        overflow-hidden

        outline-none

        md:h-[620px]
        md:min-h-0

        md:basis-auto
        md:snap-align-none

        lg:h-[min(70svh,720px)]

        ${themeClasses.focusRing}
      `}
    >
      {/* =====================================================
          IMAGE
      ====================================================== */}

      <img
        src={category.image}
        alt={category.imageAlt ?? category.name}
        draggable={false}
        loading="lazy"
        decoding="async"
        style={{
          objectPosition: category.imagePosition ?? "center",
        }}
        className="
          pointer-events-none

          absolute
          inset-0
          -z-30

          size-full

          select-none
          object-cover

          scale-[1.01]

          transition-transform
          duration-[1000ms]

          ease-[cubic-bezier(0.22,1,0.36,1)]

          group-hover:scale-[1.035]
        "
      />

      {/* =====================================================
          DARK OVERLAY
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0
          -z-20

          bg-[linear-gradient(180deg,rgb(var(--cat-black-rgb)/0.03)_0%,rgb(var(--cat-black-rgb)/0.07)_42%,rgb(var(--cat-black-rgb)/0.64)_100%)]
        "
      />

      {/* subtle vignette */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0
          -z-10

          bg-[radial-gradient(circle_at_center,transparent_35%,rgb(var(--cat-black-rgb)/0.20)_110%)]
        "
      />

      {/* =====================================================
          INDEX
      ====================================================== */}

      <span
        className="
          absolute
          left-5
          top-5

          text-[7px]
          font-medium

          uppercase
          tracking-[0.18em]

          text-white/45

          sm:left-6
          sm:top-6
        "
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* =====================================================
          TITLE
      ====================================================== */}

      <div
        className="
          absolute
          inset-x-0
          bottom-0

          p-6

          sm:p-7

          lg:p-8
        "
      >
        <div
          className="
            flex
            items-end
            justify-between

            gap-5
          "
        >
          <div
            className="
              min-w-0
            "
          >
            <p
              className="
                mb-2

                text-[7px]
                font-medium

                uppercase
                tracking-[0.18em]

                text-white/55
              "
            >
              Collection
            </p>

            <h3
              className="
                font-serif

                text-[clamp(2.8rem,13vw,4.5rem)]
                font-normal

                leading-[0.92]
                tracking-[-0.05em]

                text-white

                transition-transform
                duration-500

                ease-[cubic-bezier(0.22,1,0.36,1)]

                group-hover:-translate-y-1

                sm:text-[clamp(3rem,7vw,4.7rem)]

                md:text-[clamp(2.8rem,4vw,4.5rem)]
              "
            >
              {category.name}
            </h3>
          </div>

          {/* =================================================
              ARROW

              White/Black only.
              No copper.
          ================================================= */}

          <span
            className="
              grid
              size-10

              shrink-0
              place-items-center

              border
              border-white/35

              bg-black/10

              text-white

              backdrop-blur-sm

              transition-[background-color,border-color,color,transform]
              duration-300

              group-hover:translate-x-1

              group-hover:border-white

              group-hover:bg-white
              group-hover:text-black
            "
          >
            <ArrowIcon />
          </span>
        </div>

        {/* =================================================
            WHITE HAIRLINE

            قبلاً copper بود.
        ================================================= */}

        <div
          aria-hidden="true"
          className="
            mt-5

            h-px
            w-full

            origin-left
            scale-x-[0.12]

            bg-white/60

            transition-transform
            duration-500

            ease-[cubic-bezier(0.22,1,0.36,1)]

            group-hover:scale-x-100
          "
        />
      </div>
    </Link>
  );
}

/* ==========================================================================
   REVEAL ONCE
============================================================================ */

function useRevealOnce<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotion.matches) {
      setRevealed(true);

      return;
    }

    if (!("IntersectionObserver" in window)) {
      setRevealed(true);

      return;
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
        threshold: 0.12,

        rootMargin: "0px 0px -8% 0px",
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

/* ==========================================================================
   ICON
============================================================================ */

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4">
      <path
        d="M2.5 8H13M9.5 4.5L13 8L9.5 11.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
