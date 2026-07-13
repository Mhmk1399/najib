"use client";

import { useRef, useEffect, type ReactNode } from "react";

type BrandStatementGsapBundle = {
  gsap: (typeof import("gsap"))["default"];
  ScrollTrigger: (typeof import("gsap/ScrollTrigger"))["ScrollTrigger"];
};

type BrandStatementGsap = BrandStatementGsapBundle["gsap"];
type BrandStatementTimeline = ReturnType<BrandStatementGsap["timeline"]>;
type BrandStatementContext = ReturnType<BrandStatementGsap["context"]>;

let gsapBundlePromise: Promise<BrandStatementGsapBundle> | null = null;

function loadBrandStatementGsap(): Promise<BrandStatementGsapBundle> {
  if (!gsapBundlePromise) {
    gsapBundlePromise = Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([gsapMod, stMod]) => {
      const gsap = gsapMod.default;
      const { ScrollTrigger } = stMod;
      gsap.registerPlugin(ScrollTrigger);
      return { gsap, ScrollTrigger };
    });
  }
  return gsapBundlePromise;
}

function checkReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function checkSaveData(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
  };
  return nav.connection?.saveData === true;
}

function checkIsMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

export type BrandStatementImageClientProps = {
  readonly children: ReactNode;
  readonly enableScrollReveal: boolean;
};

