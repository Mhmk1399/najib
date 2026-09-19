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
import { useStorefrontMenuSections } from "@/lib/catalog/storefront-client";
import { themeClasses } from "@/theme/theme-colors";

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

const EMPTY_MENU_SECTION: MenuSection = {
  id: "catalog",
  title: "دسته‌بندی‌ها",
  subtitle: "دسته‌بندی‌های فعال فروشگاه اینجا نمایش داده می‌شوند.",
  href: "/shop",
  groups: [
    {
      title: "فروشگاه",
      items: [{ label: "همه محصولات", href: "/shop" }],
    },
  ],
  image: "/assets/images/banner.webp",
  imageLabel: "کاتالوگ نجیب‌زاده",
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

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function formatPersianNumber(value: number | string, minimumLength = 0) {
  return String(value)
    .padStart(minimumLength, "0")
    .replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit);
}

const BADGE_LABELS: Record<string, string> = {
  New: "جدید",
  جدید: "جدید",
  Exclusive: "انحصاری",
  Limited: "محدود",
};

function localizeBadge(label?: string) {
  if (!label) return undefined;
  return BADGE_LABELS[label] ?? label;
}

/* ==========================================================================
   QUICK LINKS
============================================================================ */

const QUICK_LINKS: QuickLink[] = [
  {
    label: "وبلاگ",
    href: "/blog",
    icon: <JournalIcon />,
  },

  {
    label: "داستان ما",
    href: "/about-us",
    icon: <StoryIcon />,
  },

  {
    label: "درباره ما",
    href: "/about-us",
    icon: <AboutIcon />,
  },

  {
    label: "تماس با ما",
    href: "/contact-us",
    icon: <ContactIcon />,
  },

  {
    label: "فروشگاه",
    href: "/shop",
    icon: <ShopIcon />,
  },

  {
    label: "پروفایل",
    href: "/profile",
    icon: <ProfileIcon />,
  },
];

/* ==========================================================================
   MENU COPY LOCALIZATION
============================================================================ */

const MENU_TEXT_TRANSLATIONS: Record<string, string> = {
  "New & Featured": "جدید و منتخب",
  "Discover the latest expressions of Najibzadeh.":
    "تازه‌ترین روایت‌های نجیب‌زاده را کشف کنید.",
  "The New Season": "فصل تازه",
  New: "جدید",
  "New Arrivals": "تازه‌رسیده‌ها",
  "Latest Collection": "جدیدترین مجموعه",
  "Best Sellers": "پرفروش‌ها",
  "Najibzadeh Icons": "نمادهای نجیب‌زاده",
  Curated: "انتخاب‌شده",
  "The Evening Edit": "انتخاب شب",
  "Business Wardrobe": "کمد رسمی",
  "Weekend Selection": "انتخاب آخر هفته",
  "Travel Essentials": "ضروریات سفر",
  Discover: "کشف کنید",
  "The Journal": "مجله",
  Campaigns: "کمپین‌ها",
  Lookbook: "لوک‌بوک",
  "Our World": "دنیای ما",
  Clothing: "پوشاک",
  "Modern tailoring and refined essentials designed for everyday presence.":
    "خیاطی مدرن و ضروریات پالوده برای حضوری متمایز در هر روز.",
  "Modern Tailoring": "خیاطی مدرن",
  Tailoring: "خیاطی",
  Suits: "کت‌وشلوار",
  Blazers: "بلیزر",
  Tuxedos: "تاکسیدو",
  Waistcoats: "جلیقه",
  Essentials: "ضروریات",
  Shirts: "پیراهن",
  Polos: "پولوشرت",
  "T-Shirts": "تی‌شرت",
  Knitwear: "پوشاک بافت",
  Bottoms: "شلوار",
  Trousers: "شلوار پارچه‌ای",
  Denim: "جین",
  Chinos: "چینو",
  Shorts: "شلوارک",
  Outerwear: "لباس بیرونی",
  Coats: "پالتو",
  Jackets: "کت و کاپشن",
  Leather: "چرم",
  Overshirts: "اورشرت",
  Fragrance: "عطر",
  "Signature scents created to leave a lasting impression.":
    "رایحه‌های امضادار برای اثری ماندگار.",
  "Noir Absolu": "نوآر ابسولو",
  Fragrances: "عطرها",
  "All Fragrances": "همه عطرها",
  "Extrait de Parfum": "اکستریت دو پرفیوم",
  "Eau de Parfum": "ادو پرفیوم",
  "Discovery Sets": "ست‌های اکتشافی",
  "By Character": "بر اساس رایحه",
  Woody: "چوبی",
  Amber: "عنبری",
  Fresh: "تازه",
  Signatures: "رایحه‌های امضا",
  "Vetiver Éclat": "وتیور اکلا",
  "Santal Royal": "سانتال رویال",
  "Oud Essence": "عود اسنس",
  Accessories: "اکسسوری",
  "Considered details that complete the Najibzadeh wardrobe.":
    "جزئیات سنجیده‌ای که استایل نجیب‌زاده را کامل می‌کنند.",
  "Objects of Character": "جزئیات ماندگار",
  "Leather Goods": "کالاهای چرمی",
  Bags: "کیف‌ها",
  Briefcases: "کیف اداری",
  Wallets: "کیف پول",
  Belts: "کمربند",
  Footwear: "کفش",
  Loafers: "لوفر",
  Oxfords: "آکسفورد",
  Sneakers: "کتانی",
  Boots: "بوت",
  Details: "جزئیات",
  Eyewear: "عینک",
  Ties: "کراوات",
  "Pocket Squares": "پوشت",
  Watches: "ساعت",
  "The House": "خانه نجیب‌زاده",
  "Craftsmanship, heritage and the world behind Najibzadeh.":
    "هنر ساخت، میراث و جهان پشت نام نجیب‌زاده.",
  "Inside the Atelier": "درون آتلیه",
  "The Atelier": "آتلیه",
  Craftsmanship: "هنر ساخت",
  Materials: "متریال‌ها",
  "Private Appointment": "قرار اختصاصی",
  "Our Story": "داستان ما",
  Heritage: "میراث",
  Stores: "فروشگاه‌ها",
};

