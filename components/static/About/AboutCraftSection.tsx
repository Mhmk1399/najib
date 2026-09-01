"use client";

import Image from "next/image";

import { type CSSProperties, useEffect, useRef, useState } from "react";

import { brandColors, lightTokens } from "@/theme/theme-colors";

type CraftImage = {
  id: string;

  src: string;

  alt?: string;

  position?: string;
};

type AboutCraftSectionProps = {
  images: CraftImage[];

  eyebrow?: string;

  title?: string;

  description?: string;

  secondaryDescription?: string;

  className?: string;
};

const CRAFT_VALUES = [
  {
    id: "materials",
    title: "Exceptional Materials",
    icon: "material",
  },

  {
    id: "precision",
    title: "Precision Tailoring",
    icon: "precision",
  },

  {
    id: "finishing",
    title: "Refined Finishing",
    icon: "finishing",
  },

  {
    id: "lasting",
    title: "Made to Endure",
    icon: "lasting",
  },
] as const;

export function AboutCraftSection({
  images,

  eyebrow = "Our Craft",

  title = "Where craftsmanship meets modern excellence.",

  description = "Every piece begins with intention. From the first material selected to the final stitch, each decision is shaped by discipline, proportion and respect for the craft.",

  secondaryDescription = "The result is clothing and objects made to be lived in, remembered and valued beyond the moment.",

  className = "",
}: AboutCraftSectionProps) {
  const { ref, revealed } = useRevealOnce<HTMLElement>();

  const visibleImages = images.slice(0, 3);

  const themeVars = {
    "--craft-bg": lightTokens.surfaceBrand,

    "--craft-text": brandColors.black.hex,

    "--craft-muted": lightTokens.textMuted,

    "--craft-border": lightTokens.border,

    "--craft-copper": brandColors.copper.hex,
  } as CSSProperties;

  return (
    <section
      ref={ref}
      style={themeVars}
      className={`
        w-full

        bg-[var(--craft-bg)]
        text-[var(--craft-text)]

        ${className}
      `}
    >
      <div
        className="
          mx-auto

          grid
          w-full
          max-w-[1600px]

          gap-12

          px-6

          py-16

          sm:px-8
          sm:py-20

          lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]

          lg:items-center
          lg:gap-16

          lg:px-12
          lg:py-28

          xl:gap-24
          xl:px-16
        "
      >
        {/* =====================================================
            IMAGE TRIPTYCH
        ====================================================== */}

        <div
          className={`
            grid

            h-[500px]

            grid-cols-3

            overflow-hidden

            border
            border-[var(--craft-border)]

            transition-[opacity,transform]
            duration-[900ms]

            ease-[cubic-bezier(0.22,1,0.36,1)]

            sm:h-[620px]

            lg:h-[680px]

            ${
              revealed
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }
          `}
        >
          {visibleImages.map((image, index) => (
            <div
              key={image.id}
              className="
                  relative

                  overflow-hidden

                  border-r
                  border-black/10

                  last:border-r-0
                "
            >
              <Image
                src={image.src}
                alt={image.alt ?? ""}
                fill
                loading="lazy"
                sizes="33vw"
                draggable={false}
                style={{
                  objectPosition: image.position ?? "center",
                }}
                className="
                    object-cover

                    scale-[1.01]

                    transition-transform
                    duration-[1200ms]

                    ease-[cubic-bezier(0.22,1,0.36,1)]

                    hover:scale-[1.04]
                  "
              />

              <div
                aria-hidden="true"
                className="
                    pointer-events-none

                    absolute
                    inset-0

                    bg-gradient-to-t

                    from-black/22
                    via-transparent
                    to-black/[0.04]
                  "
              />

              <span
                className="
                    absolute

                    bottom-4
                    left-4

                    text-[6px]
                    font-medium

                    tracking-[0.2em]

                    text-white/55
                  "
              >
                0{index + 1}
              </span>
            </div>
          ))}
        </div>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <div
          className={`
            transition-[opacity,transform]
            duration-[900ms]

            ease-[cubic-bezier(0.22,1,0.36,1)]

            ${
              revealed
                ? "translate-y-0 opacity-100 delay-150"
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
              tracking-[0.22em]

              text-[var(--craft-copper)]

              sm:text-[8px]
            "
          >
            <span>{eyebrow}</span>

            <span
              className="
                h-px
                w-6

                bg-[var(--craft-copper)]
              "
            />
          </div>

          {/* TITLE */}

          <h2
            className="
              max-w-[620px]

              font-serif

              text-[clamp(2.8rem,10vw,4.5rem)]
              font-normal

              leading-[0.96]
              tracking-[-0.05em]

              text-[var(--craft-text)]

              sm:text-[clamp(3.4rem,7vw,5rem)]

              lg:text-[clamp(3.8rem,4.5vw,5.5rem)]
            "
          >
            {title}
          </h2>

          <p
            className="
              mt-7

              max-w-[510px]

              text-[10px]
              leading-[1.8]

              text-[var(--craft-muted)]

              sm:text-[11px]
            "
          >
            {description}
          </p>

          <p
            className="
              mt-4

              max-w-[510px]

              text-[10px]
              leading-[1.8]

              text-[var(--craft-muted)]

              sm:text-[11px]
            "
          >
            {secondaryDescription}
          </p>

          {/* =================================================
              VALUES
          ================================================= */}

          <div
            className="
              mt-10

              grid
              grid-cols-2

              border-l
              border-t
              border-black/10

              lg:grid-cols-4
            "
          >
            {CRAFT_VALUES.map((item) => (
              <div
                key={item.id}
                className="
                    min-h-[135px]

                    border-b
                    border-r
                    border-black/10

                    px-4
                    py-5
                  "
              >
                <span
                  className="
                      grid

                      size-8

                      place-items-center

                      text-black/65
                    "
                >
                  <CraftIcon type={item.icon} />
                </span>

                <p
                  className="
                      mt-5

                      max-w-[100px]

                      text-[7px]
                      font-semibold

                      uppercase
                      tracking-[0.12em]

                      leading-[1.6]

                      text-black/60
                    "
                >
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CraftIcon({ type }: { type: string }) {
  if (type === "material") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-5"
        aria-hidden="true"
      >
        <path
          d="M5 7L12 3L19 7V17L12 21L5 17V7Z"
          stroke="currentColor"
          strokeWidth="1"
        />

        <path
          d="M5 7L12 11L19 7M12 11V21"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>
    );
  }

  if (type === "precision") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M4 6H20V18H4V6Z" stroke="currentColor" strokeWidth="1" />

        <path
          d="M7 6V10M10 6V8M13 6V10M16 6V8"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>
    );
  }

  if (type === "finishing") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M6 18L18 6M8 6H18V16" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
      <path d="M7 4H17M7 20H17" stroke="currentColor" strokeWidth="1" />

      <path
        d="M8 4C8 8 10 10 12 12C14 10 16 8 16 4"
        stroke="currentColor"
        strokeWidth="1"
      />

      <path
        d="M8 20C8 16 10 14 12 12C14 14 16 16 16 20"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
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
