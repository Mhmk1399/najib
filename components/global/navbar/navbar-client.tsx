"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Atelier Gate Navbar — Client Shell
//
// Responsibilities:
// - Scroll-driven compact state (passive, RAF-throttled, threshold-only)
// - Mega Menu open/close state
// - Mobile menu state
// - Keyboard Escape handling
// - Route change cleanup
// - Renders DesktopNavigation, MegaMenuClient, MobileWardrobeMenu
//
// Must NOT:
// - Fetch data
// - Access localStorage
// - Load GSAP at module scope
// - Update React state on every scroll frame
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState, useEffect, useCallback, useId } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { NavbarClientProps } from "./navbar.types";
import { DesktopNavigation } from "./desktop-navigation";
import { MegaMenuClient } from "./mega-menu-client";
import { MobileWardrobeMenu } from "./mobile-wardrobe-menu";
import { NavbarThemeToggle } from "./navbar-theme-toggle";
import { MenuIcon, BagIcon, AccountIcon } from "./navbar-icons";

// ── Scroll constants ──────────────────────────────────────────────────────────

const COMPACT_HYSTERESIS_PX = 8; // Prevents rapid toggling at threshold
const MEGA_MENU_CLOSE_DELAY_MS = 460;

// ── Component ─────────────────────────────────────────────────────────────────

