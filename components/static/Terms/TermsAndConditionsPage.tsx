"use client";

import Image from "next/image";

import { type CSSProperties, useEffect, useState } from "react";

import { brandColors, darkTokens, fontTokens } from "@/theme/theme-colors";

import { ArrowRightIcon, Button } from "@/components/ui/Button";

/* ==========================================================================
   TYPES
============================================================================ */

type TermsSection = {
  id: string;

  title: string;

  paragraphs: string[];
};

/* ==========================================================================
   DATA

   IMPORTANT:
   این متن فعلاً placeholder است.
   بعداً متن حقوقی نهایی را جایگزین کن.
============================================================================ */

const TERMS_SECTIONS: TermsSection[] = [
  {
    id: "introduction",

    title: "Introduction",

    paragraphs: [
      "Welcome to Najibzadeh. These Terms & Conditions govern your access to and use of our website, digital services and any purchases made through our online experience.",

      "By accessing or using this website, you acknowledge that you have read, understood and agreed to these terms.",
    ],
  },

  {
    id: "use-of-site",

    title: "Use of Our Site",

    paragraphs: [
      "You may use this website only for lawful purposes and in a manner that does not infringe the rights of others or restrict their ability to access and enjoy the Najibzadeh experience.",

      "You may not misuse, reproduce, interfere with or attempt to gain unauthorised access to any part of our website, systems or services.",
    ],
  },

  {
    id: "products-orders",

    title: "Products & Orders",

    paragraphs: [
      "All products are subject to availability. We reserve the right to limit quantities, discontinue products or refuse an order where reasonably necessary.",

      "An order is considered accepted only after you receive confirmation from Najibzadeh that the order has been processed.",
    ],
  },

  {
    id: "pricing-payment",

    title: "Pricing & Payment",

    paragraphs: [
      "Prices displayed on our website are shown in the applicable currency and may include taxes where required by law.",

      "We take reasonable care to ensure pricing information is accurate. If an error is identified before fulfilment, we may contact you before proceeding with the order.",
    ],
  },

  {
    id: "shipping-delivery",

    title: "Shipping & Delivery",

    paragraphs: [
      "Estimated delivery times are provided as guidance and may vary depending on destination, product availability and circumstances outside our reasonable control.",

      "Risk in purchased products passes in accordance with the applicable delivery arrangements and local consumer law.",
    ],
  },

  {
    id: "returns-exchanges",

    title: "Returns & Exchanges",

    paragraphs: [
      "Eligible products may be returned or exchanged within the period specified in our Returns Policy, provided they remain unused, unworn and in their original condition.",

      "Certain personalised, made-to-order or hygiene-sensitive products may be excluded from return where permitted by law.",
    ],
  },

  {
    id: "intellectual-property",

    title: "Intellectual Property",

    paragraphs: [
      "All content appearing on this website, including trademarks, photography, designs, text, graphics, video and brand elements, is owned by or licensed to Najibzadeh.",

      "No content may be copied, reproduced, distributed or commercially exploited without prior written permission.",
    ],
  },

  {
    id: "limitation-liability",

    title: "Limitation of Liability",

    paragraphs: [
      "Nothing in these terms excludes or limits liability that cannot lawfully be excluded. To the extent permitted by law, Najibzadeh is not responsible for indirect or consequential loss arising from use of this website.",

      "We endeavour to maintain an accurate and uninterrupted digital experience but do not guarantee that the website will always be available or free from technical error.",
    ],
  },

  {
    id: "governing-law",

    title: "Governing Law",

    paragraphs: [
      "These terms are governed by the laws applicable to the Najibzadeh entity responsible for your transaction, subject to any mandatory consumer protections available in your jurisdiction.",
    ],
  },

  {
    id: "changes",

    title: "Changes to These Terms",

    paragraphs: [
      "We may update these Terms & Conditions from time to time to reflect changes to our services, operations or legal obligations.",

      "The version published on this page at the time of your visit will be the current version.",
    ],
  },

  {
    id: "contact",

    title: "Contact Us",

    paragraphs: [
      "If you have questions regarding these Terms & Conditions, an order or your experience with Najibzadeh, our Client Services team will be pleased to assist you.",
    ],
  },
];

