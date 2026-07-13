/**
 * theme-colors.ts
 *
 * Single source of truth for all brand colors and Tailwind class tokens.
 *
 * RULES:
 * - All Tailwind class strings must be complete and static so the Tailwind
 *   compiler can detect them via content scanning.
 * - Dark variants are embedded directly in each token string.
 * - No runtime logic lives here — this file is imported by Server Components.
 */

// ---------------------------------------------------------------------------
// Official Najibzadeh Brand Colors
// ---------------------------------------------------------------------------

export const brandColors = {
    copper: {
        hex: '#C15427',
        rgb: '193 84 39',
        cmyk: '18 79 100 7',
        pantone: '7584 C',
    },
    black: {
        hex: '#231F20',
        rgb: '35 31 32',
        cmyk: '0 0 0 100',
    },
    cream: {
        hex: '#F2DBB4',
        rgb: '242 219 180',
        cmyk: '0 9 28 5',
        pantone: '7506 C',
    },
    silver: {
        hex: '#77787B',
        rgb: '119 120 123',
        cmyk: '0 0 0 65',
    },
    // Official neutral scale
    gray80: { hex: '#58595B' },
    gray50: { hex: '#939598' },
    gray15: { hex: '#DCDDDE' },
} as const;

// ---------------------------------------------------------------------------
// Raw semantic design tokens (used in CSS custom properties)
// ---------------------------------------------------------------------------
// These values map to the exact hex codes defined in the brief.
// They are intentionally not Tailwind classes — they feed tailwind.config.ts.

export const lightTokens = {
    canvas: '#FCFAF7',
    surface: '#FFFFFF',
    surfaceMuted: '#F8F3EB',
    surfaceBrand: '#F2DBB4',
    text: '#231F20',
    textMuted: '#6C6662',
    border: '#DED8D1',
    borderStrong: '#BDB5AD',
    accent: '#C15427',
    accentText: '#A94420',
    accentForeground: '#FFFFFF',
    destructive: '#A33A32',
} as const;

export const darkTokens = {
    canvas: '#0B1117',
    surface: '#111820',
    surfaceMuted: '#171F27',
    surfaceBrand: '#211A17',
    text: '#F8F5F0',
    textMuted: '#B8B2AC',
    border: '#2C343C',
    borderStrong: '#46515B',
    accent: '#C15427',
    accentText: '#E18A68',
    accentForeground: '#FFFFFF',
    destructive: '#E27368',
} as const;

// ---------------------------------------------------------------------------
// Typography tokens
// ---------------------------------------------------------------------------
// Font families are referenced by name only.
// Actual font loading is handled separately via next/font/local or
// next/font/google.  These strings match the CSS variable names you will
// expose in your Tailwind fontFamily config.

export const fontTokens = {
    /** Persian typeface — Dana */
    persian: 'var(--font-dana)',
    /** English typeface — Open Sans */
    english: 'var(--font-open-sans)',
} as const;

// ---------------------------------------------------------------------------
// Reusable Tailwind Class Tokens
// ---------------------------------------------------------------------------
// Every string is a complete, static Tailwind class list.
// Tailwind's content scanner reads these at build time → no purge issues.
// Components import and spread these strings with cn() / clsx().

export const themeClasses = {
    // ── Surfaces ─────────────────────────────────────────────────────────────

    /** Full-page canvas background */
    page: 'bg-[#FCFAF7] dark:bg-[#0B1117]',

    /** Default card / panel surface */
    surface: 'bg-white dark:bg-[#111820]',

    /** Slightly recessed / secondary surface */
    surfaceMuted: 'bg-[#F8F3EB] dark:bg-[#171F27]',

    /** Warm brand-tinted surface (cream / deep warmth) */
    surfaceBrand: 'bg-[#F2DBB4] dark:bg-[#211A17]',

    // ── Typography ───────────────────────────────────────────────────────────

    /** Primary body / heading text */
    textPrimary: 'text-[#231F20] dark:text-[#F8F5F0]',

    /** Secondary / supporting text */
    textSecondary: 'text-[#6C6662] dark:text-[#B8B2AC]',

    /**
     * Copper accent text — use only for labels, captions, active states.
     * Never use for long body copy (contrast + copper-usage rule).
     */
    textAccent: 'text-[#A94420] dark:text-[#E18A68]',

    // ── Borders ──────────────────────────────────────────────────────────────

    /** Default subtle border */
    border: 'border-[#DED8D1] dark:border-[#2C343C]',

    /** Stronger / more prominent border */
    borderStrong: 'border-[#BDB5AD] dark:border-[#46515B]',

    // ── Interactive Controls ─────────────────────────────────────────────────

    /**
     * Primary CTA button — copper background, white text.
     * Copper usage is intentional here (≤8% surface rule applies at page level).
     */
    primaryButton: [
        'bg-[#C15427] text-white',
        'hover:bg-[#A94420]',
        'dark:bg-[#C15427] dark:text-white dark:hover:bg-[#A94420]',
        'transition-colors duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
    ].join(' '),

    /**
     * Secondary button — bordered, no fill.
     */
    secondaryButton: [
        'bg-transparent text-[#231F20] border border-[#BDB5AD]',
        'hover:border-[#C15427] hover:text-[#A94420]',
        'dark:text-[#F8F5F0] dark:border-[#46515B]',
        'dark:hover:border-[#C15427] dark:hover:text-[#E18A68]',
        'transition-colors duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
    ].join(' '),

    /**
     * Ghost / text button — no border, no background.
     */
    ghostButton: [
        'bg-transparent text-[#6C6662]',
        'hover:text-[#231F20]',
        'dark:text-[#B8B2AC] dark:hover:text-[#F8F5F0]',
        'transition-colors duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
    ].join(' '),

    // ── Focus ────────────────────────────────────────────────────────────────

    /**
     * Keyboard focus ring — copper accent, clearly visible in both themes.
     * Apply with focus-visible: on interactive elements.
     */
    focusRing: [
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-[#C15427]',
        'focus-visible:ring-offset-2',
        'focus-visible:ring-offset-[#FCFAF7]',
        'dark:focus-visible:ring-offset-[#0B1117]',
    ].join(' '),

    // ── Dividers ─────────────────────────────────────────────────────────────

    /** Hairline horizontal rule between sections */
    divider: 'border-t border-[#DED8D1] dark:border-[#2C343C]',

} as const;

export type ThemeClasses = typeof themeClasses;