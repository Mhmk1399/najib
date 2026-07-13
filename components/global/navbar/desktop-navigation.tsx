"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Atelier Gate Navbar — Desktop Navigation
//
// Responsibilities:
// - Primary link list with aria-current
// - Category rail with copper moving indicator
// - Hover-intent timers for Mega Menu
// - Keyboard accessibility (Enter, Space, Escape)
// - No GSAP — CSS-only interactions
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavbarCategory, NavbarLink } from "./navbar.types";

// ── Types ─────────────────────────────────────────────────────────────────────

type DesktopNavigationProps = {
  primaryLinks: readonly NavbarLink[];
  categories: readonly NavbarCategory[];
  activeCategoryId: string | null;
  megaMenuOpen: boolean;
  heroTone: "light" | "dark";
  isCompact: boolean;
  isAtTop: boolean;
  showCategoryRail: boolean;
  onCategoryActivate: (id: string) => void;
  onCategoryDeactivate: () => void;
  onMegaMenuEnter: () => void;
  onMegaMenuLeave: () => void;
  megaMenuId: string;
};

// ── Timing constants ──────────────────────────────────────────────────────────


// ── Component ─────────────────────────────────────────────────────────────────

export function DesktopNavigation({
  primaryLinks,
  categories,
  activeCategoryId,
  megaMenuOpen,
  heroTone,
  isCompact,
  isAtTop,
  showCategoryRail,
  onCategoryActivate,
  onCategoryDeactivate,
  onMegaMenuEnter,
  onMegaMenuLeave,
  megaMenuId,
}: DesktopNavigationProps) {
  const pathname = usePathname();

  // ── Hover-intent timers (refs — not state) ───────────────────────────────

  // Copper indicator position
  const railRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    opacity: number;
  }>({ left: 0, width: 0, opacity: 0 });

  // ── Cleanup timers on unmount ─────────────────────────────────────────────
  // ── Update copper indicator when active category changes ─────────────────
  useEffect(() => {
    if (!activeCategoryId || !railRef.current) {
      if (!megaMenuOpen) {
        setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      }
      return;
    }

    const triggerEl = railRef.current.querySelector<HTMLButtonElement>(
      `[data-category-id="${activeCategoryId}"]`,
    );

    if (!triggerEl) return;

    const railRect = railRef.current.getBoundingClientRect();
    const triggerRect = triggerEl.getBoundingClientRect();

    setIndicatorStyle({
      left: triggerRect.left - railRect.left,
      width: triggerRect.width,
      opacity: megaMenuOpen ? 1 : 0,
    });
  }, [activeCategoryId, megaMenuOpen]);

  // ── Hover intent handlers ─────────────────────────────────────────────────

  const handleCategoryPointerEnter = useCallback(
    (categoryId: string) => {
      onMegaMenuEnter();
      onCategoryActivate(categoryId);
    },
    [onCategoryActivate, onMegaMenuEnter],
  );

  const isMovingIntoMegaMenu = useCallback(
    (target: EventTarget | null) => {
      if (!(target instanceof Node)) return false;
      return document.getElementById(megaMenuId)?.contains(target) ?? false;
    },
    [megaMenuId],
  );

  const handleCategoryPointerLeave = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (isMovingIntoMegaMenu(event.relatedTarget)) return;
      onMegaMenuLeave();
    },
    [isMovingIntoMegaMenu, onMegaMenuLeave],
  );

  const handleMegaMenuAreaEnter = useCallback(() => {
    onMegaMenuEnter();
  }, [onMegaMenuEnter]);

  const handleMegaMenuAreaLeave = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (isMovingIntoMegaMenu(event.relatedTarget)) return;
      onMegaMenuLeave();
    },
    [isMovingIntoMegaMenu, onMegaMenuLeave],
  );

  // ── Keyboard handlers ─────────────────────────────────────────────────────

  const handleCategoryKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, categoryId: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (activeCategoryId === categoryId && megaMenuOpen) {
          onCategoryDeactivate();
        } else {
          onCategoryActivate(categoryId);
        }
      } else if (e.key === "Escape") {
        onCategoryDeactivate();
      }
    },
    [
      activeCategoryId,
      megaMenuOpen,
      onCategoryActivate,
      onCategoryDeactivate,
    ],
  );

  // ── Color classes ─────────────────────────────────────────────────────────

  // Hero state: respect heroTone, not theme
  // Compact state: respect theme
  const isHeroMode = isAtTop && !isCompact;

  const primaryLinkColor = isHeroMode
    ? heroTone === "light"
      ? "text-white/85 hover:text-white"
      : "text-[#231F20]/80 hover:text-[#231F20]"
    : "text-[#231F20]/80 hover:text-[#231F20] dark:text-[#F8F5F0]/80 dark:hover:text-[#F8F5F0]";

  const categoryLinkColor = isHeroMode
    ? heroTone === "light"
      ? "text-white/70 hover:text-white"
      : "text-[#231F20]/60 hover:text-[#231F20]"
    : "text-[#231F20]/60 hover:text-[#231F20] dark:text-[#B8B2AC] dark:hover:text-[#F8F5F0]";

  const railBorderColor = isHeroMode
    ? heroTone === "light"
      ? "border-white/15"
      : "border-[#231F20]/15"
    : "border-[#DED8D1]/70 dark:border-[#2C343C]/70";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      onMouseEnter={handleMegaMenuAreaEnter}
      onMouseLeave={handleMegaMenuAreaLeave}
    >
      {/* ── Primary Navigation ─────────────────────────────────────────── */}
      <nav aria-label="پیمایش اصلی" className="hidden lg:flex items-center">
        <ul role="list" className="flex items-center gap-x-8 xl:gap-x-10">
          {primaryLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(link.href);

            return (
              <li key={link.id}>
                <Link
                  href={link.href}
                  aria-label={link.ariaLabel}
                  aria-current={isActive ? "page" : undefined}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  prefetch={link.id === "home" ? undefined : false}
                  className={[
                    "relative inline-flex items-center",
                    "min-h-[44px]",
                    "text-[13px] tracking-[0.05em]",
                    "font-light",
                    "transition-colors duration-200 ease-out",
                    "focus-visible:outline-none focus-visible:ring-1",
                    "focus-visible:ring-[#C15427] focus-visible:ring-offset-2",
                    "focus-visible:ring-offset-transparent",
                    // Copper bottom line for active
                    "after:absolute after:bottom-0 after:right-0 after:h-px",
                    "after:bg-[#C15427]/80",
                    isActive
                      ? "after:w-full text-[#231F20] dark:text-[#F8F5F0]"
                      : "after:w-0 hover:after:w-full after:transition-[width] after:duration-200",
                    primaryLinkColor,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Category Rail ──────────────────────────────────────────────── */}
      {showCategoryRail && categories.length > 0 && (
        <div
          className={["hidden lg:block", "border-t", railBorderColor].join(" ")}
        >
          <div
            ref={railRef}
            className={[
              "relative flex items-center gap-x-0",
              "overflow-x-auto scrollbar-none",
              "-mx-1", // optical alignment
            ].join(" ")}
            role="list"
            aria-label="دسته‌بندی محصولات"
          >
            {categories.map((category) => {
              const isActive = activeCategoryId === category.id;

              return (
                <div
                  key={category.id}
                  role="listitem"
                  className="flex-shrink-0"
                >
                  <button
                    type="button"
                    data-category-id={category.id}
                    aria-expanded={isActive && megaMenuOpen}
                    aria-controls={
                      isActive && megaMenuOpen ? megaMenuId : undefined
                    }
                    onPointerEnter={() =>
                      handleCategoryPointerEnter(category.id)
                    }
                    onPointerLeave={handleCategoryPointerLeave}
                    onFocus={() => onCategoryActivate(category.id)}
                    onKeyDown={(e) => handleCategoryKeyDown(e, category.id)}
                    onClick={() => {
                      if (isActive && megaMenuOpen) {
                        onCategoryDeactivate();
                      } else {
                        onCategoryActivate(category.id);
                      }
                    }}
                    className={[
                      "relative px-4 py-2.5",
                      "min-h-[44px] flex items-center",
                      "text-[12px] tracking-[0.06em]",
                      "transition-colors duration-200",
                      "focus-visible:outline-none focus-visible:ring-1",
                      "focus-visible:ring-[#C15427] focus-visible:ring-offset-1",
                      "focus-visible:ring-offset-transparent",
                      "whitespace-nowrap",
                      isActive && megaMenuOpen
                        ? "text-[#231F20] dark:text-[#F8F5F0]"
                        : categoryLinkColor,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {category.label}
                  </button>
                </div>
              );
            })}

            {/* Moving copper indicator */}
            <span
              className={[
                "absolute bottom-0 h-px bg-[#C15427]",
                "transition-[left,width,opacity] duration-300 ease-out",
                "pointer-events-none",
              ].join(" ")}
              style={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
                opacity: indicatorStyle.opacity,
              }}
              aria-hidden="true"
            />
          </div>
        </div>
      )}
    </div>
  );
}