/* ==========================================================================
   COMPONENT
============================================================================ */

type TermsAndConditionsPageProps = {
  heroImage: string;

  heroImageAlt?: string;

  heroImagePosition?: string;

  lastUpdated?: string;
};

export function TermsAndConditionsPage({
  heroImage,

  heroImageAlt = "",

  heroImagePosition = "center",

  lastUpdated = "August 2026",
}: TermsAndConditionsPageProps) {
  const [activeSection, setActiveSection] = useState(TERMS_SECTIONS[0].id);

  const themeVars = {
    "--legal-bg": darkTokens.canvas,

    "--legal-surface": darkTokens.surface,

    "--legal-muted": darkTokens.textMuted,

    "--legal-soft": darkTokens.textSoft,

    "--legal-border": darkTokens.border,

    "--legal-border-strong": darkTokens.borderStrong,

    "--legal-text": darkTokens.text,

    "--legal-copper": brandColors.copper.hex,

    "--legal-scrollbar-thumb": `rgb(${brandColors.copper.rgb} / 0.74)`,

    "--legal-scrollbar-thumb-hover": `rgb(${brandColors.copper.rgb} / 0.94)`,

    "--legal-scrollbar-track": "rgb(255 255 255 / 0.08)",

    "--legal-black-rgb": brandColors.black.rgb,
  } as CSSProperties;

  /* ==========================================================================
     ACTIVE SECTION
  ========================================================================== */

  useEffect(() => {
    const elements = TERMS_SECTIONS.map((section) =>
      document.getElementById(section.id),
    ).filter((element): element is HTMLElement => Boolean(element));

    if (!elements.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) {
          return;
        }

        setActiveSection(visible.target.id);
      },
      {
        rootMargin: "-22% 0px -58% 0px",

        threshold: [0, 0.1, 0.25, 0.5],
      },
    );

    elements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  function goToSection(id: string) {
    const element = document.getElementById(id);

    if (!element) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    element.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",

      block: "start",
    });
  }

  function printTerms() {
    window.print();
  }

  return (
    <main
      style={{
        ...themeVars,

        fontFamily: fontTokens.english,
      }}
      className="
        min-h-screen

        bg-[var(--legal-bg)]
        text-[var(--legal-text)]

        print:bg-white
        print:text-black
      "
    >
      {/* ================================================================
          OUTER FRAME
      ================================================================= */}

      <div
        className="
          mx-auto

          w-full
          max-w-[1640px]

          px-4

          pb-12
          pt-24

          sm:px-6
          sm:pb-16

          md:pt-28

          lg:px-8
          lg:pb-24
        "
      >
        <div
          className="
            border
            border-white/10

            bg-[var(--legal-surface)]

            print:border-0
            print:bg-white
          "
        >
          {/* ============================================================
              HERO
          ============================================================= */}

          <section
            className="
              relative
              isolate mt-2

              min-h-[400px]

              overflow-hidden

              border-b
              border-white/10

              sm:min-h-[460px]

              md:min-h-[520px]
            "
          >
            <Image
              src={heroImage}
              alt={heroImageAlt}
              fill
              priority
              sizes="100vw"
              draggable={false}
              style={{
                objectPosition: heroImagePosition,
              }}
              className="
                -z-30

                object-cover
              "
            />

            {/* left readability */}

            <div
              aria-hidden="true"
              className="
                pointer-events-none

                absolute
                inset-0
                -z-20

                bg-[linear-gradient(90deg,rgb(var(--legal-black-rgb)/0.96)_0%,rgb(var(--legal-black-rgb)/0.84)_34%,rgb(var(--legal-black-rgb)/0.32)_62%,rgb(var(--legal-black-rgb)/0.08)_100%)]
              "
            />

            <div
              aria-hidden="true"
              className="
                pointer-events-none

                absolute
                inset-0
                -z-10

                bg-[linear-gradient(180deg,rgb(var(--legal-black-rgb)/0.08)_0%,rgb(var(--legal-black-rgb)/0.10)_60%,rgb(var(--legal-black-rgb)/0.52)_100%)]
              "
            />

            {/* BRAND MARK */}

            <div
              className="
                absolute

                right-6
                top-7

                hidden

                text-[8px]
                font-medium

                uppercase
                tracking-[0.5em]

                text-white/45

                md:block
                md:right-10
                md:top-10
              "
            >
              Najibzadeh
            </div>

            {/* HERO CONTENT */}

            <div
              className="
                flex

                min-h-[400px]

                items-end

                px-6

                pb-10
                pt-28

                sm:min-h-[460px]
                sm:px-8
                sm:pb-12

                md:min-h-[520px]
                md:items-center

                md:px-12
                md:pb-0
                md:pt-20

                lg:px-16
              "
            >
              <div
                className="
                  max-w-[620px]
                "
              >
                {/* eyebrow */}

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

                    text-[var(--legal-copper)]

                    sm:text-[8px]
                  "
                >
                  <span>Legal / Najibzadeh</span>

                  <span
                    className="
                      h-px
                      w-6

                      bg-[var(--legal-copper)]
                    "
                  />
                </div>

                <h1
                  className="
                    font-serif

                    text-[clamp(3.1rem,11vw,5rem)]
                    font-normal

                    leading-[0.94]
                    tracking-[-0.055em]

                    text-white

                    md:text-[clamp(4.5rem,6vw,6.4rem)]
                  "
                >
                  Terms &amp;
                  <br />
                  Conditions
                </h1>

                <p
                  className="
                    mt-6

                    max-w-[390px]

                    text-[9px]

                    leading-[1.8]

                    text-white/55

                    sm:text-[10px]
                  "
                >
                  These terms govern your use of the Najibzadeh website and the
                  services and products available through it.
                </p>

                <div
                  className="
                    mt-7

                    flex
                    flex-wrap

                    items-center
                    gap-x-5
                    gap-y-3
                  "
                >
                  <span
                    className="
                      text-[7px]
                      font-medium

                      uppercase
                      tracking-[0.17em]

                      text-white/35
                    "
                  >
                    Last updated
                  </span>

                  <span
                    className="
                      h-px
                      w-6

                      bg-white/20
                    "
                  />

                  <span
                    className="
                      text-[8px]

                      text-white/60
                    "
                  >
                    {lastUpdated}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================
              MOBILE CONTENTS
          ============================================================= */}

          <details
            className="
              border-b
              border-white/10

              lg:hidden
            "
          >
            <summary
              className="
                flex

                min-h-[64px]

                cursor-pointer

                list-none

                items-center
                justify-between

                px-5

                text-[8px]
                font-semibold

                uppercase
                tracking-[0.19em]

                text-white/65

                [&::-webkit-details-marker]:hidden
              "
            >
              <span>On this page</span>

              <MenuListIcon />
            </summary>

            <nav
              aria-label="Terms sections"
              className="
                grid

                border-t
                border-white/10

                sm:grid-cols-2
              "
            >
              {TERMS_SECTIONS.map((section, index) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => goToSection(section.id)}
                  className="
                      flex

                      min-h-[54px]

                      items-center

                      border-b
                      border-white/10

                      px-5

                      text-left

                      transition-colors

                      hover:bg-white/[0.04]
                    "
                >
                  <span
                    className="
                        w-8

                        shrink-0

                        text-[7px]

                        tabular-nums

                        text-white/25
                      "
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span
                    className="
                        text-[9px]

                        text-white/65
                      "
                  >
                    {section.title}
                  </span>
                </button>
              ))}
            </nav>
          </details>

          {/* ============================================================
              MAIN LEGAL AREA
          ============================================================= */}

          <div
            className="
              grid

              lg:grid-cols-[280px_minmax(0,1fr)]

              xl:grid-cols-[310px_minmax(0,1fr)]
            "
          >
            {/* ==========================================================
                DESKTOP SIDEBAR
            =========================================================== */}

            <aside
              className="
                relative

                hidden

                border-r
                border-white/10

                lg:block

                print:hidden
              "
            >
              <div
                data-lenis-prevent=""
                className="
                  sticky

                  top-[104px]

                  max-h-[calc(100svh-128px)]
                  overflow-y-auto
                  overscroll-contain
                  [scrollbar-color:var(--legal-scrollbar-thumb)_var(--legal-scrollbar-track)]
                  [scrollbar-gutter:stable]
                  [scrollbar-width:thin]
                  [&::-webkit-scrollbar]:w-2
                  [&::-webkit-scrollbar-track]:bg-[var(--legal-scrollbar-track)]
                  [&::-webkit-scrollbar-thumb]:rounded-full
                  [&::-webkit-scrollbar-thumb]:bg-[var(--legal-scrollbar-thumb)]
                  [&::-webkit-scrollbar-thumb]:border-2
                  [&::-webkit-scrollbar-thumb]:border-solid
                  [&::-webkit-scrollbar-thumb]:border-[var(--legal-surface)]
                  [&::-webkit-scrollbar-thumb:hover]:bg-[var(--legal-scrollbar-thumb-hover)]

                  px-7
                  pr-5
                  py-10

                  xl:px-9
                  xl:pr-7
                  xl:py-12
                "
              >
                {/* eyebrow */}

                <p
                  className="
                    mb-6

                    text-[7px]
                    font-semibold

                    uppercase
                    tracking-[0.22em]

                    text-[var(--legal-copper)]
                  "
                >
                  On this page
                </p>

                {/* nav */}

                <nav aria-label="Terms sections">
                  <ol className="space-y-0.5">
                    {TERMS_SECTIONS.map((section, index) => {
                      const active = activeSection === section.id;

                      return (
                        <li key={section.id}>
                          <button
                            type="button"
                            onClick={() => goToSection(section.id)}
                            className={`
                                group

                                relative

                                flex
                                min-h-[38px]

                                w-full

                                items-center

                                text-left

                                cursor-pointer

                                transition-opacity
                                duration-200

                                focus-visible:outline-none
                                focus-visible:ring-1
                                focus-visible:ring-white/60
                                focus-visible:ring-offset-2
                                focus-visible:ring-offset-[var(--legal-surface)]

                                ${
                                  active
                                    ? "opacity-100"
                                    : "opacity-45 hover:opacity-80"
                                }
                              `}
                            aria-current={active ? "location" : undefined}
                          >
                            <span
                              className="
                                  w-8

                                  shrink-0

                                  text-[7px]

                                  tabular-nums

                                  text-white/35
                                "
                            >
                              {String(index + 1).padStart(2, "0")}
                            </span>

                            <span
                              className="
                                  text-[9px]

                                  text-white
                                "
                            >
                              {section.title}
                            </span>

                            <span
                              aria-hidden="true"
                              className={`
                                  absolute

                                  -left-7
                                  top-1/2

                                  h-px

                                  -translate-y-1/2

                                  bg-white

                                  transition-[width,opacity]
                                  duration-300

                                  xl:-left-9

                                  ${
                                    active ? "w-4 opacity-100" : "w-0 opacity-0"
                                  }
                                `}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </nav>

                {/* utility */}

                <div
                  className="
                    mt-10

                    border-t
                    border-white/10

                    pt-7
                  "
                >
                  <button
                    type="button"
                    onClick={printTerms}
                    className="
                      group

                      flex

                      items-center
                      gap-3

                      text-[7px]
                      font-semibold

                      uppercase
                      tracking-[0.17em]

                      text-white/45

                      transition-colors

                      cursor-pointer

                      hover:text-white

                      focus-visible:outline-none
                      focus-visible:ring-1
                      focus-visible:ring-white/60
                      focus-visible:ring-offset-2
                      focus-visible:ring-offset-[var(--legal-surface)]
                    "
                  >
                    <PrintIcon />
                    Print / Save PDF
                  </button>
                </div>
              </div>
            </aside>

            {/* ==========================================================
                TERMS
            =========================================================== */}

            <div
              className="
                px-5

                py-4

                sm:px-8

                md:px-10

                lg:px-12
                lg:py-5

                xl:px-16
              "
            >
              {TERMS_SECTIONS.map((section, index) => (
                <LegalSection
                  key={section.id}
                  section={section}
                  index={index}
                />
              ))}

              {/* ========================================================
                  SUPPORT CTA
              ========================================================= */}

              <div
                className="
                  my-10

                  grid

                  border
                  border-white/10

                  bg-white

                  text-black

                  sm:grid-cols-[minmax(0,1fr)_240px]

                  sm:items-center

                  lg:my-14
                "
              >
                <div
                  className="
                    p-6

                    sm:p-8

                    lg:p-10
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
                      tracking-[0.2em]

                      text-[var(--legal-copper)]
                    "
                  >
                    <span>Client Services</span>

                    <span
                      className="
                        h-px
                        w-5

                        bg-[var(--legal-copper)]
                      "
                    />
                  </div>

                  <h2
                    className="
                      font-serif

                      text-[clamp(2.2rem,6vw,3.4rem)]
                      font-normal

                      leading-[0.98]
                      tracking-[-0.045em]
                    "
                  >
                    We&apos;re here for you.
                  </h2>

                  <p
                    className="
                      mt-4

                      max-w-[480px]

                      text-[9px]

                      leading-[1.75]

                      text-black/55

                      sm:text-[10px]
                    "
                  >
                    If you have questions about these terms, an order or your
                    experience with Najibzadeh, our team will be pleased to
                    assist.
                  </p>
                </div>

                <div
                  className="
                    border-t
                    border-black/10

                    p-6

                    sm:border-l
                    sm:border-t-0
                    sm:p-8
                  "
                >
                  <Button
                    href="/contact"
                    variant="black"
                    size="lg"
                    icon={<ArrowRightIcon />}
                    fullWidth
                  >
                    Contact Us
                  </Button>

                  <a
                    href="mailto:clientservices@najibzadeh.com"
                    className="
                      mt-4

                      block

                      text-center

                      text-[8px]

                      text-black/45

                      transition-colors

                      hover:text-black
                    "
                  >
                    clientservices@ najibzadeh.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================
            BOTTOM META
        ================================================================= */}

        <div
          className="
            mt-5

            flex

            flex-col

            gap-3

            text-[6px]
            font-medium

            uppercase
            tracking-[0.18em]

            text-white/25

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <span>© {new Date().getFullYear()} Najibzadeh</span>

          <span>Terms & Conditions / Legal</span>
        </div>
      </div>
    </main>
  );
}

/* ==========================================================================
   LEGAL SECTION
============================================================================ */

function LegalSection({
  section,

  index,
}: {
  section: TermsSection;

  index: number;
}) {
  return (
    <section
      id={section.id}
      className="
        scroll-mt-28

        grid

        border-b
        border-white/10

        py-8

        sm:grid-cols-[60px_minmax(0,1fr)]

        sm:py-9

        lg:grid-cols-[80px_minmax(0,1fr)]
        lg:py-10
      "
    >
      {/* number */}

      <div
        className="
          mb-4

          sm:mb-0
        "
      >
        <span
          className="
            font-serif

            text-[22px]

            tabular-nums

            text-white/28

            lg:text-[26px]
          "
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* content */}

      <div
        className="
          max-w-[880px]
        "
      >
        <h2
          className="
            font-serif

            text-[22px]
            font-normal

            leading-[1.1]

            tracking-[-0.035em]

            text-white

            sm:text-[24px]

            lg:text-[27px]
          "
        >
          {section.title}
        </h2>

        <div
          className="
            mt-4

            space-y-3
          "
        >
          {section.paragraphs.map((paragraph, paragraphIndex) => (
            <p
              key={paragraphIndex}
              className="
                  max-w-[820px]

                  text-[9px]

                  leading-[1.85]

                  text-white/50

                  sm:text-[10px]

                  lg:text-[11px]
                "
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   ICONS
============================================================================ */

function PrintIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="
        size-4
      "
    >
      <path d="M6 7V3H14V7" stroke="currentColor" strokeWidth="1" />

      <path d="M5 14H3V8H17V14H15" stroke="currentColor" strokeWidth="1" />

      <path d="M6 11H14V17H6V11Z" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function MenuListIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="
        size-4

        text-white/40
      "
    >
      <path d="M5 6H17M5 10H17M5 14H17" stroke="currentColor" strokeWidth="1" />

      <path d="M2 6H3M2 10H3M2 14H3" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
