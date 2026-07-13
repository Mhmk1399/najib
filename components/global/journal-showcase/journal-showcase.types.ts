/**
 * journal-showcase.types.ts
 *
 * All shared types for the JournalShowcase section.
 * Pure TypeScript — no runtime code.
 * Safe to import from Server and Client Components.
 */

// ---------------------------------------------------------------------------
// Image
// ---------------------------------------------------------------------------

export interface JournalImageSource {
  src: string;
  width: number;
  height: number;
}

export interface JournalArticleImage {
  /** Landscape or portrait desktop crop */
  desktop: JournalImageSource;
  /** Optional portrait mobile crop */
  mobile?: JournalImageSource;
  /** Meaningful description of the photograph */
  alt: string;
  objectPosition?:
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'center-left'
    | 'center-right';
}

// ---------------------------------------------------------------------------
// Article
// ---------------------------------------------------------------------------

export interface JournalArticle {
  /** Stable unique identifier — used as React key */
  id: string;
  /** URL-safe slug */
  slug: string;
  /** Article heading */
  title: string;
  /** Optional short editorial excerpt */
  excerpt?: string;
  /** Editorial category label */
  category: string;
  /** Internal article route */
  href: string;
  /** ISO 8601 date string — e.g. "2026-06-15" */
  publishedAt: string;
  /** Estimated reading time in minutes */
  readingTimeMinutes?: number;
  image: JournalArticleImage;
  /** When true, this article is preferred as the featured item */
  featured?: boolean;
}

// ---------------------------------------------------------------------------
// Section CTA
// ---------------------------------------------------------------------------

export interface JournalShowcaseAction {
  label: string;
  href: string;
  ariaLabel?: string;
}

// ---------------------------------------------------------------------------
// Section configuration
// ---------------------------------------------------------------------------

export type JournalShowcaseSurface = 'page' | 'warm' | 'surface';

/** h1 is intentionally excluded — this is a reusable section component */
export type JournalHeadingElement = 'h2' | 'h3';

// ---------------------------------------------------------------------------
// Section props
// ---------------------------------------------------------------------------

export interface JournalShowcaseProps {
  /** HTML id attribute on the section element */
  id?: string;
  eyebrow?: string;
  /** Section heading */
  title: string;
  /** Supporting description */
  description?: string;
  articles: readonly JournalArticle[];
  action?: JournalShowcaseAction;
  locale?: 'fa' | 'en';
  headingAs?: JournalHeadingElement;
  surface?: JournalShowcaseSurface;
  /**
   * ID of the article that should be rendered as the featured item.
   * Falls back to the first article with featured=true, then the first article.
   */
  featuredArticleId?: string;
  /** Maximum number of articles to render */
  maxItems?: number;
  showExcerpt?: boolean;
  showDate?: boolean;
  showReadingTime?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Article card props
// ---------------------------------------------------------------------------

export interface JournalArticleCardProps {
  article: JournalArticle;
  /** Controls visual weight and image ratio */
  variant: 'featured' | 'secondary';
  /**
   * Heading level for the article title.
   * Derived from the section headingAs to preserve hierarchy.
   * h2 section → h3 articles
   * h3 section → h4 articles
   */
  articleHeadingAs: 'h3' | 'h4';
  locale?: 'fa' | 'en';
  showExcerpt?: boolean;
  showDate?: boolean;
  showReadingTime?: boolean;
}