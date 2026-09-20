"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { Button } from "@/components/ui/Button";
import { useStorefrontMenuSections } from "@/lib/catalog/storefront-client";
import { brandColors, lightTokens } from "@/theme/theme-colors";

/* =============================================================================
   TYPES
============================================================================= */

type FooterLink = {
  label: string;
  href: string;
  description?: string;
};

type FooterGroup = {
  id: string;
  title: string;
  links: FooterLink[];
  featured?: boolean;
};

type SocialLink = {
  id: string;
  label: string;
  href: string;
  code: string;
};

/* =============================================================================
   STATIC DATA
============================================================================= */

const STATIC_FOOTER_GROUPS: FooterGroup[] = [
  {
    id: "services",
    title: "خدمات مشتریان",
    links: [
      { label: "مشاوره اختصاصی", href: "/contact-us#appointment" },
      { label: "یافتن فروشگاه", href: "/contact-us#location" },
      { label: "ارسال و مرجوعی", href: "/terms-conditions#shipping-delivery" },
      { label: "پشتیبانی مشتریان", href: "/contact-us#services" },
    ],
  },
  {
    id: "house",
    title: "خانه نجیب‌زاده",
    links: [
      { label: "داستان ما", href: "/about-us" },
      { label: "مجله", href: "/blog" },
      { label: "کمپین‌ها", href: "/shop?collection=new-season" },
    ],
  },
  {
    id: "information",
    title: "اطلاعات",
    links: [
      { label: "تماس با ما", href: "/contact-us" },
      { label: "حریم خصوصی", href: "/privacy" },
      { label: "قوانین و مقررات", href: "/terms-conditions" },
      { label: "سیاست کوکی‌ها", href: "/cookies" },
    ],
  },
];

const SOCIAL_LINKS: SocialLink[] = [
  {
    id: "instagram",
    label: "اینستاگرام",
    href: "https://instagram.com/",
    code: "IG",
  },
  {
    id: "linkedin",
    label: "لینکدین",
    href: "https://linkedin.com/",
    code: "IN",
  },
  {
    id: "pinterest",
    label: "پینترست",
    href: "https://pinterest.com/",
    code: "PT",
  },
];

const FOOTER_THEME_VARS = {
  "--footer-black": brandColors.black.hex,
  "--footer-cream": brandColors.cream.hex,
  "--footer-white": brandColors.white.hex,
  "--footer-copper": brandColors.copper.hex,
  "--footer-muted": lightTokens.textMuted,
  "--footer-soft": lightTokens.textSoft,
  "--footer-border": lightTokens.border,
} as CSSProperties;

