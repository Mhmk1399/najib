"use client";

/**
 * lenis-provider.tsx
 *
 * Lenis smooth scroll — رایگان، سبک، بدون نیاز به Club GSAP.
 * فقط برای دسکتاپ. موبایل native می‌مونه.
 * Reduced motion رو رعایت می‌کنه.
 */

import { useEffect, useRef } from "react";
import Lenis from "lenis";

interface LenisProviderProps {
  children: React.ReactNode;
}

export function LenisProvider({
  children,
}: LenisProviderProps): React.JSX.Element {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Reduced motion — native scrolling
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) return;

    // ── Lenis init ────────────────────────────────────────────────────
    const lenis = new Lenis({
      duration: 1.1, // مدت زمان اسکرول — بیشتر = نرم‌تر
      easing: (
        t, // cubic-bezier ملایم
      ) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 0, // موبایل native باشه
      smoothWheel: true, // دسکتاپ smooth
      infinite: false,
    });

    lenisRef.current = lenis;

    // ── RAF loop ──────────────────────────────────────────────────────
    function raf(time: number): void {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }

    rafRef.current = requestAnimationFrame(raf);

    // ── Cleanup ───────────────────────────────────────────────────────
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
