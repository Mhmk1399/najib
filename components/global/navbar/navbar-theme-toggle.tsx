"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Atelier Gate Navbar — Theme Toggle
// Client Component. Uses the project's existing useTheme hook.
// Never manipulates document classes directly.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useState, useEffect } from "react";
import { useTheme } from "@/contexts/theme-context";
import { SunIcon, MoonIcon } from "./navbar-icons";
import type { ThemePreference } from "@/theme/theme.types";

type ThemeToggleProps = {
  label: string;
  tone?: "light" | "dark";
  isCompact?: boolean;
};

const THEME_SEQUENCE: ThemePreference[] = ["light", "dark"];

function getNextTheme(current: string): ThemePreference {
  const index = THEME_SEQUENCE.indexOf(current as ThemePreference);
  return THEME_SEQUENCE[(index + 1) % THEME_SEQUENCE.length];
}

function ThemeIcon({
  theme,
  size,
}: {
  theme: string | undefined;
  size: number;
}) {
  if (theme === "dark") return <MoonIcon size={size} />;
  return <SunIcon size={size} />;
}

export function NavbarThemeToggle({
  label,
  tone = "dark",
  isCompact = false,
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch for theme icon
  useEffect(() => {
    setMounted(true);
  }, []);

  const safeTheme = mounted ? theme : "light";
  const safeResolvedTheme = mounted ? resolvedTheme : undefined;

  const handleToggle = useCallback(() => {
    const next = getNextTheme(safeTheme ?? "light");
    setTheme(next);
  }, [safeTheme, setTheme]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const next = getNextTheme(safeTheme ?? "light");
        setTheme(next);
      }
    },
    [safeTheme, setTheme],
  );

  // Determine foreground color based on tone (Hero state) or theme (compact)
  const colorClass =
    tone === "light"
      ? "text-white/90 hover:text-white"
      : "text-[#231F20]/90 hover:text-[#231F20] dark:text-[#F8F5F0]/90 dark:hover:text-[#F8F5F0]";

  const currentThemeLabel =
    safeTheme === "dark"
      ? "پوسته تاریک — کلیک برای تغییر"
      : "پوسته روشن — کلیک برای تغییر";

  return (
    <button
      type="button"
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      aria-label={`${label}: ${currentThemeLabel}`}
      className={[
        "relative flex items-center justify-center",
        "min-w-[44px] min-h-[44px]",
        "rounded-none", // No pill shape — editorial restraint
        "transition-colors duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-1",
        "focus-visible:ring-[#C15427] focus-visible:ring-offset-2",
        "focus-visible:ring-offset-transparent",
        colorClass,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={[
          "transition-all duration-300 ease-out",
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-95",
        ].join(" ")}
        aria-hidden="true"
      >
        <ThemeIcon
          theme={safeResolvedTheme}
          size={isCompact ? 18 : 20}
        />
      </span>

      {/* Accessible text always rendered for screen readers */}
      <span className="sr-only">{label}</span>
    </button>
  );
}
