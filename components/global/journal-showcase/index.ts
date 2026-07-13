/**
 * index.ts — Public API for the JournalShowcase section.
 *
 * Import from:
 *   import { JournalShowcase } from '@/components/home/journal-showcase';
 */

// ── Main exports ───────────────────────────────────────────────────────────
export { JournalShowcase } from './journal-showcase';
export { JournalArticleCard } from './journal-article-card';

// ── Types ──────────────────────────────────────────────────────────────────
export type {
    JournalShowcaseProps,
    JournalArticle,
    JournalArticleImage,
    JournalImageSource,
    JournalShowcaseAction,
    JournalShowcaseSurface,
    JournalHeadingElement,
    JournalArticleCardProps,
} from './journal-showcase.types';

// ── Example data ───────────────────────────────────────────────────────────
export { homepageJournalShowcase } from './journal-showcase-data.example';