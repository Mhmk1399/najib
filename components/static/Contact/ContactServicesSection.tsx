"use client";

import Image from "next/image";
import Link from "next/link";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import { brandColors, lightTokens } from "@/theme/theme-colors";

type ContactMethod = {
  id: string;

  title: string;

  description: ReactNode;

  action?: {
    label: string;
    href: string;
    external?: boolean;
  };

  icon: "appointment" | "service" | "location" | "contact";
};

type ContactServicesSectionProps = {
  imageSrc: string;

  imageAlt?: string;

  imagePosition?: string;

  methods?: ContactMethod[];

  footerNote?: string;

  className?: string;
};

const DEFAULT_METHODS: ContactMethod[] = [
  {
    id: "appointment",

    title: "Private Appointment",

    description: (
      <>
        Experience our collections in an intimate and considered setting.
        <br />
        <br />
        By appointment only.
      </>
    ),

    action: {
      label: "Book Appointment",
      href: "/appointments",
    },

    icon: "appointment",
  },

  {
    id: "services",

    title: "Client Services",

    description: (
      <>
        Our team is here to assist with product enquiries, style guidance,
        orders and aftercare.
      </>
    ),

    action: {
      label: "Client Services",
      href: "/customer-care",
    },

    icon: "service",
  },

  {
    id: "location",

    title: "Visit the House",

    description: (
      <>
        NAJIBZADEH Atelier
        <br />
        74 Mount Street
        <br />
        Mayfair, London
        <br />
        United Kingdom
      </>
    ),

    action: {
      label: "Directions",
      href: "/stores",
    },

    icon: "location",
  },

  {
    id: "contact",

    title: "Email / Phone",

    description: (
      <>
        info@najibzadeh.com
        <br />
        +44 (0)20 4571 8900
        <br />
        <br />
        Monday — Friday
        <br />
        10:00 — 18:00
      </>
    ),

    action: {
      label: "Email Us",
      href: "mailto:info@najibzadeh.com",
      external: true,
    },

    icon: "contact",
  },
];

