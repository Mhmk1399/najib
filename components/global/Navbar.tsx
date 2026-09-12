"use client";

import Image from "next/image";
import Link from "next/link";

import { usePathname } from "next/navigation";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/Button";
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
   LUXURY NAVBAR V2
============================================================================ */

const MENU_ANIMATION_MS = 320;

const NAVBAR_GLASS_CLASSES = [
  "bg-[#F7F5F0]/[0.86]",
  "backdrop-blur-2xl",
  "backdrop-saturate-150",
  "shadow-[0_10px_40px_rgba(9,9,9,0.055)]",
  "dark:bg-[#0A0A0A]/[0.86]",
  "dark:shadow-[0_10px_40px_rgba(0,0,0,0.22)]",
].join(" ");

const NAVBAR_OVERLAY_CHROME_CLASSES = [
  "text-white",
  "drop-shadow-[0_1px_12px_rgba(0,0,0,0.34)]",
  "focus-visible:outline-none",
  "focus-visible:ring-1",
  "focus-visible:ring-white/80",
].join(" ");

const NAVBAR_SURFACE_CHROME_CLASSES = [
  themeClasses.textPrimary,
  themeClasses.focusRing,
].join(" ");

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar({
  overlayTone = "light",
}: {
  overlayTone?: "light" | "dark";
}) {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState(MENU[0].id);
  const [mobileOpen, setMobileOpen] = useState<string | null>(MENU[0].id);
  const [hoveredSubcategory, setHoveredSubcategory] = useState<string | null>(
    null,
  );

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedScrollPosition = useRef(0);

  const active = useMemo(
    () => MENU.find((section) => section.id === activeId) ?? MENU[0],
    [activeId],
  );

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

  const showMenu = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setMenuMounted(true);
    setOpen(true);
    setHoveredSubcategory(null);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => setMenuVisible(true));
    });
  }, []);

  const hideMenu = useCallback(() => {
    setOpen(false);
    setMenuVisible(false);
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

  const toggleMenu = useCallback(() => {
    if (open) {
      hideMenu();
    } else {
      showMenu();
    }
  }, [hideMenu, open, showMenu]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let frame: number | null = null;

    const updateScrolled = () => {
      frame = null;
      const next = window.scrollY > 24;
      setScrolled((current) => (current === next ? current : next));
    };

    const handleScroll = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(updateScrolled);
    };

    frame = requestAnimationFrame(updateScrolled);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!menuMounted) return;

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
      if (event.key === "Escape") hideMenu();
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
  }, [hideMenu, menuMounted]);

  const readableNavbar = menuMounted || scrolled;
  const overlayBreadcrumbClass =
    overlayTone === "dark" ? "text-white" : "text-[#0B0B0B]";

  return (
    <>
      <header
        dir="ltr"
        style={{ fontFamily: fontTokens.english }}
        className={cx(
          "fixed inset-x-0 top-0 z-[1000]",
          "h-[70px] md:h-[78px]",
          "border-b",
          "transition-[background-color,border-color,box-shadow,color,backdrop-filter]",
          "duration-500 ease-linear",
          "motion-reduce:transition-none",
          menuMounted
            ? cx(themeClasses.megaMenu, themeClasses.border)
            : scrolled
              ? cx(
                  NAVBAR_GLASS_CLASSES,
                  "border-black/[0.06] dark:border-white/10",
                )
              : "border-transparent bg-transparent",
          readableNavbar ? themeClasses.textPrimary : "text-white",
        )}
      >
        <div className="relative mx-auto flex h-full max-w-[1920px] items-center px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex min-w-[104px] flex-1 items-center lg:min-w-[280px]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              uppercase={false}
              align="left"
              aria-expanded={open}
              aria-controls="najibzadeh-luxury-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={toggleMenu}
              icon={open ? <CloseIcon /> : <MenuIcon />}
              iconPosition="left"
              className={cx(
                "h-11 !min-h-0 !border-0 !bg-transparent !px-0 !text-current",
                "gap-3 !tracking-normal",
                "transition-opacity duration-200 hover:!border-0 hover:!bg-transparent hover:opacity-60",
                readableNavbar
                  ? NAVBAR_SURFACE_CHROME_CLASSES
                  : NAVBAR_OVERLAY_CHROME_CLASSES,
              )}
            >
              <span className="hidden text-[9px] font-semibold uppercase tracking-[0.22em] sm:inline">
                {open ? "Close" : "Menu"}
              </span>
            </Button>
          </div>

          <Link
            href="/"
            onClick={hideMenu}
            aria-label="Najibzadeh home"
            className={cx(
              "absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2",
              "transition-[opacity,transform,filter] duration-300",
              "hover:scale-[1.025] hover:opacity-80",
              readableNavbar
                ? NAVBAR_SURFACE_CHROME_CLASSES
                : NAVBAR_OVERLAY_CHROME_CLASSES,
            )}
          >
            <Image
              src={
                readableNavbar
                  ? "/assets/images/logoblack.png"
                  : "/assets/images/logo.png"
              }
              alt="Najibzadeh"
              width={84}
              height={84}
              priority
              className="h-auto w-[66px] sm:w-[72px] md:w-[78px]"
            />
          </Link>

          <div className="flex min-w-[104px] flex-1 items-center justify-end gap-0.5 lg:min-w-[280px] lg:gap-1.5">
            <div className="hidden sm:block">
              <NavAction
                href="/profile"
                label="Profile"
                onReadableSurface={readableNavbar}
              >
                <ProfileIcon />
              </NavAction>
            </div>

            <div className="hidden md:block">
              <NavAction
                href="/wishlist"
                label="Wishlist"
                onReadableSurface={readableNavbar}
              >
                <HeartIcon />
              </NavAction>
            </div>

            <NavAction
              href="/cart"
              label="Shopping bag"
              badge={2}
              onReadableSurface={readableNavbar}
            >
              <BagIcon />
            </NavAction>
          </div>
        </div>
      </header>

      {!menuMounted && breadcrumbs.length > 0 && (
        <nav
          dir="ltr"
          aria-label="Breadcrumb"
          style={{ fontFamily: fontTokens.english }}
          className={cx(
            "absolute inset-x-0 top-[70px] z-[80] md:top-[78px]",
            scrolled ? themeClasses.textPrimary : overlayBreadcrumbClass,
          )}
        >
          <div className="mx-auto max-w-[1920px] overflow-x-auto px-4 py-3 sm:px-6 lg:px-10">
            <ol className="flex items-center gap-2 whitespace-nowrap text-[8px] font-semibold uppercase tracking-[0.16em]">
              <li>
                <Link
                  href="/"
                  className="opacity-45 transition-opacity hover:opacity-100"
                >
                  Home
                </Link>
              </li>

              {breadcrumbs.map((breadcrumb, index) => {
                const last = index === breadcrumbs.length - 1;

                return (
                  <li key={breadcrumb.href} className="flex items-center gap-2">
                    <span aria-hidden className="opacity-25">
                      /
                    </span>
                    {last ? (
                      <span className="opacity-90">{breadcrumb.label}</span>
                    ) : (
                      <Link
                        href={breadcrumb.href}
                        className="opacity-45 transition-opacity hover:opacity-100"
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

      {menuMounted && (
        <div
          id="najibzadeh-luxury-menu"
          dir="ltr"
          data-lenis-prevent=""
          aria-hidden={!open}
          style={{ fontFamily: fontTokens.english }}
          className={cx(
            "fixed inset-x-0 bottom-0 top-[70px] z-[990] md:top-[78px]",
            "transition-opacity duration-[320ms] ease-linear",
            "motion-reduce:transition-none",
            menuVisible
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0",
          )}
        >
          <button
            type="button"
            aria-label="Close navigation"
            onClick={hideMenu}
            className={cx(
              "absolute inset-0 hidden bg-black/35 backdrop-blur-[3px] transition-opacity duration-300 lg:block",
              menuVisible ? "opacity-100" : "opacity-0",
            )}
          />

          <div
            className={cx(
              "relative mx-auto h-full max-w-[1920px] overflow-hidden",
              "transition-[transform,opacity] duration-[320ms] ease-linear",
              "motion-reduce:transition-none",
              menuVisible
                ? "translate-y-0 opacity-100"
                : "-translate-y-3 opacity-0",
            )}
          >
            <div className="hidden h-[min(760px,calc(100vh-92px))] min-h-[560px] grid-cols-[270px_minmax(0,1fr)_390px] overflow-hidden border-t border-black/[0.06] bg-[#F7F5F0] shadow-[0_30px_90px_rgba(0,0,0,0.18)] dark:border-white/10 dark:bg-[#0E0E0E] lg:grid xl:grid-cols-[300px_minmax(0,1fr)_450px]">
              <aside className="flex min-h-0 flex-col bg-[#0C0C0C] text-white">
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 xl:px-7">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.24em] text-white/45">
                    Collections
                  </p>
                  <span className="text-[8px] font-medium tabular-nums text-white/35">
                    {String(MENU.length).padStart(2, "0")}
                  </span>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 xl:px-4">
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
                        onClick={() => setActiveId(section.id)}
                        className={cx(
                          "group relative flex min-h-[72px] w-full items-center gap-4 px-4 text-left",
                          "transition-[background-color,transform] duration-300",
                          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/60 focus-visible:ring-inset",
                          selected
                            ? "bg-white/[0.075]"
                            : "hover:bg-white/[0.04]",
                        )}
                      >
                        <span
                          className={cx(
                            "absolute inset-y-3 left-0 w-px bg-white transition-opacity duration-300",
                            selected ? "opacity-100" : "opacity-0",
                          )}
                        />

                        <span className="w-6 shrink-0 text-[8px] font-medium tabular-nums tracking-[0.08em] text-white/35">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span
                          className={cx(
                            "min-w-0 flex-1 text-[17px] font-medium tracking-[-0.025em] transition-all duration-300 xl:text-[18px]",
                            selected
                              ? "translate-x-1 text-white"
                              : "text-white/62 group-hover:text-white/90",
                          )}
                        >
                          {section.title}
                        </span>

                        <span
                          className={cx(
                            "transition-[opacity,transform] duration-300",
                            selected
                              ? "translate-x-0 opacity-100"
                              : "-translate-x-1 opacity-0",
                          )}
                        >
                          <ArrowIcon />
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-white/10 p-5 xl:p-6">
                  <p className="mb-3 text-[8px] font-semibold uppercase tracking-[0.22em] text-white/35">
                    Client services
                  </p>
                  <div className="space-y-1">
                    <DarkUtilityLink href="/appointments" onClick={hideMenu}>
                      Private appointment
                    </DarkUtilityLink>
                    <DarkUtilityLink href="/stores" onClick={hideMenu}>
                      Find a store
                    </DarkUtilityLink>
                    <DarkUtilityLink href="/customer-care" onClick={hideMenu}>
                      Client care
                    </DarkUtilityLink>
                  </div>
                </div>
              </aside>

              <main className="min-h-0 min-w-0 overflow-y-auto px-8 py-8 xl:px-12 xl:py-10">
                <div
                  key={active.id}
                  className="mx-auto flex min-h-full max-w-[920px] flex-col"
                >
                  <div className="flex items-start justify-between gap-8 border-b border-black/[0.09] pb-8 dark:border-white/10">
                    <div className="max-w-[620px]">
                      <div className="mb-4 flex items-center gap-3">
                        <span
                          className={cx(
                            "text-[8px] font-semibold uppercase tracking-[0.24em]",
                            themeClasses.textAccent,
                          )}
                        >
                          Najibzadeh / {active.id}
                        </span>
                        <span className="h-px w-8 bg-current opacity-15" />
                      </div>

                      <h2
                        className={cx(
                          "text-[40px] font-medium leading-[0.98] tracking-[-0.045em] xl:text-[50px]",
                          themeClasses.textPrimary,
                        )}
                      >
                        {active.title}
                      </h2>

                      <p
                        className={cx(
                          "mt-4 max-w-[560px] text-[12px] leading-6 xl:text-[13px]",
                          themeClasses.textSecondary,
                        )}
                      >
                        {active.subtitle}
                      </p>
                    </div>

                    <Button
                      href={active.href}
                      onClick={hideMenu}
                      variant="outline"
                      size="md"
                      icon={<ArrowIcon />}
                      iconPosition="right"
                      className="mt-1 !tracking-[0.18em]"
                    >
                      View collection
                    </Button>
                  </div>

                  <div
                    onMouseLeave={() => setHoveredSubcategory(null)}
                    className={cx(
                      "grid flex-1 grid-cols-2 gap-x-10 gap-y-10 py-9",
                      active.groups.length >= 4
                        ? "xl:grid-cols-4"
                        : "xl:grid-cols-3",
                    )}
                  >
                    {active.groups.map((group, groupIndex) => (
                      <LuxuryMenuGroup
                        key={group.title}
                        group={group}
                        index={groupIndex}
                        hovered={hoveredSubcategory}
                        setHovered={setHoveredSubcategory}
                        closeMenu={hideMenu}
                      />
                    ))}
                  </div>

                  <div className="border-t border-black/[0.09] pt-5 dark:border-white/10">
                    <div className="flex items-center justify-between gap-5">
                      <p
                        className={cx(
                          "text-[8px] font-semibold uppercase tracking-[0.2em]",
                          themeClasses.textSoft,
                        )}
                      >
                        Quick access
                      </p>

                      <div className="flex flex-wrap justify-end gap-2">
                        {QUICK_LINKS.map((item) => (
                          <QuickAccessLink
                            key={item.href}
                            href={item.href}
                            onClick={hideMenu}
                          >
                            {item.label}
                          </QuickAccessLink>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </main>

              <aside className="min-h-0 border-l border-black/[0.08] bg-[#EFEBE4] p-4 dark:border-white/10 dark:bg-[#151515] xl:p-5">
                <LuxuryEditorialCard
                  key={active.image}
                  section={active}
                  onClick={hideMenu}
                />
              </aside>
            </div>

            <div
              className={cx(
                "h-full overflow-y-auto px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-3 sm:px-6 lg:hidden",
                themeClasses.megaMenu,
              )}
            >
              <div className="flex min-h-[52px] items-center justify-between border-b border-black/[0.08] dark:border-white/10">
                <div>
                  <p
                    className={cx(
                      "text-[8px] font-semibold uppercase tracking-[0.22em]",
                      themeClasses.textSoft,
                    )}
                  >
                    Explore
                  </p>
                  <p
                    className={cx(
                      "mt-1 text-[16px] font-medium tracking-[-0.02em]",
                      themeClasses.textPrimary,
                    )}
                  >
                    Najibzadeh
                  </p>
                </div>
              </div>

              <div className="mt-3 overflow-hidden border border-black/[0.08] dark:border-white/10">
                {MENU.map((section, index) => {
                  const expanded = mobileOpen === section.id;

                  return (
                    <section
                      key={section.id}
                      className="border-b border-black/[0.08] last:border-b-0 dark:border-white/10"
                    >
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={`mobile-luxury-${section.id}`}
                        onClick={() => {
                          setMobileOpen((current) =>
                            current === section.id ? null : section.id,
                          );
                          setActiveId(section.id);
                        }}
                        className={cx(
                          "flex min-h-[70px] w-full items-center gap-3 px-4 text-left sm:px-5",
                          "transition-colors duration-300",
                          expanded
                            ? "bg-black/[0.025] dark:bg-white/[0.035]"
                            : "bg-transparent",
                          themeClasses.focusRing,
                        )}
                      >
                        <span
                          className={cx(
                            "w-6 shrink-0 text-[8px] tabular-nums",
                            themeClasses.textSoft,
                          )}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={cx(
                            "min-w-0 flex-1 text-[18px] font-medium tracking-[-0.025em]",
                            themeClasses.textPrimary,
                          )}
                        >
                          {section.title}
                        </span>
                        <span
                          className={cx(
                            "flex h-9 w-9 shrink-0 items-center justify-center border transition-transform duration-300",
                            themeClasses.border,
                            themeClasses.textSecondary,
                            expanded && "rotate-45",
                          )}
                        >
                          <PlusIcon />
                        </span>
                      </button>

                      <div
                        id={`mobile-luxury-${section.id}`}
                        className={cx(
                          "grid transition-[grid-template-rows] duration-300 ease-linear",
                          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                        )}
                      >
                        <div className="overflow-hidden">
                          <div className="px-4 pb-6 sm:px-5">
                            <Link
                              href={section.href}
                              onClick={hideMenu}
                              className="group relative block aspect-[16/8.5] overflow-hidden"
                            >
                              <Image
                                src={section.image}
                                alt={section.imageLabel}
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover transition-transform duration-700 ease-linear group-hover:scale-[1.025]"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 text-white">
                                <div>
                                  <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/55">
                                    Featured
                                  </p>
                                  <p className="mt-1 text-[18px] font-medium tracking-[-0.02em]">
                                    {section.imageLabel}
                                  </p>
                                </div>
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/30 bg-white/10 backdrop-blur-md">
                                  <ArrowIcon />
                                </span>
                              </div>
                            </Link>

                            <p
                              className={cx(
                                "mt-4 max-w-[420px] text-[11px] leading-5",
                                themeClasses.textSecondary,
                              )}
                            >
                              {section.subtitle}
                            </p>

                            <div className="mt-6 grid gap-6 sm:grid-cols-2">
                              {section.groups.map((group) => (
                                <MobileLuxuryGroup
                                  key={group.title}
                                  group={group}
                                  closeMenu={hideMenu}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  );
                })}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {QUICK_LINKS.map((item) => (
                  <Button
                    key={item.href}
                    href={item.href}
                    onClick={hideMenu}
                    variant="outline"
                    size="md"
                    fullWidth
                    align="left"
                    icon={item.icon}
                    iconPosition="left"
                    className="!min-h-[54px] !px-3 !tracking-[0.11em]"
                  >
                    {item.label}
                  </Button>
                ))}
              </div>

              <div className="mt-6 border-t border-black/[0.08] pt-5 dark:border-white/10">
                <p
                  className={cx(
                    "mb-3 text-[8px] font-semibold uppercase tracking-[0.2em]",
                    themeClasses.textSoft,
                  )}
                >
                  Client services
                </p>
                <div className="grid gap-1 sm:grid-cols-3">
                  <LightUtilityLink href="/appointments" onClick={hideMenu}>
                    Private appointment
                  </LightUtilityLink>
                  <LightUtilityLink href="/stores" onClick={hideMenu}>
                    Find a store
                  </LightUtilityLink>
                  <LightUtilityLink href="/customer-care" onClick={hideMenu}>
                    Client care
                  </LightUtilityLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function LuxuryMenuGroup({
  group,
  index,
  hovered,
  setHovered,
  closeMenu,
}: {
  group: MenuGroup;
  index: number;
  hovered: string | null;
  setHovered: (href: string | null) => void;
  closeMenu: () => void;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span
          className={cx(
            "text-[8px] font-semibold tabular-nums",
            themeClasses.textSoft,
          )}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <p
          className={cx(
            "text-[8px] font-semibold uppercase tracking-[0.2em]",
            themeClasses.textSoft,
          )}
        >
          {group.title}
        </p>
      </div>

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
                  "group inline-flex min-h-9 items-center gap-2 text-[13px] font-medium tracking-[-0.012em]",
                  "transition-[opacity,transform] duration-300",
                  dimmed ? "opacity-30" : "opacity-100",
                  selected && "translate-x-1",
                  themeClasses.textPrimary,
                  themeClasses.focusRing,
                )}
              >
                <span className="relative">
                  {item.label}
                  <span
                    className={cx(
                      "absolute -bottom-0.5 left-0 h-px bg-current transition-[width,opacity] duration-300",
                      selected ? "w-full opacity-40" : "w-0 opacity-0",
                    )}
                  />
                </span>

                {item.badge && (
                  <span
                    className={cx(
                      "text-[7px] font-semibold uppercase tracking-[0.12em]",
                      themeClasses.textAccent,
                    )}
                  >
                    {item.badge}
                  </span>
                )}

                <span
                  className={cx(
                    "-translate-x-1 opacity-0 transition-[opacity,transform] duration-300",
                    selected && "translate-x-0 opacity-100",
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

function MobileLuxuryGroup({
  group,
  closeMenu,
}: {
  group: MenuGroup;
  closeMenu: () => void;
}) {
  return (
    <div>
      <p
        className={cx(
          "mb-2 text-[8px] font-semibold uppercase tracking-[0.18em]",
          themeClasses.textAccent,
        )}
      >
        {group.title}
      </p>
      <ul className="space-y-0.5">
        {group.items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={closeMenu}
              className={cx(
                "flex min-h-9 items-center gap-2 text-[12px] font-medium",
                themeClasses.textPrimary,
                themeClasses.focusRing,
              )}
            >
              {item.label}
              {item.badge && (
                <span
                  className={cx(
                    "text-[7px] font-semibold uppercase tracking-[0.12em]",
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

function LuxuryEditorialCard({
  section,
  onClick,
}: {
  section: MenuSection;
  onClick: () => void;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === section.image;

  return (
    <Link
      href={section.href}
      onClick={onClick}
      className={cx(
        "group relative flex h-full min-h-[510px] overflow-hidden",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-offset-2 dark:focus-visible:ring-white/70 dark:focus-visible:ring-offset-[#151515]",
      )}
    >
      {!failed ? (
        <Image
          src={section.image}
          alt={section.imageLabel}
          fill
          sizes="(min-width: 1280px) 450px, 390px"
          loading="eager"
          decoding="async"
          onError={() => setFailedSrc(section.image)}
          className="object-cover transition-transform duration-[1100ms] ease-linear group-hover:scale-[1.035]"
        />
      ) : (
        <div className="absolute inset-0 bg-[#D9D4CC] dark:bg-[#222]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/5" />
      <div className="absolute inset-x-0 bottom-0 p-6 text-white xl:p-7">
        <div className="mb-3 flex items-center gap-3">
          <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-white/55">
            Editorial selection
          </span>
          <span className="h-px w-8 bg-white/30" />
        </div>

        <div className="flex items-end justify-between gap-6">
          <div>
            <h3 className="max-w-[300px] text-[28px] font-medium leading-[1.02] tracking-[-0.035em] xl:text-[32px]">
              {section.imageLabel}
            </h3>
            <p className="mt-3 max-w-[310px] text-[10px] leading-5 text-white/62">
              {section.subtitle}
            </p>
          </div>

          <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-white/30 bg-white/10 backdrop-blur-md transition-[background-color,transform] duration-300 group-hover:-translate-y-1 group-hover:bg-white group-hover:text-black">
            <ArrowIcon />
          </span>
        </div>
      </div>
    </Link>
  );
}

function NavAction({
  href,
  label,
  badge,
  onReadableSurface,
  children,
}: {
  href: string;
  label: string;
  badge?: number;
  onReadableSurface: boolean;
  children: ReactNode;
}) {
  return (
    <span className="relative inline-flex">
      <Button
        href={href}
        aria-label={label}
        variant="outline"
        size="md"
        icon={children}
        iconOnly
        className={cx(
          "!h-11 !w-10 !min-h-0 !border-0 !bg-transparent !p-0 !text-current md:!w-11",
          "hover:!border-0 hover:!bg-transparent hover:opacity-60",
          onReadableSurface
            ? NAVBAR_SURFACE_CHROME_CLASSES
            : NAVBAR_OVERLAY_CHROME_CLASSES,
        )}
      />

      {!!badge && (
        <span
          className={cx(
            "pointer-events-none absolute right-0 top-0 flex min-h-[15px] min-w-[15px] items-center justify-center px-[3px] text-[7px] font-semibold leading-none",
            onReadableSurface
              ? "bg-[#0B0B0B] text-white dark:bg-white dark:text-[#0B0B0B]"
              : "bg-white text-black",
          )}
        >
          {badge}
        </span>
      )}
    </span>
  );
}

function TextNavAction({
  href,
  label,
  onReadableSurface,
  children,
}: {
  href: string;
  label: string;
  onReadableSurface: boolean;
  children: ReactNode;
}) {
  return (
    <Button
      href={href}
      aria-label={label}
      variant="outline"
      size="sm"
      icon={children}
      iconPosition="left"
      align="left"
      className={cx(
        "!h-11 !min-h-0 !border-0 !bg-transparent !px-3 !text-current !tracking-[0.16em]",
        "hover:!border-0 hover:!bg-transparent hover:opacity-60",
        onReadableSurface
          ? NAVBAR_SURFACE_CHROME_CLASSES
          : NAVBAR_OVERLAY_CHROME_CLASSES,
      )}
    >
      {label}
    </Button>
  );
}

function QuickAccessLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      href={href}
      onClick={onClick}
      variant="outline"
      size="sm"
      className="!min-h-8 !px-3 !text-[7px] !tracking-[0.13em]"
    >
      {children}
    </Button>
  );
}

function DarkUtilityLink({
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
      className="group flex min-h-8 w-fit items-center gap-2 text-[10px] font-medium text-white/58 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/60"
    >
      <span className="h-px w-0 bg-white/60 transition-[width] duration-300 group-hover:w-3" />
      {children}
    </Link>
  );
}

function LightUtilityLink({
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
        "flex min-h-10 items-center text-[10px] font-medium transition-opacity hover:opacity-55",
        themeClasses.textSecondary,
        themeClasses.focusRing,
      )}
    >
      {children}
    </Link>
  );
}
/* ==========================================================================
   MENU ICONS — STRICTLY ANGULAR / NO CURVES
============================================================================ */

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="square"
      aria-hidden="true"
    >
      <path d="M1.5 3.5H14.5" />
      <path d="M1.5 8H10" />
      <path d="M1.5 12.5H14.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="21"
      height="21"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.15"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <path d="M4 4 20 20" />
      <path d="M20 4 4 20" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <path d="M5 8h14v12H5z" />
      <path d="M9 8V4h6v4" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <path d="M12 20 3 11V6l3-3h4l2 2 2-2h4l3 3v5Z" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <path d="M5 5h14v14H5z" />
      <path d="M12 8v5l3 2" />
      <path d="M8 2h8" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m14 7 5 5-5 5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function JournalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <path d="M4 5h7v14H4z" />
      <path d="M13 5h7v14h-7z" />
      <path d="M11 7h2" />
    </svg>
  );
}

function StoryIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <path d="M4 4h16v16H4z" />
      <path d="M4 9h16" />
      <path d="M4 15h16" />
      <path d="M9 4v16" />
      <path d="M15 4v16" />
    </svg>
  );
}

function AboutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <path d="M4 4h16v16H4z" />
      <path d="M12 10v6" />
      <path d="M11.5 7.5h1" />
    </svg>
  );
}

function ContactIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <path d="M4 5h16v14H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function ShopIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <path d="M5 8h14v12H5z" />
      <path d="M9 8V4h6v4" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <path d="M9 4h6v6H9z" />
      <path d="M5 20v-5l4-3h6l4 3v5" />
    </svg>
  );
}
