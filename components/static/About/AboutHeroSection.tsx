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
  eyebrow = "درباره نجیب‌زاده",
  title = "ریشه‌دار در میراث.",
  italicTitle = "تعریف‌شده با هدف.",
  description = "نجیب‌زاده خانه‌ای مدرن برای خیاطی، عطر و اشیای ماندگار است؛ شکل‌گرفته از هنر دست، ظرافت، اصالت و جست‌وجویی آرام برای خلق تمایزی ماندگار.",
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
      dir="rtl"
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
            objectPosition: desktopImagePosition,
            "--mobile-position": mobileImagePosition,
            "--desktop-position": desktopImagePosition,
          } as CSSProperties
        }
      />

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
          bg-[linear-gradient(180deg,rgb(var(--about-black-rgb)/0.22)_0%,rgb(var(--about-black-rgb)/0.30)_45%,rgb(var(--about-black-rgb)/0.82)_100%)]
          md:bg-[linear-gradient(90deg,rgb(var(--about-black-rgb)/0.52)_0%,rgb(var(--about-black-rgb)/0.34)_50%,rgb(var(--about-black-rgb)/0.52)_100%)]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          -z-10
          bg-[radial-gradient(circle_at_center,transparent_20%,rgb(var(--about-black-rgb)/0.38)_120%)]
        "
      />

      {/* =====================================================
          HOUSE MARK
      ====================================================== */}

      <div
        className={`
          absolute
          left-1/2
          top-24
          z-10
          hidden
          -translate-x-1/2
          text-center
          transition-[opacity,transform]
          duration-700
          md:block
          md:top-[16vh]
          ${revealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
        `}
      >
        <p
          className="
            text-[7px]
            font-semibold
            tracking-[0.16em]
            text-white/48
          "
        >
          خانه نجیب‌زاده
        </p>

        <p
          className="
            mt-2
            text-[12px]
            font-medium
            tracking-[0.12em]
            text-white/80
          "
        >
          نجیب‌زاده
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
          justify-center
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
            mx-auto
            w-full
            max-w-[620px]
            text-center
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
              justify-center
              gap-3
              text-[7px]
              font-semibold
              tracking-[0.12em]
              text-[var(--about-copper)]
              sm:text-[8px]
            "
          >
            <span className="h-px w-7 bg-[var(--about-copper)]" />

            <span>{eyebrow}</span>

            <span className="h-px w-7 bg-[var(--about-copper)]" />
          </div>

          {/* TITLE */}

          <h1
            className="
              flex
              flex-col
              items-center
              text-center
               
              text-[clamp(3.3rem,13vw,5.2rem)]
              font-normal
              leading-[1]
              tracking-[-0.045em]
              text-white
              md:text-[clamp(4.7rem,6vw,7rem)]
            "
          >
            <span>{title}</span>

            <span
              className="
                mt-[0.1em]
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
                mx-auto
                mt-7
                max-w-[430px]
                text-center
                text-[9px]
                leading-[2]
                text-white/60
                sm:text-[10px]
                md:text-[11px]
              "
            >
              {description}
            </p>
          )}

          {/* ACTION */}

          {action && (
            <div
              className="
                mx-auto
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
          justify-center
          gap-4
          md:flex
        "
      >
        <span
          className="
            text-[6px]
            font-medium
            tracking-[0.1em]
            text-white/30
          "
        >
          بنیان‌گذاری‌شده با هدف
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
            tracking-[0.1em]
            text-white/30
          "
        >
          نجیب‌زاده
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
      const frame = requestAnimationFrame(() => setRevealed(true));
      return () => cancelAnimationFrame(frame);
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
