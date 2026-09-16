"use client";

import Image from "next/image";

import { type CSSProperties, useEffect, useId, useRef, useState } from "react";

import { brandColors } from "@/theme/theme-colors";
import { ArrowRightIcon, Button } from "@/components/ui/Button";

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

export function CinematicVideoSection({
  videoSrc,
  posterSrc,
  posterAlt = "",
  eyebrow = "خانه نجیب‌زاده",
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

  const [shouldMountVideo, setShouldMountVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const titleId = useId();

  const themeVars = {
    "--video-black": brandColors.black.hex,
    "--video-black-rgb": brandColors.black.rgb,
    "--video-white": brandColors.white.hex,
    "--video-copper": brandColors.copper.hex,
    "--video-mobile-position": mobileVideoPosition,
    "--video-desktop-position": desktopVideoPosition,
  } as CSSProperties;

  const hasBothActions = Boolean(primaryAction && secondaryAction);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updatePreference = () => {
      setReducedMotion(media.matches);
    };

    updatePreference();
    media.addEventListener("change", updatePreference);

    return () => {
      media.removeEventListener("change", updatePreference);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion || shouldMountVideo) return;

    const section = sectionRef.current;

    if (!section) return;

    if (!("IntersectionObserver" in window)) {
      setShouldMountVideo(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;

        setShouldMountVideo(true);
        observer.disconnect();
      },
      {
        rootMargin: "480px 0px 480px 0px",
        threshold: 0,
      },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, [reducedMotion, shouldMountVideo]);

  useEffect(() => {
    if (!shouldMountVideo || reducedMotion) return;

    const section = sectionRef.current;
    const video = videoRef.current;

    if (!section || !video) return;

    if (!("IntersectionObserver" in window)) {
      void video.play().catch(() => {});
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
      { threshold: 0.18 },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [shouldMountVideo, reducedMotion]);

  return (
    <section
      ref={sectionRef}
      dir="rtl"
      lang="fa"
      aria-labelledby={titleId}
      style={themeVars}
      className={`relative isolate flex h-[86svh] min-h-[640px] max-h-[920px] w-full items-center justify-center overflow-hidden bg-[var(--video-black)] text-[var(--video-white)] sm:min-h-[680px] lg:h-[88svh] ${className}`}
    >
      {/* Poster remains the visual fallback for reduced-motion users and while video initializes. */}
      <Image
        src={posterSrc}
        alt={posterAlt}
        fill
        loading="lazy"
        fetchPriority="low"
        sizes="100vw"
        draggable={false}
        style={{
          objectPosition: mobileVideoPosition,
        }}
        className={`-z-40 object-cover transition-opacity duration-700 motion-reduce:transition-none md:[object-position:var(--video-desktop-position)] ${
          videoReady ? "opacity-0" : "opacity-100"
        }`}
      />

      {shouldMountVideo && !reducedMotion && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoReady(false)}
          style={{
            objectPosition: mobileVideoPosition,
          }}
          className={`absolute inset-0 -z-30 size-full object-cover transition-opacity duration-700 motion-reduce:transition-none md:[object-position:var(--video-desktop-position)] ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* Symmetrical cinematic fade for a centered composition. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgb(var(--video-black-rgb)/0.20)_0%,rgb(var(--video-black-rgb)/0.06)_30%,rgb(var(--video-black-rgb)/0.15)_58%,rgb(var(--video-black-rgb)/0.78)_100%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_12%,rgb(var(--video-black-rgb)/0.08)_48%,rgb(var(--video-black-rgb)/0.36)_120%)]"
      />

      {/* Subtle editorial frame. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-4 z-0 border border-white/[0.08] sm:inset-6 lg:inset-8"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] items-center justify-center px-5 py-12 sm:px-8 sm:py-16 lg:px-12 xl:px-16">
        <div className="mx-auto flex w-full max-w-[760px] flex-col items-center text-center">
          {eyebrow && (
            <div className="mb-5 flex items-center justify-center gap-3 sm:mb-6">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-[var(--video-copper)]/95"
              />

              <p className="text-[10px] font-medium leading-none text-white/58 sm:text-[11px]">
                {eyebrow}
              </p>

              <span
                aria-hidden="true"
                className="h-px w-8 bg-[var(--video-copper)]/95"
              />
            </div>
          )}

          <h2
            id={titleId}
            className="mx-auto max-w-[720px] text-balance text-[clamp(2.8rem,11vw,4.6rem)] font-semibold leading-[1.1] tracking-[-0.045em] text-white [text-shadow:0_5px_32px_rgb(var(--video-black-rgb)/0.38)] sm:text-[clamp(3.5rem,8vw,5.35rem)] md:text-[clamp(4rem,6vw,6.15rem)] lg:text-[clamp(4.35rem,5vw,6.4rem)]"
          >
            {title}
          </h2>

          {description && (
            <p className="mx-auto mt-5 max-w-[540px] text-pretty text-[12px] leading-7 text-white/68 sm:mt-6 sm:text-[13px] md:text-[14px] md:leading-8">
              {description}
            </p>
          )}

          {(primaryAction || secondaryAction) && (
            <div
              className={`mx-auto mt-7 grid w-full gap-2.5 sm:mt-8 sm:gap-3 ${
                hasBothActions
                  ? "max-w-[470px] grid-cols-1 min-[430px]:grid-cols-2"
                  : "max-w-[230px] grid-cols-1"
              }`}
            >
              {primaryAction && (
                <Button
                  href={primaryAction.href}
                  variant="cream"
                  size="lg"
                  icon={
                    <span className="inline-flex rotate-180">
                      <ArrowRightIcon />
                    </span>
                  }
                  iconPosition="left"
                  fullWidth
                  className="!tracking-normal"
                >
                  {primaryAction.label}
                </Button>
              )}

              {secondaryAction && (
                <Button
                  href={secondaryAction.href}
                  variant="outline"
                  size="lg"
                  icon={
                    <span className="inline-flex rotate-180">
                      <ArrowRightIcon />
                    </span>
                  }
                  iconPosition="left"
                  fullWidth
                  className="border-white/40 bg-black/15 !tracking-normal text-white backdrop-blur-sm hover:border-white hover:bg-white hover:text-black"
                >
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          )}

          <div
            aria-hidden="true"
            className="mt-8 flex items-center justify-center gap-3 text-white/28 sm:mt-10"
          >
            <span className="h-px w-10 bg-current" />
            <span className="text-[7px] font-medium tracking-[0.22em]">
              NAJIBZADEH
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
