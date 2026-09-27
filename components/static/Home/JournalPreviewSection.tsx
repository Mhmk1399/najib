import Image from "next/image";
import Link from "next/link";

import { type CSSProperties } from "react";

import { ArrowLeftIcon } from "@/components/ui/Button";
import type { BlogCopy } from "@/lib/i18n/blog-copy";
import {
  getHtmlLang,
  getLocaleDirection,
  type Locale,
} from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/routes";
import { brandColors, lightTokens } from "@/theme/theme-colors";

type JournalPreviewSectionProps = {
  copy: BlogCopy;
  locale: Locale;
  className?: string;
};

function formatDate(value: string, locale: Locale) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(getHtmlLang(locale), {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function JournalPreviewSection({
  copy,
  locale,
  className = "",
}: JournalPreviewSectionProps) {
  const posts = copy.posts.slice(0, 3);
  const direction = getLocaleDirection(locale);
  const htmlLang = getHtmlLang(locale);
  const isRtl = direction === "rtl";

  if (!posts.length) return null;

  const themeVars = {
    "--journal-bg": lightTokens.surfaceBrand,
    "--journal-text": brandColors.black.hex,
    "--journal-muted": lightTokens.textMuted,
    "--journal-copper": brandColors.copper.hex,
  } as CSSProperties;

  return (
    <section
      dir={direction}
      lang={htmlLang}
      aria-labelledby="home-journal-title"
      style={themeVars}
      className={`relative w-full overflow-hidden bg-[var(--journal-bg)] text-[var(--journal-text)] ${className}`}
    >
      <div className="mx-auto w-full max-w-[1540px] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28 xl:px-14">
        <header className="mb-10 flex flex-col gap-6 border-b border-black/[0.10] pb-7 sm:mb-12 sm:flex-row sm:items-end sm:justify-between sm:pb-8">
          <div className="max-w-[720px]">
            <div className="flex items-center gap-3 text-[var(--journal-copper)]">
              <span aria-hidden="true" className="h-px w-8 bg-current" />
              <span className="text-[9px] font-semibold tracking-[0.08em]">
                {copy.journal.eyebrow}
              </span>
            </div>
            <h2
              id="home-journal-title"
              className="mt-4 max-w-[680px] text-balance text-[clamp(2.4rem,7vw,5.2rem)] font-semibold leading-[1.05] tracking-[-0.045em]"
            >
              <span className="block">{copy.journal.titleLine1}</span>
              <span className="block text-black/54">{copy.journal.titleLine2}</span>
            </h2>
          </div>

          <div className="flex max-w-[360px] flex-col items-start gap-4 sm:items-end sm:text-right">
            <p className="text-[12px] leading-7 text-[var(--journal-muted)] sm:text-[13px]">
              {copy.journal.description}
            </p>
            <Link
              href={localizedHref("/blog", locale)}
              className="inline-flex min-h-10 items-center gap-2 border-b border-[var(--journal-copper)] pb-2 text-[10px] font-semibold text-[var(--journal-text)] transition-colors hover:text-[var(--journal-copper)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--journal-copper)]/45"
            >
              {copy.hero.actionLabel}
              <span className={isRtl ? "" : "rotate-180"}>
                <ArrowLeftIcon />
              </span>
            </Link>
          </div>
        </header>

        <div className="grid gap-3 md:grid-cols-[1.35fr_1fr_1fr] md:gap-4">
          {posts.map((post, index) => (
            <article
              key={post.id}
              className={`group relative overflow-hidden border border-black/[0.10] bg-black/[0.035] ${index === 0 ? "md:row-span-2" : ""}`}
            >
              <Link
                href={localizedHref(`/blog/${post.slug}`, locale)}
                aria-label={`${post.title} - ${copy.article.read}`}
                className="flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--journal-copper)]"
              >
                <div
                  className={`relative overflow-hidden bg-black/[0.08] ${index === 0 ? "aspect-[4/5] md:aspect-auto md:min-h-[500px]" : "aspect-[1.45/1]"}`}
                >
                  <Image
                    src={post.image}
                    alt={post.imageAlt}
                    fill
                    sizes={index === 0 ? "(min-width: 768px) 45vw, 100vw" : "(min-width: 768px) 27vw, 100vw"}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035] motion-reduce:transition-none"
                    style={{ objectPosition: post.imagePosition ?? "center" }}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.78] via-black/[0.05] to-transparent" />
                  {post.featured ? (
                    <span className="absolute inset-x-4 top-4 text-[8px] font-semibold text-white/80">
                      {copy.featured.badge}
                    </span>
                  ) : null}
                  <div className="absolute inset-x-4 bottom-4 text-white sm:inset-x-5 sm:bottom-5">
                    <span className="text-[8px] font-medium text-white/68">
                      {formatDate(post.publishedAt, locale)}
                    </span>
                    <h3 className="mt-2 text-[17px] font-semibold leading-[1.35] tracking-[-0.02em] sm:text-[19px]">
                      {post.title}
                    </h3>
                  </div>
                </div>

                {index !== 0 ? (
                  <div className="flex min-h-[112px] flex-1 flex-col justify-between gap-4 p-4 sm:p-5">
                    <p className="line-clamp-2 text-[11px] leading-6 text-[var(--journal-muted)]">
                      {post.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-2 text-[9px] font-semibold text-[var(--journal-text)] transition-colors group-hover:text-[var(--journal-copper)]">
                      {copy.article.read}
                      <span className={isRtl ? "" : "rotate-180"}>
                        <ArrowLeftIcon />
                      </span>
                    </span>
                  </div>
                ) : null}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
