"use client";

import Image from "next/image";

import { type CSSProperties, useEffect, useRef, useState } from "react";

import type { ContactCopy } from "@/lib/i18n/contact-copy";

import {
  getHtmlLang,
  getLocaleDirection,
  type Locale,
} from "@/lib/i18n/config";

import { brandColors } from "@/theme/theme-colors";

type ContactServicesSectionProps = {
  copy: ContactCopy["services"];

  locale: Locale;

  imageSrc: string;

  imagePosition?: string;

  className?: string;
};

export function ContactSection({
  copy,
  locale,
  imageSrc,
  imagePosition = "center",
  className = "",
}: ContactServicesSectionProps) {
  const { ref, revealed } = useRevealOnce<HTMLElement>();

  const direction = getLocaleDirection(locale);

  const htmlLang = getHtmlLang(locale);

  const themeVars = {
    "--contact-black": brandColors.black.hex,

    "--contact-black-rgb": brandColors.black.rgb,

    "--contact-copper": brandColors.copper.hex,

    "--contact-image-position": imagePosition,
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

        bg-[var(--contact-black)]

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
        priority
        sizes="100vw"
        draggable={false}
        className="
          -z-30

          object-cover

          object-[var(--contact-image-position)]
        "
      />

      {/* OVERLAYS */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0

          -z-20

          bg-[linear-gradient(180deg,rgb(var(--contact-black-rgb)/0.14)_0%,rgb(var(--contact-black-rgb)/0.28)_45%,rgb(var(--contact-black-rgb)/0.92)_100%)]

          md:bg-[linear-gradient(90deg,rgb(var(--contact-black-rgb)/0.58)_0%,rgb(var(--contact-black-rgb)/0.32)_50%,rgb(var(--contact-black-rgb)/0.58)_100%)]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0

          -z-10

          bg-[radial-gradient(circle_at_center,transparent_28%,rgb(var(--contact-black-rgb)/0.38)_120%)]
        "
      />

      {/* IMAGE CAPTION */}

      <div
        className={`
          absolute

          left-1/2
          top-[16vh]

          z-10

          hidden

          -translate-x-1/2

          text-center

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

            tracking-[0.16em]

            text-white/70
          "
        >
          {copy.imageCaption}
        </p>
      </div>

      {/* CONTENT */}

      <div
        className="
          relative
          z-10

          flex

          min-h-[100svh]

          items-end
          justify-center

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
            mx-auto

            w-full
            max-w-[680px]

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
              mb-6

              flex
              items-center
              justify-center
              gap-3

              text-[7px]
              font-semibold

              tracking-[0.12em]

              text-[var(--contact-copper)]

              sm:text-[8px]
            "
          >
            <span
              aria-hidden="true"
              className="
                h-px
                w-7

                bg-[var(--contact-copper)]
              "
            />

            <span>{copy.eyebrow}</span>

            <span
              aria-hidden="true"
              className="
                h-px
                w-7

                bg-[var(--contact-copper)]
              "
            />
          </div>

          {/* TITLE */}

          <h1
            className="
              flex
              flex-col

              items-center

              text-center

              text-[clamp(3.1rem,12vw,5rem)]

              font-normal

              leading-[1.02]

              tracking-[-0.045em]

              text-white

              md:text-[clamp(4.5rem,5.8vw,6.8rem)]
            "
          >
            <span>{copy.title}</span>


          </h1>

          <span
            aria-hidden="true"
            className="
              mx-auto
              mt-8

              block

              h-px
              w-10

              bg-[var(--contact-copper)]
            "
          />

          {/* DESCRIPTION */}


        </div>
      </div>

      {/* FOOTER NOTE */}

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
          {copy.footerNote}
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
