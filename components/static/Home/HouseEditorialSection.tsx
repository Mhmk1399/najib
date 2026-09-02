import Image from "next/image";
import Link from "next/link";

import { type CSSProperties } from "react";

import { brandColors, themeClasses } from "@/theme/theme-colors";
import { ArrowRightIcon, Button } from "@/components/ui/Button";

/* ========================================================================== 
   TYPES
============================================================================ */

type HouseAction = {
  label: string;
  href: string;
};

type HouseFeature = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: "tailoring" | "fragrance" | "story";
};

type HouseEditorialSectionProps = {
  imageSrc: string;
  imageAlt?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryAction?: HouseAction;
  secondaryAction?: HouseAction;
  features?: HouseFeature[];
  mobileImagePosition?: string;
  desktopImagePosition?: string;
  className?: string;
};

/* ========================================================================== 
   DATA
============================================================================ */

const defaultFeatures: HouseFeature[] = [
  {
    id: "tailoring",
    title: "Tailoring",
    description: "Discover suiting and knitwear",
    href: "/tailoring",
    icon: "tailoring",
  },
  {
    id: "fragrance",
    title: "Fragrance",
    description: "Explore signature scents",
    href: "/fragrance",
    icon: "fragrance",
  },
  {
    id: "story",
    title: "Our Story",
    description: "The values behind the house",
    href: "/our-story",
    icon: "story",
  },
];

/* ========================================================================== 
   HELPERS
============================================================================ */

function headingIdFromTitle(title: string) {
  const normalized = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `house-editorial-${normalized || "section"}`;
}

/* ========================================================================== 
   COMPONENT
============================================================================ */

