"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

type HomeSectionEntranceVariant = "up" | "start" | "end" | "soft";

type HomeSectionEntranceProps = {
  readonly children: ReactNode;
  readonly variant?: HomeSectionEntranceVariant;
  readonly delay?: number;
  readonly className?: string;
};

const START_TRANSFORMS: Record<HomeSectionEntranceVariant, string> = {
  up: "translate3d(0, 46px, 0) scale(0.992)",
  start: "translate3d(34px, 38px, 0) scale(0.992)",
  end: "translate3d(-34px, 38px, 0) scale(0.992)",
  soft: "translate3d(0, 28px, 0) scale(0.996)",
};

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function HomeSectionEntrance({
  children,
  variant = "up",
  delay = 0,
  className,
}: HomeSectionEntranceProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      root.style.opacity = "1";
      root.style.transform = "none";
      return;
    }

    root.style.opacity = "0";
    root.style.transform = START_TRANSFORMS[variant];
    root.style.transformOrigin = "center top";
    root.style.willChange = "opacity, transform, filter";
    root.style.filter = "blur(2px)";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          observer.unobserve(root);

          if (typeof root.animate !== "function") {
            root.style.opacity = "1";
            root.style.transform = "none";
            root.style.filter = "none";
            root.style.willChange = "auto";
            continue;
          }

          const animation = root.animate(
            [
              {
                opacity: 0,
                transform: START_TRANSFORMS[variant],
                filter: "blur(2px)",
              },
              {
                opacity: 1,
                transform: "translate3d(0, 0, 0) scale(1)",
                filter: "blur(0)",
              },
            ],
            {
              duration: 760,
              delay,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              fill: "both",
            },
          );

          animation.onfinish = () => {
            root.style.opacity = "1";
            root.style.transform = "none";
            root.style.filter = "none";
            root.style.willChange = "auto";
          };
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -14% 0px" },
    );

    observer.observe(root);

    return () => {
      observer.disconnect();
      root.getAnimations().forEach((animation) => animation.cancel());
    };
  }, [delay, variant]);

  return (
    <div ref={rootRef} className={cn("overflow-clip", className)}>
      {children}
    </div>
  );
}
