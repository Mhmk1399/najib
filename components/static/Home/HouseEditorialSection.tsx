import Image from "next/image";
import Link from "next/link";

import { type CSSProperties } from "react";

import { brandColors, themeClasses } from "@/theme/theme-colors";
import { ArrowLeftIcon, Button } from "@/components/ui/Button";

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
  imageStoryId?: string;
  className?: string;
};

/* ==========================================================================
   DATA
============================================================================ */

const defaultFeatures: HouseFeature[] = [
  {
    id: "tailoring",
    title: "خیاطی نجیب‌زاده",
    description: "کت‌وشلوار، بافت و پوشاکی که با دقت شکل گرفته‌اند.",
    href: "/tailoring",
    icon: "tailoring",
  },
  {
    id: "fragrance",
    title: "عطرهای امضادار",
    description: "رایحه‌هایی متمایز برای حضوری که در خاطر می‌ماند.",
    href: "/fragrance",
    icon: "fragrance",
  },
  {
    id: "story",
    title: "داستان ما",
    description: "نگاهی به ارزش‌ها، نگاه و جهان پشت خانه نجیب‌زاده.",
    href: "/about-us",
    icon: "story",
  },
];

/* ==========================================================================
   HELPERS
============================================================================ */

function headingIdFromTitle(title: string) {
  const normalized = title
    .trim()
    .toLocaleLowerCase("fa")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return `house-editorial-${normalized || "section"}`;
}

/* ==========================================================================
   COMPONENT
============================================================================ */

export function HouseEditorialSection({
  imageSrc,
  imageAlt = "",
  eyebrow = "فصل تازه",
  title = "برای لحظه‌هایی که در خاطر می‌مانند.",
  description = "خیاطی ماندگار، رایحه‌های متمایز و انتخاب‌هایی سنجیده؛ برای سبک زندگی‌ای که کیفیت را در جزئیات تعریف می‌کند.",
  primaryAction = {
    label: "مشاهده مجموعه",
    href: "/shop",
  },
  secondaryAction = {
    label: "کشف خانه نجیب‌زاده",
    href: "/about-us",
  },
  features = defaultFeatures,
  mobileImagePosition = "60% center",
  desktopImagePosition = "center",
  imageStoryId,
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
      dir="rtl"
      lang="fa"
      aria-labelledby={headingId}
      data-image-story-id={imageStoryId}
      data-image-story-url={imageSrc}
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

      {/* Balanced tonal field for the centered composition. */}
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

      {/* Very quiet frame to give the campaign image a refined editorial edge. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-4 z-0 border border-white/[0.07] sm:inset-6 lg:inset-8"
      />

      <div className="relative z-10 mx-auto flex min-h-[720px] w-full max-w-[1540px] flex-col items-center justify-center px-5 py-16 sm:min-h-[760px] sm:px-8 sm:py-20 lg:min-h-[min(900px,100svh)] lg:px-12 lg:py-24 xl:px-14">
        {/* Main editorial statement */}
        <header className="mx-auto flex w-full max-w-[820px] flex-col items-center text-center">
          {eyebrow ? (
            <div className="flex items-center justify-center gap-3">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-[var(--house-copper)]"
              />

              <p className="text-[10px] font-medium leading-none text-white/64 sm:text-[11px]">
                {eyebrow}
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
            {title}
          </h2>

          {description ? (
            <p className="mx-auto mt-5 max-w-[590px] text-pretty text-[12px] leading-7 text-white/68 sm:mt-6 sm:text-[13px] md:text-[14px] md:leading-8">
              {description}
            </p>
          ) : null}

          {(primaryAction || secondaryAction) && (
            <div
              className={`mx-auto mt-7 grid w-full gap-2.5 sm:mt-8 sm:gap-3 ${
                primaryAction && secondaryAction
                  ? "max-w-[480px] grid-cols-1 min-[430px]:grid-cols-2"
                  : "max-w-[230px] grid-cols-1"
              }`}
            >
              {primaryAction ? (
                <Button
                  href={primaryAction.href}
                  variant="cream"
                  size="lg"
                   icon={
                         <ArrowLeftIcon />
                     }
                    iconPosition="right"
                  fullWidth
                  className="!tracking-normal"
                >
                  {primaryAction.label}
                </Button>
              ) : null}

              {secondaryAction ? (
                <Button
                  href={secondaryAction.href}
                  variant="outline"
                  size="lg"
                     icon={
                         <ArrowLeftIcon />
                     }
                    iconPosition="right"
                  fullWidth
                  className="border-white/40 bg-black/15 !tracking-normal text-white backdrop-blur-[5px] hover:border-white hover:bg-white hover:text-black"
                >
                  {secondaryAction.label}
                </Button>
              ) : null}
            </div>
          )}
        </header>

        {/* Discovery rail */}
        {visibleFeatures.length ? (
          <nav
            aria-label="بخش‌های خانه نجیب‌زاده"
            className="mx-auto mt-10 w-full max-w-[1020px] border-y border-white/[0.12] bg-black/[0.18] backdrop-blur-[8px] sm:mt-12 lg:mt-14"
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
        className="inline-flex rotate-180 text-white/38 transition-[color,transform] duration-300 group-hover:-translate-x-1 group-hover:text-white"
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
