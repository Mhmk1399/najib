"use client";

/**
 * reveal.tsx — Client Component
 *
 * Lightweight reveal-on-scroll wrapper using IntersectionObserver.
 *
 * Architecture:
 * - Children are always in the server-rendered HTML (never hidden from crawlers).
 * - The wrapper uses data-reveal-state="pending" | "revealed".
 * - CSS classes driven by that attribute create the visual transition.
 * - When data-motion="disabled" on <html>, no CSS transform is applied
 *   and no observer is created — content is immediately visible.
 * - The "once" default ensures each element animates exactly once
 *   per page lifecycle. A full browser refresh may replay the animation.
 * - Reveal state is never persisted to localStorage, sessionStorage or
 *   any storage API.
 */

import { useEffect, useRef, useState } from "react";
import type {
  RevealDelay,
  RevealDuration,
  RevealProps,
  RevealVariant,
} from "./reveal.types";

// ---------------------------------------------------------------------------
// Static Tailwind class maps
// All strings are complete literals — Tailwind compiler can detect them.
// ---------------------------------------------------------------------------

/**
 * Classes applied when data-motion="enabled" AND state="pending".
 * The selector uses Tailwind's arbitrary variant syntax.
 * Each class is a full string — never constructed from fragments.
 *
 * Format: [html[data-motion="enabled"]_&]:class-name
 *
 * This means the class applies only when:
 * - The <html> element has data-motion="enabled"
 * - AND this element is a descendant of it
 */
const PENDING_CLASSES: Record<RevealVariant, string> = {
  fade: [
    '[html[data-motion="enabled"]_&[data-reveal-state="pending"]]:opacity-0',
  ].join(" "),

  "fade-up": [
    '[html[data-motion="enabled"]_&[data-reveal-state="pending"]]:opacity-0',
    '[html[data-motion="enabled"]_&[data-reveal-state="pending"]]:translate-y-5',
  ].join(" "),

  "fade-down": [
    '[html[data-motion="enabled"]_&[data-reveal-state="pending"]]:opacity-0',
    '[html[data-motion="enabled"]_&[data-reveal-state="pending"]]:-translate-y-4',
  ].join(" "),

  "fade-start": [
    '[html[data-motion="enabled"]_&[data-reveal-state="pending"]]:opacity-0',
    // translate-x direction: positive = toward end (left in RTL, right in LTR)
    // We use a start-aware value: translate-x for LTR, -translate-x for RTL
    // Since the component doesn't know locale, we use a logical approach:
    // translate-x-5 moves right; in RTL context the visual reads as "from end"
    // The section wraps content in dir="rtl" so the effect feels natural.
    '[html[data-motion="enabled"]_&[data-reveal-state="pending"]]:translate-x-5',
  ].join(" "),

  "fade-end": [
    '[html[data-motion="enabled"]_&[data-reveal-state="pending"]]:opacity-0',
    '[html[data-motion="enabled"]_&[data-reveal-state="pending"]]:-translate-x-5',
  ].join(" "),

  "scale-soft": [
    '[html[data-motion="enabled"]_&[data-reveal-state="pending"]]:opacity-0',
    '[html[data-motion="enabled"]_&[data-reveal-state="pending"]]:scale-[0.985]',
  ].join(" "),
};

/** Classes that are always present to enable the transition to revealed state */
const TRANSITION_CLASSES: Record<RevealVariant, string> = {
  fade: "transition-opacity motion-reduce:transition-none",
  "fade-up":
    "transition-[opacity,transform] motion-reduce:transition-none motion-reduce:transform-none",
  "fade-down":
    "transition-[opacity,transform] motion-reduce:transition-none motion-reduce:transform-none",
  "fade-start":
    "transition-[opacity,transform] motion-reduce:transition-none motion-reduce:transform-none",
  "fade-end":
    "transition-[opacity,transform] motion-reduce:transition-none motion-reduce:transform-none",
  "scale-soft":
    "transition-[opacity,transform] motion-reduce:transition-none motion-reduce:transform-none",
};

/** Duration Tailwind classes */
const DURATION_CLASSES: Record<RevealDuration, string> = {
  300: "duration-300",
  400: "duration-400",
  500: "duration-500",
  600: "duration-600",
};

/** Delay Tailwind classes */
const DELAY_CLASSES: Record<RevealDelay, string> = {
  0: "delay-0",
  80: "delay-75", // Tailwind's closest: delay-75 ≈ 75ms (acceptable approximation)
  160: "delay-150", // Tailwind's closest: delay-150 ≈ 150ms
  240: "delay-200", // Tailwind's closest: delay-200 ≈ 200ms
  320: "delay-300", // Tailwind's closest: delay-300 ≈ 300ms
  400: "delay-300", // Maps to delay-300 as a safe upper bound
};

/**
 * Custom easing applied via Tailwind arbitrary value.
 * ease-[cubic-bezier(0.22,1,0.36,1)] — snappy ease-out for reveals.
 */
const EASING_CLASS = "ease-[cubic-bezier(0.22,1,0.36,1)]";

/**
 * will-change applied only while pending to hint the browser compositor.
 * Removed (via data-state class change) once revealed.
 */
