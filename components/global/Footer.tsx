"use client";

import Link from "next/link";

import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";

import { Button } from "@/components/ui/Button";
import { brandColors, fontTokens, lightTokens } from "@/theme/theme-colors";

/* ==========================================================================
   TYPES
============================================================================ */

type FooterLink = {
  label: string;
  href: string;
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

/* ==========================================================================
   DATA
============================================================================ */

const FOOTER_GROUPS: FooterGroup[] = [
  {
    id: "shop",
    title: "Shop",
    links: [
      { label: "New Arrivals", href: "/new-arrivals" },
      { label: "Clothing", href: "/clothing" },
      { label: "Fragrance", href: "/fragrance" },
      { label: "Accessories", href: "/accessories" },
      { label: "Best Sellers", href: "/best-sellers" },
    ],
  },
  {
    id: "services",
    title: "Services",
    links: [
      { label: "Private Appointment", href: "/appointments" },
      { label: "Find a Store", href: "/stores" },
      { label: "Shipping & Returns", href: "/shipping-returns" },
      { label: "Client Care", href: "/customer-care" },
    ],
  },
  {
    id: "house",
    title: "The House",
    links: [
      { label: "Our Story", href: "/our-story" },
      { label: "Craftsmanship", href: "/craftsmanship" },
      { label: "Heritage", href: "/heritage" },
      { label: "The Journal", href: "/journal" },
      { label: "Campaigns", href: "/campaigns" },
    ],
  },
  {
    id: "information",
    title: "Information",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
];

const SOCIAL_LINKS: SocialLink[] = [
  {
    id: "instagram",
    label: "Instagram",
    href: "https://instagram.com/",
    code: "IG",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://linkedin.com/",
    code: "IN",
  },
  {
    id: "pinterest",
    label: "Pinterest",
    href: "https://pinterest.com/",
    code: "PT",
  },
];

/* ==========================================================================
   UTILS
============================================================================ */

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/* ==========================================================================
   FOOTER
============================================================================ */

export default function Footer() {
  const year = new Date().getFullYear();

  const themeVars = {
    "--footer-black": brandColors.black.hex,
    "--footer-cream": brandColors.cream.hex,
    "--footer-white": brandColors.white.hex,
    "--footer-copper": brandColors.copper.hex,
    "--footer-muted": lightTokens.textMuted,
    "--footer-soft": lightTokens.textSoft,
    "--footer-border": lightTokens.border,
  } as CSSProperties;

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
      dir="ltr"
      style={{
        ...themeVars,
        fontFamily: fontTokens.english,
      }}
      className="relative w-full overflow-visible bg-[var(--footer-cream)] text-[var(--footer-black)]"
    >
      {/* ================================================================
          EDITORIAL / CLIENT SERVICES
      ================================================================= */}

      <section className="border-t border-black/[0.10]">
        <div className="mx-auto grid w-full max-w-[1920px] lg:grid-cols-[minmax(0,1.18fr)_minmax(390px,0.82fr)]">
          <div className="px-5 py-10 sm:px-7 sm:py-12 lg:border-r lg:border-black/[0.10] lg:px-10 lg:py-14 xl:px-14 xl:py-16">
            <div className="mb-6 flex items-center gap-3">
              <span className="text-[8px] font-semibold uppercase tracking-[0.24em] text-[var(--footer-copper)]">
                Najibzadeh / The House
              </span>
              <span className="h-px w-10 bg-black/[0.15]" />
            </div>

            <h2 className="max-w-[760px] text-[34px] font-medium leading-[0.98] tracking-[-0.045em] sm:text-[44px] lg:text-[52px] xl:text-[60px]">
              Craftsmanship, heritage and the world behind Najibzadeh.
            </h2>

            <p className="mt-5 max-w-[590px] text-[11px] leading-6 text-black/[0.55] sm:text-[12px]">
              Explore the house, discover the latest collections, or arrange a
              private appointment with our client services team.
            </p>

            <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <Button
                href="/our-story"
                variant="black"
                size="md"
                icon={<ArrowRightIcon />}
                iconPosition="right"
                className="!tracking-[0.17em]"
              >
                Discover the House
              </Button>

              <Button
                href="/appointments"
                variant="outline"
                size="md"
                icon={<ArrowRightIcon />}
                iconPosition="right"
                className="!tracking-[0.17em]"
              >
                Private Appointment
              </Button>
            </div>
          </div>

          <div className="grid border-t border-black/[0.10] bg-[#0C0C0C] text-white lg:border-t-0">
            <ServicePanel
              index="01"
              eyebrow="Client Services"
              title="Personal assistance"
              description="For appointments, product guidance and aftercare."
              href="mailto:clientservices@najibzadeh.com"
              linkLabel="clientservices@najibzadeh.com"
            />

            <ServicePanel
              index="02"
              eyebrow="Boutiques"
              title="Find Najibzadeh"
              description="Explore store locations and plan your visit."
              href="/stores"
              linkLabel="Find a Store"
              internal
            />
          </div>
        </div>
      </section>

      {/* ================================================================
          NAVIGATION — DESKTOP
      ================================================================= */}

      <section className="border-t border-black/[0.10]">
        <div className="mx-auto hidden w-full max-w-[1920px] grid-cols-4 md:grid">
          {FOOTER_GROUPS.map((group, index) => (
            <DesktopFooterGroup
              key={group.id}
              group={group}
              index={String(index + 1).padStart(2, "0")}
              isLast={index === FOOTER_GROUPS.length - 1}
            />
          ))}
        </div>

        {/* ==============================================================
            NAVIGATION — MOBILE
        =============================================================== */}

        <div className="mx-auto w-full max-w-[1920px] md:hidden">
          {FOOTER_GROUPS.map((group, index) => (
            <MobileFooterGroup
              key={group.id}
              group={group}
              index={String(index + 1).padStart(2, "0")}
            />
          ))}
        </div>
      </section>

      {/* ================================================================
          DARK UTILITY PRELUDE
      ================================================================= */}

      <section className="bg-[#0C0C0C] text-[#F7F5F0]">
        <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-7 lg:px-10 xl:px-14">
          <div className="grid border-b border-white/10 py-7 md:grid-cols-[1fr_auto] md:items-center md:gap-10 lg:py-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
              <p className="shrink-0 text-[8px] font-semibold uppercase tracking-[0.22em] text-white/[0.42]">
                Follow
              </p>

              <nav
                aria-label="Social media"
                className="flex flex-wrap gap-x-1 gap-y-2"
              >
                {SOCIAL_LINKS.map((social) => (
                  <SocialTextLink key={social.id} social={social} />
                ))}
              </nav>
            </div>

            <div className="mt-6 flex items-center gap-5 md:mt-0 md:justify-end">
              <Button
                href="/customer-care"
                variant="outline"
                size="sm"
                icon={<ArrowRightIcon />}
                iconPosition="right"
                className="!border-white/[0.18] !bg-transparent !text-white !tracking-[0.16em] hover:!border-white hover:!bg-white hover:!text-black"
              >
                Client Care
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                uppercase
                className="!min-h-0 !border-0 !bg-transparent !px-0 !py-2 !text-[8px] !text-white/[0.55] !tracking-[0.17em] hover:!border-0 hover:!bg-transparent hover:!text-white"
              >
                EN / IR
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          IMMERSIVE WORDMARK MOMENT

          This stage intentionally owns the entire viewport while it is active.
          z-[5000] places it above the fixed Navbar (z-[1000]).
      ================================================================= */}

      <WordmarkStage />

      {/* ================================================================
          LEGAL END-CAP
      ================================================================= */}

      <section className="relative bg-[#0C0C0C] text-[#F7F5F0]">
        <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-7 lg:px-10 xl:px-14">
          <div className="flex flex-col gap-5 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between lg:py-7">
            <p className="text-[7px] font-medium uppercase tracking-[0.16em] text-white/[0.35]">
              © {year} Najibzadeh. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <LegalLink href="/privacy">Privacy</LegalLink>
              <Separator />
              <LegalLink href="/terms">Terms</LegalLink>
              <Separator />
              <LegalLink href="/cookies">Cookies</LegalLink>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<ArrowUpIcon />}
              iconPosition="right"
              onClick={scrollToTop}
              className="!border-white/[0.18] !bg-transparent !text-white !tracking-[0.16em] hover:!border-white hover:!bg-white hover:!text-black"
            >
              Back to Top
            </Button>
          </div>
        </div>
      </section>
    </footer>
  );
}

