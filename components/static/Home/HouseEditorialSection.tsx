import Image from "next/image";
import Link from "next/link";

import { type CSSProperties, useId } from "react";

import { ArrowLeftIcon, Button } from "@/components/ui/Button";

import type { HomeCopy } from "@/lib/i18n/home-copy";

import {
  getHtmlLang,
  getLocaleDirection,
  type Locale,
} from "@/lib/i18n/config";

import { localizedHref } from "@/lib/i18n/routes";

import { brandColors, themeClasses } from "@/theme/theme-colors";

/* ==========================================================================
   TYPES
============================================================================ */

type HouseEditorialSectionProps = {
  copy: HomeCopy["houseEditorial"];
  locale: Locale;

  imageSrc: string;

  mobileImagePosition?: string;
  desktopImagePosition?: string;

  imageStoryId?: string;
  className?: string;
};

/* ==========================================================================
   COMPONENT
============================================================================ */

export function HouseEditorialSection({
  copy,
  locale,
  imageSrc,
  mobileImagePosition = "60% center",
  desktopImagePosition = "center",
  imageStoryId,
  className = "",
}: HouseEditorialSectionProps) {
  const visibleFeatures = copy.features.slice(0, 3);

  const headingId = useId();

  const direction = getLocaleDirection(locale);
  const htmlLang = getHtmlLang(locale);

  const themeVars = {
    "--house-black": brandColors.black.hex,
    "--house-black-rgb": brandColors.black.rgb,
    "--house-white": brandColors.white.hex,
    "--house-copper": brandColors.copper.hex,
    "--house-mobile-position": mobileImagePosition,
    "--house-desktop-position": desktopImagePosition,
  } as CSSProperties;

  const hasBothActions = Boolean(copy.primaryAction && copy.secondaryAction);

  return (
    <section
      dir={direction}
      lang={htmlLang}
      aria-labelledby={headingId}
      data-image-story-id={imageStoryId}
      data-image-story-url={imageSrc}
      style={themeVars}
      className={`relative isolate w-full overflow-hidden bg-[var(--house-black)] text-[var(--house-white)] ${className}`}
    >
      <Image
        src={imageSrc}
        alt={copy.imageAlt}
        fill
        sizes="100vw"
        loading="lazy"
        draggable={false}
        className="-z-30 object-cover object-[var(--house-mobile-position)] md:object-[var(--house-desktop-position)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgb(var(--house-black-rgb)/0.26)_0%,rgb(var(--house-black-rgb)/0.12)_34%,rgb(var(--house-black-rgb)/0.26)_68%,rgb(var(--house-black-rgb)/0.78)_100%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgb(var(--house-black-rgb)/0.14)_0%,rgb(var(--house-black-rgb)/0.12)_34%,rgb(var(--house-black-rgb)/0.28)_68%,rgb(var(--house-black-rgb)/0.78)_100%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgb(var(--house-black-rgb)/0.10)_44%,rgb(var(--house-black-rgb)/0.38)_120%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-4 z-0 border border-white/[0.07] sm:inset-6 lg:inset-8"
      />

      <div className="relative z-10 mx-auto flex min-h-[720px] w-full max-w-[1540px] flex-col items-center justify-center px-5 py-16 sm:min-h-[760px] sm:px-8 sm:py-20 lg:min-h-[min(900px,100svh)] lg:px-12 lg:py-24 xl:px-14">
        <header className="mx-auto flex w-full max-w-[820px] flex-col items-center text-center">
          {copy.eyebrow ? (
            <div className="flex items-center justify-center gap-3">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-[var(--house-copper)]"
              />

              <p className="text-[10px] font-medium leading-none text-white/64 sm:text-[11px]">
                {copy.eyebrow}
              </p>

              <span
                aria-hidden="true"
                className="h-px w-8 bg-[var(--house-copper)]"
              />
            </div>
          ) : null}

          <h2
            id={headingId}
            className="mx-auto mt-5 max-w-[760px] text-balance text-[clamp(2.75rem,11vw,4.7rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-white [text-shadow:0_5px_30px_rgb(var(--house-black-rgb)/0.36)] sm:text-[clamp(3.5rem,8vw,5.4rem)] md:text-[clamp(4rem,6vw,6.25rem)] lg:text-[clamp(4.35rem,5vw,6.45rem)]"
          >
            {copy.title}
          </h2>

          {copy.description ? (
            <p className="mx-auto mt-5 max-w-[590px] text-pretty text-[12px] leading-7 text-white/68 sm:mt-6 sm:text-[13px] md:text-[14px] md:leading-8">
              {copy.description}
            </p>
          ) : null}

          {(copy.primaryAction || copy.secondaryAction) && (
            <div
              className={`mx-auto mt-7 grid w-full gap-2.5 sm:mt-8 sm:gap-3 ${
                hasBothActions
                  ? "max-w-[480px] grid-cols-1 min-[430px]:grid-cols-2"
                  : "max-w-[230px] grid-cols-1"
              }`}
            >
              {copy.primaryAction ? (
                <Button
                  href={localizedHref(copy.primaryAction.href, locale)}
                  variant="cream"
                  size="lg"
                  icon={<ArrowLeftIcon />}
                  iconPosition="right"
                  fullWidth
                  className="!tracking-normal"
                >
                  {copy.primaryAction.label}
                </Button>
              ) : null}

              {copy.secondaryAction ? (
                <Button
                  href={localizedHref(copy.secondaryAction.href, locale)}
                  variant="outline"
                  size="lg"
                  icon={<ArrowLeftIcon />}
                  iconPosition="right"
                  fullWidth
                  className="border-white/40 bg-black/15 !tracking-normal text-white backdrop-blur-[5px] hover:border-white hover:bg-white hover:text-black"
                >
                  {copy.secondaryAction.label}
                </Button>
              ) : null}
            </div>
          )}
        </header>

        {visibleFeatures.length ? (
          <nav
            aria-label={copy.navAriaLabel}
            className="mx-auto mt-10 w-full max-w-[1020px] border-y border-white/[0.12] bg-black/[0.18] backdrop-blur-[8px] sm:mt-12 lg:mt-14"
          >
            <div className="grid grid-cols-1 md:grid-cols-3">
              {visibleFeatures.map((feature) => (
                <FeatureItem
                  key={feature.id}
                  feature={feature}
                  locale={locale}
                />
              ))}
            </div>
          </nav>
        ) : null}
      </div>
    </section>
  );
}

