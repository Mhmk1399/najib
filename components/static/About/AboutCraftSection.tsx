"use client";

import Image from "next/image";

import { type CSSProperties, useEffect, useRef, useState } from "react";

import type { AboutCopy, AboutCraftIcon } from "@/lib/i18n/about-copy";
import {
  getHtmlLang,
  getLocaleDirection,
  type Locale,
} from "@/lib/i18n/config";
import { estedad } from "@/next-persian-fonts/estedad";
import { brandColors, lightTokens } from "@/theme/theme-colors";

type CraftImage = {
  id: string;
  src: string;
  alt: string;
  position?: string;
};

type AboutCraftSectionProps = {
  copy: AboutCopy["craft"];
  locale: Locale;
  images: CraftImage[];
  className?: string;
};

function formatIndex(value: number, locale: Locale) {
  return new Intl.NumberFormat(getHtmlLang(locale), {
    minimumIntegerDigits: 2,
    useGrouping: false,
  }).format(value);
}

export function AboutCraftSection({
  copy,
  locale,
  images,
  className = "",
}: AboutCraftSectionProps) {
  const { ref, revealed } = useRevealOnce<HTMLElement>();
  const direction = getLocaleDirection(locale);
  const htmlLang = getHtmlLang(locale);
  const isRtl = direction === "rtl";
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
      id="about-craft"
      ref={ref}
      style={themeVars}
      dir={direction}
      lang={htmlLang}
      aria-labelledby="about-craft-title"
      aria-describedby="about-craft-description"
      className={`w-full bg-[var(--craft-bg)] text-[var(--craft-text)] ${className}`}
    >
      <div className="mx-auto grid w-full max-w-[1600px] gap-9 px-5 py-14 sm:gap-11 sm:px-8 sm:py-[72px] lg:grid-cols-[minmax(0,1.06fr)_minmax(380px,0.94fr)] lg:items-center lg:gap-14 lg:px-12 lg:py-24 xl:gap-20 xl:px-16 xl:py-28">
        <figure
          className={`grid h-[360px] grid-cols-3 overflow-hidden border border-[var(--craft-border)] transition-[opacity,transform] duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:h-[500px] lg:h-[610px] xl:h-[660px] ${
            revealed ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {visibleImages.map((image, index) => (
            <div
              key={image.id}
              className={`relative overflow-hidden border-black/10 ${
                index < visibleImages.length - 1
                  ? isRtl
                    ? "border-l"
                    : "border-r"
                  : ""
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                loading="lazy"
                sizes="(max-width: 1023px) 33vw, 20vw"
                draggable={false}
                style={{ objectPosition: image.position ?? "center" }}
                className="scale-[1.01] object-cover transition-transform duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.035] motion-reduce:transition-none"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/24 via-transparent to-black/[0.04]"
              />
              <span
                aria-hidden="true"
                className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[7px] font-medium tracking-[0.10em] text-white/55 sm:bottom-4"
              >
                {formatIndex(index + 1, locale)}
              </span>
            </div>
          ))}
          <figcaption className="sr-only">{copy.title}</figcaption>
        </figure>

        <div
          className={`text-start transition-[opacity,transform] duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            revealed
              ? "translate-y-0 opacity-100 lg:delay-100"
              : "translate-y-8 opacity-0"
          }`}
        >
          <div className="mb-4 flex items-center gap-3 text-[var(--craft-copper)] sm:mb-5">
            <span aria-hidden="true" className="h-px w-6 bg-current" />
            <span className="text-[8px] font-semibold tracking-[0.11em] sm:text-[9px]">
              {copy.eyebrow}
            </span>
          </div>

          <h2
            id="about-craft-title"
            className="max-w-[620px] text-balance text-[clamp(2.15rem,9.2vw,3.25rem)] font-normal leading-[1.08] tracking-[-0.038em] text-[var(--craft-text)] sm:text-[clamp(2.65rem,6.6vw,3.8rem)] lg:text-[clamp(3.05rem,3.85vw,4.45rem)] xl:text-[clamp(3.35rem,3.55vw,4.7rem)]"
          >
            {copy.title}
          </h2>

          <div className="mt-5 max-w-[560px] sm:mt-6">
            <p
              id="about-craft-description"
              className={`${estedad.className} text-pretty text-[12px] font-normal leading-[1.9] text-[var(--craft-muted)] sm:text-[13px] sm:leading-7 lg:text-[14px] lg:leading-8`}
            >
              {copy.description}
            </p>

            <p
              className={`${estedad.className} mt-3 text-pretty text-[12px] font-normal leading-[1.9] text-[var(--craft-muted)] sm:mt-4 sm:text-[13px] sm:leading-7 lg:text-[14px] lg:leading-8`}
            >
              {copy.secondaryDescription}
            </p>
          </div>

          <ul
            className={`mt-8 grid grid-cols-2 border-t border-black/10 sm:mt-9 lg:grid-cols-4 ${isRtl ? "border-r" : "border-l"}`}
          >
            {copy.values.map((item) => (
              <li
                key={item.id}
                className={`flex min-h-[112px] flex-col items-center justify-center border-b border-black/10 px-3 py-4 text-center sm:min-h-[122px] sm:px-4 sm:py-5 ${
                  isRtl ? "border-l" : "border-r"
                }`}
              >
                <span className="grid size-8 place-items-center text-black/62 sm:size-9">
                  <CraftIcon type={item.icon} />
                </span>
                <span className="mt-3 max-w-[132px] text-balance text-[9px] font-semibold leading-[1.65] tracking-[0.035em] text-black/58 sm:mt-4 sm:text-[10px]">
                  {item.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function CraftIcon({ type }: { type: AboutCraftIcon }) {
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
      { threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, revealed };
}
