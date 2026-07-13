// ─────────────────────────────────────────────────────────────────────────────
// Brand SEO Summary — Server Component
// Native <details>/<summary>, zero client logic
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import type {
  BrandSeoContentGroup,
  BrandSeoLink,
  BrandSeoSummaryProps,
} from "./brand-seo-summary.types";
import {
  HOME_COMPACT_SECTION_SPACING_CLASS,
  HOME_DESCRIPTION_TEXT_CLASS,
  HOME_EYEBROW_ACCENT_CLASS,
  HOME_EYEBROW_LINE_CLASS,
  HOME_EYEBROW_ROW_CLASS,
  HOME_HEADER_GRID_CLASS,
  HOME_PAGE_SURFACE_CLASS,
  HOME_SECTION_CONTAINER_CLASS,
  HOME_SECTION_DIVIDER_CLASS,
  HOME_SECTION_PADDING_X_CLASS,
} from "../home-section-classes";

function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ArrowIcon({ rtl, className }: { rtl: boolean; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn(rtl && "rotate-180", className)}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function GroupLinks({ links }: { links: readonly BrandSeoLink[] }) {
  if (!links.length) return null;

  return (
    <nav aria-label="پیوندهای مرتبط" className="mt-5">
      <ul role="list" className="flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <Link
              href={link.href}
              prefetch={false}
              className={cn(
                "text-sm text-[#231F20] dark:text-[#F8F5F0]",
                "underline-offset-4 hover:underline",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-[#A94420] dark:focus-visible:ring-[#E18A68]",
                "focus-visible:ring-offset-4 focus-visible:ring-offset-transparent",
                "motion-reduce:transition-none",
              )}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ContentGroup({ group }: { group: BrandSeoContentGroup }) {
  return (
    <section aria-labelledby={`${group.id}-title`}>
      <h3
        id={`${group.id}-title`}
        className="text-lg sm:text-xl font-normal leading-8 text-[#231F20] dark:text-[#F8F5F0]"
      >
        {group.title}
      </h3>

      <div className="mt-3 space-y-4">
        {group.paragraphs.map((paragraph) => (
          <p
            key={`${group.id}-${paragraph.slice(0, 24)}`}
            className="text-sm leading-7 text-[#6C6662] dark:text-[#B8B2AC]"
          >
            {paragraph}
          </p>
        ))}
      </div>

      {group.links && group.links.length > 0 ? (
        <GroupLinks links={group.links} />
      ) : null}
    </section>
  );
}

export function BrandSeoSummary({
  id = "brand-seo-summary",
  eyebrow,
  title,
  introduction,
  summaryLabel = "مطالعه بیشتر درباره نجیب‌زاده",
  closeLabel = "بستن توضیحات",
  groups,
  finalAction,
  locale = "fa",
  defaultOpen = false,
  className,
}: BrandSeoSummaryProps) {
  const headingId = `${id}-heading`;
  const isRtl = locale === "fa";
  const hasGroups = groups.length > 0;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      dir={isRtl ? "rtl" : "ltr"}
      className={cn(
        HOME_PAGE_SURFACE_CLASS,
        HOME_SECTION_DIVIDER_CLASS,
        HOME_COMPACT_SECTION_SPACING_CLASS,
        HOME_SECTION_PADDING_X_CLASS,
        className,
      )}
    >
      <div className={HOME_SECTION_CONTAINER_CLASS}>
        <div>
          <header className={HOME_HEADER_GRID_CLASS}>
            <div className="lg:col-span-5">
              {eyebrow ? (
                <div className={`${HOME_EYEBROW_ROW_CLASS} mb-4`}>
                  <span className={HOME_EYEBROW_ACCENT_CLASS}>{eyebrow}</span>
                  <span aria-hidden="true" className={HOME_EYEBROW_LINE_CLASS} />
                </div>
              ) : null}

              <h2
                id={headingId}
                className="text-2xl sm:text-3xl lg:text-4xl font-light leading-[1.25] text-[#231F20] dark:text-[#F8F5F0]"
              >
                {title}
              </h2>
            </div>

            {introduction ? (
              <div className="lg:col-span-6 lg:col-start-7">
                <p className={`${HOME_DESCRIPTION_TEXT_CLASS} max-w-3xl lg:text-lg lg:leading-8`}>
                  {introduction}
                </p>
              </div>
            ) : null}
          </header>

          {hasGroups ? (
            <details open={defaultOpen} className="group mt-8">
              <summary
                className={cn(
                  "list-none [&::-webkit-details-marker]:hidden marker:content-none",
                  "mt-8 flex min-h-11 cursor-pointer items-center justify-between gap-4",
                  "border-t border-[#DED8D1] dark:border-[#2C343C]",
                  "py-4 text-sm text-[#231F20] dark:text-[#F8F5F0]",
                  "transition-colors duration-200 motion-reduce:transition-none",
                  "hover:text-[#6C6662] dark:hover:text-[#B8B2AC]",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-[#A94420] dark:focus-visible:ring-[#E18A68]",
                  "focus-visible:ring-offset-4 focus-visible:ring-offset-transparent",
                )}
              >
                <span className="group-open:hidden">{summaryLabel}</span>
                <span className="hidden group-open:inline">{closeLabel}</span>

                <ChevronIcon className="shrink-0 transition-transform duration-200 motion-reduce:transition-none group-open:rotate-180" />
              </summary>

              <div className="pt-8">
                <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
                  {groups.map((group) => (
                    <ContentGroup key={group.id} group={group} />
                  ))}
                </div>

                {finalAction ? (
                  <div className="mt-10 flex justify-end border-t border-[#DED8D1] dark:border-[#2C343C] pt-6">
                    <Link
                      href={finalAction.href}
                      prefetch={false}
                      className={cn(
                        "group inline-flex min-h-11 items-center gap-2",
                        "text-sm text-[#231F20] dark:text-[#F8F5F0]",
                        "underline-offset-4 hover:underline",
                        "focus-visible:outline-none focus-visible:ring-2",
                        "focus-visible:ring-[#A94420] dark:focus-visible:ring-[#E18A68]",
                        "focus-visible:ring-offset-4 focus-visible:ring-offset-transparent",
                        "motion-reduce:transition-none",
                      )}
                    >
                      <span>{finalAction.label}</span>
                      <ArrowIcon
                        rtl={isRtl}
                        className="text-[#A94420] dark:text-[#E18A68] transition-transform duration-200 motion-reduce:transition-none group-hover:translate-x-0.5"
                      />
                    </Link>
                  </div>
                ) : null}
              </div>
            </details>
          ) : finalAction ? (
            <div className="mt-8 border-t border-[#DED8D1] dark:border-[#2C343C] pt-6 flex justify-end">
              <Link
                href={finalAction.href}
                prefetch={false}
                className={cn(
                  "group inline-flex min-h-11 items-center gap-2",
                  "text-sm text-[#231F20] dark:text-[#F8F5F0]",
                  "underline-offset-4 hover:underline",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-[#A94420] dark:focus-visible:ring-[#E18A68]",
                  "focus-visible:ring-offset-4 focus-visible:ring-offset-transparent",
                  "motion-reduce:transition-none",
                )}
              >
                <span>{finalAction.label}</span>
                <ArrowIcon
                  rtl={isRtl}
                  className="text-[#A94420] dark:text-[#E18A68] transition-transform duration-200 motion-reduce:transition-none group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
