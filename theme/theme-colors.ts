/**
 * theme-colors.ts
 *
 * Najibzadeh global visual theme.
 *
 * This file is the single source of truth for:
 * - Brand colors
 * - Semantic colors
 * - Tailwind class tokens
 *
 * IMPORTANT:
 * Copper is an accent, NOT a primary surface color.
 */

// -----------------------------------------------------------------------------
// Official Brand Palette
// -----------------------------------------------------------------------------

export const brandColors = {
    copper: {
        // Micro accent only.
        hex: "#C15427",
        rgb: "193 84 39",
        cmyk: "18 79 100 7",
        pantone: "7584 C",
    },

    black: {
        hex: "#0B0B0B",
        rgb: "11 11 11",
        cmyk: "0 0 0 100",
    },

    /**
     * Soft editorial cream.
     *
     * Never use as primary text color.
     * Never use for buttons by default.
     * Background use only.
     */
    cream: {
        hex: "#F6F2EB",
        rgb: "246 242 235",
    },

    silver: {
        hex: "#737373",
        rgb: "115 115 115",
    },

    gray80: {
        hex: "#3F3F3F",
    },

    gray50: {
        hex: "#8A8A8A",
    },

    gray15: {
        hex: "#E5E5E5",
    },

    white: {
        hex: "#FFFFFF",
        rgb: "255 255 255",
    },
} as const;

// -----------------------------------------------------------------------------
// Light Theme
// -----------------------------------------------------------------------------

export const lightTokens = {
  /* Main page */
  canvas: "#FFFFFF",

  /* Cards / navbar / sections */
  surface: "#FFFFFF",

  /* Very subtle neutral separation */
  surfaceMuted: "#F7F7F7",

  /**
   * Editorial background only.
   * This is the ONLY cream surface.
   */
  surfaceBrand: "#F6F2EB",

  /* Main typography */
  text: "#0B0B0B",

  /* Secondary typography */
  textMuted: "#707070",

  /* Tiny tertiary copy */
  textSoft: "#989898",

  /* Structure */
  border: "#E5E5E5",

  borderStrong: "#B8B8B8",

  /**
   * Copper = eyebrow only.
   */
  accent: "#C15427",

  accentStrong: "#C15427",

  accentForeground: "#FFFFFF",

  destructive: "#A33A32",
} as const;

// -----------------------------------------------------------------------------
// Dark Theme
// -----------------------------------------------------------------------------

export const darkTokens = {
  canvas: "#0B0B0B",

  surface: "#111111",

  surfaceMuted: "#181818",

  /**
   * Warm editorial dark.
   * Use rarely.
   */
  surfaceBrand: "#161311",

  text: "#FFFFFF",

  textMuted: "#B5B5B5",

  textSoft: "#777777",

  border: "#292929",

  borderStrong: "#474747",

  accent: "#C15427",

  accentStrong: "#C15427",

  accentForeground: "#FFFFFF",

  destructive: "#D95C54",
} as const;

// -----------------------------------------------------------------------------
// Typography
// -----------------------------------------------------------------------------

export const fontTokens = {
    persian: "var(--font-dana)",

    english: "var(--font-open-sans)",
} as const;

// -----------------------------------------------------------------------------
// Tailwind Theme Tokens
// -----------------------------------------------------------------------------
//
// Keep ALL classes complete and static.
// No dynamic Tailwind class construction.
// -----------------------------------------------------------------------------