/* =============================================================================
   HELPERS
============================================================================= */

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function toPersianDigits(value: string | number) {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

function formatIndex(index: number) {
  return toPersianDigits(String(index).padStart(2, "0"));
}

function footerLinkKey(groupId: string, link: FooterLink, index: number) {
  return `${groupId}-${link.href}-${link.label}-${index}`;
}

function shouldHideFooter(pathname: string | null) {
  if (!pathname) return false;

  return (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/admin")
  );
}

/* =============================================================================
   PUBLIC FOOTER WRAPPER
   Keeps the category query completely out of auth/admin routes.
============================================================================= */

export default function Footer() {
  const pathname = usePathname();

  if (shouldHideFooter(pathname)) return null;

  return <StorefrontFooter />;
}

/* =============================================================================
   STOREFRONT FOOTER
============================================================================= */

function StorefrontFooter() {
  const year = new Date().getFullYear();
  const menuSections = useStorefrontMenuSections();

  const footerGroups = useMemo<FooterGroup[]>(() => {
    const seen = new Set<string>();

    const categoryLinks = menuSections
      .filter((section) => {
        if (
          !section?.href ||
          section.href === "/shop" ||
          seen.has(section.href)
        ) {
          return false;
        }

        seen.add(section.href);
        return true;
      })
      .slice(0, 8)
      .map((section) => {
        const childLabels = section.groups
          .flatMap((group) => group.items)
          .map((item) => item.label)
          .filter(Boolean)
          .slice(0, 3);

        return {
          label: section.title,
          href: section.href,
          description:
            childLabels.length > 0
              ? childLabels.join("، ")
              : section.subtitle || undefined,
        } satisfies FooterLink;
      });

    const catalogLinks: FooterLink[] =
      categoryLinks.length > 0
        ? [
            ...categoryLinks,
            {
              label: "مشاهده همه محصولات",
              href: "/shop",
              description: "ورود به فروشگاه نجیب‌زاده",
            },
          ]
        : [
            {
              label: "همه محصولات",
              href: "/shop",
              description: "مجموعه‌های فعال فروشگاه اینجا نمایش داده می‌شوند.",
            },
          ];

    return [
      {
        id: "catalog",
        title: "دسته‌بندی‌ها",
        links: catalogLinks,
        featured: true,
      },
      ...STATIC_FOOTER_GROUPS,
    ];
  }, [menuSections]);

  function scrollToTop() {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }

  return (
    <footer
      dir="rtl"
      lang="fa"
      style={FOOTER_THEME_VARS}
      className="relative w-full overflow-visible bg-[var(--footer-cream)] text-[var(--footer-black)]"
    >
      {/* =====================================================================
          DYNAMIC CATEGORY DIRECTORY + STATIC NAVIGATION
      ===================================================================== */}

      <section
        aria-label="راهنمای دسته‌بندی‌ها و پیوندهای سایت"
        className="border-t border-black/[0.10]"
      >
        <div className="mx-auto hidden w-full max-w-[1920px] md:grid md:grid-cols-[1.45fr_repeat(3,minmax(0,1fr))]">
          {footerGroups.map((group, index) => (
            <DesktopFooterGroup
              key={group.id}
              group={group}
              index={formatIndex(index + 1)}
              isLast={index === footerGroups.length - 1}
            />
          ))}
        </div>

        <div className="mx-auto w-full max-w-[1920px] md:hidden">
          {footerGroups.map((group, index) => (
            <MobileFooterGroup
              key={group.id}
              group={group}
              index={formatIndex(index + 1)}
              defaultOpen={group.featured}
            />
          ))}
        </div>
      </section>

      {/* =====================================================================
          SOCIAL + SUPPORT UTILITY BAR
      ===================================================================== */}

      <section className="bg-[#0C0C0C] text-[#F7F5F0]">
        <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-7 lg:px-10 xl:px-14">
          <div className="grid border-b border-white/10 py-7 md:grid-cols-[1fr_auto] md:items-center md:gap-10 lg:py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <p className="shrink-0 text-[8px] font-semibold tracking-[0.08em] text-white/[0.42]">
                همراه ما باشید
              </p>

              <nav
                aria-label="شبکه‌های اجتماعی نجیب‌زاده"
                className="flex flex-wrap gap-x-1 gap-y-2"
              >
                {SOCIAL_LINKS.map((social) => (
                  <SocialTextLink key={social.id} social={social} />
                ))}
              </nav>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-5 md:mt-0 md:justify-end">
              <Button
                href="/contact-us#services"
                variant="outline"
                size="sm"
                icon={<ArrowLeftIcon />}
                iconPosition="left"
                className="!border-white/[0.18] !bg-transparent !text-white hover:!border-white hover:!bg-white hover:!text-black"
              >
                خدمات مشتریان
              </Button>

              <span
                aria-label="زبان فعلی: فارسی"
                className="text-[8px] font-medium text-white/[0.48]"
              >
                فارسی
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          IMMERSIVE BRAND WORDMARK
      ===================================================================== */}

      <WordmarkStage />

      {/* =====================================================================
          LEGAL END CAP
      ===================================================================== */}

      <section className="relative bg-[#0C0C0C] text-[#F7F5F0]">
        <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-7 lg:px-10 xl:px-14">
          <div className="flex flex-col gap-5 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between lg:py-7">
            <p className="text-[8px] font-medium text-white/[0.38]">
              © {toPersianDigits(year)} نجیب‌زاده. همه حقوق محفوظ است.
            </p>

            <nav
              aria-label="پیوندهای حقوقی"
              className="flex flex-wrap items-center gap-x-4 gap-y-3"
            >
              <LegalLink href="/privacy">حریم خصوصی</LegalLink>
              <Separator />
              <LegalLink href="/terms-conditions">قوانین و مقررات</LegalLink>
              <Separator />
              <LegalLink href="/cookies">سیاست کوکی‌ها</LegalLink>
            </nav>

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<ArrowUpIcon />}
              iconPosition="left"
              onClick={scrollToTop}
              aria-label="بازگشت به ابتدای صفحه"
              className="!border-white/[0.18] !bg-transparent !text-white hover:!border-white hover:!bg-white hover:!text-black"
            >
              بازگشت به بالا
            </Button>
          </div>
        </div>
      </section>
    </footer>
  );
}

/* =============================================================================
   WORDMARK STAGE
============================================================================= */

