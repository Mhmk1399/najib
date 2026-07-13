"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Atelier Gate Navbar — Editorial Mega Menu (Client Component)
//
// Signature behaviors:
// - GSAP loaded dynamically only on first open
// - Two-layer image crossfade (no white flash)
// - Taxonomy stagger entrance
// - Category copper indicator
// - CSS fallback when GSAP fails or prefers-reduced-motion
// - Proper cleanup on unmount and route change
// ─────────────────────────────────────────────────────────────────────────────

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import Image from "next/image";
import Link from "next/link";
import type { NavbarCategory } from "./navbar.types";
import { ArrowIcon } from "./navbar-icons";
import { loadNavbarGsap } from "./navbar-gsap";
import {
  HOME_EYEBROW_MUTED_CLASS,
  HOME_EYEBROW_LINE_CLASS,
  HOME_EYEBROW_ROW_CLASS,
} from "@/components/static/home/home-section-classes";

// ── Types ─────────────────────────────────────────────────────────────────────

type MegaMenuClientProps = {
  categories: readonly NavbarCategory[];
  activeCategoryId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onBackdropClick: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  menuId: string;
};

export type MegaMenuClientHandle = {
  focusFirstLink: () => void;
};

// ── Image Layer Component ─────────────────────────────────────────────────────
// Two layers enable crossfade without a white flash

type ImageLayerProps = {
  category: NavbarCategory;
  layerRef: React.RefObject<HTMLDivElement | null>;
};

