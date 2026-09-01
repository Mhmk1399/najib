"use client";

import Image from "next/image";

import { type CSSProperties, useEffect, useRef, useState } from "react";

import { brandColors } from "@/theme/theme-colors";

import { ArrowRightIcon, Button } from "@/components/ui/Button";

type AboutHeroSectionProps = {
  imageSrc: string;

  imageAlt?: string;

  eyebrow?: string;

  title?: string;

  italicTitle?: string;

  description?: string;

  action?: {
    label: string;
    href: string;
  };

  mobileImagePosition?: string;

  desktopImagePosition?: string;

  className?: string;
};

export function AboutHeroSection({
  imageSrc,

  imageAlt = "",

  eyebrow = "About Najibzadeh",

  title = "Rooted in heritage.",

  italicTitle = "Defined by purpose.",

  description = "Najibzadeh is a modern house of tailoring, fragrance and considered objects — shaped by craftsmanship, restraint and a quiet pursuit of lasting distinction.",

  action,

  mobileImagePosition = "68% center",

  desktopImagePosition = "center",

  className = "",
}: AboutHeroSectionProps) {
  const { ref, revealed } = useRevealOnce<HTMLElement>();

  const themeVars = {
    "--about-black": brandColors.black.hex,

    "--about-black-rgb": brandColors.black.rgb,

    "--about-white": brandColors.white.hex,

    "--about-copper": brandColors.copper.hex,
  } as CSSProperties;

  return (
    <section
      ref={ref}
      style={themeVars}
      className={`
        relative
        isolate

        min-h-[100svh]

        w-full
        overflow-hidden

        bg-[var(--about-black)]
        text-white

        md:min-h-[100svh]

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
        priority
        sizes="100vw"
        draggable={false}
        className="
          -z-30

          object-cover
        "
      style={
  {
    "--mobile-position":
      mobileImagePosition,

    "--desktop-position":
      desktopImagePosition,
  } as CSSProperties
}
      />

      {/* desktop positioning */}

    

      {/* =====================================================
          DARK OVERLAYS
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0
          -z-20

          bg-[linear-gradient(90deg,rgb(var(--about-black-rgb)/0.92)_0%,rgb(var(--about-black-rgb)/0.70)_34%,rgb(var(--about-black-rgb)/0.14)_70%,rgb(var(--about-black-rgb)/0.28)_100%)]

          max-md:bg-[linear-gradient(180deg,rgb(var(--about-black-rgb)/0.14)_0%,rgb(var(--about-black-rgb)/0.20)_42%,rgb(var(--about-black-rgb)/0.88)_100%)]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0
          -z-10

          bg-[radial-gradient(circle_at_center,transparent_32%,rgb(var(--about-black-rgb)/0.35)_120%)]
        "
      />

      {/* =====================================================
          HOUSE MARK
      ====================================================== */}

      <div
        className={`
          absolute

          right-6
          top-24

          z-10

          hidden

          text-right

          transition-[opacity,transform]
          duration-700

          md:block
          md:right-[7vw]
          md:top-[16vh]

          ${revealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
        `}
      >
        <p
          className="
            text-[7px]
            font-semibold

            uppercase
            tracking-[0.38em]

            text-white/48
          "
        >
          The House
        </p>

        <p
          className="
            mt-2

            text-[12px]
            font-medium

            uppercase
            tracking-[0.46em]

            text-white/80
          "
        >
          Najibzadeh
        </p>
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          relative
          z-10

          flex

          min-h-[78svh]

          items-end

          px-6

          pb-16
          pt-32

          sm:px-10

          md:min-h-[86svh]
          md:items-center

          md:px-[7vw]
          md:pb-0
          md:pt-20
        "
      >
        <div
          className={`
            w-full
            max-w-[620px]

            transition-[opacity,transform]
            duration-[900ms]

            ease-[cubic-bezier(0.22,1,0.36,1)]

            ${
              revealed
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }
          `}
        >
          {/* EYEBROW */}

          <div
            className="
              mb-5

              flex
              items-center
              gap-3

              text-[7px]
              font-semibold

              uppercase
              tracking-[0.23em]

              text-[var(--about-copper)]

              sm:text-[8px]
            "
          >
            <span>{eyebrow}</span>

            <span
              className="
                h-px
                w-7

                bg-[var(--about-copper)]
              "
            />
          </div>

          {/* TITLE */}

          <h1
            className="
              flex
              flex-col

              font-serif

              text-[clamp(3.3rem,13vw,5.2rem)]
              font-normal

              leading-[0.91]
              tracking-[-0.055em]

              text-white

              md:text-[clamp(4.7rem,6vw,7rem)]
            "
          >
            <span>{title}</span>

            <span
              className="
                mt-[0.1em]

                italic

                text-white/78
              "
            >
              {italicTitle}
            </span>
          </h1>

          {/* DESCRIPTION */}

          {description && (
            <p
              className="
                mt-7

                max-w-[430px]

                text-[9px]
                leading-[1.8]

                text-white/60

                sm:text-[10px]

                md:text-[11px]
              "
            >
              {description}
            </p>
          )}

          {action && (
            <div
              className="
                mt-8

                w-full
                max-w-[240px]
              "
            >
              <Button
                href={action.href}
                variant="outline"
                size="lg"
                icon={<ArrowRightIcon />}
                fullWidth
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          BOTTOM HAIRLINE
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          absolute
          inset-x-[7vw]
          bottom-6

          hidden

          items-center
          gap-4

          md:flex
        "
      >
        <span
          className="
            text-[6px]
            font-medium

            uppercase
            tracking-[0.22em]

            text-white/30
          "
        >
          Est. with intention
        </span>

        <span
          className="
            h-px
            flex-1

            bg-white/12
          "
        />

        <span
          className="
            text-[6px]
            uppercase
            tracking-[0.22em]

            text-white/30
          "
        >
          Najibzadeh
        </span>
      </div>
    </section>
  );
}

function useRevealOnce<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(true);

      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        requestAnimationFrame(() => setRevealed(true));

        observer.disconnect();
      },
      {
        threshold: 0.1,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return {
    ref,
    revealed,
  };
}
