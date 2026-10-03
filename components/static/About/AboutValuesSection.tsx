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
      id="about-values"
      ref={ref}
      style={themeVars}
      dir={direction}
      lang={htmlLang}
      aria-labelledby="about-values-title"
      aria-describedby="about-values-description"
      className={`relative isolate min-h-[92svh] w-full overflow-hidden bg-[var(--values-black)] text-white md:min-h-[100svh] ${className}`}
    >
      <Image
        src={imageSrc}
        alt={copy.imageAlt}
        fill
        sizes="100vw"
        loading="lazy"
        draggable={false}
        className="-z-30 object-cover object-[var(--mobile-position)] md:object-[var(--desktop-position)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgb(var(--values-black-rgb)/0.12)_0%,rgb(var(--values-black-rgb)/0.30)_44%,rgb(var(--values-black-rgb)/0.92)_100%)] md:bg-[linear-gradient(90deg,rgb(var(--values-black-rgb)/0.74)_0%,rgb(var(--values-black-rgb)/0.46)_42%,rgb(var(--values-black-rgb)/0.26)_66%,rgb(var(--values-black-rgb)/0.54)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_48%,transparent_28%,rgb(var(--values-black-rgb)/0.34)_120%)]"
      />

      <div className="relative z-10 flex min-h-[92svh] items-end px-5 pb-12 pt-24 sm:px-8 sm:pb-16 md:min-h-[100svh] md:items-center md:px-[6vw] md:py-20 lg:px-[7vw]">
        <div
          className={`w-full max-w-[700px] text-start transition-[opacity,transform] duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            revealed ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="mb-4 flex items-center gap-3 text-[var(--values-copper)] sm:mb-5">
            <span aria-hidden="true" className="h-px w-6 bg-current sm:w-8" />
            <span className="text-[8px] font-semibold tracking-[0.11em] sm:text-[9px]">
              {copy.eyebrow}
            </span>
          </div>

          <h2
            id="about-values-title"
            className="max-w-[760px] text-balance text-[clamp(2.2rem,9.5vw,3.35rem)] font-normal leading-[1.06] tracking-[-0.04em] text-white sm:text-[clamp(2.7rem,6.8vw,3.95rem)] md:text-[clamp(3.15rem,4.25vw,4.65rem)] xl:text-[clamp(3.55rem,3.85vw,5rem)]"
          >
            <span className="block">{copy.title}</span>
            <span className="mt-[0.08em] block text-white/70">
              {copy.italicTitle}
            </span>
          </h2>

          <p
            id="about-values-description"
            className={`${estedad.className} mt-5 max-w-[540px] text-pretty text-[12px] font-normal leading-[1.9] text-white/60 sm:mt-6 sm:text-[13px] sm:leading-7 lg:text-[14px] lg:leading-8`}
          >
            {copy.description}
          </p>

          <blockquote className="mt-7 max-w-[560px] border-s border-white/18 ps-5 sm:mt-8 sm:ps-6">
            <p
              className={`${estedad.className} text-pretty text-[15px] font-normal leading-[1.9] text-white/78 sm:text-[16px] md:text-[17px]`}
            >
              {copy.quote}
            </p>
            <footer className="mt-4">
              <cite className="not-italic text-[10px] font-medium tracking-[0.04em] text-white/42 sm:text-[11px]">
                {copy.signature}
              </cite>
            </footer>
          </blockquote>

          {copy.action ? (
            <div className="mt-7 w-full max-w-[220px] sm:mt-8 sm:max-w-[235px]">
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

      <div
        aria-hidden="true"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-center md:block"
      >
        <p className="whitespace-nowrap text-[7px] font-medium tracking-[0.08em] text-white/28">
          {copy.bottomDetail}
        </p>
        <span className="mx-auto mt-3 block h-px w-14 bg-white/14" />
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
      { threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, revealed };
}
