// ─────────────────────────────────────────────────────────────────────────────
// Product Focus Slider — Server Component Root
//
// This file MUST remain a Server Component.
// No "use client". No browser APIs. No GSAP. No useEffect.
//
// Responsibilities:
// - Accept serializable product data
// - Normalize products on the server
// - Validate products in development
// - Render section heading, eyebrow, description in server HTML
// - Render all product titles and Links in server HTML
// - Forward serializable props to ProductFocusSliderClient
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import type {
  ProductFocusSliderProps,
  ProductFocusSliderClientProps,
  ProductSliderItem,
} from "./product-focus-slider.types";
import {
  HOME_DESCRIPTION_TEXT_CLASS,
  HOME_EYEBROW_MUTED_CLASS,
  HOME_EYEBROW_LINE_CLASS,
  HOME_EYEBROW_ROW_CLASS,
  HOME_HEADER_DESCRIPTION_COLUMN_CLASS,
  HOME_HEADER_GRID_CLASS,
  HOME_HEADER_MARGIN_CLASS,
  HOME_HEADER_TITLE_COLUMN_CLASS,
  HOME_SECTION_CONTAINER_CLASS,
  HOME_SECTION_PADDING_X_CLASS,
  HOME_SECTION_SPACING_CLASS,
  HOME_SECTION_TITLE_CLASS,
  HOME_WARM_SURFACE_CLASS,
} from "../home-section-classes";
import { ProductFocusSliderClient } from "./product-focus-slider-client";

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_ID = "product-focus-slider";
const DEFAULT_EYEBROW = "محصولات منتخب";
const DEFAULT_LOCALE = "fa" as const;
const DEFAULT_ENABLE_SWIPE = true;
const MAX_HOMEPAGE_PRODUCTS = 10;

// ── Development validation ────────────────────────────────────────────────────

function validateProducts(products: readonly ProductSliderItem[]): void {
  if (process.env.NODE_ENV !== "development") return;

  if (products.length > MAX_HOMEPAGE_PRODUCTS) {
    console.warn(
      `[ProductFocusSlider] ${products.length} products supplied. ` +
        `Only the first ${MAX_HOMEPAGE_PRODUCTS} will be used on the homepage slider.`
    );
  }

  const ids = new Set<string>();
  const hrefs = new Set<string>();

  products.forEach((product, i) => {
    if (!product.id) {
      console.warn(`[ProductFocusSlider] Product at index ${i} is missing an id.`);
    }
    if (ids.has(product.id)) {
      console.warn(`[ProductFocusSlider] Duplicate product id: "${product.id}" at index ${i}`);
    }
    ids.add(product.id);

    if (hrefs.has(product.href)) {
      console.warn(`[ProductFocusSlider] Duplicate product href: "${product.href}" at index ${i}`);
    }
    hrefs.add(product.href);

    if (!product.title) {
      console.warn(`[ProductFocusSlider] Product "${product.id}" is missing a title.`);
    }
    if (!product.priceText) {
      console.warn(`[ProductFocusSlider] Product "${product.id}" has an empty priceText.`);
    }
    if (!product.href) {
      console.warn(`[ProductFocusSlider] Product "${product.id}" has an empty href.`);
    }
    if (!product.image.alt) {
      console.warn(`[ProductFocusSlider] Product "${product.id}" is missing image alt text.`);
    }
    if (!product.image.width || !product.image.height) {
      console.warn(`[ProductFocusSlider] Product "${product.id}" has invalid image dimensions.`);
    }
  });
}

// ── Normalization ─────────────────────────────────────────────────────────────

function normalizeProduct(raw: ProductSliderItem): ProductSliderItem {
  return {
    id: String(raw.id),
    title: String(raw.title),
    englishTitle: raw.englishTitle ? String(raw.englishTitle) : undefined,
    href: String(raw.href),
    priceText: String(raw.priceText),
    image: {
      src: String(raw.image.src),
      width: Number(raw.image.width),
      height: Number(raw.image.height),
      alt: String(raw.image.alt),
    },
    objectPosition: raw.objectPosition ?? "center",
  };
}

// ── Server Component ──────────────────────────────────────────────────────────

export function ProductFocusSlider({
  id = DEFAULT_ID,
  eyebrow = DEFAULT_EYEBROW,
  title,
  description,
  products,
  initialProductId,
  locale = DEFAULT_LOCALE,
  enableSwipe = DEFAULT_ENABLE_SWIPE,
  className,
}: ProductFocusSliderProps) {
  // Guard: nothing to render
  if (!products || products.length === 0) return null;

  validateProducts(products);

  // Normalize and slice
  const normalizedProducts = products
    .slice(0, MAX_HOMEPAGE_PRODUCTS)
    .map(normalizeProduct);

  // Resolve initial index
  let initialIndex = 0;
  if (initialProductId) {
    const found = normalizedProducts.findIndex((p) => p.id === initialProductId);
    if (found >= 0) {
      initialIndex = found;
    } else if (process.env.NODE_ENV === "development") {
      console.warn(
        `[ProductFocusSlider] initialProductId "${initialProductId}" not found. Using first product.`
      );
    }
  }

  const clientProps: ProductFocusSliderClientProps = {
    id,
    products: normalizedProducts,
    initialIndex,
    locale,
    enableSwipe,
  };

  const isRtl = locale === "fa";
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      dir={isRtl ? "rtl" : "ltr"}
      className={[
        HOME_WARM_SURFACE_CLASS,
        HOME_SECTION_SPACING_CLASS,
        HOME_SECTION_PADDING_X_CLASS,
        "overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={HOME_SECTION_CONTAINER_CLASS}>

        {/* ── Section Header ─────────────────────────────────────────── */}
        <header
          className={`${HOME_HEADER_GRID_CLASS} ${HOME_HEADER_MARGIN_CLASS}`}
        >

          {/* Eyebrow + H2 */}
          <div className={HOME_HEADER_TITLE_COLUMN_CLASS}>
            {eyebrow && (
              <div className={`${HOME_EYEBROW_ROW_CLASS} mb-4`}>
                <span className={HOME_EYEBROW_MUTED_CLASS}>{eyebrow}</span>
                <span aria-hidden="true" className={HOME_EYEBROW_LINE_CLASS} />
              </div>
            )}
            <h2
              id={headingId}
              className={HOME_SECTION_TITLE_CLASS}
            >
              {title}
            </h2>
          </div>

          {/* Description */}
          {description && (
            <div className={HOME_HEADER_DESCRIPTION_COLUMN_CLASS}>
              <p className={`${HOME_DESCRIPTION_TEXT_CLASS} max-w-prose`}>
                {description}
              </p>
            </div>
          )}
        </header>

        {/* ── Server-rendered product list (SEO and no-JS) ──────────────── */}
        {/*
          This list renders all product links and titles in the initial HTML.
          It is visually hidden but accessible and crawlable.
          The ClientComponent overlays the visual slider above this.
        */}
        <noscript>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {normalizedProducts.map((product) => (
              <li key={product.id}>
                <Link
                  href={product.href}
                  className="block text-center text-sm text-[#231F20] dark:text-[#F8F5F0] hover:underline"
                >
                  <span className="block font-light">{product.title}</span>
                  <span className="block text-[11px] text-[#6C6662] dark:text-[#B8B2AC] mt-1 tabular-nums">
                    {product.priceText}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </noscript>

        {/* ── Interactive Client Component ──────────────────────────────── */}
        <ProductFocusSliderClient {...clientProps} />

      </div>
    </section>
  );
}