/* ==========================================================================
   FEATURE ITEM
============================================================================ */

function FeatureItem({
  feature,
  locale,
}: {
  feature: HomeCopy["houseEditorial"]["features"][number];
  locale: Locale;
}) {
  const direction = getLocaleDirection(locale);
  const isRtl = direction === "rtl";

  return (
    <Link
      href={localizedHref(feature.href, locale)}
      className={`group relative flex min-h-[128px] flex-col items-center justify-center gap-3 border-b border-white/10 px-5 py-6 text-center transition-[background-color,border-color] duration-300 last:border-b-0 hover:border-white/[0.16] hover:bg-white/[0.045] md:min-h-[156px] md:border-b-0 md:border-l md:px-6 md:py-6 md:last:border-l-0 ${themeClasses.focusRing}`}
    >
      <span className="grid size-10 shrink-0 place-items-center border border-white/20 text-white/70 transition-[border-color,background-color,color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:border-[var(--house-copper)]/65 group-hover:bg-[var(--house-copper)]/[0.07] group-hover:text-[var(--house-copper)] md:size-11">
        <FeatureIcon type={feature.icon} />
      </span>

      <span className="min-w-0">
        <span className="block text-[16px] font-semibold leading-[1.45] tracking-[-0.025em] text-white md:text-[17px]">
          {feature.title}
        </span>

        <span className="mx-auto mt-1.5 block max-w-[250px] text-[10px] leading-5 text-white/48 md:mt-2 md:max-w-[220px] md:text-[10.5px]">
          {feature.description}
        </span>
      </span>

      <span
        aria-hidden="true"
        className={`inline-flex text-white/38 transition-[color,transform] duration-300 group-hover:text-white ${
          isRtl
            ? "rotate-180 group-hover:-translate-x-1"
            : "group-hover:translate-x-1"
        }`}
      >
        <ArrowIcon />
      </span>

      <span
        aria-hidden="true"
        className="absolute bottom-0 right-0 h-px w-0 bg-[var(--house-copper)] transition-[width] duration-500 ease-out group-hover:w-full"
      />
    </Link>
  );
}

/* ==========================================================================
   FEATURE ICON
============================================================================ */

function FeatureIcon({
  type,
}: {
  type: HomeCopy["houseEditorial"]["features"][number]["icon"];
}) {
  if (type === "tailoring") return <TailoringIcon />;
  if (type === "fragrance") return <FragranceIcon />;

  return <StoryIcon />;
}
/* ==========================================================================
   ICONS
============================================================================ */

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4">
      <path
        d="M2.5 8H13M9.5 4.5L13 8L9.5 11.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function TailoringIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="size-5 md:size-6"
    >
      <path
        d="M12 6L9 9L7 14L10 26H22L25 14L23 9L20 6L17 9H15L12 6Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="miter"
      />
      <path
        d="M15 9L13 15L16 18L19 15L17 9"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="miter"
      />
      <path d="M16 18V26" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function FragranceIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="size-5 md:size-6"
    >
      <path d="M11 12H21V26H11V12Z" stroke="currentColor" strokeWidth="1" />
      <path d="M13 8H19V12H13V8Z" stroke="currentColor" strokeWidth="1" />
      <path
        d="M14 5H18"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="square"
      />
    </svg>
  );
}

function StoryIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="size-5 md:size-6"
    >
      <rect
        x="8"
        y="6"
        width="16"
        height="20"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M12 11H20M12 15H20M12 19H17"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="square"
      />
    </svg>
  );
}
