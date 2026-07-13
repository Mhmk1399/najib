"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Full-bleed closing stage for the site wordmark.
 *
 * Behaviour
 * - Reveals exactly once, when ~35% of the stage has scrolled into view.
 * - The word rises out of an overflow mask while its letter-spacing, blur
 *   and opacity settle into place, flanked by two hairlines that draw
 *   themselves in just after the word lands.
 * - While the stage crosses the viewport, the whole composition drifts
 *   gently upward (scroll-linked parallax, rAF-throttled).
 * - `prefers-reduced-motion` disables both the transition and the drift.
 * - A <noscript> override keeps the wordmark visible without JavaScript.
 */

const REVEAL_THRESHOLD = 0.35;
const DRIFT_RANGE_PX = 56;
const EASE_OUT_EXPO = "ease-[cubic-bezier(0.16,1,0.3,1)]";

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function FooterWordmark({ wordmark }: { wordmark: string }) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  /* Reveal once, on first intersection. */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: REVEAL_THRESHOLD },
    );

    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  /* Scroll-linked parallax drift, written to a CSS variable. */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = stage.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const progress = clamp(
        (viewport - rect.top) / (viewport + rect.height),
        0,
        1,
      );
      stage.style.setProperty(
        "--wordmark-drift",
        `${((0.5 - progress) * DRIFT_RANGE_PX).toFixed(2)}px`,
      );
    };

    const requestUpdate = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });

    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  const hairlineClassName = cn(
    "h-px w-16 origin-center bg-gradient-to-r from-transparent via-[#A94420]/60 to-transparent sm:w-24",
    "transition-transform duration-[1200ms] motion-reduce:transition-none",
    "dark:via-[#E18A68]/60",
    EASE_OUT_EXPO,
    revealed ? "scale-x-100" : "scale-x-0",
  );

  return (
    <div
      ref={stageRef}
      className="relative flex min-h-[99svh] items-center justify-center overflow-hidden border-t border-[#DED8D1] bg-[#F6F2EB] dark:border-[#2C343C] dark:bg-[#070C11] lg:min-h-[99svh]"
    >
      {/* Atmosphere: a quiet terracotta glow behind the word. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_55%,rgba(169,68,32,0.07),transparent_70%)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_55%,rgba(225,138,104,0.10),transparent_70%)]"
      />

      <div
        className="relative flex w-full max-w-[1700px] flex-col items-center gap-8 px-5 will-change-transform sm:gap-10"
        style={{ transform: "translate3d(0, var(--wordmark-drift, 0px), 0)" }}
      >
        <span
          aria-hidden="true"
          data-wordmark-rule=""
          className={cn(hairlineClassName, "delay-[400ms]")}
        />

        {/* The mask carries the type scale so its padding tracks the glyph size. */}
        <div className="w-full overflow-hidden py-[0.08em] text-[clamp(2.75rem,10vw,8.5rem)] leading-[1.05]">
          <p
            data-wordmark=""
            className={cn(
              "text-center font-light text-[#231F20] dark:text-[#F8F5F0]",
              "transition-[transform,letter-spacing,filter,opacity] duration-[1600ms]",
              "will-change-transform motion-reduce:transition-none",
              EASE_OUT_EXPO,
              revealed
                ? "translate-y-0 tracking-[0.14em] opacity-100 blur-0"
                : "translate-y-[130%] tracking-[0.4em] opacity-0 blur-[10px]",
            )}
          >
            {wordmark}
          </p>
        </div>

        <span
          aria-hidden="true"
          data-wordmark-rule=""
          className={cn(hairlineClassName, "delay-[550ms]")}
        />
      </div>

      <noscript>
        <style>{`
          [data-wordmark] {
            transform: none !important;
            opacity: 1 !important;
            filter: none !important;
            letter-spacing: 0.14em !important;
          }
          [data-wordmark-rule] {
            transform: none !important;
          }
        `}</style>
      </noscript>
    </div>
  );
}
