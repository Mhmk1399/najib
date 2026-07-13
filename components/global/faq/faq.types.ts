/**
 * faq.types.ts
 *
 * All shared types for the FAQ accordion system.
 * Pure TypeScript — no runtime code.
 * Safe to import from Server and Client Components.
 */

// ---------------------------------------------------------------------------
// Answer block types
// ---------------------------------------------------------------------------

export interface FaqParagraphBlock {
    type: 'paragraph';
    text: string;
}

export interface FaqUnorderedListBlock {
    type: 'unordered-list';
    items: readonly string[];
}

export interface FaqOrderedListBlock {
    type: 'ordered-list';
    items: readonly string[];
}

export interface FaqLinkBlock {
    type: 'link';
    label: string;
    href: string;
    external?: boolean;
    /** Text rendered immediately before the link */
    leadingText?: string;
}

export type FaqAnswerBlock =
    | FaqParagraphBlock
    | FaqUnorderedListBlock
    | FaqOrderedListBlock
    | FaqLinkBlock;

/**
 * An answer is either:
 * - a plain string (rendered as a single paragraph)
 * - an array of structured blocks (paragraph, list, link, etc.)
 */
export type FaqAnswer = string | readonly FaqAnswerBlock[];

// ---------------------------------------------------------------------------
// FAQ item
// ---------------------------------------------------------------------------

export interface FaqItem {
    /** Stable unique identifier — used as React key and element ID prefix */
    id: string;
    /** Visible question text */
    question: string;
    /** Answer content */
    answer: FaqAnswer;
}

// ---------------------------------------------------------------------------
// Section CTA
// ---------------------------------------------------------------------------

export interface FaqAction {
    label: string;
    href: string;
    ariaLabel?: string;
}

// ---------------------------------------------------------------------------
// Accordion behavior
// ---------------------------------------------------------------------------

/**
 * 'single'   → only one item may be open at a time
 * 'multiple' → any number of items may be open simultaneously
 */
export type FaqAccordionMode = 'single' | 'multiple';

// ---------------------------------------------------------------------------
// Section heading level
// ---------------------------------------------------------------------------

/** h1 is intentionally excluded — this is a reusable section component */
export type FaqHeadingElement = 'h2' | 'h3';

// ---------------------------------------------------------------------------
// Surface variant
// ---------------------------------------------------------------------------

export type FaqSurface = 'page' | 'warm' | 'surface';

// ---------------------------------------------------------------------------
// Section props
// ---------------------------------------------------------------------------

export interface FaqSectionProps {
    /** HTML id attribute — also used as the prefix for generated element IDs */
    id?: string;
    eyebrow?: string;
    title: string;
    description?: string;
    items: readonly FaqItem[];
    action?: FaqAction;
    locale?: 'fa' | 'en';
    mode?: FaqAccordionMode;
    /** IDs of items that should be open on initial render */
    defaultOpenIds?: readonly string[];
    /**
     * When true: clicking the only open item in single mode closes it.
     * When false: at least one item remains open once opened.
     */
    allowCollapse?: boolean;
    /** Generate FAQPage JSON-LD on the server */
    includeSchema?: boolean;
    headingAs?: FaqHeadingElement;
    surface?: FaqSurface;
    /** Render small editorial numbers beside questions */
    numbered?: boolean;
    className?: string;
}

// ---------------------------------------------------------------------------
// Accordion client props
// ---------------------------------------------------------------------------

export interface FaqAccordionClientProps {
    items: readonly FaqItem[];
    sectionId: string;
    mode: FaqAccordionMode;
    defaultOpenIds: readonly string[];
    allowCollapse: boolean;
    numbered: boolean;
    locale: 'fa' | 'en';
}