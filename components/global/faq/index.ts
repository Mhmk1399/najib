/**
 * index.ts — Public API for the FAQ system.
 *
 * Import from:
 *   import { FaqSection, homepageFaqData } from '@/components/shared/faq';
 */

// ── Main export ────────────────────────────────────────────────────────────
export { FaqSection } from './faq-section';

// ── Sub-exports for standalone use ────────────────────────────────────────
export { FaqAnswer } from './faq-answer';
export { FaqJsonLd } from './faq-json-ld';

// ── Types ──────────────────────────────────────────────────────────────────
export type {
    FaqSectionProps,
    FaqItem,
    FaqAnswer as FaqAnswerType,
    FaqAnswerBlock,
    FaqParagraphBlock,
    FaqUnorderedListBlock,
    FaqOrderedListBlock,
    FaqLinkBlock,
    FaqAction,
    FaqAccordionMode,
    FaqHeadingElement,
    FaqSurface,
    FaqAccordionClientProps,
} from './faq.types';

// ── Example data ───────────────────────────────────────────────────────────
export { homepageFaqData } from './faq-data.example';