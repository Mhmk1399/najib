// ─────────────────────────────────────────────────────────────────────────────
// Tailored Aperture — Cached GSAP + ScrollTrigger Dynamic Loader
//
// Rules:
// - Never imported at module scope by any component
// - Loaded only after first paint, or on first user intent
// - Single promise for the entire page lifetime
// - Never imports ScrollSmoother
// - Never registers unneeded plugins
// - Graceful failure path preserved
// ─────────────────────────────────────────────────────────────────────────────

export type HeroGsapBundle = {
    gsap: typeof import("gsap")["default"];
    ScrollTrigger: typeof import("gsap/ScrollTrigger")["ScrollTrigger"];
};

// Module-level singleton — one load for the entire page
let heroGsapPromise: Promise<HeroGsapBundle> | null = null;

/**
 * Lazily imports GSAP and ScrollTrigger together, registers the plugin once,
 * and caches the result. Safe to call multiple times.
 */
export function loadHeroGsap(): Promise<HeroGsapBundle> {
    if (heroGsapPromise === null) {
        heroGsapPromise = Promise.all([
            import("gsap"),
            import("gsap/ScrollTrigger"),
        ])
            .then(([gsapModule, scrollTriggerModule]) => {
                const gsap = gsapModule.default;
                const { ScrollTrigger } = scrollTriggerModule;

                // Register once — safe to call multiple times per GSAP docs
                gsap.registerPlugin(ScrollTrigger);

                return { gsap, ScrollTrigger };
            })
            .catch((error) => {
                // Reset so a future attempt can retry
                heroGsapPromise = null;

                if (process.env.NODE_ENV === "development") {
                    console.warn(
                        "[CinematicVideoHero] GSAP failed to load dynamically. " +
                        "The Hero will use CSS fallback transitions. " +
                        "The desktop scroll scene will not be created.",
                        error
                    );
                }

                // Re-throw so callers can catch and use their CSS fallback
                throw error;
            });
    }

    return heroGsapPromise;
}

/**
 * Schedules the GSAP load after the first paint using
 * requestIdleCallback when available, with a max timeout fallback.
 *
 * Returns a cancel function. Call it on cleanup.
 */
export function scheduleHeroGsapLoad(maxDelayMs = 1000): () => void {
    let idleCallbackId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    function doLoad() {
        if (cancelled) return;
        // Fire and forget — errors are handled inside loadHeroGsap
        loadHeroGsap().catch(() => {
            /* handled inside loader */
        });
    }

    if (typeof window === "undefined") {
        // Server — do nothing
        return () => { };
    }

    if ("requestIdleCallback" in window) {
        idleCallbackId = window.requestIdleCallback(doLoad, {
            timeout: maxDelayMs,
        });
    } else {
        timeoutId = setTimeout(doLoad, Math.min(maxDelayMs, 300));
    }

    return () => {
        cancelled = true;
        if (idleCallbackId !== null && "cancelIdleCallback" in window) {
            window.cancelIdleCallback(idleCallbackId);
        }
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
    };
}

/**
 * Resets the GSAP cache — only used in test environments.
 */
export function resetHeroGsapCache(): void {
    if (process.env.NODE_ENV === "test") {
        heroGsapPromise = null;
    }
}