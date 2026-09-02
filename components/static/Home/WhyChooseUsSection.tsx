"use client";

import Image from "next/image";

import { type CSSProperties, useEffect, useRef, useState } from "react";

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
  backgroundImage: string;

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
      "Exceptional materials are selected for their character, performance and ability to become more personal with time.",

    icon: "quality",
  },

  {
    id: "craftsmanship",

    title: "Considered Craftsmanship",

    description:
      "Traditional knowledge meets a contemporary point of view, with every proportion, seam and finish approached with intention.",

    icon: "craftsmanship",
  },

  {
    id: "experience",

    title: "Thoughtful Experience",

    description:
      "From discovery to delivery, every interaction is designed to feel calm, personal and unmistakably Najibzadeh.",

    icon: "experience",
  },

  {
    id: "responsibility",

    title: "Responsible Luxury",

    description:
      "We favour considered production, enduring materials and pieces intended to remain relevant beyond a single season.",

    icon: "responsibility",
  },

  {
    id: "exclusive",

    title: "Exclusive, Not Excessive",

    description:
      "Luxury is expressed through restraint, distinction and considered choices rather than unnecessary abundance.",

    icon: "exclusive",
  },

  {
    id: "lasting",

    title: "Made to Last",

    description:
      "Objects are created to age beautifully, gather memory and become a meaningful part of your personal story.",

    icon: "lasting",
  },
];

/* ==========================================================================
   COMPONENT
============================================================================ */

