import Image from "next/image";
import Link from "next/link";

import { type CSSProperties } from "react";

import { brandColors, lightTokens, themeClasses } from "@/theme/theme-colors";
import { ArrowRightIcon, Button } from "@/components/ui/Button";

/* ========================================================================== 
   TYPES
============================================================================ */

export type EditorialProduct = {
  id: string;
  title: string;
  image: string;
  href: string;
  eyebrow?: string;
  imageAlt?: string;
  imagePosition?: string;
};

type SectionAction = {
  label: string;
  href: string;
};

type ProductEditorialGridProps = {
  products?: EditorialProduct[];
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: SectionAction;
  className?: string;
};

/* ========================================================================== 
   FAKE DATA
============================================================================ */

export const fakeEditorialProducts: EditorialProduct[] = [
  {
    id: "tailoring",
    title: "Tailoring",
    eyebrow: "01 / Collection",
    href: "/tailoring",
    image: "/assets/images/p1.webp",
    imagePosition: "center",
  },
  {
    id: "shoes",
    title: "Shoes",
    eyebrow: "02 / Essentials",
    href: "/shoes",
    image: "/assets/images/p2.webp",
    imagePosition: "center",
  },
  {
    id: "fragrance",
    title: "Fragrance",
    eyebrow: "03 / Signature",
    href: "/fragrance",
    image: "/assets/images/p6.webp",
    imagePosition: "center",
  },
  {
    id: "knitwear",
    title: "Knitwear",
    eyebrow: "04 / Softness",
    href: "/knitwear",
    image: "/assets/images/p3.webp",
    imagePosition: "center",
  },
  {
    id: "leather-goods",
    title: "Leather Goods",
    eyebrow: "05 / Craft",
    href: "/accessories",
    image: "/assets/images/p8.webp",
    imagePosition: "center",
  },
  {
    id: "accessories",
    title: "Accessories",
    eyebrow: "06 / Details",
    href: "/accessories",
    image: "/assets/images/p7.webp",
    imagePosition: "center",
  },
];

/* ========================================================================== 
   COMPONENT
============================================================================ */

export function ProductEditorialGrid({
  products = fakeEditorialProducts,
  eyebrow = "Najibzadeh Selection",
  title = "Objects of character.",
  description = "A considered edit of tailoring, fragrance and objects defined by material, proportion and lasting character.",
  action,
  className = "",
}: ProductEditorialGridProps) {
  if (!products.length) return null;

  const themeVars = {
    "--grid-bg": lightTokens.surfaceBrand,
    "--grid-text": brandColors.black.hex,
    "--grid-muted": lightTokens.textMuted,
    "--grid-copper": brandColors.copper.hex,
    "--grid-black-rgb": brandColors.black.rgb,
  } as CSSProperties;

  return (
    <section
      style={themeVars}
      aria-labelledby="editorial-selection-title"
      className={`w-full overflow-hidden bg-[var(--grid-bg)] text-[var(--grid-text)] ${className}`}
    >
      <header className="mx-auto flex w-full max-w-[760px] flex-col items-center px-6 pb-10 pt-16 text-center sm:px-8 sm:pb-12 sm:pt-20 lg:pb-14 lg:pt-24">
        {eyebrow ? (
          <div className="flex items-center justify-center gap-3 text-[7px] font-semibold uppercase tracking-[0.22em] text-[var(--grid-copper)] sm:text-[8px]">
            <span
              aria-hidden="true"
              className="h-px w-5 bg-[var(--grid-copper)]/80"
            />
            <span>{eyebrow}</span>
            <span
              aria-hidden="true"
              className="h-px w-5 bg-[var(--grid-copper)]/80"
            />
          </div>
        ) : null}

        <h2
          id="editorial-selection-title"
          className="mt-4 max-w-[720px] font-serif text-[clamp(2.7rem,11vw,4.2rem)] font-normal leading-[0.96] tracking-[-0.05em] text-[var(--grid-text)] sm:text-[clamp(3.2rem,7vw,4.8rem)] lg:text-[clamp(3.7rem,4.4vw,5.2rem)]"
        >
          {title}
        </h2>

        {description ? (
          <p className="mt-5 max-w-[510px] text-[11px] leading-[1.75] text-[var(--grid-muted)] sm:text-[12px] lg:mt-6 lg:text-[13px]">
            {description}
          </p>
        ) : null}

        {action ? (
          <div className="mt-7">
            <Button
              href={action.href}
              variant="black"
              size="lg"
              icon={<ArrowRightIcon />}
            >
              {action.label}
            </Button>
          </div>
        ) : null}
      </header>

      <div className="mx-auto w-full max-w-[1680px] px-3 pb-3 sm:px-4 sm:pb-4 lg:px-5 lg:pb-5">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 lg:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== 
   PRODUCT CARD
============================================================================ */

function ProductCard({ product }: { product: EditorialProduct }) {
  return (
    <Link
      href={product.href}
      aria-label={`Explore ${product.title}`}
      className={`group relative isolate block overflow-hidden bg-black outline-none ${themeClasses.focusRing}`}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[4/5] lg:aspect-[1.08/1]">
        <Image
          src={product.image}
          alt={product.imageAlt ?? product.title}
          fill
          sizes="(max-width: 639px) calc(100vw - 24px), (max-width: 1023px) 50vw, 33vw"
          loading="lazy"
          draggable={false}
          style={{ objectPosition: product.imagePosition ?? "center" }}
          className="-z-30 select-none object-cover transition-transform duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgb(var(--grid-black-rgb)/0.02)_0%,rgb(var(--grid-black-rgb)/0.04)_44%,rgb(var(--grid-black-rgb)/0.62)_100%)]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_52%,rgb(var(--grid-black-rgb)/0.14)_120%)]"
        />

        <div className="absolute inset-x-5 bottom-6 z-10 flex flex-col items-center text-center sm:inset-x-6 sm:bottom-7 lg:inset-x-7 lg:bottom-8">
          {product.eyebrow ? (
            <p className="text-[6.5px] font-semibold uppercase tracking-[0.17em] text-white/56 sm:text-[7px]">
              {product.eyebrow}
            </p>
          ) : null}

          <h3 className="mt-2 max-w-[92%] font-serif text-[clamp(2.6rem,11vw,4rem)] font-normal leading-[0.92] tracking-[-0.045em] text-white drop-shadow-[0_3px_18px_rgb(var(--grid-black-rgb)/0.24)] sm:text-[clamp(2.5rem,6vw,3.8rem)] lg:text-[clamp(2.2rem,3vw,3.55rem)]">
            {product.title}
          </h3>

          <span
            aria-hidden="true"
            className="mt-4 h-px w-8 bg-white/55 transition-[width,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-14 group-hover:bg-white/80 motion-reduce:transition-none"
          />

          <span className="mt-3 inline-flex items-center gap-2 text-[7px] font-semibold uppercase tracking-[0.16em] text-white/62 transition-colors duration-300 group-hover:text-white sm:text-[7.5px]">
            Explore
            <ArrowIcon />
          </span>
        </div>
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
      className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none"
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