export function BrandStatementImageClient({
  children,
  enableScrollReveal,
}: BrandStatementImageClientProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const timelineRef = useRef<BrandStatementTimeline | null>(null);
  const localStRef = useRef<import("gsap/ScrollTrigger").ScrollTrigger | null>(
    null,
  );
  const completedRef = useRef(false);
  const mountedRef = useRef(true);
  const prepObsRef = useRef<IntersectionObserver | null>(null);
  const mobileObsRef = useRef<IntersectionObserver | null>(null);
  const gsapCtxRef = useRef<BrandStatementContext | null>(null);
  const mqCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    if (!enableScrollReveal || checkReducedMotion() || checkSaveData()) return;

    const root = rootRef.current;
    if (!root) return;

    function q<T extends Element>(selector: string): T | null {
      return root ? root.querySelector<T>(selector) : null;
    }

    function runDesktop(bundle: BrandStatementGsapBundle): void {
      if (!mountedRef.current || completedRef.current) return;

      const { gsap, ScrollTrigger } = bundle;
      const r = rootRef.current;
      if (!r) return;

      const stickyInner = q<HTMLElement>("[data-sticky-inner]");
      const leftCover = q<HTMLElement>("[data-left-cover]");
      const rightCover = q<HTMLElement>("[data-right-cover]");
      const overlay = q<HTMLElement>("[data-overlay]");
      const statementGroup = q<HTMLElement>("[data-statement-group]");
      const tagline = q<HTMLElement>("[data-tagline]");

      if (
        !stickyInner ||
        !leftCover ||
        !rightCover ||
        !overlay ||
        !statementGroup
      )
        return;

      const rect = r.getBoundingClientRect();
      if (rect.bottom < window.innerHeight * 0.15) return;

      const ctx = gsap.context(() => {
        gsap.set(leftCover, { xPercent: 0 });
        gsap.set(rightCover, { xPercent: 0 });
        gsap.set(stickyInner, {
          scale: 1.07,
          transformOrigin: "center center",
        });
        gsap.set(overlay, { opacity: 0.6 });
        gsap.set(statementGroup, { opacity: 0, y: 24 });
        if (tagline) gsap.set(tagline, { opacity: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: r,
            start: "top 90%",
            end: "bottom 35%",
            scrub: 0.85,
            invalidateOnRefresh: true,
            onLeave: () => {
              if (!mountedRef.current) return;
              completedRef.current = true;
              localStRef.current?.kill(false);
              localStRef.current = null;
            },
          },
        });

        tl.to(leftCover, { xPercent: -100, ease: "none" }, 0);
        tl.to(rightCover, { xPercent: 100, ease: "none" }, 0);
        tl.to(stickyInner, { scale: 1, ease: "none" }, 0);
        tl.to(overlay, { opacity: 1, ease: "none" }, 0.58);
        tl.to(statementGroup, { opacity: 1, y: 0, ease: "none" }, 0.58);
        if (tagline) tl.to(tagline, { opacity: 1, ease: "none" }, 0.88);

        timelineRef.current = tl;

        const allSt = ScrollTrigger.getAll();
        const last = allSt[allSt.length - 1];
        if (last) localStRef.current = last;
      }, r);

      gsapCtxRef.current = ctx;
    }

    function runMobile(bundle: BrandStatementGsapBundle): void {
      if (!mountedRef.current || completedRef.current) return;

      const { gsap } = bundle;
      const r = rootRef.current;
      if (!r) return;

      const obs = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            obs.disconnect();
            mobileObsRef.current = null;
            if (!mountedRef.current || completedRef.current) return;

            const stickyInner = q<HTMLElement>("[data-sticky-inner]");
            const leftCover = q<HTMLElement>("[data-left-cover]");
            const rightCover = q<HTMLElement>("[data-right-cover]");
            const overlay = q<HTMLElement>("[data-overlay]");
            const statementGroup = q<HTMLElement>("[data-statement-group]");
            const tagline = q<HTMLElement>("[data-tagline]");

            if (
              !stickyInner ||
              !leftCover ||
              !rightCover ||
              !overlay ||
              !statementGroup
            )
              return;

            const ctx = gsap.context(() => {
              gsap.set(leftCover, { xPercent: 0 });
              gsap.set(rightCover, { xPercent: 0 });
              gsap.set(stickyInner, {
                scale: 1.04,
                transformOrigin: "center center",
              });
              gsap.set(overlay, { opacity: 0.6 });
              gsap.set(statementGroup, { opacity: 0, y: 20 });
              if (tagline) gsap.set(tagline, { opacity: 0 });

              const tl = gsap.timeline({
                onComplete: () => {
                  completedRef.current = true;
                },
              });

              tl.to(
                leftCover,
                { xPercent: -100, duration: 1.15, ease: "power2.inOut" },
                0,
              );
              tl.to(
                rightCover,
                { xPercent: 100, duration: 1.15, ease: "power2.inOut" },
                0,
              );
              tl.to(
                stickyInner,
                { scale: 1, duration: 1.15, ease: "power2.out" },
                0,
              );
              tl.to(overlay, { opacity: 1, duration: 0.65, ease: "none" }, 0.58);
              tl.to(
                statementGroup,
                { opacity: 1, y: 0, duration: 0.72, ease: "power2.out" },
                0.62,
              );
              if (tagline)
                tl.to(
                  tagline,
                  { opacity: 1, duration: 0.45, ease: "none" },
                  1.08,
                );

              timelineRef.current = tl;
            }, r);

            gsapCtxRef.current = ctx;
          }
        },
        { threshold: 0.3 },
      );

      obs.observe(r);
      mobileObsRef.current = obs;
    }

    const prepObs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          prepObs.disconnect();
          prepObsRef.current = null;
          if (!mountedRef.current) return;

          loadBrandStatementGsap()
            .then((bundle) => {
              if (!mountedRef.current || completedRef.current) return;
              if (checkIsMobile()) {
                runMobile(bundle);
              } else {
                runDesktop(bundle);
              }
            })
            .catch(() => {
              if (process.env.NODE_ENV !== "production") {
                console.warn(
                  "[BrandStatementImage] GSAP failed to load. Section remains fully visible.",
                );
              }
            });
        }
      },
      { rootMargin: "700px 0px" },
    );

    prepObs.observe(root);
    prepObsRef.current = prepObs;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    function onMotionChange(e: MediaQueryListEvent): void {
      if (!e.matches) return;
      timelineRef.current?.kill();
      timelineRef.current = null;
      localStRef.current?.kill(false);
      localStRef.current = null;
      if (gsapCtxRef.current) {
        gsapCtxRef.current.revert();
        gsapCtxRef.current = null;
      }
    }
    mq.addEventListener("change", onMotionChange);
    mqCleanupRef.current = () =>
      mq.removeEventListener("change", onMotionChange);

    return () => {
      mountedRef.current = false;

      prepObsRef.current?.disconnect();
      prepObsRef.current = null;

      mobileObsRef.current?.disconnect();
      mobileObsRef.current = null;

      mqCleanupRef.current?.();
      mqCleanupRef.current = null;

      timelineRef.current?.kill();
      timelineRef.current = null;

      localStRef.current?.kill(false);
      localStRef.current = null;

      if (gsapCtxRef.current && !completedRef.current) {
        gsapCtxRef.current.revert();
      }
      gsapCtxRef.current = null;
    };
  }, [enableScrollReveal]);

  return (
    <div ref={rootRef} className="relative h-full w-full overflow-clip">
      {children}
    </div>
  );
}
