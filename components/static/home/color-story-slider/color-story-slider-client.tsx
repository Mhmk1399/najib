"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";

import type {
  ColorStoryContentTone,
  ColorStoryLocale,
  ColorStoryObjectPosition,
  ColorStorySlide,
} from "./color-story-slider.types";

const FALLBACK_COLOR = "#4B4642";
const DRAG_THRESHOLD_PX = 60;
const DRAG_INTENT_PX = 8;
const MAX_DRAG_VISIBLE_PX = 90;
const TRANSITION_DURATION_MS = 360;
const TRANSITION_TRAVEL_PX = 44;

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function isValidHex(value: string): value is `#${string}` {
  return /^#[0-9A-Fa-f]{3,8}$/.test(value);
}

function resolveDominantColor(raw: string): string {
  if (isValidHex(raw)) {
    return raw;
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `[ColorStorySlider] Invalid dominantColor "${raw}". Using fallback.`,
    );
  }

  return FALLBACK_COLOR;
}

const OBJECT_POSITION_CLASSES: Record<ColorStoryObjectPosition, string> = {
  center: "object-center",
  top: "object-top",
  bottom: "object-bottom",
  left: "object-left",
  right: "object-right",
  "center-left": "object-[35%_50%]",
  "center-right": "object-[65%_50%]",
};

type ToneClasses = {
  readonly primary: string;
  readonly secondary: string;
  readonly border: string;
  readonly frameBorder: string;
  readonly controlBorder: string;
  readonly controlText: string;
  readonly controlHover: string;
  readonly linkDecoration: string;
  readonly focusRing: string;
  readonly focusRingOffset: string;
};

const TONE_CLASSES: Record<ColorStoryContentTone, ToneClasses> = {
  light: {
    primary: "text-[#F8F5F0]",
    secondary: "text-white/75",
    border: "border-white/25",
    frameBorder: "border-white/15",
    controlBorder: "border-white/30",
    controlText: "text-white/80",
    controlHover: "hover:bg-white/10",
    linkDecoration: "decoration-white/40 hover:decoration-white",
    focusRing: "focus-visible:ring-white/60",
    focusRingOffset: "focus-visible:ring-offset-transparent",
  },
  dark: {
    primary: "text-[#231F20]",
    secondary: "text-black/65",
    border: "border-black/20",
    frameBorder: "border-black/10",
    controlBorder: "border-black/25",
    controlText: "text-black/65",
    controlHover: "hover:bg-black/5",
    linkDecoration: "decoration-black/30 hover:decoration-black/70",
    focusRing: "focus-visible:ring-black/30",
    focusRingOffset: "focus-visible:ring-offset-transparent",
  },
};

function PrevArrow({ tone }: { tone: ColorStoryContentTone }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      className={cn("size-5", TONE_CLASSES[tone].controlText)}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function NextArrow({ tone }: { tone: ColorStoryContentTone }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      className={cn("size-5", TONE_CLASSES[tone].controlText)}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function LinkArrow({ tone }: { tone: ColorStoryContentTone }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      className={cn("size-[18px] shrink-0", TONE_CLASSES[tone].primary)}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 12H5m0 0 6-6m-6 6 6 6"
      />
    </svg>
  );
}

type NavButtonProps = {
  readonly tone: ColorStoryContentTone;
  readonly direction: "prev" | "next";
  readonly ariaLabel: string;
  readonly onClick: () => void;
  readonly disabled: boolean;
};

function NavButton({
  tone,
  direction,
  ariaLabel,
  onClick,
  disabled,
}: NavButtonProps) {
  const toneClasses = TONE_CLASSES[tone];

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center border bg-transparent transition-colors duration-200",
        toneClasses.controlBorder,
        toneClasses.controlHover,
        toneClasses.controlText,
        "disabled:pointer-events-none disabled:opacity-40",
        "focus-visible:outline-none focus-visible:ring-2",
        toneClasses.focusRing,
        "focus-visible:ring-offset-2",
        toneClasses.focusRingOffset,
      )}
    >
      {direction === "prev" ? (
        <PrevArrow tone={tone} />
      ) : (
        <NextArrow tone={tone} />
      )}
    </button>
  );
}

