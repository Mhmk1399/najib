"use client";

import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { type ReactNode, useEffect, useId, useMemo, useRef } from "react";
import { DataButton } from "./primitives";
import { cx } from "./utils";
import {
  useAdminTheme,
  getAdminDataThemeVars,
  getAdminThemePalette,
} from "@/components/admin/useAdminTheme";

export type DynamicModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  mobileFullscreen?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  busy?: boolean;
  role?: "dialog" | "alertdialog";
  initialFocusSelector?: string;
};

const SIZE_CLASSES = {
  sm: "sm:max-w-[520px]",
  md: "sm:max-w-[680px]",
  lg: "sm:max-w-[860px]",
  xl: "sm:max-w-[1040px]",
} as const;

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function DynamicModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "lg",
  mobileFullscreen = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  busy = false,
  role = "dialog",
  initialFocusSelector,
}: DynamicModalProps) {
  const theme = useAdminTheme();
  const themeVars = useMemo(() => getAdminDataThemeVars(theme), [theme]);
  const palette = getAdminThemePalette(theme);
  const titleId = useId();
  const descriptionId = useId();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const busyRef = useRef(busy);
  const closeRef = useRef(onClose);
  const escapeRef = useRef(closeOnEscape);

  busyRef.current = busy;
  closeRef.current = onClose;
  escapeRef.current = closeOnEscape;

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    const inerted: Array<{ element: HTMLElement; hadInert: boolean }> = [];
    const overlay = overlayRef.current;
    if (overlay) {
      for (const child of Array.from(document.body.children)) {
        if (!(child instanceof HTMLElement)) continue;
        if (child === overlay || child.contains(overlay)) continue;
        inerted.push({ element: child, hadInert: child.hasAttribute("inert") });
        child.setAttribute("inert", "");
      }
    }

    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const preferred = initialFocusSelector
        ? panel.querySelector<HTMLElement>(initialFocusSelector)
        : null;
      const first = panel.querySelector<HTMLElement>(FOCUSABLE);
      (preferred ?? first ?? panel).focus();
    });

    function onKeyDown(event: KeyboardEvent) {
      const panel = panelRef.current;
      if (!panel) return;

      if (event.key === "Escape" && escapeRef.current && !busyRef.current) {
        event.preventDefault();
        closeRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const items = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter(
        (node) => !node.hasAttribute("disabled") && node.tabIndex !== -1,
      );
      if (!items.length) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      for (const item of inerted) {
        if (!item.hadInert) item.element.removeAttribute("inert");
      }
      requestAnimationFrame(() => restoreFocusRef.current?.focus());
    };
  }, [initialFocusSelector, open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={overlayRef}
      dir="rtl"
      style={{
        ...themeVars,
        backgroundColor: palette.overlay,
        color: palette.text,
      }}
      className="fixed inset-0 z-[1600] flex items-end justify-center bg-[var(--adt-overlay)] text-right text-[var(--adt-text)] sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && closeOnBackdrop && !busy) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        dir="rtl"
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        data-lenis-prevent
        data-lenis-prevent-wheel
        data-lenis-prevent-touch
        className={cx(
          "flex min-h-0 w-full min-w-0 flex-col overflow-hidden border border-[var(--adt-border-strong)] bg-[var(--adt-surface-raised)] text-[var(--adt-text)] shadow-[0_32px_100px_rgba(0,0,0,0.45)] outline-none",
          mobileFullscreen
            ? "h-[100dvh] sm:h-auto sm:max-h-[min(90dvh,900px)]"
            : "max-h-[min(92dvh,900px)]",
          SIZE_CLASSES[size],
        )}
        style={{ backgroundColor: palette.surfaceRaised, color: palette.text }}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--adt-border)] bg-[var(--adt-surface-raised)] px-4 py-4 sm:px-5">
          <div className="min-w-0 text-right">
            <h2
              id={titleId}
              className="truncate text-[16px] font-extrabold sm:text-[18px]"
            >
              {title}
            </h2>
            {description ? (
              <p
                id={descriptionId}
                className="mt-1.5 max-w-[760px] text-[9px] leading-5 text-[var(--adt-muted)] sm:text-[10px]"
              >
                {description}
              </p>
            ) : null}
          </div>
          <DataButton
            aria-label="بستن"
            icon={<X size={17} />}
            iconOnly
            tone="ghost"
            size="sm"
            disabled={busy}
            onClick={onClose}
          />
        </header>

        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
          {children}
        </div>

        {footer ? (
          <footer className="shrink-0 border-t border-[var(--adt-border)] bg-[var(--adt-surface-raised)] px-4 py-3 sm:px-5">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