function ImageLayer({ category, layerRef }: ImageLayerProps) {
  return (
    <div
      ref={layerRef}
      className="absolute inset-0 will-change-transform"
      aria-hidden="true"
    >
      {category.image?.src ? (
        <Image
          src={category.image.src}
          alt={category.image.alt}
          fill
          sizes="(max-width: 1279px) 42vw, 34vw"
          quality={82}
          loading="lazy"
          draggable={false}
          className="object-cover object-center"
        />
      ) : (
        // Calm placeholder surface — no broken-image icon
        <div className="absolute inset-0 bg-[#F8F3EB] dark:bg-[#171F27]" />
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export const MegaMenuClient = forwardRef<
  MegaMenuClientHandle,
  MegaMenuClientProps
>(function MegaMenuClient(
  {
    categories,
    activeCategoryId,
    isOpen,
    onClose,
    onBackdropClick,
    onPointerEnter,
    onPointerLeave,
    menuId,
  },
  ref,
) {
  // ── Refs ──────────────────────────────────────────────────────────────────

  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const groupsRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const layerARef = useRef<HTMLDivElement>(null);
  const layerBRef = useRef<HTMLDivElement>(null);

  // GSAP context and timeline refs — never stored in React state
  const gsapCtxRef = useRef<
    ReturnType<(typeof import("gsap"))["default"]["context"]> | null
  >(null);
  const activeTimelineRef = useRef<
    ReturnType<(typeof import("gsap"))["default"]["timeline"]> | null
  >(null);
  const gsapRef = useRef<(typeof import("gsap"))["default"] | null>(null);
  const gsapLoadedRef = useRef(false);
  const hasOpenedRef = useRef(false);

  // Track which layer is "A" (front) and "B" (back)
  const frontLayerRef = useRef<"A" | "B">("A");

  // Track displayed categories in layers
  const layerACategory = useRef<NavbarCategory | null>(null);
  const layerBCategory = useRef<NavbarCategory | null>(null);

  // Previous open state for enter/exit detection
  const wasOpenRef = useRef(false);

  // Reduced-motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // ── Exposed handle ────────────────────────────────────────────────────────

  useImperativeHandle(ref, () => ({
    focusFirstLink: () => {
      const firstLink =
        panelRef.current?.querySelector<HTMLAnchorElement>("a[href]");
      firstLink?.focus();
    },
  }));

  // ── Reduced motion detection ──────────────────────────────────────────────

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);

    function handleChange(e: MediaQueryListEvent) {
      setPrefersReducedMotion(e.matches);
    }

    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  // ── GSAP loader ───────────────────────────────────────────────────────────

  const ensureGsap = useCallback(async (): Promise<
    (typeof import("gsap"))["default"] | null
  > => {
    if (prefersReducedMotion) return null;
    if (gsapRef.current) return gsapRef.current;

    try {
      const gsap = await loadNavbarGsap();
      gsapRef.current = gsap;
      gsapLoadedRef.current = true;
      return gsap;
    } catch {
      return null;
    }
  }, [prefersReducedMotion]);

  // ── CSS fallback helpers ──────────────────────────────────────────────────

  const showPanelCSS = useCallback(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    panel.style.opacity = "1";
    panel.style.transform = "translateY(0)";
    panel.style.visibility = "visible";
    backdrop.style.opacity = "1";
    backdrop.style.visibility = "visible";
  }, []);

  const hidePanelCSS = useCallback(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    panel.style.opacity = "0";
    panel.style.transform = "translateY(-8px)";
    panel.style.visibility = "hidden";
    backdrop.style.opacity = "0";
    backdrop.style.visibility = "hidden";
  }, []);

  // ── GSAP open animation ───────────────────────────────────────────────────

  const animateOpen = useCallback(
    async (gsap: (typeof import("gsap"))["default"]) => {
      const panel = panelRef.current;
      const backdrop = backdropRef.current;
      const intro = introRef.current;
      const groups = groupsRef.current;
      const featured = featuredRef.current;

      if (!panel || !backdrop) return;

      // Kill previous timeline
      if (activeTimelineRef.current) {
        activeTimelineRef.current.kill();
      }

      // Create fresh GSAP context
      if (gsapCtxRef.current) {
        gsapCtxRef.current.revert();
      }

      gsapCtxRef.current = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
        });

        activeTimelineRef.current = tl;

        // Set initial state
        gsap.set(panel, {
          opacity: 0,
          y: -18,
          visibility: "visible",
        });
        gsap.set(backdrop, { opacity: 0, visibility: "visible" });

        const groupEls = groups ? Array.from(groups.children) : [];
        const introEls = intro ? [intro] : [];
        const featuredEl = featured ? [featured] : [];

        // Stagger targets
        const textEls = [...introEls, ...groupEls, ...featuredEl].filter(
          Boolean,
        );

        if (textEls.length > 0) {
          gsap.set(textEls, { opacity: 0, y: 12 });
        }

        // Timeline
        tl.to(backdrop, { opacity: 1, duration: 0.28, ease: "power2.out" }).to(
          panel,
          { opacity: 1, y: 0, duration: 0.42, ease: "power3.out" },
          "<0.04",
        );

        if (textEls.length > 0) {
          tl.to(
            textEls,
            {
              opacity: 1,
              y: 0,
              duration: 0.36,
              stagger: 0.045,
              ease: "power2.out",
            },
            "-=0.22",
          );
        }
      }, panel);
    },
    [],
  );

  // ── GSAP close animation ──────────────────────────────────────────────────

  const animateClose = useCallback(
    async (gsap: (typeof import("gsap"))["default"]) => {
      const panel = panelRef.current;
      const backdrop = backdropRef.current;

      if (!panel || !backdrop) return;

      if (activeTimelineRef.current) {
        activeTimelineRef.current.kill();
      }

      const tl = gsap.timeline({
        onComplete: () => {
          if (panel) panel.style.visibility = "hidden";
          if (backdrop) backdrop.style.visibility = "hidden";
        },
      });

      activeTimelineRef.current = tl;

      tl.to(panel, {
        opacity: 0,
        y: -10,
        duration: 0.22,
        ease: "power2.in",
      }).to(backdrop, { opacity: 0, duration: 0.2, ease: "power2.in" }, "<");
    },
    [],
  );

  // ── Image layer crossfade ─────────────────────────────────────────────────

  const crossfadeToCategory = useCallback(
    async (
      category: NavbarCategory,
      gsap: (typeof import("gsap"))["default"] | null,
    ) => {
      const front = frontLayerRef.current;
      const frontEl = front === "A" ? layerARef.current : layerBRef.current;
      const backEl = front === "A" ? layerBRef.current : layerARef.current;

      if (!frontEl || !backEl) return;

      // Update back layer with new category
      if (front === "A") {
        layerBCategory.current = category;
      } else {
        layerACategory.current = category;
      }

      if (!gsap || prefersReducedMotion) {
        // Instant switch
        gsap?.set(frontEl, { opacity: 0, y: 0 });
        gsap?.set(backEl, { opacity: 1, y: 0, scale: 1 });
        frontLayerRef.current = front === "A" ? "B" : "A";
        return;
      }

      // Crossfade
      gsap.set(backEl, { opacity: 0, y: 10, scale: 1.035 });

      const tl = gsap.timeline();
      tl.to(frontEl, {
        opacity: 0,
        y: -8,
        duration: 0.28,
        ease: "power2.in",
      }).to(
        backEl,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          ease: "power3.out",
        },
        "-=0.14",
      );

      frontLayerRef.current = front === "A" ? "B" : "A";
    },
    [prefersReducedMotion],
  );

  // ── Open/close state machine ──────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function handleOpenChange() {
      if (isOpen && !wasOpenRef.current) {
        // Opening
        wasOpenRef.current = true;
        hasOpenedRef.current = true;

        if (prefersReducedMotion) {
          showPanelCSS();
          return;
        }

        const gsap = await ensureGsap();
        if (cancelled) return;

        if (!gsap) {
          showPanelCSS();
          return;
        }

        await animateOpen(gsap);
      } else if (!isOpen && wasOpenRef.current) {
        // Closing
        wasOpenRef.current = false;

        if (prefersReducedMotion) {
          hidePanelCSS();
          return;
        }

        const gsap = await ensureGsap();
        if (cancelled) return;

        if (!gsap) {
          hidePanelCSS();
          return;
        }

        await animateClose(gsap);
      }
    }

    void handleOpenChange();
    return () => {
      cancelled = true;
    };
  }, [
    isOpen,
    prefersReducedMotion,
    ensureGsap,
    animateOpen,
    animateClose,
    showPanelCSS,
    hidePanelCSS,
  ]);

  // ── Active category change (image crossfade + text stagger) ───────────────

  const prevActiveCategoryIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen || !activeCategoryId) return;
    if (activeCategoryId === prevActiveCategoryIdRef.current) return;

    prevActiveCategoryIdRef.current = activeCategoryId;

    const category = categories.find((c) => c.id === activeCategoryId);
    if (!category) return;

    // Initialize layers on first display
    if (!layerACategory.current && !layerBCategory.current) {
      layerACategory.current = category;
      frontLayerRef.current = "A";
      return;
    }

    let cancelled = false;

    async function handleCategoryChange() {
      if (!category) return;
      const gsap = gsapRef.current; // sync — no new load
      if (cancelled) return;
      await crossfadeToCategory(category, gsap);

      // Stagger text groups
      if (gsap && groupsRef.current && !prefersReducedMotion) {
        const groupEls = Array.from(groupsRef.current.children);
        if (groupEls.length > 0) {
          gsap.fromTo(
            groupEls,
            { opacity: 0, y: 10 },
            {
              opacity: 1,
              y: 0,
              duration: 0.3,
              stagger: 0.04,
              ease: "power2.out",
            },
          );
        }
      }
    }

    void handleCategoryChange();
    return () => {
      cancelled = true;
    };
  }, [
    activeCategoryId,
    isOpen,
    categories,
    crossfadeToCategory,
    prefersReducedMotion,
  ]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (activeTimelineRef.current) {
        activeTimelineRef.current.kill();
      }
      if (gsapCtxRef.current) {
        gsapCtxRef.current.revert();
      }
    };
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  const activeCategory =
    categories.find((c) => c.id === activeCategoryId) ?? categories[0];

  const categoryIndex = activeCategoryId
    ? categories.findIndex((c) => c.id === activeCategoryId)
    : 0;

  const displayIndex = String(categoryIndex + 1).padStart(2, "0");
  const groupCount = activeCategory?.groups?.length ?? 0;
  const groupGridClass =
    groupCount <= 1
      ? "grid-cols-1"
      : groupCount === 2
        ? "grid-cols-2"
        : "grid-cols-2 xl:grid-cols-3";

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────────────────── */}
      <div
        ref={backdropRef}
        onClick={onBackdropClick}
        className={[
          "fixed inset-0 z-[35]",
          "bg-[#231F20]/24 backdrop-blur-[2px]",
          "invisible opacity-0",
          "transition-none", // GSAP controls transitions
        ].join(" ")}
        aria-hidden="true"
      />

      {/* ── Panel ────────────────────────────────────────────────────────── */}
      <div
        ref={panelRef}
        id={menuId}
        role="region"
        aria-label={activeCategory?.label ?? "منوی دسته‌بندی"}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        className={[
          "absolute top-full inset-x-0 z-[40]",
          "bg-[#FAF7F1]/98 dark:bg-[#10161D]/98",
          "border-y border-[#D9CEC2]/70 dark:border-[#303943]/70",
          "shadow-[0_18px_70px_rgba(35,31,32,0.12)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.42)]",
          "backdrop-blur-xl",
          "overflow-hidden",
          "invisible opacity-0",
          "min-h-[360px] max-h-[min(540px,calc(100vh-96px))]",
          "will-change-transform",
        ].join(" ")}
      >
        <div
          className={[
            "mx-auto h-full",
            "max-w-[1480px]",
            "px-5 sm:px-8 lg:px-12 xl:px-14",
            "py-6",
            "grid grid-cols-12 gap-7 xl:gap-10",
          ].join(" ")}
        >
          {/* ── Image Preview — 5 cols ───────────────────────────────────── */}
          <div className="col-span-4 relative">
            <div
              ref={imageContainerRef}
              className={[
                "relative h-full min-h-[312px] max-h-[420px]",
                "overflow-hidden",
                "border border-[#D8CABC]/80 dark:border-[#313B45]",
                "bg-[#EFE7DC] dark:bg-[#151D25]",
              ].join(" ")}
            >
              {/* Layer A */}
              <div ref={layerARef} className="absolute inset-0">
                {layerACategory.current ? (
                  <ImageLayer
                    category={layerACategory.current}
                    layerRef={layerARef}
                  />
                ) : activeCategory ? (
                  <ImageLayer category={activeCategory} layerRef={layerARef} />
                ) : null}
              </div>

              {/* Layer B */}
              <div
                ref={layerBRef}
                className="absolute inset-0 opacity-0"
                aria-hidden="true"
              >
                {layerBCategory.current && (
                  <ImageLayer
                    category={layerBCategory.current}
                    layerRef={layerBRef}
                  />
                )}
              </div>

              {/* Subtle image overlay — restraint, not aggression */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#231F20]/36 via-[#231F20]/4 to-transparent pointer-events-none" />

              <div
                ref={featuredRef}
                className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4"
              >
                <span
                  className="font-mono text-[11px] tracking-[0.18em] text-[#F8F3EB]/90"
                  aria-hidden="true"
                >
                  {displayIndex}
                </span>
                {activeCategory?.featuredAction && (
                  <Link
                    href={activeCategory.featuredAction.href}
                    onClick={onClose}
                    prefetch={false}
                    className={[
                      "group inline-flex items-center gap-2",
                      "text-[11px] tracking-[0.14em]",
                      "text-[#F8F3EB]",
                      "border-b border-[#D4774D]/70 pb-1",
                      "transition-colors duration-200 hover:border-[#F8F3EB]",
                      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4774D]",
                    ].join(" ")}
                  >
                    <span>{activeCategory.featuredAction.label}</span>
                    <ArrowIcon
                      size={13}
                      className="rtl:rotate-180 text-[#D4774D] transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                      aria-hidden
                    />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* ── Right Content ─────────────────────────────────────────────── */}
          <div className="col-span-8 grid grid-cols-8 gap-7 xl:gap-10">
            {/* ── Introduction + Action — 2 cols ───────────────────────── */}
            <div
              ref={introRef}
              className={[
                "col-span-3 min-w-0",
                "py-2 pr-7 rtl:pr-0 rtl:pl-7",
                "border-r rtl:border-r-0 rtl:border-l",
                "border-[#D8CABC]/70 dark:border-[#303943]/80",
                "flex flex-col justify-center",
              ].join(" ")}
            >
              <div>
                {activeCategory?.eyebrow && (
                  <div className={`${HOME_EYEBROW_ROW_CLASS} mb-4`}>
                    <span className={HOME_EYEBROW_MUTED_CLASS}>
                      {activeCategory.eyebrow}
                    </span>
                    <span aria-hidden="true" className={HOME_EYEBROW_LINE_CLASS} />
                  </div>
                )}

                <h2 className="text-[28px] xl:text-[32px] leading-[1.12] font-light text-[#231F20] dark:text-[#F8F5F0] mb-5">
                  {activeCategory?.label}
                </h2>

                {activeCategory?.description && (
                  <p className="max-w-[30ch] text-[13px] xl:text-[14px] leading-[1.9] text-[#6C6662] dark:text-[#B8B2AC]">
                    {activeCategory.description}
                  </p>
                )}
              </div>
            </div>

            {/* ── Taxonomy Groups — remaining cols ─────────────────────── */}
            <div
              ref={groupsRef}
              className={[
                "col-span-5 min-w-0",
                "py-2",
                "grid gap-x-5 xl:gap-x-6 gap-y-6",
                groupGridClass,
              ].join(" ")}
            >
              {activeCategory?.groups && activeCategory.groups.length > 0 ? (
                activeCategory.groups.map((group) => (
                  <div key={group.id} className="flex min-w-0 flex-col">
                    <h3
                      className={[
                        "mb-3 flex items-center gap-3",
                        "text-[10px] tracking-[0.18em] uppercase",
                        "text-[#A94420] dark:text-[#E18A68]",
                      ].join(" ")}
                    >
                      <span
                        aria-hidden="true"
                        className="h-px w-8 bg-[#A94420] dark:bg-[#E18A68]"
                      />
                      {group.title}
                    </h3>

                    <ul
                      className="border-t border-[#D8CABC]/70 dark:border-[#303943]/80"
                      role="list"
                    >
                      {group.links.map((link) => (
                        <li key={link.id}>
                          <Link
                            href={link.href}
                            onClick={onClose}
                            prefetch={false}
                            className={[
                              "group flex min-h-[42px] items-center justify-between gap-3",
                              "border-b border-[#D8CABC]/55 dark:border-[#303943]/65",
                              "py-2.5",
                              "text-[13px] xl:text-[14px] font-light",
                              "text-[#231F20] dark:text-[#F8F5F0]",
                              "transition-[color,padding,background-color] duration-200",
                              "hover:bg-[#EFE6DA]/55 dark:hover:bg-[#1A232D]/70",
                              "hover:px-3",
                              "focus-visible:outline-none focus-visible:ring-1",
                              "focus-visible:ring-[#C15427] focus-visible:ring-offset-1",
                            ].join(" ")}
                          >
                            <span className="min-w-0 truncate">
                              {link.label}
                            </span>
                            <ArrowIcon
                              size={12}
                              className="shrink-0 rtl:rotate-180 text-[#A94420] opacity-0 transition-[opacity,transform] duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                              aria-hidden
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                // Empty groups — render view-all only
                <div className="flex items-center border-t border-[#D8CABC]/70 pt-4 dark:border-[#303943]/80">
                  {activeCategory?.featuredAction && (
                    <Link
                      href={activeCategory.featuredAction.href}
                      onClick={onClose}
                      prefetch={false}
                      className={[
                        "group inline-flex items-center gap-2",
                        "text-[13px] text-[#231F20] dark:text-[#F8F5F0]",
                        "transition-colors duration-200 hover:text-[#A94420] dark:hover:text-[#E18A68]",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C15427]",
                      ].join(" ")}
                    >
                      <span>{activeCategory.featuredAction.label}</span>
                      <ArrowIcon
                        size={13}
                        className="rtl:rotate-180 text-[#A94420] transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                        aria-hidden
                      />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Thin copper divider at the bottom */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#A94420]/45 to-transparent" />
      </div>
    </>
  );
});

MegaMenuClient.displayName = "MegaMenuClient";
