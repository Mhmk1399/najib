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
    title: "بهترین متریال",
    icon: "material",
  },
  {
    id: "precision",
    title: "دوخت دقیق",
    icon: "precision",
  },
  {
    id: "finishing",
    title: "پرداخت ظریف",
    icon: "finishing",
  },
  {
    id: "lasting",
    title: "ساخته‌شده برای ماندگاری",
    icon: "lasting",
  },
] as const;

export function AboutCraftSection({
  images,

  eyebrow = "هنر ما",

  title = "جایی که هنر دست با ظرافت مدرن پیوند می‌خورد.",

  description = "هر قطعه با یک هدف آغاز می‌شود. از انتخاب نخستین متریال تا آخرین بخیه، هر تصمیم با دقت، تناسب و احترام به هنر خیاطی شکل می‌گیرد.",

  secondaryDescription = "نتیجه، پوشاک و اشیایی است که برای زندگی‌کردن، به‌یادماندن و ارزشمند ماندن فراتر از یک لحظه ساخته شده‌اند.",

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
      dir="rtl"
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
                border-l
                border-black/10
                last:border-l-0
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
                  scale-[1.01]
                  object-cover
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
                  left-1/2
                  -translate-x-1/2
                  text-center
                  text-[6px]
                  font-medium
                  tracking-[0.12em]
                  text-white/55
                "
              >
                {new Intl.NumberFormat("fa-IR", {
                  minimumIntegerDigits: 2,
                  useGrouping: false,
                }).format(index + 1)}
              </span>
            </div>
          ))}
        </div>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <div
          className={`
            text-center

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
              justify-center
              gap-3
              text-[7px]
              font-semibold
              tracking-[0.12em]
              text-[var(--craft-copper)]
              sm:text-[8px]
            "
          >
            <span
              className="
                h-px
                w-6
                bg-[var(--craft-copper)]
              "
            />

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
              mx-auto
              max-w-[620px]
              text-center
               
              text-[clamp(2.8rem,10vw,4.5rem)]
              font-normal
              leading-[1.05]
              tracking-[-0.04em]
              text-[var(--craft-text)]

              sm:text-[clamp(3.4rem,7vw,5rem)]
              lg:text-[clamp(3.8rem,4.5vw,5.5rem)]
            "
          >
            {title}
          </h2>

          {/* DESCRIPTION */}

          <p
            className="
              mx-auto
              mt-7
              max-w-[510px]
              text-center
              text-[10px]
              leading-[2]
              text-[var(--craft-muted)]
              sm:text-[11px]
            "
          >
            {description}
          </p>

          <p
            className="
              mx-auto
              mt-4
              max-w-[510px]
              text-center
              text-[10px]
              leading-[2]
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
              border-r
              border-t
              border-black/10
              lg:grid-cols-4
            "
          >
            {CRAFT_VALUES.map((item) => (
              <div
                key={item.id}
                className="
                  flex
                  min-h-[135px]
                  flex-col
                  items-center
                  justify-center
                  border-b
                  border-l
                  border-black/10
                  px-4
                  py-5
                  text-center
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
                    mx-auto
                    mt-5
                    max-w-[120px]
                    text-center
                    text-[7px]
                    font-semibold
                    leading-[1.8]
                    tracking-[0.06em]
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
      const frame = requestAnimationFrame(() => setRevealed(true));
      return () => cancelAnimationFrame(frame);
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
