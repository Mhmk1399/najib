"use client";

import Link from "next/link";

import { type CSSProperties, type ReactNode } from "react";

import { brandColors, fontTokens, lightTokens } from "@/theme/theme-colors";

import { ArrowRightIcon, Button } from "@/components/ui/Button";

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
   COMPONENT
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

    "--footer-black-rgb": brandColors.black.rgb,
  } as CSSProperties;

  /* ------------------------------------------------------------------------
     BACK TO TOP
  ------------------------------------------------------------------------- */

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
        {/* ================================================================
            TOP EDITORIAL
        ================================================================= */}

        <div
          className="
            grid

            border-b
            border-[var(--footer-border)]

            py-14

            md:py-16

            lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]
            lg:items-end
            lg:gap-16
            lg:py-20

            xl:py-24
          "
        >
          {/* ==============================================================
              BRAND INTRO
          =============================================================== */}

          <div
            className="
              max-w-[850px]
            "
          >
            {/* Copper only here */}

            <div
              className="
                mb-6

                flex
                items-center
                gap-3

                text-[7px]
                font-semibold

                uppercase
                tracking-[0.24em]

                text-[var(--footer-copper)]

                sm:text-[8px]
              "
            >
              <span
                className="
                  h-px
                  w-6

                  bg-[var(--footer-copper)]
                "
              />

              <span>The House of Najibzadeh</span>
            </div>

            <h2
              className="
                max-w-[800px]

                font-serif

                text-[clamp(2.8rem,9vw,4.7rem)]
                font-normal

                leading-[0.95]
                tracking-[-0.05em]

                text-[var(--footer-text)]

                sm:text-[clamp(3.5rem,7vw,5.4rem)]

                lg:text-[clamp(4rem,5vw,6.2rem)]
              "
            >
              Presence shaped
              <br />
              with intention.
            </h2>

            <p
              className="
                mt-6

                max-w-[520px]

                text-[10px]
                font-normal

                leading-[1.8]

                text-[var(--footer-muted)]

                sm:text-[11px]

                lg:mt-7
                lg:text-xs
              "
            >
              Modern tailoring, distinctive fragrance and considered objects
              created around a quieter expression of luxury.
            </p>
          </div>

          {/* ==============================================================
              APPOINTMENT
          =============================================================== */}

          <div
            className="
              mt-10

              w-full
              max-w-[340px]

              lg:mt-0
              lg:ml-auto
            "
          >
            <p
              className="
                mb-4

                text-[8px]
                font-semibold

                uppercase
                tracking-[0.19em]

                text-[var(--footer-text)]
              "
            >
              Private Services
            </p>

            <p
              className="
                mb-6

                max-w-[300px]

                text-[10px]
                leading-[1.7]

                text-[var(--footer-muted)]
              "
            >
              Discover the house in person with a private appointment tailored
              to you.
            </p>

            <Button
              href="/appointments"
              variant="black"
              size="lg"
              icon={<ArrowRightIcon />}
              fullWidth
            >
              Book an Appointment
            </Button>
          </div>
        </div>

        {/* ================================================================
            MAIN NAVIGATION
        ================================================================= */}

        <div
          className="
            grid

            grid-cols-2

            gap-x-8
            gap-y-12

            border-b
            border-[var(--footer-border)]

            py-12

            sm:gap-x-12

            md:grid-cols-4

            lg:gap-x-16
            lg:py-16
          "
        >
          {FOOTER_GROUPS.map((group) => (
            <FooterGroup key={group.id} group={group} />
          ))}
        </div>

        {/* ================================================================
            SOCIAL + CLIENT SERVICES
        ================================================================= */}

        <div
          className="
            grid

            border-b
            border-[var(--footer-border)]

            py-9

            md:grid-cols-2
            md:items-center
            md:gap-12

            lg:py-10
          "
        >
          {/* ==============================================================
              SOCIAL
          =============================================================== */}

          <div>
            <p
              className="
                mb-5

                text-[8px]
                font-semibold

                uppercase
                tracking-[0.19em]

                text-[var(--footer-text)]
              "
            >
              Follow Najibzadeh
            </p>

            <div
              className="
                flex
                flex-wrap

                gap-x-7
                gap-y-4
              "
            >
              {SOCIAL_LINKS.map((social) => (
                <SocialLinkItem key={social.id} social={social} />
              ))}
            </div>
          </div>

          {/* ==============================================================
              CLIENT SERVICES
          =============================================================== */}

          <div
            className="
              mt-9

              border-t
              border-[var(--footer-border)]

              pt-7

              md:mt-0
              md:border-l
              md:border-t-0
              md:pl-10
              md:pt-0
            "
          >
            <p
              className="
                mb-4

                text-[8px]
                font-semibold

                uppercase
                tracking-[0.19em]

                text-[var(--footer-text)]
              "
            >
              Client Services
            </p>

            <a
              href="mailto:clientservices@najibzadeh.com"
              className="
                inline-block

                text-[10px]

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

            <p
              className="
                mt-3

                max-w-[340px]

                text-[9px]
                leading-[1.65]

                text-[var(--footer-soft)]
              "
            >
              For appointments, product enquiries and assistance with your
              order.
            </p>
          </div>
        </div>

        {/* ================================================================
            LARGE WORDMARK
        ================================================================= */}

        <div
          className="
            overflow-hidden

            border-b
            border-[var(--footer-border)]

            py-8

            sm:py-10

            lg:py-12
          "
        >
          <Link
            href="/"
            aria-label="Najibzadeh home"
            className="
              block

              whitespace-nowrap

              text-center

              text-[clamp(2.7rem,12.5vw,13rem)]
              font-medium

              leading-[0.8]

              tracking-[0.04em]

              text-[var(--footer-text)]

              transition-opacity
              duration-200

              hover:opacity-60

              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-black
            "
          >
            NAJIBZADEH
          </Link>
        </div>

        {/* ================================================================
            LEGAL / BOTTOM
        ================================================================= */}

        <div
          className="
            flex
            flex-col

            gap-7

            py-7

            md:flex-row
            md:items-center
            md:justify-between

            lg:py-8
          "
        >
          {/* ==============================================================
              COPYRIGHT
          =============================================================== */}

          <p
            className="
              text-[7px]
              font-medium

              uppercase
              tracking-[0.17em]

              text-[var(--footer-soft)]
            "
          >
            © {year} Najibzadeh. All rights reserved.
          </p>

          {/* ==============================================================
              LEGAL LINKS
          =============================================================== */}

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

                text-[7px]
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

          {/* ==============================================================
              BACK TO TOP

              Dynamic Button
          =============================================================== */}

          <div
            className="
              w-full

              sm:w-auto
            "
          >
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
      </div>
    </footer>
  );
}

