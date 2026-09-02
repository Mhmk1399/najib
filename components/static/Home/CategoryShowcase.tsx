import Image from "next/image";
import Link from "next/link";

import { type CSSProperties } from "react";

import { brandColors, lightTokens } from "@/theme/theme-colors";

/* ========================================================================== 
   TYPES
============================================================================ */

export type CategoryItem = {
  id: string;
  name: string;
  href: string;
  image: string;
  imageAlt?: string;
  imagePosition?: string;
};

type CategoryShowcaseProps = {
  categories?: CategoryItem[];
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
};

/* ========================================================================== 
   DATA
============================================================================ */

export const fakeCategories: CategoryItem[] = [
  {
    id: "tailoring",
    name: "Tailoring",
    href: "/tailoring",
    image: "/assets/images/suit.webp",
    imagePosition: "center",
  },
  {
    id: "fragrance",
    name: "Fragrance",
    href: "/fragrance",
    image: "/assets/images/kafsh.webp",
    imagePosition: "center",
  },
  {
    id: "clothing",
    name: "Clothing",
    href: "/clothing",
    image: "/assets/images/accessory.webp",
    imagePosition: "center",
  },
];

/* ========================================================================== 
   COMPONENT
============================================================================ */

export function CategoryShowcase({
  categories = fakeCategories,
  eyebrow = "Explore Collection",
  title = "Explore Najibzadeh",
  description = "A considered world of tailoring, fragrance and objects shaped around modern living.",
  className = "",
}: CategoryShowcaseProps) {
  const visibleCategories = categories.slice(0, 3);

  const themeVars = {
    "--cat-bg": lightTokens.surfaceBrand,
    "--cat-text": brandColors.black.hex,
    "--cat-muted": lightTokens.textMuted,
    "--cat-accent": brandColors.copper.hex,
    "--cat-black-rgb": brandColors.black.rgb,
  } as CSSProperties;

  if (!visibleCategories.length) return null;

  return (
    <section
      aria-labelledby="category-showcase-title"
      style={themeVars}
      className={`relative w-full overflow-hidden bg-[var(--cat-bg)] text-[var(--cat-text)] ${className}`}
    >
      <div className="mx-auto w-full max-w-[1760px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 xl:px-10 xl:py-28">
        <header className="mx-auto flex max-w-[760px] flex-col items-center text-center">
          {/* {eyebrow && (
            <div className="flex items-center justify-center gap-3 text-[6.5px] font-semibold uppercase tracking-[0.22em] text-[var(--cat-accent)] sm:text-[7px]">
              <span
                aria-hidden="true"
                className="h-px w-5 bg-[var(--cat-accent)]/70"
              />
              <span>{eyebrow}</span>
              <span
                aria-hidden="true"
                className="h-px w-5 bg-[var(--cat-accent)]/70"
              />
            </div>
          )} */}

          <h2
            id="category-showcase-title"
            className="mt-4 max-w-[720px] font-serif text-[clamp(1.75rem,11vw,1.25rem)] font-normal leading-[0.96] tracking-[-0.05em] text-[var(--cat-text)] sm:mt-5 lg:text-[clamp(4.1rem,4.4vw,5.25rem)]"
          >
            {title}
          </h2>

          {description && (
            <p className="mt-5 max-w-[540px] text-[10px] leading-[1.8] text-[var(--cat-muted)] sm:text-[11px] lg:mt-6 lg:text-[12px]">
              {description}
            </p>
          )}
        </header>

        <div className="mx-auto mt-10 grid w-full max-w-[1560px] grid-cols-1 gap-2 sm:mt-12 sm:gap-3 md:grid-cols-3 lg:mt-14 lg:gap-4">
          {visibleCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== 
   CATEGORY CARD
============================================================================ */

function CategoryCard({ category }: { category: CategoryItem }) {
  return (
    <Link
      href={category.href}
      aria-label={`Explore ${category.name}`}
      className="group relative isolate mx-auto block aspect-[4/5] w-full max-w-[620px] overflow-hidden bg-[#0B0B0B] text-white outline-none focus-visible:ring-2 focus-visible:ring-black/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--cat-bg)] md:max-w-none"
    >
      <Image
        src={category.image}
        alt={category.imageAlt ?? category.name}
        fill
        draggable={false}
        sizes="(max-width: 767px) 100vw, 33vw"
        style={{ objectPosition: category.imagePosition ?? "center" }}
        className="pointer-events-none select-none object-cover transition-transform duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0.05)_0%,rgba(11,11,11,0.06)_42%,rgba(11,11,11,0.70)_100%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_42%,rgba(11,11,11,0.18)_120%)]"
      />

      <div className="absolute inset-x-5 bottom-6 flex flex-col items-center text-center sm:inset-x-6 sm:bottom-7 lg:bottom-8">
        <span className="text-[6px] font-semibold uppercase tracking-[0.2em] text-white/55 sm:text-[6.5px]">
          Collection
        </span>

        <h3 className="mt-2 font-serif text-[clamp(2.4rem,12vw,4rem)] font-normal leading-none tracking-[-0.045em] text-white md:text-[clamp(2.4rem,3.6vw,4.2rem)]">
          {category.name}
        </h3>

        <span
          aria-hidden="true"
          className="mt-4 h-px w-8 bg-white/50 transition-[width,background-color] duration-500 group-hover:w-12 group-hover:bg-white/80 motion-reduce:transition-none"
        />

        <span className="mt-4 inline-flex items-center gap-2 text-[6.5px] font-semibold uppercase tracking-[0.17em] text-white/68 transition-colors duration-300 group-hover:text-white sm:text-[7px]">
          Explore
          <ArrowIcon />
        </span>
      </div>
    </Link>
  );
}

/* ========================================================================== 
   ICON
============================================================================ */

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="size-3.5"
    >
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
