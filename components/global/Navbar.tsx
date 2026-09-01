"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { fontTokens, themeClasses } from "@/theme/theme-colors";

/* ==========================================================================
   TYPES
============================================================================ */

type QuickLink = {
  label: string;
  href: string;
  icon: ReactNode;
};

type MenuItem = {
  label: string;
  href: string;
  badge?: string;
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

type MenuSection = {
  id: string;

  title: string;

  subtitle: string;

  href: string;

  groups: MenuGroup[];

  image: string;

  imageLabel: string;
};

type LenisScrollController = {
  start: () => void;
  stop: () => void;
  resize?: () => void;
  scrollTo: (
    target: number,
    options?: {
      force?: boolean;
      immediate?: boolean;
      lock?: boolean;
    },
  ) => void;
};

type LenisAwareWindow = Window & {
  __lenis?: unknown;
  lenis?: unknown;
};

function isLenisScrollController(
  candidate: unknown,
): candidate is LenisScrollController {
  if (!candidate || typeof candidate !== "object") {
    return false;
  }

  const controller = candidate as Partial<LenisScrollController>;

  return (
    typeof controller.stop === "function" &&
    typeof controller.start === "function" &&
    typeof controller.scrollTo === "function"
  );
}

function getLenisController(): LenisScrollController | null {
  const lenisWindow = window as unknown as LenisAwareWindow;

  if (isLenisScrollController(lenisWindow.__lenis)) {
    return lenisWindow.__lenis;
  }

  if (isLenisScrollController(lenisWindow.lenis)) {
    return lenisWindow.lenis;
  }

  return null;
}

function getClampedScrollY(scrollY: number) {
  const maxScrollY = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );

  return Math.min(scrollY, maxScrollY);
}

/* ==========================================================================
   QUICK LINKS
============================================================================ */

const QUICK_LINKS: QuickLink[] = [
  {
    label: "Journal",
    href: "/journal",
    icon: <JournalIcon />,
  },

  {
    label: "Our Story",
    href: "/our-story",
    icon: <StoryIcon />,
  },

  {
    label: "About",
    href: "/about",
    icon: <AboutIcon />,
  },

  {
    label: "Contact",
    href: "/contact",
    icon: <ContactIcon />,
  },

  {
    label: "Shop",
    href: "/shop",
    icon: <ShopIcon />,
  },

  {
    label: "Profile",
    href: "/profile",
    icon: <ProfileIcon />,
  },
];

/* ==========================================================================
   MENU DATA
============================================================================ */

const MENU: MenuSection[] = [
  {
    id: "new",

    title: "New & Featured",

    subtitle: "Discover the latest expressions of Najibzadeh.",

    href: "/new",

    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1400&q=72",

    imageLabel: "The New Season",

    groups: [
      {
        title: "New",

        items: [
          {
            label: "New Arrivals",
            href: "/new-arrivals",
            badge: "New",
          },

          {
            label: "Latest Collection",
            href: "/collections/latest",
          },

          {
            label: "Best Sellers",
            href: "/best-sellers",
          },

          {
            label: "Najibzadeh Icons",
            href: "/icons",
          },
        ],
      },

      {
        title: "Curated",

        items: [
          {
            label: "The Evening Edit",
            href: "/edits/evening",
          },

          {
            label: "Business Wardrobe",
            href: "/edits/business",
          },

          {
            label: "Weekend Selection",
            href: "/edits/weekend",
          },

          {
            label: "Travel Essentials",
            href: "/edits/travel",
          },
        ],
      },

      {
        title: "Discover",

        items: [
          {
            label: "The Journal",
            href: "/journal",
          },

          {
            label: "Campaigns",
            href: "/campaigns",
          },

          {
            label: "Lookbook",
            href: "/lookbook",
          },

          {
            label: "Our World",
            href: "/world",
          },
        ],
      },
    ],
  },

  {
    id: "clothing",

    title: "Clothing",

    subtitle:
      "Modern tailoring and refined essentials designed for everyday presence.",

    href: "/clothing",

    image: "https://unsplash.com/photos/f61236AEprY/download?force=true&w=1400",

    imageLabel: "Modern Tailoring",

    groups: [
      {
        title: "Tailoring",

        items: [
          {
            label: "Suits",
            href: "/clothing/suits",
          },

          {
            label: "Blazers",
            href: "/clothing/blazers",
          },

          {
            label: "Tuxedos",
            href: "/clothing/tuxedos",
          },

          {
            label: "Waistcoats",
            href: "/clothing/waistcoats",
          },
        ],
      },

      {
        title: "Essentials",

        items: [
          {
            label: "Shirts",
            href: "/clothing/shirts",
          },

          {
            label: "Polos",
            href: "/clothing/polos",
          },

          {
            label: "T-Shirts",
            href: "/clothing/t-shirts",
          },

          {
            label: "Knitwear",
            href: "/clothing/knitwear",
          },
        ],
      },

      {
        title: "Bottoms",

        items: [
          {
            label: "Trousers",
            href: "/clothing/trousers",
          },

          {
            label: "Denim",
            href: "/clothing/denim",
          },

          {
            label: "Chinos",
            href: "/clothing/chinos",
          },

          {
            label: "Shorts",
            href: "/clothing/shorts",
          },
        ],
      },

      {
        title: "Outerwear",

        items: [
          {
            label: "Coats",
            href: "/clothing/coats",
          },

          {
            label: "Jackets",
            href: "/clothing/jackets",
          },

          {
            label: "Leather",
            href: "/clothing/leather",
          },

          {
            label: "Overshirts",
            href: "/clothing/overshirts",
          },
        ],
      },
    ],
  },

  {
    id: "fragrance",

    title: "Fragrance",

    subtitle: "Signature scents created to leave a lasting impression.",

    href: "/fragrance",

    image:
      "https://images.unsplash.com/photo-1774682060992-46c7e9f2e50b?auto=format&fit=crop&w=1400&q=72",

    imageLabel: "Noir Absolu",

    groups: [
      {
        title: "Fragrances",

        items: [
          {
            label: "All Fragrances",
            href: "/fragrance",
          },

          {
            label: "Extrait de Parfum",
            href: "/fragrance/extrait",
          },

          {
            label: "Eau de Parfum",
            href: "/fragrance/eau-de-parfum",
          },

          {
            label: "Discovery Sets",
            href: "/fragrance/discovery",
          },
        ],
      },

      {
        title: "By Character",

        items: [
          {
            label: "Woody",
            href: "/fragrance/woody",
          },

          {
            label: "Leather",
            href: "/fragrance/leather",
          },

          {
            label: "Amber",
            href: "/fragrance/amber",
          },

          {
            label: "Fresh",
            href: "/fragrance/fresh",
          },
        ],
      },

      {
        title: "Signatures",

        items: [
          {
            label: "Noir Absolu",
            href: "/fragrance/noir-absolu",
          },

          {
            label: "Vetiver Éclat",
            href: "/fragrance/vetiver-eclat",
          },

          {
            label: "Santal Royal",
            href: "/fragrance/santal-royal",
          },

          {
            label: "Oud Essence",
            href: "/fragrance/oud-essence",
          },
        ],
      },
    ],
  },

  {
    id: "accessories",

    title: "Accessories",

    subtitle: "Considered details that complete the Najibzadeh wardrobe.",

    href: "/accessories",

    image: "https://unsplash.com/photos/YuqBcL1pKAg/download?force=true&w=1400",

    imageLabel: "Objects of Character",

    groups: [
      {
        title: "Leather Goods",

        items: [
          {
            label: "Bags",
            href: "/accessories/bags",
          },

          {
            label: "Briefcases",
            href: "/accessories/briefcases",
          },

          {
            label: "Wallets",
            href: "/accessories/wallets",
          },

          {
            label: "Belts",
            href: "/accessories/belts",
          },
        ],
      },

      {
        title: "Footwear",

        items: [
          {
            label: "Loafers",
            href: "/footwear/loafers",
          },

          {
            label: "Oxfords",
            href: "/footwear/oxfords",
          },

          {
            label: "Sneakers",
            href: "/footwear/sneakers",
          },

          {
            label: "Boots",
            href: "/footwear/boots",
          },
        ],
      },

      {
        title: "Details",

        items: [
          {
            label: "Eyewear",
            href: "/accessories/eyewear",
          },

          {
            label: "Ties",
            href: "/accessories/ties",
          },

          {
            label: "Pocket Squares",
            href: "/accessories/pocket-squares",
          },

          {
            label: "Watches",
            href: "/accessories/watches",
          },
        ],
      },
    ],
  },

  {
    id: "house",

    title: "The House",

    subtitle: "Craftsmanship, heritage and the world behind Najibzadeh.",

    href: "/house",

    image: "https://unsplash.com/photos/bhRcP1KqS0g/download?force=true&w=1400",

    imageLabel: "Inside the Atelier",

    groups: [
      {
        title: "The Atelier",

        items: [
          {
            label: "Craftsmanship",
            href: "/craftsmanship",
          },

          {
            label: "Materials",
            href: "/materials",
          },

          {
            label: "Private Appointment",
            href: "/appointments",
          },
        ],
      },

      {
        title: "The House",

        items: [
          {
            label: "Our Story",
            href: "/our-story",
          },

          {
            label: "Heritage",
            href: "/heritage",
          },

          {
            label: "The Journal",
            href: "/journal",
          },

          {
            label: "Stores",
            href: "/stores",
          },
        ],
      },
    ],
  },
];

