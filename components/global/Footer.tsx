"use client";

import Link from "next/link";

import { type CSSProperties, type ReactNode } from "react";

import { brandColors, fontTokens, lightTokens } from "@/theme/theme-colors";

import { Button } from "@/components/ui/Button";

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
  icon: ReactNode;
};

/* ==========================================================================
   DATA
============================================================================ */

const FOOTER_GROUPS: FooterGroup[] = [
  {
    id: "shop",
    title: "Shop",

    links: [
      {
        label: "New Arrivals",
        href: "/new-arrivals",
      },

      {
        label: "Clothing",
        href: "/clothing",
      },

      {
        label: "Fragrance",
        href: "/fragrance",
      },

      {
        label: "Accessories",
        href: "/accessories",
      },

      {
        label: "Best Sellers",
        href: "/best-sellers",
      },
    ],
  },

  {
    id: "services",
    title: "Services",

    links: [
      {
        label: "Private Appointment",
        href: "/appointments",
      },

      {
        label: "Find a Store",
        href: "/stores",
      },

      {
        label: "Shipping & Returns",
        href: "/shipping-returns",
      },

      {
        label: "Client Care",
        href: "/customer-care",
      },
    ],
  },

  {
    id: "house",
    title: "The House",

    links: [
      {
        label: "Our Story",
        href: "/our-story",
      },

      {
        label: "Craftsmanship",
        href: "/craftsmanship",
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
        label: "Campaigns",
        href: "/campaigns",
      },
    ],
  },

  {
    id: "information",
    title: "Information",

    links: [
      {
        label: "Contact",
        href: "/contact",
      },

      {
        label: "FAQ",
        href: "/faq",
      },

      {
        label: "Privacy Policy",
        href: "/privacy",
      },

      {
        label: "Terms & Conditions",
        href: "/terms",
      },

      {
        label: "Cookie Policy",
        href: "/cookies",
      },
    ],
  },
];

const SOCIAL_LINKS: SocialLink[] = [
  {
    id: "instagram",
    label: "Instagram",
    href: "https://instagram.com/",
    icon: <InstagramIcon />,
  },

  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://linkedin.com/",
    icon: <LinkedInIcon />,
  },

  {
    id: "pinterest",
    label: "Pinterest",
    href: "https://pinterest.com/",
    icon: <PinterestIcon />,
  },
];

/* ==========================================================================
   FOOTER
============================================================================ */