function localizeMenuText(value: string) {
  return MENU_TEXT_TRANSLATIONS[value] ?? value;
}

/* ==========================================================================
   BREADCRUMB LABELS
============================================================================ */

const BREADCRUMB_LABELS: Record<string, string> = {
  shop: "فروشگاه",
  profile: "حساب کاربری",
  wishlist: "علاقه‌مندی‌ها",
  cart: "سبد خرید",
  about: "درباره ما",
  contact: "تماس با ما",
  campaigns: "کمپین‌ها",
  lookbook: "لوک‌بوک",
  world: "دنیای ما",
  "best-sellers": "پرفروش‌ها",
  icons: "نمادهای نجیب‌زاده",
  edits: "منتخب‌ها",
  evening: "انتخاب شب",
  business: "کمد رسمی",
  weekend: "انتخاب آخر هفته",
  travel: "ضروریات سفر",
  "customer-care": "پشتیبانی مشتریان",
  new: "جدیدها",

  "new-arrivals": "تازه‌رسیده‌ها",

  collections: "مجموعه‌ها",

  latest: "جدیدترین مجموعه",

  clothing: "پوشاک",

  suits: "کت‌وشلوار",

  blazers: "بلیزر",

  tuxedos: "تاکسیدو",

  waistcoats: "جلیقه",

  shirts: "پیراهن",

  polos: "پولوشرت",

  "t-shirts": "تی‌شرت",

  knitwear: "پوشاک بافت",

  trousers: "شلوار پارچه‌ای",

  denim: "جین",

  chinos: "چینو",

  shorts: "شلوارک",

  coats: "پالتو",

  jackets: "کت و کاپشن",

  leather: "چرم",

  overshirts: "اورشرت",

  fragrance: "عطر",

  extrait: "اکستریت دو پرفیوم",

  "eau-de-parfum": "ادو پرفیوم",

  discovery: "ست‌های اکتشافی",

  woody: "چوبی",

  amber: "عنبری",

  fresh: "تازه",

  "noir-absolu": "نوآر ابسولو",

  "vetiver-eclat": "وتیور اکلا",

  "santal-royal": "سانتال رویال",

  "oud-essence": "عود اسنس",

  accessories: "اکسسوری",

  bags: "کیف‌ها",

  briefcases: "کیف اداری",

  wallets: "کیف پول",

  belts: "کمربند",

  footwear: "کفش",

  loafers: "لوفر",

  oxfords: "آکسفورد",

  sneakers: "کتانی",

  boots: "بوت",

  eyewear: "عینک",

  ties: "کراوات",

  "pocket-squares": "پوشت",

  watches: "ساعت",

  house: "خانه نجیب‌زاده",

  craftsmanship: "هنر ساخت",

  materials: "متریال‌ها",

  appointments: "قرار اختصاصی",

  "our-story": "داستان ما",

  heritage: "میراث",

  journal: "مجله",

  stores: "فروشگاه‌ها",
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
  const menuSections = useStorefrontMenuSections();

  const [open, setOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState(EMPTY_MENU_SECTION.id);
  const [mobileOpen, setMobileOpen] = useState<string | null>(
    EMPTY_MENU_SECTION.id,
  );
  const [hoveredSubcategory, setHoveredSubcategory] = useState<string | null>(
    null,
  );

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedScrollPosition = useRef(0);

  const active = useMemo(
    () =>
      menuSections.find((section) => section.id === activeId) ??
      menuSections[0] ??
      EMPTY_MENU_SECTION,
    [activeId, menuSections],
  );

  const resolvedActiveId = active.id;
  const resolvedMobileOpen =
    mobileOpen && menuSections.some((section) => section.id === mobileOpen)
      ? mobileOpen
      : (menuSections[0]?.id ?? EMPTY_MENU_SECTION.id);

  const breadcrumbs = useMemo(() => {
    if (!pathname || pathname === "/") {
      return [];
    }

    const segments = pathname.split("/").filter(Boolean);

    return segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      let generatedLabel = segment.replaceAll("-", " ");

      try {
        generatedLabel = decodeURIComponent(generatedLabel);
      } catch {
        // Keep the raw route segment when it is not valid URI-encoded text.
      }

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
    overlayTone === "dark" ? "text-white" : "text-white";
  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/admin")
  ) {
    return null;
  }
  return (
    <>
      <header
        dir="rtl"
        lang="fa"
        className={cx(
          "fixed inset-x-0 top-0 z-[999999999]",
          "h-[70px] md:h-[78px]",
          "border-b",
          "transition-[background-color,border-color,box-shadow,color,backdrop-filter]",
          "duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
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
               aria-expanded={open}
              aria-controls="najibzadeh-luxury-menu"
              aria-label={open ? "بستن منو" : "باز کردن منو"}
              onClick={toggleMenu}
              icon={open ? <CloseIcon /> : <MenuIcon />}
              iconPosition="right"
              className={cx(
                "h-11 !min-h-0 !border-0 !bg-transparent !px-0 !text-current",
                "gap-3 !tracking-normal",
                "transition-opacity duration-200 hover:!border-0 hover:!bg-transparent hover:opacity-60",
                readableNavbar
                  ? NAVBAR_SURFACE_CHROME_CLASSES
                  : NAVBAR_OVERLAY_CHROME_CLASSES,
              )}
            >
            
            </Button>
          </div>

          <Link
            href="/"
            onClick={hideMenu}
            aria-label="صفحه اصلی نجیب‌زاده"
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
                   
                 "/assets/images/logo.png"
              }
              alt="نجیب‌زاده"
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
                label="حساب کاربری"
                onReadableSurface={readableNavbar}
              >
                <ProfileIcon />
              </NavAction>
            </div>

            <div className="hidden md:block">
              <NavAction
                href="/wishlist"
                label="علاقه‌مندی‌ها"
                onReadableSurface={readableNavbar}
              >
                <HeartIcon />
              </NavAction>
            </div>

            <NavAction
              href="/cart"
              label="سبد خرید"
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
          dir="rtl"
          lang="fa"
          aria-label="مسیر صفحه"
          className={cx(
            "absolute inset-x-0 top-[70px] z-[80] md:top-[78px]",
            scrolled ? themeClasses.textAccent : overlayBreadcrumbClass,
          )}
        >
          <div className="mx-auto max-w-[1920px] overflow-x-auto px-4 py-3 text-right sm:px-6 lg:px-10">
            <ol className="flex items-center gap-2 whitespace-nowrap text-[9px] font-medium tracking-normal">
              <li>
                <Link
                  href="/"
                  className="opacity-45 transition-opacity hover:opacity-100"
                >
                  خانه
                </Link>
              </li>

              {breadcrumbs.map((breadcrumb, index) => {
                const last = index === breadcrumbs.length - 1;

                return (
                  <li key={breadcrumb.href} className="flex items-center gap-2">
                    <span aria-hidden className="opacity-25">
                      ‹
                    </span>
                    {last ? (
                      <span
                        aria-current="page"
                        className="font-semibold opacity-90"
                      >
                        {breadcrumb.label}
                      </span>
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
          dir="rtl"
          lang="fa"
          data-lenis-prevent=""
          aria-hidden={!open}
          aria-label="منوی اصلی فروشگاه"
          className={cx(
            "fixed inset-x-0 bottom-0 top-[70px] z-[990] md:top-[78px]",
            "transition-opacity duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            "motion-reduce:transition-none",
            menuVisible
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0",
          )}
        >
          <button
            type="button"
            aria-label="بستن منوی ناوبری"
            onClick={hideMenu}
            className={cx(
              "absolute inset-0 hidden bg-black/35 backdrop-blur-[3px] transition-opacity duration-300 lg:block",
              menuVisible ? "opacity-100" : "opacity-0",
            )}
          />

          <div
            className={cx(
              "relative mx-auto h-full max-w-[1920px] overflow-hidden",
              "transition-[transform,opacity] duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              "motion-reduce:transition-none",
              menuVisible
                ? "translate-y-0 opacity-100"
                : "-translate-y-3 opacity-0",
            )}
          >
            <div className="hidden h-[min(760px,calc(100vh-92px))] min-h-[560px] grid-cols-[270px_minmax(0,1fr)_390px] overflow-hidden border-t border-black/[0.06] bg-[#F7F5F0] shadow-[0_30px_90px_rgba(0,0,0,0.18)] dark:border-white/10 dark:bg-[#0E0E0E] lg:grid xl:grid-cols-[300px_minmax(0,1fr)_450px]">
              <aside className="flex min-h-0 flex-col bg-[#0C0C0C] text-white">
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 xl:px-7">
                  <p className="text-[9px] font-semibold tracking-[0.05em] text-white/45">
                    مجموعه‌ها
                  </p>
                  <span className="text-[8px] font-medium tabular-nums text-white/35">
                    {formatPersianNumber(menuSections.length, 2)}
                  </span>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 xl:px-4">
                  {menuSections.map((section, index) => {
                    const selected = resolvedActiveId === section.id;

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
                        aria-pressed={selected}
                        className={cx(
                          "group relative flex min-h-[72px] w-full items-center gap-4 px-4 text-right",
                          "transition-[background-color,transform] duration-300",
                          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/60 focus-visible:ring-inset",
                          selected
                            ? "bg-white/[0.075]"
                            : "hover:bg-white/[0.04]",
                        )}
                      >
                        <span
                          className={cx(
                            "absolute inset-y-3 right-0 w-px bg-white transition-opacity duration-300",
                            selected ? "opacity-100" : "opacity-0",
                          )}
                        />

                        <span className="w-6 shrink-0 text-[8px] font-medium tabular-nums tracking-[0.08em] text-white/35">
                          {formatPersianNumber(index + 1, 2)}
                        </span>

                        <span
                          className={cx(
                            "min-w-0 flex-1 text-[16px] font-semibold leading-7 tracking-[-0.015em] transition-all duration-300 xl:text-[18px]",
                            selected
                              ? "-translate-x-1 text-white"
                              : "text-white/62 group-hover:text-white/90",
                          )}
                        >
                          {localizeMenuText(section.title)}
                        </span>

                        <span
                          className={cx(
                            "transition-[opacity,transform] duration-300",
                            selected
                              ? "translate-x-0 opacity-100"
                              : "translate-x-1 opacity-0",
                          )}
                        >
                          <ArrowIcon />
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-white/10 p-5 xl:p-6">
                  <p className="mb-3 text-[9px] font-semibold tracking-[0.05em] text-white/35">
                    خدمات مشتریان
                  </p>
                  <div className="space-y-1">
                    <DarkUtilityLink href="/appointments" onClick={hideMenu}>
                      رزرو وقت اختصاصی
                    </DarkUtilityLink>
                    <DarkUtilityLink href="/stores" onClick={hideMenu}>
                      یافتن فروشگاه
                    </DarkUtilityLink>
                    <DarkUtilityLink href="/customer-care" onClick={hideMenu}>
                      پشتیبانی مشتریان
                    </DarkUtilityLink>
                  </div>
                </div>
              </aside>

              <section
                aria-label="جزئیات مجموعه"
                className="min-h-0 min-w-0 overflow-y-auto px-8 py-8 text-right xl:px-12 xl:py-10"
              >
                <div
                  key={active.id}
                  className="mx-auto flex min-h-full max-w-[920px] flex-col"
                >
                  <div className="flex items-start justify-between gap-8 border-b border-black/[0.09] pb-8 dark:border-white/10">
                    <div className="max-w-[620px]">
                      <div className="mb-4 flex items-center gap-3">
                        <span
                          className={cx(
                            "text-[9px] font-semibold tracking-[0.05em]",
                            themeClasses.textAccent,
                          )}
                        >
                          نجیب‌زاده / {localizeMenuText(active.title)}
                        </span>
                        <span className="h-px w-8 bg-current opacity-15" />
                      </div>

                      <h2
                        className={cx(
                          "text-[36px] font-bold leading-[1.18] tracking-[-0.025em] xl:text-[46px]",
                          themeClasses.textPrimary,
                        )}
                      >
                        {localizeMenuText(active.title)}
                      </h2>

                      <p
                        className={cx(
                          "mt-4 max-w-[580px] text-[13px] leading-7 xl:text-[14px]",
                          themeClasses.textSecondary,
                        )}
                      >
                        {localizeMenuText(active.subtitle)}
                      </p>
                    </div>

                    <Button
                      href={active.href}
                      onClick={hideMenu}
                      variant="outline"
                      size="md"
                      icon={<ArrowIcon />}
                      iconPosition="left"
                      className="mt-1 !tracking-normal !text-[10px]"
                    >
                      مشاهده مجموعه
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
                          "text-[9px] font-semibold tracking-[0.04em]",
                          themeClasses.textSoft,
                        )}
                      >
                        دسترسی سریع
                      </p>

                      <div className="flex flex-wrap justify-start gap-2">
                        {QUICK_LINKS.map((item) => (
                          <QuickAccessLink
                            key={item.href}
                            href={item.href}
                            onClick={hideMenu}
                          >
                            {localizeMenuText(item.label)}
                          </QuickAccessLink>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <aside className="min-h-0 border-r border-black/[0.08] bg-[#EFEBE4] p-4 dark:border-white/10 dark:bg-[#151515] xl:p-5">
                <LuxuryEditorialCard
                  key={active.image}
                  section={active}
                  onClick={hideMenu}
                />
              </aside>
            </div>

            <div
              className={cx(
                "h-full overflow-y-auto px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-3 text-right sm:px-6 lg:hidden",
                themeClasses.megaMenu,
              )}
            >
              <div className="flex min-h-[52px] items-center justify-between border-b border-black/[0.08] dark:border-white/10">
                <div>
                  <p
                    className={cx(
                      "text-[9px] font-semibold tracking-[0.05em]",
                      themeClasses.textSoft,
                    )}
                  >
                    منوی نجیب‌زاده
                  </p>
                  <p
                    className={cx(
                      "mt-1 text-[17px] font-bold tracking-[-0.015em]",
                      themeClasses.textPrimary,
                    )}
                  >
                    مجموعه‌ها
                  </p>
                </div>
              </div>

              <div className="mt-3 overflow-hidden border border-black/[0.08] dark:border-white/10">
                {menuSections.map((section, index) => {
                  const expanded = resolvedMobileOpen === section.id;

                  return (
                    <div
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
                          "flex min-h-[70px] w-full items-center gap-3 px-4 text-right sm:px-5",
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
                          {formatPersianNumber(index + 1, 2)}
                        </span>
                        <span
                          className={cx(
                            "min-w-0 flex-1 text-[17px] font-bold leading-7 tracking-[-0.015em]",
                            themeClasses.textPrimary,
                          )}
                        >
                          {localizeMenuText(section.title)}
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
                                alt={localizeMenuText(section.imageLabel)}
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025]"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 text-white">
                                <div>
                                  <p className="text-[9px] font-semibold tracking-[0.04em] text-white/55">
                                    منتخب
                                  </p>
                                  <p className="mt-1 text-[18px] font-bold leading-7 tracking-[-0.015em]">
                                    {localizeMenuText(section.imageLabel)}
                                  </p>
                                </div>
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/30 bg-white/10 backdrop-blur-md">
                                  <ArrowIcon />
                                </span>
                              </div>
                            </Link>

                            <p
                              className={cx(
                                "mt-4 max-w-[420px] text-[12px] leading-6",
                                themeClasses.textSecondary,
                              )}
                            >
                              {localizeMenuText(section.subtitle)}
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
                    </div>
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
                     icon={item.icon}
                    iconPosition="right"
                    className="!min-h-[54px] !px-3 !text-[10px] !tracking-normal"
                  >
                    {localizeMenuText(item.label)}
                  </Button>
                ))}
              </div>

              <div className="mt-6 border-t border-black/[0.08] pt-5 dark:border-white/10">
                <p
                  className={cx(
                    "mb-3 text-[9px] font-semibold tracking-[0.04em]",
                    themeClasses.textSoft,
                  )}
                >
                  خدمات مشتریان
                </p>
                <div className="grid gap-1 sm:grid-cols-3">
                  <LightUtilityLink href="/appointments" onClick={hideMenu}>
                    رزرو وقت اختصاصی
                  </LightUtilityLink>
                  <LightUtilityLink href="/stores" onClick={hideMenu}>
                    یافتن فروشگاه
                  </LightUtilityLink>
                  <LightUtilityLink href="/customer-care" onClick={hideMenu}>
                    پشتیبانی مشتریان
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
    <div className="text-right">
      <div className="mb-4 flex items-center gap-2">
        <span
          className={cx(
            "text-[8px] font-semibold tabular-nums",
            themeClasses.textSoft,
          )}
        >
          {formatPersianNumber(index + 1, 2)}
        </span>
        <p
          className={cx(
            "text-[9px] font-semibold tracking-[0.04em]",
            themeClasses.textSoft,
          )}
        >
          {localizeMenuText(group.title)}
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
                  "group inline-flex min-h-9 items-center gap-2 text-[13px] font-medium leading-6 tracking-normal",
                  "transition-[opacity,transform] duration-300",
                  dimmed ? "opacity-30" : "opacity-100",
                  selected && "-translate-x-1",
                  themeClasses.textPrimary,
                  themeClasses.focusRing,
                )}
              >
                <span className="relative">
                  {localizeMenuText(item.label)}
                  <span
                    className={cx(
                      "absolute -bottom-0.5 right-0 h-px bg-current transition-[width,opacity] duration-300",
                      selected ? "w-full opacity-40" : "w-0 opacity-0",
                    )}
                  />
                </span>

                {item.badge && (
                  <span
                    className={cx(
                      "text-[8px] font-semibold tracking-normal",
                      themeClasses.textAccent,
                    )}
                  >
                    {localizeBadge(item.badge)}
                  </span>
                )}

                <span
                  className={cx(
                    "translate-x-1 opacity-0 transition-[opacity,transform] duration-300",
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
    <div className="text-right">
      <p
        className={cx(
          "mb-2 text-[9px] font-semibold tracking-[0.04em]",
          themeClasses.textAccent,
        )}
      >
        {localizeMenuText(group.title)}
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
              {localizeMenuText(item.label)}
              {item.badge && (
                <span
                  className={cx(
                    "text-[8px] font-semibold tracking-normal",
                    themeClasses.textAccent,
                  )}
                >
                  {localizeBadge(item.badge)}
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
          alt={localizeMenuText(section.imageLabel)}
          fill
          sizes="(min-width: 1280px) 450px, 390px"
          loading="eager"
          decoding="async"
          onError={() => setFailedSrc(section.image)}
          className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
        />
      ) : (
        <div className="absolute inset-0 bg-[#D9D4CC] dark:bg-[#222]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/5" />
      <div className="absolute inset-x-0 bottom-0 p-6 text-right text-white xl:p-7">
        <div className="mb-3 flex items-center gap-3">
          <span className="text-[9px] font-semibold tracking-[0.05em] text-white/55">
            انتخاب سردبیری
          </span>
          <span className="h-px w-8 bg-white/30" />
        </div>

        <div className="flex items-end justify-between gap-6">
          <div>
            <h3 className="max-w-[300px] text-[27px] font-bold leading-[1.25] tracking-[-0.02em] xl:text-[31px]">
              {localizeMenuText(section.imageLabel)}
            </h3>
            <p className="mt-3 max-w-[320px] text-[11px] leading-6 text-white/62">
              {localizeMenuText(section.subtitle)}
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
            "pointer-events-none absolute left-0 top-0 flex min-h-[15px] min-w-[15px] items-center justify-center px-[3px] text-[7px] font-semibold leading-none",
            onReadableSurface
              ? "bg-[#0B0B0B] text-white dark:bg-white dark:text-[#0B0B0B]"
              : "bg-white text-black",
          )}
        >
          {formatPersianNumber(badge)}
        </span>
      )}
    </span>
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
      variant="cream"
      size="sm"
      className="!min-h-9 !px-3.5 !text-[9px] !tracking-normal"
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
      className="group flex min-h-8 w-fit items-center gap-2 text-right text-[10px] font-medium text-white/58 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/60"
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
        "flex min-h-10 items-center text-right text-[10px] font-medium transition-opacity hover:opacity-55",
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
      <path d="M19 12H5" />
      <path d="m10 7-5 5 5 5" />
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
