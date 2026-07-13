// src/components/ui/ThemeToggle.tsx
"use client";

/**
 * ThemeToggle
 *
 * An accessible button that cycles between light and dark themes.
 * This is one of the few components that legitimately uses useTheme —
 * it needs to read and mutate the current theme preference.
 *
 * Render nothing (or a placeholder) until mounted to prevent hydration
 * mismatch: the server does not know the user's stored preference.
 */

import { useTheme, themeClasses } from "@/theme";

export function ThemeToggle(): React.JSX.Element | null {
  const { resolvedTheme, toggleTheme, mounted } = useTheme();

  // During SSR / before hydration: render a same-size placeholder to
  // prevent layout shift.  Do NOT return null outright if it causes CLS.
  if (!mounted) {
    return (
      <button
        aria-hidden="true"
        disabled
        className={[
          "h-9 w-9",
          "rounded-none", // Najibzadeh: no excessive rounding
          "border",
          themeClasses.border,
          "opacity-0", // invisible but occupies space
          themeClasses.focusRing,
        ].join(" ")}
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      className={[
        // Dimensions — square, no pill shape
        "h-9 w-9",
        "inline-flex items-center justify-center",
        // Border style — architectural, not rounded
        "border",
        themeClasses.border,
        // Text
        themeClasses.textSecondary,
        // Hover — subtle copper accent, respecting usage rule
        "hover:border-[#C15427] hover:text-[#C15427]",
        "dark:hover:border-[#C15427] dark:hover:text-[#C15427]",
        // Transitions — single property, no continuous animation
        "transition-colors duration-150",
        // Focus
        themeClasses.focusRing,
      ].join(" ")}
    >
      {/*
       * Use simple SVG icons — no icon library dependency.
       * Screen readers use the aria-label; these are aria-hidden.
       */}
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

// ── Minimal inline SVG icons ───────────────────────────────────────────────
// Kept here to avoid icon-library dependencies in the theme system.

function SunIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