export default function Footer() {
  const year = new Date().getFullYear();

  const themeVars = {
    "--footer-bg": brandColors.white.hex,

    "--footer-text": brandColors.black.hex,

    "--footer-muted": lightTokens.textMuted,

    "--footer-soft": lightTokens.textSoft,

    "--footer-border": lightTokens.border,

    "--footer-copper": brandColors.copper.hex,
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
      className="
        relative

        w-full
        overflow-hidden

        border-t
        border-[var(--footer-border)]

        bg-[var(--footer-bg)]
        text-[var(--footer-text)]
      "
    >
      <div
        className="
          mx-auto

          w-full
          max-w-[1920px]

          px-5

          sm:px-7

          lg:px-10

          xl:px-14
        "
      >
        {/* =============================================================
            MAIN NAVIGATION

            Top Editorial کاملاً حذف شده.
        ============================================================== */}

        <div
          className="
            grid

            grid-cols-2

            gap-x-8
            gap-y-10

            border-b
            border-[var(--footer-border)]

            py-10

            sm:gap-x-12
            sm:py-12

            md:grid-cols-4

            lg:gap-x-16
            lg:py-14
          "
        >
          {FOOTER_GROUPS.map((group) => (
            <FooterGroupColumn key={group.id} group={group} />
          ))}
        </div>

        {/* =============================================================
            SOCIAL / CLIENT SERVICES

            بسیار compact تر از نسخه قبلی.
        ============================================================== */}

        <div
          className="
            flex

            flex-col

            gap-8

            border-b
            border-[var(--footer-border)]

            py-7

            md:flex-row
            md:items-center
            md:justify-between

            lg:py-8
          "
        >
          {/* SOCIAL */}

          <div
            className="
              flex

              flex-col

              gap-4

              sm:flex-row
              sm:items-center
              sm:gap-7
            "
          >
            <p
              className="
                shrink-0

                text-[7px]
                font-semibold

                uppercase
                tracking-[0.18em]

                text-[var(--footer-text)]
              "
            >
              Follow
            </p>

            <div
              className="
                group/social

                flex
                flex-wrap

                gap-x-6
                gap-y-3
              "
            >
              {SOCIAL_LINKS.map((social) => (
                <SocialLinkItem key={social.id} social={social} />
              ))}
            </div>
          </div>

          {/* CLIENT SERVICE */}

          <div
            className="
              flex

              flex-col

              gap-2

              sm:flex-row
              sm:items-center
              sm:gap-5

              md:justify-end
            "
          >
            <span
              className="
                text-[7px]
                font-semibold

                uppercase
                tracking-[0.17em]

                text-[var(--footer-text)]
              "
            >
              Client Services
            </span>

            <a
              href="mailto:clientservices@najibzadeh.com"
              className="
                text-[9px]

                text-[var(--footer-muted)]

                transition-colors
                duration-200

                hover:text-[var(--footer-text)]

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-black
                focus-visible:ring-offset-2
              "
            >
              clientservices@najibzadeh.com
            </a>
          </div>
        </div>

        {/* =============================================================
            WORDMARK

            نسبت به قبل کم‌ارتفاع‌تر.
        ============================================================== */}

        <div
          className="
            overflow-hidden

            border-b
            border-[var(--footer-border)]

            py-7

            sm:py-8

            lg:py-9
          "
        >
          <Link
            href="/"
            aria-label="Najibzadeh home"
            className="
              block

              whitespace-nowrap

              text-center

              text-[clamp(2.8rem,11.5vw,11rem)]
              font-medium

              leading-[0.78]

              tracking-[0.045em]

              text-[var(--footer-text)]

              transition-opacity
              duration-300

              hover:opacity-45

              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-black
            "
          >
            NAJIBZADEH
          </Link>
        </div>

        {/* =============================================================
            LEGAL
        ============================================================== */}

        <div
          className="
            flex

            flex-col

            gap-5

            py-6

            sm:flex-row
            sm:items-center
            sm:justify-between

            lg:py-7
          "
        >
          {/* COPYRIGHT */}

          <p
            className="
              text-[6.5px]
              font-medium

              uppercase
              tracking-[0.16em]

              text-[var(--footer-soft)]
            "
          >
            © {year} Najibzadeh. All rights reserved.
          </p>

          {/* LEGAL */}

          <div
            className="
              flex
              flex-wrap

              items-center

              gap-x-4
              gap-y-3
            "
          >
            <LegalLink href="/privacy">Privacy</LegalLink>

            <Separator />

            <LegalLink href="/terms">Terms</LegalLink>

            <Separator />

            <LegalLink href="/cookies">Cookies</LegalLink>

            <Separator />

            <button
              type="button"
              className="
                cursor-pointer

                text-[6.5px]
                font-semibold

                uppercase
                tracking-[0.16em]

                text-[var(--footer-muted)]

                transition-colors
                duration-200

                hover:text-[var(--footer-text)]

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-black
                focus-visible:ring-offset-2
              "
            >
              EN / IR
            </button>
          </div>

          {/* BACK TO TOP */}

          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<ArrowUpIcon />}
            iconPosition="right"
            onClick={scrollToTop}
          >
            Back to Top
          </Button>
        </div>
      </div>
    </footer>
  );
}

/* ==========================================================================
   FOOTER COLUMN

   IMPORTANT:

   وقتی روی یکی از لینک‌ها hover شود:
   تمام لینک‌های همان ستون fade می‌شوند
   ولی hovered link دوباره opacity 100 می‌گیرد.
============================================================================ */

