import { type CSSProperties } from "react";

import { brandColors, lightTokens } from "@/theme/theme-colors";

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

We are drawn to pieces that feel relevant today yet remain meaningful long after the season has passed. Every detail begins with intention, from the proportion of a garment to the texture of a fabric and the atmosphere created by a scent.

For us, luxury is found in restraint, precision and the confidence to remove what is unnecessary. We value craftsmanship not as decoration, but as the foundation of everything we create.

Our approach brings together traditional knowledge and a modern point of view, allowing familiar forms to feel new again. Clothing is designed to become part of a person's life rather than simply occupy a wardrobe.

Fragrance is treated as an extension of presence, capable of holding memory and creating a quiet impression. The objects within the Najibzadeh world are selected with the same attention to balance, function and enduring beauty.

We believe personal style grows stronger when it is built slowly and with purpose. That philosophy shapes the way we think about materials, silhouettes, color and the experience surrounding every product.

Najibzadeh is not defined by excess or constant change, but by a consistent pursuit of quality and character. It is a house for those who appreciate detail without needing it to announce itself.

Everything we create is intended to feel personal, lasting and quietly unmistakable.
`.trim();

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
  const paragraphs = splitStoryText(text);
  const previewParagraphs = paragraphs.slice(0, Math.min(2, paragraphs.length));
  const remainingParagraphs = paragraphs.slice(previewParagraphs.length);

  const themeVars = {
    "--story-bg": lightTokens.surfaceBrand,
    "--story-text": brandColors.black.hex,
    "--story-muted": lightTokens.textMuted,
    "--story-copper": brandColors.copper.hex,
  } as CSSProperties;

  return (
    <section
      style={themeVars}
      aria-labelledby="brand-story-title"
      className={`w-full bg-[var(--story-bg)] text-[var(--story-text)] ${className}`}
    >
      <div className="mx-auto w-full max-w-[980px] px-6 py-16 text-center sm:px-8 sm:py-20 lg:px-10 lg:py-28">
        <header className="mx-auto flex max-w-[780px] flex-col items-center">
          {eyebrow ? (
            <div className="mb-5 flex flex-col items-center gap-3 sm:mb-6">
              <span
                aria-hidden="true"
                className="h-px w-6 bg-[var(--story-copper)]"
              />
              <p className="text-[7px] font-semibold uppercase tracking-[0.24em] text-[var(--story-copper)] sm:text-[8px]">
                {eyebrow}
              </p>
            </div>
          ) : null}

          <h2
            id="brand-story-title"
            className="max-w-[760px] font-serif text-[clamp(2.9rem,10vw,4.3rem)] font-normal leading-[0.96] tracking-[-0.05em] text-[var(--story-text)] sm:text-[clamp(3.5rem,7vw,4.9rem)] lg:text-[clamp(4rem,4.7vw,5.5rem)]"
          >
            {title}
          </h2>
        </header>

        {previewParagraphs.length ? (
          <div className="mx-auto mt-7 max-w-[720px] space-y-4 sm:mt-9 sm:space-y-5 lg:mt-10">
            {previewParagraphs.map((paragraph, index) => (
              <p
                key={`${paragraph.slice(0, 36)}-${index}`}
                className="text-[12px] font-normal leading-[1.9] text-[var(--story-muted)] sm:text-[13px] lg:text-[14px]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}

        {remainingParagraphs.length ? (
          <details
            open={defaultExpanded}
            className="group mx-auto max-w-[760px]"
          >
            <summary className="mx-auto mt-8 flex w-fit cursor-pointer list-none items-center justify-center gap-3 border-b border-black/15 pb-2 text-[7px] font-semibold uppercase tracking-[0.18em] text-black/58 transition-[border-color,color] duration-200 hover:border-[var(--story-copper)] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15 focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--story-bg)] sm:mt-9 sm:text-[8px] [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">{readMoreLabel}</span>
              <span className="hidden group-open:inline">{readLessLabel}</span>
              <span
                aria-hidden="true"
                className="relative block h-px w-5 bg-black/30 transition-colors duration-200 group-hover:bg-[var(--story-copper)]"
              />
            </summary>

            <div className="mx-auto mt-8 space-y-4 border-t border-black/[0.08] pt-8 sm:mt-9 sm:space-y-5 sm:pt-9 lg:mt-10 lg:pt-10">
              {remainingParagraphs.map((paragraph, index) => (
                <p
                  key={`${paragraph.slice(0, 36)}-${index}`}
                  className="text-[12px] font-normal leading-[1.9] text-[var(--story-muted)] sm:text-[13px] lg:text-[14px]"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </details>
        ) : null}
      </div>
    </section>
  );
}

/* ========================================================================== 
   STORY TEXT NORMALIZATION
============================================================================ */

function splitStoryText(text: string) {
  const normalized = text.trim();

  if (!normalized) return [];

  const explicitParagraphs = normalized
    .split(/\n\s*\n+/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (explicitParagraphs.length > 1) {
    return explicitParagraphs;
  }

  const sentences =
    normalized
      .replace(/\s+/g, " ")
      .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
      ?.map((sentence) => sentence.trim())
      .filter(Boolean) ?? [];

  if (sentences.length <= 3) {
    return sentences.length ? [sentences.join(" ")] : [normalized];
  }

  const paragraphs: string[] = [];

  for (let index = 0; index < sentences.length; index += 2) {
    paragraphs.push(sentences.slice(index, index + 2).join(" "));
  }

  return paragraphs;
}
