"use client";

import {
  type CSSProperties,
  type ReactNode,
  useId,
  useMemo,
  useState,
} from "react";

import { brandColors, fontTokens, lightTokens } from "@/theme/theme-colors";

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
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

export default function FAQ({
  eyebrow = "Frequently Asked Questions",
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
      dir="ltr"
      aria-label="Frequently asked questions"
      style={{ ...themeVars, fontFamily: fontTokens.english }}
      className={cx(
        "relative w-full overflow-hidden bg-[var(--faq-cream)] text-[var(--faq-black)]",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[1920px] px-5 py-20 sm:px-7 sm:py-24 lg:px-10 lg:py-28 xl:px-14 xl:py-32">
        {/* HEADER */}
        <header className="mx-auto flex max-w-[980px] flex-col items-center text-center">
          <div className="flex w-full max-w-[520px] items-center gap-4">
            <span aria-hidden="true" className="h-px flex-1 bg-black/[0.14]" />
            <p className="shrink-0 text-[8px] font-semibold uppercase tracking-[0.28em] text-[var(--faq-copper)]">
              {eyebrow}
            </p>
            <span aria-hidden="true" className="h-px flex-1 bg-black/[0.14]" />
          </div>

          <h2 className="mt-8 max-w-[900px] text-balance text-[42px] font-medium leading-[0.94] tracking-[-0.055em] sm:text-[56px] lg:text-[68px] xl:text-[76px]">
            {title}
          </h2>

          {description && (
            <div className="mt-7 max-w-[660px] text-pretty text-[11px] leading-6 text-black/[0.52] sm:text-[12px] sm:leading-7 lg:text-[13px]">
              {description}
            </div>
          )}
        </header>

        {/* ACCORDION */}
        <div className="mx-auto mt-16 w-full max-w-[1080px] sm:mt-20 lg:mt-24">
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
                    className="group/item relative border-b border-black/[0.14]"
                  >
                    <span
                      aria-hidden="true"
                      className={cx(
                        "absolute inset-x-0 top-0 h-px origin-center bg-[var(--faq-copper)] transition-transform duration-500 ease-out motion-reduce:transition-none",
                        isOpen ? "scale-x-100" : "scale-x-0",
                      )}
                    />

                    <button
                      id={triggerId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggleItem(item.id)}
                      className="grid w-full cursor-pointer grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-3 py-7 outline-none sm:grid-cols-[56px_minmax(0,1fr)_56px] sm:gap-5 sm:py-8 lg:grid-cols-[72px_minmax(0,1fr)_72px] lg:py-9 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-black"
                    >
                      {showIndex ? (
                        <span
                          className={cx(
                            "justify-self-start text-[7px] font-semibold tabular-nums tracking-[0.18em] transition-colors duration-300",
                            isOpen
                              ? "text-[var(--faq-copper)]"
                              : "text-black/[0.30] group-hover/item:text-black/[0.52]",
                          )}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      ) : (
                        <span aria-hidden="true" />
                      )}

                      <span
                        className={cx(
                          "mx-auto max-w-[780px] text-center text-[17px] font-medium leading-[1.2] tracking-[-0.025em] transition-[color,letter-spacing] duration-300 sm:text-[19px] lg:text-[22px]",
                          isOpen
                            ? "text-black"
                            : "text-black/[0.78] group-hover/item:text-black",
                        )}
                      >
                        {item.question}
                      </span>

                      <span
                        aria-hidden="true"
                        className="relative block size-[18px] justify-self-end text-black sm:size-5"
                      >
                        <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
                        <span
                          className={cx(
                            "absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current transition-transform duration-300 ease-out motion-reduce:transition-none",
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
                        <div className="mx-auto max-w-[760px] px-4 pb-10 text-center sm:px-8 sm:pb-11 lg:pb-12">
                          {item.answerLabel && (
                            <div className="mb-4 flex items-center justify-center gap-3">
                              <span className="h-px w-7 bg-[var(--faq-copper)]/70" />
                              <p className="text-[7px] font-semibold uppercase tracking-[0.22em] text-[var(--faq-copper)]">
                                {item.answerLabel}
                              </p>
                              <span className="h-px w-7 bg-[var(--faq-copper)]/70" />
                            </div>
                          )}

                          <div className="text-pretty text-[11px] leading-6 text-black/[0.56] sm:text-[12px] sm:leading-7 lg:text-[13px] lg:leading-7">
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
            <div className="border-y border-black/[0.14] py-16 text-center">
              <p className="text-[8px] font-semibold uppercase tracking-[0.24em] text-[var(--faq-copper)]">
                No questions yet
              </p>
              <p className="mx-auto mt-4 max-w-[460px] text-[12px] leading-6 text-black/[0.50]">
                Add items to the FAQ data array and they will appear here
                automatically.
              </p>
            </div>
          )}
        </div>

        {footer && (
          <div className="mx-auto mt-12 max-w-[760px] border-t border-black/[0.10] pt-7 text-center">
            {footer}
          </div>
        )}
      </div>
    </section>
  );
}
