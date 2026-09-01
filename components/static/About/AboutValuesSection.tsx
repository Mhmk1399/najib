"use client";

import Image from "next/image";

import { type CSSProperties, useEffect, useRef, useState } from "react";

import { brandColors } from "@/theme/theme-colors";

import { ArrowRightIcon, Button } from "@/components/ui/Button";

type AboutValuesSectionProps = {
  imageSrc: string;

  imageAlt?: string;

  eyebrow?: string;

  title?: string;

  italicTitle?: string;

  description?: string;

  quote?: string;

  signature?: string;

  action?: {
    label: string;
    href: string;
  };

  mobileImagePosition?: string;

  desktopImagePosition?: string;

  className?: string;
};

export function AboutValuesSection({
  imageSrc,

  imageAlt = "",

  eyebrow = "Our Values",

  title = "Built on timeless values.",

  italicTitle = "Guided by integrity.",

  description = "At Najibzadeh, we believe true luxury is quiet. It is found in integrity, thoughtful choices and the discipline to create only what deserves to exist.",

  quote = "We create with respect — for people, for craft and for the world around us.",

  signature = "Najibzadeh",

  action,

  mobileImagePosition = "65% center",

  desktopImagePosition = "center",

  className = "",
}: AboutValuesSectionProps) {
  const { ref, revealed } = useRevealOnce<HTMLElement>();

  const themeVars = {
    "--values-black": brandColors.black.hex,

    "--values-black-rgb": brandColors.black.rgb,

    "--values-copper": brandColors.copper.hex,

    "--mobile-position": mobileImagePosition,

    "--desktop-position": desktopImagePosition,
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

        bg-[var(--values-black)]
        text-white

        md:min-h-[100svh]

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
        sizes="100vw"
        loading="lazy"
        draggable={false}
        className="
          -z-30

          object-cover

          object-[var(--mobile-position)]

          md:object-[var(--desktop-position)]
        "
      />

      {/* =====================================================
          OVERLAY
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0
          -z-20

          bg-[linear-gradient(90deg,rgb(var(--values-black-rgb)/0.90)_0%,rgb(var(--values-black-rgb)/0.68)_36%,rgb(var(--values-black-rgb)/0.16)_70%,rgb(var(--values-black-rgb)/0.30)_100%)]

          max-md:bg-[linear-gradient(180deg,rgb(var(--values-black-rgb)/0.10)_0%,rgb(var(--values-black-rgb)/0.20)_38%,rgb(var(--values-black-rgb)/0.90)_100%)]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0
          -z-10

          bg-[radial-gradient(circle_at_center,transparent_36%,rgb(var(--values-black-rgb)/0.32)_120%)]
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

          min-h-[76svh]

          items-end

          px-6

          pb-14
          pt-28

          sm:px-10

          md:min-h-[82svh]
          md:items-center

          md:px-[7vw]
          md:pb-0
        "
      >
        <div
          className={`
            w-full
            max-w-[600px]

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

              text-[var(--values-copper)]

              sm:text-[8px]
            "
          >
            <span>{eyebrow}</span>

            <span
              className="
                h-px
                w-7

                bg-[var(--values-copper)]
              "
            />
          </div>

          {/* TITLE */}

          <h2
            className="
              flex
              flex-col

              font-serif

              text-[clamp(3rem,12vw,4.8rem)]
              font-normal

              leading-[0.93]
              tracking-[-0.055em]

              text-white

              md:text-[clamp(4.2rem,5.6vw,6.2rem)]
            "
          >
            <span>{title}</span>

            <span
              className="
                mt-[0.1em]

                italic

                text-white/75
              "
            >
              {italicTitle}
            </span>
          </h2>

          <p
            className="
              mt-7

              max-w-[430px]

              text-[9px]
              leading-[1.8]

              text-white/58

              sm:text-[10px]

              md:text-[11px]
            "
          >
            {description}
          </p>

          {/* QUOTE */}

          <div
            className="
              mt-7

              max-w-[430px]

              border-l
              border-white/20

              pl-5
            "
          >
            <p
              className="
                font-serif

                text-[17px]
                italic

                leading-[1.5]

                text-white/78

                sm:text-[19px]
              "
            >
              “{quote}”
            </p>
          </div>

          {/* SIGNATURE */}

          <p
            className="
              mt-7

              font-serif

              text-[17px]
              italic

              tracking-[-0.03em]

              text-white/55
            "
          >
            {signature}
          </p>

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
                variant="cream"
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
          CORNER DETAIL
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          absolute

          bottom-7
          right-[7vw]

          hidden

          text-right

          md:block
        "
      >
        <p
          className="
            text-[6px]
            font-medium

            uppercase
            tracking-[0.22em]

            text-white/30
          "
        >
          Purpose / Craft / Character
        </p>

        <span
          className="
            mt-3
            ml-auto

            block

            h-px
            w-16

            bg-white/20
          "
        />
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
        if (!entry?.isIntersecting) return;

        requestAnimationFrame(() => setRevealed(true));

        observer.disconnect();
      },
      {
        threshold: 0.08,
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