function FooterGroupColumn({ group }: { group: FooterGroup }) {
  return (
    <section>
      {/* TITLE */}

      <p
        className="
          mb-5

          text-[7px]
          font-semibold

          uppercase
          tracking-[0.19em]

          text-[var(--footer-text)]
        "
      >
        {group.title}
      </p>

      {/* LINKS */}

      <ul
        className="
          group/column

          space-y-0.5
        "
      >
        {group.links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="
                  group/link

                  relative

                  inline-flex
                  min-h-7

                  items-center

                  text-[10.5px]
                  font-normal

                  text-[var(--footer-muted)]

                  opacity-75

                  transition-[opacity,color,transform]
                  duration-300

                  ease-[cubic-bezier(0.22,1,0.36,1)]

                  group-hover/column:opacity-20

                  hover:!translate-x-1
                  hover:!text-[var(--footer-text)]
                  hover:!opacity-100

                  focus-visible:!opacity-100
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-black
                  focus-visible:ring-offset-2
                "
            >
              {link.label}

              {/* =====================================================
                    SMALL ARROW

                    فقط روی لینک hover شده ظاهر می‌شود.
                ====================================================== */}

              <span
                aria-hidden="true"
                className="
                    ml-2

                    -translate-x-1

                    text-[9px]

                    opacity-0

                    transition-[opacity,transform]
                    duration-300

                    group-hover/link:translate-x-0
                    group-hover/link:opacity-100
                  "
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ==========================================================================
   SOCIAL
============================================================================ */

function SocialLinkItem({ social }: { social: SocialLink }) {
  return (
    <a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={social.label}
      className="
        group/item

        flex

        items-center
        gap-2

        text-[var(--footer-muted)]

        opacity-65

        transition-[opacity,color,transform]
        duration-300

        group-hover/social:opacity-20

        hover:!opacity-100
        hover:!text-[var(--footer-text)]

        focus-visible:!opacity-100
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-black
        focus-visible:ring-offset-2
      "
    >
      <span
        className="
          flex
          size-[18px]

          shrink-0

          items-center
          justify-center

          transition-transform
          duration-300

          group-hover/item:-translate-y-px
        "
      >
        {social.icon}
      </span>

      <span
        className="
          text-[9px]
        "
      >
        {social.label}
      </span>
    </a>
  );
}

/* ==========================================================================
   LEGAL
============================================================================ */

function LegalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="
        text-[6.5px]
        font-semibold

        uppercase
        tracking-[0.16em]

        text-[var(--footer-muted)]

        transition-colors
        duration-200

        hover:text-[var(--footer-text)]

        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-black
        focus-visible:ring-offset-2
      "
    >
      {children}
    </Link>
  );
}

/* ==========================================================================
   SEPARATOR
============================================================================ */

function Separator() {
  return (
    <span
      aria-hidden="true"
      className="
        h-3
        w-px

        bg-[var(--footer-border)]
      "
    />
  );
}

/* ==========================================================================
   ICONS
============================================================================ */

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
        strokeWidth="1"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.15"
      aria-hidden="true"
    >
      <rect x="4" y="4" width="16" height="16" />

      <circle cx="12" cy="12" r="3.6" />

      <circle cx="17.3" cy="6.8" r=".7" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M5.2 3.9A2.1 2.1 0 1 1 5.2 8a2.1 2.1 0 0 1 0-4.1ZM3.4 9.4H7v11H3.4v-11Zm5.7 0h3.5v1.5h.1c.5-.9 1.7-1.9 3.5-1.9 3.7 0 4.4 2.4 4.4 5.6v5.8H17v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7v5.2H9.1v-11Z" />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.8a9.2 9.2 0 0 0-3.4 17.7c-.1-1.4 0-3 .4-4.6l1.2-5s-.3-.7-.3-1.8c0-1.7 1-3 2.2-3 1 0 1.6.8 1.6 1.8 0 1.1-.7 2.6-1 4-.6 1.2.6 2.2 1.8 2.2 2.2 0 3.8-2.3 3.8-5.6 0-2.9-2.1-5-5.1-5-3.5 0-5.5 2.6-5.5 5.3 0 1.1.4 2.2 1 2.8.1.1.1.2.1.4l-.4 1.6c-.1.5-.5.6-.9.4-1.8-.8-2.9-3.2-2.9-5.1 0-4.1 3-7.9 8.6-7.9 4.5 0 8 3.2 8 7.5 0 4.5-2.8 8.1-6.8 8.1-1.3 0-2.6-.7-3-1.5l-.8 3.1c-.3 1.1-1.1 2.5-1.6 3.4.9.3 1.9.5 3 .5a9.2 9.2 0 0 0 0-18.4Z" />
    </svg>
  );
}
