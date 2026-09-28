import Image from "next/image";
import { type CSSProperties } from "react";

import { ArrowLeftIcon, ArrowRightIcon, Button } from "@/components/ui/Button";

import type { HomeCopy } from "@/lib/i18n/home-copy";

import {
  getHtmlLang,
  getLocaleDirection,
  type Locale,
} from "@/lib/i18n/config";

import { localizedHref } from "@/lib/i18n/routes";

import { brandColors } from "@/theme/theme-colors";

/* ==========================================================================
   TYPES
============================================================================ */

type FeatureIcon =
  | "quality"
  | "craftsmanship"
  | "experience"
  | "responsibility"
  | "exclusive"
  | "lasting";

type WhyChooseUsSectionProps = {
  copy: HomeCopy["whyChooseUs"];
  locale: Locale;
  backgroundImage?: string;
  backgroundPosition?: string;
  className?: string;
};

/* ==========================================================================
   COMPONENT
============================================================================ */

export function WhyChooseUsSection({
  copy,
  locale,
  backgroundImage = "/assets/images/p4.webp",
  backgroundPosition = "center",
  className = "",
}: WhyChooseUsSectionProps) {
  const visibleFeatures = copy.features.slice(0, 6);

  if (!visibleFeatures.length) return null;

  const direction = getLocaleDirection(locale);
  const htmlLang = getHtmlLang(locale);
  const isRtl = direction === "rtl";
  const ActionIcon = isRtl ? ArrowLeftIcon : ArrowRightIcon;

  const themeVars = {
    "--why-copper": brandColors.copper.hex,
    "--why-black-rgb": brandColors.black.rgb,
    "--why-black": "#0B0B0B",
    "--why-cream": "#F6F2EB",
    "--why-image-position": backgroundPosition,
  } as CSSProperties;

  return (
    <section
      dir={direction}
      lang={htmlLang}
      style={themeVars}
      className={`relative isolate w-full overflow-hidden bg-[var(--why-black)] text-white ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_14%_12%,rgba(193,84,39,0.12),transparent_28%),radial-gradient(circle_at_86%_84%,rgba(255,255,255,0.07),transparent_30%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-white/[0.14]"
      />

      <div className="mx-auto w-full max-w-[1760px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 xl:px-10 ">
        <header className="grid gap-8 border-b border-white/[0.10] pb-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(420px,0.58fr)] lg:items-center lg:gap-12 lg:pb-12">
          <div className="min-w-0">
            <h2 className="mt-5 max-w-[900px] text-balance text-[clamp(3rem,12vw,5.8rem)] font-semibold leading-[1.02] tracking-[-0.055em] sm:text-[clamp(3.8rem,8vw,6.4rem)] lg:text-[clamp(4rem,5.1vw,6.9rem)]">
              {copy.title}
            </h2>
          </div>

          <div className="max-w-[560px] lg:pb-2">
            <p className="text-balance text-[clamp(1.5rem,5vw,2.75rem)] font-medium leading-[1.22] tracking-[-0.04em] text-[var(--why-cream)]/76 lg:text-[clamp(2rem,2.55vw,3.35rem)]">
              {copy.italicTitle}
            </p>

            {copy.description ? (
              <p className="mt-5 text-pretty text-[12px] leading-7 text-white/58 sm:text-[13px] lg:text-[14px] lg:leading-8">
                {copy.description}
              </p>
            ) : null}
          </div>
        </header>

        <div className="mt-5 grid overflow-hidden border border-white/[0.10] bg-white/[0.035] lg:mt-6 lg:grid-cols-[minmax(0,0.96fr)_minmax(420px,0.74fr)]">
          <figure className="relative isolate min-h-[520px] overflow-hidden bg-white/[0.06] lg:min-h-[720px]">
            <Image
              src={backgroundImage}
              alt={copy.backgroundImageAlt}
              fill
              sizes="(max-width: 1023px) 100vw, 58vw"
              loading="lazy"
              draggable={false}
              className="-z-30  object-[var(--why-image-position)]"
            />

            <div
              aria-hidden="true"
              className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgb(var(--why-black-rgb)/0.08)_0%,rgb(var(--why-black-rgb)/0.18)_44%,rgb(var(--why-black-rgb)/0.82)_100%)]"
            />

            <figcaption className="absolute inset-x-5 bottom-5 sm:inset-x-7 sm:bottom-7 lg:inset-x-8 lg:bottom-8">
              <p className="flex items-center gap-2 text-[8px] font-medium text-white/56 sm:text-[9px]">
                <span aria-hidden="true" className="h-px w-7 bg-white/40" />
                NAJIBZADEH ATELIER
              </p>

              <p className="mt-3 max-w-[720px] text-balance text-[clamp(2.3rem,10vw,5rem)] font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:text-[clamp(3.2rem,7vw,6rem)] lg:text-[clamp(3.4rem,4.8vw,6.5rem)]">
                {copy.italicTitle}
              </p>
            </figcaption>
          </figure>

          <div className="border-t border-white/[0.10] lg:border-s lg:border-t-0 lg:border-white/[0.10]">
            <div className="grid">
              {visibleFeatures.map((feature, index) => (
                <FeatureRow
                  key={feature.id}
                  feature={feature}
                  index={index}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   FEATURE CARD
============================================================================ */

function FeatureRow({
  feature,
  index,
  locale,
}: {
  feature: HomeCopy["whyChooseUs"]["features"][number];
  index: number;
  locale: Locale;
}) {
  return (
    <article className="group grid min-h-[132px] grid-cols-[44px_minmax(0,1fr)] gap-4 border-b border-white/[0.10] bg-white/[0.015] px-4 py-5 transition-[background-color,border-color] duration-300 last:border-b-0 hover:border-white/[0.18] hover:bg-white/[0.045] sm:grid-cols-[54px_minmax(0,1fr)] sm:gap-5 sm:px-6 sm:py-6 lg:min-h-[120px] xl:px-7">
      <div className="flex flex-col items-center gap-3">
       

        <span className="grid size-10 shrink-0 place-items-center border border-white/[0.16] text-white/62 transition-[border-color,color,background-color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:border-[var(--why-copper)]/70 group-hover:bg-[var(--why-copper)]/[0.08] group-hover:text-[var(--why-copper)]">
          <FeatureIcon type={feature.icon} />
        </span>
      </div>

      <div className="min-w-0">
        <h3 className="text-balance text-[18px] font-semibold leading-[1.35] tracking-[-0.03em] text-white sm:text-[20px] lg:text-[21px]">
          {feature.title}
        </h3>

        <p className="mt-2 max-w-[520px] text-pretty text-[11px] leading-6 text-white/48 sm:text-[12px] lg:text-[12.5px] lg:leading-7">
          {feature.description}
        </p>
      </div>

      <span
        aria-hidden="true"
        className="col-span-2 h-px w-0 bg-[var(--why-copper)] transition-[width] duration-500 ease-out group-hover:w-full"
      />
    </article>
  );
}

/* ==========================================================================
   ICON SWITCH
============================================================================ */

function FeatureIcon({ type }: { type: FeatureIcon }) {
  switch (type) {
    case "quality":
      return <QualityIcon />;

    case "craftsmanship":
      return <CraftsmanshipIcon />;

    case "experience":
      return <ExperienceIcon />;

    case "responsibility":
      return <ResponsibilityIcon />;

    case "exclusive":
      return <ExclusiveIcon />;

    case "lasting":
      return <LastingIcon />;

    default:
      return null;
  }
}

/* ==========================================================================
   ICONS
============================================================================ */

function QualityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
      <path
        d="M12 3L15 9L21 10L16.5 14.5L17.5 21L12 18L6.5 21L7.5 14.5L3 10L9 9L12 3Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function CraftsmanshipIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
      <path
        d="M7 4L4 8L6 20H18L20 8L17 4L14 7H10L7 4Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="miter"
      />

      <path
        d="M10 7L9 12L12 15L15 12L14 7"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function ExperienceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
      <path d="M4 8H20V20H4V8Z" stroke="currentColor" strokeWidth="1" />

      <path d="M8 8V5H16V8" stroke="currentColor" strokeWidth="1" />

      <path d="M12 8V20M4 12H20" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function ResponsibilityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
      <path d="M12 21V11" stroke="currentColor" strokeWidth="1" />

      <path
        d="M12 13C8 13 5 10 5 6C9 6 12 8 12 13Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="miter"
      />

      <path
        d="M12 10C15 10 18 8 19 4C15 4 12 6 12 10Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function ExclusiveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
      <path
        d="M4 8L7 18H17L20 8L15 12L12 5L9 12L4 8Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="miter"
      />

      <path d="M7 21H17" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function LastingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
      <path d="M7 3H17M7 21H17" stroke="currentColor" strokeWidth="1" />

      <path
        d="M8 3C8 7 10 9 12 12C14 9 16 7 16 3"
        stroke="currentColor"
        strokeWidth="1"
      />

      <path
        d="M8 21C8 17 10 15 12 12C14 15 16 17 16 21"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}
