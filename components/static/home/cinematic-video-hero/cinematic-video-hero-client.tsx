"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic Video Hero — Client Component
//
// Responsibilities:
// - Two-video buffer engine with canplay/error handling
// - GSAP lazy import (desktop scroll-scale only)
// - matchMedia for mobile/desktop video source selection
// - IntersectionObserver for pause-when-offscreen
// - Visibility-change handling
// - Previous/Next/Pause/Play controls
// - Autoadvance on video end
// - Reduced motion and save-data support
// - Full cleanup on unmount
//
// Video elements render immediately — never conditional on mount or GSAP.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState, useEffect, useCallback, useId } from "react";
import Image from "next/image";
import Link from "next/link";
import type {
  CinematicVideoHeroClientProps,
  HeroSlide,
  HeroObjectPosition,
} from "./cinematic-video-hero.types";
import { DanaBlack } from "@/next-persian-fonts/dana";

// ── Static class maps — no dynamic Tailwind fragments ─────────────────────────

const OBJECT_POSITION: Record<HeroObjectPosition, string> = {
  center: "object-center",
  top: "object-top",
  bottom: "object-bottom",
  left: "object-left",
  right: "object-right",
  "center-left": "object-[35%_50%]",
  "center-right": "object-[65%_50%]",
};

// ── Timing constants ──────────────────────────────────────────────────────────

const VIDEO_CROSSFADE_DURATION = 0.6; // seconds — GSAP
const VIDEO_TIMEOUT_MS = 4000; // fallback when canplay never fires
const GSAP_IDLE_TIMEOUT_MS = 700;

// ── GSAP module cache (module-level) ─────────────────────────────────────────

type GsapBundle = {
  gsap: (typeof import("gsap"))["default"];
  ScrollTrigger: (typeof import("gsap/ScrollTrigger"))["ScrollTrigger"];
};

type GsapContext = ReturnType<
  (typeof import("gsap"))["default"]["context"]
>;
type GsapTimeline = ReturnType<
  (typeof import("gsap"))["default"]["timeline"]
>;

let gsapBundlePromise: Promise<GsapBundle> | null = null;

