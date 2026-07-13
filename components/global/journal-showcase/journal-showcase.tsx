/**
 * journal-showcase.tsx — Server Component
 *
 * Editorial homepage journal section.
 *
 * Renders:
 * - Asymmetric section header (title start, description + CTA end)
 * - One featured article (portrait, dominant) + secondary articles
 * - Graceful handling for 1, 2, 3+ articles
 * - All content server-rendered — zero new client JavaScript
 *
 * No "use client" — no useState, no useEffect, no browser APIs, no useTheme.
 * Theme changes handled by Tailwind dark: variants.
 */

import Link from "next/link";
 import type {
  JournalArticle,
  JournalHeadingElement,
  JournalShowcaseProps,
  JournalShowcaseSurface,
} from "./journal-showcase.types";
import { JournalArticleCard } from "./journal-article-card";
import { ArrowIcon } from "./journal-showcase-icons";
import { Reveal } from "@/components/static/home/motion/reveal";
import {
  HOME_EYEBROW_ACCENT_CLASS,
  HOME_EYEBROW_LINE_CLASS,
  HOME_EYEBROW_ROW_CLASS,
} from "@/components/static/home/home-section-classes";

// ---------------------------------------------------------------------------
// Static surface class maps
// ---------------------------------------------------------------------------

const surfaceBgClasses: Record<JournalShowcaseSurface, string> = {
  page: "bg-[#FCFAF7] dark:bg-[#0B1117]",
  warm: "bg-[#F8F3EB] dark:bg-[#111820]",
  surface: "bg-white dark:bg-[#171F27]",
};

const surfaceFocusOffsetClasses: Record<JournalShowcaseSurface, string> = {
  page: "focus-visible:ring-offset-[#FCFAF7] dark:focus-visible:ring-offset-[#0B1117]",
  warm: "focus-visible:ring-offset-[#F8F3EB] dark:focus-visible:ring-offset-[#111820]",
  surface:
    "focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#171F27]",
};

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------------
// Featured article selection
// ---------------------------------------------------------------------------

/**
 * Selects the featured article without mutating the input array.
 *
 * Priority:
 * 1. Article whose id matches featuredArticleId
 * 2. First article with featured: true
 * 3. First article in the array
 *
 * Returns { featured, remaining } where remaining preserves input order
 * and does not include the featured article.
 */
function selectFeaturedArticle(
  articles: readonly JournalArticle[],
  featuredArticleId?: string,
): { featured: JournalArticle; remaining: JournalArticle[] } {
  let featuredIndex = -1;

  // Priority 1: explicit featuredArticleId
  if (featuredArticleId) {
    featuredIndex = articles.findIndex((a) => a.id === featuredArticleId);
  }

  // Priority 2: first article with featured=true
  if (featuredIndex === -1) {
    featuredIndex = articles.findIndex((a) => a.featured === true);
  }

  // Priority 3: first article
  if (featuredIndex === -1) {
    featuredIndex = 0;
  }

  const featured = articles[featuredIndex];
  // Build remaining without the featured article, preserving input order
  const remaining = articles.filter((_, i) => i !== featuredIndex);

  return { featured, remaining };
}

// ---------------------------------------------------------------------------
// Development warnings
// ---------------------------------------------------------------------------

