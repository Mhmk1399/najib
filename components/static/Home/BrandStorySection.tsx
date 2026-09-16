import { type CSSProperties } from "react";

import { brandColors, lightTokens } from "@/theme/theme-colors";

/* ==========================================================================
   TYPES
============================================================================ */

type BrandStorySectionProps = {
  eyebrow?: string;
  title?: string;
  text?: string;
  readMoreLabel?: string;
  readLessLabel?: string;
  defaultExpanded?: boolean;
  className?: string;
};

/* ==========================================================================
   DEFAULT BRAND COPY
============================================================================ */

const DEFAULT_BRAND_TEXT = `
نجیب‌زاده خانه‌ای معاصر است که بر یک باور ساده شکل گرفته: ظرافت واقعی هیچ‌وقت نیاز به هیاهو ندارد.

جهان ما حول خیاطی سنجیده، رایحه‌های متمایز و اشیایی ساخته شده که به‌خاطر شخصیت، متریال و ماندگاری‌شان انتخاب می‌شوند.

ما به قطعاتی علاقه‌مندیم که امروز معنادار باشند و پس از گذر فصل‌ها نیز ارزش خود را حفظ کنند. هر جزئیات با نیت آغاز می‌شود؛ از تناسب یک لباس و بافت پارچه تا حسی که یک رایحه در فضا باقی می‌گذارد.

برای ما، تجمل در خویشتن‌داری، دقت و توانایی حذف هر چیزی است که ضرورتی ندارد. مهارت در ساخت را نه به‌عنوان تزئین، بلکه به‌عنوان پایه هر آنچه خلق می‌کنیم می‌بینیم.

نگاه نجیب‌زاده دانش سنتی را با دیدگاهی امروزی کنار هم قرار می‌دهد تا فرم‌های آشنا دوباره تازه و معاصر احساس شوند. لباس قرار نیست فقط بخشی از کمد باشد؛ باید آرام‌آرام به بخشی از زندگی فرد تبدیل شود.

عطر برای ما امتداد حضور است؛ چیزی که می‌تواند خاطره را در خود نگه دارد و بدون اغراق اثری ماندگار ایجاد کند. اشیای جهان نجیب‌زاده نیز با همان دقت در تعادل، کاربرد و زیبایی پایدار انتخاب می‌شوند.

باور داریم سبک شخصی زمانی عمیق‌تر می‌شود که آهسته و آگاهانه ساخته شود. همین نگاه، انتخاب متریال، فرم، رنگ و تجربه پیرامون هر محصول را شکل می‌دهد.

نجیب‌زاده با افراط یا تغییر دائمی تعریف نمی‌شود؛ بلکه با پیگیری مداوم کیفیت، شخصیت و جزئیاتی شناخته می‌شود که برای دیده‌شدن فریاد نمی‌زنند.

هر آنچه می‌سازیم باید شخصی، ماندگار و بی‌نیاز از توضیح اضافه باشد.
`.trim();

/* ==========================================================================
   COMPONENT
============================================================================ */