/* ==========================================================================
   IMMERSIVE WORDMARK STAGE
============================================================================ */

function WordmarkStage() {
  const stageRef = useRef<HTMLElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const surface = surfaceRef.current;

    if (!stage || !surface) {
      return;
    }

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
      surface.style.setProperty("--wordmark-glow", glow.toFixed(4));
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
      if (frame !== null) {
        return;
      }

      frame = requestAnimationFrame(update);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);

      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <section
      ref={stageRef}
      aria-label="Najibzadeh brand moment"
      className="relative h-[210svh] bg-[#050505]"
    >
      <div
        ref={surfaceRef}
        className="sticky top-0 z-[5000] flex h-[100svh] w-full items-center justify-center overflow-hidden bg-[#050505]"
        style={
          {
            "--wordmark-scale": "0.955",
            "--wordmark-shine": "0%",
            "--wordmark-glow": "0",
            "--wordmark-light-x": "-42vw",
            "--wordmark-light-opacity": "0.08",
            "--wordmark-white-glow": "8px",
            "--wordmark-copper-glow": "18px",
          } as CSSProperties
        }
      >
        {/* A single linear light field. No card, frame, border or rounded shape. */}
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
          aria-label="Najibzadeh home"
          className="relative z-10 block w-full focus-visible:outline-none"
        >
          <span
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

/* ==========================================================================
   SERVICE PANEL
============================================================================ */

