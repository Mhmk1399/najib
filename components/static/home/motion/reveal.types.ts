/**
 * reveal.types.ts
 *
 * All shared types for the Reveal animation system.
 * Pure TypeScript — no runtime code.
 * Safe to import from Server and Client Components.
 */

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

export type RevealVariant =
    | 'fade'
    | 'fade-up'
    | 'fade-down'
    | 'fade-start'
    | 'fade-end'
    | 'scale-soft';

// ---------------------------------------------------------------------------
// Timing — fixed allowed values ensure static Tailwind class detection
// ---------------------------------------------------------------------------

/** Stagger delay in milliseconds */
export type RevealDelay = 0 | 80 | 160 | 240 | 320 | 400;

/** Transition duration in milliseconds */
export type RevealDuration = 300 | 400 | 500 | 600;

// ---------------------------------------------------------------------------
// Trigger mode
// ---------------------------------------------------------------------------

/**
 * 'view'  → IntersectionObserver reveals when scrolled into viewport
 * 'load'  → reveals after hydration (for above-the-fold elements)
 */
export type RevealTrigger = 'view' | 'load';

// ---------------------------------------------------------------------------
// Wrapper element
// ---------------------------------------------------------------------------

export type RevealElement =
    | 'div'
    | 'section'
    | 'article'
    | 'header'
    | 'footer'
    | 'li'
    | 'aside';

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

export interface RevealProps {
    children: React.ReactNode;
    /** HTML element to render as the wrapper */
    as?: RevealElement;
    /** Animation variant */
    variant?: RevealVariant;
    /** Delay before transition starts */
    delay?: RevealDelay;
    /** Transition duration */
    duration?: RevealDuration;
    /** When to trigger the reveal */
    trigger?: RevealTrigger;
    /**
     * IntersectionObserver threshold.
     * 0.15 means 15% of the element must be visible.
     */
    threshold?: number;
    /**
     * IntersectionObserver rootMargin.
     * Negative bottom margin pulls the trigger point up.
     */
    rootMargin?: string;
    /**
     * When true (default), the animation runs exactly once.
     * Scrolling away and returning does not replay it.
     */
    once?: boolean;
    className?: string;
    id?: string;
}
