/**
 * faq-section.tsx — Server Component
 *
 * Reusable FAQ section with:
 * - Server-rendered heading, description, questions and answers
 * - Dynamic section background (page / warm / surface)
 * - Dynamic heading level (h2 / h3)
 * - Optional FAQPage JSON-LD
 * - One-time entrance animation via Reveal
 * - All content passed through typed props
 *
 * No "use client" — no useState, no useEffect, no browser APIs.
 */

import Link from "next/link";
import type {
  FaqSectionProps,
  FaqSurface,
  FaqHeadingElement,
} from "./faq.types";
import { FaqAccordionClient } from "./faq-accordion-client";
import { FaqJsonLd } from "./faq-json-ld";
import { ArrowIcon } from "./faq-icons";
import { Reveal } from "@/components/static/home/motion/reveal";
import {
  HOME_DESCRIPTION_TEXT_CLASS,
  HOME_EYEBROW_ACCENT_CLASS,
  HOME_EYEBROW_LINE_CLASS,
  HOME_EYEBROW_MUTED_CLASS,
  HOME_EYEBROW_ROW_CLASS,
  HOME_HEADER_GRID_CLASS,
  HOME_SECTION_CONTAINER_CLASS,
  HOME_SECTION_DIVIDER_CLASS,
  HOME_SECTION_PADDING_X_CLASS,
  HOME_SECTION_SPACING_CLASS,
} from "@/components/static/home/home-section-classes";
import { DanaBold } from "@/next-persian-fonts/dana";

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------------
// Static surface class maps
// ---------------------------------------------------------------------------

const surfaceBgClasses: Record<FaqSurface, string> = {
  page: "bg-[#FCFAF7] dark:bg-[#0B1117]",
  warm: "bg-[#F8F3EB] dark:bg-[#111820]",
  surface: "bg-white dark:bg-[#171F27]",
};

const surfaceFocusOffsetClasses: Record<FaqSurface, string> = {
  page: "focus-visible:ring-offset-[#FCFAF7] dark:focus-visible:ring-offset-[#0B1117]",
  warm: "focus-visible:ring-offset-[#F8F3EB] dark:focus-visible:ring-offset-[#111820]",
  surface:
    "focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#171F27]",
};

// ---------------------------------------------------------------------------
// Development warnings
// ---------------------------------------------------------------------------