function ServicePanel({
  index,
  eyebrow,
  title,
  description,
  href,
  linkLabel,
  internal = false,
}: {
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  internal?: boolean;
}) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-6">
        <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-white/[0.42]">
          {eyebrow}
        </span>
        <span className="text-[8px] font-medium tabular-nums tracking-[0.12em] text-white/[0.28]">
          {index}
        </span>
      </div>

      <div className="mt-9 flex items-end justify-between gap-8">
        <div>
          <h3 className="text-[24px] font-medium tracking-[-0.035em] text-white sm:text-[27px]">
            {title}
          </h3>
          <p className="mt-2 max-w-[360px] text-[10px] leading-5 text-white/[0.48]">
            {description}
          </p>
          <p className="mt-5 break-all text-[9px] font-semibold uppercase tracking-[0.12em] text-white/[0.68] sm:break-normal">
            {linkLabel}
          </p>
        </div>

        <span className="grid size-11 shrink-0 place-items-center border border-white/[0.18] text-white/[0.65] transition-[background-color,color,border-color] duration-[250ms] group-hover:border-white group-hover:bg-white group-hover:text-black">
          <ArrowRightIcon />
        </span>
      </div>
    </>
  );

  const className =
    "group block border-b border-white/10 p-6 transition-colors duration-300 last:border-b-0 hover:bg-white/[0.035] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white/[0.65] sm:p-7 lg:p-8 xl:p-9";

  if (internal) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <a href={href} className={className}>
      {content}
    </a>
  );
}

/* ==========================================================================
   DESKTOP GROUP
============================================================================ */

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
        "min-h-[330px] px-7 py-10 lg:min-h-[360px] lg:px-9 lg:py-12 xl:px-12 xl:py-14",
        !isLast && "border-r border-black/[0.10]",
      )}
    >
      <div className="mb-8 flex items-center justify-between gap-5">
        <h3
          id={`footer-desktop-${group.id}`}
          className="text-[8px] font-semibold uppercase tracking-[0.22em] text-black/[0.85]"
        >
          {group.title}
        </h3>

        <span className="text-[8px] font-medium tabular-nums tracking-[0.12em] text-black/[0.28]">
          {index}
        </span>
      </div>

      <ul className="group/column space-y-0.5">
        {group.links.map((link) => (
          <li key={link.href}>
            <FooterNavLink href={link.href}>{link.label}</FooterNavLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ==========================================================================
   MOBILE GROUP
============================================================================ */

function MobileFooterGroup({
  group,
  index,
}: {
  group: FooterGroup;
  index: string;
}) {
  return (
    <details className="group border-b border-black/[0.10]">
      <summary className="flex min-h-[66px] cursor-pointer list-none items-center gap-4 px-5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-black/[0.60] sm:px-7 [&::-webkit-details-marker]:hidden">
        <span className="w-6 shrink-0 text-[8px] font-medium tabular-nums tracking-[0.10em] text-black/[0.28]">
          {index}
        </span>

        <span className="min-w-0 flex-1 text-[15px] font-medium tracking-[-0.02em]">
          {group.title}
        </span>

        <span className="relative size-4 shrink-0 text-black/[0.55]">
          <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-current" />
          <span className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-current transition-opacity duration-200 group-open:opacity-0" />
        </span>
      </summary>

      <div className="border-t border-black/[0.07] px-5 pb-7 pt-4 sm:px-7">
        <ul className="space-y-0.5 pl-10">
          {group.links.map((link) => (
            <li key={link.href}>
              <FooterNavLink href={link.href}>{link.label}</FooterNavLink>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

/* ==========================================================================
   NAV LINK
============================================================================ */

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
      className="group/link flex min-h-9 w-fit items-center gap-0 text-[12px] font-medium tracking-[-0.012em] text-black/[0.52] transition-[color,transform] duration-[250ms] hover:translate-x-1 hover:text-black focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black/[0.60]"
    >
      <span className="mr-0 h-px w-0 bg-black/[0.70] transition-[width,margin] duration-[250ms] group-hover/link:mr-2 group-hover/link:w-4" />
      <span>{children}</span>
    </Link>
  );
}

/* ==========================================================================
   SOCIAL
============================================================================ */

function SocialTextLink({ social }: { social: SocialLink }) {
  return (
    <Button
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={social.label}
      variant="outline"
      size="sm"
      uppercase={false}
      className="!min-h-9 !border-0 !bg-transparent !px-2.5 !text-white/[0.55] !tracking-normal hover:!border-0 hover:!bg-white/[0.06] hover:!text-white"
    >
      <span className="flex items-center gap-2.5">
        <span className="text-[7px] font-semibold uppercase tracking-[0.16em] text-white/[0.30]">
          {social.code}
        </span>
        <span className="text-[10px] font-medium">{social.label}</span>
      </span>
    </Button>
  );
}

/* ==========================================================================
   LEGAL
============================================================================ */

function LegalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-[7px] font-semibold uppercase tracking-[0.16em] text-white/[0.38] transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/[0.65]"
    >
      {children}
    </Link>
  );
}

function Separator() {
  return <span aria-hidden="true" className="h-3 w-px bg-white/[0.14]" />;
}

/* ==========================================================================
   ICONS — STRICTLY ANGULAR / NO CURVES
============================================================================ */

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="size-3.5"
    >
      <path
        d="M2.5 8H13M9.5 4.5L13 8L9.5 11.5"
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