export const themeClasses = {
    // ---------------------------------------------------------------------------
    // PAGE
    // ---------------------------------------------------------------------------
    navbarOverlayLight: [
        "bg-transparent",
        "text-white",
        "border-transparent",
    ].join(" "),

    navbarOverlayDark: [
        "bg-transparent",
        "text-[#231F20]",
        "border-transparent",
    ].join(" "),

    breadcrumbOverlayLight: [
        "text-white/70",
    ].join(" "),

    breadcrumbOverlayDark: [
        "text-[#6C6662]",
    ].join(" "),
    page: [
        "bg-[#FCFAF7]",
        "text-[#231F20]",
        "dark:bg-[#0B1117]",
        "dark:text-[#F8F5F0]",
    ].join(" "),

    // ---------------------------------------------------------------------------
    // SURFACES
    // ---------------------------------------------------------------------------

    surface: [
        "bg-white",
        "dark:bg-[#111820]",
    ].join(" "),

    surfaceMuted: [
        "bg-[#F8F3EB]",
        "dark:bg-[#171F27]",
    ].join(" "),

    surfaceBrand: [
        "bg-[#F2DBB4]",
        "dark:bg-[#211A17]",
    ].join(" "),

    surfaceTransparent: [
        "bg-transparent",
    ].join(" "),

    // ---------------------------------------------------------------------------
    // TYPOGRAPHY
    // ---------------------------------------------------------------------------

    textPrimary: [
        "text-[#231F20]",
        "dark:text-[#F8F5F0]",
    ].join(" "),

    textSecondary: [
        "text-[#77787B]",
        "dark:text-[#B8B2AC]",
    ].join(" "),

    textSoft: [
        "text-[#939598]",
        "dark:text-[#77787B]",
    ].join(" "),

    /**
     * Copper must only be used for:
     * - active states
     * - small labels
     * - selected items
     * - subtle brand moments
     */
    textAccent: [
        "text-[#A94420]",
        "dark:text-[#E18A68]",
    ].join(" "),

    // ---------------------------------------------------------------------------
    // ICONS
    // ---------------------------------------------------------------------------

    iconPrimary: [
        "text-[#231F20]",
        "dark:text-[#F8F5F0]",
    ].join(" "),

    iconMuted: [
        "text-[#77787B]",
        "dark:text-[#B8B2AC]",
    ].join(" "),

    iconAccent: [
        "text-[#C15427]",
        "dark:text-[#E18A68]",
    ].join(" "),

    // ---------------------------------------------------------------------------
    // BORDERS
    // ---------------------------------------------------------------------------

    border: [
        "border-[#DCDDDE]",
        "dark:border-[#2C343C]",
    ].join(" "),

    borderStrong: [
        "border-[#939598]",
        "dark:border-[#46515B]",
    ].join(" "),

    divider: [
        "border-t",
        "border-[#DCDDDE]",
        "dark:border-[#2C343C]",
    ].join(" "),

    // ---------------------------------------------------------------------------
    // PRIMARY BLACK BUTTON
    // ---------------------------------------------------------------------------
    //
    // For Najibzadeh the dominant CTA should usually be BLACK,
    // not copper.
    //

  primaryButton: [
  "bg-[#0B0B0B]",
  "text-white",

  "border",
  "border-[#0B0B0B]",

  "hover:bg-[#262626]",
  "hover:border-[#262626]",

  "dark:bg-white",
  "dark:text-[#0B0B0B]",
  "dark:border-white",

  "dark:hover:bg-[#EDEDED]",
  "dark:hover:border-[#EDEDED]",

  "transition-colors",
  "duration-200",

  "disabled:pointer-events-none",
  "disabled:opacity-40",
].join(" "),

    // ---------------------------------------------------------------------------
    // COPPER BUTTON
    // ---------------------------------------------------------------------------
    //
    // Only for strategically important actions.
    //

    accentButton: [
        "bg-[#C15427]",
        "text-white",

        "hover:bg-[#A94420]",

        "dark:bg-[#C15427]",
        "dark:text-white",
        "dark:hover:bg-[#A94420]",

        "transition-colors",
        "duration-200",

        "disabled:pointer-events-none",
        "disabled:opacity-40",
    ].join(" "),

    // ---------------------------------------------------------------------------
    // SECONDARY BUTTON
    // ---------------------------------------------------------------------------

 secondaryButton: [
  "bg-transparent",

  "border",
  "border-[#0B0B0B]/30",

  "text-[#0B0B0B]",

  "hover:border-[#0B0B0B]",
  "hover:bg-[#0B0B0B]",
  "hover:text-white",

  "dark:border-white/35",
  "dark:text-white",

  "dark:hover:border-white",
  "dark:hover:bg-white",
  "dark:hover:text-[#0B0B0B]",

  "transition-colors",
  "duration-200",

  "disabled:pointer-events-none",
  "disabled:opacity-40",
].join(" "),

    // ---------------------------------------------------------------------------
    // GHOST BUTTON
    // ---------------------------------------------------------------------------

    ghostButton: [
        "bg-transparent",

        "text-[#77787B]",
        "hover:text-[#231F20]",

        "dark:text-[#B8B2AC]",
        "dark:hover:text-[#F8F5F0]",

        "transition-colors",
        "duration-200",
    ].join(" "),

    // ---------------------------------------------------------------------------
    // ACCENT / ACTIVE STATE
    // ---------------------------------------------------------------------------

    activeIndicator: [
  "bg-[#0B0B0B]",
  "dark:bg-white",
].join(" "),

activeText: [
  "text-[#0B0B0B]",
  "dark:text-white",
].join(" "),

activeBorder: [
  "border-[#0B0B0B]",
  "dark:border-white",
].join(" "),

    // ---------------------------------------------------------------------------
    // PRODUCT CARD
    // ---------------------------------------------------------------------------

    productCard: [
        "bg-white",
        "border",
        "border-[#DCDDDE]",

        "dark:bg-[#111820]",
        "dark:border-[#2C343C]",

        "transition-colors",
        "duration-200",
    ].join(" "),

    // ---------------------------------------------------------------------------
    // NAVBAR
    // ---------------------------------------------------------------------------

   navbar: [
  "bg-white/95",
  "text-[#0B0B0B]",

  "border-b",
  "border-[#E5E5E5]",

  "backdrop-blur-md",

  "dark:bg-[#0B0B0B]/95",
  "dark:text-white",
  "dark:border-[#292929]",
].join(" "),

    // ---------------------------------------------------------------------------
    // MEGA MENU
    // ---------------------------------------------------------------------------

megaMenu: [
  "bg-white",
  "text-[#0B0B0B]",

  "dark:bg-[#0B0B0B]",
  "dark:text-white",
].join(" "),

megaMenuMuted: [
  "bg-[#F7F7F7]",
  "dark:bg-[#111111]",
].join(" "),

    // ---------------------------------------------------------------------------
    // INPUTS
    // ---------------------------------------------------------------------------

    input: [
        "bg-white",

        "border",
        "border-[#DCDDDE]",

        "text-[#231F20]",
        "placeholder:text-[#939598]",

        "hover:border-[#939598]",

        "focus:border-[#231F20]",
        "focus:outline-none",

        "dark:bg-[#111820]",
        "dark:border-[#2C343C]",
        "dark:text-[#F8F5F0]",
        "dark:placeholder:text-[#77787B]",
        "dark:focus:border-[#B8B2AC]",

        "transition-colors",
        "duration-150",
    ].join(" "),

    // ---------------------------------------------------------------------------
    // FOCUS
    // ---------------------------------------------------------------------------

   focusRing: [
  "focus-visible:outline-none",

  "focus-visible:ring-2",
  "focus-visible:ring-[#0B0B0B]",

  "focus-visible:ring-offset-2",
  "focus-visible:ring-offset-white",

  "dark:focus-visible:ring-white",
  "dark:focus-visible:ring-offset-[#0B0B0B]",
].join(" "),
} as const;

export type ThemeClasses = typeof themeClasses;