export function BrandStorySection({
  eyebrow = "خانه نجیب‌زاده",
  title = "جهان نجیب‌زاده.",
  text = DEFAULT_BRAND_TEXT,
  readMoreLabel = "ادامه داستان",
  readLessLabel = "بستن داستان",
  defaultExpanded = false,
  className = "",
}: BrandStorySectionProps) {
  const paragraphs = splitStoryText(text);

  const previewParagraphs = paragraphs.slice(0, Math.min(2, paragraphs.length));
  const remainingParagraphs = paragraphs.slice(previewParagraphs.length);

  const themeVars = {
    "--story-bg": lightTokens.surfaceBrand,
    "--story-text": brandColors.black.hex,
    "--story-muted": lightTokens.textMuted,
    "--story-soft": lightTokens.textSoft,
    "--story-copper": brandColors.copper.hex,
  } as CSSProperties;

  return (
    <section
      dir="rtl"
      lang="fa"
      style={themeVars}
      aria-labelledby="brand-story-title"
      className={`relative w-full overflow-hidden bg-[var(--story-bg)] text-[var(--story-text)] ${className}`}
    >
      {/* Quiet editorial rails — structural rather than decorative. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-[clamp(20px,4vw,56px)] hidden w-px bg-black/[0.055] lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-[clamp(20px,4vw,56px)] hidden w-px bg-black/[0.055] lg:block"
      />

      <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28 xl:px-14 xl:py-32">
        {/* ==============================================================
            CENTERED EDITORIAL INTRO
        ============================================================== */}
        <div className="mx-auto max-w-[900px] text-center">
          <header className="mx-auto flex max-w-[720px] flex-col items-center text-center">
            {eyebrow ? (
              <div className="flex items-center justify-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-px w-8 bg-[var(--story-copper)]"
                />
                <p className="text-[10px] font-medium leading-none text-[var(--story-copper)] sm:text-[11px]">
                  {eyebrow}
                </p>
                <span
                  aria-hidden="true"
                  className="h-px w-8 bg-[var(--story-copper)]"
                />
              </div>
            ) : null}

            <h2
              id="brand-story-title"
              className="mt-5 max-w-[720px] text-balance text-[clamp(2.9rem,10vw,4.65rem)] font-semibold leading-[1.08] tracking-[-0.045em] sm:mt-6 sm:text-[clamp(3.7rem,7vw,5.4rem)] lg:text-[clamp(4.15rem,5vw,6rem)]"
            >
              {title}
            </h2>

            <div
              aria-hidden="true"
              className="mt-7 flex items-center justify-center gap-3 text-[var(--story-copper)]/60 sm:mt-8"
            >
              <span className="h-px w-10 bg-current" />
              <span className="text-[7px] font-medium tracking-[0.22em]">
                NAJIBZADEH
              </span>
              <span className="h-px w-10 bg-current" />
            </div>
          </header>

          {previewParagraphs.length ? (
            <div className="mx-auto mt-9 max-w-[780px] space-y-5 text-center sm:mt-10">
              {previewParagraphs.map((paragraph, index) => (
                <p
                  key={`${paragraph.slice(0, 36)}-${index}`}
                  className={
                    index === 0
                      ? "text-pretty text-[15px] font-medium leading-8 text-[var(--story-text)]/82 sm:text-[16px] sm:leading-9 lg:text-[17px]"
                      : "text-pretty text-[12px] font-normal leading-7 text-[var(--story-muted)] sm:text-[13px] sm:leading-8 lg:text-[14px]"
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}
        </div>

        {/* ==============================================================
            EXPANDABLE STORY
        ============================================================== */}
        {remainingParagraphs.length ? (
          <details
            open={defaultExpanded}
            className="group mx-auto mt-12 max-w-[900px] border-t border-black/[0.10] pt-1 sm:mt-14 lg:mt-16"
          >
            <summary className="mx-auto flex min-h-[64px] w-full cursor-pointer list-none items-center justify-center gap-3 border-b border-black/[0.10] py-5 text-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-black/45 [&::-webkit-details-marker]:hidden">
              <span className="grid size-8 shrink-0 place-items-center border border-black/[0.16] text-black/60 transition-[border-color,color,background-color] duration-300 group-hover:border-[var(--story-copper)]/55 group-hover:text-[var(--story-copper)]">
                <span className="relative block size-3.5">
                  <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
                  <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current transition-transform duration-300 group-open:scale-y-0 motion-reduce:transition-none" />
                </span>
              </span>

              <span className="text-[12px] font-semibold text-black/68 transition-colors duration-200 group-hover:text-black sm:text-[13px]">
                <span className="group-open:hidden">{readMoreLabel}</span>
                <span className="hidden group-open:inline">
                  {readLessLabel}
                </span>
              </span>
            </summary>

            <div className="grid transition-[grid-template-rows,opacity] duration-500 ease-out group-open:grid-rows-[1fr] group-open:opacity-100 motion-reduce:transition-none">
              <div className="overflow-hidden">
                <div className="mx-auto max-w-[800px] space-y-5 pb-2 pt-9 text-center sm:pt-10 lg:pt-12">
                  {remainingParagraphs.map((paragraph, index) => (
                    <p
                      key={`${paragraph.slice(0, 36)}-${index}`}
                      className="text-pretty text-[12px] font-normal leading-7 text-[var(--story-muted)] sm:text-[13px] sm:leading-8 lg:text-[14px]"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </details>
        ) : null}
      </div>
    </section>
  );
}

/* ==========================================================================
   STORY TEXT NORMALIZATION
============================================================================ */

function splitStoryText(text: string) {
  const normalized = text.trim();

  if (!normalized) return [];

  const explicitParagraphs = normalized
    .split(/\n\s*\n+/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (explicitParagraphs.length > 1) {
    return explicitParagraphs;
  }

  const sentences =
    normalized
      .replace(/\s+/g, " ")
      .match(/[^.!?؟]+[.!?؟]+|[^.!?؟]+$/g)
      ?.map((sentence) => sentence.trim())
      .filter(Boolean) ?? [];

  if (sentences.length <= 3) {
    return sentences.length ? [sentences.join(" ")] : [normalized];
  }

  const paragraphs: string[] = [];

  for (let index = 0; index < sentences.length; index += 2) {
    paragraphs.push(sentences.slice(index, index + 2).join(" "));
  }

  return paragraphs;
}
