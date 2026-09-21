"use client";

import Image from "next/image";

import { type CSSProperties, useEffect, useRef, useState } from "react";

import { ArrowLeftIcon, ArrowRightIcon, Button } from "@/components/ui/Button";

import type { AboutCopy } from "@/lib/i18n/about-copy";

import {
  getHtmlLang,
  getLocaleDirection,
  type Locale,
} from "@/lib/i18n/config";

import { localizedHref } from "@/lib/i18n/routes";

import { brandColors } from "@/theme/theme-colors";

type AboutValuesSectionProps = {
  copy: AboutCopy["values"];

  locale: Locale;

  imageSrc: string;

  mobileImagePosition?: string;

  desktopImagePosition?: string;

  className?: string;
};

export function AboutValuesSection({
  copy,
  locale,
  imageSrc,
  mobileImagePosition = "65% center",
  desktopImagePosition = "center",
  className = "",
}: AboutValuesSectionProps) {
  const { ref, revealed } = useRevealOnce<HTMLElement>();

  const direction = getLocaleDirection(locale);

  const htmlLang = getHtmlLang(locale);

  const isRtl = direction === "rtl";

  const ActionIcon = isRtl ? ArrowLeftIcon : ArrowRightIcon;

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
      dir={direction}
      lang={htmlLang}
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
      {/* BACKGROUND */}

      <Image
        src={imageSrc}
        alt={copy.imageAlt}
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

      {/* OVERLAY */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0

          -z-20

          bg-[linear-gradient(180deg,rgb(var(--values-black-rgb)/0.18)_0%,rgb(var(--values-black-rgb)/0.34)_45%,rgb(var(--values-black-rgb)/0.90)_100%)]

          md:bg-[linear-gradient(90deg,rgb(var(--values-black-rgb)/0.55)_0%,rgb(var(--values-black-rgb)/0.30)_50%,rgb(var(--values-black-rgb)/0.55)_100%)]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0

          -z-10

          bg-[radial-gradient(circle_at_center,transparent_28%,rgb(var(--values-black-rgb)/0.38)_120%)]
        "
      />

      {/* CONTENT */}

      <div
        className="
          relative
          z-10

          flex

          min-h-[76svh]

          items-end
          justify-center

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
            mx-auto

            w-full
            max-w-[600px]

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

              text-center

              text-[7px]

              font-semibold

              tracking-[0.12em]

              text-[var(--values-copper)]

              sm:text-[8px]
            "
          >
            <span
              aria-hidden="true"
              className="
                h-px
                w-7

                bg-[var(--values-copper)]
              "
            />

            <span>{copy.eyebrow}</span>

            <span
              aria-hidden="true"
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

              items-center

              text-center

              text-[clamp(3rem,12vw,4.8rem)]

              font-normal

              leading-[1.02]

              tracking-[-0.045em]

              text-white

              md:text-[clamp(4.2rem,5.6vw,6.2rem)]
            "
          >
            <span>{copy.title}</span>

            <span
              className="
                mt-[0.1em]

                text-white/75
              "
            >
              {copy.italicTitle}
            </span>
          </h2>

          {/* DESCRIPTION */}

          <p
            className="
              mx-auto
              mt-7

              max-w-[430px]

              text-center

              text-[9px]

              leading-[2]

              text-white/58

              sm:text-[10px]

              md:text-[11px]
            "
          >
            {copy.description}
          </p>

          {/* QUOTE */}

          <div
            className="
              mx-auto
              mt-8

              max-w-[430px]

              text-center
            "
          >
            <span
              aria-hidden="true"
              className="
                mx-auto
                mb-5

                block

                h-px
                w-12

                bg-white/20
              "
            />

            <p
              className="
                text-[17px]

                leading-[1.8]

                text-white/78

                sm:text-[19px]
              "
            >
              {copy.quote}
            </p>

            <span
              aria-hidden="true"
              className="
                mx-auto
                mt-5

                block

                h-px
                w-12

                bg-white/20
              "
            />
          </div>

          {/* SIGNATURE */}

          <p
            className="
              mt-6

              text-center

              text-[17px]

              tracking-[-0.02em]

              text-white/55
            "
          >
            {copy.signature}
          </p>

          {/* ACTION */}

          {copy.action ? (
            <div
              className="
                mx-auto
                mt-8

                w-full
                max-w-[240px]
              "
            >
              <Button
                href={localizedHref(copy.action.href, locale)}
                variant="cream"
                size="lg"
                icon={<ActionIcon />}
                fullWidth
              >
                {copy.action.label}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {/* BOTTOM DETAIL */}

      <div
        aria-hidden="true"
        className="
          absolute

          bottom-7
          left-1/2

          hidden

          -translate-x-1/2

          text-center

          md:block
        "
      >
        <p
          className="
            whitespace-nowrap

            text-[6px]

            font-medium

            tracking-[0.1em]

            text-white/30
          "
        >
          {copy.bottomDetail}
        </p>

        <span
          className="
            mx-auto
            mt-3

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
      const frame = requestAnimationFrame(() => {
        setRevealed(true);
      });

      return () => cancelAnimationFrame(frame);
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
