"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

import type { HomeCopy } from "@/lib/i18n/home-copy";
import { localizedHref } from "@/lib/i18n/routes";
import type { Locale } from "@/lib/i18n/config";
import type { CategoryItem } from "./CategoryShowcase";

type CategoryMarqueeProps = {
  categories: CategoryItem[];
  copy: HomeCopy["categories"];
  locale: Locale;
  direction: "rtl" | "ltr";
};

const REPEAT_COUNT = 3;
const SPEED_PX_PER_MS = 0.035;
const DRAG_START_THRESHOLD = 6;
const CLICK_SUPPRESSION_THRESHOLD = 4;
const MOMENTUM_MIN_VELOCITY = 0.018;

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  lastX: number;
  lastTime: number;
  startOffset: number;
  velocity: number;
  axis: "x" | "y" | null;
};

export function CategoryMarquee({
  categories,
  copy,
  locale,
  direction,
}: CategoryMarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const cycleWidthRef = useRef(0);
  const offsetRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const momentumFrameRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);
  const suppressClickTimeoutRef = useRef<number | null>(null);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [momentumActive, setMomentumActive] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const paused =
    hoverPaused || focusPaused || interactionPaused || momentumActive;

  const repeatedCategories = useMemo(
    () =>
      Array.from({ length: REPEAT_COUNT }, (_, cycle) =>
        categories.map((category) => ({
          category,
          key: `${cycle}-${category.id}`,
          isClone: cycle > 0,
        })),
      ).flat(),
    [categories],
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || categories.length === 0) return;

    const measure = () => {
      const first = track.children[0] as HTMLElement | undefined;
      const nextCycle = track.children[categories.length] as
        | HTMLElement
        | undefined;
      if (!first || !nextCycle) return;

      const firstRect = first.getBoundingClientRect();
      const nextRect = nextCycle.getBoundingClientRect();
      const cycleWidth = nextRect.left - firstRect.left;
      if (cycleWidth > 0) {
        cycleWidthRef.current = cycleWidth;
        offsetRef.current %= cycleWidth;
      }
    };

    measure();
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measure)
        : null;
    resizeObserver?.observe(track);
    window.addEventListener("resize", measure);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [categories.length]);

  const normalizeOffset = useCallback((value: number) => {
    const cycleWidth = cycleWidthRef.current;
    if (cycleWidth <= 0) return value;

    return ((value % cycleWidth) + cycleWidth) % cycleWidth;
  }, []);

  const applyOffset = useCallback(
    (value: number) => {
      const track = trackRef.current;
      if (!track) return;

      offsetRef.current = normalizeOffset(value);
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    },
    [normalizeOffset],
  );

  function cancelMomentum() {
    if (momentumFrameRef.current !== null) {
      window.cancelAnimationFrame(momentumFrameRef.current);
      momentumFrameRef.current = null;
    }

    setMomentumActive(false);
  }

  function startMomentum(initialVelocity: number) {
    cancelMomentum();

    if (Math.abs(initialVelocity) < MOMENTUM_MIN_VELOCITY) {
      setMomentumActive(false);
      return;
    }

    setMomentumActive(true);
    let velocity = initialVelocity;
    let previousTime: number | null = null;

    const glide = (time: number) => {
      const previous = previousTime ?? time;
      const delta = Math.min(time - previous, 48);
      previousTime = time;

      applyOffset(offsetRef.current + velocity * delta);
      velocity *= Math.pow(0.9, delta / 16.67);

      if (Math.abs(velocity) < MOMENTUM_MIN_VELOCITY) {
        momentumFrameRef.current = null;
        setMomentumActive(false);
        return;
      }

      momentumFrameRef.current = window.requestAnimationFrame(glide);
    };

    momentumFrameRef.current = window.requestAnimationFrame(glide);
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track || reducedMotion) return;

    const animate = (time: number) => {
      const previousTime = previousTimeRef.current ?? time;
      const delta = Math.min(time - previousTime, 48);
      previousTimeRef.current = time;

      const cycleWidth = cycleWidthRef.current;
      if (!paused && cycleWidth > 0) {
        offsetRef.current += delta * SPEED_PX_PER_MS;
        if (offsetRef.current >= cycleWidth) {
          offsetRef.current -= cycleWidth;
        }
        applyOffset(offsetRef.current);
      }

      frameRef.current = window.requestAnimationFrame(animate);
    };

    frameRef.current = window.requestAnimationFrame(animate);
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = null;
      previousTimeRef.current = null;
    };
  }, [applyOffset, paused, reducedMotion]);

  useEffect(() => {
    return () => {
      if (momentumFrameRef.current !== null) {
        window.cancelAnimationFrame(momentumFrameRef.current);
      }
      if (suppressClickTimeoutRef.current !== null) {
        window.clearTimeout(suppressClickTimeoutRef.current);
      }
    };
  }, []);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    cancelMomentum();
    if (suppressClickTimeoutRef.current !== null) {
      window.clearTimeout(suppressClickTimeoutRef.current);
      suppressClickTimeoutRef.current = null;
    }
    previousTimeRef.current = null;
    suppressClickRef.current = false;
    setInteractionPaused(true);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      startOffset: offsetRef.current,
      velocity: 0,
      axis: null,
    };

    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    const absoluteX = Math.abs(deltaX);
    const absoluteY = Math.abs(deltaY);

    if (!drag.axis) {
      if (
        absoluteX < DRAG_START_THRESHOLD &&
        absoluteY < DRAG_START_THRESHOLD
      ) {
        return;
      }

      drag.axis = absoluteX > absoluteY ? "x" : "y";
    }

    if (drag.axis === "y") return;

    event.preventDefault();
    setDragging(true);

    if (absoluteX > CLICK_SUPPRESSION_THRESHOLD) {
      suppressClickRef.current = true;
    }

    const elapsed = Math.max(event.timeStamp - drag.lastTime, 1);
    drag.velocity = -(event.clientX - drag.lastX) / elapsed;
    drag.lastX = event.clientX;
    drag.lastTime = event.timeStamp;

    applyOffset(drag.startOffset - deltaX);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    setInteractionPaused(false);
    setDragging(false);

    if (drag.axis === "x") {
      startMomentum(drag.velocity * 18);
    }

    if (suppressClickRef.current) {
      suppressClickTimeoutRef.current = window.setTimeout(() => {
        suppressClickRef.current = false;
        suppressClickTimeoutRef.current = null;
      }, 350);
    }
  }

  return (
    <div
      className="relative mt-10 overflow-hidden sm:mt-12 lg:mt-14"
      dir="ltr"
      onPointerEnter={() => setHoverPaused(true)}
      onPointerLeave={() => {
        setHoverPaused(false);
        if (!dragRef.current) {
          setInteractionPaused(false);
          setDragging(false);
        }
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClickCapture={(event) => {
        if (!suppressClickRef.current) return;

        event.preventDefault();
        event.stopPropagation();
        suppressClickRef.current = false;
        if (suppressClickTimeoutRef.current !== null) {
          window.clearTimeout(suppressClickTimeoutRef.current);
          suppressClickTimeoutRef.current = null;
        }
      }}
      onFocusCapture={() => setFocusPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocusPaused(false);
      }}
    >
      {/* <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[clamp(28px,8vw,140px)] bg-gradient-to-r from-[var(--cat-bg)] via-[var(--cat-bg)]/ to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[clamp(28px,8vw,140px)] bg-gradient-to-l from-[var(--cat-bg)] via-[var(--cat-bg)]/ to-transparent"
      /> */}

      <div
        ref={trackRef}
        className={`flex w-max touch-pan-y select-none gap-2.5 will-change-transform sm:gap-3 lg:gap-1 ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{ transform: "translate3d(0, 0, 0)" }}
      >
        {repeatedCategories.map(({ category, key, isClone }) => (
          <CategoryMarqueeCard
            key={key}
            category={category}
            copy={copy}
            locale={locale}
            direction={direction}
            isClone={isClone}
          />
        ))}
      </div>

      <span className="sr-only" aria-live="polite">
        {paused
          ? "حرکت دسته‌بندی‌ها متوقف است"
          : "دسته‌بندی‌ها در حال حرکت هستند"}
      </span>
    </div>
  );
}

function CategoryMarqueeCard({
  category,
  copy,
  locale,
  direction,
  isClone,
}: {
  category: CategoryItem;
  copy: HomeCopy["categories"];
  locale: Locale;
  direction: "rtl" | "ltr";
  isClone: boolean;
}) {
  return (
    <Link
      href={localizedHref(category.href, locale)}
      aria-label={`${copy.categoryAriaPrefix} ${category.name}`}
      aria-hidden={isClone || undefined}
      tabIndex={isClone ? -1 : undefined}
      data-image-story-id={category.imageAssetId}
      data-image-story-url={category.image}
      dir={direction}
      className="group relative isolate block aspect-[4/5] w-[min(78vw,310px)] shrink-0 overflow-hidden bg-[#0B0B0B] text-white outline-none focus-visible:ring-2 focus-visible:ring-black/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--cat-bg)] sm:aspect-[3/4] sm:w-[min(44vw,360px)] lg:w-[clamp(280px,25vw,400px)]"
    >
      <Image
        src={category.image}
        alt={category.imageAlt ?? category.name}
        fill
        draggable={false}
        sizes="(max-width: 639px) 78vw, (max-width: 1023px) 44vw, 25vw"
        style={
          {
            objectFit: category.imageFit ?? "cover",
            objectPosition: category.imagePosition ?? "center",
          } as CSSProperties
        }
        className="pointer-events-none select-none transition-transform duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0.03)_0%,rgba(11,11,11,0.07)_40%,rgba(11,11,11,0.78)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(11,11,11,0.20)_120%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-3 border border-white/[0.08] opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none sm:inset-4"
      />

      <div className="absolute inset-x-5 bottom-6 flex flex-col items-center text-center sm:inset-x-6 sm:bottom-7 lg:bottom-8">
        <h3 className="mt-2 text-balance text-[clamp(2.15rem,10vw,3.9rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-[clamp(2.3rem,6vw,4rem)] md:text-[clamp(2.3rem,3.5vw,2rem)]">
          {category.name}
        </h3>
        <span
          aria-hidden="true"
          className="mt-4 h-px w-8 bg-white/45 transition-[width,background-color] duration-500 group-hover:w-12 group-hover:bg-[var(--cat-accent)] motion-reduce:transition-none"
        />
      </div>
    </Link>
  );
}
