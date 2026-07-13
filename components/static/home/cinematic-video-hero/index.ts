// ─────────────────────────────────────────────────────────────────────────────
// Cinematic Video Hero — Public Barrel Export
// ─────────────────────────────────────────────────────────────────────────────

// ── Server Component ──────────────────────────────────────────────────────────
export { CinematicVideoHero } from "./cinematic-video-hero";

// ── Client Component (for advanced composition) ───────────────────────────────
export { CinematicVideoHeroClient } from "./cinematic-video-hero-client";

// ── Example data ──────────────────────────────────────────────────────────────
export { cinematicVideoHeroData } from "./cinematic-video-hero-data.example";

// ── Types ─────────────────────────────────────────────────────────────────────
export type {
    CinematicVideoHeroProps,
    CinematicVideoHeroClientProps,
    HeroSlide,
    HeroVideoSource,
    HeroPosterSource,
    HeroObjectPosition,
} from "./cinematic-video-hero.types";