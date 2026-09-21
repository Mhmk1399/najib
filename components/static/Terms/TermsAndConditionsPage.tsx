"use client";

import Image from "next/image";

import { type CSSProperties, useEffect, useState } from "react";

import { ArrowLeftIcon, ArrowRightIcon, Button } from "@/components/ui/Button";

import type { TermsCopy } from "@/lib/i18n/terms-copy";

import {
  getHtmlLang,
  getLocaleDirection,
  type Locale,
} from "@/lib/i18n/config";

import { localizedHref } from "@/lib/i18n/routes";

import { brandColors, darkTokens } from "@/theme/theme-colors";

/* ==========================================================================
   TYPES
============================================================================ */

type TermsSection = TermsCopy["sections"][number];

type TermsAndConditionsPageProps = {
  copy: TermsCopy;
  locale: Locale;

  heroImage: string;
  heroImagePosition?: string;

  /**
   * Pass this value from the Server Component.
   * This keeps the first SSR/client render deterministic.
   */
  currentYear: number;
};

/* ==========================================================================
   HELPERS
============================================================================ */

function formatIndex(value: number, locale: Locale) {
  return new Intl.NumberFormat(getHtmlLang(locale), {
    minimumIntegerDigits: 2,
    useGrouping: false,
  }).format(value);
}

function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(getHtmlLang(locale), {
    useGrouping: false,
  }).format(value);
}

function formatTemplate(
  template: string,
  values: Record<string, string | number>,
) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

/* ==========================================================================
   COMPONENT
============================================================================ */