export function WhyChooseUsSection({
  backgroundImage="/assets/images/whyus.webp",

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
  const { ref, revealed } = useRevealOnce<HTMLElement>();

  const visibleFeatures = features.slice(0, 6);

  const themeVars = {
    "--why-copper": brandColors.copper.hex,

    "--why-black-rgb": brandColors.black.rgb,

    "--why-position": backgroundPosition,
  } as CSSProperties;

  if (!visibleFeatures.length) {
    return null;
  }

  return (
    <section
      ref={ref}
      style={themeVars}
      className={`
        relative
        isolate

        w-full
        overflow-hidden

        bg-black
        text-white

        ${className}
      `}
    >
      {/* =====================================================
          FULL BACKGROUND IMAGE
      ====================================================== */}

      <Image
        src={backgroundImage}
        alt={backgroundImageAlt}
        fill
        sizes="100vw"
        loading="lazy"
        draggable={false}
        style={{
          objectPosition: backgroundPosition,
        }}
        className="
          -z-40

          object-cover

          scale-[1.01]
        "
      />

      {/* =====================================================
          GLOBAL DARK TREATMENT
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0
          -z-30

          bg-black/5
        "
      />

      {/* Slight cinematic tonal layer */}

     

      {/* subtle vignette */}

      

      {/* =====================================================
          INNER
      ====================================================== */}

      <div
        className="
          mx-auto

          w-full
          max-w-[1600px]

          px-5

          py-20

          sm:px-8
          sm:py-24

          lg:px-10
          lg:py-28

          xl:px-14
          xl:py-32
        "
      >
        {/* =================================================
            INTRO
        ================================================= */}

        <div
          className={`
            mx-auto

            flex
            max-w-[900px]

            flex-col
            items-center

            text-center

            transition-[opacity,transform]
            duration-[900ms]

            ease-[cubic-bezier(0.22,1,0.36,1)]

            ${
              revealed
                ? `
                  translate-y-0
                  opacity-100
                `
                : `
                  translate-y-8
                  opacity-0
                `
            }
          `}
        >
          {/* ===============================================
              EYEBROW

              تنها استفاده Copper.
          ================================================ */}
{/* 
          <div
            className="
              mb-5

              flex
              items-center
              justify-center

              gap-3

              text-[7px]
              font-semibold

              uppercase
              tracking-[0.24em]

              text-[var(--why-copper)]

              sm:text-[8px]
            "
          >
            <span>{eyebrow}</span>
          </div> */}

        
          {/* ===============================================
              TITLE
          ================================================ */}

          <h2
            className="
              flex

              max-w-[900px]

              flex-col
              items-center

              font-serif

              text-[clamp(3rem,10vw,4.7rem)]
              font-normal

              leading-[0.92]
              tracking-[-0.055em]

              text-white

              

              lg:text-[clamp(4.8rem,5.2vw,6.7rem)]
            "
          >
            <span>{title}</span>

            <span
              className="
                mt-[0.12em]

                italic

                text-white/78
              "
            >
              {italicTitle}
            </span>
          </h2>

          {/* ===============================================
              DESCRIPTION
          ================================================ */}

          {description && (
            <p
              className="
                mt-6

                max-w-[530px]

                text-[9px]
                font-normal

                leading-[1.8]

                text-white/58

                sm:text-[10px]

                lg:mt-7
                lg:text-[11px]
              "
            >
              {description}
            </p>
          )}
        </div>

        {/* =================================================
            GRID
        ================================================= */}

        <div
          className={`
            mt-14

            grid

             

            border-l
            border-t
            border-white/15

            transition-[opacity,transform]
            duration-[1000ms]

            ease-[cubic-bezier(0.22,1,0.36,1)]

            grid-cols-2

            lg:mt-16
            lg:grid-cols-6

            ${
              revealed
                ? `
                  translate-y-0
                  opacity-100

                  delay-150
                `
                : `
                  translate-y-12
                  opacity-0
                `
            }
          `}
        >
          {visibleFeatures.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>

        {/* =================================================
            BOTTOM
        ================================================= */}

        {action && (
          <div
            className={`
              flex

              flex-col
              items-center

              border-x
              border-b
              border-white/15

              px-6
              py-10

              text-center

              transition-[opacity,transform]
              duration-[900ms]

              lg:flex-row
              lg:justify-between

              lg:px-10
              lg:py-11

              lg:text-left

              ${
                revealed
                  ? `
                    translate-y-0
                    opacity-100

                    delay-300
                  `
                  : `
                    translate-y-6
                    opacity-0
                  `
              }
            `}
          >
            <div>
              <p
                className="
                  text-[7px]
                  font-semibold

                  uppercase
                  tracking-[0.2em]

                  text-white/40
                "
              >
                The Najibzadeh Standard
              </p>

              <p
                className="
                  mt-3

                  max-w-[540px]

                  font-serif

                  text-[clamp(1.8rem,5vw,2.8rem)]

                  leading-[1.03]
                  tracking-[-0.04em]

                  text-white
                "
              >
                Created with purpose.
                <br />
                Remembered for character.
              </p>
            </div>

            <div
              className="
                mt-7

                w-full
                max-w-[260px]

                lg:mt-0
              "
            >
              <Button
                href={action.href}
                variant="cream"
                size="lg"
                icon={<ArrowRightIcon />}
                fullWidth
              >
                {action.label}
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ==========================================================================
   FEATURE CARD
============================================================================ */

function FeatureCard({
  feature,

  index,
}: {
  feature: WhyChooseFeature;

  index: number;
}) {
  return (
    <article
      className="
        group

        relative

        flex

        min-h-[230px]

        flex-col
        items-center
        justify-center

        overflow-hidden

        border-b
        border-r
        border-white/15

        bg-black/10

        px-7
        py-6

        text-center

        backdrop-blur-[1px]

        transition-[background-color]
        duration-500

        hover:bg-white/[0.055]

        

        lg:min-h-[380px]
        lg:px-10

       
      "
    >
      {/* =================================================
          VERY SUBTLE HOVER GLOW
      ================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0

          opacity-0

          bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.07)_0%,transparent_67%)]

          transition-opacity
          duration-500

          group-hover:opacity-100
        "
      />

      {/* =================================================
          INDEX
      ================================================= */}

      
      {/* =================================================
          ICON
      ================================================= */}

      <span
        className="
          relative

          grid size-8
          md:size-10


          place-items-center

          border
          border-white/25

          text-white/65

          transition-[background-color,border-color,color,transform]
          duration-300

          group-hover:-translate-y-1

          group-hover:border-white/70
          group-hover:bg-white
          group-hover:text-black
        "
      >
        <FeatureIcon type={feature.icon} />
      </span>

      {/* =================================================
          TITLE
      ================================================= */}

      <h3
        className="
          relative

          mt-4

          max-w-[310px]

          font-serif
text-sm
          md:text-lg
          font-normal
 text-nowrap
          leading-[1.05]
          tracking-[-0.035em]

          text-white

          transition-transform
          duration-500

          group-hover:-translate-y-1
        "
      >
        {feature.title}
      </h3>

      {/* =================================================
          HAIRLINE
      ================================================= */}

      <span
        aria-hidden="true"
        className="
          relative

          mt-5

          h-px
          w-8

          bg-white/30

          transition-[width,background-color]
          duration-500

          group-hover:w-14
          group-hover:bg-white/70
        "
      />

      {/* =================================================
          DESCRIPTION
      ================================================= */}

      <p
        className="
          relative

          mt-5

          max-w-[290px]
text-[8px]
          md:text-[9px]

          md:leading-[1.8]

          text-white/52

         
        "
      >
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
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
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
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
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
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
      <path d="M4 8H20V20H4V8Z" stroke="currentColor" strokeWidth="1" />

      <path d="M8 8V5H16V8" stroke="currentColor" strokeWidth="1" />

      <path d="M12 8V20M4 12H20" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function ResponsibilityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
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
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
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
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
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

/* ==========================================================================
   REVEAL
============================================================================ */

function useRevealOnce<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotion.matches) {
      setRevealed(true);

      return;
    }

    if (!("IntersectionObserver" in window)) {
      setRevealed(true);

      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        requestAnimationFrame(() => {
          setRevealed(true);
        });

        observer.disconnect();
      },

      {
        threshold: 0.08,

        rootMargin: "0px 0px -5% 0px",
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return {
    ref,
    revealed,
  };
}
