// ─────────────────────────────────────────────────────────────────────────────
// Category Editorial Grid — Server Component
//
// No "use client". No state. No browser APIs. No animation library.
// Renders the editorial category grid with semantic markup.
// Category card entrances are handled by a tiny client wrapper.
// ─────────────────────────────────────────────────────────────────────────────

import {
  HOME_DESCRIPTION_TEXT_CLASS,
  HOME_EYEBROW_MUTED_CLASS,
  HOME_EYEBROW_LINE_CLASS,
  HOME_EYEBROW_ROW_CLASS,
  HOME_HEADER_DESCRIPTION_COLUMN_CLASS,
  HOME_HEADER_GRID_CLASS,
  HOME_HEADER_MARGIN_CLASS,
  HOME_HEADER_TITLE_COLUMN_CLASS,
  HOME_PAGE_SURFACE_CLASS,
  HOME_SECTION_CONTAINER_CLASS,
  HOME_SECTION_PADDING_X_CLASS,
  HOME_SECTION_SPACING_CLASS,
  HOME_SECTION_TITLE_CLASS,
} from "../home-section-classes";
import { CategoryCard } from "./category-card";
import { CategoryGridMotionList } from "./category-grid-motion-list";
import type {
  CategoryEditorialGridProps,
  CategoryGridItem,
  CategoryGridPosition,
} from "./category-editorial-grid.types";

// ── Static grid position class map ───────────────────────────────────────────
// Explicit mappings — no dynamic Tailwind class construction.

const GRID_POSITION_CLASSES: Record<CategoryGridPosition, string> = {
  featured: "col-span-2 lg:col-span-5 lg:row-span-2",
  "top-wide": "col-span-1 lg:col-span-4 lg:row-span-1",
  "top-small": "col-span-1 lg:col-span-3 lg:row-span-1",
  "bottom-small": "col-span-1 lg:col-span-3 lg:row-span-1",
  "bottom-wide": "col-span-1 lg:col-span-4 lg:row-span-1",
};

const CARD_MOTION_DELAYS: Record<CategoryGridPosition, number> = {
  featured: 0,
  "top-wide": 80,
  "top-small": 160,
  "bottom-small": 80,
  "bottom-wide": 240,
};

// ── Development validation ────────────────────────────────────────────────────

function validateCategories(categories: readonly CategoryGridItem[]): void {
  if (process.env.NODE_ENV !== "development") return;

  if (categories.length > 5) {
    console.warn(
      "[CategoryEditorialGrid] More than 5 categories supplied. " +
        "Only the first 5 will be rendered in the homepage showcase.",
    );
  }

  const ids = new Set<string>();
  categories.forEach((cat, i) => {
    if (ids.has(cat.id)) {
      console.warn(
        `[CategoryEditorialGrid] Duplicate category id: "${cat.id}" at index ${i}`,
      );
    }
    ids.add(cat.id);

    if (!cat.image.alt) {
      console.warn(
        `[CategoryEditorialGrid] Category "${cat.id}" is missing image alt text.`,
      );
    }
    if (!cat.image.width || !cat.image.height) {
      console.warn(
        `[CategoryEditorialGrid] Category "${cat.id}" has invalid image dimensions.`,
      );
    }
    if (!cat.title) {
      console.warn(
        `[CategoryEditorialGrid] Category "${cat.id}" is missing a title.`,
      );
    }
    if (!cat.href) {
      console.warn(
        `[CategoryEditorialGrid] Category "${cat.id}" is missing an href.`,
      );
    }
  });
}

// ── Server Component ──────────────────────────────────────────────────────────

export function CategoryEditorialGrid({
  id = "category-editorial-grid",
  eyebrow,
  title,
  description,
  categories,
  locale = "fa",
  className,
}: CategoryEditorialGridProps) {
  // Guard: nothing to render
  if (!categories || categories.length === 0) return null;

  validateCategories(categories);

  // Slice to max 5 without mutating the input
  const displayCategories =
    categories.length > 5 ? categories.slice(0, 5) : categories;

  const isRtl = locale === "fa";
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      dir={isRtl ? "rtl" : "ltr"}
      className={[
        HOME_PAGE_SURFACE_CLASS,
        HOME_SECTION_SPACING_CLASS,
        HOME_SECTION_PADDING_X_CLASS,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={HOME_SECTION_CONTAINER_CLASS}>
        {/* ── Section Header ──────────────────────────────────────────── */}
        <header
          className={`${HOME_HEADER_GRID_CLASS} ${HOME_HEADER_MARGIN_CLASS}`}
        >
          {/* Title area */}
          <div className={HOME_HEADER_TITLE_COLUMN_CLASS}>
            {eyebrow && (
              <div className={`${HOME_EYEBROW_ROW_CLASS} mb-4`}>
                <span className={HOME_EYEBROW_MUTED_CLASS}>{eyebrow}</span>
                <span aria-hidden="true" className={HOME_EYEBROW_LINE_CLASS} />
              </div>
            )}
            <h2 id={headingId} className={HOME_SECTION_TITLE_CLASS}>
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

        {/* ── Category Grid ────────────────────────────────────────────── */}
        <CategoryGridMotionList
          ariaLabel="دسته‌بندی‌های محصولات"
          className={[
            "grid",
            "grid-cols-2",
            "lg:grid-cols-12",
            "lg:auto-rows-[320px]",
            "xl:auto-rows-[360px]",
            "gap-3 sm:gap-4 lg:gap-5",
          ].join(" ")}
        >
          {displayCategories.map((category) => (
            <li
              key={category.id}
              data-category-motion-item="true"
              data-category-motion-position={category.position}
              data-category-motion-delay={CARD_MOTION_DELAYS[category.position]}
              className={[
                GRID_POSITION_CLASSES[category.position],
                "h-full",
              ].join(" ")}
            >
              <CategoryCard category={category} isRtl={isRtl} />
            </li>
          ))}
        </CategoryGridMotionList>
      </div>
    </section>
  );
}