export function NavbarClient({
  logo,
  primaryLinks,
  categories,
  user,
  cartCount,
  labels,
  locale,
  overlayAtTop,
  heroTone,
  compactAfter,
  showCategoryRail,
  className,
}: NavbarClientProps) {
  const pathname = usePathname();
  const megaMenuId = useId();

  // ── State ─────────────────────────────────────────────────────────────────

  const [isAtTop, setIsAtTop] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── Refs ──────────────────────────────────────────────────────────────────

  // Never store compact state in the effect dep array
  const isCompactRef = useRef(false);
  const isAtTopRef = useRef(true);
  const rafIdRef = useRef<number | null>(null);
  const navbarRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const megaMenuHandleRef = useRef<
    import("./mega-menu-client").MegaMenuClientHandle | null
  >(null);

  // Hover intent: cancel timers on route change
  const megaMenuCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // ── Scroll handling ───────────────────────────────────────────────────────

  useEffect(() => {
    function onScroll() {
      if (rafIdRef.current !== null) return; // Already scheduled

      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        const scrollY = window.scrollY;

        const atTop = scrollY < 4;
        if (atTop !== isAtTopRef.current) {
          isAtTopRef.current = atTop;
          setIsAtTop(atTop);
        }

        const shouldBeCompact = isCompactRef.current
          ? scrollY > compactAfter - COMPACT_HYSTERESIS_PX
          : scrollY > compactAfter + COMPACT_HYSTERESIS_PX;

        if (shouldBeCompact !== isCompactRef.current) {
          isCompactRef.current = shouldBeCompact;
          setIsCompact(shouldBeCompact);
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    // Run once to capture initial scroll position
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
    // compactAfter is intentionally the only dep — we use refs for the rest
  }, [compactAfter]);

  // ── Route change cleanup ──────────────────────────────────────────────────

  useEffect(() => {
    // Close everything on navigation
    setMegaMenuOpen(false);
    setActiveCategoryId(null);
    setMobileMenuOpen(false);

    if (megaMenuCloseTimerRef.current) {
      clearTimeout(megaMenuCloseTimerRef.current);
    }
  }, [pathname]);

  // ── Global Escape handling ────────────────────────────────────────────────

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (megaMenuOpen) {
          setMegaMenuOpen(false);
          setActiveCategoryId(null);
          // Return focus to the active trigger
          const trigger = navbarRef.current?.querySelector<HTMLButtonElement>(
            `[data-category-id="${activeCategoryId}"]`,
          );
          trigger?.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [megaMenuOpen, activeCategoryId]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (megaMenuCloseTimerRef.current) {
        clearTimeout(megaMenuCloseTimerRef.current);
      }
    };
  }, []);

  // ── Mega Menu handlers ────────────────────────────────────────────────────

  const handleCategoryActivate = useCallback((id: string) => {
    if (megaMenuCloseTimerRef.current) {
      clearTimeout(megaMenuCloseTimerRef.current);
      megaMenuCloseTimerRef.current = null;
    }
    setActiveCategoryId(id);
    setMegaMenuOpen(true);
  }, []);

  const cancelMegaMenuCloseTimer = useCallback(() => {
    if (megaMenuCloseTimerRef.current) {
      clearTimeout(megaMenuCloseTimerRef.current);
      megaMenuCloseTimerRef.current = null;
    }
  }, []);

  const closeMegaMenuNow = useCallback(() => {
    cancelMegaMenuCloseTimer();
    setMegaMenuOpen(false);
    setActiveCategoryId(null);
  }, [cancelMegaMenuCloseTimer]);

  const scheduleMegaMenuClose = useCallback(() => {
    cancelMegaMenuCloseTimer();

    megaMenuCloseTimerRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
      setActiveCategoryId(null);
      megaMenuCloseTimerRef.current = null;
    }, MEGA_MENU_CLOSE_DELAY_MS);
  }, [cancelMegaMenuCloseTimer]);

  const handleCategoryDeactivate = useCallback(() => {
    closeMegaMenuNow();
  }, [closeMegaMenuNow]);

  const handleMegaMenuEnter = useCallback(() => {
    cancelMegaMenuCloseTimer();
  }, [cancelMegaMenuCloseTimer]);

  const handleMegaMenuLeave = useCallback(() => {
    scheduleMegaMenuClose();
  }, [scheduleMegaMenuClose]);

  const handleMegaMenuClose = useCallback(() => {
    closeMegaMenuNow();
  }, [closeMegaMenuNow]);

  const handleBackdropClick = useCallback(() => {
    closeMegaMenuNow();
  }, [closeMegaMenuNow]);

  // ── Mobile menu handlers ──────────────────────────────────────────────────

  const handleMobileMenuOpen = useCallback(() => {
    setMobileMenuOpen(true);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // ── Derived values ────────────────────────────────────────────────────────

  const isHeroMode = overlayAtTop && isAtTop && !isCompact;

  // Foreground color based on Hero tone vs. compact theme
  const fgBase = isHeroMode
    ? heroTone === "light"
      ? "text-white"
      : "text-[#231F20]"
    : "text-[#231F20] dark:text-[#F8F5F0]";

  // Navbar background
  const bgClass = isHeroMode
    ? "bg-transparent"
    : [
        "bg-[#FCFAF7]/95 dark:bg-[#0B1117]/95",
        "backdrop-blur-[2px]", // Very restrained — only in compact
        "shadow-[0_1px_0_rgba(0,0,0,0.08)] dark:shadow-[0_1px_0_rgba(0,0,0,0.24)]",
      ].join(" ");

  // Primary bar height
  const barHeightClass = isCompact ? "h-[60px]" : "h-[88px] md:h-[96px]";

  // Logo visibility
  const showFullLogo = !isCompact;
  const showCompactLogo = isCompact;

  // Inverse logo: use only when in Hero mode AND inverse assets exist
  const logoFullSrc =
    isHeroMode && logo.inverseFull ? logo.inverseFull : logo.full;
  const logoCompactSrc =
    isHeroMode && logo.inverseCompact ? logo.inverseCompact : logo.compact;

  const safeCartCount = cartCount ?? 0;
  const cartLabel =
    safeCartCount > 99
      ? "99+"
      : safeCartCount > 0
        ? String(safeCartCount)
        : null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <header
        ref={navbarRef}
        dir={locale === "fa" ? "rtl" : "ltr"}
        className={[
          "fixed inset-x-0 top-0 z-50",
          "transition-[background-color,box-shadow] duration-300 ease-out",
          bgClass,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* ── Primary Bar ──────────────────────────────────────────────── */}
        <div
          className={[
            "mx-auto max-w-[1600px]",
            "px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20",
            "flex items-center",
            "relative z-[45]",
            "transition-[height] duration-300 ease-out",
            barHeightClass,
          ].join(" ")}
        >
          {/* ── Start: Primary Nav (desktop) + Mobile Menu (mobile) ──── */}
          <div className="flex items-center flex-1">
            {/* Mobile menu button */}
            <button
              ref={menuButtonRef}
              type="button"
              onClick={handleMobileMenuOpen}
              aria-label={labels.menu}
              aria-expanded={mobileMenuOpen}
              aria-haspopup="dialog"
              className={[
                "lg:hidden",
                "flex items-center justify-center",
                "min-w-[44px] min-h-[44px] -ms-2",
                fgBase,
                "transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-1",
                "focus-visible:ring-[#C15427] focus-visible:ring-offset-2",
                "focus-visible:ring-offset-transparent",
              ].join(" ")}
            >
              <MenuIcon size={22} aria-hidden />
            </button>

            {/* Desktop primary nav */}
            <div className="hidden lg:block">
              <DesktopNavigation
                primaryLinks={primaryLinks}
                categories={[]} // Only top bar — categories rendered in rail below
                activeCategoryId={activeCategoryId}
                megaMenuOpen={megaMenuOpen}
                heroTone={heroTone}
                isCompact={isCompact}
                isAtTop={isAtTop}
                showCategoryRail={false} // Rail is below
                onCategoryActivate={handleCategoryActivate}
                onCategoryDeactivate={handleCategoryDeactivate}
                onMegaMenuEnter={handleMegaMenuEnter}
                onMegaMenuLeave={handleMegaMenuLeave}
                megaMenuId={megaMenuId}
              />
            </div>
          </div>

          {/* ── Center: Logo ──────────────────────────────────────────── */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
            <Link
              href="/"
              aria-label={logo.full.alt}
              className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C15427] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              {/* Full wordmark */}
              <span
                className={[
                  "block transition-[opacity,transform] duration-300 ease-out",
                  showFullLogo
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 absolute pointer-events-none",
                ].join(" ")}
                aria-hidden={!showFullLogo}
              >
                <Image
                  src={logoFullSrc.src}
                  width={logoFullSrc.width}
                  height={logoFullSrc.height}
                  alt={logoFullSrc.alt}
                  priority
                  quality={95}
                  className="h-10 md:h-20 w-auto"
                  draggable={false}
                />
              </span>

              {/* Compact monogram */}
              <span
                className={[
                  "block transition-[opacity,transform] duration-300 ease-out",
                  showCompactLogo
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 absolute pointer-events-none",
                ].join(" ")}
                aria-hidden={!showCompactLogo}
              >
                <Image
                  src={logoCompactSrc.src}
                  width={logoCompactSrc.width}
                  height={logoCompactSrc.height}
                  alt={logoCompactSrc.alt}
                  quality={95}
                  className="h-14 w-auto"
                  draggable={false}
                />
              </span>
            </Link>
          </div>

          {/* ── End: Actions ──────────────────────────────────────────── */}
          <div className="flex items-center gap-1 flex-1 justify-end">
            {/* Theme toggle */}
            <NavbarThemeToggle
              label={labels.theme}
              tone={isHeroMode ? heroTone : "dark"}
              isCompact={isCompact}
            />

            {/* Account / Login */}
            {user ? (
              <Link
                href={user.dashboardHref}
                aria-label={`${labels.account}: ${user.name}`}
                className={[
                  "hidden sm:flex items-center justify-center",
                  "min-w-[44px] min-h-[44px]",
                  fgBase,
                  "transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-1",
                  "focus-visible:ring-[#C15427] focus-visible:ring-offset-2",
                  "focus-visible:ring-offset-transparent",
                  "opacity-80 hover:opacity-100",
                ].join(" ")}
              >
                <AccountIcon size={20} aria-hidden />
              </Link>
            ) : (
              <Link
                href="/auth/login"
                aria-label={labels.login}
                className={[
                  "hidden sm:flex items-center justify-center",
                  "min-w-[44px] min-h-[44px]",
                  fgBase,
                  "transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-1",
                  "focus-visible:ring-[#C15427] focus-visible:ring-offset-2",
                  "focus-visible:ring-offset-transparent",
                  "opacity-80 hover:opacity-100",
                ].join(" ")}
              >
                <AccountIcon size={20} aria-hidden />
              </Link>
            )}

            {/* Cart */}
            <Link
              href="/cart"
              aria-label={`${labels.cart}${safeCartCount > 0 ? `: ${safeCartCount} مورد` : ""}`}
              className={[
                "relative flex items-center justify-center",
                "min-w-[44px] min-h-[44px]",
                fgBase,
                "transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-1",
                "focus-visible:ring-[#C15427] focus-visible:ring-offset-2",
                "focus-visible:ring-offset-transparent",
                "opacity-80 hover:opacity-100",
              ].join(" ")}
            >
              <BagIcon size={20} aria-hidden />
              {cartLabel && (
                <span
                  className={[
                    "absolute top-2 end-1.5",
                    "min-w-[15px] h-[15px] px-0.5",
                    "flex items-center justify-center",
                    "bg-[#231F20] dark:bg-[#F8F5F0]",
                    "text-[#FCFAF7] dark:text-[#0B1117]",
                    "text-[9px] font-mono tabular-nums leading-none",
                    // When in Hero light tone, invert badge
                    isHeroMode && heroTone === "light"
                      ? "bg-white text-[#231F20]"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-hidden="true"
                >
                  {cartLabel}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* ── Category Rail ────────────────────────────────────────────── */}
        {showCategoryRail && categories.length > 0 && (
          <div
            className={[
              "hidden lg:block",
              "relative z-[45]",
              "mx-auto max-w-[1600px]",
              "px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20",
            ].join(" ")}
          >
            <DesktopNavigation
              primaryLinks={[]} // Empty — only rendering category rail here
              categories={categories}
              activeCategoryId={activeCategoryId}
              megaMenuOpen={megaMenuOpen}
              heroTone={heroTone}
              isCompact={isCompact}
              isAtTop={isAtTop}
              showCategoryRail={true}
              onCategoryActivate={handleCategoryActivate}
              onCategoryDeactivate={handleCategoryDeactivate}
              onMegaMenuEnter={handleMegaMenuEnter}
              onMegaMenuLeave={handleMegaMenuLeave}
              megaMenuId={megaMenuId}
            />
          </div>
        )}

        {/* ── Mega Menu ─────────────────────────────────────────────────── */}
        {categories.length > 0 && (
          <MegaMenuClient
            ref={megaMenuHandleRef}
            categories={categories}
            activeCategoryId={activeCategoryId}
            isOpen={megaMenuOpen}
            onClose={handleMegaMenuClose}
            onBackdropClick={handleBackdropClick}
            onPointerEnter={handleMegaMenuEnter}
            onPointerLeave={handleMegaMenuLeave}
            menuId={megaMenuId}
          />
        )}
      </header>

      {/* ── Mobile Wardrobe Menu ─────────────────────────────────────────── */}
      <MobileWardrobeMenu
        isOpen={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        primaryLinks={primaryLinks}
        categories={categories}
        user={user}
        cartCount={safeCartCount}
        labels={labels}
        menuButtonRef={menuButtonRef}
      />
    </>
  );
}