export function ContactServicesSection({
  imageSrc,

  imageAlt = "",

  imagePosition = "center",

  methods = DEFAULT_METHODS,

  footerNote = "We value your privacy. All enquiries are handled with the utmost discretion.",

  className = "",
}: ContactServicesSectionProps) {
  const { ref, revealed } = useRevealOnce<HTMLElement>();

  const themeVars = {
    "--services-bg": lightTokens.surfaceBrand,

    "--services-text": brandColors.black.hex,

    "--services-muted": lightTokens.textMuted,

    "--services-border": lightTokens.border,

    "--services-copper": brandColors.copper.hex,
  } as CSSProperties;

  return (
    <section
      ref={ref}
      style={themeVars}
      className={`
        min-h-[100svh]
        md:min-h-[100svh]

        w-full

        bg-[var(--services-bg)]
        text-[var(--services-text)]

        ${className}
      `}
    >
      <div
        className="
          mx-auto

          grid

          min-h-[100svh]
          md:min-h-[100svh]

          w-full
          max-w-[1700px]

          gap-12

          px-6

          py-16

          sm:px-8
          sm:py-20

          lg:grid-cols-[minmax(420px,0.88fr)_minmax(0,1.12fr)]

          lg:items-center
          lg:gap-14

          lg:px-12
          lg:py-24

          xl:gap-20
          xl:px-16
        "
      >
        {/* =====================================================
            IMAGE
        ====================================================== */}

        <div
          className={`
            relative

            min-h-[500px]

            overflow-hidden

            transition-[opacity,transform]
            duration-[900ms]

            ease-[cubic-bezier(0.22,1,0.36,1)]

            sm:min-h-[620px]

            lg:h-[72svh]
            lg:max-h-[800px]

            ${
              revealed
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }
          `}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="
              (max-width: 1023px) 100vw,
              44vw
            "
            loading="lazy"
            draggable={false}
            style={{
              objectPosition: imagePosition,
            }}
            className="
              object-cover
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none

              absolute
              inset-0

              bg-gradient-to-t

              from-black/22
              via-transparent
              to-black/[0.04]
            "
          />

          <div
            className="
              absolute

              bottom-5
              left-5

              text-[7px]
              font-semibold

              uppercase
              tracking-[0.2em]

              text-white/55
            "
          >
            Najibzadeh Private Services
          </div>
        </div>

        {/* =====================================================
            METHODS
        ====================================================== */}

        <div
          className={`
            transition-[opacity,transform]
            duration-[900ms]

            ease-[cubic-bezier(0.22,1,0.36,1)]

            ${
              revealed
                ? "translate-y-0 opacity-100 delay-150"
                : "translate-y-10 opacity-0"
            }
          `}
        >
          {/* =================================================
              SMALL INTRO
          ================================================= */}

          <div
            className="
              mb-8

              lg:hidden
            "
          >
            <div
              className="
                mb-4

                flex
                items-center
                gap-3

                text-[7px]
                font-semibold

                uppercase
                tracking-[0.22em]

                text-[var(--services-copper)]
              "
            >
              <span>Contact</span>

              <span
                className="
                  h-px
                  w-6

                  bg-[var(--services-copper)]
                "
              />
            </div>

            <h2
              className="
                font-serif

                text-[clamp(2.7rem,10vw,4rem)]

                leading-[0.98]
                tracking-[-0.05em]
              "
            >
              Here when you need us.
            </h2>
          </div>

          {/* =================================================
              GRID
          ================================================= */}

          <div
            className="
              grid

              grid-cols-1

              border-l
              border-t
              border-black/10

              sm:grid-cols-2
            "
          >
            {methods.slice(0, 4).map((method) => (
              <ContactMethodCard key={method.id} method={method} />
            ))}
          </div>

          {/* =================================================
              PRIVACY
          ================================================= */}

          <p
            className="
              mt-7

              text-[8px]

              leading-[1.7]

              text-[var(--services-muted)]
            "
          >
            {footerNote}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   METHOD
============================================================================ */

function ContactMethodCard({ method }: { method: ContactMethod }) {
  return (
    <article
      className="
        flex

        min-h-[280px]

        flex-col

        border-b
        border-r
        border-black/10

        p-6

        sm:min-h-[310px]
        sm:p-7

        lg:min-h-[320px]
        lg:p-8
      "
    >
      {/* ICON */}

      <span
        className="
          grid
          size-9

          place-items-center

          text-black/55
        "
      >
        <MethodIcon type={method.icon} />
      </span>

      {/* TITLE */}

      <h3
        className="
          mt-6

          text-[9px]
          font-semibold

          uppercase
          tracking-[0.17em]

          text-black
        "
      >
        {method.title}
      </h3>

      {/* DESCRIPTION */}

      <div
        className="
          mt-4

          max-w-[270px]

          text-[10px]

          leading-[1.8]

          text-black/58
        "
      >
        {method.description}
      </div>

      {/* ACTION */}

      {method.action && (
        <div className="mt-auto pt-6">
          {method.action.external ? (
            <a
              href={method.action.href}
              className="
                group

                inline-flex

                items-center
                gap-3

                border-b
                border-black/30

                pb-1

                text-[7px]
                font-semibold

                uppercase
                tracking-[0.17em]

                text-black

                transition-[border-color,opacity]
                duration-200

                hover:border-black

                hover:opacity-60
              "
            >
              {method.action.label}

              <ArrowSmallIcon />
            </a>
          ) : (
            <Link
              href={method.action.href}
              className="
                group

                inline-flex

                items-center
                gap-3

                border-b
                border-black/30

                pb-1

                text-[7px]
                font-semibold

                uppercase
                tracking-[0.17em]

                text-black

                transition-[border-color,opacity]
                duration-200

                hover:border-black

                hover:opacity-60
              "
            >
              {method.action.label}

              <ArrowSmallIcon />
            </Link>
          )}
        </div>
      )}
    </article>
  );
}

/* ==========================================================================
   ICONS
============================================================================ */

function MethodIcon({ type }: { type: ContactMethod["icon"] }) {
  if (type === "appointment") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-6"
        aria-hidden="true"
      >
        <path
          d="M9 3H15L17 8V15L15 18H9L7 15V8L9 3Z"
          stroke="currentColor"
          strokeWidth="1"
        />

        <path d="M12 18V22M8 22H16" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  }

  if (type === "service") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-6"
        aria-hidden="true"
      >
        <path
          d="M7 13L5 10C4 8 5 6 7 7L10 10"
          stroke="currentColor"
          strokeWidth="1"
        />

        <path
          d="M10 10L12 5M12 10L15 4M14 11L18 6M16 13L20 10"
          stroke="currentColor"
          strokeWidth="1"
        />

        <path
          d="M7 13L10 18C12 21 17 20 19 16L20 10"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>
    );
  }

  if (type === "location") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-6"
        aria-hidden="true"
      >
        <path
          d="M12 21C12 21 18 15.5 18 10C18 6.7 15.3 4 12 4C8.7 4 6 6.7 6 10C6 15.5 12 21 12 21Z"
          stroke="currentColor"
          strokeWidth="1"
        />

        <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden="true">
      <path d="M4 6H20V17H4V6Z" stroke="currentColor" strokeWidth="1" />

      <path d="M4 7L12 13L20 7" stroke="currentColor" strokeWidth="1" />

      <path d="M17 18L19 20L22 16" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function ArrowSmallIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="
        size-3

        transition-transform
        duration-200

        group-hover:translate-x-0.5
      "
    >
      <path
        d="M2.5 8H13M9.5 4.5L13 8L9.5 11.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

/* ==========================================================================
   REVEAL
============================================================================ */

function useRevealOnce<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;

        requestAnimationFrame(() => setRevealed(true));

        observer.disconnect();
      },
      {
        threshold: 0.08,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return {
    ref,
    revealed,
  };
}
