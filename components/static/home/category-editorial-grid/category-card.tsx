// ─────────────────────────────────────────────────────────────────────────────
// Category Editorial Grid — Category Card
//
// Server Component. No state. No event handlers. No router.
// CSS hover transitions only. One next/image. One Next.js Link.
// ─────────────────────────────────────────────────────────────────────────────

import Image from "next/image";
import Link from "next/link";
import type {
  CategoryGridItem,
  CategoryGridObjectPosition,
  CategoryGridPosition,
} from "./category-editorial-grid.types";

// ── Static class maps — no dynamic Tailwind fragments ─────────────────────────

const OBJECT_POSITION_CLASSES: Record<CategoryGridObjectPosition, string> = {
  center: "object-center",
  top: "object-top",
  bottom: "object-bottom",
  left: "object-left",
  right: "object-right",
  "center-left": "object-[35%_50%]",
  "center-right": "object-[65%_50%]",
};

// Mobile height per position
const MOBILE_HEIGHT_CLASSES: Record<CategoryGridPosition, string> = {
  featured: "min-h-[480px]",
  "top-wide": "min-h-[260px] sm:min-h-[340px]",
  "top-small": "min-h-[260px] sm:min-h-[340px]",
  "bottom-small": "min-h-[260px] sm:min-h-[340px]",
  "bottom-wide": "min-h-[260px] sm:min-h-[340px]",
};

// Image sizes per position
const IMAGE_SIZES_CLASSES: Record<CategoryGridPosition, string> = {
  featured: "(max-width: 1023px) 100vw, 42vw",
  "top-wide": "(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 30vw",
  "top-small": "(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 30vw",
  "bottom-small": "(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 30vw",
  "bottom-wide": "(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 30vw",
};

// Whether description is shown per position
const SHOW_DESCRIPTION: Record<CategoryGridPosition, boolean> = {
  featured: true,
  "top-wide": false,
  "top-small": false,
  "bottom-small": false,
  "bottom-wide": false,
};

// ── Small helper ──────────────────────────────────────────────────────────────

function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ── Inline arrow SVG — RTL-aware via prop ─────────────────────────────────────

function ArrowIcon({ isRtl }: { isRtl: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn(
        isRtl ? "rotate-180" : "",
        "transition-transform duration-300 ease-out",
        "group-hover/card:translate-x-1",
        "motion-reduce:transform-none",
      )}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

type CategoryCardProps = {
  category: CategoryGridItem;
  isRtl: boolean;
};

export function CategoryCard({ category, isRtl }: CategoryCardProps) {
  const objectPositionClass =
    OBJECT_POSITION_CLASSES[category.objectPosition ?? "center"];
  const mobileHeightClass = MOBILE_HEIGHT_CLASSES[category.position];
  const imageSizes = IMAGE_SIZES_CLASSES[category.position];
  const showDescription = SHOW_DESCRIPTION[category.position];

  return (
    <article className="w-full h-full">
      <div className="w-full h-full">
        <Link
          href={category.href}
          aria-label={category.title}
          prefetch={false}
          className={cn(
            "group/card",
            "block w-full h-full",
            "relative overflow-hidden",
            "rounded-sm",
            "border border-black/10 dark:border-white/10",
            mobileHeightClass,
            // Focus ring — copper, no outline
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-[#A94420]",
            "dark:focus-visible:ring-[#E18A68]",
            "focus-visible:ring-offset-0",
          )}
        >
          <figure className="relative w-full h-full m-0">
            {/* ── Image container ───────────────────────────────── */}
            <div className="absolute inset-0">
              <Image
                src={category.image.src}
                alt={category.image.alt}
                fill
                sizes={imageSizes}
                quality={80}
                loading="lazy"
                draggable={false}
                className={cn(
                  "object-cover",
                  objectPositionClass,
                  // Grayscale on desktop, color on mobile
                  "lg:grayscale",
                  "lg:group-hover/card:grayscale-0",
                  "lg:group-focus-visible/card:grayscale-0",
                  // Subtle scale
                  "transition-[filter,transform]",
                  "duration-700",
                  "ease-out",
                  "group-hover/card:scale-[1.025]",
                  // Reduced motion
                  "motion-reduce:transition-none",
                  "motion-reduce:transform-none",
                )}
              />

              {/* Uniform overlay — readability only */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-black/35 pointer-events-none"
              />
            </div>

            {/* ── Caption ──────────────────────────────────────── */}
            <figcaption
              className={cn(
                "absolute bottom-0 inset-x-0",
                "px-4 sm:px-5 pb-4 sm:pb-5 pt-8",
                "flex flex-col gap-1",
              )}
            >
              {/* English title */}
              {category.englishTitle && (
                <span
                  className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-white/70"
                  lang="en"
                >
                  {category.englishTitle}
                </span>
              )}

              {/* Persian title + arrow */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-lg sm:text-xl lg:text-2xl font-normal text-white leading-snug">
                  {category.title}
                </span>

                <span className="text-white/80 flex-shrink-0">
                  <ArrowIcon isRtl={isRtl} />
                </span>
              </div>

              {/* Description — featured card only */}
              {showDescription && category.description && (
                <p className="text-sm text-white/65 leading-relaxed line-clamp-2 mt-0.5">
                  {category.description}
                </p>
              )}
            </figcaption>
          </figure>
        </Link>
      </div>
    </article>
  );
}