function WordmarkStage() {
  const stageRef = useRef<HTMLElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const surface = surfaceRef.current;

    if (!stage || !surface) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let frame: number | null = null;

    const update = () => {
      frame = null;

      const rect = stage.getBoundingClientRect();
      const viewport = window.innerHeight;
      const travel = Math.max(stage.offsetHeight - viewport, 1);
      const distance = Math.min(Math.max(-rect.top, 0), travel);
      const progress = reduceMotion ? 0.5 : distance / travel;

      const glow = Math.sin(progress * Math.PI);
      const scale = 0.955 + glow * 0.035;
      const shine = progress * 100;
      const lightX = -42 + progress * 84;
      const lightOpacity = 0.08 + glow * 0.16;
      const whiteGlow = 8 + glow * 16;
      const copperGlow = 18 + glow * 30;

      surface.style.setProperty("--wordmark-scale", scale.toFixed(4));
      surface.style.setProperty("--wordmark-shine", `${shine.toFixed(2)}%`);
      surface.style.setProperty("--wordmark-light-x", `${lightX.toFixed(2)}vw`);
      surface.style.setProperty(
        "--wordmark-light-opacity",
        lightOpacity.toFixed(4),
      );
      surface.style.setProperty(
        "--wordmark-white-glow",
        `${whiteGlow.toFixed(2)}px`,
      );
      surface.style.setProperty(
        "--wordmark-copper-glow",
        `${copperGlow.toFixed(2)}px`,
      );
    };

    const requestUpdate = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(update);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      ref={stageRef}
      aria-label="نمایش هویت بصری نجیب‌زاده"
      className="relative h-[180svh] bg-[#050505] motion-reduce:h-[100svh]"
    >
      <div
        ref={surfaceRef}
        className="sticky top-0 z-[5000] flex h-[100svh] w-full items-center justify-center overflow-hidden bg-[#050505]"
        style={
          {
            "--wordmark-scale": "0.955",
            "--wordmark-shine": "0%",
            "--wordmark-light-x": "-42vw",
            "--wordmark-light-opacity": "0.08",
            "--wordmark-white-glow": "8px",
            "--wordmark-copper-glow": "18px",
          } as CSSProperties
        }
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 w-[34vw] min-w-[180px] -translate-x-1/2 blur-[70px] motion-reduce:hidden"
          style={{
            opacity: "var(--wordmark-light-opacity)",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(178,125,73,0.08) 28%, rgba(247,245,240,0.28) 50%, rgba(178,125,73,0.08) 72%, transparent 100%)",
            transform:
              "translate3d(var(--wordmark-light-x), 0, 0) translateX(-50%)",
          }}
        />

        <Link
          href="/"
          aria-label="صفحه اصلی نجیب‌زاده"
          className="relative z-10 block w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white/70"
        >
          <span
            dir="ltr"
            className="block whitespace-nowrap text-center text-[clamp(34px,9.6vw,205px)] font-medium uppercase leading-[0.78] tracking-[-0.07em] motion-reduce:transform-none"
            style={{
              transform: "scale(var(--wordmark-scale))",
              transformOrigin: "center",
              backgroundImage:
                "linear-gradient(90deg, #77736c 0%, #e9e5dc 24%, #ffffff 43%, #ad7a4b 50%, #ffffff 57%, #e9e5dc 76%, #77736c 100%)",
              backgroundSize: "230% 100%",
              backgroundPosition: "var(--wordmark-shine) 50%",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
              filter:
                "drop-shadow(0 0 var(--wordmark-white-glow) rgba(255,255,255,0.10)) drop-shadow(0 0 var(--wordmark-copper-glow) rgba(173,122,75,0.12))",
            }}
          >
            NAJIBZADEH
          </span>
        </Link>
      </div>
    </section>
  );
}

/* =============================================================================
   DESKTOP NAVIGATION GROUP
============================================================================= */

