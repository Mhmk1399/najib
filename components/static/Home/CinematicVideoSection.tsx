"use client";

import Image from "next/image";
import { type CSSProperties, useEffect, useId, useRef, useState } from "react";

import { ArrowLeftIcon, Button } from "@/components/ui/Button";

import type { HomeCopy } from "@/lib/i18n/home-copy";

import {
  getHtmlLang,
  getLocaleDirection,
  type Locale,
} from "@/lib/i18n/config";

import { localizedHref } from "@/lib/i18n/routes";

import { brandColors } from "@/theme/theme-colors";

type CinematicVideoSectionProps = {
  copy: HomeCopy["cinematic"];
  locale: Locale;

  videoSrc: string;
  posterSrc: string;

  mobileVideoPosition?: string;
  desktopVideoPosition?: string;

  posterStoryId?: string;
  className?: string;
};

export function CinematicVideoSection({
  copy,
  locale,
  videoSrc,
  posterSrc,
  mobileVideoPosition = "center top",
  desktopVideoPosition = "center",
  posterStoryId,
  className = "",
}: CinematicVideoSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [shouldMountVideo, setShouldMountVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const titleId = useId();

  const direction = getLocaleDirection(locale);
  const htmlLang = getHtmlLang(locale);

  const themeVars = {
    "--video-black": brandColors.black.hex,
    "--video-black-rgb": brandColors.black.rgb,
    "--video-white": brandColors.white.hex,
    "--video-copper": brandColors.copper.hex,
    "--video-mobile-position": mobileVideoPosition,
    "--video-desktop-position": desktopVideoPosition,
  } as CSSProperties;

  const hasBothActions = Boolean(copy.primaryAction && copy.secondaryAction);

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
      const timer = globalThis.setTimeout(() => setShouldMountVideo(true), 0);

      return () => globalThis.clearTimeout(timer);
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
      {
        threshold: 0.18,
      },
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
      dir={direction}
      lang={htmlLang}
      aria-labelledby={titleId}
      data-image-story-id={posterStoryId}
      data-image-story-url={posterSrc}
      style={themeVars}
      className={`relative isolate flex h-[86svh] min-h-[640px] max-h-[920px] w-full items-center justify-center overflow-hidden bg-[var(--video-black)] text-[var(--video-white)] sm:min-h-[680px] lg:h-[88svh] ${className}`}
    >
      <Image
        src={posterSrc}
        alt={copy.posterAlt}
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

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgb(var(--video-black-rgb)/0.20)_0%,rgb(var(--video-black-rgb)/0.06)_30%,rgb(var(--video-black-rgb)/0.15)_58%,rgb(var(--video-black-rgb)/0.78)_100%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_12%,rgb(var(--video-black-rgb)/0.08)_48%,rgb(var(--video-black-rgb)/0.36)_120%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-4 z-0 border border-white/[0.08] sm:inset-6 lg:inset-8"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] items-center justify-center px-5 py-12 sm:px-8 sm:py-16 lg:px-12 xl:px-16">
        <div className="mx-auto flex w-full max-w-[760px] flex-col items-center text-center">
          {copy.eyebrow && (
            <div className="mb-5 flex items-center justify-center gap-3 sm:mb-6">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-[var(--video-copper)]/95"
              />

              <p className="text-[10px] font-medium leading-none text-white/58 sm:text-[11px]">
                {copy.eyebrow}
              </p>

              <span
                aria-hidden="true"
                className="h-px w-8 bg-[var(--video-copper)]/95"
              />
            </div>
          )}

          <h2
            id={titleId}
            className="mx-auto max-w-[720px] text-balance text-xl font-semibold leading-[1.1] tracking-[-0.045em] text-white [text-shadow:0_5px_32px_rgb(var(--video-black-rgb)/0.38)] md:text-5xl"
          >
            {copy.title}
          </h2>

          {copy.description && (
            <p className="mx-auto mt-5 max-w-[540px] text-pretty text-[12px] leading-7 text-white/68 sm:mt-6 sm:text-[13px] md:text-[14px] md:leading-8">
              {copy.description}
            </p>
          )}

          {(copy.primaryAction || copy.secondaryAction) && (
            <div
              className={`mx-auto mt-7 grid w-full gap-2.5 sm:mt-8 sm:gap-3 ${
                hasBothActions
                  ? "max-w-[470px] grid-cols-1 min-[430px]:grid-cols-2"
                  : "max-w-[230px] grid-cols-1"
              }`}
            >
              {copy.primaryAction && (
                <Button
                  href={localizedHref(copy.primaryAction.href, locale)}
                  variant="cream"
                  size="lg"
                  icon={<ArrowLeftIcon />}
                  iconPosition="right"
                  fullWidth
                  className="!tracking-normal"
                >
                  {copy.primaryAction.label}
                </Button>
              )}

              {copy.secondaryAction && (
                <Button
                  href={localizedHref(copy.secondaryAction.href, locale)}
                  variant="outline"
                  size="lg"
                  icon={<ArrowLeftIcon />}
                  iconPosition="right"
                  fullWidth
                  className="border-white/40 bg-black/15 !tracking-normal text-white backdrop-blur-sm hover:border-white hover:bg-white hover:text-black"
                >
                  {copy.secondaryAction.label}
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
