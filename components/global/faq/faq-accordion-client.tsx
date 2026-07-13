'use client';

/**
 * faq-accordion-client.tsx — Client Component
 *
 * Interactive FAQ accordion using native <details> + <summary> elements.
 *
 * KEY DECISIONS:
 *
 * NATIVE DETAILS:
 *   Native <details>/<summary> provides built-in keyboard support,
 *   correct ARIA disclosure semantics, and fallback without JavaScript.
 *   We intercept the toggle only to apply smooth animation.
 *
 * ANIMATION:
 *   Web Animations API animates the <details> height from the summary
 *   height to the full content height (open) or vice versa (close).
 *   We prevent the default toggle, manually set details.open, measure
 *   heights, and then animate. After animation, we restore normal behavior.
 *
 * STATE:
 *   The native details.open property is the single source of truth.
 *   We use a React state (openIds) only for the single-mode coordination:
 *   when one item opens, we need to find and close the previous one.
 *   We do NOT store per-item open state in React — we read it from the DOM.
 *
 * ANIMATION REF MAP:
 *   Running animations are stored in a Map<string, Animation> keyed by
 *   item ID. Before starting a new animation, we cancel the existing one.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { FaqAccordionClientProps, FaqItem } from './faq.types';
import { FaqAnswer } from './faq-answer';
import { MinusIcon, PlusIcon } from './faq-icons';

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

function toPad(n: number): string {
  return String(n).padStart(2, '0');
}

// ---------------------------------------------------------------------------
// Animation constants
// ---------------------------------------------------------------------------

const ANIMATION_DURATION = 280;
const ANIMATION_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FaqAccordionClient({
  items,
  sectionId,
  mode,
  defaultOpenIds,
  allowCollapse,
  numbered,
  locale,
}: FaqAccordionClientProps): React.JSX.Element {
  const isRTL = locale === 'fa';

  /*
   * openIds tracks which item IDs are currently open.
   * In single mode, this contains at most one ID.
   * In multiple mode, it may contain any number.
   *
   * We initialize from defaultOpenIds — clamped to one in single mode.
   */
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(() => {
    if (mode === 'single') {
      const first = defaultOpenIds[0];
      const valid = items.find((item) => item.id === first);
      return new Set(valid ? [first] : []);
    }
    // Multiple mode: validate all defaultOpenIds
    const valid = defaultOpenIds.filter((id) =>
      items.some((item) => item.id === id),
    );
    return new Set(valid);
  });

  // Map from item ID → running Animation instance
  const animationsRef = useRef<Map<string, Animation>>(new Map());

  // Reduced-motion preference — read once, updated via listener
  const reducedMotionRef = useRef<boolean>(false);

  // Track element wrapper ref
  const rootRef = useRef<HTMLDivElement>(null);

  // ── Detect reduced motion ─────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mq.matches;

    const handleChange = (e: MediaQueryListEvent): void => {
      reducedMotionRef.current = e.matches;
    };

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handleChange);
    }

    return () => {
      if (typeof mq.removeEventListener === 'function') {
        mq.removeEventListener('change', handleChange);
      }
    };
  }, []);

  // ── Cancel all animations on unmount ─────────────────────────────────────
  useEffect(() => {
    const map = animationsRef.current;
    return () => {
      map.forEach((anim) => anim.cancel());
      map.clear();
    };
  }, []);

  // ── Animation helper — animate one details element ────────────────────────

  const animateDetails = useCallback(
    (details: HTMLDetailsElement, opening: boolean): void => {
      const itemId = details.dataset.itemId ?? '';

      // Cancel any in-flight animation on this item
      const existing = animationsRef.current.get(itemId);
      if (existing) {
        existing.cancel();
        animationsRef.current.delete(itemId);
      }

      // Reduced motion — toggle immediately without animation
      if (reducedMotionRef.current || typeof details.animate !== 'function') {
        details.open = opening;
        return;
      }

      const summary = details.querySelector('summary');
      const content = details.querySelector<HTMLElement>('[data-faq-content]');
      if (!summary || !content) {
        details.open = opening;
        return;
      }

      const summaryHeight = summary.offsetHeight;

      if (opening) {
        // Must open first to measure full height
        details.open = true;
        const fullHeight = details.offsetHeight;

        const animation = details.animate(
          [
            { height: `${summaryHeight}px`, overflow: 'hidden' },
            { height: `${fullHeight}px`, overflow: 'hidden' },
          ],
          { duration: ANIMATION_DURATION, easing: ANIMATION_EASING, fill: 'none' },
        );

        // Animate content opacity simultaneously
        content.animate(
          [
            { opacity: '0.6', transform: 'translateY(3px)' },
            { opacity: '1',   transform: 'translateY(0px)' },
          ],
          { duration: ANIMATION_DURATION, easing: ANIMATION_EASING, fill: 'none' },
        );

        animationsRef.current.set(itemId, animation);

        animation.onfinish = (): void => {
          // Remove temporary inline constraints
          animationsRef.current.delete(itemId);
        };

        animation.oncancel = (): void => {
          animationsRef.current.delete(itemId);
        };
      } else {
        // Closing
        const fullHeight = details.offsetHeight;

        const animation = details.animate(
          [
            { height: `${fullHeight}px`, overflow: 'hidden' },
            { height: `${summaryHeight}px`, overflow: 'hidden' },
          ],
          { duration: ANIMATION_DURATION, easing: ANIMATION_EASING, fill: 'none' },
        );

        content.animate(
          [
            { opacity: '1',   transform: 'translateY(0px)' },
            { opacity: '0.6', transform: 'translateY(3px)' },
          ],
          { duration: ANIMATION_DURATION, easing: ANIMATION_EASING, fill: 'none' },
        );

        animationsRef.current.set(itemId, animation);

        animation.onfinish = (): void => {
          details.open = false;
          animationsRef.current.delete(itemId);
        };

        animation.oncancel = (): void => {
          // If cancelled mid-close, ensure correct state
          details.open = false;
          animationsRef.current.delete(itemId);
        };
      }
    },
    [],
  );

  // ── Close a specific item by ID ───────────────────────────────────────────

  const closeItem = useCallback(
    (itemId: string): void => {
      if (!rootRef.current) return;
      const details = rootRef.current.querySelector<HTMLDetailsElement>(
        `details[data-item-id="${CSS.escape(itemId)}"]`,
      );
      if (!details || !details.open) return;
      animateDetails(details, false);
    },
    [animateDetails],
  );

  // ── Toggle handler ────────────────────────────────────────────────────────

  const handleSummaryClick = useCallback(
    (e: React.MouseEvent<HTMLElement>, item: FaqItem): void => {
      /*
       * Prevent the browser from toggling details natively.
       * We control the open state manually to apply smooth animation
       * and coordinate single-mode closing.
       */
      e.preventDefault();

      const details = (e.currentTarget as HTMLElement).closest('details') as HTMLDetailsElement | null;
      if (!details) return;

      const isCurrentlyOpen = details.open;

      if (isCurrentlyOpen) {
        // Closing the currently open item
        if (!allowCollapse && mode === 'single') {
          // In single mode with allowCollapse=false, prevent closing
          return;
        }
        animateDetails(details, false);
        setOpenIds((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      } else {
        // Opening this item
        if (mode === 'single') {
          /*
           * Single mode: close any other open item first.
           * We find the previously open item from openIds state,
           * then animate it closed before opening the new one.
           */
          openIds.forEach((openId) => {
            if (openId !== item.id) {
              closeItem(openId);
            }
          });
          setOpenIds(new Set([item.id]));
        } else {
          // Multiple mode: just add this item
          setOpenIds((prev) => {
            const next = new Set(prev);
            next.add(item.id);
            return next;
          });
        }
        animateDetails(details, true);
      }
    },
    [mode, allowCollapse, openIds, animateDetails, closeItem],
  );

  // ── Keyboard handler — ensure Space works on summary ─────────────────────
  const handleSummaryKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>, item: FaqItem): void => {
      if (e.key === ' ') {
        // Space natively toggles details — we intercept to apply animation
        e.preventDefault();
        handleSummaryClick(e as unknown as React.MouseEvent<HTMLElement>, item);
      }
      // Enter is handled natively by the browser for summary elements
    },
    [handleSummaryClick],
  );

  // ── Generate stable element IDs ───────────────────────────────────────────

  const summaryId = (itemId: string): string =>
    `faq-${sectionId}-${itemId}-summary`;

  const contentId = (itemId: string): string =>
    `faq-${sectionId}-${itemId}-content`;

  return (
    <div
      ref={rootRef}
      className="relative flex flex-col"
    >
      {items.map((item, index) => {
        const isOpen = openIds.has(item.id);

        return (
          <details
            key={item.id}
            data-item-id={item.id}
            data-faq-item
            open={isOpen}
            className={cn(
              'group relative overflow-hidden',
              // Top border for every item
              'border-t border-[#DED8D1]/80 dark:border-[#2C343C]/85',
              // Last item also gets a bottom border
              'last:border-b last:border-[#DED8D1]/80 dark:last:border-[#2C343C]/85',
              'transition-colors duration-300 motion-reduce:transition-none',
              'open:bg-white/45 dark:open:bg-white/[0.035]',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute inset-y-4 start-0 w-px',
                'origin-top scale-y-0 bg-[#C15427] opacity-0',
                'transition duration-300 motion-reduce:transition-none',
                'group-open:scale-y-100 group-open:opacity-100',
              )}
            />

            {/* ── Summary — the clickable question row ─────────────────── */}
            <summary
              id={summaryId(item.id)}
              aria-controls={contentId(item.id)}
              onClick={(e) => handleSummaryClick(e, item)}
              onKeyDown={(e) => handleSummaryKeyDown(e, item)}
              className={cn(
                // Remove native summary marker
                'list-none [&::-webkit-details-marker]:hidden',
                // Layout
                'flex items-center px-1 sm:px-2',
                numbered ? 'gap-4 sm:gap-5' : 'gap-4',
                // Minimum touch target
                'min-h-[64px]',
                'py-5 sm:py-7',
                'cursor-pointer',
                'select-none',
                'transition-colors duration-300 motion-reduce:transition-none',
                'hover:text-[#A94420] dark:hover:text-[#E18A68]',
                // Focus
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-[#C15427]',
                'dark:focus-visible:ring-[#E18A68]',
                'focus-visible:ring-inset',
              )}
            >
              {/* Number — decorative, aria-hidden */}
              {numbered && (
                <span
                  aria-hidden="true"
                  className={[
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center',
                    'border border-[#DED8D1] dark:border-[#2C343C]',
                    'text-[10px] tabular-nums font-light',
                    'text-[#A94420] dark:text-[#E18A68]',
                    'transition-colors duration-300 motion-reduce:transition-none',
                    'group-open:border-[#C15427]/45 group-open:bg-[#C15427]/[0.06]',
                  ].join(' ')}
                >
                  {toPad(index + 1)}
                </span>
              )}

              {/* Question text */}
              <span
                className={cn(
                  'flex-1 min-w-0',
                  'text-base sm:text-lg lg:text-xl font-light leading-snug',
                  'text-[#231F20] dark:text-[#F8F5F0]',
                  'transition-colors duration-300 motion-reduce:transition-none',
                  'group-hover:text-[#A94420] dark:group-hover:text-[#E18A68]',
                  'group-open:text-[#231F20] dark:group-open:text-[#F8F5F0]',
                  isRTL ? 'text-start' : 'text-start',
                )}
              >
                {item.question}
              </span>

              {/* Toggle icon */}
              <span
                className={[
                  'ms-3 flex h-9 w-9 flex-shrink-0 items-center justify-center',
                  'border border-[#DED8D1] dark:border-[#2C343C]',
                  'text-[#6C6662] dark:text-[#B8B2AC]',
                  // Subtle color change when open
                  'group-open:border-[#C15427]/45 group-open:text-[#A94420] dark:group-open:text-[#E18A68]',
                  'transition-colors duration-300',
                ].join(' ')}
              >
                {isOpen ? (
                  <MinusIcon size={18} />
                ) : (
                  <PlusIcon size={18} />
                )}
              </span>
            </summary>

            {/* ── Answer content ───────────────────────────────────────── */}
            <div
              id={contentId(item.id)}
              data-faq-content
              role="region"
              aria-labelledby={summaryId(item.id)}
              className={cn(
                numbered ? 'ps-14 sm:ps-[4.25rem]' : 'ps-2 sm:ps-4',
                'pe-4 sm:pe-8',
                'pb-6 sm:pb-8',
              )}
            >
              <div className="max-w-2xl border-s border-[#DED8D1] ps-5 dark:border-[#2C343C]">
                <FaqAnswer answer={item.answer} locale={locale} />
              </div>
            </div>
          </details>
        );
      })}
    </div>
  );
}