function loadGsapBundle(): Promise<GsapBundle> {
  if (gsapBundlePromise === null) {
    gsapBundlePromise = Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ])
      .then(([gsapMod, stMod]) => {
        const gsap = gsapMod.default;
        const { ScrollTrigger } = stMod;
        gsap.registerPlugin(ScrollTrigger);
        return { gsap, ScrollTrigger };
      })
      .catch((err) => {
        gsapBundlePromise = null;
        if (process.env.NODE_ENV === "development") {
          console.warn("[CinematicVideoHero] GSAP failed to load.", err);
        }
        throw err;
      });
  }
  return gsapBundlePromise;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CinematicVideoHeroClient({
  id,
  title,
  introduction,
  slides,
  initialIndex,
  autoAdvance,
  locale,
  className,
}: CinematicVideoHeroClientProps) {
  const headingId = useId();

  // ── UI state ──────────────────────────────────────────────────────────────
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // videoReady: whether the active buffer has fired canplay
  // Used to fade the video over the poster
  const [videoAReady, setVideoAReady] = useState(false);
  const [videoBReady, setVideoBReady] = useState(false);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const rootRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);

  // "A" or "B" — which buffer is currently active/visible
  const activeBufferRef = useRef<"A" | "B">("A");

  // Sequence ID to reject stale canplay callbacks
  const transitionSeqRef = useRef(0);
  const transitionLockRef = useRef(false);

  // Playback state for visibility/intersection resume logic
  const isPausedRef = useRef(false);
  const activeIndexRef = useRef(initialIndex);

  // GSAP refs
  const gsapBundleRef = useRef<GsapBundle | null>(null);
  const gsapContextRef = useRef<GsapContext | null>(null);
  const slideTlRef = useRef<GsapTimeline | null>(null);

  // Idle/timeout for GSAP scheduling
  const idleCallbackIdRef = useRef<number | null>(null);
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // matchMedia — mobile detection
  const isMobileRef = useRef(false);

  // IntersectionObserver
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Mounted guard
  const mountedRef = useRef(true);

  // ── Derived helpers ───────────────────────────────────────────────────────

  const getActiveVideo = useCallback((): HTMLVideoElement | null => {
    return activeBufferRef.current === "A"
      ? videoARef.current
      : videoBRef.current;
  }, []);

  const getInactiveVideo = useCallback((): HTMLVideoElement | null => {
    return activeBufferRef.current === "A"
      ? videoBRef.current
      : videoARef.current;
  }, []);

  const getCurrentSource = useCallback((slide: HeroSlide) => {
    return isMobileRef.current ? slide.mobileVideo : slide.desktopVideo;
  }, []);

  // ── Reduced-motion and save-data detection ────────────────────────────────

  const prefersReducedMotion = useRef(false);
  const saveData = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conn = (navigator as unknown as Record<string, unknown>).connection as
      | { saveData?: boolean; effectiveType?: string }
      | undefined;
    if (
      conn?.saveData === true ||
      conn?.effectiveType === "slow-2g" ||
      conn?.effectiveType === "2g"
    ) {
      saveData.current = true;
    }
  }, []);

  // ── matchMedia — mobile/desktop source selection ──────────────────────────

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    isMobileRef.current = mq.matches;

    function handleMediaChange(e: MediaQueryListEvent) {
      const wasMobile = isMobileRef.current;
      isMobileRef.current = e.matches;

      if (wasMobile === e.matches) return;
      if (saveData.current) return;

      // Reload current slide source for the new viewport type
      const slide = slides[activeIndexRef.current];
      if (!slide) return;
      const activeVideo = getActiveVideo();
      if (!activeVideo) return;

      const source = getCurrentSource(slide);
      activeVideo.muted = true;
      // Setting src directly (not via <source> key) here because we want
      // to preserve the existing buffer assignment; we just swap the URL.
      activeVideo.src = source.src;
      activeVideo.load();
      if (!isPausedRef.current && !prefersReducedMotion.current) {
        activeVideo.play().catch(() => {
          /* handled */
        });
      }
    }

    mq.addEventListener("change", handleMediaChange);
    return () => mq.removeEventListener("change", handleMediaChange);
  }, [slides, getActiveVideo, getCurrentSource]);

  // ── GSAP loading ──────────────────────────────────────────────────────────

  const ensureGsap = useCallback(async (): Promise<GsapBundle | null> => {
    if (gsapBundleRef.current) return gsapBundleRef.current;
    if (prefersReducedMotion.current) return null;
    if (saveData.current) return null;

    try {
      const bundle = await loadGsapBundle();
      if (!mountedRef.current) return null;
      gsapBundleRef.current = bundle;
      return bundle;
    } catch {
      return null;
    }
  }, []);

  const setupScrollEffect = useCallback((bundle: GsapBundle) => {
    if (!mountedRef.current) return;
    if (prefersReducedMotion.current) return;

    const root = rootRef.current;
    const frame = frameRef.current;
    const content = contentRef.current;

    if (!root || !frame) return;

    const { gsap, ScrollTrigger } = bundle;

    // Only on desktop
    const mm = gsap.matchMedia();

    if (gsapContextRef.current) {
      gsapContextRef.current.revert();
    }

    gsapContextRef.current = gsap.context(() => {
      mm.add("(min-width: 1024px)", () => {
        gsap.to(frame, {
          scale: 0.82,
          y: -24,
          ease: "none",
          transformOrigin: "center center",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });

        if (content) {
          gsap.to(content, {
            opacity: 0.82,
            y: -12,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });
        }

        return () => {
          ScrollTrigger.getAll().forEach((st) => {
            if (st.trigger === root) st.kill();
          });
        };
      });
    }, root);
  }, []);

  // Schedule GSAP after first paint
  useEffect(() => {
    if (prefersReducedMotion.current || saveData.current) return;

    function doLoad() {
      void ensureGsap().then((bundle) => {
        if (bundle) setupScrollEffect(bundle);
      });
    }

    if ("requestIdleCallback" in window) {
      idleCallbackIdRef.current = window.requestIdleCallback(doLoad, {
        timeout: GSAP_IDLE_TIMEOUT_MS,
      });
    } else {
      idleTimeoutRef.current = setTimeout(doLoad, GSAP_IDLE_TIMEOUT_MS);
    }

    return () => {
      if (
        idleCallbackIdRef.current !== null &&
        "cancelIdleCallback" in window
      ) {
        window.cancelIdleCallback(idleCallbackIdRef.current);
      }
      if (idleTimeoutRef.current !== null) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, [ensureGsap, setupScrollEffect]);

  // ── Initial video load ────────────────────────────────────────────────────

  useEffect(() => {
    if (saveData.current) return;
    if (prefersReducedMotion.current) return;

    const slide = slides[initialIndex];
    if (!slide) return;

    const videoA = videoARef.current;
    if (!videoA) return;

    const source = getCurrentSource(slide);
    videoA.muted = true;

    // Play will be triggered by the canplay / loadeddata handler below.
    // We just need to ensure the source is correct and load() is called.
    // The <source> key approach in JSX handles this declaratively for the
    // initial render. This effect is a safety net.
    if (!videoA.src || videoA.src !== source.src) {
      videoA.src = source.src;
      videoA.load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Crossfade using GSAP or CSS ───────────────────────────────────────────

  const crossfadeBuffers = useCallback(
    async (outgoing: HTMLVideoElement, incoming: HTMLVideoElement) => {
      const bundle = gsapBundleRef.current ?? (await ensureGsap());

      if (!bundle || prefersReducedMotion.current) {
        // CSS fallback
        outgoing.style.opacity = "0";
        outgoing.style.transition = `opacity ${VIDEO_CROSSFADE_DURATION}s ease`;
        incoming.style.opacity = "1";
        incoming.style.transition = `opacity ${VIDEO_CROSSFADE_DURATION}s ease`;
        return;
      }

      const { gsap } = bundle;

      if (slideTlRef.current) {
        slideTlRef.current.kill();
      }

      const tl = gsap.timeline();
      slideTlRef.current = tl;

      gsap.set(incoming, { opacity: 0, scale: 1.02 });

      tl.to(outgoing, {
        opacity: 0,
        duration: VIDEO_CROSSFADE_DURATION,
        ease: "power2.inOut",
      }).to(
        incoming,
        {
          opacity: 1,
          scale: 1,
          duration: VIDEO_CROSSFADE_DURATION,
          ease: "power2.out",
        },
        "<",
      );
    },
    [ensureGsap],
  );

  const animateTextChange = useCallback(
    async (contentEl: HTMLElement | null) => {
      if (!contentEl) return;

      const bundle = gsapBundleRef.current ?? (await ensureGsap());
      if (!bundle || prefersReducedMotion.current) return;

      const { gsap } = bundle;
      const targets = contentEl.querySelectorAll("[data-slide-content]");
      if (targets.length === 0) return;

      gsap.fromTo(
        targets,
        { y: 14, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.06,
          ease: "power2.out",
        },
      );
    },
    [ensureGsap],
  );

  // ── Transition to a specific slide ────────────────────────────────────────

  const transitionToSlide = useCallback(
    (targetIndex: number) => {
      if (!mountedRef.current) return;
      if (transitionLockRef.current) return;
      if (targetIndex === activeIndexRef.current) return;
      if (targetIndex < 0 || targetIndex >= slides.length) return;
      if (saveData.current) {
        // Save-data: just update state, no video loading
        activeIndexRef.current = targetIndex;
        setActiveIndex(targetIndex);
        return;
      }

      transitionLockRef.current = true;
      setIsTransitioning(true);

      const seq = ++transitionSeqRef.current;
      const targetSlide = slides[targetIndex];
      if (!targetSlide) {
        transitionLockRef.current = false;
        setIsTransitioning(false);
        return;
      }

      const incomingBuffer = activeBufferRef.current === "A" ? "B" : "A";
      const incomingVideo =
        incomingBuffer === "A" ? videoARef.current : videoBRef.current;
      const outgoingVideo = getActiveVideo();

      if (!incomingVideo || !outgoingVideo) {
        transitionLockRef.current = false;
        setIsTransitioning(false);
        return;
      }

      const source = getCurrentSource(targetSlide);

      // Prepare incoming video
      incomingVideo.muted = true;
      incomingVideo.src = source.src;
      incomingVideo.preload = "auto";
      incomingVideo.load();

      // Timeout fallback if canplay never fires
      const timeoutId = setTimeout(() => {
        if (!mountedRef.current) return;
        if (transitionSeqRef.current !== seq) return;

        // Fallback: update UI without video crossfade
        activeIndexRef.current = targetIndex;
        activeBufferRef.current = incomingBuffer;
        setActiveIndex(targetIndex);

        if (incomingBuffer === "A") {
          setVideoAReady(false);
          setVideoBReady(false);
        } else {
          setVideoBReady(false);
          setVideoAReady(false);
        }

        outgoingVideo.pause();
        outgoingVideo.currentTime = 0;

        transitionLockRef.current = false;
        setIsTransitioning(false);
      }, VIDEO_TIMEOUT_MS);

      function onCanPlay() {
        if (!mountedRef.current) return;
        if (transitionSeqRef.current !== seq) return;

        clearTimeout(timeoutId);
        cleanup();

        if (!isPausedRef.current) {
          incomingVideo!.play().catch(() => {
            /* autoplay blocked */
          });
        }

        // Update active index and buffer before crossfade
        activeIndexRef.current = targetIndex;
        activeBufferRef.current = incomingBuffer;
        setActiveIndex(targetIndex);

        if (incomingBuffer === "A") {
          setVideoAReady(true);
          setVideoBReady(false);
        } else {
          setVideoBReady(true);
          setVideoAReady(false);
        }

        void crossfadeBuffers(outgoingVideo!, incomingVideo!).then(() => {
          if (!mountedRef.current) return;
          outgoingVideo!.pause();
          outgoingVideo!.currentTime = 0;
          outgoingVideo!.preload = "none";
          transitionLockRef.current = false;
          setIsTransitioning(false);
        });

        // Animate text
        void animateTextChange(contentRef.current);
      }

      function onError() {
        if (!mountedRef.current) return;
        if (transitionSeqRef.current !== seq) return;

        clearTimeout(timeoutId);
        cleanup();

        // Keep poster visible — just update text
        activeIndexRef.current = targetIndex;
        activeBufferRef.current = incomingBuffer;
        setActiveIndex(targetIndex);

        transitionLockRef.current = false;
        setIsTransitioning(false);
      }

      function cleanup() {
        incomingVideo!.removeEventListener("canplay", onCanPlay);
        incomingVideo!.removeEventListener("error", onError);
      }

      if (incomingVideo.readyState >= 3) {
        onCanPlay();
      } else {
        incomingVideo.addEventListener("canplay", onCanPlay, { once: true });
        incomingVideo.addEventListener("error", onError, { once: true });
      }
    },
    [
      slides,
      getActiveVideo,
      getCurrentSource,
      crossfadeBuffers,
      animateTextChange,
    ],
  );

  // ── Navigation handlers ───────────────────────────────────────────────────
 

 

 

  // ── Initial video play (after canplay) ────────────────────────────────────

  useEffect(() => {
    if (saveData.current || prefersReducedMotion.current) return;

    const videoA = videoARef.current;
    if (!videoA) return;

    function onCanPlay() {
      if (!mountedRef.current) return;
      setVideoAReady(true);
      videoA!.muted = true;
      if (!isPausedRef.current) {
        videoA!.play().catch(() => {
          /* blocked */
        });
      }
    }

    function onError() {
      // Keep poster visible — nothing extra needed
      setVideoAReady(false);
    }

    if (videoA.readyState >= 3) {
      onCanPlay();
    } else {
      videoA.addEventListener("canplay", onCanPlay, { once: true });
      videoA.addEventListener("error", onError, { once: true });
    }

    return () => {
      videoA.removeEventListener("canplay", onCanPlay);
      videoA.removeEventListener("error", onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-advance on video ended ───────────────────────────────────────────

  useEffect(() => {
    if (!autoAdvance || slides.length < 2) return;

    const video = getActiveVideo();
    if (!video) return;

    function onEnded() {
      if (!mountedRef.current) return;
      if (isPausedRef.current) return;
      const next = (activeIndexRef.current + 1) % slides.length;
      transitionToSlide(next);
    }

    video.addEventListener("ended", onEnded);
    return () => video.removeEventListener("ended", onEnded);
  }, [
    activeIndex,
    autoAdvance,
    slides.length,
    getActiveVideo,
    transitionToSlide,
  ]);

  // ── IntersectionObserver ──────────────────────────────────────────────────

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let inView = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const nowInView = entry.isIntersecting;
        if (nowInView === inView) return;
        inView = nowInView;

        const video = getActiveVideo();
        if (!video) return;

        if (!nowInView) {
          video.pause();
        } else if (
          !isPausedRef.current &&
          !prefersReducedMotion.current &&
          !saveData.current
        ) {
          video.play().catch(() => {
            /* blocked */
          });
        }
      },
      { threshold: 0.1 },
    );

    observerRef.current = observer;
    observer.observe(root);

    return () => observer.disconnect();
  }, [getActiveVideo]);

  // ── Visibility change ─────────────────────────────────────────────────────

  useEffect(() => {
    function onVisibilityChange() {
      const videoA = videoARef.current;
      const videoB = videoBRef.current;

      if (document.hidden) {
        videoA?.pause();
        videoB?.pause();
      } else {
        const active = getActiveVideo();
        if (
          active &&
          !isPausedRef.current &&
          !prefersReducedMotion.current &&
          !saveData.current
        ) {
          active.play().catch(() => {
            /* blocked */
          });
        }
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [getActiveVideo]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      mountedRef.current = false;

      videoARef.current?.pause();
      videoBRef.current?.pause();

      if (slideTlRef.current) {
        slideTlRef.current.kill();
      }
      if (gsapContextRef.current) {
        gsapContextRef.current.revert();
      }

      if (
        idleCallbackIdRef.current !== null &&
        "cancelIdleCallback" in window
      ) {
        window.cancelIdleCallback(idleCallbackIdRef.current);
      }
      if (idleTimeoutRef.current !== null) {
        clearTimeout(idleTimeoutRef.current);
      }

      observerRef.current?.disconnect();
    };
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────

  const activeSlide = slides[activeIndex];
   
  const multiSlide = slides.length > 1;

  // Active poster
  const activePoster = isMobileRef.current
    ? activeSlide?.mobilePoster
    : activeSlide?.desktopPoster;

  const objectPositionClass =
    OBJECT_POSITION[activeSlide?.objectPosition ?? "center"];

  // Buffer A is active when activeBufferRef says "A"
  // We derive class from state, not ref, to keep React in sync
  const bufferIsA = activeBufferRef.current === "A";
  const videoAVisible = bufferIsA && videoAReady;
  const videoBVisible = !bufferIsA && videoBReady;

  // Source keys — force video reload when slide/buffer/breakpoint changes
  const videoASlide = slides.find(
    (s, i) =>
      i ===
      (bufferIsA
        ? activeIndex
        : (activeIndex - 1 + slides.length) % slides.length),
  );
  const videoBSlide = slides.find(
    (s, i) =>
      i ===
      (!bufferIsA
        ? activeIndex
        : (activeIndex - 1 + slides.length) % slides.length),
  );

  const isRtl = locale === "fa";

  const focusRing =
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C15427] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

  // ── Render ────────────────────────────────────────────────────────────────

  if (!activeSlide) return null;

  return (
    <section
      id={id}
      ref={rootRef}
      aria-labelledby={`${headingId}-h1`}
      dir={isRtl ? "rtl" : "ltr"}
      className={[
        "relative w-full",
        "min-h-[680px] h-[100svh] max-h-[1080px]",
        "bg-[#231F20]", // fallback while poster loads
        "overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* ── Video frame — GSAP scroll-scale target ───────────────────── */}
      <div
        ref={frameRef}
        className="absolute inset-0 w-full h-full will-change-transform"
      >
        {/* ── z-0: Active Poster ──────────────────────────────────── */}
        {activePoster && (
          <div className="absolute inset-0 z-0">
            <Image
              src={activePoster.src}
              alt={activeSlide.posterAlt}
              fill
              sizes="100vw"
              quality={84}
              priority={activeIndex === initialIndex}
              className={["object-cover", objectPositionClass].join(" ")}
              draggable={false}
            />
          </div>
        )}

        {/* ── z-10: Video A ───────────────────────────────────────── */}
        {/*
          Both video elements are always in the DOM.
          Only the active buffer transitions from opacity-0 to opacity-100.
          The inactive buffer stays at opacity-0.
          The Poster beneath is always visible, preventing any black screen.
        */}
        <video
          ref={videoARef}
          key={`video-a-${videoASlide?.id ?? "empty"}-${isMobileRef.current ? "m" : "d"}`}
          muted
          autoPlay
          playsInline
          preload={bufferIsA ? "auto" : "none"}
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
          className={[
            "absolute inset-0 z-10 w-full h-full object-cover",
            objectPositionClass,
            "transition-opacity duration-600 ease-out",
            videoAVisible ? "opacity-100" : "opacity-0",
          ].join(" ")}
        >
          {videoASlide && (
            <source
              src={
                isMobileRef.current
                  ? videoASlide.mobileVideo.src
                  : videoASlide.desktopVideo.src
              }
              type={
                isMobileRef.current
                  ? (videoASlide.mobileVideo.type ?? "video/mp4")
                  : (videoASlide.desktopVideo.type ?? "video/mp4")
              }
            />
          )}
        </video>

        {/* ── z-10: Video B ───────────────────────────────────────── */}
        <video
          ref={videoBRef}
          key={`video-b-${videoBSlide?.id ?? "empty"}-${isMobileRef.current ? "m" : "d"}`}
          muted
          playsInline
          preload={!bufferIsA ? "auto" : "none"}
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
          className={[
            "absolute inset-0 z-10 w-full h-full object-cover",
            objectPositionClass,
            "transition-opacity duration-600 ease-out",
            videoBVisible ? "opacity-100" : "opacity-0",
          ].join(" ")}
        >
          {videoBSlide && (
            <source
              src={
                isMobileRef.current
                  ? videoBSlide.mobileVideo.src
                  : videoBSlide.desktopVideo.src
              }
              type={
                isMobileRef.current
                  ? (videoBSlide.mobileVideo.type ?? "video/mp4")
                  : (videoBSlide.desktopVideo.type ?? "video/mp4")
              }
            />
          )}
        </video>

        {/* ── z-20: Overlay ───────────────────────────────────────── */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-20 bg-black/20 pointer-events-none"
        />

        {/* ── z-30: Content ───────────────────────────────────────── */}
        <div
          ref={contentRef}
          className={[
            "absolute inset-0 z-30",
            "flex flex-col justify-end",
            "px-5 sm:px-8 lg:px-12 xl:px-16",
            "pb-20 sm:pb-24 lg:pb-16",
            "pt-24 sm:pt-28", // Clear fixed Navbar
          ].join(" ")}
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-12">
            {/* ── Left/Start: Section title + active slide info ──── */}
            <div className="max-w-xl lg:max-w-2xl">
              {/* Section H1 — stable, never changes with slides */}
              <h1
                id={`${headingId}-h1`}
                className={`"text-2xl ${DanaBlack.className} lg:text-5xl leading-[1.05] tracking-tight text-white mb-4 sm:mb-6"`}
              >
                {title}
              </h1>

              {/* Introduction */}
              <p className="max-w-xl text-sm sm:text-base lg:text-lg font-light leading-relaxed text-white/75 mb-6 sm:mb-8">
                {introduction}
              </p>

              {/* Active slide info — changes with navigation */}
              {/* <div data-slide-content="true">
                <p
                  data-slide-content
                  className="text-[10px] tracking-[0.22em] uppercase text-white/60 mb-2"
                >
                  {activeSlide.eyebrow}
                </p>

                <p
                  data-slide-content
                  className="text-xl sm:text-2xl lg:text-3xl font-light text-white mb-4 leading-snug"
                >
                  {activeSlide.title}
                </p>

                {activeSlide.description && (
                  <p
                    data-slide-content
                    className="hidden sm:block text-sm font-light text-white/65 max-w-md mb-5"
                  >
                    {activeSlide.description}
                  </p>
                )}

                <Link
                  href={activeSlide.action.href}
                  aria-label={
                    activeSlide.action.ariaLabel ?? activeSlide.action.label
                  }
                  prefetch={false}
                  data-slide-content
                  className={[
                    "group inline-flex items-center gap-2",
                    "text-[12px] tracking-[0.14em] uppercase text-white",
                    "border-b border-white/30 pb-1",
                    "hover:border-white/70 transition-[border-color] duration-200",
                    focusRing,
                  ].join(" ")}
                >
                  <span>{activeSlide.action.label}</span>
                   <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C15427"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={[
                      isRtl ? "rotate-180" : "",
                      "transition-transform duration-200",
                      "group-hover:translate-x-0.5",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-hidden="true"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div> */}
            </div>

            {/* ── Right/End: Controls ──────────────────────────────── */}
            {multiSlide && (
              <div
                className="flex items-center gap-1"
                role="group"
                aria-label="کنترل‌های اسلاید"
              >
                {/* Previous */}
                {/* <button
                  type="button"
                  onClick={goToPrevious}
                  disabled={isFirst || isTransitioning}
                  aria-label={`اسلاید قبلی: ${prevSlide?.title ?? ""}`}
                  className={[
                    "flex items-center justify-center",
                    "w-11 h-11",
                    "text-white/70 hover:text-white",
                    "disabled:opacity-30 disabled:cursor-not-allowed",
                    "transition-[color,opacity] duration-150",
                    focusRing,
                  ].join(" ")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button> */}

                {/* Slide number indicators */}
                {slides.map((slide, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => {
                        if (!isTransitioning) transitionToSlide(index);
                      }}
                      aria-label={`اسلاید ${slide.number}: ${slide.title}`}
                      aria-current={isActive ? "true" : undefined}
                      disabled={isTransitioning}
                      className={[
                        "flex flex-col items-center justify-center gap-1",
                        "w-11 h-11",
                        "transition-opacity duration-200",
                        !isActive ? "opacity-50 hover:opacity-80" : "",
                        focusRing,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <span
                        className={[
                          "font-mono text-[10px] tracking-[0.14em]",
                          isActive ? "text-white" : "text-white/60",
                        ].join(" ")}
                        aria-hidden="true"
                      >
                        {slide.number}
                      </span>
                      <span
                        className={[
                          "block h-px transition-all duration-400",
                          isActive ? "w-5 bg-[#C15427]" : "w-3 bg-white/30",
                        ].join(" ")}
                        aria-hidden="true"
                      />
                      {isActive && <span className="sr-only">(فعال)</span>}
                    </button>
                  );
                })}

                {/* Pause / Play */}
                {/* <button
                  type="button"
                  onClick={togglePause}
                  aria-label={isPaused ? "پخش ویدیو" : "مکث ویدیو"}
                  aria-pressed={isPaused}
                  className={[
                    "flex items-center justify-center",
                    "w-11 h-11",
                    "text-white/70 hover:text-white",
                    "transition-[color] duration-150",
                    focusRing,
                  ].join(" ")}
                >
                  {isPaused ? (
                    // Play icon
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  ) : (
                    // Pause icon
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="10" y1="6" x2="10" y2="18" />
                      <line x1="14" y1="6" x2="14" y2="18" />
                    </svg>
                  )}
                </button> */}

                {/* Next */}
                {/* <button
                  type="button"
                  onClick={goToNext}
                  disabled={isLast || isTransitioning}
                  aria-label={`اسلاید بعدی: ${nextSlide?.title ?? ""}`}
                  className={[
                    "flex items-center justify-center",
                    "w-11 h-11",
                    "text-white/70 hover:text-white",
                    "disabled:opacity-30 disabled:cursor-not-allowed",
                    "transition-[color,opacity] duration-150",
                    focusRing,
                  ].join(" ")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button> */}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
