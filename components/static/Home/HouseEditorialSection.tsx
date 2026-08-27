"use client";

import Image from "next/image";
import Link from "next/link";

import { type CSSProperties, useEffect, useRef, useState } from "react";

import { brandColors, themeClasses } from "@/theme/theme-colors";

import { ArrowRightIcon, Button } from "@/components/ui/Button";

/* ==========================================================================
   TYPES
============================================================================ */

type HouseAction = {
  label: string;
  href: string;
};

type HouseFeature = {
  id: string;

  title: string;

  description: string;

  href: string;

  icon: "tailoring" | "fragrance" | "story";
};

type HouseEditorialSectionProps = {
  imageSrc: string;

  imageAlt?: string;

  eyebrow?: string;

  title?: string;

  description?: string;

  primaryAction?: HouseAction;

  secondaryAction?: HouseAction;

  features?: HouseFeature[];

  mobileImagePosition?: string;

  desktopImagePosition?: string;

  className?: string;
};

/* ==========================================================================
   FAKE DATA
============================================================================ */

const defaultFeatures: HouseFeature[] = [
  {
    id: "tailoring",

    title: "Tailoring",

    description: "Discover suiting and knitwear",

    href: "/tailoring",

    icon: "tailoring",
  },

  {
    id: "fragrance",

    title: "Fragrance",

    description: "Explore signature scents",

    href: "/fragrance",

    icon: "fragrance",
  },

  {
    id: "story",

    title: "Our Story",

    description: "The values behind the house",

    href: "/our-story",

    icon: "story",
  },
];

/* ==========================================================================
   COMPONENT
============================================================================ */

