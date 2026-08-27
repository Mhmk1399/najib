"use client";

import Image from "next/image";
import Link from "next/link";

import { type CSSProperties, useEffect, useRef, useState } from "react";

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

  /**
   * Examples:
   *
   * "center"
   * "center 30%"
   * "60% center"
   */
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
    image: "/images/editorial/tailoring.jpg",
    imagePosition: "center",
  },

  {
    id: "shoes",
    title: "Shoes",
    eyebrow: "02 / Essentials",
    href: "/shoes",
    image: "/images/editorial/shoes.jpg",
    imagePosition: "center",
  },

  {
    id: "fragrance",
    title: "Fragrance",
    eyebrow: "03 / Signature",
    href: "/fragrance",
    image: "/images/editorial/fragrance.jpg",
    imagePosition: "center",
  },

  {
    id: "knitwear",
    title: "Knitwear",
    eyebrow: "04 / Softness",
    href: "/knitwear",
    image: "/images/editorial/knitwear.jpg",
    imagePosition: "center",
  },

  {
    id: "leather-goods",
    title: "Leather Goods",
    eyebrow: "05 / Craft",
    href: "/accessories",
    image: "/images/editorial/leather-bag.jpg",
    imagePosition: "center",
  },

  {
    id: "accessories",
    title: "Accessories",
    eyebrow: "06 / Details",
    href: "/accessories",
    image: "/images/editorial/accessories.jpg",
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
  const { ref, revealed } = useRevealOnce<HTMLElement>();

  const themeVars = {
    /**
     * Cream only as editorial background.
     */
    "--grid-bg": lightTokens.surfaceBrand,

    "--grid-text": brandColors.black.hex,

    "--grid-muted": lightTokens.textMuted,

    /**
     * Copper only for main eyebrow.
     */
    "--grid-copper": brandColors.copper.hex,

    "--grid-black-rgb": brandColors.black.rgb,

    "--grid-white": brandColors.white.hex,

    "--grid-white-rgb": "255 255 255",
  } as CSSProperties;

  if (!products.length) {
    return null;
  }

  return (
    <section
      ref={ref}
      style={themeVars}
      className={`
        w-full
        overflow-hidden

        bg-[var(--grid-bg)]
        text-[var(--grid-text)]

        ${className}
      `}
    >
      {/* =====================================================
          INTRO
      ====================================================== */}

      <div
        className={`
          mx-auto

          flex
          w-full
          max-w-[780px]

          flex-col
          items-center

          px-6

          

          text-center

          transition-[opacity,transform]
          duration-700

          ease-[cubic-bezier(0.22,1,0.36,1)]

          sm:px-8
         

         py-4

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
        {/* =================================================
            EYEBROW

            تنها استفاده Copper.
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
            tracking-[0.23em]

            text-[var(--grid-copper)]

            sm:text-[8px]
          "
        >
          <span
            className="
              h-px
              w-5

              bg-[var(--grid-copper)]
            "
          />

          <span>{eyebrow}</span>

          <span
            className="
              h-px
              w-5

              bg-[var(--grid-copper)]
            "
          />
        </div>

        {/* =================================================
            TITLE
        ================================================= */}

        <h2
          className="
            max-w-[720px]

            font-serif

            text-[clamp(2.7rem,10vw,4.2rem)]
            font-normal

            leading-[0.96]
            tracking-[-0.05em]

            text-[var(--grid-text)]

            sm:text-[clamp(3.3rem,7vw,4.8rem)]

            lg:text-[clamp(3.8rem,4.5vw,5.3rem)]
          "
        >
          {title}
        </h2>

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        {description && (
          <p
            className="
              mt-5

              max-w-[500px]

              text-[10px]
              font-normal

              leading-[1.75]

              text-[var(--grid-muted)]

              sm:mt-6
              sm:text-[11px]

              lg:text-xs
            "
          >
            {description}
          </p>
        )}

        {/* =================================================
            OPTIONAL GLOBAL CTA

            از Button مشترک سایت.
        ================================================= */}

        {action && (
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
        )}
      </div>

      {/* =====================================================
          GRID
      ====================================================== */}

      <div
        className={`
          grid
          w-full

          grid-cols-1

          transition-[opacity,transform]
          duration-[850ms]

          ease-[cubic-bezier(0.22,1,0.36,1)]

          sm:grid-cols-2

          lg:grid-cols-3

          ${
            revealed
              ? `
                translate-y-0
                opacity-100

                delay-150
              `
              : `
                translate-y-10
                opacity-0
              `
          }
        `}
      >
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            revealed={revealed}
          />
        ))}
      </div>
    </section>
  );
}

/* ==========================================================================
   PRODUCT CARD
============================================================================ */

function ProductCard({
  product,
  index,
  revealed,
}: {
  product: EditorialProduct;

  index: number;

  revealed: boolean;
}) {
  return (
    <Link
      href={product.href}
      aria-label={`Explore ${product.title}`}
      style={{
        transitionDelay: revealed ? `${Math.min(index, 5) * 60}ms` : "0ms",
      }}
      className={`
        group
        relative
        isolate

        block
        overflow-hidden

        border-b
        border-white/10

        outline-none

        transition-[opacity,transform]
        duration-700

        ease-[cubic-bezier(0.22,1,0.36,1)]

        sm:border-r

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

        ${themeClasses.focusRing}
      `}
    >
      <div
        className="
          relative

          aspect-[4/5]

          w-full
          overflow-hidden

          lg:aspect-[1.18/1]
        "
      >
        {/* =================================================
            IMAGE
        ================================================= */}

        <Image
          src={product.image}
          alt={product.imageAlt ?? product.title}
          fill
          sizes="
            (max-width: 639px) 100vw,
            (max-width: 1023px) 50vw,
            33vw
          "
          loading="lazy"
          draggable={false}
          style={{
            objectPosition: product.imagePosition ?? "center",
          }}
          className="
            -z-30

            select-none
            object-cover

            scale-[1.01]

            transition-transform
            duration-[1100ms]

            ease-[cubic-bezier(0.22,1,0.36,1)]

            group-hover:scale-[1.04]
          "
        />

        {/* =================================================
            BOTTOM READABILITY OVERLAY
        ================================================= */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none

            absolute
            inset-0
            -z-20

            bg-[linear-gradient(180deg,rgb(var(--grid-black-rgb)/0.01)_0%,rgb(var(--grid-black-rgb)/0.03)_40%,rgb(var(--grid-black-rgb)/0.68)_100%)]
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none

            absolute
            inset-0
            -z-10

            bg-[radial-gradient(circle_at_center,transparent_48%,rgb(var(--grid-black-rgb)/0.18)_120%)]
          "
        />

        {/* =================================================
            INDEX
        ================================================= */}

        <span
          className="
            absolute

            left-5
            top-5

            text-[7px]
            font-medium

            uppercase
            tracking-[0.18em]

            text-white/42

            sm:left-6
            sm:top-6

            lg:opacity-0

            lg:transition-opacity
            lg:duration-300

            lg:group-hover:opacity-100
          "
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div
          className="
            absolute
            inset-x-0
            bottom-0

            p-5

            sm:p-6

            lg:p-7
          "
        >
          <div className="w-full min-w-0">
            {/* =============================================
                PRODUCT EYEBROW

                White, NOT copper.
            ============================================= */}

            {product.eyebrow && (
              <div
                className="
                  mb-2

                  flex
                  items-center
                  gap-2

                  text-[6.5px]
                  font-semibold

                  uppercase
                  tracking-[0.18em]

                  text-white/55
                "
              >
                <span
                  className="
                    h-px
                    w-4

                    bg-white/40
                  "
                />

                <span>{product.eyebrow}</span>
              </div>
            )}

            <div
              className="
                flex
                items-end
                justify-between
                gap-4
              "
            >
              {/* ===========================================
                  TITLE
              =========================================== */}

              <h3
                className="
                  min-w-0

                  font-serif

                  text-[clamp(2.5rem,10vw,4rem)]
                  font-normal

                  leading-[0.92]
                  tracking-[-0.045em]

                  text-white

                  drop-shadow-[0_3px_20px_rgb(var(--grid-black-rgb)/0.25)]

                  transition-transform
                  duration-500

                  ease-[cubic-bezier(0.22,1,0.36,1)]

                  group-hover:-translate-y-1

                  sm:text-[clamp(2.5rem,6vw,4rem)]

                  lg:text-[clamp(2.3rem,3.2vw,4rem)]
                "
              >
                {product.title}
              </h3>

              {/* ===========================================
                  ARROW

                  Square.
                  No curve.
              =========================================== */}

              <span
                className="
                  grid
                  size-10

                  shrink-0
                  place-items-center

                  border
                  border-white/30

                  bg-black/10

                  text-white

                  backdrop-blur-sm

                  transition-[background-color,border-color,color,transform]
                  duration-300

                  group-hover:translate-x-1

                  group-hover:border-white

                  group-hover:bg-white
                  group-hover:text-black
                "
              >
                <ArrowIcon />
              </span>
            </div>

            {/* =============================================
                BOTTOM LINE

                White, not copper.
            ============================================= */}

            <div
              aria-hidden="true"
              className="
                mt-4

                h-px
                w-full

                origin-left
                scale-x-[0.12]

                bg-white/60

                transition-transform
                duration-500

                ease-[cubic-bezier(0.22,1,0.36,1)]

                group-hover:scale-x-100
              "
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ==========================================================================
   REVEAL ONCE
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
        threshold: 0.1,

        rootMargin: "0px 0px -6% 0px",
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

/* ==========================================================================
   ICON
============================================================================ */

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="
        size-4

        transition-transform
        duration-200

        group-hover:translate-x-0.5
      "
    >
      <path
        d="M2.5 8H13M9.5 4.5L13 8L9.5 11.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
