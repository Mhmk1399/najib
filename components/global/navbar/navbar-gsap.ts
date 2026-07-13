// ─────────────────────────────────────────────────────────────────────────────
// Atelier Gate Navbar — Cached GSAP Dynamic Loader
//
// Rules:
// - Never imported at module scope by Navbar components
// - Loaded only on first Mega Menu or mobile-menu open
// - Single promise shared across all Navbar instances
// - No ScrollTrigger, no unrelated plugins
// - Graceful failure path preserved
// ─────────────────────────────────────────────────────────────────────────────

type GsapModule = typeof import("gsap")["default"];

// Module-level cache — one promise for the entire page lifetime
let gsapPromise: Promise<GsapModule> | null = null;

/**
 * Lazily imports GSAP and caches the result.
 * Safe to call multiple times — will always return the same promise.
 */
export function loadNavbarGsap(): Promise<GsapModule> {
    if (gsapPromise === null) {
        gsapPromise = import("gsap")
            .then((module) => module.default)
            .catch((error) => {
                // Reset so a future attempt can retry
                gsapPromise = null;
                if (process.env.NODE_ENV === "development") {
                    console.warn(
                        "[Navbar] GSAP failed to load dynamically. " +
                        "Navigation will use CSS fallback transitions.",
                        error
                    );
                }
                // Re-throw so callers can handle the CSS fallback
                throw error;
            });
    }

    return gsapPromise;
}

/**
 * Returns the cached GSAP module synchronously if already loaded.
 * Returns null if not yet loaded.
 * Used to avoid Promise chains in animation callbacks.
 */
export function getNavbarGsapSync(): GsapModule | null {
    // We can't peek inside a Promise synchronously.
    // This is a sentinel approach — components track their own loaded ref.
    return null;
}

/**
 * Resets the GSAP cache — only used in testing environments.
 * Do not call in production code.
 */
export function resetNavbarGsapCache(): void {
    if (process.env.NODE_ENV === "test") {
        gsapPromise = null;
    }
}