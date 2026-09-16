"use client";

import {
  type CSSProperties,
  type ReactNode,
  useId,
  useMemo,
  useState,
} from "react";

import { brandColors, lightTokens } from "@/theme/theme-colors";

export type FAQItem = {
  id: string;
  question: string;
  answer: ReactNode;
  answerLabel?: string;
};

export type FAQProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  items: FAQItem[];
  defaultOpenIds?: string[];
  openIds?: string[];
  onOpenChange?: (openIds: string[]) => void;
  allowMultiple?: boolean;
  showIndex?: boolean;
  className?: string;
  footer?: ReactNode;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function safeDomId(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}_-]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function toPersianDigits(value: number | string) {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

export default function FAQ({
  eyebrow = "پرسش‌های متداول",
  title,
  description,
  items,
  defaultOpenIds = [],
  openIds,
  onOpenChange,
  allowMultiple = false,
  showIndex = true,
  className,
  footer,
}: FAQProps) {
  const reactId = useId();
  const headingId = `${safeDomId(reactId)}-faq-title`;

  const [internalOpenIds, setInternalOpenIds] =
    useState<string[]>(defaultOpenIds);

  const resolvedOpenIds = openIds ?? internalOpenIds;
  const openSet = useMemo(() => new Set(resolvedOpenIds), [resolvedOpenIds]);

  const themeVars = {
    "--faq-black": brandColors.black.hex,
    "--faq-cream": brandColors.cream.hex,
    "--faq-copper": brandColors.copper.hex,
    "--faq-muted": lightTokens.textMuted,
    "--faq-soft": lightTokens.textSoft,
    "--faq-border": lightTokens.border,
  } as CSSProperties;

  function commitOpenIds(next: string[]) {
    if (openIds === undefined) setInternalOpenIds(next);
    onOpenChange?.(next);
  }

  function toggleItem(id: string) {
    const isOpen = openSet.has(id);

    if (allowMultiple) {
      commitOpenIds(
        isOpen
          ? resolvedOpenIds.filter((openId) => openId !== id)
          : [...resolvedOpenIds, id],
      );
      return;
    }

    commitOpenIds(isOpen ? [] : [id]);
  }

  return (
    <section
      dir="rtl"
      lang="fa"
      aria-labelledby={headingId}
      style={themeVars}
      className={cx(
        "relative w-full overflow-hidden bg-[var(--faq-cream)] text-[var(--faq-black)]",
        className,
      )}
    >
      {/* Quiet editorial guide on larger screens. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-[clamp(1.25rem,5vw,4rem)] hidden w-px bg-black/[0.045] lg:block"
      />

      <div className="mx-auto w-full max-w-[1920px] px-5 py-20 sm:px-7 sm:py-24 lg:px-10 lg:py-28 xl:px-14 xl:py-32">
        {/* HEADER */}
        <header className="mx-auto flex max-w-[900px] flex-col items-center text-center">
          {eyebrow ? (
            <div className="flex items-center justify-center gap-3">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-[var(--faq-copper)]"
              />
              <p className="text-[10px] font-medium leading-none text-[var(--faq-copper)] sm:text-[11px]">
                {eyebrow}
              </p>
            </div>
          ) : null}

          <h2
            id={headingId}
            className="mt-6 max-w-[880px] text-balance text-xl md:text-5xl font-semibold leading-[1.12] tracking-[-0.045em] sm:mt-7  "
          >
            {title}
          </h2>

          {description ? (
            <div className="mt-5 max-w-[680px] text-pretty text-[12px] leading-7 text-black/[0.54] sm:mt-6 sm:text-[13px] md:text-[14px] md:leading-8">
              {description}
            </div>
          ) : null}
        </header>

        {/* ACCORDION */}
        <div className="mt-14 w-full max-w-[1120px] mx-auto sm:mt-16 lg:mt-20">
          {items.length > 0 ? (
            <div className="border-t border-black/[0.14]">
              {items.map((item, index) => {
                const isOpen = openSet.has(item.id);
                const itemDomId = safeDomId(`${reactId}-${item.id}`);
                const triggerId = `${itemDomId}-trigger`;
                const panelId = `${itemDomId}-panel`;

                return (
                  <article
                    key={item.id}
                    className={cx(
                      "group/item relative border-b border-black/[0.14] transition-colors duration-300",
                      isOpen && "bg-black/[0.018]",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cx(
                        "absolute inset-y-0 right-0 w-[2px] origin-center bg-[var(--faq-copper)] transition-transform duration-500 ease-out motion-reduce:transition-none",
                        isOpen ? "scale-y-100" : "scale-y-0",
                      )}
                    />

                    <button
                      id={triggerId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggleItem(item.id)}
                      className="grid w-full cursor-pointer grid-cols-[44px_minmax(0,1fr)_40px] items-center gap-3 px-1 py-6 text-center outline-none sm:grid-cols-[56px_minmax(0,1fr)_48px] sm:gap-5 sm:px-2 sm:py-7 lg:grid-cols-[64px_minmax(0,1fr)_56px] lg:py-8 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-black/70"
                    >
                      {showIndex ? (
                        <span
                          className={cx(
                            "justify-self-start text-[9px] font-medium tabular-nums transition-colors duration-300",
                            isOpen
                              ? "text-[var(--faq-copper)]"
                              : "text-black/[0.28] group-hover/item:text-black/[0.50]",
                          )}
                        >
                          {toPersianDigits(String(index + 1).padStart(2, "0"))}
                        </span>
                      ) : (
                        <span aria-hidden="true" />
                      )}

                      <span
                        className={cx(
                          "mx-auto max-w-[820px] text-center text-[16px] font-semibold leading-[1.65] tracking-[-0.02em] transition-colors duration-300 sm:text-[18px] lg:text-[20px]",
                          isOpen
                            ? "text-black"
                            : "text-black/[0.76] group-hover/item:text-black",
                        )}
                      >
                        {item.question}
                      </span>

                      <span
                        aria-hidden="true"
                        className={cx(
                          "relative block size-9 justify-self-end border transition-[border-color,color,background-color] duration-300 sm:size-10",
                          isOpen
                            ? "border-[var(--faq-copper)]/55 bg-[var(--faq-copper)]/[0.05] text-[var(--faq-copper)]"
                            : "border-black/[0.14] text-black/58 group-hover/item:border-black/30 group-hover/item:text-black",
                        )}
                      >
                        <span className="absolute left-1/2 top-1/2 h-px w-3.5 -translate-x-1/2 -translate-y-1/2 bg-current" />
                        <span
                          className={cx(
                            "absolute left-1/2 top-1/2 h-3.5 w-px -translate-x-1/2 -translate-y-1/2 bg-current transition-transform duration-300 ease-out motion-reduce:transition-none",
                            isOpen ? "scale-y-0" : "scale-y-100",
                          )}
                        />
                      </span>
                    </button>

                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      aria-hidden={!isOpen}
                      className={cx(
                        "grid transition-[grid-template-rows,opacity] duration-500 ease-out motion-reduce:transition-none",
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <div className="overflow-hidden">
                        <div className="mx-auto max-w-[820px] px-6 pb-8 text-center sm:px-10 sm:pb-10 lg:px-14 lg:pb-11">
                          {item.answerLabel ? (
                            <div className="mb-4 flex items-center justify-center gap-3">
                              <span className="h-px w-7 bg-[var(--faq-copper)]/70" />
                              <p className="text-[9px] font-medium text-[var(--faq-copper)]">
                                {item.answerLabel}
                              </p>
                            </div>
                          ) : null}

                          <div className="text-pretty text-[12px] leading-7 text-black/[0.56] sm:text-[13px] md:text-[14px] md:leading-8">
                            {item.answer}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="border-y border-black/[0.14] py-14 text-center sm:py-16">
              <div className="flex items-center justify-center gap-3">
                <span className="h-px w-8 bg-[var(--faq-copper)]" />
                <p className="text-[10px] font-medium text-[var(--faq-copper)]">
                  هنوز پرسشی ثبت نشده است
                </p>
              </div>

              <p className="mx-auto mt-4 max-w-[520px] text-[12px] leading-7 text-black/[0.50] sm:text-[13px]">
                پرسش‌ها را به داده‌های FAQ اضافه کنید؛ موارد جدید به‌صورت خودکار
                در این بخش نمایش داده می‌شوند.
              </p>
            </div>
          )}
        </div>

        {footer ? (
          <div className="mx-auto mt-10 max-w-[820px] border-t border-black/[0.10] pt-7 text-center sm:mt-12">
            {footer}
          </div>
        ) : null}
      </div>
    </section>
  );
}
