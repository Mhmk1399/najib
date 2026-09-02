"use client";

import Image from "next/image";
import { type CSSProperties, useEffect, useRef, useState } from "react";

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

  const [shouldMountVideo, setShouldMountVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

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
      style={themeVars}
      className={`relative isolate flex h-[86svh] min-h-[640px] max-h-[920px] w-full items-center justify-center overflow-hidden bg-[var(--video-black)] text-[var(--video-white)] sm:min-h-[680px] lg:h-[88svh] ${className}`}
    >
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
        className={`-z-40 object-cover transition-opacity duration-500 motion-reduce:transition-none md:[object-position:var(--video-desktop-position)] ${
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
          className={`absolute inset-0 -z-30 size-full object-cover transition-opacity duration-500 motion-reduce:transition-none md:[object-position:var(--video-desktop-position)] ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgb(var(--video-black-rgb)/0.26)_0%,rgb(var(--video-black-rgb)/0.08)_30%,rgb(var(--video-black-rgb)/0.14)_58%,rgb(var(--video-black-rgb)/0.66)_100%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgb(var(--video-black-rgb)/0.02)_0%,transparent_34%,rgb(var(--video-black-rgb)/0.34)_112%)]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[980px] flex-col items-center px-5 text-center sm:px-8 lg:px-10">
        {eyebrow && (
          <div className="mb-5 flex flex-col items-center gap-3 sm:mb-6">
            <span
              aria-hidden="true"
              className="h-px w-7 bg-[var(--video-copper)]"
            />
            <p className="text-[7px] font-semibold uppercase tracking-[0.24em] text-white/58 sm:text-[8px]">
              {eyebrow}
            </p>
          </div>
        )}

        <h2 className="max-w-[880px] font-serif text-[clamp(3rem,12vw,4.45rem)] font-normal leading-[0.92] tracking-[-0.055em] text-white drop-shadow-[0_4px_26px_rgb(var(--video-black-rgb)/0.34)] sm:text-[clamp(3.8rem,9vw,5.2rem)] md:text-[clamp(4.6rem,6.3vw,6.5rem)] lg:text-[clamp(5rem,5.35vw,6.9rem)]">
          {title}
        </h2>

        {description && (
          <p className="mt-5 max-w-[390px] text-[11px] font-normal leading-[1.75] text-white/66 sm:mt-6 sm:max-w-[470px] sm:text-[12px] md:max-w-[560px] md:text-[13px]">
            {description}
          </p>
        )}

        {(primaryAction || secondaryAction) && (
          <div
            className={`mt-8 grid w-full gap-2 sm:mt-9 ${
              hasBothActions
                ? "max-w-[440px] grid-cols-1 min-[420px]:grid-cols-2"
                : "max-w-[220px] grid-cols-1"
            }`}
          >
            {primaryAction && (
              <Button
                href={primaryAction.href}
                variant="cream"
                size="lg"
                icon={<ArrowRightIcon />}
                fullWidth
              >
                {primaryAction.label}
              </Button>
            )}

            {secondaryAction && (
              <Button
                href={secondaryAction.href}
                variant="outline"
                size="lg"
                icon={<ArrowRightIcon />}
                fullWidth
                className="border-white/42 bg-black/16 text-white backdrop-blur-sm hover:border-white hover:bg-white hover:text-black"
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
