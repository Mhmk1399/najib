"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import Image from "next/image";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

import { Button } from "@/components/ui/Button";

import {
  getHtmlLang,
  getLocaleDirection,
  localeLabels,
  type Locale,
} from "@/lib/i18n/config";

import {
  getLocaleFromPathname,
  localizedHref,
  localizedPath,
  splitLocalePathname,
} from "@/lib/i18n/routes";

import { formatShellNumber, shellCopy } from "@/lib/i18n/shell-copy";

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

const SOCIAL_LINKS: SocialLink[] = [
  {
    id: "instagram",

    label: "اینستاگرام",

    href: "https\://instagram.com/",

    code: "IG",
  },

  {
    id: "linkedin",

    label: "لینکدین",

    href: "https\://linkedin.com/",

    code: "IN",
  },

  {
    id: "pinterest",

    label: "پینترست",

    href: "https\://pinterest.com/",

    code: "PT",
  },
];

const SOCIAL_LABELS: Record<Locale, Record<string, string>> = {
  fa: {
    instagram: "اینستاگرام",

    linkedin: "لینکدین",

    pinterest: "پینترست",
  },

  en: {
    instagram: "Instagram",

    linkedin: "LinkedIn",

    pinterest: "Pinterest",
  },

  ar: {
    instagram: "إنستغرام",

    linkedin: "لينكدإن",

    pinterest: "بنترست",
  },
};

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

const subscribeToHydration = () => () => undefined;

const getHydratedClientSnapshot = () => true;

const getHydratedServerSnapshot = () => false;

function formatIndex(index: number, locale: Locale) {
  return formatShellNumber(index, locale, 2);
}

function footerLinkKey(groupId: string, link: FooterLink, index: number) {
  return `${groupId}-${link.href}-${link.label}-${index}`;
}

function shouldHideFooter(pathname: string | null) {
  if (!pathname) return false;

  const { pathnameWithoutLocale } = splitLocalePathname(pathname);

  return (
    pathnameWithoutLocale === "/login" ||
    pathnameWithoutLocale === "/signup" ||
    pathnameWithoutLocale.startsWith("/admin")
  );
}

/* =============================================================================



   PUBLIC FOOTER WRAPPER



   Keeps the storefront footer completely out of auth/admin routes.



============================================================================= */

export default function Footer({ initialLocale }: { initialLocale: Locale }) {
  const pathname = usePathname();

  const hydrated = useSyncExternalStore(
    subscribeToHydration,

    getHydratedClientSnapshot,

    getHydratedServerSnapshot,
  );

  const locale = hydrated ? getLocaleFromPathname(pathname) : initialLocale;

  if (shouldHideFooter(pathname)) return null;

  return <StorefrontFooter locale={locale} />;
}

/* =============================================================================



   STOREFRONT FOOTER



============================================================================= */

