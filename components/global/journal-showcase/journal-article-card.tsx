/**
 * journal-article-card.tsx — Server Component
 *
 * Renders one editorial journal article card.
 * Supports 'featured' (portrait, large) and 'secondary' (landscape, smaller) variants.
 * All content is server-rendered — no "use client", no state, no effects.
 */

import Link from "next/link";
import { getImageProps } from "next/image";
import type { JournalArticleCardProps } from "./journal-showcase.types";
import { ArrowIcon } from "./journal-showcase-icons";

// ---------------------------------------------------------------------------
// Static class maps
// ---------------------------------------------------------------------------

const objectPositionClasses: Record<string, string> = {
  center: "object-center",
  top: "object-top",
  bottom: "object-bottom",
  left: "object-left",
  right: "object-right",
  "center-left": "[object-position:25%_center]",
  "center-right": "[object-position:75%_center]",
};

// ---------------------------------------------------------------------------
// Date and reading-time formatting — executed on the server
// ---------------------------------------------------------------------------

function formatDate(isoDate: string, locale: "fa" | "en"): string {
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return isoDate;

    const dtfLocale = locale === "fa" ? "fa-IR" : "en-US";
    return new Intl.DateTimeFormat(dtfLocale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return isoDate;
  }
}

function formatReadingTime(minutes: number, locale: "fa" | "en"): string {
  if (locale === "fa") {
    const formatted = new Intl.NumberFormat("fa-IR").format(minutes);
    return `${formatted} دقیقه مطالعه`;
  }
  return `${minutes} min read`;
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function JournalArticleCard({
  article,
  variant,
  articleHeadingAs,
  locale = "fa",
  showExcerpt = true,
  showDate = true,
  showReadingTime = true,
}: JournalArticleCardProps): React.JSX.Element {
  const isRTL = locale === "fa";
  const isFeatured = variant === "featured";
  const objPos =
    objectPositionClasses[article.image.objectPosition ?? "center"] ??
    "object-center";

  const ArticleHeading = articleHeadingAs;

  // ── Responsive sizes — different per variant ──────────────────────────────
  const sizes = isFeatured
    ? "(max-width: 639px) 100vw, (max-width: 1023px) 100vw, 58vw"
    : "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 40vw";

  // ── Image props via getImageProps ─────────────────────────────────────────
  const { props: desktopProps } = getImageProps({
    src: article.image.desktop.src,
    width: article.image.desktop.width,
    height: article.image.desktop.height,
    alt: article.image.alt,
    sizes,
    quality: 82,
    loading: "lazy",
  });

  const mobileProps = article.image.mobile
    ? getImageProps({
        src: article.image.mobile.src,
        width: article.image.mobile.width,
        height: article.image.mobile.height,
        alt: article.image.alt,
        sizes: "100vw",
        quality: 82,
        loading: "lazy",
      }).props
    : null;

  // ── Image container aspect ratio per variant and breakpoint ───────────────
  // Featured: tall portrait at all sizes
  // Secondary: portrait on mobile, landscape on desktop
  const imageAspectClass = isFeatured
    ? "aspect-[4/5]"
    : "aspect-[4/5] sm:aspect-[4/3] lg:aspect-[16/10]";

  // ── Accessible article link label ─────────────────────────────────────────
  const linkLabel = isRTL
    ? `مطالعه مقاله ${article.title}`
    : `Read article: ${article.title}`;

  // ── Formatted metadata ────────────────────────────────────────────────────
  const formattedDate = formatDate(article.publishedAt, locale);
  const formattedReadingTime =
    showReadingTime &&
    article.readingTimeMinutes &&
    article.readingTimeMinutes > 0
      ? formatReadingTime(article.readingTimeMinutes, locale)
      : null;

  const hasMetadata = (showDate && formattedDate) || formattedReadingTime;

  return (
    <article className="h-full">
      {/*
       * One wrapping Link per article — no nested interactive elements.
       * prefetch={false} avoids eagerly prefetching every journal article route.
       * The aria-label provides a complete, descriptive link label.
       */}
      <Link
        href={article.href}
        aria-label={linkLabel}
        prefetch={false}
        dir={isRTL ? "rtl" : "ltr"}
        className={cn(
          "group flex flex-col h-full",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-[#C15427]",
          "dark:focus-visible:ring-[#E18A68]",
          "focus-visible:ring-offset-4",
          "focus-visible:ring-offset-[#FCFAF7] dark:focus-visible:ring-offset-[#0B1117]",
        )}
      >
        {/* ── Image ──────────────────────────────────────────────────────── */}
        <div
          className={cn(
            "relative w-full overflow-hidden flex-shrink-0",
            "bg-[#F8F3EB] dark:bg-[#171F27]",
            imageAspectClass,
          )}
        >
          {mobileProps ? (
            <picture className="contents">
              <source
                media="(max-width: 639px)"
                srcSet={mobileProps.srcSet}
                sizes="100vw"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                {...desktopProps}
                alt={article.image.alt}
                className={cn(
                  "absolute inset-0 w-full h-full object-cover",
                  objPos,
                  "transition-transform duration-300 ease-out",
                  "group-hover:scale-[1.02]",
                  "motion-reduce:transform-none motion-reduce:transition-none",
                )}
                draggable={false}
              />
            </picture>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              {...desktopProps}
              alt={article.image.alt}
              className={cn(
                "absolute inset-0 w-full h-full object-cover",
                objPos,
                "transition-transform duration-300 ease-out",
                "group-hover:scale-[1.02]",
                "motion-reduce:transform-none motion-reduce:transition-none",
              )}
              draggable={false}
            />
          )}
        </div>

        {/* ── Article metadata and text ───────────────────────────────────── */}
        <div className="flex flex-col gap-3 pt-5 flex-1">
          {/* Category — copper accent, used sparingly */}
          <span
            className={cn(
              "text-[10px] tracking-[0.2em] uppercase font-light",
              "text-[#A94420] dark:text-[#E18A68]",
            )}
          >
            {article.category}
          </span>

          {/* Article title */}
          <ArticleHeading
            className={cn(
              "font-light leading-snug",
              isFeatured
                ? "text-xl sm:text-2xl lg:text-3xl"
                : "text-base sm:text-lg lg:text-xl",
              "text-[#231F20] dark:text-[#F8F5F0]",
              // Subtle underline on hover — editorial touch
              "group-hover:text-[#A94420] dark:group-hover:text-[#E18A68]",
              "transition-colors duration-150",
            )}
          >
            {article.title}
          </ArticleHeading>

          {/* Excerpt — always visible, not hover-dependent */}
          {showExcerpt && article.excerpt && (
            <p
              className={cn(
                "text-sm font-light leading-relaxed",
                isFeatured ? "max-w-lg" : "max-w-sm",
                "text-[#6C6662] dark:text-[#B8B2AC]",
                // Limit lines on secondary cards for visual balance
                !isFeatured && "line-clamp-2",
              )}
            >
              {article.excerpt}
            </p>
          )}

          {/* Publication metadata */}
          {hasMetadata && (
            <div
              className={cn(
                "flex items-center gap-2 mt-auto pt-2",
                "text-xs font-light tabular-nums",
                "text-[#6C6662] dark:text-[#B8B2AC]",
              )}
            >
              {showDate && formattedDate && (
                <time dateTime={article.publishedAt}>{formattedDate}</time>
              )}

              {/* Separator — only when both date and reading time exist */}
              {showDate && formattedDate && formattedReadingTime && (
                <span aria-hidden="true" className="select-none">
                  ·
                </span>
              )}

              {formattedReadingTime && <span>{formattedReadingTime}</span>}
            </div>
          )}

          {/* Read more indicator — visible on featured, subtle on secondary */}
          {isFeatured && (
            <div
              className={cn(
                "inline-flex items-center gap-1.5 mt-2",
                "text-xs tracking-[0.1em]",
                "text-[#231F20] dark:text-[#F8F5F0]",
                "border-b border-[#BDB5AD] dark:border-[#46515B]",
                "pb-0.5 w-fit",
                "group-hover:border-[#C15427] group-hover:text-[#A94420]",
                "dark:group-hover:border-[#C15427] dark:group-hover:text-[#E18A68]",
                "transition-colors duration-150",
              )}
            >
              {isRTL ? "مطالعه مقاله" : "Read article"}
              <ArrowIcon
                direction={isRTL ? "rtl" : "ltr"}
                size={14}
                className={cn(
                  "flex-shrink-0",
                  "transition-transform duration-150 motion-reduce:transition-none",
                  isRTL
                    ? "group-hover:-translate-x-1"
                    : "group-hover:translate-x-1",
                )}
              />
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