type ColorStorySliderClientProps = {
  readonly slides: readonly ColorStorySlide[];
  readonly initialIndex: number;
  readonly enablePointerDrag: boolean;
  readonly locale: ColorStoryLocale;
  readonly sectionId: string;
};

export function ColorStorySliderClient({
  slides,
  initialIndex,
  enablePointerDrag,
  locale,
}: ColorStorySliderClientProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTargetIndex, setTransitionTargetIndex] = useState<
    number | null
  >(null);
  const [isTransitionArmed, setIsTransitionArmed] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const activeCardRef = useRef<HTMLDivElement>(null);

  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const currentDxRef = useRef(0);
  const horizontalIntentRef = useRef(false);
  const preventNextClickRef = useRef(false);

  const transitionDirectionRef = useRef<1 | -1>(1);

  const transitionTimerRef = useRef<number | null>(null);
  const rafOneRef = useRef<number | null>(null);

  const total = slides.length;
  const isRtl = locale === "fa";

  function clearTransitionTimer(): void {
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  }

  function clearRafs(): void {
    if (rafOneRef.current !== null) {
      window.cancelAnimationFrame(rafOneRef.current);
      rafOneRef.current = null;
    }
  }

  function clearScheduledWork(): void {
    clearTransitionTimer();
    clearRafs();
  }

  function getNextIndex(from: number): number {
    return (from + 1) % total;
  }

  function getPrevIndex(from: number): number {
    return (from - 1 + total) % total;
  }

  const activeSlide = slides[activeIndex];
  const nextSlide = total > 1 ? slides[getNextIndex(activeIndex)] : null;
  const prevSlide = total > 1 ? slides[getPrevIndex(activeIndex)] : null;
  const transitionTargetSlide =
    transitionTargetIndex !== null ? slides[transitionTargetIndex] : null;

  const dominantColor = activeSlide
    ? resolveDominantColor(activeSlide.dominantColor)
    : FALLBACK_COLOR;

  const tone: ColorStoryContentTone = activeSlide?.contentTone ?? "light";
  const toneClasses = TONE_CLASSES[tone];

  const objectPositionClass = activeSlide?.objectPosition
    ? OBJECT_POSITION_CLASSES[activeSlide.objectPosition]
    : "object-center";

  const nextObjectPositionClass = nextSlide?.objectPosition
    ? OBJECT_POSITION_CLASSES[nextSlide.objectPosition]
    : "object-center";

  const prevObjectPositionClass = prevSlide?.objectPosition
    ? OBJECT_POSITION_CLASSES[prevSlide.objectPosition]
    : "object-center";

  const transitionTargetObjectPositionClass =
    transitionTargetSlide?.objectPosition
      ? OBJECT_POSITION_CLASSES[transitionTargetSlide.objectPosition]
      : "object-center";

  function resetActiveCardStyles(): void {
    const el = activeCardRef.current;
    if (!el) return;

    el.style.transition = "";
    el.style.transform = "";
    el.style.opacity = "";
  }

  function prefersReducedMotion(): boolean {
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function getVisualDirection(action: "prev" | "next"): 1 | -1 {
    if (isRtl) {
      return action === "next" ? -1 : 1;
    }

    return action === "next" ? 1 : -1;
  }

  function announceSlide(index: number): void {
    const slide = slides[index];
    if (!slide) return;

    setAnnouncement(`${slide.title}، اسلاید ${index + 1} از ${total}`);
  }

  const startTransition = useCallback(
    (targetIndex: number, action: "prev" | "next") => {
      if (isTransitioning || total <= 1) return;

      const targetSlide = slides[targetIndex];
      if (!targetSlide) return;

      if (prefersReducedMotion()) {
        setActiveIndex(targetIndex);
        announceSlide(targetIndex);
        return;
      }

      clearScheduledWork();
      resetActiveCardStyles();

      const direction = getVisualDirection(action);

      transitionDirectionRef.current = direction;
      setIsTransitioning(true);
      setIsTransitionArmed(false);
      setTransitionTargetIndex(targetIndex);

      rafOneRef.current = window.requestAnimationFrame(() => {
        setIsTransitionArmed(true);
      });

      transitionTimerRef.current = window.setTimeout(() => {
        setActiveIndex(targetIndex);
        announceSlide(targetIndex);
        setTransitionTargetIndex(null);
        setIsTransitionArmed(false);
        setIsTransitioning(false);
        resetActiveCardStyles();
      }, TRANSITION_DURATION_MS + 40);
    },
    [isRtl, isTransitioning, slides, total],
  );

  const goNext = useCallback(() => {
    startTransition(getNextIndex(activeIndex), "next");
  }, [activeIndex, startTransition]);

  const goPrev = useCallback(() => {
    startTransition(getPrevIndex(activeIndex), "prev");
  }, [activeIndex, startTransition]);

  useEffect(() => {
    return () => {
      clearScheduledWork();
    };
  }, []);

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!enablePointerDrag || isTransitioning || total <= 1) return;
      if (e.button !== 0) return;

      pointerIdRef.current = e.pointerId;
      startXRef.current = e.clientX;
      startYRef.current = e.clientY;
      currentDxRef.current = 0;
      horizontalIntentRef.current = false;
    },
    [enablePointerDrag, isTransitioning, total],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (pointerIdRef.current !== e.pointerId || isTransitioning) return;

      const dx = e.clientX - startXRef.current;
      const dy = e.clientY - startYRef.current;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (!horizontalIntentRef.current) {
        if (absDx < DRAG_INTENT_PX && absDy < DRAG_INTENT_PX) return;

        if (absDx <= absDy) {
          pointerIdRef.current = null;
          return;
        }

        horizontalIntentRef.current = true;

        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {}
      }

      e.preventDefault();

      currentDxRef.current = dx;

      const el = activeCardRef.current;
      if (!el) return;

      const clampedDx =
        dx > 0
          ? Math.min(dx, MAX_DRAG_VISIBLE_PX)
          : Math.max(dx, -MAX_DRAG_VISIBLE_PX);

      const opacity = Math.max(0.58, 1 - absDx / 260);

      el.style.transition = "none";
      el.style.transform = `translate3d(${clampedDx}px, 0, 0)`;
      el.style.opacity = `${opacity}`;
    },
    [isTransitioning],
  );

  const handlePointerEnd = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (pointerIdRef.current !== e.pointerId) return;

      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}

      const dx = currentDxRef.current;

      pointerIdRef.current = null;
      currentDxRef.current = 0;
      horizontalIntentRef.current = false;

      if (Math.abs(dx) >= DRAG_THRESHOLD_PX) {
        preventNextClickRef.current = true;

        if (dx < 0) {
          if (isRtl) {
            goNext();
          } else {
            goPrev();
          }
        } else {
          if (isRtl) {
            goPrev();
          } else {
            goNext();
          }
        }

        return;
      }

      resetActiveCardStyles();
    },
    [goNext, goPrev, isRtl],
  );

  function handleKeyDown(e: ReactKeyboardEvent<HTMLDivElement>): void {
    if (total <= 1 || isTransitioning) return;

    if (e.key === "ArrowLeft") {
      e.preventDefault();

      if (isRtl) {
        goNext();
      } else {
        goPrev();
      }
    } else if (e.key === "ArrowRight") {
      e.preventDefault();

      if (isRtl) {
        goPrev();
      } else {
        goNext();
      }
    }
  }

  if (!activeSlide) {
    return null;
  }

  const interactiveFocusRing = cn(
    "focus-visible:outline-none focus-visible:ring-2",
    toneClasses.focusRing,
    "focus-visible:ring-offset-2",
    toneClasses.focusRingOffset,
  );

  const mobilePrevDirection = isRtl ? "next" : "prev";
  const mobileNextDirection = isRtl ? "prev" : "next";
  const transitionDirection = transitionDirectionRef.current;
  const activeLayerStyle: CSSProperties =
    transitionTargetSlide && isTransitioning
      ? {
          opacity: isTransitionArmed ? 0 : 1,
          transform: isTransitionArmed
            ? `translate3d(${transitionDirection * TRANSITION_TRAVEL_PX}px, 0, 0) scale(0.985)`
            : "translate3d(0, 0, 0) scale(1)",
          transition: isTransitionArmed
            ? `opacity ${TRANSITION_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), transform ${TRANSITION_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
            : "none",
        }
      : {};
  const targetLayerStyle: CSSProperties =
    transitionTargetSlide && isTransitioning
      ? {
          opacity: isTransitionArmed ? 1 : 0,
          transform: isTransitionArmed
            ? "translate3d(0, 0, 0) scale(1)"
            : `translate3d(${-transitionDirection * TRANSITION_TRAVEL_PX}px, 0, 0) scale(1.015)`,
          transition: isTransitionArmed
            ? `opacity ${TRANSITION_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), transform ${TRANSITION_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
            : "none",
        }
      : {};

  return (
    <div
      style={{ backgroundColor: dominantColor }}
      className="transition-colors duration-700 ease-out motion-reduce:transition-none"
    >
      <div className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 sm:py-24 lg:min-h-[760px] lg:px-12 lg:py-32 xl:px-16 2xl:px-20">
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16"
        >
          <div className="lg:col-span-7">
            <div
              role="group"
              aria-label={isRtl ? "تصویر اسلاید فعال" : "Active slide image"}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
              onKeyDown={handleKeyDown}
              tabIndex={total > 1 ? 0 : -1}
              className={cn(
                "relative select-none outline-none",
                total > 1 && !isTransitioning
                  ? "cursor-grab active:cursor-grabbing"
                  : "",
                "touch-pan-y",
                interactiveFocusRing,
              )}
            >
              <div className="relative">
                {nextSlide ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-[18px] scale-[0.96] opacity-45"
                  >
                    <div
                      className={cn(
                        "relative aspect-[4/5] overflow-hidden border lg:aspect-[4/3]",
                        toneClasses.frameBorder,
                      )}
                    >
                      <Image
                        src={nextSlide.image.src}
                        alt=""
                        fill
                        loading="lazy"
                        quality={80}
                        draggable={false}
                        sizes="(max-width: 1023px) 100vw, 56vw"
                        className={cn("object-cover", nextObjectPositionClass)}
                      />
                    </div>
                  </div>
                ) : null}

                {prevSlide && prevSlide.id !== nextSlide?.id ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-0"
                  >
                    <Image
                      src={prevSlide.image.src}
                      alt=""
                      fill
                      loading="lazy"
                      quality={80}
                      draggable={false}
                      sizes="(max-width: 1023px) 100vw, 56vw"
                      className={cn("object-cover", prevObjectPositionClass)}
                    />
                  </div>
                ) : null}

                <div
                  ref={activeCardRef}
                  className="relative z-10 will-change-transform"
                  style={activeLayerStyle}
                >
                  {activeSlide.href ? (
                    <Link
                      href={activeSlide.href}
                      aria-label={activeSlide.linkLabel ?? activeSlide.title}
                      tabIndex={isTransitioning ? -1 : 0}
                      className={cn("block", interactiveFocusRing)}
                      onClick={(e) => {
                        if (preventNextClickRef.current) {
                          e.preventDefault();
                          preventNextClickRef.current = false;
                        }
                      }}
                    >
                      <div
                        className={cn(
                          "relative aspect-[4/5] overflow-hidden border lg:aspect-[4/3]",
                          toneClasses.frameBorder,
                        )}
                      >
                        <Image
                          src={activeSlide.image.src}
                          alt={activeSlide.image.alt}
                          fill
                          loading="lazy"
                          quality={82}
                          draggable={false}
                          sizes="(max-width: 1023px) 100vw, 56vw"
                          className={cn("object-cover", objectPositionClass)}
                        />
                      </div>
                    </Link>
                  ) : (
                    <div
                      className={cn(
                        "relative aspect-[4/5] overflow-hidden border lg:aspect-[4/3]",
                        toneClasses.frameBorder,
                      )}
                    >
                      <Image
                        src={activeSlide.image.src}
                        alt={activeSlide.image.alt}
                        fill
                        loading="lazy"
                        quality={82}
                        draggable={false}
                        sizes="(max-width: 1023px) 100vw, 56vw"
                        className={cn("object-cover", objectPositionClass)}
                      />
                    </div>
                  )}
                </div>

                {transitionTargetSlide ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-20 will-change-transform"
                    style={targetLayerStyle}
                  >
                    <div
                      className={cn(
                        "relative aspect-[4/5] overflow-hidden border lg:aspect-[4/3]",
                        toneClasses.frameBorder,
                      )}
                    >
                      <Image
                        src={transitionTargetSlide.image.src}
                        alt=""
                        fill
                        loading="eager"
                        quality={82}
                        draggable={false}
                        sizes="(max-width: 1023px) 100vw, 56vw"
                        className={cn(
                          "object-cover",
                          transitionTargetObjectPositionClass,
                        )}
                      />
                    </div>
                  </div>
                ) : null}

                {total > 1 ? (
                  <div className="pointer-events-none absolute inset-x-3 top-1/2 z-20 flex -translate-y-1/2 items-center justify-between lg:hidden">
                    <div className="pointer-events-auto">
                      <NavButton
                        tone={tone}
                        direction={mobilePrevDirection}
                        ariaLabel={isRtl ? "اسلاید قبلی" : "Previous slide"}
                        onClick={goPrev}
                        disabled={isTransitioning}
                      />
                    </div>

                    <div className="pointer-events-auto">
                      <NavButton
                        tone={tone}
                        direction={mobileNextDirection}
                        ariaLabel={isRtl ? "اسلاید بعدی" : "Next slide"}
                        onClick={goNext}
                        disabled={isTransitioning}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {announcement}
            </div>

            <div
              className={cn(
                "transition-opacity duration-300 motion-reduce:transition-none",
                isTransitioning ? "opacity-75" : "opacity-100",
              )}
            >
              <p
                className={cn(
                  "text-[10px] tracking-[0.22em] sm:text-xs",
                  toneClasses.secondary,
                )}
                aria-hidden="true"
              >
                {activeSlide.number}
              </p>

              <h3
                className={cn(
                  "mt-4 text-2xl font-light leading-tight sm:text-3xl lg:text-4xl",
                  toneClasses.primary,
                )}
              >
                {activeSlide.title}
              </h3>

              <p
                className={cn(
                  "mt-4 max-w-lg text-sm leading-8 sm:text-base",
                  toneClasses.secondary,
                )}
              >
                {activeSlide.description}
              </p>

              {activeSlide.href && activeSlide.linkLabel ? (
                <div className="mt-8">
                  <Link
                    href={activeSlide.href}
                    className={cn(
                      "inline-flex min-h-11 items-center gap-3 text-sm underline underline-offset-4 transition-all duration-300",
                      toneClasses.linkDecoration,
                      toneClasses.primary,
                      interactiveFocusRing,
                    )}
                  >
                    <LinkArrow tone={tone} />
                    <span>{activeSlide.linkLabel}</span>
                  </Link>
                </div>
              ) : null}
            </div>

            {total > 1 ? (
              <>
                <div className={cn("mt-8 lg:hidden", toneClasses.secondary)}>
                  <p
                    className="text-[10px] tracking-[0.22em] tabular-nums sm:text-xs"
                    aria-hidden="true"
                  >
                    {String(activeIndex + 1).padStart(2, "0")}
                    {" / "}
                    {String(total).padStart(2, "0")}
                  </p>
                </div>

                <div
                  className={cn(
                    "mt-10 hidden items-center gap-3 border-t pt-8 lg:flex",
                    toneClasses.border,
                  )}
                >
                  <NavButton
                    tone={tone}
                    direction={isRtl ? "next" : "prev"}
                    ariaLabel={isRtl ? "اسلاید قبلی" : "Previous slide"}
                    onClick={goPrev}
                    disabled={isTransitioning}
                  />

                  <NavButton
                    tone={tone}
                    direction={isRtl ? "prev" : "next"}
                    ariaLabel={isRtl ? "اسلاید بعدی" : "Next slide"}
                    onClick={goNext}
                    disabled={isTransitioning}
                  />

                  <p
                    className={cn(
                      "ms-2 text-[10px] tracking-[0.22em] tabular-nums sm:text-xs",
                      toneClasses.secondary,
                    )}
                    aria-hidden="true"
                  >
                    {String(activeIndex + 1).padStart(2, "0")}
                    {" / "}
                    {String(total).padStart(2, "0")}
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