function StorefrontFooter({ locale }: { locale: Locale }) {
  const year = new Date().getFullYear();

  const direction = getLocaleDirection(locale);

  const htmlLang = getHtmlLang(locale);

  const copy = shellCopy[locale];

  const homeHref = localizedPath("/", locale);

  const privacyHref = localizedHref("/privacy", locale);

  const termsHref = localizedHref("/terms-conditions", locale);

  const cookiesHref = localizedHref("/cookies", locale);

  const footerGroups = useMemo<FooterGroup[]>(() => {
    const toLocalizedHref = (href: string) => localizedHref(href, locale);

    return copy.footer.staticGroups.map((group) => ({
      ...group,
      links: group.links.map((link) => ({
        ...link,
        href: toLocalizedHref(link.href),
      })),
    }));
  }, [copy, locale]);

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
      dir={direction}
      lang={htmlLang}
      style={FOOTER_THEME_VARS}
      className="relative w-full overflow-hidden bg-[var(--footer-cream)] text-[var(--footer-black)]"
    >
      {/* =====================================================================

          BRAND INTRO / LOGO FIRST

      ===================================================================== */}

      <section className="relative overflow-hidden border-t border-black/[0.10] bg-[var(--footer-cream)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(173,99,60,0.08),transparent_30%),radial-gradient(circle_at_92%_20%,rgba(255,255,255,0.72),transparent_28%)]"
        />

        <div className="relative mx-auto w-full max-w-[1760px] px-5 py-8 sm:px-7 sm:py-9 lg:px-10 lg:py-10 xl:px-12">
          <div className="flex flex-col items-center">
            <div className="flex min-w-0 flex-col items-center text-center">
              <Link
                href={homeHref}
                aria-label={copy.footer.homeAria}
                className="group/logo inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black/60"
              >
                <span className="relative grid size-20 shrink-0 place-items-center overflow-hidden sm:size-24">
                  <Image
                    src="/assets/images/logoblack.png"
                    alt=""
                    width={500}
                    height={500}
                    sizes="96px"
                    className="size-full object-contain"
                  />
                </span>
              </Link>
            </div>

            <div className="mt-8 grid w-full gap-7 border-t border-black/[0.09] pt-6 ">
              <div className="flex flex-col items-center gap-3 lg:items-center">
                <nav
                  aria-label={copy.footer.socialAria}
                  className="flex items-center justify-center gap-2"
                >
                  {SOCIAL_LINKS.map((social) => (
                    <SocialTextLink
                      key={social.id}
                      social={social}
                      label={SOCIAL_LABELS[locale][social.id] ?? social.label}
                      ariaLabel={copy.footer.socialPageAria(
                        SOCIAL_LABELS[locale][social.id] ?? social.label,
                      )}
                    />
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================

          STATIC NAVIGATION

      ===================================================================== */}

      <section className="border-t border-black/[0.10] bg-black/[0.018]">
        <div className="mx-auto hidden w-full max-w-[1760px] md:grid md:grid-cols-3 md:px-5 lg:px-8 xl:px-10">
          {footerGroups.map((group, index) => (
            <DesktopFooterGroup
              key={group.id}
              group={group}
              index={formatIndex(index + 1, locale)}
              isLast={index === footerGroups.length - 1}
            />
          ))}
        </div>

        <div className="mx-auto w-full max-w-[1760px] md:hidden">
          {footerGroups.map((group, index) => (
            <MobileFooterGroup
              key={group.id}
              group={group}
              index={formatIndex(index + 1, locale)}
            />
          ))}
        </div>
      </section>

      {/* =====================================================================

          LEGAL END CAP

      ===================================================================== */}

      <section className="relative bg-[#0C0C0C] text-[#F7F5F0] pb-[max(18px,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-[1760px] px-5 sm:px-7 lg:px-10 xl:px-12">
          <div className="grid gap-4 border-t border-white/10 py-5 sm:grid-cols-[1fr_auto] sm:items-center lg:grid-cols-[1fr_auto_auto] lg:gap-7 lg:py-6">
            <p className="text-[9px] font-medium text-white/[0.36] sm:text-[10px]">
              {copy.footer.copyright(formatShellNumber(year, locale))}
            </p>

            <nav
              aria-label={copy.footer.legalAria}
              className="flex flex-wrap items-center gap-x-3 gap-y-2"
            >
              <LegalLink href={privacyHref}>{copy.footer.privacy}</LegalLink>

              <Separator />

              <LegalLink href={termsHref}>{copy.footer.terms}</LegalLink>

              <Separator />

              <LegalLink href={cookiesHref}>{copy.footer.cookies}</LegalLink>
            </nav>

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<ArrowUpIcon />}
              iconPosition="left"
              onClick={scrollToTop}
              aria-label={copy.footer.backToTopAria}
              className="!min-h-9 !justify-self-start !border-white/[0.16] !bg-transparent !px-3 !text-[9px] !text-white hover:!border-white hover:!bg-white hover:!text-black sm:justify-self-end"
            >
              {copy.footer.backToTop}
            </Button>
          </div>
        </div>
      </section>
    </footer>
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
        "px-5 py-6 text-start lg:px-7 lg:py-7 xl:px-8 xl:py-8",

        !isLast && "border-e border-black/[0.10]",
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-5">
        <h3
          id={`footer-desktop-${group.id}`}
          className="text-[14px] font-bold tracking-[0.04em] text-black/[0.88]"
        >
          {group.title}
        </h3>

        <span className="text-[8px] font-medium tabular-nums text-black/[0.30]">
          {index}
        </span>
      </div>

      <ul className="space-y-0.5">
        {group.links.map((link, linkIndex) => (
          <li
            key={footerLinkKey(group.id, link, linkIndex)}
            className="min-w-0"
          >
            <FooterNavLink href={link.href}>{link.label}</FooterNavLink>
          </li>
        ))}
      </ul>
    </section>
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
      <summary className="flex min-h-[56px] cursor-pointer list-none items-center gap-4 px-5 text-start focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-black/[0.60] sm:px-7 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1 text-[15px] font-bold tracking-[-0.015em]">
          {group.title}
        </span>

        <span className="w-6 shrink-0 text-center text-[8px] font-medium tabular-nums text-black/[0.30]">
          {index}
        </span>

        <span className="relative size-4 shrink-0 text-black/[0.55]">
          <span className="absolute start-0 top-1/2 h-px w-4 -translate-y-1/2 bg-current" />

          <span className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-current transition-opacity duration-200 group-open:opacity-0" />
        </span>
      </summary>

      <div className="border-t border-black/[0.07] px-5 pb-4 pt-2.5 sm:px-7">
        <ul className="space-y-0.5">
          {group.links.map((link, linkIndex) => (
            <li key={footerLinkKey(group.id, link, linkIndex)}>
              <FooterNavLink href={link.href}>{link.label}</FooterNavLink>
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
      className="group/link flex min-h-8 w-fit items-center text-[12px] font-medium text-black/[0.54] transition-[color,transform] duration-[250ms] hover:-translate-x-1 hover:text-black focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black/[0.60] motion-reduce:transform-none ltr:hover:translate-x-1"
    >
      <span>{children}</span>

      <span className="ms-0 h-px w-0 bg-black/[0.72] transition-[width,margin] duration-[250ms] group-hover/link:ms-2 group-hover/link:w-4" />
    </Link>
  );
}

function SocialTextLink({
  social,

  label,

  ariaLabel,
}: {
  social: SocialLink;

  label: string;

  ariaLabel: string;
}) {
  return (
    <Link
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      title={label}
      className="group/social grid size-11 place-items-center border border-black/[0.10] text-black/[0.54] outline-none transition-[background-color,color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--footer-copper)] hover:bg-black/[0.035] hover:text-black focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-black/60 motion-reduce:transform-none"
    >
      <SocialIcon id={social.id} />

      <span className="sr-only">{label}</span>
    </Link>
  );
}

function SocialIcon({ id }: { id: string }) {
  if (id === "instagram") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="size-5"
      >
        <rect
          x="3.5"
          y="3.5"
          width="17"
          height="17"
          rx="4.5"
          stroke="currentColor"
          strokeWidth="1.6"
        />

        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />

        <circle cx="17.5" cy="6.7" r="1" fill="currentColor" />
      </svg>
    );
  }

  if (id === "linkedin") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="size-5"
      >
        <rect
          x="3.5"
          y="3.5"
          width="17"
          height="17"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.6"
        />

        <path
          d="M7.5 10.5V16.5M7.5 7.6V7.7M11.5 16.5V10.5M11.5 13.2C11.5 11.6 12.4 10.5 13.8 10.5C15.4 10.5 16.5 11.5 16.5 13.4V16.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />

      <path
        d="M13.8 7.1C11.1 7.1 9.2 8.5 9.2 10.6C9.2 11.8 9.8 12.5 10.6 12.8C10.8 12.9 10.9 12.8 11 12.5L11.3 11.6C11.4 11.3 11.3 11.1 11 10.9C10.7 10.7 10.5 10.4 10.5 10C10.5 8.9 11.5 8.2 13.2 8.2C15.1 8.2 16.1 9.1 16.1 10.8C16.1 12.9 15.2 14.1 13.8 14.1C13.1 14.1 12.6 13.7 12.8 13.1C13 12.4 13.5 11.7 13.5 11C13.5 10.4 13.2 10 12.6 10C11.9 10 11.4 10.6 11.4 11.5C11.4 12.1 11.6 12.5 11.6 12.5L10.7 16.1C10.5 16.8 10.5 17.7 10.6 18.4"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LegalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-[11px] font-semibold text-white/[0.42] transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/[0.65]"
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