function warnInDev(props: FaqSectionProps): void {
  if (process.env.NODE_ENV !== "development") return;

  const { items, mode, defaultOpenIds } = props;
  const seenIds = new Set<string>();

  items.forEach((item, i) => {
    if (!item.id) {
      console.warn(
        `[FaqSection] Item at index ${i} is missing a required "id".`,
      );
    } else if (seenIds.has(item.id)) {
      console.warn(`[FaqSection] Duplicate item id: "${item.id}".`);
    } else {
      seenIds.add(item.id);
    }

    if (!item.question) {
      console.warn(
        `[FaqSection] Item "${item.id ?? i}" has an empty question.`,
      );
    }

    if (
      !item.answer ||
      (typeof item.answer === "string" && item.answer.trim() === "") ||
      (Array.isArray(item.answer) && item.answer.length === 0)
    ) {
      console.warn(`[FaqSection] Item "${item.id ?? i}" has an empty answer.`);
    }
  });

  if (defaultOpenIds) {
    defaultOpenIds.forEach((id) => {
      if (!items.some((item) => item.id === id)) {
        console.warn(
          `[FaqSection] defaultOpenIds contains unknown id: "${id}". It will be ignored.`,
        );
      }
    });

    if (mode === "single" && defaultOpenIds.length > 1) {
      console.warn(
        '[FaqSection] mode="single" but defaultOpenIds contains more than one id. Only the first valid id will be used.',
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FaqSection({
  id = "faq",
  eyebrow = "پرسش‌های متداول",
  title,
  description,
  items,
  action,
  locale = "fa",
  mode = "single",
  defaultOpenIds = [],
  allowCollapse = true,
  includeSchema = true,
  headingAs = "h2",
  surface = "page",
  numbered = true,
  className = "",
}: FaqSectionProps): React.JSX.Element | null {
  // ── Guard — empty items ───────────────────────────────────────────────────
  if (items.length === 0) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[FaqSection] Received an empty items array. Rendering null.",
      );
    }
    return null;
  }

  warnInDev({
    id,
    eyebrow,
    title,
    description,
    items,
    action,
    locale,
    mode,
    defaultOpenIds,
    allowCollapse,
    includeSchema,
    headingAs,
    surface,
    numbered,
    className,
  });

  const isRTL = locale === "fa";
  const headingId = `${id}-heading`;

  // Dynamic heading element
  const Heading = headingAs as FaqHeadingElement;

  const bgClass = surfaceBgClasses[surface];
  const focusOffsetClass = surfaceFocusOffsetClasses[surface];

  return (
    <>
      {/* Server-rendered JSON-LD — renders before the section */}
      {includeSchema && <FaqJsonLd items={items} />}

      <section
        id={id}
        aria-labelledby={headingId}
        dir={isRTL ? "rtl" : "ltr"}
        className={cn(
          bgClass,
          HOME_SECTION_DIVIDER_CLASS,
          HOME_SECTION_SPACING_CLASS,
          HOME_SECTION_PADDING_X_CLASS,
          "relative overflow-hidden",
          className,
        )}
      >
        <div className={HOME_SECTION_CONTAINER_CLASS}>
          <div className={`${HOME_HEADER_GRID_CLASS} gap-y-12 lg:items-start`}>
            {/* ============================================================
                HEADER COLUMN — col 1–4 (sticky-ish positioning on desktop)
                ============================================================ */}
            <Reveal
              variant="fade-up"
              delay={0}
              duration={500}
              once
              className="lg:col-span-5"
            >
              <div className="flex flex-col gap-5 lg:sticky lg:top-28 lg:pt-2">
                {eyebrow && (
                  <div className={HOME_EYEBROW_ROW_CLASS}>
                    <span className={`${HOME_EYEBROW_ACCENT_CLASS} uppercase`}>
                      {eyebrow}
                    </span>
                    <span aria-hidden="true" className={HOME_EYEBROW_LINE_CLASS} />
                  </div>
                )}

                <Heading
                  id={headingId}
                  className={[
                    "leading-tight",
                    DanaBold.className,
                    "text-3xl sm:text-4xl lg:text-5xl",
                    "text-[#231F20] dark:text-[#F8F5F0]",
                    "max-w-2xl",
                  ].join(" ")}
                >
                  {title}
                </Heading>

                {description && (
                  <p className={`${HOME_DESCRIPTION_TEXT_CLASS} max-w-xl`}>
                    {description}
                  </p>
                )}

                <div className="mt-2 flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className="text-4xl font-light leading-none tabular-nums text-[#231F20]/15 dark:text-[#F8F5F0]/15 sm:text-5xl"
                  >
                    {String(items.length).padStart(2, "0")}
                  </span>
                  <span className={`${HOME_EYEBROW_MUTED_CLASS} leading-5`}>
                    FAQ
                  </span>
                </div>

                {action && (
                  <Link
                    href={action.href}
                    aria-label={action.ariaLabel ?? action.label}
                    className={cn(
                      "group inline-flex items-center gap-2",
                      "min-h-[44px]",
                      "text-sm",
                      "text-[#231F20] dark:text-[#F8F5F0]",
                      "border-b border-[#231F20]/25 dark:border-[#F8F5F0]/25",
                      "pb-0.5 w-fit",
                      "hover:border-[#C15427] hover:text-[#A94420]",
                      "dark:hover:border-[#C15427] dark:hover:text-[#E18A68]",
                      "transition-colors duration-150",
                      "focus-visible:outline-none focus-visible:ring-2",
                      "focus-visible:ring-[#C15427]",
                      "dark:focus-visible:ring-[#E18A68]",
                      "focus-visible:ring-offset-2",
                      focusOffsetClass,
                    )}
                  >
                    {action.label}
                    <ArrowIcon
                      direction={isRTL ? "rtl" : "ltr"}
                      size={16}
                      className={[
                        "text-[#C15427] flex-shrink-0",
                        "transition-transform duration-150 motion-reduce:transition-none",
                        isRTL
                          ? "group-hover:-translate-x-1"
                          : "group-hover:translate-x-1",
                      ].join(" ")}
                    />
                  </Link>
                )}
              </div>
            </Reveal>

            {/* ============================================================
                ACCORDION COLUMN — col 6–12
                ============================================================ */}
            <Reveal
              variant="fade-up"
              delay={160}
              duration={600}
              once
              className="lg:col-span-7 lg:col-start-6"
            >
              {/*
               * FaqAccordionClient is the only Client Component.
               * It receives serializable item data — not ReactNode.
               * Questions and answers are also rendered as server HTML
               * inside FaqAccordionClient via FaqAnswer (Server Component),
               * ensuring content is present in the initial HTML.
               */}
              <FaqAccordionClient
                items={items}
                sectionId={id}
                mode={mode}
                defaultOpenIds={defaultOpenIds}
                allowCollapse={allowCollapse}
                numbered={numbered}
                locale={locale}
              />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
