"use client";

import { type CSSProperties, useSyncExternalStore } from "react";
import { AdminThemeName } from "../global/table/types";

/**
 * Canonical palette used by the Dynamic Data Grid.
 *
 * AdminShell remains the source of truth for the selected theme through:
 *   document.documentElement.dataset.theme = "dark" | "light"
 *
 * Keeping an explicit palette type prevents TypeScript from inferring an
 * outdated union when a project still has an older copy of this file.
 */
export type AdminDataThemePalette = {
    canvas: string;
    chrome: string;
    surface: string;
    surfaceRaised: string;
    surfaceMuted: string;
    text: string;
    muted: string;
    soft: string;
    border: string;
    borderStrong: string;
    accent: string;
    accentStrong: string;
    danger: string;
    success: string;
    warning: string;
    info: string;
    overlay: string;
};

export const ADMIN_DATA_THEME: Record<AdminThemeName, AdminDataThemePalette> = {
    dark: {
        canvas: "#080c10",
        chrome: "#090d11",
        surface: "#0c1117",
        surfaceRaised: "#111820",
        surfaceMuted: "#10151b",
        text: "#f5f3ee",
        muted: "rgba(245,243,238,0.58)",
        soft: "rgba(245,243,238,0.34)",
        border: "rgba(255,255,255,0.08)",
        borderStrong: "rgba(255,255,255,0.16)",
        accent: "#9d7357",
        accentStrong: "#d0a181",
        danger: "#df8178",
        success: "#69c996",
        warning: "#df8c5e",
        info: "#79aed2",
        overlay: "rgba(0,0,0,0.72)",
    },
    light: {
        canvas: "#ddd9d2",
        chrome: "#e9e5de",
        surface: "#f0ede7",
        surfaceRaised: "#f7f4ef",
        surfaceMuted: "#e8e4dd",
        text: "#1d1c1a",
        muted: "rgba(29,28,26,0.62)",
        soft: "rgba(29,28,26,0.40)",
        border: "rgba(0,0,0,0.09)",
        borderStrong: "rgba(0,0,0,0.18)",
        accent: "#9d7357",
        accentStrong: "#7d553c",
        danger: "#a7554c",
        success: "#2f7f51",
        warning: "#9e4b25",
        info: "#2d6f9f",
        overlay: "rgba(20,18,16,0.44)",
    },
};

function subscribe(callback: () => void) {
    if (typeof document === "undefined") return () => { };

    const observer = new MutationObserver(callback);
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
    });

    window.addEventListener("storage", callback);

    return () => {
        observer.disconnect();
        window.removeEventListener("storage", callback);
    };
}

function getSnapshot(): AdminThemeName {
    if (typeof document === "undefined") return "dark";
    return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function getServerSnapshot(): AdminThemeName {
    return "dark";
}

/** Reads AdminShell's existing html[data-theme]. No ThemeContext is created. */
export function useAdminTheme(): AdminThemeName {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function getAdminThemePalette(
    theme: AdminThemeName,
): AdminDataThemePalette {
    return ADMIN_DATA_THEME[theme];
}

/** CSS variables inherited by the grid and by components rendered in portals. */
export function getAdminDataThemeVars(theme: AdminThemeName): CSSProperties {
    const token = getAdminThemePalette(theme);

    return {
        "--adt-canvas": token.canvas,
        "--adt-chrome": token.chrome,
        "--adt-surface": token.surface,
        "--adt-surface-raised": token.surfaceRaised,
        "--adt-surface-muted": token.surfaceMuted,
        "--adt-text": token.text,
        "--adt-muted": token.muted,
        "--adt-soft": token.soft,
        "--adt-border": token.border,
        "--adt-border-strong": token.borderStrong,
        "--adt-accent": token.accent,
        "--adt-accent-strong": token.accentStrong,
        "--adt-danger": token.danger,
        "--adt-success": token.success,
        "--adt-warning": token.warning,
        "--adt-info": token.info,
        "--adt-overlay": token.overlay,
        colorScheme: theme,
    } as CSSProperties;
}
