"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Atelier Gate Navbar — Mobile Wardrobe Menu
//
// Multi-panel sliding navigation system:
//   Panel 1 → ROOT (primary links + categories entry)
//   Panel 2 → CATEGORIES (all categories with numbers)
//   Panel 3 → CATEGORY DETAIL (grouped links)
//
// Uses native <dialog> element for focus trap and Escape handling.
// GSAP panel transitions loaded dynamically on first open.
// CSS transform fallback when GSAP is unavailable.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useEffect, useCallback, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type {
  NavbarCategory,
  NavbarLink,
  NavbarUser,
  NavbarActionLabels,
  MobileMenuPanel,
} from "./navbar.types";
import {
  CloseIcon,
  BackIcon,
  ArrowIcon,
  BagIcon,
  AccountIcon,
} from "./navbar-icons";
import { NavbarThemeToggle } from "./navbar-theme-toggle";
import { loadNavbarGsap } from "./navbar-gsap";
import {
  HOME_EYEBROW_MUTED_CLASS,
  HOME_EYEBROW_LINE_CLASS,
  HOME_EYEBROW_ROW_CLASS,
} from "@/components/static/home/home-section-classes";

// ── Types ─────────────────────────────────────────────────────────────────────

type MobileWardrobeMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  primaryLinks: readonly NavbarLink[];
  categories: readonly NavbarCategory[];
  user: NavbarUser | null;
  cartCount: number;
  labels: NavbarActionLabels;
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
};

// ── Scroll lock helpers ───────────────────────────────────────────────────────

function lockScroll(): () => void {
  const scrollY = window.scrollY;
  const originalOverflow = document.body.style.overflow;
  const originalPosition = document.body.style.position;
  const originalTop = document.body.style.top;
  const originalWidth = document.body.style.width;

  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = "100%";

  return () => {
    document.body.style.overflow = originalOverflow;
    document.body.style.position = originalPosition;
    document.body.style.top = originalTop;
    document.body.style.width = originalWidth;
    window.scrollTo({ top: scrollY, behavior: "instant" });
  };
}

// ── Panel transition helpers ──────────────────────────────────────────────────

type PanelEl = HTMLDivElement | null;

async function slideForward(
  fromPanel: PanelEl,
  toPanel: PanelEl,
  prefersReduced: boolean,
) {
  if (!fromPanel || !toPanel) return;

  if (prefersReduced) {
    fromPanel.style.opacity = "0";
    fromPanel.style.visibility = "hidden";
    toPanel.style.opacity = "1";
    toPanel.style.visibility = "visible";
    toPanel.style.transform = "translateX(0)";
    return;
  }

  try {
    const gsap = await loadNavbarGsap();
    gsap.set(toPanel, {
      x: "-100%",
      opacity: 1,
      visibility: "visible",
    });
    const tl = gsap.timeline();
    tl.to(fromPanel, {
      x: "40%",
      opacity: 0,
      duration: 0.28,
      ease: "power2.in",
    }).to(toPanel, { x: "0%", duration: 0.38, ease: "power3.out" }, "-=0.14");
  } catch {
    // CSS fallback
    fromPanel.style.opacity = "0";
    fromPanel.style.transform = "translateX(40%)";
    toPanel.style.opacity = "1";
    toPanel.style.transform = "translateX(0)";
    toPanel.style.visibility = "visible";
  }
}

