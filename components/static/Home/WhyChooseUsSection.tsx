import Image from "next/image";

import { type CSSProperties } from "react";

import { brandColors } from "@/theme/theme-colors";
import { ArrowRightIcon, Button } from "@/components/ui/Button";

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

export type WhyChooseFeature = {
  id: string;
  title: string;
  description: string;
  icon: FeatureIcon;
};

type WhyChooseUsSectionProps = {
  backgroundImage?: string;
  backgroundImageAlt?: string;
  backgroundPosition?: string;
  eyebrow?: string;
  title?: string;
  italicTitle?: string;
  description?: string;
  features?: WhyChooseFeature[];
  action?: {
    label: string;
    href: string;
  };
  className?: string;
};

/* ========================================================================== 
   DATA
============================================================================ */

const DEFAULT_FEATURES: WhyChooseFeature[] = [
  {
    id: "quality",
    title: "Uncompromising Quality",
    description:
      "Exceptional materials carefully selected for their character and durability.",
    icon: "quality",
  },
  {
    id: "craftsmanship",
    title: "Considered Craftsmanship",
    description:
      "Traditional techniques refined through time, executed with intent.",
    icon: "craftsmanship",
  },
  {
    id: "experience",
    title: "Thoughtful Experience",
    description:
      "From discovery to delivery, every touchpoint is designed around you.",
    icon: "experience",
  },
  {
    id: "responsibility",
    title: "Responsible Luxury",
    description: "We choose better materials and mindful processes.",
    icon: "responsibility",
  },
  {
    id: "exclusive",
    title: "Exclusive, Not Excessive",
    description: "Limited quantities. Timeless designs. No unnecessary noise.",
    icon: "exclusive",
  },
  {
    id: "lasting",
    title: "Made to Last",
    description:
      "Crafted to be worn, lived in, and remembered for years to come.",
    icon: "lasting",
  },
];

/* ========================================================================== 
   COMPONENT
============================================================================ */

export function WhyChooseUsSection({
  backgroundImage = "/assets/images/whyus.webp",
  backgroundImageAlt = "",
  backgroundPosition = "center",
  eyebrow = "Why Choose Najibzadeh",
  title = "Beyond fashion.",
  italicTitle = "A standard of distinction.",
  description = "Every choice we make is guided by purpose, precision and a belief that true luxury should endure.",
  features = DEFAULT_FEATURES,
  action = {
    label: "Discover Our Story",
    href: "/our-story",
  },
  className = "",
}: WhyChooseUsSectionProps) {
  const visibleFeatures = features.slice(0, 6);

  if (!visibleFeatures.length) return null;

  const themeVars = {
    "--why-copper": brandColors.copper.hex,
    "--why-black": "#0B0B0B",
    "--why-cream": "#F6F2EB",
  } as CSSProperties;

  return (
    <section
      style={themeVars}
      className={`relative isolate w-full overflow-hidden bg-[var(--why-black)] text-white ${className}`}
    >
      <Image
        src={backgroundImage}
        alt={backgroundImageAlt}
        fill
        sizes="100vw"
        loading="lazy"
        draggable={false}
        style={{ objectPosition: backgroundPosition }}
        className="-z-30 object-cover"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(8,8,8,0.36)_0%,rgba(8,8,8,0.50)_42%,rgba(8,8,8,0.88)_100%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_center,transparent_18%,rgba(0,0,0,0.30)_110%)]"
      />

      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center px-5 py-20 text-center sm:px-8 sm:py-24 lg:px-10 lg:py-28 xl:px-14 xl:py-32">
        <header className="flex max-w-[760px] flex-col items-center">
          {eyebrow ? (
            <div className="flex items-center justify-center gap-3 text-[7px] font-semibold uppercase tracking-[0.24em] text-white/58 sm:text-[8px]">
              <span
                aria-hidden="true"
                className="h-px w-5 bg-[var(--why-copper)]"
              />
              <span>{eyebrow}</span>
              <span
                aria-hidden="true"
                className="h-px w-5 bg-[var(--why-copper)]"
              />
            </div>
          ) : null}

          <h2 className="mt-5 font-serif font-normal text-white sm:mt-6">
            <span className="block text-[clamp(2.9rem,10vw,4.6rem)] leading-[0.94] tracking-[-0.05em] sm:text-[clamp(3.7rem,8vw,5.4rem)] lg:text-[clamp(4.6rem,5.6vw,6.4rem)]">
              {title}
            </span>
            <span className="mt-2 block text-[clamp(1.9rem,6.8vw,3.1rem)] italic leading-[1] tracking-[-0.04em] text-[var(--why-cream)]/72 sm:mt-3 sm:text-[clamp(2.4rem,5vw,3.5rem)] lg:text-[clamp(2.9rem,3.4vw,4rem)]">
              {italicTitle}
            </span>
          </h2>

          {description ? (
            <p className="mt-5 max-w-[520px] text-[11px] leading-[1.8] text-white/62 sm:mt-6 sm:text-[12px] lg:text-[13px]">
              {description}
            </p>
          ) : null}

          {action ? (
            <div className="mt-7 w-full max-w-[226px] sm:mt-8">
              <Button
                href={action.href}
                variant="cream"
                size="md"
                icon={<ArrowRightIcon />}
                fullWidth
              >
                {action.label}
              </Button>
            </div>
          ) : null}
        </header>

        <div className="mt-14 w-full max-w-[1180px] border-l border-t border-white/1 sm:mt-16 lg:mt-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {visibleFeatures.map((feature) => (
              <FeatureCard key={feature.id} feature={feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== 
   FEATURE CARD
============================================================================ */

function FeatureCard({ feature }: { feature: WhyChooseFeature }) {
  return (
    <article className="group relative flex min-h-[154px] flex-col items-center justify-center border-b border-r border-white/[0.14] bg-black/[0.10] px-6 py-7 text-center transition-colors duration-300 hover:bg-white/[0.035] sm:min-h-[168px] sm:px-7 lg:min-h-[190px] lg:px-8 lg:py-8">
      <span className="grid size-9 place-items-center border border-white/22 text-white/68 transition-[border-color,color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:border-[var(--why-copper)]/70 group-hover:text-[var(--why-copper)] lg:size-10">
        <FeatureIcon type={feature.icon} />
      </span>

      <h3 className="mt-4 max-w-[280px] font-serif text-[17px] font-normal leading-[1.08] tracking-[-0.025em] text-white sm:text-[18px] lg:mt-5 lg:text-[19px]">
        {feature.title}
      </h3>

      <span
        aria-hidden="true"
        className="mt-4 h-px w-7 bg-white/24 transition-[width,background-color] duration-300 group-hover:w-10 group-hover:bg-[var(--why-copper)]/65"
      />

      <p className="mt-4 max-w-[300px] text-[10px] leading-[1.7] text-white/48 sm:text-[10.5px] lg:text-[11px]">
        {feature.description}
      </p>
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