function DesktopFooterGroup({
  group,
  index,
  isLast,
}: {
  group: FooterGroup;
  index: string;
  isLast: boolean;
}) {
  return (
    <section
      aria-labelledby={`footer-desktop-${group.id}`}
      className={cx(
        "min-h-[340px] px-7 py-10 text-right lg:min-h-[370px] lg:px-9 lg:py-12 xl:px-12 xl:py-14",
        !isLast && "border-l border-black/[0.10]",
      )}
    >
      <div className="mb-8 flex items-center justify-between gap-5">
        <h3
          id={`footer-desktop-${group.id}`}
          className="text-[9px] font-bold tracking-[0.04em] text-black/[0.88]"
        >
          {group.title}
        </h3>

        <span className="text-[8px] font-medium tabular-nums text-black/[0.30]">
          {index}
        </span>
      </div>

      <ul
        className={cx(
          group.featured
            ? "grid grid-cols-2 gap-x-6 gap-y-1 xl:gap-x-8"
            : "space-y-0.5",
        )}
      >
        {group.links.map((link, linkIndex) => (
          <li
            key={footerLinkKey(group.id, link, linkIndex)}
            className="min-w-0"
          >
            {group.featured ? (
              <CategoryFooterLink link={link} />
            ) : (
              <FooterNavLink href={link.href}>{link.label}</FooterNavLink>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function CategoryFooterLink({ link }: { link: FooterLink }) {
  return (
    <Link
      href={link.href}
      className="group/category block min-h-[62px] border-b border-black/[0.08] py-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black/[0.60]"
    >
      <span className="flex items-center justify-between gap-3">
        <span className="truncate text-[12px] font-semibold text-black/[0.72] transition-colors duration-200 group-hover/category:text-black">
          {link.label}
        </span>
        <span className="shrink-0 text-black/[0.28] transition-[color,transform] duration-200 group-hover/category:-translate-x-0.5 group-hover/category:text-[var(--footer-copper)] motion-reduce:transform-none">
          <ArrowLeftIcon />
        </span>
      </span>

      {link.description && (
        <span className="mt-1.5 block truncate text-[8px] leading-5 text-black/[0.38]">
          {link.description}
        </span>
      )}
    </Link>
  );
}

/* =============================================================================
   MOBILE NAVIGATION GROUP
============================================================================= */

function MobileFooterGroup({
  group,
  index,
  defaultOpen = false,
}: {
  group: FooterGroup;
  index: string;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group border-b border-black/[0.10]">
      <summary className="flex min-h-[68px] cursor-pointer list-none items-center gap-4 px-5 text-right focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-black/[0.60] sm:px-7 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1 text-[15px] font-bold tracking-[-0.015em]">
          {group.title}
        </span>

        <span className="w-6 shrink-0 text-center text-[8px] font-medium tabular-nums text-black/[0.30]">
          {index}
        </span>

        <span className="relative size-4 shrink-0 text-black/[0.55]">
          <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-current" />
          <span className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-current transition-opacity duration-200 group-open:opacity-0" />
        </span>
      </summary>

      <div className="border-t border-black/[0.07] px-5 pb-7 pt-4 sm:px-7">
        <ul
          className={cx(
            group.featured
              ? "grid grid-cols-1 gap-1 min-[430px]:grid-cols-2 min-[430px]:gap-x-5"
              : "space-y-0.5",
          )}
        >
          {group.links.map((link, linkIndex) => (
            <li key={footerLinkKey(group.id, link, linkIndex)}>
              {group.featured ? (
                <CategoryFooterLink link={link} />
              ) : (
                <FooterNavLink href={link.href}>{link.label}</FooterNavLink>
              )}
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

/* =============================================================================
   LINKS
============================================================================= */

function FooterNavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group/link flex min-h-9 w-fit items-center text-[12px] font-medium text-black/[0.54] transition-[color,transform] duration-[250ms] hover:-translate-x-1 hover:text-black focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black/[0.60] motion-reduce:transform-none"
    >
      <span>{children}</span>
      <span className="mr-0 h-px w-0 bg-black/[0.72] transition-[width,margin] duration-[250ms] group-hover/link:mr-2 group-hover/link:w-4" />
    </Link>
  );
}

function SocialTextLink({ social }: { social: SocialLink }) {
  return (
    <Button
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`صفحه ${social.label} نجیب‌زاده`}
      variant="outline"
      size="sm"
      uppercase={false}
      className="!min-h-9 !border-0 !bg-transparent !px-2.5 !text-white/[0.58] !tracking-normal hover:!border-0 hover:!bg-white/[0.06] hover:!text-white"
    >
      <span className="flex items-center gap-2.5">
        <span className="text-[10px] font-medium">{social.label}</span>
        <span
          dir="ltr"
          className="text-[7px] font-semibold uppercase tracking-[0.16em] text-white/[0.32]"
        >
          {social.code}
        </span>
      </span>
    </Button>
  );
}

function LegalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-[8px] font-semibold text-white/[0.42] transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/[0.65]"
    >
      {children}
    </Link>
  );
}

function Separator() {
  return <span aria-hidden="true" className="h-3 w-px bg-white/[0.14]" />;
}

/* =============================================================================
   ICONS
============================================================================= */

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="size-3.5"
    >
      <path
        d="M13.5 8H3M6.5 4.5L3 8L6.5 11.5"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="size-3.5"
    >
      <path
        d="M8 13V3M4.5 6.5L8 3L11.5 6.5"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
