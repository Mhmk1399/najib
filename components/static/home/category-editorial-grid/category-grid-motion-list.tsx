"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import type { CategoryGridPosition } from "./category-editorial-grid.types";

type CategoryGridMotionListProps = {
  readonly children: ReactNode;
  readonly ariaLabel: string;
  readonly className: string;
};

const START_TRANSFORMS: Record<CategoryGridPosition, string> = {
  featured: "translate3d(34px, 42px, 0) scale(0.982)",
  "top-wide": "translate3d(30px, -34px, 0) scale(0.985)",
  "top-small": "translate3d(-30px, -34px, 0) scale(0.985)",
  "bottom-small": "translate3d(-30px, 34px, 0) scale(0.985)",
  "bottom-wide": "translate3d(0, 42px, 0) scale(0.985)",
};

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function CategoryGridMotionList({
  children,
  ariaLabel,
  className,
}: CategoryGridMotionListProps) {
  const rootRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const items = Array.from(
      root.querySelectorAll<HTMLElement>("[data-category-motion-item]"),
    );
    if (items.length === 0) return;

    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      items.forEach((item) => {
        item.style.opacity = "1";
        item.style.transform = "none";
      });
      return;
    }

    items.forEach((item) => {
      const position = item.dataset
        .categoryMotionPosition as CategoryGridPosition;
      item.style.opacity = "0";
      item.style.transform =
        START_TRANSFORMS[position] ?? START_TRANSFORMS.featured;
      item.style.transformOrigin = "center center";
      item.style.willChange = "opacity, transform";
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const item = entry.target as HTMLElement;
          observer.unobserve(item);

          const position = item.dataset
            .categoryMotionPosition as CategoryGridPosition;
          const delay = Number(item.dataset.categoryMotionDelay ?? 0);

          if (typeof item.animate !== "function") {
            item.style.opacity = "1";
            item.style.transform = "none";
            item.style.filter = "none";
            item.style.willChange = "auto";
            continue;
          }

          const animation = item.animate(
            [
              {
                opacity: 0,
                transform:
                  START_TRANSFORMS[position] ?? START_TRANSFORMS.featured,
                filter: "blur(2px)",
              },
              {
                opacity: 1,
                transform: "translate3d(0, 0, 0) scale(1)",
                filter: "blur(0)",
              },
            ],
            {
              duration: 720,
              delay,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              fill: "both",
            },
          );

          animation.onfinish = () => {
            item.style.opacity = "1";
            item.style.transform = "none";
            item.style.filter = "none";
            item.style.willChange = "auto";
          };
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -12% 0px" },
    );

    items.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
      items.forEach((item) => {
        item.getAnimations().forEach((animation) => animation.cancel());
      });
    };
  }, []);

  return (
    <ul ref={rootRef} role="list" aria-label={ariaLabel} className={className}>
      {children}
    </ul>
  );
}