export function HouseEditorialSection({
  imageSrc,

  imageAlt = "",

  eyebrow = "New Season",

  title = "Tailored for the memorable.",

  description = "Timeless tailoring. Distinctive fragrance. Objects made with intention, for a life well-lived.",

  primaryAction = {
    label: "Explore Collection",
    href: "/collections",
  },

  secondaryAction = {
    label: "Discover the House",
    href: "/our-story",
  },

  features = defaultFeatures,

  mobileImagePosition = "60% center",

  desktopImagePosition = "center",

  className = "",
}: HouseEditorialSectionProps) {
  const { ref, revealed } = useRevealOnce<HTMLElement>();

  const themeVars = {
    "--house-black": brandColors.black.hex,

    "--house-black-rgb": brandColors.black.rgb,

    "--house-white": brandColors.white.hex,

    "--house-copper": brandColors.copper.hex,

    "--house-mobile-position": mobileImagePosition,

    "--house-desktop-position": desktopImagePosition,
  } as CSSProperties;

  return (
    <section
      ref={ref}
      style={themeVars}
      className={`
        relative
        isolate

        h-[100svh]
        min-h-[640px]

        w-full
        overflow-hidden

        bg-[var(--house-black)]
        text-[var(--house-white)]

        ${className}
      `}
    >
      {/* =====================================================
          IMAGE
      ====================================================== */}

      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        sizes="100vw"
        loading="lazy"
        draggable={false}
        className="
          -z-30

          object-cover
          object-[var(--house-mobile-position)]

          md:object-[var(--house-desktop-position)]
        "
      />

      {/* =====================================================
          CINEMATIC OVERLAY
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0
          -z-20

          bg-[linear-gradient(180deg,rgb(var(--house-black-rgb)/0.10)_0%,rgb(var(--house-black-rgb)/0.05)_35%,rgb(var(--house-black-rgb)/0.22)_62%,rgb(var(--house-black-rgb)/0.76)_100%)]

          md:bg-[linear-gradient(90deg,rgb(var(--house-black-rgb)/0.70)_0%,rgb(var(--house-black-rgb)/0.42)_38%,rgb(var(--house-black-rgb)/0.05)_72%,rgb(var(--house-black-rgb)/0.18)_100%)]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0
          -z-10

          bg-[radial-gradient(circle_at_center,transparent_38%,rgb(var(--house-black-rgb)/0.24)_120%)]
        "
      />

      {/* Mobile bottom readability */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-x-0
          bottom-0
          -z-10

          h-[52%]

          bg-gradient-to-t
          from-black/75
          via-black/20
          to-transparent

          md:hidden
        "
      />

      {/* =====================================================
          SMALL HOUSE MARK

          White only.
          Copper not used here.
      ====================================================== */}

      <div
        className={`
          absolute

          left-6
          top-8

          z-10

          transition-[opacity,transform]
          duration-700

          ease-[cubic-bezier(0.22,1,0.36,1)]

          sm:left-10
          sm:top-10

          lg:left-[7vw]
          lg:top-[10vh]

          ${
            revealed
              ? `
                translate-y-0
                opacity-100
              `
              : `
                translate-y-4
                opacity-0
              `
          }
        `}
      >
        <p
          className="
            text-[6px]
            font-medium

            uppercase
            tracking-[0.22em]

            text-white/50
          "
        >
          The House of
        </p>

        <p
          className="
            mt-1

            font-serif
            text-[13px]

            uppercase
            tracking-[0.2em]

            text-white
          "
        >
          Najibzadeh
        </p>
      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div
        className="
          relative
          z-10

          flex
          h-full

          items-center

          px-6

          pb-24
          pt-24

          sm:px-10

          md:pb-32

          lg:px-[7vw]
        "
      >
        <div
          className={`
            w-full
            max-w-[590px]

            transition-[opacity,transform]
            duration-[900ms]

            ease-[cubic-bezier(0.22,1,0.36,1)]

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

              تنها نقطه Copper.
          ================================================= */}

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

              text-[var(--house-copper)]

              sm:text-[8px]
            "
          >
            <span>{eyebrow}</span>

            <span
              className="
                h-px
                w-6

                bg-[var(--house-copper)]
              "
            />
          </div>

          {/* =================================================
              TITLE
          ================================================= */}

          <h2
            className="
              max-w-[560px]

              font-serif

              text-[clamp(3rem,13vw,4.7rem)]
              font-normal

              leading-[0.93]
              tracking-[-0.055em]

              text-white

              md:text-[clamp(4.5rem,6vw,6.4rem)]

              lg:max-w-[680px]
            "
          >
            {title}
          </h2>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          {description && (
            <p
              className="
                mt-5

                max-w-[390px]

                text-[9px]
                font-normal

                leading-[1.75]

                text-white/68

                sm:max-w-[430px]
                sm:text-[10px]

                md:mt-6
                md:text-[11px]

                lg:text-xs
              "
            >
              {description}
            </p>
          )}

          {/* =================================================
              DESKTOP ACTIONS

              موبایل جداگانه پایین component است.
          ================================================= */}

          <div
            className="
              mt-7

              hidden
              w-full
              max-w-[470px]

              grid-cols-2
              gap-2

              md:grid
            "
          >
            <Button
              href={secondaryAction.href}
              variant="outline"
              size="lg"
              icon={<ArrowRightIcon />}
              fullWidth
              className="
                border-white/45

                text-white

                hover:border-white
                hover:bg-white
                hover:text-black
              "
            >
              {secondaryAction.label}
            </Button>

            <Button
              href={primaryAction.href}
              size="lg"
              icon={<ArrowRightIcon />}
              fullWidth
            >
              {primaryAction.label}
            </Button>
          </div>
        </div>
      </div>

      {/* =====================================================
          MOBILE ACTIONS

          کنار هم + پایین component.
      ====================================================== */}

      <div
        className={`
          absolute

          inset-x-4

          bottom-[max(25  8px,env(safe-area-inset-bottom))]

          z-30

          grid
          grid-cols-2
          gap-2

          transition-[opacity,transform]
          duration-700

          ease-[cubic-bezier(0.22,1,0.36,1)]

          md:hidden

          ${
            revealed
              ? `
                translate-y-0
                opacity-100

                delay-200
              `
              : `
                translate-y-5
                opacity-0
              `
          }
        `}
      >
        <Button
          href={secondaryAction.href}
          variant="outline"
          size="md"
          icon={<ArrowRightIcon />}
          fullWidth
          className="
            min-w-0

            border-white/45

            bg-black/20

            text-white

            backdrop-blur-md

            hover:border-white
            hover:bg-white
            hover:text-black
          "
        >
          {secondaryAction.label}
        </Button>

        <Button
          href={primaryAction.href}
          size="md"
          icon={<ArrowRightIcon />}
          fullWidth
          className="min-w-0 text-xs text-nowrap"
        >
          {primaryAction.label}
        </Button>
      </div>

      {/* =====================================================
          DESKTOP DISCOVERY RAIL

          No rounded container.
          No copper icons.
      ====================================================== */}

      <div
        className={`
          absolute

          bottom-[72px]
          left-[7vw]

          z-20

          hidden

          w-[min(780px,78vw)]

          border
          border-white/18

          bg-black/25

          backdrop-blur-xl

          transition-[opacity,transform]
          duration-[900ms]

          ease-[cubic-bezier(0.22,1,0.36,1)]

          md:flex

          ${
            revealed
              ? `
                translate-y-0
                opacity-100

                delay-200
              `
              : `
                translate-y-8
                opacity-0
              `
          }
        `}
      >
        {/* Lead */}

        <div
          className="
            flex

            min-w-[230px]

            items-center
            gap-4

            px-5
            py-4
          "
        >
          <span
            className="
              grid
              size-10

              shrink-0
              place-items-center

              border
              border-white/25

              text-white
            "
          >
            <ArrowIcon />
          </span>

          <div>
            <p
              className="
                text-[9px]

                text-white
              "
            >
              What are you drawn to today?
            </p>

            <p
              className="
                mt-1

                text-[7px]
                leading-[1.5]

                text-white/45
              "
            >
              Explore craft and character.
            </p>
          </div>
        </div>

        {/* Features */}

        <div
          className="
            grid
            flex-1

            grid-cols-3
          "
        >
          {features.slice(0, 3).map((feature) => (
            <FeatureItem key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   FEATURE ITEM
============================================================================ */

function FeatureItem({ feature }: { feature: HouseFeature }) {
  return (
    <Link
      href={feature.href}
      className={`
        group

        flex
        items-center
        gap-3

        border-l
        border-white/10

        px-4
        py-4

        transition-colors
        duration-200

        hover:bg-white/[0.06]

        ${themeClasses.focusRing}
      `}
    >
      <FeatureIcon type={feature.icon} />

      <div className="min-w-0">
        <p
          className="
            text-[8px]

            text-white
          "
        >
          {feature.title}
        </p>

        <p
          className="
            mt-1

            max-w-[100px]

            text-[6.5px]
            leading-[1.45]

            text-white/42
          "
        >
          {feature.description}
        </p>
      </div>
    </Link>
  );
}

/* ==========================================================================
   FEATURE ICON
============================================================================ */

function FeatureIcon({ type }: { type: HouseFeature["icon"] }) {
  return (
    <span
      className="
        grid
        size-8

        shrink-0
        place-items-center

        text-white/65

        transition-colors
        duration-200

        group-hover:text-white
      "
    >
      {type === "tailoring" && <TailoringIcon />}

      {type === "fragrance" && <FragranceIcon />}

      {type === "story" && <StoryIcon />}
    </span>
  );
}

/* ==========================================================================
   ICONS
============================================================================ */

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="
        size-4

        transition-transform
        duration-200

        group-hover:translate-x-0.5
      "
    >
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

function TailoringIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="size-6">
      <path
        d="M12 6L9 9L7 14L10 26H22L25 14L23 9L20 6L17 9H15L12 6Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      <path
        d="M15 9L13 15L16 18L19 15L17 9"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      <path d="M16 18V26" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function FragranceIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="size-6">
      <path d="M11 12H21V26H11V12Z" stroke="currentColor" strokeWidth="1" />

      <path d="M13 8H19V12H13V8Z" stroke="currentColor" strokeWidth="1" />

      <path
        d="M14 5H18"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StoryIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="size-6">
      <rect
        x="8"
        y="6"
        width="16"
        height="20"
        stroke="currentColor"
        strokeWidth="1"
      />

      <path
        d="M12 11H20M12 15H20M12 19H17"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
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
        threshold: 0.14,

        rootMargin: "0px 0px -6% 0px",
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
