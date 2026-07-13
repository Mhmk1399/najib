"use client";

import { ResolvedTheme, ThemeContextValue, ThemePreference, ThemeProviderProps } from "@/theme/theme.types";
/**
 * theme-context.tsx
 *
 * نسخه ساده‌شده — بدون هیچ‌گونه وابستگی به سیستم‌عامل.
 * تم فقط از طریق دکمه تاگل یا setTheme تغییر می‌کنه.
 * هیچ matchMedia وجود نداره.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

 

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = "najibzadeh-theme" as const;

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
ThemeContext.displayName = "NajibzadehThemeContext";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readStoredPreference(): ThemePreference | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  } catch {
    // localStorage ممکنه در حالت private browsing در دسترس نباشه
  }
  return null;
}

function writeStoredPreference(value: ThemePreference): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // نادیده گرفتن خطاهای نوشتن
  }
}

function applyThemeToDocument(theme: ResolvedTheme): void {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
}

function subscribeToHydration(): () => void {
  return () => {};
}

function getClientMountedSnapshot(): boolean {
  return true;
}

function getServerMountedSnapshot(): boolean {
  return false;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ThemeProvider({
  children,
  defaultTheme = "light",
}: ThemeProviderProps): React.JSX.Element {
  const [theme, setThemeState] = useState<ThemePreference>(defaultTheme);

  const mounted = useSyncExternalStore(
    subscribeToHydration,
    getClientMountedSnapshot,
    getServerMountedSnapshot,
  );
  const previousThemeRef = useRef<ThemePreference | null>(null);

  useEffect(() => {
    const stored = readStoredPreference();
    if (stored !== null) {
      setThemeState(stored);
    }
  }, []);

  // اعمال تم به DOM
  useEffect(() => {
    if (theme === previousThemeRef.current) return;
    previousThemeRef.current = theme;
    applyThemeToDocument(theme);
  }, [theme]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const setTheme = useCallback((next: ThemePreference): void => {
    setThemeState(next);
    writeStoredPreference(next);
  }, []);

  const toggleTheme = useCallback((): void => {
    setThemeState((prev) => {
      const next = prev === "light" ? "dark" : "light";
      writeStoredPreference(next);
      return next;
    });
  }, []);

  // ── Context value ─────────────────────────────────────────────────────────

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme: theme, // بدون system، resolved همیشه برابر theme هست
      setTheme,
      toggleTheme,
      mounted,
    }),
    [theme, setTheme, toggleTheme, mounted],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error(
      "[Najibzadeh] useTheme باید داخل <ThemeProvider> استفاده بشه. " +
        "لایه‌ی ریشه رو با <ThemeProvider> از src/theme بپیچید.",
    );
  }
  return context;
}