export function TermsAndConditionsPage({
  copy,
  locale,
  heroImage,
  heroImagePosition = "center",
  currentYear,
}: TermsAndConditionsPageProps) {
  const sections = copy.sections;

  const direction = getLocaleDirection(locale);

  const htmlLang = getHtmlLang(locale);

  const isRtl = direction === "rtl";

  const ActionIcon = isRtl ? ArrowLeftIcon : ArrowRightIcon;

  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? "");

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
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element));

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
  }, [sections]);

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

  const formattedYear = formatNumber(currentYear, locale);

  const copyrightText = formatTemplate(copy.footer.copyrightTemplate, {
    year: formattedYear,
  });

  return (
    <main
      style={themeVars}
      dir={direction}
      lang={htmlLang}
      className="
        min-h-screen
        overflow-x-clip
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
              isolate
              mt-2

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
              alt={copy.hero.imageAlt}
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

            {/* HERO READABILITY */}

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-0
                -z-20

                bg-[linear-gradient(90deg,rgb(var(--legal-black-rgb)/0.62)_0%,rgb(var(--legal-black-rgb)/0.38)_50%,rgb(var(--legal-black-rgb)/0.62)_100%)]
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

                left-1/2
                top-7
                -translate-x-1/2

                hidden

                text-center

                text-[8px]
                font-medium

                uppercase
                tracking-[0.5em]

                text-white/45

                md:block
                md:top-10
              "
            >
              {copy.hero.brandMark}
            </div>

            {/* HERO CONTENT */}

            <div
              className="
                flex

                min-h-[400px]

                items-end
                justify-center

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
                  mx-auto
                  max-w-[620px]
                  text-center
                "
              >
                {/* EYEBROW */}

                <div
                  className="
                    mb-6

                    flex
                    items-center
                    justify-center
                    gap-3

                    text-[7px]
                    font-semibold

                    uppercase
                    tracking-[0.24em]

                    text-[var(--legal-copper)]

                    sm:text-[8px]
                  "
                >
                  <span
                    aria-hidden="true"
                    className="
                      h-px
                      w-6
                      bg-[var(--legal-copper)]
                    "
                  />

                  <span>{copy.hero.eyebrow}</span>

                  <span
                    aria-hidden="true"
                    className="
                      h-px
                      w-6
                      bg-[var(--legal-copper)]
                    "
                  />
                </div>

                <h1
                  className="
                    text-center

                    text-[clamp(3.1rem,11vw,5rem)]
                    font-normal

                    leading-[0.94]
                    tracking-[-0.055em]

                    text-white

                    md:text-[clamp(4.5rem,6vw,6.4rem)]
                  "
                >
                  {copy.hero.title}
                </h1>

                <p
                  className="
                    mx-auto
                    mt-6

                    max-w-[430px]

                    text-center
                    text-[9px]

                    leading-[1.8]

                    text-white/55

                    sm:text-[10px]
                  "
                >
                  {copy.hero.description}
                </p>

                {/* LAST UPDATED */}

                <div
                  className="
                    mt-7

                    flex
                    flex-wrap

                    items-center
                    justify-center

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
                    {copy.hero.lastUpdatedLabel}
                  </span>

                  <span
                    aria-hidden="true"
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
                    {copy.hero.lastUpdated}
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

              print:hidden
            "
          >
            <summary
              className="
                flex

                min-h-[64px]

                cursor-pointer

                list-none

                items-center
                justify-center
                gap-3

                px-5

                text-[8px]
                font-semibold

                uppercase
                tracking-[0.19em]

                text-white/65

                [&::-webkit-details-marker]:hidden
              "
            >
              <span>{copy.navigation.title}</span>

              <MenuListIcon />
            </summary>

            <nav
              aria-label={copy.navigation.ariaLabel}
              className="
                grid

                border-t
                border-white/10

                sm:grid-cols-2
              "
            >
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => goToSection(section.id)}
                  className="
                      flex

                      min-h-[54px]

                      items-center
                      justify-center

                      border-b
                      border-white/10

                      px-5

                      text-center

                      transition-colors

                      hover:bg-white/[0.04]

                      focus-visible:outline-none
                      focus-visible:ring-1
                      focus-visible:ring-inset
                      focus-visible:ring-white/50
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
                    {formatIndex(index + 1, locale)}
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
              className={`
                relative

                hidden

                border-white/10

                lg:block

                print:hidden

                ${isRtl ? "border-l" : "border-r"}
              `}
            >
              <div
                data-lenis-prevent=""
                className={`
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
                  py-10

                  xl:px-9
                  xl:py-12

                  ${isRtl ? "pr-5 xl:pr-7" : "pl-5 xl:pl-7"}
                `}
              >
                {/* SIDEBAR EYEBROW */}

                <p
                  className="
                    mb-6

                    text-center

                    text-[7px]
                    font-semibold

                    uppercase
                    tracking-[0.22em]

                    text-[var(--legal-copper)]
                  "
                >
                  {copy.navigation.title}
                </p>

                {/* DESKTOP NAVIGATION */}

                <nav aria-label={copy.navigation.ariaLabel}>
                  <ol className="space-y-0.5">
                    {sections.map((section, index) => {
                      const active = activeSection === section.id;

                      return (
                        <li key={section.id}>
                          <button
                            type="button"
                            onClick={() => goToSection(section.id)}
                            aria-current={active ? "location" : undefined}
                            className={`
                                group
                                relative

                                flex

                                min-h-[38px]
                                w-full

                                cursor-pointer

                                items-center
                                justify-center

                                text-center

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
                              {formatIndex(index + 1, locale)}
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
                                  top-1/2

                                  h-px

                                  -translate-y-1/2

                                  bg-white

                                  transition-[width,opacity]
                                  duration-300

                                  ${
                                    isRtl
                                      ? "-left-7 xl:-left-9"
                                      : "-right-7 xl:-right-9"
                                  }

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

                {/* PRINT UTILITY */}

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
                      w-full

                      cursor-pointer

                      items-center
                      justify-center
                      gap-3

                      text-[7px]
                      font-semibold

                      uppercase
                      tracking-[0.17em]

                      text-white/45

                      transition-colors

                      hover:text-white

                      focus-visible:outline-none
                      focus-visible:ring-1
                      focus-visible:ring-white/60
                      focus-visible:ring-offset-2
                      focus-visible:ring-offset-[var(--legal-surface)]
                    "
                  >
                    <PrintIcon />

                    {copy.navigation.printLabel}
                  </button>
                </div>
              </div>
            </aside>

            {/* ==========================================================
                TERMS CONTENT
            =========================================================== */}

            <div
              className="
                px-5
                py-4

                text-center

                sm:px-8

                md:px-10

                lg:px-12
                lg:py-5

                xl:px-16
              "
            >
              {sections.map((section, index) => (
                <LegalSection
                  key={section.id}
                  section={section}
                  index={index}
                  locale={locale}
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

                  print:hidden
                "
              >
                {/* COPY */}

                <div
                  className="
                    p-6
                    text-center

                    sm:p-8

                    lg:p-10
                  "
                >
                  <div
                    className="
                      mb-4

                      flex

                      items-center
                      justify-center
                      gap-3

                      text-[7px]
                      font-semibold

                      uppercase
                      tracking-[0.2em]

                      text-[var(--legal-copper)]
                    "
                  >
                    <span
                      aria-hidden="true"
                      className="
                        h-px
                        w-5
                        bg-[var(--legal-copper)]
                      "
                    />

                    <span>{copy.support.eyebrow}</span>

                    <span
                      aria-hidden="true"
                      className="
                        h-px
                        w-5
                        bg-[var(--legal-copper)]
                      "
                    />
                  </div>

                  <h2
                    className="
                      text-[clamp(2.2rem,6vw,3.4rem)]
                      font-normal

                      leading-[0.98]
                      tracking-[-0.045em]
                    "
                  >
                    {copy.support.title}
                  </h2>

                  <p
                    className="
                      mx-auto
                      mt-4

                      max-w-[480px]

                      text-center
                      text-[9px]

                      leading-[1.75]

                      text-black/55

                      sm:text-[10px]
                    "
                  >
                    {copy.support.description}
                  </p>
                </div>

                {/* ACTION */}

                <div
                  className={`
                    border-t
                    border-black/10

                    p-6

                    sm:border-t-0
                    sm:p-8

                    ${isRtl ? "sm:border-r" : "sm:border-l"}
                  `}
                >
                  <Button
                    href={localizedHref(copy.support.action.href, locale)}
                    variant="black"
                    size="lg"
                    icon={<ActionIcon />}
                    iconPosition="right"
                    fullWidth
                  >
                    {copy.support.action.label}
                  </Button>

                  <a
                    href={`mailto:${copy.support.email}`}
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
                    {copy.support.email}
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

            items-center
            justify-center

            gap-3

            text-center
            text-[6px]
            font-medium

            uppercase
            tracking-[0.18em]

            text-white/25

            sm:flex-row
            sm:items-center
            sm:justify-center

            print:text-black/50
          "
        >
          <span>{copyrightText}</span>

          <span
            aria-hidden="true"
            className="
              hidden
              h-px
              w-5
              bg-current
              opacity-30

              sm:block
            "
          />

          <span>{copy.footer.legalLabel}</span>
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
  locale,
}: {
  section: TermsSection;
  index: number;
  locale: Locale;
}) {
  return (
    <section
      id={section.id}
      className="
        scroll-mt-28

        flex
        flex-col
        items-center

        border-b
        border-white/10

        py-8

        text-center

        sm:py-9
        lg:py-10

        print:border-black/10
      "
    >
      {/* NUMBER */}

      <div className="mb-4">
        <span
          className="
            text-[22px]

            tabular-nums

            text-white/28

            lg:text-[26px]

            print:text-black/30
          "
        >
          {formatIndex(index + 1, locale)}
        </span>
      </div>

      {/* CONTENT */}

      <div
        className="
          mx-auto
          max-w-[880px]
          text-center
        "
      >
        <h2
          className="
            text-[22px]
            font-normal

            leading-[1.1]
            tracking-[-0.035em]

            text-white

            sm:text-[24px]

            lg:text-[27px]

            print:text-black
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
                  mx-auto
                  max-w-[820px]

                  text-center
                  text-[9px]

                  leading-[1.85]

                  text-white/50

                  sm:text-[10px]

                  lg:text-[11px]

                  print:text-black/65
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
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-4">
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
