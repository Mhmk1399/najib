import Link from "next/link";

import { type CSSProperties } from "react";

import type { HomeCopy } from "@/lib/i18n/home-copy";
import {
  getHtmlLang,
  getLocaleDirection,
  type Locale,
} from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/routes";
import { estedad } from "@/next-persian-fonts/estedad";
import { brandColors } from "@/theme/theme-colors";

type AboutBrandSectionProps = {
  copy: HomeCopy["whyChooseUs"];
  locale: Locale;

  /**
   * Kept only for backwards compatibility with the old component API.
   * This minimal version intentionally renders no image.
   */
  backgroundImage?: string;
  backgroundPosition?: string;
  className?: string;
};

const ABOUT_THEME_VARS = {
  "--about-brand-black": brandColors.black.hex,
  "--about-brand-copper": brandColors.copper.hex,
  "--about-brand-paper": "#F4F0E8",
  "--about-brand-paper-soft": "#F8F6F1",
  "--about-brand-line": "rgb(17 16 15 / 0.12)",
  "--about-brand-muted": "rgb(17 16 15 / 0.56)",
  "--about-brand-soft": "rgb(17 16 15 / 0.38)",
} as CSSProperties;

function formatPrincipleIndex(index: number, locale: Locale) {
  return new Intl.NumberFormat(getHtmlLang(locale), {
    minimumIntegerDigits: 2,
    useGrouping: false,
  }).format(index);
}

/**
 * Minimal, image-free brand / about section.
 *
 * The export name is intentionally kept as `WhyChooseUsSection` so this file
 * can replace the previous component without changing existing imports.
 */
export function WhyChooseUsSection({
  copy,
  locale,
  className = "",
}: AboutBrandSectionProps) {
  const visibleFeatures = copy.features.slice(0, 6);
  const direction = getLocaleDirection(locale);
  const htmlLang = getHtmlLang(locale);

  if (!visibleFeatures.length) return null;

  return (
    <section
      dir={direction}
      lang={htmlLang}
      aria-labelledby="najibzadeh-about-title"
      style={ABOUT_THEME_VARS}
      className={`relative w-full overflow-hidden bg-[var(--about-brand-paper)] text-[var(--about-brand-black)] ${className}`}
    >
      <div className="mx-auto w-full max-w-[1600px] px-5 py-10 sm:px-8 sm:py-12 lg:px-12  xl:px-14 ">
        {/* INTRO */}
        <header className="   border-t border-[var(--about-brand-line)] pt-6 sm:pt-7   lg:gap-16 lg:pt-8">
          <div className="  flex   gap-6 items-center justify-between ">
            <h2
              id="najibzadeh-about-title"
              className="max-w-[900px] text-balance text-lg font-semibold leading-[1.02] tracking-[-0.045em]   lg:text-4xl"
            >
              {copy.title}
            </h2>

            {copy.description ? (
              <p
                className={`mt-6 max-w-[720px] text-pretty text-[9px] leading-7 text-[var(--about-brand-muted)] sm:text-[13px] sm:leading-8 lg:mt-7 lg:text-[14px] ${estedad.className}`}
              >
                {copy.description}
              </p>
            ) : null}
          </div>
        </header>

        {/* PRINCIPLES */}
        <div className="mt-12 border-y border-[var(--about-brand-line)] sm:mt-14 lg:mt-16">
          <ol className="grid list-none grid-cols-1 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {visibleFeatures.map((feature, index) => (
              <li
                key={feature.id}
                className="group relative min-w-0 border-b border-[var(--about-brand-line)] px-0 py-7 last:border-b-0 sm:min-h-[220px] sm:px-6 sm:py-8 sm:[&:nth-child(odd)]:border-e sm:[&:nth-last-child(-n+2)]:border-b-0 lg:min-h-[238px] lg:px-8 lg:py-9 lg:[&:nth-child(odd)]:border-e-0 lg:[&:not(:nth-child(3n))]:border-e lg:[&:nth-last-child(-n+3)]:border-b-0"
              >
                <article className="flex h-full flex-col justify-between gap-8">
                  <div className="flex items-center justify-between gap-5">
                    <span
                      aria-hidden="true"
                      className="h-px w-7 bg-black/15 transition-[width,background-color] duration-300 group-hover:w-12 group-hover:bg-[var(--about-brand-copper)] motion-reduce:transition-none"
                    />
                  </div>

                  <div>
                    <h3 className="max-w-[360px] text-balance text-[18px] font-semibold leading-[1.35] tracking-[-0.025em] sm:text-[19px] lg:text-[20px]">
                      {feature.title}
                    </h3>

                    <p
                      className={`mt-3 max-w-[420px] text-pretty text-[11px] leading-6 text-[var(--about-brand-muted)] sm:text-[12px] sm:leading-7 ${estedad.className}`}
                    >
                      {feature.description}
                    </p>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/**
 * Optional semantic alias for new imports.
 */
export const AboutBrandSection = WhyChooseUsSection;

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="size-3.5"
    >
      <path
        d="M13.5 8H3M6.5 4.5L3 8L6.5 11.5"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
