"use client";

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

type SilentLookbookTrackProps = {
  readonly children: ReactNode;
  readonly enablePointerDrag: boolean;
  readonly locale: "fa" | "en";
  readonly trackLabel: string;
};

function getScrollBehavior(): ScrollBehavior {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return "auto";
  }
  return "smooth";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function SilentLookbookTrack({
  children,
  enablePointerDrag,
  locale,
  trackLabel,
}: SilentLookbookTrackProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [desktopScrollActive, setDesktopScrollActive] = useState(false);
  const [sceneHeight, setSceneHeight] = useState<number | null>(null);

  const pointerStartXRef = useRef<number>(0);
  const pointerStartYRef = useRef<number>(0);
  const scrollStartRef = useRef<number>(0);
  const activePointerIdRef = useRef<number | null>(null);
  const isDraggingHorizontallyRef = useRef<boolean>(false);
  const totalDragDistanceRef = useRef<number>(0);
  const preventNextClickRef = useRef<boolean>(false);
  const desktopScrollActiveRef = useRef(false);

  const DRAG_THRESHOLD_PX = 10;
  const CLICK_PREVENT_THRESHOLD_PX = 10;

  useEffect(() => {
    desktopScrollActiveRef.current = desktopScrollActive;
  }, [desktopScrollActive]);

  useEffect(() => {
    const scene = sceneRef.current;
    const container = containerRef.current;
    if (!scene || !container) return;

    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    let maxScroll = 0;
    let maxSceneScroll = 0;
    let sceneTop = 0;
    let rafId: number | null = null;

    const getIsActive = () =>
      desktopQuery.matches && !reducedMotionQuery.matches && maxScroll > 4;

    const setLogicalScroll = (progress: number) => {
      const nextScroll = maxScroll * progress;
      container.scrollLeft = locale === "fa" ? -nextScroll : nextScroll;
    };

    const updateScroll = () => {
      rafId = null;
      const isActive = getIsActive();
      if (!isActive) return;

      const progress = clamp(
        (window.scrollY - sceneTop) / Math.max(maxSceneScroll, 1),
        0,
        1,
      );
      setLogicalScroll(progress);
    };

    const requestScrollUpdate = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(updateScroll);
    };

    const measure = () => {
      maxScroll = Math.max(container.scrollWidth - container.clientWidth, 0);
      const shouldActivate = getIsActive();

      setDesktopScrollActive(shouldActivate);

      if (!shouldActivate) {
        setSceneHeight(null);
        container.scrollLeft = 0;
        return;
      }

      const nextSceneHeight = Math.ceil(window.innerHeight + maxScroll * 0.68);
      setSceneHeight(nextSceneHeight);

      const rect = scene.getBoundingClientRect();
      sceneTop = rect.top + window.scrollY;
      maxSceneScroll = Math.max(nextSceneHeight - window.innerHeight, 1);
      requestScrollUpdate();
    };

    measure();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measure)
        : null;
    resizeObserver?.observe(container);

    window.addEventListener("resize", measure);
    window.addEventListener("scroll", requestScrollUpdate, { passive: true });

    const handleMediaChange = () => measure();
    desktopQuery.addEventListener("change", handleMediaChange);
    reducedMotionQuery.addEventListener("change", handleMediaChange);

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      resizeObserver?.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", requestScrollUpdate);
      desktopQuery.removeEventListener("change", handleMediaChange);
      reducedMotionQuery.removeEventListener("change", handleMediaChange);
    };
  }, [locale]);

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!enablePointerDrag) return;
      if (desktopScrollActiveRef.current) return;
      if (e.button !== 0) return;
      const container = containerRef.current;
      if (!container) return;

      activePointerIdRef.current = e.pointerId;
      pointerStartXRef.current = e.clientX;
      pointerStartYRef.current = e.clientY;
      scrollStartRef.current = container.scrollLeft;
      isDraggingHorizontallyRef.current = false;
      totalDragDistanceRef.current = 0;
    },
    [enablePointerDrag],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!enablePointerDrag) return;
      if (desktopScrollActiveRef.current) return;
      if (activePointerIdRef.current !== e.pointerId) return;
      const container = containerRef.current;
      if (!container) return;

      const dx = e.clientX - pointerStartXRef.current;
      const dy = e.clientY - pointerStartYRef.current;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (!isDraggingHorizontallyRef.current) {
        if (absDx < DRAG_THRESHOLD_PX && absDy < DRAG_THRESHOLD_PX) return;
        if (absDx <= absDy) {
          activePointerIdRef.current = null;
          return;
        }
        isDraggingHorizontallyRef.current = true;
        try {
          container.setPointerCapture(e.pointerId);
        } catch {}
      }

      e.preventDefault();

      const isRtl = locale === "fa";
      const scrollDelta = isRtl ? dx : -dx;
      container.scrollLeft = scrollStartRef.current - scrollDelta;
      totalDragDistanceRef.current = absDx;
    },
    [enablePointerDrag, locale],
  );

  const handlePointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!enablePointerDrag) return;
      if (desktopScrollActiveRef.current) return;
      if (activePointerIdRef.current !== e.pointerId) return;
      const container = containerRef.current;

      if (container && isDraggingHorizontallyRef.current) {
        try {
          container.releasePointerCapture(e.pointerId);
        } catch {}
      }

      if (totalDragDistanceRef.current > CLICK_PREVENT_THRESHOLD_PX) {
        preventNextClickRef.current = true;
      }

      activePointerIdRef.current = null;
      isDraggingHorizontallyRef.current = false;
      totalDragDistanceRef.current = 0;
    },
    [enablePointerDrag],
  );

  const handlePointerCancel = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (activePointerIdRef.current !== e.pointerId) return;
      const container = containerRef.current;
      if (container && isDraggingHorizontallyRef.current) {
        try {
          container.releasePointerCapture(e.pointerId);
        } catch {}
      }
      activePointerIdRef.current = null;
      isDraggingHorizontallyRef.current = false;
      totalDragDistanceRef.current = 0;
    },
    [],
  );

  const handleClick = useCallback(() => {
    if (preventNextClickRef.current) {
      preventNextClickRef.current = false;
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      if (!container) return;

      const isRtl = locale === "fa";
      const behavior = getScrollBehavior();
      const stepSize = container.clientWidth * 0.7;

      const forwardKey = isRtl ? "ArrowLeft" : "ArrowRight";
      const backwardKey = isRtl ? "ArrowRight" : "ArrowLeft";

      if (e.key === forwardKey) {
        e.preventDefault();
        container.scrollBy({ left: stepSize, behavior });
      } else if (e.key === backwardKey) {
        e.preventDefault();
        container.scrollBy({ left: -stepSize, behavior });
      } else if (e.key === "Home") {
        e.preventDefault();
        container.scrollTo({
          left: isRtl ? container.scrollWidth : 0,
          behavior,
        });
      } else if (e.key === "End") {
        e.preventDefault();
        container.scrollTo({
          left: isRtl ? 0 : container.scrollWidth,
          behavior,
        });
      }
    },
    [locale],
  );

  return (
    <div
      ref={sceneRef}
      style={sceneHeight ? { height: sceneHeight } : undefined}
      className="relative overflow-x-hidden"
    >
      <div className="lg:sticky lg:top-20 lg:flex lg:min-h-[calc(100svh-5rem)] lg:items-center">
        <div
          ref={containerRef}
          role="region"
          aria-label={trackLabel}
          tabIndex={0}
          className={[
            desktopScrollActive
              ? "overflow-hidden overscroll-none"
              : "overflow-x-auto overflow-y-hidden overscroll-x-contain",
            desktopScrollActive
              ? "scroll-auto"
              : "scroll-smooth motion-reduce:scroll-auto",
            desktopScrollActive ? "touch-pan-y" : "touch-pan-x",
            "w-full",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A94420] dark:focus-visible:ring-[#E18A68]",
            "focus-visible:ring-offset-4 focus-visible:ring-offset-[#FCFAF7] dark:focus-visible:ring-offset-[#0B1117]",
            enablePointerDrag && !desktopScrollActive
              ? "cursor-grab active:cursor-grabbing"
              : "",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          ]
            .filter(Boolean)
            .join(" ")}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
