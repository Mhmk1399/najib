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
import { estedad } from "@/next-persian-fonts/estedad";
import { brandColors } from "@/theme/theme-colors";

type AboutHeroSectionProps = {
  copy: AboutCopy["hero"];
  locale: Locale;
  imageSrc: string;
  mobileImagePosition?: string;
  desktopImagePosition?: string;
  className?: string;
};

export function AboutHeroSection({
  copy,
  locale,
  imageSrc,
  mobileImagePosition = "68% center",
  desktopImagePosition = "center",
  className = "",
}: AboutHeroSectionProps) {
  const { ref, revealed } = useRevealOnce<HTMLElement>();
  const direction = getLocaleDirection(locale);
  const htmlLang = getHtmlLang(locale);
  const isRtl = direction === "rtl";
  const ActionIcon = isRtl ? ArrowLeftIcon : ArrowRightIcon;

  const themeVars = {
    "--about-black": brandColors.black.hex,
    "--about-black-rgb": brandColors.black.rgb,
    "--about-white": brandColors.white.hex,
    "--about-copper": brandColors.copper.hex,
    "--about-mobile-position": mobileImagePosition,
    "--about-desktop-position": desktopImagePosition,
  } as CSSProperties;

  return (
    <section
      id="about-hero"
      ref={ref}
      style={themeVars}
      dir={direction}
      lang={htmlLang}
      aria-labelledby="about-hero-title"
      aria-describedby={copy.description ? "about-hero-description" : undefined}
      className={`relative isolate min-h-[100svh] w-full overflow-hidden bg-[var(--about-black)] text-white ${className}`}
    >
      <Image
        src={imageSrc}
        alt={copy.imageAlt}
        fill
        priority
        sizes="100vw"
        draggable={false}
        className="-z-30 object-cover object-[var(--about-mobile-position)] md:object-[var(--about-desktop-position)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgb(var(--about-black-rgb)/0.12)_0%,rgb(var(--about-black-rgb)/0.24)_40%,rgb(var(--about-black-rgb)/0.88)_100%)] md:bg-[linear-gradient(90deg,rgb(var(--about-black-rgb)/0.70)_0%,rgb(var(--about-black-rgb)/0.34)_43%,rgb(var(--about-black-rgb)/0.18)_68%,rgb(var(--about-black-rgb)/0.42)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_42%,transparent_24%,rgb(var(--about-black-rgb)/0.34)_118%)]"
      />

      <div
        aria-hidden="true"
        className={`absolute inset-x-0 top-[88px] z-10 hidden items-center justify-center transition-[opacity,transform] duration-700 md:flex md:top-[14vh] ${
          revealed ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        <div className="flex items-center gap-4 text-center">
          <span className="h-px w-8 bg-white/18" />
          <div>
            <p className="text-[8px] font-semibold tracking-[0.14em] text-white/42">
              {copy.houseEyebrow}
            </p>
            <p className="mt-1.5 text-[11px] font-medium tracking-[0.10em] text-white/72">
              {copy.houseName}
            </p>
          </div>
          <span className="h-px w-8 bg-white/18" />
        </div>
      </div>

      <div className="relative z-10 flex min-h-[100svh] items-end px-5 pb-[max(54px,env(safe-area-inset-bottom))] pt-28 sm:px-8 sm:pb-16 md:items-center md:px-[6vw] md:pb-0 md:pt-16 lg:px-[7vw]">
        <header
          className={`w-full max-w-[760px] text-start transition-[opacity,transform] duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            revealed ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="mb-4 flex items-center gap-3 text-[var(--about-copper)] sm:mb-5">
            <span aria-hidden="true" className="h-px w-6 bg-current sm:w-8" />
            <span className="text-[8px] font-semibold tracking-[0.11em] sm:text-[9px]">
              {copy.eyebrow}
            </span>
          </div>

          <h1
            id="about-hero-title"
            className="max-w-[900px] text-balance text-[clamp(2.35rem,10.2vw,3.65rem)] font-normal leading-[1.04] tracking-[-0.042em] text-white sm:text-[clamp(2.9rem,7.4vw,4.25rem)] md:text-[clamp(3.45rem,4.7vw,5.05rem)] xl:text-[clamp(3.8rem,4.15vw,5.45rem)]"
          >
            <span className="block">{copy.title}</span>
            <span className="mt-[0.08em] block text-white/72">
              {copy.italicTitle}
            </span>
          </h1>

          {copy.description ? (
            <p
              id="about-hero-description"
              className={`${estedad.className} mt-5 max-w-[520px] text-pretty text-[12px] font-normal leading-[1.9] text-white/62 sm:mt-6 sm:text-[13px] sm:leading-7 md:text-[13px] lg:text-[14px] lg:leading-8`}
            >
              {copy.description}
            </p>
          ) : null}

          {copy.action ? (
            <div className="mt-7 w-full max-w-[220px] sm:mt-8 sm:max-w-[235px]">
              <Button
                href={localizedHref(copy.action.href, locale)}
                variant="outline"
                size="lg"
                icon={<ActionIcon />}
                fullWidth
              >
                {copy.action.label}
              </Button>
            </div>
          ) : null}
        </header>
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-x-[6vw] bottom-5 hidden items-center gap-4 md:flex"
      >
        <span className="whitespace-nowrap text-[7px] font-medium tracking-[0.08em] text-white/28">
          {copy.bottomLabel}
        </span>
        <span className="h-px flex-1 bg-white/10" />
        <span className="whitespace-nowrap text-[7px] tracking-[0.08em] text-white/28">
          {copy.bottomBrand}
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
        if (!entry?.isIntersecting) return;
        requestAnimationFrame(() => setRevealed(true));
        observer.disconnect();
      },
      { threshold: 0.1 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, revealed };
}