/* ==========================================================================
   BREADCRUMB LABELS
============================================================================ */

const BREADCRUMB_LABELS: Record<string, string> = {
  new: "New",

  "new-arrivals": "New Arrivals",

  collections: "Collections",

  latest: "Latest Collection",

  clothing: "Clothing",

  suits: "Suits",

  blazers: "Blazers",

  tuxedos: "Tuxedos",

  waistcoats: "Waistcoats",

  shirts: "Shirts",

  polos: "Polos",

  "t-shirts": "T-Shirts",

  knitwear: "Knitwear",

  trousers: "Trousers",

  denim: "Denim",

  chinos: "Chinos",

  shorts: "Shorts",

  coats: "Coats",

  jackets: "Jackets",

  leather: "Leather",

  overshirts: "Overshirts",

  fragrance: "Fragrance",

  extrait: "Extrait de Parfum",

  "eau-de-parfum": "Eau de Parfum",

  discovery: "Discovery Sets",

  woody: "Woody",

  amber: "Amber",

  fresh: "Fresh",

  "noir-absolu": "Noir Absolu",

  "vetiver-eclat": "Vetiver Éclat",

  "santal-royal": "Santal Royal",

  "oud-essence": "Oud Essence",

  accessories: "Accessories",

  bags: "Bags",

  briefcases: "Briefcases",

  wallets: "Wallets",

  belts: "Belts",

  footwear: "Footwear",

  loafers: "Loafers",

  oxfords: "Oxfords",

  sneakers: "Sneakers",

  boots: "Boots",

  eyewear: "Eyewear",

  ties: "Ties",

  "pocket-squares": "Pocket Squares",

  watches: "Watches",

  house: "The House",

  craftsmanship: "Craftsmanship",

  materials: "Materials",

  appointments: "Private Appointment",

  "our-story": "Our Story",

  heritage: "Heritage",

  journal: "Journal",

  stores: "Stores",
};

/* ==========================================================================
   CONFIG
============================================================================ */

const MENU_ANIMATION_MS = 220;

const NAVBAR_GLASS_CLASSES = [
  "bg-white/[0.72]",
  "backdrop-blur-2xl",
  "backdrop-saturate-150",
  "shadow-[0_12px_42px_rgba(11,11,11,0.08)]",
  "dark:bg-[#0B0B0B]/70",
  "dark:shadow-[0_12px_42px_rgba(0,0,0,0.28)]",
].join(" ");

const NAVBAR_OVERLAY_CHROME_CLASSES = [
  "text-white",
  "drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]",
  "focus-visible:outline-none",
  "focus-visible:ring-1",
  "focus-visible:ring-white",
].join(" ");

const NAVBAR_SURFACE_CHROME_CLASSES = [
  themeClasses.textPrimary,
  themeClasses.focusRing,
].join(" ");

/* ==========================================================================
   UTILS
============================================================================ */

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/* ==========================================================================
   NAVBAR
============================================================================ */

