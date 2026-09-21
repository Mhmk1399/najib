import Link from "next/link";

import { ArrowLeft, ArrowRight } from "lucide-react";

import type { PrivacyCopy } from "@/lib/i18n/privacy-copy";

import {
  getHtmlLang,
  getLocaleDirection,
  type Locale,
} from "@/lib/i18n/config";

import { localizedHref } from "@/lib/i18n/routes";

/* ==========================================================================
   TYPES
============================================================================ */

type PolicyPageProps = {
  copy: PrivacyCopy;
  locale: Locale;
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

/* ==========================================================================
   COMPONENT
============================================================================ */

export function PolicyPage({ copy, locale }: PolicyPageProps) {
  const direction = getLocaleDirection(locale);

  const htmlLang = getHtmlLang(locale);

  const isRtl = direction === "rtl";

  const ActionIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <main
      dir={direction}
      lang={htmlLang}
      className="
        min-h-screen
        overflow-x-clip
        bg-[#F6F2EB]
        text-[#0B0B0B]
      "
    >
      {/* ================================================================
          HERO
      ================================================================= */}

      <header
        className="
          border-b
          border-black/[0.1]

          bg-[#0B0B0B]

          px-6
          py-20

          text-white

          sm:px-10
          sm:py-28

          lg:px-16
          lg:py-36
        "
      >
        <div
          className="
            mx-auto
            max-w-[1100px]
          "
        >
          {/* EYEBROW */}

          <div
            className="
              flex
              items-center
              gap-3

              text-[10px]
              font-medium

              text-[#C69A73]
            "
          >
            <span
              aria-hidden="true"
              className="
                h-px
                w-8
                bg-[#B7835A]
              "
            />

            <span>{copy.hero.eyebrow}</span>
          </div>

          {/* TITLE */}

          <h1
            className="
              mt-6

              max-w-[720px]

              text-balance

              text-[clamp(2.5rem,6vw,5.4rem)]
              font-semibold

              leading-[1.08]
              tracking-[-0.045em]
            "
          >
            {copy.hero.title}
          </h1>

          {/* INTRO */}

          <p
            className="
              mt-7

              max-w-[680px]

              text-pretty
              text-[13px]

              leading-8

              text-white/62

              sm:text-[15px]
            "
          >
            {copy.hero.intro}
          </p>

          {/* CONTACT */}

          <Link
            href={localizedHref(copy.hero.contactAction.href, locale)}
            className="
              mt-10

              inline-flex
              items-center
              gap-2

              border-b
              border-white/30

              pb-2

              text-[10px]
              text-white/72

              transition-colors

              hover:border-white
              hover:text-white

              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#D2B08D]
            "
          >
            <span>{copy.hero.contactAction.label}</span>

            <ActionIcon aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      </header>

      {/* ================================================================
          POLICY SECTIONS
      ================================================================= */}

      <div
        className="
          mx-auto
          w-full
          max-w-[1100px]

          px-6
          py-12

          sm:px-10
          sm:py-20

          lg:px-16
          lg:py-28
        "
      >
        {copy.sections.map((section, index) => (
          <section
            id={section.id}
            key={section.id}
            className="
                grid

                gap-5

                border-b
                border-black/[0.12]

                py-8

                first:pt-0

                sm:grid-cols-[120px_minmax(0,1fr)]
                sm:gap-10
                sm:py-10
              "
          >
            {/* NUMBER */}

            <span
              className="
                  text-[10px]
                  font-medium

                  tabular-nums

                  text-[#A06F48]
                "
            >
              {formatIndex(index + 1, locale)}
            </span>

            {/* CONTENT */}

            <div>
              <h2
                className="
                    text-[20px]
                    font-semibold

                    leading-8
                    tracking-[-0.02em]

                    sm:text-[24px]
                  "
              >
                {section.title}
              </h2>

              <p
                className="
                    mt-4

                    max-w-[720px]

                    text-[13px]

                    leading-8

                    text-black/62

                    sm:text-[14px]
                  "
              >
                {section.body}
              </p>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