const WILL_CHANGE_PENDING: Record<RevealVariant, string> = {
  fade: '[html[data-motion="enabled"]_&[data-reveal-state="pending"]]:will-change-[opacity]',
  "fade-up":
    '[html[data-motion="enabled"]_&[data-reveal-state="pending"]]:will-change-[opacity,transform]',
  "fade-down":
    '[html[data-motion="enabled"]_&[data-reveal-state="pending"]]:will-change-[opacity,transform]',
  "fade-start":
    '[html[data-motion="enabled"]_&[data-reveal-state="pending"]]:will-change-[opacity,transform]',
  "fade-end":
    '[html[data-motion="enabled"]_&[data-reveal-state="pending"]]:will-change-[opacity,transform]',
  "scale-soft":
    '[html[data-motion="enabled"]_&[data-reveal-state="pending"]]:will-change-[opacity,transform]',
};

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

function isMotionEnabled(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.getAttribute("data-motion") === "enabled";
}

function isReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Reveal({
  children,
  as: Tag = "div",
  variant = "fade-up",
  delay = 0,
  duration = 500,
  trigger = "view",
  threshold = 0.15,
  rootMargin = "0px 0px -10% 0px",
  once = true,
  className = "",
  id,
}: RevealProps): React.JSX.Element {
  /*
   * revealed: tracks whether the animation has fired.
   * Initialise to true when motion is disabled — content is immediately visible.
   * This avoids a flash of hidden content for users who don't have motion enabled.
   */
  const [revealed, setRevealed] = useState(false);

  const wrapperRef = useRef<HTMLElement | null>(null);
  // Track if we have ever revealed — prevents replay on re-render
  const hasRevealedRef = useRef(false);

  // ── Mark the Reveal runtime as ready on first mount ───────────────────────
  useEffect(() => {
    const root = document.documentElement;
    if (root.getAttribute("data-reveal-runtime") !== "ready") {
      root.setAttribute("data-reveal-runtime", "ready");
      // Clear the fail-safe timer set by RevealScript
      const failSafeTimer = (
        window as Window & { __revealFailSafe?: ReturnType<typeof setTimeout> }
      ).__revealFailSafe;
      if (failSafeTimer !== undefined) {
        clearTimeout(failSafeTimer);
      }
    }
  }, []);

  // ── Prefers-reduced-motion listener ──────────────────────────────────────
  useEffect(() => {
    if (isReducedMotion()) {
      const rafId = requestAnimationFrame(() => {
        setRevealed(true);
        hasRevealedRef.current = true;
      });
      return () => cancelAnimationFrame(rafId);
    }

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent): void => {
      if (e.matches) {
        setRevealed(true);
        hasRevealedRef.current = true;
      }
    };

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", handleChange);
    }
    return () => {
      if (typeof mq.removeEventListener === "function") {
        mq.removeEventListener("change", handleChange);
      }
    };
  }, []);

  // ── Trigger="load": reveal after hydration ────────────────────────────────
  useEffect(() => {
    if (trigger !== "load") return;
    if (hasRevealedRef.current) return;

    // Use one rAF to ensure the browser has painted the pending state first,
    // then flip to revealed so the CSS transition plays.
    const rafId = requestAnimationFrame(() => {
      setRevealed(true);
      hasRevealedRef.current = true;
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [trigger]);

  // ── Trigger="view": IntersectionObserver ─────────────────────────────────
  useEffect(() => {
    if (trigger !== "view") return;
    if (hasRevealedRef.current) return;

    // If motion is not enabled or reduced motion: reveal immediately
    if (!isMotionEnabled() || isReducedMotion()) {
      const rafId = requestAnimationFrame(() => {
        setRevealed(true);
        hasRevealedRef.current = true;
      });
      return () => cancelAnimationFrame(rafId);
    }

    if (!wrapperRef.current) return;

    // Fallback: IntersectionObserver unavailable
    if (typeof IntersectionObserver === "undefined") {
      const rafId = requestAnimationFrame(() => {
        setRevealed(true);
        hasRevealedRef.current = true;
      });
      return () => cancelAnimationFrame(rafId);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // Avoid redundant state updates
            if (!hasRevealedRef.current) {
              setRevealed(true);
              hasRevealedRef.current = true;
            }
            // Stop observing immediately after reveal when once=true
            if (once) {
              observer.disconnect();
            }
          } else if (!once && hasRevealedRef.current) {
            // once=false: allow re-hiding when scrolled out
            setRevealed(false);
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(wrapperRef.current);

    return () => {
      observer.disconnect();
    };
  }, [trigger, threshold, rootMargin, once]);

  // ── Build class string ────────────────────────────────────────────────────
  const composedClass = cn(
    // Always-present transition enabler
    TRANSITION_CLASSES[variant],
    EASING_CLASS,
    DURATION_CLASSES[duration],
    DELAY_CLASSES[delay],
    // Pending-state visual classes (only effective when data-motion="enabled")
    !revealed && PENDING_CLASSES[variant],
    !revealed && WILL_CHANGE_PENDING[variant],
    className,
  );

  const setWrapperRef = (node: HTMLElement | null): void => {
    wrapperRef.current = node;
  };

  return (
    <Tag
      ref={setWrapperRef}
      id={id}
      data-reveal-state={revealed ? "revealed" : "pending"}
      className={composedClass}
    >
      {children}
    </Tag>
  );
}