export default function Navbar({
  overlayTone = "light",
}: {
  /**
   * فقط برای Breadcrumb استفاده می‌شود.
   *
   * خود Navbar همیشه:
   * transparent + white over hero, glass/readable after scroll
   */
  overlayTone?: "light" | "dark";
}) {
  const pathname = usePathname();

  /* ------------------------------------------------------------------------
     STATES
  ------------------------------------------------------------------------- */

  const [open, setOpen] = useState(false);

  const [menuMounted, setMenuMounted] = useState(false);

  const [menuVisible, setMenuVisible] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  const [activeId, setActiveId] = useState(MENU[0].id);

  const [mobileOpen, setMobileOpen] = useState<string | null>(null);

  const [hoveredSubcategory, setHoveredSubcategory] = useState<string | null>(
    null,
  );

  /* ------------------------------------------------------------------------
     REFS
  ------------------------------------------------------------------------- */

  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const savedScrollPosition = useRef(0);

  /* ------------------------------------------------------------------------
     ACTIVE
  ------------------------------------------------------------------------- */

  const active = useMemo(
    () => MENU.find((section) => section.id === activeId) ?? MENU[0],

    [activeId],
  );

  /* ------------------------------------------------------------------------
     BREADCRUMBS
  ------------------------------------------------------------------------- */

  const breadcrumbs = useMemo(() => {
    if (!pathname || pathname === "/") {
      return [];
    }

    const segments = pathname.split("/").filter(Boolean);

    return segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");

      const generatedLabel = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      return {
        href,

        label: BREADCRUMB_LABELS[segment] ?? generatedLabel,
      };
    });
  }, [pathname]);

  /* ------------------------------------------------------------------------
     SHOW MENU
  ------------------------------------------------------------------------- */

  const showMenu = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);

      closeTimerRef.current = null;
    }

    setMenuMounted(true);

    setOpen(true);

    setMobileOpen(null);

    setHoveredSubcategory(null);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setMenuVisible(true);
      });
    });
  }, []);

  /* ------------------------------------------------------------------------
     HIDE MENU
  ------------------------------------------------------------------------- */

  const hideMenu = useCallback(() => {
    setOpen(false);

    setMenuVisible(false);

    setMobileOpen(null);

    setHoveredSubcategory(null);

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const delay = reduceMotion ? 0 : MENU_ANIMATION_MS;

    closeTimerRef.current = setTimeout(() => {
      setMenuMounted(false);

      menuButtonRef.current?.focus();
    }, delay);
  }, []);

  function toggleMenu() {
    if (open) {
      hideMenu();
      return;
    }

    showMenu();
  }

  /* ------------------------------------------------------------------------
     TIMER CLEANUP
  ------------------------------------------------------------------------- */

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  /* ------------------------------------------------------------------------
     SCROLL READABILITY
  ------------------------------------------------------------------------- */

  useEffect(() => {
    let frame: number | null = null;

    const updateScrolled = () => {
      frame = null;

      const next = window.scrollY > 18;

      setScrolled((current) => (current === next ? current : next));
    };

    const handleScroll = () => {
      if (frame !== null) {
        return;
      }

      frame = requestAnimationFrame(updateScrolled);
    };

    frame = requestAnimationFrame(updateScrolled);

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);

      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  /* ------------------------------------------------------------------------
     BODY LOCK
  ------------------------------------------------------------------------- */

  useEffect(() => {
    if (!menuMounted) {
      return;
    }

    const body = document.body;

    const html = document.documentElement;

    const scrollY = window.scrollY;

    const lenis = getLenisController();

    const lockPathname = window.location.pathname;

    savedScrollPosition.current = scrollY;

    lenis?.stop();

    const previous = {
      bodyPosition: body.style.position,

      bodyTop: body.style.top,

      bodyLeft: body.style.left,

      bodyRight: body.style.right,

      bodyWidth: body.style.width,

      bodyOverflow: body.style.overflow,

      htmlOverflow: html.style.overflow,

      htmlScrollBehavior: html.style.scrollBehavior,
    };

    html.style.scrollBehavior = "auto";

    body.style.position = "fixed";

    body.style.top = `-${scrollY}px`;

    body.style.left = "0";

    body.style.right = "0";

    body.style.width = "100%";

    body.style.overflow = "hidden";

    html.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        hideMenu();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      body.style.position = previous.bodyPosition;

      body.style.top = previous.bodyTop;

      body.style.left = previous.bodyLeft;

      body.style.right = previous.bodyRight;

      body.style.width = previous.bodyWidth;

      body.style.overflow = previous.bodyOverflow;

      html.style.overflow = previous.htmlOverflow;

      const shouldRestoreScroll = window.location.pathname === lockPathname;

      if (shouldRestoreScroll) {
        const restoredScrollY = getClampedScrollY(savedScrollPosition.current);

        window.scrollTo({
          top: restoredScrollY,
          left: 0,
          behavior: "instant",
        });

        lenis?.scrollTo(restoredScrollY, {
          force: true,
          immediate: true,
          lock: false,
        });

        lenis?.resize?.();
      }

      lenis?.start();

      requestAnimationFrame(() => {
        if (shouldRestoreScroll) {
          const restoredScrollY = getClampedScrollY(
            savedScrollPosition.current,
          );

          window.scrollTo({
            top: restoredScrollY,
            left: 0,
            behavior: "instant",
          });

          lenis?.scrollTo(restoredScrollY, {
            force: true,
            immediate: true,
            lock: false,
          });
        }

        html.style.scrollBehavior = previous.htmlScrollBehavior;
      });

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuMounted, hideMenu]);

  /* ------------------------------------------------------------------------
     BREADCRUMB COLOR

     Navbar خودش همیشه سفید است.
  ------------------------------------------------------------------------- */

  const breadcrumbColor =
    overlayTone === "light" ? "text-[#0B0B0B]" : "text-[#0B0B0B]";

  const readableNavbar = menuMounted || scrolled;

  /* ==========================================================================
     RENDER
  ========================================================================== */

  return (
    <>
      {/* ================================================================
          NAVBAR

          IMPORTANT:
          - transparent over the hero/page top
          - glass surface after scroll
          - mega-menu surface while menu is mounted
      ================================================================= */}

      <header
        dir="ltr"
        style={{
          fontFamily: fontTokens.english,
        }}
        className={cx(
          "fixed",
          "inset-x-0",
          "top-0",

          "z-[1000]",

          "h-[72px]",
          "md:h-[76px]",

          menuMounted
            ? themeClasses.megaMenu
            : scrolled
              ? NAVBAR_GLASS_CLASSES
              : "bg-transparent",

          "border-b",

          menuMounted
            ? themeClasses.border
            : scrolled
              ? "border-white/60 dark:border-white/10"
              : "border-transparent",

          readableNavbar ? themeClasses.textPrimary : "text-white",

          "transition-[background-color,border-color,box-shadow,color,backdrop-filter]",
          "duration-300",
          "ease-[cubic-bezier(.22,.7,.2,1)]",
          "motion-reduce:transition-none",
        )}
      >
        <div
          className="
            relative
            mx-auto

            flex
            h-full

            max-w-[1920px]

            items-stretch
          "
        >
          {/* ============================================================
              LEFT — MENU
          ============================================================= */}

          <div
            className={cx(
              "flex",

              "w-[72px]",
              "shrink-0",

              "items-center",
              "justify-start",

              "pl-4",

              "sm:w-[96px]",
              "sm:pl-6",

              "lg:w-[250px]",
              "lg:pl-8",

              "xl:w-[270px]",
              "xl:pl-9",
            )}
          >
            <button
              ref={menuButtonRef}
              type="button"
              aria-expanded={open}
              aria-controls="najibzadeh-mega-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={toggleMenu}
              className={cx(
                "group",
                "flex h-12 cursor-pointer items-center gap-3",
                "transition-[color,filter,opacity]",
                "duration-150",
                "hover:opacity-65",
                readableNavbar
                  ? NAVBAR_SURFACE_CHROME_CLASSES
                  : [
                      NAVBAR_OVERLAY_CHROME_CLASSES,
                      "focus-visible:ring-offset-2",
                      "focus-visible:ring-offset-transparent",
                    ].join(" "),
              )}
            >
              {open ? <CloseIcon /> : <MenuIcon />}

              <span
                className="
                  hidden

                  text-[9px]
                  font-medium

                  uppercase
                  tracking-[0.22em]

                  md:inline
                "
              >
                {open ? "Close" : "Menu"}
              </span>
            </button>
          </div>

          {/* ============================================================
              CENTER LOGO
          ============================================================= */}

          <Link
            href="/"
            onClick={hideMenu}
            aria-label="Najibzadeh home"
            className={cx(
              "absolute left-1/2 top-1/2 z-10",
              "-translate-x-1/2 -translate-y-1/2",
              "whitespace-nowrap",
              "text-[14px] font-medium tracking-[0.28em]",
              "transition-[color,filter,opacity]",
              "duration-150",
              "hover:opacity-70",
              "sm:text-[16px] sm:tracking-[0.34em]",
              "md:text-[18px] md:tracking-[0.42em]",
              "lg:text-[19px] lg:tracking-[0.46em]",
              readableNavbar
                ? NAVBAR_SURFACE_CHROME_CLASSES
                : NAVBAR_OVERLAY_CHROME_CLASSES,
            )}
          >
            NAJIBZADEH
          </Link>

          <div className="min-w-0 flex-1" />

          {/* ============================================================
              RIGHT ACTIONS
          ============================================================= */}

          <div
            className="
              flex
              shrink-0

              items-center
              justify-end

              gap-0.5

              pr-3

              sm:pr-5

              md:gap-2

              lg:gap-3
              lg:pr-8

              xl:pr-9
            "
          >
            <div className="hidden md:block">
              <NavIcon
                href="/recently-viewed"
                label="Recently viewed"
                onReadableSurface={readableNavbar}
              >
                <HistoryIcon />
              </NavIcon>
            </div>

            <NavIcon
              href="/wishlist"
              label="Wishlist"
              onReadableSurface={readableNavbar}
            >
              <HeartIcon />
            </NavIcon>

            <NavIcon
              href="/cart"
              label="Shopping bag"
              badge={2}
              onReadableSurface={readableNavbar}
            >
              <BagIcon />
            </NavIcon>
          </div>
        </div>
      </header>

      {/* ================================================================
          BREADCRUMBS
      ================================================================= */}

      {!menuMounted && breadcrumbs.length > 0 && (
        <nav
          dir="ltr"
          aria-label="Breadcrumb"
          style={{
            fontFamily: fontTokens.english,
          }}
          className={cx(
            "absolute",
            "inset-x-0",

            "top-[68px]",

            "z-[80]",

            breadcrumbColor,

            "md:top-[76px]",
          )}
        >
          <div
            className="
                mx-auto

                max-w-[1920px]

                overflow-x-auto

                whitespace-nowrap

                px-4
                py-3

                sm:px-6

                lg:px-10
              "
          >
            <ol
              className="
                  flex
                  items-center
                  gap-2

                  text-[9px]
                  font-medium

                  uppercase
                  tracking-[0.14em]
                "
            >
              <li>
                <Link
                  href="/"
                  className="
                      opacity-55

                      transition-opacity

                      hover:opacity-100
                    "
                >
                  Home
                </Link>
              </li>

              {breadcrumbs.map((breadcrumb, index) => {
                const last = index === breadcrumbs.length - 1;

                return (
                  <li
                    key={breadcrumb.href}
                    className="
                          flex
                          items-center
                          gap-2
                        "
                  >
                    <span aria-hidden className="opacity-30">
                      /
                    </span>

                    {last ? (
                      <span>{breadcrumb.label}</span>
                    ) : (
                      <Link
                        href={breadcrumb.href}
                        className="
                              opacity-55

                              transition-opacity

                              hover:opacity-100
                            "
                      >
                        {breadcrumb.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </nav>
      )}

      {/* ================================================================
          MEGA MENU
      ================================================================= */}

      {menuMounted && (
        <nav
          id="najibzadeh-mega-menu"
          dir="ltr"
          data-lenis-prevent=""
          aria-label="Main navigation"
          aria-hidden={!open}
          style={{
            fontFamily: fontTokens.english,
          }}
          className={cx(
            "fixed",
            "inset-x-0",
            "bottom-0",

            /*
             * Header remains above menu.
             */
            "top-[72px]",

            "z-[990]",

            "overflow-y-auto",

            "overscroll-contain",

            "touch-pan-y",

            "[-webkit-overflow-scrolling:touch]",

            "transform-gpu",

            "transition-[opacity,transform]",

            "duration-[220ms]",

            "ease-[cubic-bezier(.22,.7,.2,1)]",

            "motion-reduce:transition-none",

            "md:top-[76px]",

            "lg:overflow-hidden",

            menuVisible
              ? `
                pointer-events-auto

                translate-y-0
                opacity-100
              `
              : `
                pointer-events-none

                -translate-y-2
                opacity-0
              `,

            themeClasses.megaMenu,
          )}
        >
          {/* ============================================================
              DESKTOP
          ============================================================= */}

          <div
            className="
              mx-auto

              hidden
              h-full

              max-w-[1920px]

              lg:grid

              lg:grid-cols-[250px_minmax(0,1fr)_360px]

              xl:grid-cols-[270px_minmax(0,1fr)_430px]
            "
          >
            {/* ==========================================================
                CATEGORY RAIL
            =========================================================== */}

            <aside
              className={cx(
                "flex",
                "min-h-0",

                "flex-col",

                "border-r",

                themeClasses.border,
              )}
            >
              <div
                className="
                  min-h-0
                  flex-1

                  overflow-y-auto

                  px-4
                  py-7

                  xl:px-5
                "
              >
                <p
                  className={cx(
                    "mb-4",
                    "px-3",

                    "text-[9px]",
                    "font-semibold",

                    "uppercase",
                    "tracking-[0.24em]",

                    themeClasses.textSoft,
                  )}
                >
                  Explore
                </p>

                <div className="space-y-1">
                  {MENU.map((section, index) => {
                    const selected = activeId === section.id;

                    return (
                      <button
                        key={section.id}
                        type="button"
                        onMouseEnter={() => {
                          setActiveId(section.id);

                          setHoveredSubcategory(null);
                        }}
                        onFocus={() => {
                          setActiveId(section.id);

                          setHoveredSubcategory(null);
                        }}
                        onClick={() => {
                          setActiveId(section.id);
                        }}
                        className={cx(
                          "group",
                          "relative",

                          "flex",
                          "min-h-[58px]",

                          "w-full",

                          "cursor-pointer",

                          "items-center",
                          "gap-3",

                          "px-3",
                          "py-2",

                          "text-left",

                          "transition-[background-color,color]",

                          "duration-150",

                          selected
                            ? themeClasses.surfaceMuted
                            : "bg-transparent",

                          themeClasses.focusRing,
                        )}
                      >
                        {/* ACTIVE LINE — BLACK / WHITE */}

                        <span
                          className={cx(
                            "absolute",

                            "bottom-3",
                            "left-0",
                            "top-3",

                            "w-[2px]",

                            "bg-[#0B0B0B]",

                            "dark:bg-white",

                            "transition-opacity",

                            selected ? "opacity-100" : "opacity-0",
                          )}
                        />

                        <span
                          className={cx(
                            "w-5",
                            "shrink-0",

                            "text-[8px]",

                            "tabular-nums",

                            themeClasses.textSoft,
                          )}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span
                          className={cx(
                            "min-w-0",
                            "flex-1",

                            "text-[16px]",
                            "font-medium",

                            "tracking-[-0.02em]",

                            selected
                              ? themeClasses.textPrimary
                              : themeClasses.textSecondary,
                          )}
                        >
                          {section.title}
                        </span>

                        <span
                          className={cx(
                            "shrink-0",

                            "transition-[opacity,transform]",

                            "duration-150",

                            selected
                              ? "translate-x-0 opacity-100"
                              : "-translate-x-1 opacity-0",

                            themeClasses.textPrimary,
                          )}
                        >
                          <ArrowIcon />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CLIENT SERVICES */}

              <div
                className={cx(
                  "shrink-0",

                  "border-t",

                  "p-5",

                  themeClasses.border,
                )}
              >
                <p
                  className={cx(
                    "mb-3",

                    "text-[8px]",
                    "font-semibold",

                    "uppercase",
                    "tracking-[0.18em]",

                    themeClasses.textSoft,
                  )}
                >
                  Client Services
                </p>

                <div className="space-y-1">
                  <UtilityLink href="/appointments" onClick={hideMenu}>
                    Private Appointment
                  </UtilityLink>

                  <UtilityLink href="/stores" onClick={hideMenu}>
                    Find a Store
                  </UtilityLink>

                  <UtilityLink href="/customer-care" onClick={hideMenu}>
                    Client Care
                  </UtilityLink>
                </div>
              </div>
            </aside>

            {/* ==========================================================
                MAIN
            =========================================================== */}

            <section
              className="
                min-h-0
                min-w-0

                overflow-y-auto

                px-8
                py-7

                [scrollbar-gutter:stable]

                xl:px-11
                xl:py-9
              "
            >
              <div
                key={active.id}
                className="
                  mx-auto

                  flex
                  min-h-full
                  max-w-[940px]

                  flex-col
                "
              >
                {/* HEADER */}

                <div
                  className={cx(
                    "flex",

                    "items-start",
                    "justify-between",

                    "gap-8",

                    "border-b",

                    "pb-7",

                    themeClasses.border,
                  )}
                >
                  <div className="max-w-[620px]">
                    {/* Copper allowed here as eyebrow */}

                    <p
                      className={cx(
                        "mb-3",

                        "text-[8px]",
                        "font-semibold",

                        "uppercase",
                        "tracking-[0.22em]",

                        themeClasses.textAccent,
                      )}
                    >
                      Explore Collection
                    </p>

                    <h2
                      className={cx(
                        "text-[34px]",

                        "font-medium",

                        "leading-[1.03]",

                        "tracking-[-0.035em]",

                        "xl:text-[42px]",

                        themeClasses.textPrimary,
                      )}
                    >
                      {active.title}
                    </h2>

                    <p
                      className={cx(
                        "mt-3",

                        "max-w-[540px]",

                        "text-[12px]",

                        "leading-6",

                        themeClasses.textSecondary,
                      )}
                    >
                      {active.subtitle}
                    </p>
                  </div>

                  <Link
                    href={active.href}
                    onClick={hideMenu}
                    className={cx(
                      "group",

                      "flex",
                      "shrink-0",

                      "items-center",
                      "gap-3",

                      "py-2",

                      "text-[9px]",
                      "font-semibold",

                      "uppercase",
                      "tracking-[0.18em]",

                      themeClasses.textSecondary,

                      themeClasses.focusRing,
                    )}
                  >
                    View all
                    <span
                      className="
                        transition-transform
                        duration-150

                        group-hover:translate-x-1
                      "
                    >
                      <ArrowIcon />
                    </span>
                  </Link>
                </div>

                {/* GROUPS */}

                <div
                  onMouseLeave={() => setHoveredSubcategory(null)}
                  className={cx(
                    "grid",

                    "grid-cols-2",

                    "gap-x-10",
                    "gap-y-10",

                    "py-8",

                    active.groups.length >= 4
                      ? "xl:grid-cols-4"
                      : "xl:grid-cols-3",
                  )}
                >
                  {active.groups.map((group) => (
                    <DesktopMenuGroup
                      key={group.title}
                      group={group}
                      hovered={hoveredSubcategory}
                      setHovered={setHoveredSubcategory}
                      closeMenu={hideMenu}
                    />
                  ))}
                </div>

                {/* QUICK ACCESS */}

                <div
                  className={cx(
                    "mt-auto",

                    "border-t",

                    "pt-5",

                    themeClasses.border,
                  )}
                >
                  <p
                    className={cx(
                      "mb-4",

                      "text-[8px]",
                      "font-semibold",

                      "uppercase",
                      "tracking-[0.2em]",

                      themeClasses.textSoft,
                    )}
                  >
                    Quick Access
                  </p>

                  <div
                    className={cx(
                      "grid",

                      "grid-cols-4",

                      "gap-px",

                      "overflow-hidden",

                      "border",

                      "lg:grid-cols-6",

                      themeClasses.border,
                    )}
                  >
                    {QUICK_LINKS.map((item) => (
                      <QuickAccessLink
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        onClick={hideMenu}
                      >
                        {item.label}
                      </QuickAccessLink>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ==========================================================
                EDITORIAL SIDE
            =========================================================== */}

            <aside
              className={cx(
                "flex",
                "min-h-0",

                "flex-col",

                "border-l",

                "p-4",

                "xl:p-5",

                themeClasses.border,

                themeClasses.surfaceMuted,
              )}
            >
              <EditorialImage
                key={active.image}
                src={active.image}
                label={active.imageLabel}
                eager
                className="
                  min-h-[280px]
                  flex-1
                "
              />

              <div className="shrink-0 pt-5">
                <p
                  className={cx(
                    "mb-2",

                    "text-[8px]",
                    "font-semibold",

                    "uppercase",
                    "tracking-[0.2em]",

                    themeClasses.textAccent,
                  )}
                >
                  Najibzadeh Selection
                </p>

                <div
                  className="
                    flex

                    items-end
                    justify-between

                    gap-5
                  "
                >
                  <div>
                    <h3
                      className={cx(
                        "text-[23px]",

                        "font-medium",

                        "tracking-[-0.025em]",

                        themeClasses.textPrimary,
                      )}
                    >
                      {active.imageLabel}
                    </h3>

                    <p
                      className={cx(
                        "mt-2",

                        "max-w-[290px]",

                        "text-[10px]",

                        "leading-5",

                        themeClasses.textSecondary,
                      )}
                    >
                      {active.subtitle}
                    </p>
                  </div>

                  <Link
                    href={active.href}
                    onClick={hideMenu}
                    aria-label={`Explore ${active.title}`}
                    className={cx(
                      "flex",

                      "h-11",
                      "w-11",

                      "shrink-0",

                      "items-center",
                      "justify-center",

                      "border",

                      "transition-colors",

                      themeClasses.borderStrong,

                      themeClasses.textPrimary,

                      themeClasses.focusRing,
                    )}
                  >
                    <ArrowIcon />
                  </Link>
                </div>
              </div>
            </aside>
          </div>

          {/* ============================================================
              MOBILE
          ============================================================= */}

          <div
            className="
              min-h-full

              px-4

              pb-[calc(2rem+env(safe-area-inset-bottom))]
              pt-2

              sm:px-6

              lg:hidden
            "
          >
            {/* TOP */}

            <div
              className={cx(
                "flex",

                "min-h-[52px]",

                "items-center",
                "justify-between",

                "border-b",

                themeClasses.border,
              )}
            >
              <p
                className={cx(
                  "text-[8px]",
                  "font-semibold",

                  "uppercase",
                  "tracking-[0.2em]",

                  themeClasses.textSoft,
                )}
              >
                Explore Najibzadeh
              </p>

              <Link
                href="/search"
                onClick={hideMenu}
                className={cx(
                  "flex",

                  "h-11",

                  "items-center",
                  "gap-2",

                  "text-[9px]",
                  "font-semibold",

                  "uppercase",
                  "tracking-[0.14em]",

                  themeClasses.textSecondary,

                  themeClasses.focusRing,
                )}
              >
                Search
                <SearchIcon />
              </Link>
            </div>

            {/* ACCORDIONS */}

            <div>
              {MENU.map((section, index) => {
                const expanded = mobileOpen === section.id;

                return (
                  <section
                    key={section.id}
                    className={cx(
                      "border-b",

                      themeClasses.border,
                    )}
                  >
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`mobile-mega-${section.id}`}
                      onClick={() => {
                        setMobileOpen((current) =>
                          current === section.id ? null : section.id,
                        );
                      }}
                      className={cx(
                        "flex",

                        "min-h-[68px]",

                        "w-full",

                        "cursor-pointer",

                        "items-center",
                        "gap-3",

                        "text-left",

                        themeClasses.focusRing,
                      )}
                    >
                      <span
                        className={cx(
                          "w-5",
                          "shrink-0",

                          "text-[8px]",

                          "tabular-nums",

                          themeClasses.textSoft,
                        )}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span
                        className={cx(
                          "min-w-0",
                          "flex-1",

                          "text-[19px]",
                          "font-medium",

                          "tracking-[-0.025em]",

                          themeClasses.textPrimary,
                        )}
                      >
                        {section.title}
                      </span>

                      <span
                        className={cx(
                          "flex",

                          "h-9",
                          "w-9",

                          "shrink-0",

                          "items-center",
                          "justify-center",

                          "transition-transform",
                          "duration-200",

                          expanded && "rotate-45",

                          themeClasses.textSecondary,
                        )}
                      >
                        <PlusIcon />
                      </span>
                    </button>

                    {expanded && (
                      <div
                        id={`mobile-mega-${section.id}`}
                        className="
                            pb-8
                            pl-8
                          "
                      >
                        <EditorialImage
                          src={section.image}
                          label={section.imageLabel}
                          className="
                              aspect-[16/10]
                              w-full
                            "
                        />

                        <div className="mt-5">
                          <p
                            className={cx(
                              "text-[8px]",
                              "font-semibold",

                              "uppercase",
                              "tracking-[0.18em]",

                              themeClasses.textAccent,
                            )}
                          >
                            Discover
                          </p>

                          <p
                            className={cx(
                              "mt-1",

                              "text-[18px]",
                              "font-medium",

                              themeClasses.textPrimary,
                            )}
                          >
                            {section.imageLabel}
                          </p>

                          <p
                            className={cx(
                              "mt-2",

                              "max-w-[340px]",

                              "text-[11px]",

                              "leading-5",

                              themeClasses.textSecondary,
                            )}
                          >
                            {section.subtitle}
                          </p>
                        </div>

                        <div className="mt-7 space-y-8">
                          {section.groups.map((group) => (
                            <MobileMenuGroup
                              key={group.title}
                              group={group}
                              closeMenu={hideMenu}
                            />
                          ))}
                        </div>

                        <Link
                          href={section.href}
                          onClick={hideMenu}
                          className={cx(
                            "group",

                            "mt-8",

                            "inline-flex",

                            "min-h-11",

                            "items-center",
                            "gap-3",

                            "text-[9px]",
                            "font-semibold",

                            "uppercase",
                            "tracking-[0.16em]",

                            themeClasses.textPrimary,

                            themeClasses.focusRing,
                          )}
                        >
                          View all {section.title}
                          <span
                            className="
                                transition-transform
                                duration-150

                                group-hover:translate-x-1
                              "
                          >
                            <ArrowIcon />
                          </span>
                        </Link>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>

            {/* CLIENT SERVICES */}

            <div
              className={cx(
                "mt-9",

                "border-t",

                "pt-6",

                themeClasses.border,
              )}
            >
              <p
                className={cx(
                  "mb-3",

                  "text-[8px]",
                  "font-semibold",

                  "uppercase",
                  "tracking-[0.2em]",

                  themeClasses.textSoft,
                )}
              >
                Client Services
              </p>

              <div className="space-y-1">
                <UtilityLink href="/appointments" onClick={hideMenu}>
                  Private Appointment
                </UtilityLink>

                <UtilityLink href="/stores" onClick={hideMenu}>
                  Find a Store
                </UtilityLink>

                <UtilityLink href="/customer-care" onClick={hideMenu}>
                  Customer Care
                </UtilityLink>
              </div>
            </div>

            {/* QUICK ACCESS */}

            <div
              className={cx(
                "mt-8",

                "border-t",

                "pt-6",

                themeClasses.border,
              )}
            >
              <p
                className={cx(
                  "mb-4",

                  "text-[8px]",
                  "font-semibold",

                  "uppercase",
                  "tracking-[0.2em]",

                  themeClasses.textSoft,
                )}
              >
                Quick Access
              </p>

              <div className="grid grid-cols-2 gap-px">
                {QUICK_LINKS.map((item) => (
                  <QuickAccessLink
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    onClick={hideMenu}
                  >
                    {item.label}
                  </QuickAccessLink>
                ))}
              </div>
            </div>
          </div>
        </nav>
      )}
    </>
  );
}

/* ==========================================================================
   DESKTOP MENU GROUP
============================================================================ */

function DesktopMenuGroup({
  group,

  hovered,

  setHovered,

  closeMenu,
}: {
  group: MenuGroup;

  hovered: string | null;

  setHovered: (href: string | null) => void;

  closeMenu: () => void;
}) {
  return (
    <div>
      <p
        className={cx(
          "mb-4",

          "text-[8px]",
          "font-semibold",

          "uppercase",
          "tracking-[0.2em]",

          themeClasses.textSoft,
        )}
      >
        {group.title}
      </p>

      <ul className="space-y-1">
        {group.items.map((item) => {
          const selected = hovered === item.href;

          const dimmed = hovered !== null && !selected;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={closeMenu}
                onMouseEnter={() => setHovered(item.href)}
                onFocus={() => setHovered(item.href)}
                onBlur={() => setHovered(null)}
                className={cx(
                  "group",

                  "flex",

                  "min-h-9",

                  "w-fit",

                  "items-center",
                  "gap-2",

                  "text-[13px]",
                  "font-medium",

                  "tracking-[-0.01em]",

                  "transition-[opacity,transform,color]",

                  "duration-200",

                  dimmed ? "opacity-[0.28]" : "opacity-100",

                  selected && "translate-x-1",

                  themeClasses.textPrimary,

                  themeClasses.focusRing,
                )}
              >
                <span>{item.label}</span>

                {item.badge && (
                  <span
                    className={cx(
                      "text-[7px]",
                      "font-semibold",

                      "uppercase",
                      "tracking-[0.12em]",

                      themeClasses.textAccent,
                    )}
                  >
                    {item.badge}
                  </span>
                )}

                <span
                  className={cx(
                    "translate-x-0",

                    "opacity-0",

                    "transition-[opacity,transform]",

                    "duration-150",

                    selected && "translate-x-1 opacity-100",
                  )}
                >
                  <ArrowIcon />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ==========================================================================
   MOBILE MENU GROUP
============================================================================ */

function MobileMenuGroup({
  group,

  closeMenu,
}: {
  group: MenuGroup;

  closeMenu: () => void;
}) {
  return (
    <div>
      {/* Allowed as small eyebrow */}

      <p
        className={cx(
          "mb-3",

          "text-[8px]",
          "font-semibold",

          "uppercase",
          "tracking-[0.2em]",

          themeClasses.textAccent,
        )}
      >
        {group.title}
      </p>

      <ul
        className={cx(
          "border-l",

          "pl-4",

          themeClasses.border,
        )}
      >
        {group.items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={closeMenu}
              className={cx(
                "flex",

                "min-h-10",

                "items-center",
                "gap-2",

                "text-[13px]",
                "font-medium",

                themeClasses.textPrimary,

                themeClasses.focusRing,
              )}
            >
              {item.label}

              {item.badge && (
                <span
                  className={cx(
                    "text-[7px]",
                    "font-semibold",

                    "uppercase",
                    "tracking-[0.12em]",

                    themeClasses.textAccent,
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ==========================================================================
   EDITORIAL IMAGE
============================================================================ */

function EditorialImage({
  src,

  label,

  className,

  eager = false,
}: {
  src: string;

  label: string;

  className?: string;

  eager?: boolean;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const failed = failedSrc === src;

  return (
    <div
      className={cx(
        "relative",

        "overflow-hidden",

        themeClasses.surface,

        className,
      )}
    >
      {!failed ? (
        <>
          <Image
            src={src}
            alt={label}
            fill
            sizes="(max-width: 1024px) 100vw, 360px"
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            onError={() => setFailedSrc(src)}
            className="
              absolute
              inset-0

              size-full

              object-cover

              transition-transform
              duration-700

              ease-[cubic-bezier(.22,.7,.2,1)]
            "
          />

          <div
            aria-hidden
            className="
              pointer-events-none

              absolute
              inset-0

              bg-gradient-to-t

              from-black/65
              via-black/10
              to-transparent
            "
          />

          <div
            className="
              absolute
              inset-x-0
              bottom-0

              p-4
            "
          >
            <p
              className="
                text-[8px]
                font-semibold

                uppercase
                tracking-[0.18em]

                text-white/60
              "
            >
              Najibzadeh
            </p>

            <p
              className="
                mt-1

                text-[18px]
                font-medium

                text-white
              "
            >
              {label}
            </p>
          </div>
        </>
      ) : (
        <div
          className={cx(
            "absolute",
            "inset-0",

            "flex",
            "items-end",

            "p-5",

            themeClasses.surfaceMuted,
          )}
        >
          <div>
            <p
              className={cx(
                "text-[8px]",
                "font-semibold",

                "uppercase",
                "tracking-[0.2em]",

                themeClasses.textAccent,
              )}
            >
              Najibzadeh
            </p>

            <p
              className={cx(
                "mt-2",

                "text-[18px]",
                "font-medium",

                themeClasses.textPrimary,
              )}
            >
              {label}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   NAV ICON

   Important:
   White over page content, themed on readable navbar surfaces.
============================================================================ */

function NavIcon({
  href,

  label,

  badge,

  onReadableSurface = false,

  children,
}: {
  href: string;

  label: string;

  badge?: number;

  onReadableSurface?: boolean;

  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cx(
        "group",
        "relative",
        "flex h-12 w-10 items-center justify-center",
        "transition-[color,filter,opacity]",
        "duration-150",
        "hover:opacity-65",
        "md:w-11",
        "lg:w-12",
        onReadableSurface
          ? NAVBAR_SURFACE_CHROME_CLASSES
          : NAVBAR_OVERLAY_CHROME_CLASSES,
      )}
    >
      <span
        className="
          block

          size-[18px]

          transition-transform
          duration-200

          group-hover:-translate-y-px

          md:size-[19px]
        "
      >
        {children}
      </span>

      {!!badge && (
        <span
          className={cx(
            "absolute right-0 top-1",
            "flex min-h-[14px] min-w-[14px] items-center justify-center",
            "px-[3px]",
            "text-[7px] font-semibold leading-none",
            onReadableSurface
              ? "bg-[#0B0B0B] text-white dark:bg-white dark:text-[#0B0B0B]"
              : "bg-white text-black",
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

/* ==========================================================================
   UTILITY LINK
============================================================================ */

function UtilityLink({
  href,

  onClick,

  children,
}: {
  href: string;

  onClick: () => void;

  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cx(
        "flex",

        "min-h-9",

        "w-fit",

        "items-center",

        "text-[10px]",
        "font-medium",

        "transition-opacity",

        "hover:opacity-55",

        themeClasses.textSecondary,

        themeClasses.focusRing,
      )}
    >
      {children}
    </Link>
  );
}

/* ==========================================================================
   QUICK ACCESS
============================================================================ */

function QuickAccessLink({
  href,

  icon,

  onClick,

  children,
}: {
  href: string;

  icon: ReactNode;

  onClick: () => void;

  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cx(
        "group",

        "relative",

        "flex",

        "min-h-[64px]",

        "items-center",
        "gap-3",

        "border-r",

        "px-3",

        "last:border-r-0",

        "transition-colors",
        "duration-200",

        "hover:bg-[#F7F7F7]",

        "dark:hover:bg-[#181818]",

        themeClasses.border,

        themeClasses.focusRing,
      )}
    >
      <span
        className={cx(
          "flex",

          "size-6",

          "shrink-0",

          "items-center",
          "justify-center",

          /*
           * No copper icon.
           */
          themeClasses.textSecondary,

          "transition-[color,transform]",

          "duration-200",

          "group-hover:-translate-y-px",

          "group-hover:text-[#0B0B0B]",

          "dark:group-hover:text-white",
        )}
      >
        {icon}
      </span>

      <span
        className={cx(
          "min-w-0",

          "text-nowrap",

          "text-[8px]",
          "font-semibold",

          "uppercase",
          "tracking-[0.12em]",

          "leading-4",

          themeClasses.textPrimary,
        )}
      >
        {children}
      </span>

      <span
        className={cx(
          "ml-auto",

          "shrink-0",

          "-translate-x-1",
          "opacity-0",

          "transition-[opacity,transform]",

          "duration-200",

          "group-hover:translate-x-0",

          "group-hover:opacity-100",

          themeClasses.textSecondary,
        )}
      >
        <ArrowIcon />
      </span>
    </Link>
  );
}

/* ==========================================================================
   MENU ICON
============================================================================ */

function MenuIcon() {
  return (
    <span
      aria-hidden="true"
      className="
        relative

        block

        h-[18px]
        w-[22px]
      "
    >
      <span
        className="
          absolute

          left-0
          top-[3px]

          h-px
          w-[22px]

          bg-current
        "
      />

      <span
        className="
          absolute

          left-0
          top-[9px]

          h-px
          w-[14px]

          bg-current
        "
      />

      <span
        className="
          absolute

          left-0
          top-[15px]

          h-px
          w-[22px]

          bg-current
        "
      />
    </span>
  );
}

/* ==========================================================================
   CLOSE
============================================================================ */

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="21"
      height="21"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.15"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 4 20 20" />

      <path d="M20 4 4 20" />
    </svg>
  );
}

/* ==========================================================================
   BAG
============================================================================ */

function BagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5.5 8.5h13l-.8 11.5H6.3L5.5 8.5Z" />

      <path d="M9 9V6.5C9 4.6 10.3 3 12 3s3 1.6 3 3.5V9" />
    </svg>
  );
}

/* ==========================================================================
   HEART
============================================================================ */

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="
          M20.7 5.2
          C18.8 3.2 15.7 3.2 13.8 5.2
          L12 7
          L10.2 5.2
          C8.3 3.2 5.2 3.2 3.3 5.2
          C1.4 7.2 1.4 10.4 3.3 12.4
          L12 21
          L20.7 12.4
          C22.6 10.4 22.6 7.2 20.7 5.2
          Z
        "
      />
    </svg>
  );
}

/* ==========================================================================
   HISTORY
============================================================================ */

function HistoryIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.4 7.3A8 8 0 1 1 4 14" />

      <path d="M4 4v4.5h4.5" />

      <path d="M12 7.5V12l3.1 1.8" />
    </svg>
  );
}

/* ==========================================================================
   SEARCH
============================================================================ */

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="6.5" />

      <path d="m16 16 4 4" />
    </svg>
  );
}

/* ==========================================================================
   ARROW
============================================================================ */

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />

      <path d="m14 7 5 5-5 5" />
    </svg>
  );
}

/* ==========================================================================
   PLUS
============================================================================ */

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    >
      <path d="M12 5v14" />

      <path d="M5 12h14" />
    </svg>
  );
}

/* ==========================================================================
   JOURNAL
============================================================================ */

function JournalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3.5 5.5c3.5-1.5 6-.5 8.5 1.5v12c-2.5-2-5-3-8.5-1.5z" />

      <path d="M20.5 5.5c-3.5-1.5-6-.5-8.5 1.5v12c2.5-2 5-3 8.5-1.5z" />
    </svg>
  );
}

/* ==========================================================================
   STORY
============================================================================ */

function StoryIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" />

      <path d="M3.8 9h16.4" />

      <path d="M3.8 15h16.4" />

      <path d="M12 3.5c2 2.2 3 5 3 8.5s-1 6.3-3 8.5" />

      <path d="M12 3.5c-2 2.2-3 5-3 8.5s1 6.3 3 8.5" />
    </svg>
  );
}

/* ==========================================================================
   ABOUT
============================================================================ */

function AboutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" />

      <path d="M12 10.5v6" />

      <path d="M12 7.5h.01" />
    </svg>
  );
}

/* ==========================================================================
   CONTACT
============================================================================ */

function ContactIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 5.5h16v12H4z" />

      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

/* ==========================================================================
   SHOP
============================================================================ */

function ShopIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 9h14l-1 11H6L5 9Z" />

      <path d="M9 9V6.5a3 3 0 0 1 6 0V9" />
    </svg>
  );
}

/* ==========================================================================
   PROFILE
============================================================================ */

function ProfileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />

      <path d="M5 20c.8-4.1 3.1-6.2 7-6.2s6.2 2.1 7 6.2" />
    </svg>
  );
}
