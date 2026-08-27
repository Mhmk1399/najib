"use client";

import { type CSSProperties, useId, useState } from "react";

import { brandColors, lightTokens } from "@/theme/theme-colors";

import { Button } from "@/components/ui/Button";

/* ==========================================================================
   TYPES
============================================================================ */

type BrandStorySectionProps = {
  eyebrow?: string;

  title?: string;

  text?: string;

  readMoreLabel?: string;

  readLessLabel?: string;

  defaultExpanded?: boolean;

  className?: string;
};

/* ==========================================================================
   DEFAULT BRAND COPY
============================================================================ */

const DEFAULT_BRAND_TEXT = `
Najibzadeh is a contemporary house shaped by a belief that true elegance is never loud. 
Our world is built around considered tailoring, distinctive fragrance and objects chosen for their character, material and permanence. 
We are drawn to pieces that feel relevant today yet remain meaningful long after the season has passed. 
Every detail begins with intention, from the proportion of a garment to the texture of a fabric and the atmosphere created by a scent. 
For us, luxury is found in restraint, precision and the confidence to remove what is unnecessary. 
We value craftsmanship not as decoration, but as the foundation of everything we create. 
Our approach brings together traditional knowledge and a modern point of view, allowing familiar forms to feel new again. 
Clothing is designed to become part of a person's life rather than simply occupy a wardrobe. 
Fragrance is treated as an extension of presence, capable of holding memory and creating a quiet impression. 
The objects within the Najibzadeh world are selected with the same attention to balance, function and enduring beauty. 
We believe personal style grows stronger when it is built slowly and with purpose. 
That philosophy shapes the way we think about materials, silhouettes, color and the experience surrounding every product. 
Najibzadeh is not defined by excess or constant change, but by a consistent pursuit of quality and character. 
It is a house for those who appreciate detail without needing it to announce itself. 
Everything we create is intended to feel personal, lasting and quietly unmistakable.
`
  .replace(/\s+/g, " ")
  .trim();

/* ==========================================================================
   COMPONENT
============================================================================ */

export function BrandStorySection({
  eyebrow = "The House",

  title = "The world of Najibzadeh.",

  text = DEFAULT_BRAND_TEXT,

  readMoreLabel = "Read Our Story",

  readLessLabel = "Show Less",

  defaultExpanded = false,

  className = "",
}: BrandStorySectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const contentId = useId();

  const themeVars = {
    "--story-bg": lightTokens.surfaceBrand,

    "--story-text": brandColors.black.hex,

    "--story-muted": lightTokens.textMuted,

    "--story-copper": brandColors.copper.hex,
  } as CSSProperties;

  return (
    <section
      style={themeVars}
      className={`
        w-full

        bg-[var(--story-bg)]
        text-[var(--story-text)]

        ${className}
      `}
    >
      <div
        className="
          mx-auto

          w-full
          max-w-[1100px]

          px-6

          py-16

          sm:px-8
          sm:py-20

          lg:px-10
          lg:py-28
        "
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div
          className="
            mx-auto

            flex
            max-w-[760px]

            flex-col
            items-center

            text-center
          "
        >
          {/* =================================================
              EYEBROW

              Copper فقط همینجا.
          ================================================= */}

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

              text-[var(--story-copper)]

              sm:text-[8px]
            "
          >
            <span
              className="
                h-px
                w-5

                bg-[var(--story-copper)]
              "
            />

            <span>{eyebrow}</span>

            <span
              className="
                h-px
                w-5

                bg-[var(--story-copper)]
              "
            />
          </div>

          {/* =================================================
              TITLE
          ================================================= */}

          <h2
            className="
              max-w-[760px]

              font-serif

              text-[clamp(2.8rem,10vw,4.3rem)]
              font-normal

              leading-[0.96]
              tracking-[-0.05em]

              text-[var(--story-text)]

              sm:text-[clamp(3.4rem,7vw,4.8rem)]

              lg:text-[clamp(4rem,4.8vw,5.6rem)]
            "
          >
            {title}
          </h2>
        </div>

        {/* =====================================================
            STORY
        ====================================================== */}

        <div
          className="
            mx-auto

            mt-8

            max-w-[820px]

            sm:mt-10

            lg:mt-12
          "
        >
          <div
            id={contentId}
            className="
              relative
              overflow-hidden

              transition-[max-height]
              duration-700

              ease-[cubic-bezier(0.22,1,0.36,1)]
            "
            style={{
              /*
               * حالت بسته:
               *
               * حدود 3 خط کامل
               * + مقداری از خط چهارم
               */
              maxHeight: expanded ? "1200px" : "7.2rem",
            }}
          >
            <p
              className="
                text-[12px]
                font-normal

                leading-[2rem]

                text-[var(--story-muted)]

                sm:text-[13px]

                lg:text-[14px]
                lg:leading-[2.05rem]
              "
            >
              {text}
            </p>

            {/* =================================================
                COLLAPSED GRADIENT

                باعث می‌شود کمی از خط چهارم دیده شود
                و بعد به background محو شود.
            ================================================= */}

            <div
              aria-hidden="true"
              className={`
                pointer-events-none

                absolute
                inset-x-0
                bottom-0

                h-[3.3rem]

                bg-gradient-to-b
                from-transparent
                via-[var(--story-bg)]/70
                to-[var(--story-bg)]

                transition-opacity
                duration-300

                ${
                  expanded
                    ? `
                      opacity-0
                    `
                    : `
                      opacity-100
                    `
                }
              `}
            />
          </div>

          {/* =====================================================
              DIVIDER
          ====================================================== */}

          <div
            className="
              mt-7

              flex
              items-center

              gap-4

              sm:mt-8
            "
          >
            <span
              className="
                h-px
                flex-1

                bg-black/10
              "
            />

            <span
              className="
                text-[6px]
                font-medium

                uppercase
                tracking-[0.22em]

                text-black/35
              "
            >
              Najibzadeh
            </span>

            <span
              className="
                h-px
                flex-1

                bg-black/10
              "
            />
          </div>

          {/* =====================================================
              ACTION
          ====================================================== */}

          <div
            className="
              mt-7

              flex
              justify-center
            "
          >
            <Button
              type="button"
              variant="black"
              size="md"
              aria-expanded={expanded}
              aria-controls={contentId}
              onClick={() => {
                setExpanded((current) => !current);
              }}
            >
              {expanded ? readLessLabel : readMoreLabel}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
