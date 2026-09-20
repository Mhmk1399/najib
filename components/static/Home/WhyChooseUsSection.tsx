import Image from "next/image";
import { type CSSProperties } from "react";

import { ArrowLeftIcon, Button } from "@/components/ui/Button";

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
  backgroundImage = "/assets/images/whyus.webp",
  backgroundPosition = "center",
  className = "",
}: WhyChooseUsSectionProps) {
  const visibleFeatures = copy.features.slice(0, 6);

  if (!visibleFeatures.length) return null;

  const direction = getLocaleDirection(locale);
  const htmlLang = getHtmlLang(locale);

  const themeVars = {
    "--why-copper": brandColors.copper.hex,
    "--why-black": "#0B0B0B",
    "--why-cream": "#F6F2EB",
  } as CSSProperties;

  return (
    <section
      dir={direction}
      lang={htmlLang}
      style={themeVars}
      className={`relative isolate w-full overflow-hidden bg-[var(--why-black)] text-white ${className}`}
    >
      <Image
        src={backgroundImage}
        alt={copy.backgroundImageAlt}
        fill
        sizes="100vw"
        loading="lazy"
        draggable={false}
        style={{ objectPosition: backgroundPosition }}
        className="-z-30 object-cover"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(7,7,7,0.36)_0%,rgba(7,7,7,0.48)_42%,rgba(7,7,7,0.90)_100%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(6,6,6,0.15)_0%,rgba(6,6,6,0.18)_42%,rgba(6,6,6,0.90)_100%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.12)_42%,rgba(0,0,0,0.42)_115%)]"
      />

      <div className="mx-auto w-full max-w-[1540px] px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28 xl:px-14 xl:py-32">
        <header className="mx-auto flex max-w-[760px] flex-col items-center text-center">
          {copy.eyebrow ? (
            <div className="flex items-center justify-center gap-3">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-[var(--why-copper)]"
              />

              <p className="text-[10px] font-medium leading-none text-white/58 sm:text-[11px]">
                {copy.eyebrow}
              </p>

              <span
                aria-hidden="true"
                className="h-px w-8 bg-[var(--why-copper)]"
              />
            </div>
          ) : null}

          <h2 className="mt-5 sm:mt-6">
            <span className="block text-balance text-[clamp(2.7rem,10vw,4.6rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-white sm:text-[clamp(3.6rem,7vw,5.5rem)] lg:text-[clamp(4.2rem,5.2vw,6.2rem)]">
              {copy.title}
            </span>

            <span className="mt-2 block text-balance text-[clamp(1.65rem,6vw,2.8rem)] font-medium leading-[1.3] tracking-[-0.035em] text-[var(--why-cream)]/72 sm:mt-3 sm:text-[clamp(2rem,4.5vw,3.3rem)] lg:text-[clamp(2.4rem,3vw,3.7rem)]">
              {copy.italicTitle}
            </span>
          </h2>

          {copy.description ? (
            <p className="mx-auto mt-5 max-w-[610px] text-pretty text-[12px] leading-7 text-white/62 sm:mt-6 sm:text-[13px] md:text-[14px] md:leading-8">
              {copy.description}
            </p>
          ) : null}

          {copy.action ? (
            <div className="mx-auto mt-7 w-full max-w-[230px] sm:mt-8">
              <Button
                href={localizedHref(copy.action.href, locale)}
                variant="cream"
                size="md"
                icon={<ArrowLeftIcon />}
                iconPosition="right"
                fullWidth
                className="!tracking-normal"
              >
                {copy.action.label}
              </Button>
            </div>
          ) : null}
        </header>

        <div className="mt-14 w-full border-r border-t border-white/[0.12] sm:mt-16 lg:mt-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {visibleFeatures.map((feature) => (
              <FeatureCard key={feature.id} feature={feature} />
            ))}
          </div>
        </div>

        <div
          aria-hidden="true"
          className="mt-8 flex items-center justify-center gap-3 text-white/24 sm:mt-10"
        >
          <span className="text-[7px] font-medium tracking-[0.22em]">
            NAJIBZADEH
          </span>

          <span className="h-px w-10 bg-current" />
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   FEATURE CARD
============================================================================ */

function FeatureCard({
  feature,
}: {
  feature: HomeCopy["whyChooseUs"]["features"][number];
}) {
  return (
    <article className="group relative flex min-h-[162px] flex-col items-center justify-center border-b border-l border-white/[0.12] bg-black/[0.10] px-6 py-7 text-center backdrop-blur-[1px] transition-[background-color,border-color] duration-300 hover:border-white/[0.18] hover:bg-white/[0.035] sm:min-h-[178px] sm:px-7 lg:min-h-[198px] lg:px-8 lg:py-9">
      <div className="flex w-full flex-col items-center justify-center gap-4">
        <span className="grid size-10 shrink-0 place-items-center border border-white/20 text-white/66 transition-[border-color,color,transform,background-color] duration-300 group-hover:-translate-y-0.5 group-hover:border-[var(--why-copper)]/70 group-hover:bg-[var(--why-copper)]/[0.06] group-hover:text-[var(--why-copper)]">
          <FeatureIcon type={feature.icon} />
        </span>

        <span
          aria-hidden="true"
          className="h-px w-10 bg-white/[0.12] transition-[width,background-color] duration-300 group-hover:w-14 group-hover:bg-[var(--why-copper)]/35"
        />
      </div>

      <h3 className="mt-5 max-w-[300px] text-[18px] font-semibold leading-[1.45] tracking-[-0.025em] text-white sm:text-[19px] lg:text-[20px]">
        {feature.title}
      </h3>

      <p className="mt-3 max-w-[330px] text-[11px] leading-6 text-white/48 sm:text-[11.5px] lg:text-[12px]">
        {feature.description}
      </p>

      <span
        aria-hidden="true"
        className="absolute bottom-0 right-0 h-px w-0 bg-[var(--why-copper)] transition-[width] duration-500 ease-out group-hover:w-full"
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
