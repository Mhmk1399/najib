"use client";

/**
 * lenis-provider.tsx
 *
 * Lenis smooth scroll — رایگان، سبک، بدون نیاز به Club GSAP.
 * فقط برای دسکتاپ. موبایل native می‌مونه.
 * Reduced motion رو رعایت می‌کنه.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

interface LenisProviderProps {
  children: React.ReactNode;
}

type LenisWindow = Window & {
  __lenis?: Lenis;
};

export function LenisProvider({
  children,
}: LenisProviderProps): React.JSX.Element {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);
  const previousPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    if (!("scrollRestoration" in window.history)) return;

    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    if (!pathname) return;

    if (previousPathnameRef.current === null) {
      previousPathnameRef.current = pathname;
      return;
    }

    if (previousPathnameRef.current === pathname) return;
    previousPathnameRef.current = pathname;

    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      lenisRef.current?.scrollTo(0, {
        force: true,
        immediate: true,
        lock: false,
      });
      lenisRef.current?.resize();
    });

    return () => cancelAnimationFrame(frame);
  }, [pathname]);

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
    (window as LenisWindow).__lenis = lenis;

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
      if ((window as LenisWindow).__lenis === lenis) {
        delete (window as LenisWindow).__lenis;
      }
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
