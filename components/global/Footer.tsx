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

            <div className="mt-8 grid w-full gap-7 border-t border-black/[0.09] pt-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex items-center justify-center text-center lg:justify-start lg:text-start">
                <p className="max-w-[620px] text-[10px] font-medium leading-6 text-black/[0.48]">
                  {copy.footer.allProductsDescription}
                </p>
              </div>

              <div className="flex flex-col items-center gap-3 lg:items-end">
                <div className="flex w-full items-center justify-between gap-4 lg:justify-end lg:gap-6">
                  <p className="text-[8px] font-semibold tracking-[0.08em] text-black/[0.42]">
                    {copy.footer.followUs}
                  </p>

                  <span
                    aria-label={copy.footer.currentLanguage(
                      localeLabels[locale],
                    )}
                    className="text-[8px] font-medium text-black/[0.36]"
                  >
                    {localeLabels[locale]}
                  </span>
                </div>

                <nav
                  aria-label={copy.footer.socialAria}
                  className="flex items-center gap-2"
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

          IMMERSIVE FULL-SCREEN BRAND WORDMARK

      ===================================================================== */}

      <WordmarkStage href={homeHref} ariaLabel={copy.footer.homeAria} />

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



   WORDMARK STAGE



============================================================================= */

function WordmarkStage({
  href,
  ariaLabel,
}: {
  href: string;
  ariaLabel: string;
}) {
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
      const viewport = Math.max(window.innerHeight, 1);
      const travel = Math.max(stage.offsetHeight - viewport, 1);
      const rawProgress = -rect.top / travel;
      const progress = reduceMotion
        ? 0.5
        : Math.min(1, Math.max(0, rawProgress));

      // Smoothstep: elegant and fully tied to scroll position.
      const eased = progress * progress * (3 - 2 * progress);
      const centerGlow = Math.sin(progress * Math.PI);

      const scale = 0.94 + eased * 0.075;
      const translateY = 18 - eased * 36;
      const shine = -34 + eased * 168;
      const lightX = -46 + eased * 92;
      const lightOpacity = 0.08 + centerGlow * 0.18;
      const whiteGlow = 5 + centerGlow * 15;
      const copperGlow = 12 + centerGlow * 30;
      const ambientOpacity = 0.38 + centerGlow * 0.42;

      surface.style.setProperty("--wordmark-scale", scale.toFixed(4));
      surface.style.setProperty("--wordmark-y", `${translateY.toFixed(2)}px`);
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
      surface.style.setProperty(
        "--wordmark-ambient-opacity",
        ambientOpacity.toFixed(4),
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
      aria-label={ariaLabel}
      className="relative h-[100svh] bg-[#050505] md:h-[100svh] motion-reduce:h-[100svh] motion-reduce:md:h-[100svh]"
    >
      <div
        ref={surfaceRef}
        className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden bg-[#050505]"
        style={
          {
            "--wordmark-scale": "0.94",
            "--wordmark-y": "18px",
            "--wordmark-shine": "-34%",
            "--wordmark-light-x": "-46vw",
            "--wordmark-light-opacity": "0.08",
            "--wordmark-white-glow": "5px",
            "--wordmark-copper-glow": "12px",
            "--wordmark-ambient-opacity": "0.38",
          } as CSSProperties
        }
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: "var(--wordmark-ambient-opacity)",
            background:
              "radial-gradient(circle at 50% 108%, rgba(173,122,75,0.24) 0%, rgba(173,122,75,0.08) 22%, transparent 48%), radial-gradient(circle at 50% -8%, rgba(255,255,255,0.075) 0%, transparent 38%), linear-gradient(180deg, #050505 0%, #080706 52%, #050505 100%)",
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-[8%] left-1/2 w-[34vw] min-w-[190px] -translate-x-1/2 blur-[72px] motion-reduce:hidden"
          style={{
            opacity: "var(--wordmark-light-opacity)",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(178,125,73,0.08) 24%, rgba(247,245,240,0.34) 50%, rgba(178,125,73,0.08) 76%, transparent 100%)",
            transform:
              "translate3d(var(--wordmark-light-x), 0, 0) translateX(-50%)",
          }}
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[6vw] top-[7vh] h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),rgba(173,122,75,0.42),rgba(255,255,255,0.08),transparent)]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[6vw] bottom-[7vh] h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.06),rgba(173,122,75,0.26),rgba(255,255,255,0.06),transparent)]"
        />

        <Link
          href={href}
          aria-label={ariaLabel}
          className="relative z-10 flex h-full w-full items-center justify-center overflow-visible px-[2vw] py-[12vh] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white/70"
        >
          <span className="block w-full overflow-visible py-[0.22em] text-center">
            <span
              className="inline-block whitespace-nowrap py-[0.12em] text-[clamp(43px,9.45vw,190px)] font-medium uppercase leading-[1.04] tracking-[-0.065em] [backface-visibility:hidden] motion-reduce:transform-none"
              style={{
                transform:
                  "translate3d(0, var(--wordmark-y), 0) scale(var(--wordmark-scale))",
                transformOrigin: "center center",
                backgroundImage:
                  "linear-gradient(90deg, #5f5b56 0%, #d7d2c9 20%, #ffffff 40%, #b47b49 50%, #ffffff 60%, #d7d2c9 80%, #5f5b56 100%)",
                backgroundSize: "235% 100%",
                backgroundPosition: "var(--wordmark-shine) 50%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                WebkitTextFillColor: "transparent",
                filter:
                  "drop-shadow(0 0 var(--wordmark-white-glow) rgba(255,255,255,0.10)) drop-shadow(0 0 var(--wordmark-copper-glow) rgba(173,122,75,0.13))",
                willChange: "transform, background-position",
              }}
            >
              NAJIBZADEH
            </span>
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
