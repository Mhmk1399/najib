// ─────────────────────────────────────────────────────────────────────────────
// Cinematic Video Hero — Server Component Root
//
// This file MUST remain a Server Component.
// No "use client". No browser APIs. No GSAP. No useEffect.
//
// Responsibilities:
// - Accept serializable props
// - Normalize slides
// - Resolve initial slide index
// - Render H1 and introduction in server HTML
// - Forward only serializable data to the Client Component
// ─────────────────────────────────────────────────────────────────────────────

import type {
  CinematicVideoHeroProps,
  CinematicVideoHeroClientProps,
  HeroSlide,
} from "./cinematic-video-hero.types";
import { CinematicVideoHeroClient } from "./cinematic-video-hero-client";

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_ID = "cinematic-video-hero";
const DEFAULT_LOCALE = "fa" as const;
const DEFAULT_AUTO_ADVANCE = true;

// ── Server-side slide normalization ───────────────────────────────────────────

function normalizeSlide(raw: HeroSlide): HeroSlide {
  return {
    id: String(raw.id),
    number: String(raw.number),
    eyebrow: String(raw.eyebrow),
    title: String(raw.title),
    description: raw.description ? String(raw.description) : undefined,
    action: {
      label: String(raw.action.label),
      href: String(raw.action.href),
      ariaLabel: raw.action.ariaLabel ? String(raw.action.ariaLabel) : undefined,
    },
    desktopVideo: {
      src: String(raw.desktopVideo.src),
      type: raw.desktopVideo.type ?? "video/mp4",
    },
    mobileVideo: {
      src: String(raw.mobileVideo.src),
      type: raw.mobileVideo.type ?? "video/mp4",
    },
    desktopPoster: {
      src: String(raw.desktopPoster.src),
      width: Number(raw.desktopPoster.width),
      height: Number(raw.desktopPoster.height),
    },
    mobilePoster: {
      src: String(raw.mobilePoster.src),
      width: Number(raw.mobilePoster.width),
      height: Number(raw.mobilePoster.height),
    },
    posterAlt: String(raw.posterAlt),
    objectPosition: raw.objectPosition ?? "center",
  };
}

// ── Development validation ────────────────────────────────────────────────────

function validateSlides(slides: readonly HeroSlide[]): void {
  if (process.env.NODE_ENV !== "development") return;
  const ids = new Set<string>();
  slides.forEach((slide, i) => {
    if (!slide.id) {
      console.warn(`[CinematicVideoHero] Slide at index ${i} is missing an id.`);
    }
    if (ids.has(slide.id)) {
      console.warn(`[CinematicVideoHero] Duplicate slide id: "${slide.id}"`);
    }
    ids.add(slide.id);
    if (!slide.posterAlt) {
      console.warn(`[CinematicVideoHero] Slide "${slide.id}" is missing posterAlt.`);
    }
    if (!slide.desktopVideo.src) {
      console.warn(`[CinematicVideoHero] Slide "${slide.id}" is missing desktopVideo.src.`);
    }
    if (!slide.action.label) {
      console.warn(`[CinematicVideoHero] Slide "${slide.id}" has an empty action.label.`);
    }
    if (!slide.action.href) {
      console.warn(`[CinematicVideoHero] Slide "${slide.id}" has an empty action.href.`);
    }
  });
}

// ── Server Component ──────────────────────────────────────────────────────────

export function CinematicVideoHero({
  id = DEFAULT_ID,
  title,
  introduction,
  slides,
  initialSlideId,
  autoAdvance = DEFAULT_AUTO_ADVANCE,
  locale = DEFAULT_LOCALE,
  className,
}: CinematicVideoHeroProps) {
  const normalizedSlides = slides.map(normalizeSlide);

  validateSlides(normalizedSlides);

  // Resolve initial index
  let initialIndex = 0;
  if (initialSlideId) {
    const found = normalizedSlides.findIndex((s) => s.id === initialSlideId);
    if (found >= 0) {
      initialIndex = found;
    } else if (process.env.NODE_ENV === "development") {
      console.warn(
        `[CinematicVideoHero] initialSlideId "${initialSlideId}" not found. Using first slide.`
      );
    }
  }

  if (normalizedSlides.length === 0) {
    return null;
  }

  const clientProps: CinematicVideoHeroClientProps = {
    id,
    title,
    introduction,
    slides: normalizedSlides,
    initialIndex,
    autoAdvance,
    locale,
    className,
  };

  return <CinematicVideoHeroClient {...clientProps} />;
}