export function HouseEditorialSection({
  imageSrc,
  imageAlt = "",
  eyebrow = "New Season",
  title = "Tailored for the memorable.",
  description = "Timeless tailoring. Distinctive fragrance. Objects made with intention, for a life well-lived.",
  primaryAction = {
    label: "Explore Collection",
    href: "/collections",
  },
  secondaryAction = {
    label: "Discover the House",
    href: "/our-story",
  },
  features = defaultFeatures,
  mobileImagePosition = "60% center",
  desktopImagePosition = "center",
  className = "",
}: HouseEditorialSectionProps) {
  const visibleFeatures = features.slice(0, 3);
  const headingId = headingIdFromTitle(title);

  const themeVars = {
    "--house-black": brandColors.black.hex,
    "--house-black-rgb": brandColors.black.rgb,
    "--house-white": brandColors.white.hex,
    "--house-copper": brandColors.copper.hex,
    "--house-mobile-position": mobileImagePosition,
    "--house-desktop-position": desktopImagePosition,
  } as CSSProperties;

  return (
    <section
      aria-labelledby={headingId}
      style={themeVars}
      className={`relative isolate w-full overflow-hidden bg-[var(--house-black)] text-[var(--house-white)] ${className}`}
    >
      {/* Background media */}
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        sizes="100vw"
        loading="lazy"
        draggable={false}
        className="-z-30 object-cover object-[var(--house-mobile-position)] md:object-[var(--house-desktop-position)]"
      />

      {/* Restrained contrast layers keep the photography present. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgb(var(--house-black-rgb)/0.28)_0%,rgb(var(--house-black-rgb)/0.16)_32%,rgb(var(--house-black-rgb)/0.25)_66%,rgb(var(--house-black-rgb)/0.72)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgb(var(--house-black-rgb)/0.04)_0%,rgb(var(--house-black-rgb)/0.10)_46%,rgb(var(--house-black-rgb)/0.38)_118%)]"
      />

      <div className="relative z-10 mx-auto flex min-h-[720px] w-full max-w-[1440px] flex-col items-center justify-center px-5 py-16 text-center sm:min-h-[760px] sm:px-8 sm:py-20 lg:min-h-[min(900px,100svh)] lg:px-12 lg:py-24">
        {/* Main editorial statement */}
        <header className="mx-auto flex w-full max-w-[860px] flex-col items-center">
          <p className="flex items-center justify-center gap-3 text-[7px] font-semibold uppercase tracking-[0.22em] text-white/64 sm:text-[8px]">
            <span
              aria-hidden="true"
              className="h-px w-6 bg-[var(--house-copper)]"
            />
            <span>{eyebrow}</span>
            <span
              aria-hidden="true"
              className="h-px w-6 bg-[var(--house-copper)]"
            />
          </p>

          <h2
            id={headingId}
            className="mt-5 max-w-[820px] font-serif text-[clamp(3rem,12vw,4.6rem)] font-normal leading-[0.94] tracking-[-0.052em] text-white sm:text-[clamp(3.8rem,9vw,5.4rem)] md:text-[clamp(4.4rem,6.4vw,6.6rem)]"
          >
            {title}
          </h2>

          {description ? (
            <p className="mt-6 max-w-[500px] text-[11px] font-normal leading-[1.75] text-white/68 sm:text-[12px] md:mt-7 md:text-[13px]">
              {description}
            </p>
          ) : null}

          {(primaryAction || secondaryAction) && (
            <div
              className={`mt-8 grid w-full gap-2 sm:w-auto sm:min-w-[460px] sm:grid-cols-2 ${
                primaryAction && secondaryAction ? "grid-cols-1" : "grid-cols-1"
              }`}
            >
              {primaryAction ? (
                <Button
                  href={primaryAction.href}
                  variant="cream"
                  size="lg"
                  icon={<ArrowRightIcon />}
                  fullWidth
                >
                  {primaryAction.label}
                </Button>
              ) : null}

              {secondaryAction ? (
                <Button
                  href={secondaryAction.href}
                  variant="outline"
                  size="lg"
                  icon={<ArrowRightIcon />}
                  fullWidth
                  className="border-white/40 bg-black/18 text-white backdrop-blur-[6px] hover:border-white hover:bg-white hover:text-black"
                >
                  {secondaryAction.label}
                </Button>
              ) : null}
            </div>
          )}
        </header>

        {/* Minimal discovery rail: one responsive DOM, centered in every viewport. */}
        {visibleFeatures.length ? (
          <nav
            aria-label="Explore the House"
            className="mt-12 w-full max-w-[980px] border-y border-white/14 bg-black/22 backdrop-blur-[8px] sm:mt-14 lg:mt-16"
          >
            <div className="grid grid-cols-1 md:grid-cols-3">
              {visibleFeatures.map((feature) => (
                <FeatureItem key={feature.id} feature={feature} />
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

function FeatureItem({ feature }: { feature: HouseFeature }) {
  return (
    <Link
      href={feature.href}
      className={`group relative flex min-h-[118px] items-center justify-center gap-4 border-b border-white/10 px-6 py-5 text-left transition-colors duration-300 last:border-b-0 hover:bg-white/[0.045] md:min-h-[142px] md:flex-col md:gap-3 md:border-b-0 md:border-r md:px-5 md:text-center md:last:border-r-0 ${themeClasses.focusRing}`}
    >
      <span className="grid size-9 shrink-0 place-items-center border border-white/20 text-white/70 transition-[border-color,background-color,color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:border-white/65 group-hover:bg-white group-hover:text-black md:size-10">
        <FeatureIcon type={feature.icon} />
      </span>

      <span className="min-w-0">
        <span className="block font-serif text-[15px] font-normal leading-none tracking-[-0.02em] text-white md:text-[16px]">
          {feature.title}
        </span>
        <span className="mt-2 block text-[8px] leading-[1.55] text-white/45 md:mx-auto md:max-w-[180px] md:text-[9px]">
          {feature.description}
        </span>
      </span>

      <span
        aria-hidden="true"
        className="ml-auto text-white/38 transition-[color,transform] duration-300 group-hover:translate-x-1 group-hover:text-white md:absolute md:bottom-4 md:left-1/2 md:ml-0 md:-translate-x-1/2 md:group-hover:translate-x-[calc(-50%+4px)]"
      >
        <ArrowIcon />
      </span>
    </Link>
  );
}

/* ========================================================================== 
   FEATURE ICON
============================================================================ */

function FeatureIcon({ type }: { type: HouseFeature["icon"] }) {
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