function warnInDev(props: JournalShowcaseProps): void {
  if (process.env.NODE_ENV !== "development") return;

  const { articles, featuredArticleId, maxItems } = props;
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  if (maxItems !== undefined && maxItems < 1) {
    console.warn("[JournalShowcase] maxItems must be at least 1.");
  }

  articles.forEach((article, i) => {
    if (!article.id) {
      console.warn(`[JournalShowcase] Article at index ${i} is missing "id".`);
    } else if (seenIds.has(article.id)) {
      console.warn(`[JournalShowcase] Duplicate article id: "${article.id}".`);
    } else {
      seenIds.add(article.id);
    }

    if (!article.slug) {
      console.warn(
        `[JournalShowcase] Article "${article.id ?? i}" is missing "slug".`,
      );
    } else if (seenSlugs.has(article.slug)) {
      console.warn(
        `[JournalShowcase] Duplicate article slug: "${article.slug}".`,
      );
    } else {
      seenSlugs.add(article.slug);
    }

    if (!article.title) {
      console.warn(
        `[JournalShowcase] Article "${article.id ?? i}" is missing "title". Affects SEO.`,
      );
    }

    if (!article.href) {
      console.warn(
        `[JournalShowcase] Article "${article.id ?? i}" is missing "href".`,
      );
    }

    if (!article.image?.alt) {
      console.warn(
        `[JournalShowcase] Article "${article.id ?? i}" has no image alt text.`,
      );
    }

    if (
      article.image?.desktop?.width &&
      article.image?.desktop?.height &&
      (article.image.desktop.width < 100 || article.image.desktop.height < 100)
    ) {
      console.warn(
        `[JournalShowcase] Article "${article.id ?? i}" has suspiciously small image dimensions.`,
      );
    }

    if (article.publishedAt) {
      const d = new Date(article.publishedAt);
      if (isNaN(d.getTime())) {
        console.warn(
          `[JournalShowcase] Article "${article.id ?? i}" has an invalid publishedAt date: "${article.publishedAt}".`,
        );
      }
    }

    if (
      article.readingTimeMinutes !== undefined &&
      article.readingTimeMinutes < 0
    ) {
      console.warn(
        `[JournalShowcase] Article "${article.id ?? i}" has a negative readingTimeMinutes.`,
      );
    }
  });

  if (featuredArticleId && !articles.some((a) => a.id === featuredArticleId)) {
    console.warn(
      `[JournalShowcase] featuredArticleId "${featuredArticleId}" does not match any article id. Falling back.`,
    );
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function JournalShowcase({
  id = "najibzadeh-journal",
  eyebrow = "مجله نجیب‌زاده",
  title,
  description,
  articles,
  action,
  locale = "fa",
  headingAs = "h2",
  surface = "page",
  featuredArticleId,
  maxItems = 3,
  showExcerpt = true,
  showDate = true,
  showReadingTime = true,
  className = "",
}: JournalShowcaseProps): React.JSX.Element | null {
  // ── Guard — empty articles ────────────────────────────────────────────────
  if (articles.length === 0) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[JournalShowcase] Received an empty articles array. Rendering null.",
      );
    }
    return null;
  }

  warnInDev({
    id,
    eyebrow,
    title,
    description,
    articles,
    action,
    locale,
    headingAs,
    surface,
    featuredArticleId,
    maxItems,
    showExcerpt,
    showDate,
    showReadingTime,
    className,
  });

  const isRTL = locale === "fa";
  const headingId = `${id}-heading`;
  const Heading = headingAs as JournalHeadingElement;

  /*
   * Article heading level follows section heading level.
   * h2 section → h3 articles
   * h3 section → h4 articles
   */
  const articleHeadingAs: "h3" | "h4" = headingAs === "h2" ? "h3" : "h4";

  // Resolved surface classes
  const bgClass = surfaceBgClasses[surface];
  const focusOffsetClass = surfaceFocusOffsetClasses[surface];

  // ── Article selection and slicing ─────────────────────────────────────────
  const safeMax = Math.max(1, maxItems);
  const slicedArticles = articles.slice(0, safeMax);

  const { featured, remaining } = selectFeaturedArticle(
    slicedArticles,
    featuredArticleId,
  );

  // Secondary articles: everything except the featured, up to (safeMax - 1)
  const secondaryArticles = remaining.slice(0, safeMax - 1);

  // Overflow articles: articles beyond the primary composition (> 3 items)
  const primaryIds = new Set([
    featured.id,
    ...secondaryArticles.map((a) => a.id),
  ]);
  const overflowArticles = slicedArticles.filter((a) => !primaryIds.has(a.id));

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      dir={isRTL ? "rtl" : "ltr"}
      className={cn(
        bgClass,
        "border-t border-[#DED8D1] dark:border-[#2C343C]",
        "py-20 sm:py-24 lg:py-32 xl:py-36",
        "px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20",
        className,
      )}
    >
      <div className="max-w-[1600px] mx-auto">
        {/* ==============================================================
            SECTION HEADER
            ============================================================== */}
        <Reveal variant="fade-up" delay={0} duration={500} once>
          <div className="mb-12 sm:mb-14 lg:mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-6 lg:gap-x-8 lg:items-end">
              {/* Title area — col 1–7 */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                {eyebrow && (
                  <div className={HOME_EYEBROW_ROW_CLASS}>
                    <span className={HOME_EYEBROW_ACCENT_CLASS}>
                      {eyebrow}
                    </span>
                    <span aria-hidden="true" className={HOME_EYEBROW_LINE_CLASS} />
                  </div>
                )}
                <Heading
                  id={headingId}
                  className={cn(
                    "font-light leading-tight",
                    "text-3xl sm:text-4xl lg:text-5xl",
                    "text-[#231F20] dark:text-[#F8F5F0]",
                    "max-w-xl",
                  )}
                >
                  {title}
                </Heading>
              </div>

              {/* Description + CTA — col 9–12 */}
              <div className="lg:col-span-4 lg:col-start-9 flex flex-col gap-6">
                {description && (
                  <p className="text-sm sm:text-base font-light leading-relaxed text-[#6C6662] dark:text-[#B8B2AC] max-w-sm">
                    {description}
                  </p>
                )}

                {action && (
                  <Link
                    href={action.href}
                    aria-label={action.ariaLabel ?? action.label}
                    className={cn(
                      "group inline-flex items-center gap-2",
                      "min-h-[44px]",
                      "text-sm tracking-[0.1em]",
                      "text-[#231F20] dark:text-[#F8F5F0]",
                      "border-b border-[#231F20] dark:border-[#F8F5F0]",
                      "pb-0.5 w-fit",
                      "hover:border-[#C15427] hover:text-[#A94420]",
                      "dark:hover:border-[#C15427] dark:hover:text-[#E18A68]",
                      "transition-colors duration-150",
                      "focus-visible:outline-none focus-visible:ring-2",
                      "focus-visible:ring-[#C15427]",
                      "dark:focus-visible:ring-[#E18A68]",
                      "focus-visible:ring-offset-2",
                      focusOffsetClass,
                    )}
                  >
                    {action.label}
                    <ArrowIcon
                      direction={isRTL ? "rtl" : "ltr"}
                      size={16}
                      className={cn(
                        "text-[#C15427] flex-shrink-0",
                        "transition-transform duration-150 motion-reduce:transition-none",
                        isRTL
                          ? "group-hover:-translate-x-1"
                          : "group-hover:translate-x-1",
                      )}
                    />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Reveal>

        {/* ==============================================================
            PRIMARY EDITORIAL GRID
            One featured (col 1–7, row 1–2) + up to two secondary (col 8–12)
            ============================================================== */}
        <Reveal variant="fade-up" delay={160} duration={600} once>
          <div
            className={cn(
              "grid grid-cols-1",
              secondaryArticles.length > 0
                ? "sm:grid-cols-2 lg:grid-cols-12"
                : "",
              "gap-10 sm:gap-12 lg:gap-8",
            )}
          >
            {/* Featured article — col 1–7, rows 1–2 */}
            <div
              className={cn(
                "col-span-1",
                secondaryArticles.length > 0
                  ? "sm:col-span-2 lg:col-span-7 lg:row-span-2"
                  : "",
              )}
            >
              <JournalArticleCard
                article={featured}
                variant="featured"
                articleHeadingAs={articleHeadingAs}
                locale={locale}
                showExcerpt={showExcerpt}
                showDate={showDate}
                showReadingTime={showReadingTime}
              />
            </div>

            {/* Secondary articles — col 8–12, stacked */}
            {secondaryArticles.map((article) => (
              <div
                key={article.id}
                className={cn("col-span-1", "sm:col-span-1 lg:col-span-5")}
              >
                <JournalArticleCard
                  article={article}
                  variant="secondary"
                  articleHeadingAs={articleHeadingAs}
                  locale={locale}
                  showExcerpt={showExcerpt}
                  showDate={showDate}
                  showReadingTime={showReadingTime}
                />
              </div>
            ))}
          </div>

          {/* ==============================================================
              OVERFLOW GRID — for maxItems > 3
              Renders additional articles in a clean two-to-three column grid.
              No carousel, no pagination.
              ============================================================== */}
          {overflowArticles.length > 0 && (
            <div
              className={cn(
                "mt-10 sm:mt-12 lg:mt-10",
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                "gap-10 sm:gap-8 lg:gap-8",
                "pt-10 sm:pt-12 lg:pt-10",
                "border-t border-[#DED8D1] dark:border-[#2C343C]",
              )}
            >
              {overflowArticles.map((article) => (
                <JournalArticleCard
                  key={article.id}
                  article={article}
                  variant="secondary"
                  articleHeadingAs={articleHeadingAs}
                  locale={locale}
                  showExcerpt={showExcerpt}
                  showDate={showDate}
                  showReadingTime={showReadingTime}
                />
              ))}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