/* ==========================================================================
   FOOTER GROUP
============================================================================ */

function FooterGroup({ group }: { group: FooterGroup }) {
  return (
    <section>
      {/* ================================================================
          GROUP TITLE
      ================================================================= */}

      <p
        className="
          mb-5

          text-[8px]
          font-semibold

          uppercase
          tracking-[0.19em]

          text-[var(--footer-text)]
        "
      >
        {group.title}
      </p>

      {/* ================================================================
          LINKS
      ================================================================= */}

      <ul
        className="
          space-y-1
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
                  min-h-8

                  items-center

                  text-[11px]
                  font-normal

                  text-[var(--footer-muted)]

                  transition-[color,transform]
                  duration-200

                  hover:translate-x-1
                  hover:text-[var(--footer-text)]

                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-black
                  focus-visible:ring-offset-2
                "
            >
              <span>{link.label}</span>

              {/* Black hover line */}

              <span
                aria-hidden="true"
                className="
                    absolute

                    inset-x-0
                    bottom-0

                    h-px

                    origin-left
                    scale-x-0

                    bg-[var(--footer-text)]

                    transition-transform
                    duration-300

                    group-hover/link:scale-x-100
                  "
              />
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
        group

        flex

        items-center
        gap-2.5

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
      <span
        className="
          flex
          size-5

          shrink-0

          items-center
          justify-center

          transition-transform
          duration-200

          group-hover:-translate-y-px
        "
      >
        {social.icon}
      </span>

      <span
        className="
          text-[10px]
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

function LegalLink({
  href,

  children,
}: {
  href: string;

  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="
        text-[7px]
        font-semibold

        uppercase
        tracking-[0.17em]

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
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
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
      width="17"
      height="17"
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
      width="17"
      height="17"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.8a9.2 9.2 0 0 0-3.4 17.7c-.1-1.4 0-3 .4-4.6l1.2-5s-.3-.7-.3-1.8c0-1.7 1-3 2.2-3 1 0 1.6.8 1.6 1.8 0 1.1-.7 2.6-1 4-.6 1.2.6 2.2 1.8 2.2 2.2 0 3.8-2.3 3.8-5.6 0-2.9-2.1-5-5.1-5-3.5 0-5.5 2.6-5.5 5.3 0 1.1.4 2.2 1 2.8.1.1.1.2.1.4l-.4 1.6c-.1.5-.5.6-.9.4-1.8-.8-2.9-3.2-2.9-5.1 0-4.1 3-7.9 8.6-7.9 4.5 0 8 3.2 8 7.5 0 4.5-2.8 8.1-6.8 8.1-1.3 0-2.6-.7-3-1.5l-.8 3.1c-.3 1.1-1.1 2.5-1.6 3.4.9.3 1.9.5 3 .5a9.2 9.2 0 0 0 0-18.4Z" />
    </svg>
  );
}