async function slideBack(
  fromPanel: PanelEl,
  toPanel: PanelEl,
  prefersReduced: boolean,
) {
  if (!fromPanel || !toPanel) return;

  if (prefersReduced) {
    fromPanel.style.opacity = "0";
    fromPanel.style.visibility = "hidden";
    toPanel.style.opacity = "1";
    toPanel.style.visibility = "visible";
    toPanel.style.transform = "translateX(0)";
    return;
  }

  try {
    const gsap = await loadNavbarGsap();
    gsap.set(toPanel, { x: "0%", opacity: 1, visibility: "visible" });
    const tl = gsap.timeline();
    tl.to(fromPanel, {
      x: "-100%",
      opacity: 0,
      duration: 0.28,
      ease: "power2.in",
    }).to(
      toPanel,
      { x: "0%", opacity: 1, duration: 0.36, ease: "power3.out" },
      "-=0.1",
    );
  } catch {
    fromPanel.style.opacity = "0";
    fromPanel.style.transform = "translateX(-100%)";
    toPanel.style.opacity = "1";
    toPanel.style.transform = "translateX(0)";
    toPanel.style.visibility = "visible";
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MobileWardrobeMenu({
  isOpen,
  onClose,
  primaryLinks,
  categories,
  user,
  cartCount,
  labels,
  menuButtonRef,
}: MobileWardrobeMenuProps) {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [activePanel, setActivePanel] = useState<MobileMenuPanel>("root");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // Panel refs
  const rootPanelRef = useRef<HTMLDivElement>(null);
  const categoriesPanelRef = useRef<HTMLDivElement>(null);
  const detailPanelRef = useRef<HTMLDivElement>(null);

  const unlockScrollRef = useRef<(() => void) | null>(null);
  const prefersReducedRef = useRef(false);

  // ── Reduced motion ────────────────────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedRef.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedRef.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ── Route change → close ──────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ── Open / close dialog ───────────────────────────────────────────────────
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        try {
          dialog.showModal();
        } catch {
          // dialog.open fallback
          dialog.setAttribute("open", "");
        }
      }
      // Reset to root panel
      setActivePanel("root");
      setActiveCategoryId(null);

      // Reset panel positions
      const root = rootPanelRef.current;
      const cats = categoriesPanelRef.current;
      const detail = detailPanelRef.current;
      if (root) {
        root.style.opacity = "1";
        root.style.transform = "translateX(0)";
        root.style.visibility = "visible";
      }
      if (cats) {
        cats.style.opacity = "0";
        cats.style.transform = "translateX(-100%)";
        cats.style.visibility = "hidden";
      }
      if (detail) {
        detail.style.opacity = "0";
        detail.style.transform = "translateX(-100%)";
        detail.style.visibility = "hidden";
      }

      // Lock scroll
      unlockScrollRef.current = lockScroll();
    } else {
      if (dialog.open) {
        try {
          dialog.close();
        } catch {
          dialog.removeAttribute("open");
        }
      }

      // Unlock scroll
      if (unlockScrollRef.current) {
        unlockScrollRef.current();
        unlockScrollRef.current = null;
      }

      // Restore focus to menu button
      requestAnimationFrame(() => {
        menuButtonRef.current?.focus();
      });
    }
  }, [isOpen, menuButtonRef]);

  // ── Cleanup scroll lock on unmount ────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (unlockScrollRef.current) {
        unlockScrollRef.current();
      }
    };
  }, []);

  // ── Dialog close event (Escape key via native dialog) ────────────────────
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    function handleDialogClose() {
      onClose();
    }

    dialog.addEventListener("close", handleDialogClose);
    return () => dialog.removeEventListener("close", handleDialogClose);
  }, [onClose]);

  // ── Panel navigation ──────────────────────────────────────────────────────

  const goToCategories = useCallback(async () => {
    setActivePanel("categories");
    await slideForward(
      rootPanelRef.current,
      categoriesPanelRef.current,
      prefersReducedRef.current,
    );
  }, []);

  const goToDetail = useCallback(async (categoryId: string) => {
    setActiveCategoryId(categoryId);
    setActivePanel("category-detail");
    await slideForward(
      categoriesPanelRef.current,
      detailPanelRef.current,
      prefersReducedRef.current,
    );
  }, []);

  const goBack = useCallback(async () => {
    if (activePanel === "category-detail") {
      setActivePanel("categories");
      await slideBack(
        detailPanelRef.current,
        categoriesPanelRef.current,
        prefersReducedRef.current,
      );
    } else if (activePanel === "categories") {
      setActivePanel("root");
      await slideBack(
        categoriesPanelRef.current,
        rootPanelRef.current,
        prefersReducedRef.current,
      );
    }
  }, [activePanel]);

  // ── Derived data ──────────────────────────────────────────────────────────

  const activeCategory = categories.find((c) => c.id === activeCategoryId);
  const categoryIndex = categories.findIndex((c) => c.id === activeCategoryId);
  const displayIndex = String(categoryIndex + 1).padStart(2, "0");

  const safeCartCount = cartCount ?? 0;
  const cartLabel =
    safeCartCount > 99
      ? "99+"
      : safeCartCount > 0
        ? String(safeCartCount)
        : null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="mobile-menu-title"
      className={[
        "fixed inset-0 z-[60]",
        "m-0 p-0",
        "max-w-none max-h-none w-full h-full",
        "overflow-hidden",
        "bg-transparent",
        // Remove default dialog border/outline
        "border-0 outline-none",
        // Backdrop handled inline — dialog::backdrop reset
        "[&::backdrop]:bg-[#231F20]/60",
      ].join(" ")}
    >
      {/* Invisible close zone outside the menu panel */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* ── Menu Panel Container ────────────────────────────────────────── */}
      <div
        className={[
          "relative w-full max-w-[420px] h-full",
          "bg-[#FCFAF7] dark:bg-[#0B1117]",
          "overflow-hidden",
          "flex flex-col",
          "shadow-[4px_0_32px_rgba(0,0,0,0.12)]",
          // RTL: menu slides from right
          "mr-auto",
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Menu Header ─────────────────────────────────────────────── */}
        <div
          className={[
            "flex items-center justify-between",
            "px-6 py-4",
            "border-b border-[#DED8D1]/60 dark:border-[#2C343C]/60",
            "flex-shrink-0",
          ].join(" ")}
        >
          {/* Back button — visible on sub-panels */}
          <button
            type="button"
            onClick={goBack}
            aria-label={labels.back}
            className={[
              "min-w-[44px] min-h-[44px] flex items-center justify-center",
              "text-[#231F20]/60 dark:text-[#B8B2AC]",
              "transition-opacity duration-200",
              activePanel !== "root"
                ? "opacity-100"
                : "opacity-0 pointer-events-none",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C15427]",
            ].join(" ")}
          >
            <BackIcon size={20} aria-hidden />
          </button>

          {/* Panel title */}
          <span
            id="mobile-menu-title"
            className="text-[11px] tracking-[0.18em] uppercase text-[#6C6662] dark:text-[#B8B2AC]"
          >
            {activePanel === "root"
              ? "منو"
              : activePanel === "categories"
                ? labels.categories
                : (activeCategory?.label ?? "")}
          </span>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            className={[
              "min-w-[44px] min-h-[44px] flex items-center justify-center",
              "text-[#231F20]/70 dark:text-[#F8F5F0]/70",
              "hover:text-[#231F20] dark:hover:text-[#F8F5F0]",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C15427]",
            ].join(" ")}
          >
            <CloseIcon size={20} aria-hidden />
          </button>
        </div>

        {/* ── Panel Viewport ───────────────────────────────────────────── */}
        <div className="relative flex-1 overflow-hidden">
          {/* ── ROOT PANEL ────────────────────────────────────────────── */}
          <div
            ref={rootPanelRef}
            className={[
              "absolute inset-0 overflow-y-auto",
              "flex flex-col",
              "px-6 py-6",
            ].join(" ")}
          >
            {/* Primary nav links */}
            <nav aria-label="پیمایش اصلی" className="mb-8">
              <ul role="list" className="space-y-0">
                {primaryLinks.map((link) => {
                  const isActive =
                    link.href === "/"
                      ? pathname === "/"
                      : pathname?.startsWith(link.href);

                  return (
                    <li
                      key={link.id}
                      className="border-b border-[#DED8D1]/40 dark:border-[#2C343C]/40"
                    >
                      <Link
                        href={link.href}
                        onClick={onClose}
                        aria-current={isActive ? "page" : undefined}
                        className={[
                          "flex items-center min-h-[52px]",
                          "text-[17px] font-light tracking-[0.01em]",
                          "transition-colors duration-150",
                          isActive
                            ? "text-[#231F20] dark:text-[#F8F5F0]"
                            : "text-[#231F20]/70 dark:text-[#F8F5F0]/70",
                          "hover:text-[#231F20] dark:hover:text-[#F8F5F0]",
                          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C15427]",
                        ].join(" ")}
                      >
                        {link.label}
                        {isActive && (
                          <span
                            className="ms-auto w-1 h-1 rounded-full bg-[#C15427]"
                            aria-hidden="true"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Categories entry */}
            {categories.length > 0 && (
              <button
                type="button"
                onClick={goToCategories}
                className={[
                  "flex items-center justify-between",
                  "min-h-[52px] w-full",
                  "text-[15px] font-light tracking-[0.02em]",
                  "text-[#231F20]/80 dark:text-[#F8F5F0]/80",
                  "hover:text-[#231F20] dark:hover:text-[#F8F5F0]",
                  "border-b border-[#DED8D1]/40 dark:border-[#2C343C]/40",
                  "transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C15427]",
                ].join(" ")}
              >
                <span>{labels.categories}</span>
                <ArrowIcon
                  size={16}
                  className="rtl:rotate-180 text-[#6C6662] dark:text-[#B8B2AC]"
                  aria-hidden
                />
              </button>
            )}

            {/* Spacer */}
            <div className="flex-1 min-h-[32px]" />

            {/* ── Bottom actions ─────────────────────────────────────── */}
            <div className="mt-auto pt-8 border-t border-[#DED8D1]/40 dark:border-[#2C343C]/40">
              <div className="flex items-center justify-between">
                {/* Account */}
                {user ? (
                  <Link
                    href={user.dashboardHref}
                    onClick={onClose}
                    className={[
                      "flex items-center gap-2 min-h-[44px]",
                      "text-[13px] text-[#231F20]/70 dark:text-[#F8F5F0]/70",
                      "hover:text-[#231F20] dark:hover:text-[#F8F5F0]",
                      "transition-colors duration-150",
                      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C15427]",
                    ].join(" ")}
                  >
                    <AccountIcon size={18} aria-hidden />
                    <span>{user.name}</span>
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={onClose}
                    className={[
                      "flex items-center gap-2 min-h-[44px]",
                      "text-[13px] text-[#231F20]/70 dark:text-[#F8F5F0]/70",
                      "hover:text-[#231F20] dark:hover:text-[#F8F5F0]",
                      "transition-colors duration-150",
                      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C15427]",
                    ].join(" ")}
                  >
                    <AccountIcon size={18} aria-hidden />
                    <span>{labels.login}</span>
                  </Link>
                )}

                <div className="flex items-center gap-1">
                  {/* Cart */}
                  <Link
                    href="/cart"
                    onClick={onClose}
                    aria-label={`${labels.cart}${safeCartCount > 0 ? `: ${safeCartCount} مورد` : ""}`}
                    className={[
                      "relative flex items-center justify-center",
                      "min-w-[44px] min-h-[44px]",
                      "text-[#231F20]/70 dark:text-[#F8F5F0]/70",
                      "hover:text-[#231F20] dark:hover:text-[#F8F5F0]",
                      "transition-colors duration-150",
                      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C15427]",
                    ].join(" ")}
                  >
                    <BagIcon size={20} aria-hidden />
                    {cartLabel && (
                      <span
                        className={[
                          "absolute top-1.5 end-1",
                          "min-w-[16px] h-[16px] px-0.5",
                          "flex items-center justify-center",
                          "bg-[#231F20] dark:bg-[#F8F5F0]",
                          "text-[#FCFAF7] dark:text-[#0B1117]",
                          "text-[9px] font-mono tabular-nums leading-none",
                          "rounded-none",
                        ].join(" ")}
                        aria-hidden="true"
                      >
                        {cartLabel}
                      </span>
                    )}
                  </Link>

                  {/* Theme */}
                  <NavbarThemeToggle label={labels.theme} tone="dark" />
                </div>
              </div>

              {/* Brand tagline */}
              <p className="mt-6 text-[11px] tracking-[0.18em] text-[#6C6662] dark:text-[#B8B2AC] uppercase">
                وقار در سکوت
              </p>
            </div>
          </div>

          {/* ── CATEGORIES PANEL ──────────────────────────────────────── */}
          <div
            ref={categoriesPanelRef}
            className={[
              "absolute inset-0 overflow-y-auto",
              "px-6 py-6",
              "opacity-0 invisible",
            ].join(" ")}
            style={{ transform: "translateX(-100%)" }}
          >
            <ul
              role="list"
              className="space-y-0"
              aria-label={labels.categories}
            >
              {categories.map((category, index) => {
                const num = String(index + 1).padStart(2, "0");

                return (
                  <li
                    key={category.id}
                    className="border-b border-[#DED8D1]/40 dark:border-[#2C343C]/40"
                  >
                    <button
                      type="button"
                      onClick={() => goToDetail(category.id)}
                      className={[
                        "flex items-center w-full",
                        "min-h-[60px] py-3",
                        "text-start",
                        "group",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C15427]",
                      ].join(" ")}
                    >
                      <span
                        className="font-mono text-[10px] text-[#C15427] w-7 flex-shrink-0"
                        aria-hidden="true"
                      >
                        {num}
                      </span>
                      <span className="flex-1">
                        <span className="block text-[16px] font-light text-[#231F20] dark:text-[#F8F5F0] group-hover:text-[#231F20] dark:group-hover:text-[#F8F5F0] transition-colors duration-150">
                          {category.label}
                        </span>
                        {category.eyebrow && (
                          <span className={`${HOME_EYEBROW_ROW_CLASS} mt-1`}>
                            <span className={HOME_EYEBROW_MUTED_CLASS}>
                              {category.eyebrow}
                            </span>
                            <span
                              aria-hidden="true"
                              className={HOME_EYEBROW_LINE_CLASS}
                            />
                          </span>
                        )}
                      </span>
                      <ArrowIcon
                        size={14}
                        className="rtl:rotate-180 text-[#6C6662] dark:text-[#B8B2AC] flex-shrink-0"
                        aria-hidden
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ── CATEGORY DETAIL PANEL ─────────────────────────────────── */}
          <div
            ref={detailPanelRef}
            className={[
              "absolute inset-0 overflow-y-auto",
              "px-6 py-6",
              "opacity-0 invisible",
            ].join(" ")}
            style={{ transform: "translateX(-100%)" }}
          >
            {activeCategory ? (
              <>
                {/* Category image */}
                {activeCategory.image?.src && (
                  <div className="relative aspect-[16/7] mb-6 overflow-hidden bg-[#F8F3EB] dark:bg-[#171F27]">
                    <Image
                      src={activeCategory.image.src}
                      alt={activeCategory.image.alt}
                      fill
                      sizes="(max-width: 420px) 100vw, 420px"
                      quality={80}
                      loading="lazy"
                      draggable={false}
                      className="object-cover object-center"
                    />
                  </div>
                )}

                {/* Category header */}
                <div className="mb-6">
                  {activeCategory.eyebrow && (
                    <div className={`${HOME_EYEBROW_ROW_CLASS} mb-2`}>
                      <span className={HOME_EYEBROW_MUTED_CLASS}>
                        {activeCategory.eyebrow}
                      </span>
                      <span
                        aria-hidden="true"
                        className={HOME_EYEBROW_LINE_CLASS}
                      />
                    </div>
                  )}
                  <span
                    className="font-mono text-[10px] text-[#C15427]"
                    aria-hidden="true"
                  >
                    {displayIndex}
                  </span>
                  <h2 className="text-[22px] font-light text-[#231F20] dark:text-[#F8F5F0] mt-1">
                    {activeCategory.label}
                  </h2>
                  {activeCategory.description && (
                    <p className="text-[13px] text-[#6C6662] dark:text-[#B8B2AC] mt-2 leading-relaxed">
                      {activeCategory.description}
                    </p>
                  )}
                </div>

                {/* View all link */}
                <Link
                  href={activeCategory.href}
                  onClick={onClose}
                  prefetch={false}
                  className={[
                    "inline-flex items-center gap-2 mb-8",
                    "text-[12px] tracking-[0.14em] uppercase",
                    "text-[#231F20] dark:text-[#F8F5F0]",
                    "border-b border-[#C15427]/50",
                    "pb-1 hover:border-[#C15427]",
                    "transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C15427]",
                  ].join(" ")}
                >
                  <span>مشاهده همه</span>
                  <ArrowIcon
                    size={12}
                    className="rtl:rotate-180 text-[#C15427]"
                    aria-hidden
                  />
                </Link>

                {/* Link groups */}
                {activeCategory.groups.map((group) => (
                  <div key={group.id} className="mb-8">
                    <h3
                      className={[
                        "text-[10px] tracking-[0.2em] uppercase",
                        "text-[#6C6662] dark:text-[#B8B2AC]",
                        "mb-4 pb-2",
                        "border-b border-[#DED8D1]/60 dark:border-[#2C343C]/60",
                      ].join(" ")}
                    >
                      {group.title}
                    </h3>
                    <ul role="list" className="space-y-0">
                      {group.links.map((link) => (
                        <li
                          key={link.id}
                          className="border-b border-[#DED8D1]/30 dark:border-[#2C343C]/30"
                        >
                          <Link
                            href={link.href}
                            onClick={onClose}
                            prefetch={false}
                            className={[
                              "block min-h-[44px] flex items-center",
                              "text-[14px] font-light",
                              "text-[#231F20]/75 dark:text-[#F8F5F0]/75",
                              "hover:text-[#231F20] dark:hover:text-[#F8F5F0]",
                              "transition-colors duration-150",
                              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C15427]",
                            ].join(" ")}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Featured action */}
                {activeCategory.featuredAction && (
                  <div className="mt-2 pb-8">
                    <Link
                      href={activeCategory.featuredAction.href}
                      onClick={onClose}
                      prefetch={false}
                      className={[
                        "inline-flex items-center gap-2",
                        "text-[12px] tracking-[0.14em] uppercase",
                        "text-[#231F20] dark:text-[#F8F5F0]",
                        "border-b border-[#C15427]/50 pb-1",
                        "hover:border-[#C15427] transition-colors duration-200",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C15427]",
                      ].join(" ")}
                    >
                      <span>{activeCategory.featuredAction.label}</span>
                      <ArrowIcon
                        size={12}
                        className="rtl:rotate-180 text-[#C15427]"
                        aria-hidden
                      />
                    </Link>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </dialog>
  );
}
