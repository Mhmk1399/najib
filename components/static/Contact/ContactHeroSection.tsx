"use client";

import Image from "next/image";

import { type CSSProperties, useEffect, useRef, useState } from "react";

import { brandColors } from "@/theme/theme-colors";

type ContactHeroSectionProps = {
  imageSrc: string;

  imageAlt?: string;

  eyebrow?: string;

  title?: string;

  italicTitle?: string;

  description?: string;

  mobileImagePosition?: string;

  desktopImagePosition?: string;

  className?: string;
};

export function ContactHeroSection({
  imageSrc,

  imageAlt = "",

  eyebrow = "Contact Najibzadeh",

  title = "Begin the conversation.",

  italicTitle = "We are here to guide every detail.",

  description = "From private appointments to tailored guidance, our team is dedicated to providing a discreet and considered experience.",

  mobileImagePosition = "68% center",

  desktopImagePosition = "center",

  className = "",
}: ContactHeroSectionProps) {
  const { ref, revealed } = useRevealOnce<HTMLElement>();

  const themeVars = {
    "--contact-black": brandColors.black.hex,

    "--contact-black-rgb": brandColors.black.rgb,

    "--contact-copper": brandColors.copper.hex,

    "--contact-mobile-position": mobileImagePosition,

    "--contact-desktop-position": desktopImagePosition,
  } as CSSProperties;

  return (
    <section
      ref={ref}
      style={themeVars}
      className={`
        relative
        isolate

        min-h-[100svh]
        md:min-h-[100svh]

        w-full
        overflow-hidden

        bg-[var(--contact-black)]
        text-white

        ${className}
      `}
    >
      {/* =====================================================
          BACKGROUND
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

          object-[var(--contact-mobile-position)]

          md:object-[var(--contact-desktop-position)]
        "
      />

      {/* =====================================================
          LEFT DARK GRADIENT
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0
          -z-20

          bg-[linear-gradient(90deg,rgb(var(--contact-black-rgb)/0.98)_0%,rgb(var(--contact-black-rgb)/0.91)_28%,rgb(var(--contact-black-rgb)/0.48)_48%,rgb(var(--contact-black-rgb)/0.06)_76%,rgb(var(--contact-black-rgb)/0.12)_100%)]

          max-md:bg-[linear-gradient(180deg,rgb(var(--contact-black-rgb)/0.12)_0%,rgb(var(--contact-black-rgb)/0.16)_37%,rgb(var(--contact-black-rgb)/0.92)_100%)]
        "
      />

      {/* vignette */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0
          -z-10

          bg-[radial-gradient(circle_at_center,transparent_35%,rgb(var(--contact-black-rgb)/0.28)_120%)]
        "
      />

      {/* =====================================================
          HOUSE MARK
      ====================================================== */}

      <div
        className={`
          absolute

          right-[7vw]
          top-[16vh]

          z-10

          hidden

          transition-[opacity,transform]
          duration-700

          md:block

          ${revealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
        `}
      >
        <p
          className="
            text-[12px]
            font-medium

            uppercase
            tracking-[0.5em]

            text-white/70
          "
        >
          NAJIBZADEH
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

          min-h-[100svh]
          md:min-h-[100svh]

          items-end

          px-6

          pb-14
          pt-32

          sm:px-10
          sm:pb-16

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
          {/* =================================================
              EYEBROW
          ================================================= */}

          <div
            className="
              mb-6

              flex
              items-center
              gap-3

              text-[7px]
              font-semibold

              uppercase
              tracking-[0.24em]

              text-[var(--contact-copper)]

              sm:text-[8px]
            "
          >
            <span>{eyebrow}</span>

            <span
              className="
                h-px
                w-6

                bg-[var(--contact-copper)]
              "
            />
          </div>

          {/* =================================================
              TITLE
          ================================================= */}

          <h1
            className="
              flex
              flex-col

              font-serif

              text-[clamp(3.1rem,12vw,5rem)]
              font-normal

              leading-[0.95]
              tracking-[-0.055em]

              text-white

              md:text-[clamp(4.5rem,5.8vw,6.8rem)]
            "
          >
            <span>{title}</span>

            <span
              className="
                mt-[0.12em]

                max-w-[580px]

                italic

                text-white/78
              "
            >
              {italicTitle}
            </span>
          </h1>

          {/* =================================================
              SMALL LINE
          ================================================= */}

          <span
            aria-hidden="true"
            className="
              mt-8

              block

              h-px
              w-8

              bg-[var(--contact-copper)]
            "
          />

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <p
            className="
              mt-7

              max-w-[430px]

              text-[10px]
              font-normal

              leading-[1.85]

              text-white/58

              sm:text-[11px]
            "
          >
            {description}
          </p>
        </div>
      </div>

      {/* =====================================================
          BOTTOM DETAIL
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
          Private Client Services
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

/* ==========================================================================
   REVEAL
============================================================================ */

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

        requestAnimationFrame(() => {
          setRevealed(true);
        });

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
