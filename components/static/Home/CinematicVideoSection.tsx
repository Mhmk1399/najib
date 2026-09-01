"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";

import { brandColors } from "@/theme/theme-colors";

import { ArrowRightIcon, Button } from "@/components/ui/Button";

/* ==========================================================================
   TYPES
============================================================================ */

type VideoAction = {
  label: string;
  href: string;
};

type CinematicVideoSectionProps = {
  videoSrc: string;

  posterSrc: string;

  posterAlt?: string;

  eyebrow?: string;

  title: string;

  description?: string;

  primaryAction?: VideoAction;

  secondaryAction?: VideoAction;

  mobileVideoPosition?: string;

  desktopVideoPosition?: string;

  className?: string;
};

/* ==========================================================================
   COMPONENT
============================================================================ */

export function CinematicVideoSection({
  videoSrc,

  posterSrc,

  posterAlt = "",

  eyebrow = "The House",

  title,

  description,

  primaryAction,

  secondaryAction,

  mobileVideoPosition = "center top",

  desktopVideoPosition = "center",

  className = "",
}: CinematicVideoSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [shouldMountMedia, setShouldMountMedia] = useState(false);

  const [videoReady, setVideoReady] = useState(false);

  const [revealed, setRevealed] = useState(false);

  const [reducedMotion, setReducedMotion] = useState(false);

  const themeVars = {
    "--video-black": brandColors.black.hex,

    "--video-black-rgb": brandColors.black.rgb,

    "--video-white": brandColors.white.hex,

    "--video-copper": brandColors.copper.hex,

    "--video-mobile-position": mobileVideoPosition,

    "--video-desktop-position": desktopVideoPosition,
  } as CSSProperties;

  /* ==========================================================================
     REDUCED MOTION
  ========================================================================== */

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      setReducedMotion(media.matches);
    };

    update();

    media.addEventListener("change", update);

    return () => {
      media.removeEventListener("change", update);
    };
  }, []);

  /* ==========================================================================
     LAZY MEDIA MOUNT

     ویدیو در initial render وجود ندارد.
  ========================================================================== */

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setShouldMountMedia(true);

      return;
    }

    let cancelIdle: (() => void) | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        observer.disconnect();

        cancelIdle = runWhenBrowserIsIdle(() => {
          setShouldMountMedia(true);
        });
      },
      {
        /*
         * کمی قبل از رسیدن کاربر
         * شروع به آماده‌سازی کن.
         */
        rootMargin: "600px 0px 600px 0px",

        threshold: 0,
      },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();

      cancelIdle?.();
    };
  }, []);

  /* ==========================================================================
     REVEAL ONCE
  ========================================================================== */

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    if (reducedMotion) {
      setRevealed(true);

      return;
    }

    if (!("IntersectionObserver" in window)) {
      setRevealed(true);

      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        requestAnimationFrame(() => {
          setRevealed(true);
        });

        observer.disconnect();
      },
      {
        threshold: 0.14,

        rootMargin: "0px 0px -6% 0px",
      },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, [reducedMotion]);

  /* ==========================================================================
     PLAY / PAUSE

     فقط وقتی واقعاً visible است.
  ========================================================================== */

  useEffect(() => {
    if (!shouldMountMedia || reducedMotion) {
      return;
    }

    const section = sectionRef.current;

    const video = videoRef.current;

    if (!section || !video) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      {
        threshold: 0.15,
      },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();

      video.pause();
    };
  }, [shouldMountMedia, reducedMotion]);

  return (
    <section
      ref={sectionRef}
      style={themeVars}
      className={`
        relative
        isolate

        h-[100svh]
        min-h-[620px]

        w-full

        overflow-hidden

        bg-[var(--video-black)]
        text-[var(--video-white)]

        ${className}
      `}
    >
      {/* =====================================================
          POSTER
      ====================================================== */}

      {shouldMountMedia && (
        <img
          src={posterSrc}
          alt={posterAlt}
          draggable={false}
          decoding="async"
          fetchPriority="low"
          className={`
            absolute
            inset-0
            -z-40

            size-full

            object-cover
            object-[var(--video-mobile-position)]

            transition-opacity
            duration-700

            md:object-[var(--video-desktop-position)]

            ${videoReady ? "opacity-0" : "opacity-100"}
          `}
        />
      )}

      {/* =====================================================
          VIDEO
      ====================================================== */}

      {shouldMountMedia && !reducedMotion && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={() => {
            setVideoReady(true);
          }}
          className={`
              absolute
              inset-0
              -z-30

              size-full

              object-cover
              object-[var(--video-mobile-position)]

              transition-opacity
              duration-700

              md:object-[var(--video-desktop-position)]

              ${videoReady ? "opacity-100" : "opacity-0"}
            `}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* =====================================================
          OVERLAY
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0
          -z-20

          bg-[linear-gradient(180deg,rgb(var(--video-black-rgb)/0.10)_0%,rgb(var(--video-black-rgb)/0.02)_32%,rgb(var(--video-black-rgb)/0.10)_60%,rgb(var(--video-black-rgb)/0.66)_100%)]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0
          -z-20

          bg-[radial-gradient(circle_at_center,transparent_34%,rgb(var(--video-black-rgb)/0.26)_120%)]
        "
      />

      {/* Mobile bottom readability */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-x-0
          bottom-0
          -z-10

          h-[48%]

          bg-gradient-to-t
          from-black/70
          via-black/15
          to-transparent

          md:h-[36%]
          md:from-black/35
        "
      />

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div
        className="
          absolute
          inset-0
          z-10

          flex
          items-center
          justify-center

          px-5

          /*
           * موبایل:
           * فضای پایین برای CTAها.
           */
          pb-24

          sm:px-8

          md:pb-0
        "
      >
        <div
          className={`
            flex
            w-full
            max-w-[940px]

            flex-col
            items-center

            text-center

            transition-[opacity,transform]
            duration-[900ms]

            ease-[cubic-bezier(0.22,1,0.36,1)]

            ${
              revealed
                ? `
                  translate-y-0
                  opacity-100
                `
                : `
                  translate-y-10
                  opacity-0
                `
            }
          `}
        >
          {/* =================================================
              EYEBROW

              Copper فقط اینجاست.
          ================================================= */}

          <div
            className="
              mb-4

              flex
              items-center
              justify-center

              gap-3

              text-[7px]
              font-semibold

              uppercase
              tracking-[0.24em]

              text-white/70

              sm:text-[8px]

              md:mb-5
            "
          >
            <span
              className="
                h-px
                w-5

                bg-[var(--video-copper)]
              "
            />

            <span>{eyebrow}</span>

            <span
              className="
                h-px
                w-5

                bg-[var(--video-copper)]
              "
            />
          </div>

          {/* =================================================
              TITLE
          ================================================= */}

          <h2
            className="
              max-w-[880px]

              font-serif

              text-[clamp(3rem,12vw,4.5rem)]
              font-normal

              leading-[0.92]
              tracking-[-0.055em]

              text-white

              drop-shadow-[0_4px_24px_rgb(var(--video-black-rgb)/0.35)]

              sm:text-[clamp(3.6rem,9vw,5rem)]

              md:text-[clamp(4.5rem,6vw,6.5rem)]

              lg:text-[clamp(5rem,5.4vw,7rem)]
            "
          >
            {title}
          </h2>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          {description && (
            <p
              className="
                mt-5

                max-w-[360px]

                text-[9px]
                font-normal

                leading-[1.7]

                text-white/68

                sm:max-w-[430px]
                sm:text-[10px]

                md:max-w-[560px]
                md:text-[11px]

                lg:text-xs
              "
            >
              {description}
            </p>
          )}

          {/* =================================================
              DESKTOP ACTIONS
          ================================================= */}

          {(primaryAction || secondaryAction) && (
            <div
              className={`
                  mt-7

                  hidden
                  w-full
                  max-w-[470px]

                  grid-cols-2
                  gap-2

                  transition-[opacity,transform]
                  duration-700

                  md:grid

                  ${
                    revealed
                      ? `
                        translate-y-0
                        opacity-100

                        delay-200
                      `
                      : `
                        translate-y-4
                        opacity-0
                      `
                  }
                `}
            >
              {secondaryAction && (
                <Button
                  href={secondaryAction.href}
                  variant="cream"
                  size="lg"
                  icon={<ArrowRightIcon />}
                  fullWidth
                  className="
                      border-white/45
                      text-black

                      hover:border-white
                      hover:bg-white
                      hover:text-black
                    "
                >
                  {secondaryAction.label}
                </Button>
              )}

              {primaryAction && (
                <Button
                  href={primaryAction.href}
                  variant="copper"
                  size="lg"
                  icon={<ArrowRightIcon />}
                  fullWidth
                >
                  {primaryAction.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          MOBILE ACTIONS

          همیشه پایین.
          همیشه کنار هم.
      ====================================================== */}

      {(primaryAction || secondaryAction) && (
        <div
          className={`
              absolute

              inset-x-4
              bottom-[max(18px,env(safe-area-inset-bottom))]

              z-30

              grid
              grid-cols-2
              gap-2

              transition-[opacity,transform]
              duration-700

              ease-[cubic-bezier(0.22,1,0.36,1)]

              md:hidden

              ${
                revealed
                  ? `
                    translate-y-0
                    opacity-100

                    delay-200
                  `
                  : `
                    translate-y-5
                    opacity-0
                  `
              }
            `}
        >
          {secondaryAction ? (
            <Button
              href={secondaryAction.href}
              variant="outline"
              size="md"
              icon={<ArrowRightIcon />}
              fullWidth
              className="
                  min-w-0

                  border-white/45

                  bg-black/20

                  text-white

                  backdrop-blur-md

                  hover:border-white
                  hover:bg-white
                  hover:text-black
                "
            >
              {secondaryAction.label}
            </Button>
          ) : (
            <span />
          )}

          {primaryAction && (
            <Button
              href={primaryAction.href}
              variant="copper"
              size="md"
              icon={<ArrowRightIcon />}
              fullWidth
              className="min-w-0"
            >
              {primaryAction.label}
            </Button>
          )}
        </div>
      )}

   
    </section>
  );
}

/* ==========================================================================
   IDLE
============================================================================ */

function runWhenBrowserIsIdle(callback: () => void) {
  const browserWindow = window as Window & {
    requestIdleCallback?: (
      callback: () => void,

      options?: {
        timeout?: number;
      },
    ) => number;

    cancelIdleCallback?: (id: number) => void;
  };

  if (browserWindow.requestIdleCallback) {
    const id = browserWindow.requestIdleCallback(callback, {
      timeout: 700,
    });

    return () => {
      browserWindow.cancelIdleCallback?.(id);
    };
  }

  const timeout = window.setTimeout(callback, 100);

  return () => {
    window.clearTimeout(timeout);
  };
}
