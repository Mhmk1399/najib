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
    "--journal-paper": lightTokens.surface,
    "--journal-line": "rgb(35 31 32 / 0.11)",
  } as CSSProperties;

  return (
    <section
      dir={direction}
      lang={htmlLang}
      aria-labelledby="home-journal-title"
      style={themeVars}
      className={`relative isolate w-full overflow-hidden bg-[var(--journal-bg)] text-[var(--journal-text)] ${className}`}
    >
      {/* Quiet editorial atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_8%_0%,rgba(173,122,75,0.11),transparent_30%),radial-gradient(circle_at_90%_18%,rgba(255,255,255,0.72),transparent_28%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.16] [background-image:linear-gradient(to_right,rgba(35,31,32,0.08)_1px,transparent_1px)] [background-size:25%_100%]"
      />

      <div className="mx-auto w-full max-w-[1580px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 xl:px-14">
        {/* Header */}
        <header className="grid gap-8 border-y border-black/[0.10] py-7 sm:py-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.55fr)] lg:items-end lg:gap-14">
          <div className="min-w-0">
            <div className="flex items-center gap-3 text-[var(--journal-copper)]">
              <span aria-hidden="true" className="h-px w-9 bg-current" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em]">
                {copy.journal.eyebrow}
              </span>
              <span className="text-[8px] font-medium tabular-nums text-black/28">
                01 — 03
              </span>
            </div>

            <h2
              id="home-journal-title"
              className="mt-5 max-w-[900px] text-balance text-[clamp(2.75rem,6.2vw,6.9rem)] font-semibold leading-[0.92] tracking-[-0.055em]"
            >
              <span className="block">{copy.journal.titleLine1}</span>
              <span className="mt-1 block text-black/42">
                {copy.journal.titleLine2}
              </span>
            </h2>
          </div>

          <div className="flex max-w-[410px] flex-col items-start lg:justify-self-end lg:items-end lg:text-end">
            <p className="text-[12px] leading-7 text-[var(--journal-muted)] sm:text-[13px]">
              {copy.journal.description}
            </p>

            <Link
              href={localizedHref("/blog", locale)}
              className="group/all mt-6 inline-flex min-h-11 items-center gap-3 border-b border-black/20 pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--journal-text)] transition-[border-color,color] duration-300 hover:border-[var(--journal-copper)] hover:text-[var(--journal-copper)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--journal-copper)]/45"
            >
              {copy.hero.actionLabel}
              <span
                className={`transition-transform duration-300 group-hover/all:-translate-x-1 ${
                  isRtl ? "" : "rotate-180 group-hover/all:translate-x-1"
                }`}
              >
                <ArrowLeftIcon />
              </span>
            </Link>
          </div>
        </header>

        {/* Editorial composition */}
        <div className="mt-8 grid gap-px bg-black/[0.10] lg:grid-cols-[1.62fr_0.92fr]">
          {posts[0] ? (
            <article className="group relative min-w-0 overflow-hidden bg-[#111]">
              <Link
                href={localizedHref(`/blog/${posts[0].slug}`, locale)}
                aria-label={`${posts[0].title} - ${copy.article.read}`}
                className="relative block min-h-[560px] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--journal-copper)] sm:min-h-[650px] lg:min-h-[760px]"
              >
                <Image
                  src={posts[0].image}
                  alt={posts[0].imageAlt}
                  fill
                  priority={false}
                  sizes="(min-width: 1024px) 65vw, 100vw"
                  className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
                  style={{ objectPosition: posts[0].imagePosition ?? "center" }}
                />

                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.07)_0%,rgba(0,0,0,0.02)_36%,rgba(0,0,0,0.78)_100%)]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100 bg-[radial-gradient(circle_at_75%_25%,rgba(255,255,255,0.12),transparent_32%)]"
                />

                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-5 p-5 text-white sm:p-7 lg:p-8">
                  <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/64">
                    {formatDate(posts[0].publishedAt, locale)}
                  </span>

                  {posts[0].featured ? (
                    <span className="border border-white/24 bg-black/20 px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.14em] text-white/82 backdrop-blur-sm">
                      {copy.featured.badge}
                    </span>
                  ) : null}
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7 lg:p-8 xl:p-10">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="text-[8px] font-semibold tabular-nums tracking-[0.18em] text-white/46">
                      01
                    </span>
                    <span className="h-px w-10 bg-white/28" />
                    <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/58">
                      {copy.journal.eyebrow}
                    </span>
                  </div>

                  <h3 className="max-w-[920px] text-balance text-[clamp(1.8rem,4vw,4.7rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
                    {posts[0].title}
                  </h3>

                  <div className="mt-7 flex flex-col gap-5 border-t border-white/16 pt-5 sm:flex-row sm:items-end sm:justify-between">
                    <p className="max-w-[620px] line-clamp-2 text-[11px] leading-6 text-white/58 sm:text-[12px]">
                      {posts[0].excerpt}
                    </p>

                    <span className="inline-flex shrink-0 items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-white">
                      {copy.article.read}
                      <span
                        className={`transition-transform duration-300 group-hover:-translate-x-1 ${
                          isRtl ? "" : "rotate-180 group-hover:translate-x-1"
                        }`}
                      >
                        <ArrowLeftIcon />
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ) : null}

          <div className="grid gap-px bg-black/[0.10]">
            {posts.slice(1).map((post, index) => {
              const number = String(index + 2).padStart(2, "0");

              return (
                <article
                  key={post.id}
                  className="group relative min-w-0 overflow-hidden bg-[var(--journal-paper)]"
                >
                  <Link
                    href={localizedHref(`/blog/${post.slug}`, locale)}
                    aria-label={`${post.title} - ${copy.article.read}`}
                    className="grid min-h-[390px] grid-rows-[minmax(210px,1.2fr)_auto] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--journal-copper)] sm:min-h-[430px] lg:min-h-[379px]"
                  >
                    <div className="relative overflow-hidden bg-black/[0.08]">
                      <Image
                        src={post.image}
                        alt={post.imageAlt}
                        fill
                        sizes="(min-width: 1024px) 36vw, 100vw"
                        className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035] motion-reduce:transform-none motion-reduce:transition-none"
                        style={{
                          objectPosition: post.imagePosition ?? "center",
                        }}
                      />

                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.18))]"
                      />

                      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4 text-white sm:p-5">
                        <span className="text-[8px] font-semibold tabular-nums tracking-[0.16em] text-white/72">
                          {number}
                        </span>

                        {post.featured ? (
                          <span className="border border-white/24 bg-black/20 px-2.5 py-1.5 text-[7px] font-semibold uppercase tracking-[0.12em] text-white/82 backdrop-blur-sm">
                            {copy.featured.badge}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="relative flex flex-col justify-between gap-5 p-5 sm:p-6 lg:p-6 xl:p-7">
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-0 start-0 w-px origin-bottom scale-y-0 bg-[var(--journal-copper)] transition-transform duration-500 group-hover:scale-y-100"
                      />

                      <div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[8px] font-medium uppercase tracking-[0.12em] text-black/38">
                            {formatDate(post.publishedAt, locale)}
                          </span>
                          <span className="h-px w-8 bg-black/14 transition-[width,background-color] duration-300 group-hover:w-12 group-hover:bg-[var(--journal-copper)]" />
                        </div>

                        <h3 className="mt-4 text-balance text-[20px] font-semibold leading-[1.35] tracking-[-0.025em] text-[var(--journal-text)] sm:text-[23px]">
                          {post.title}
                        </h3>

                        <p className="mt-3 line-clamp-2 text-[11px] leading-6 text-[var(--journal-muted)]">
                          {post.excerpt}
                        </p>
                      </div>

                      <span className="inline-flex w-fit items-center gap-2.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--journal-text)] transition-colors duration-300 group-hover:text-[var(--journal-copper)]">
                        {copy.article.read}
                        <span
                          className={`transition-transform duration-300 group-hover:-translate-x-1 ${
                            isRtl ? "" : "rotate-180 group-hover:translate-x-1"
                          }`}
                        >
                          <ArrowLeftIcon />
                        </span>
                      </span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>

        {/* Bottom editorial rule */}
        <div className="mt-8 flex items-center justify-between gap-5 border-b border-black/[0.10] pb-4">
          <span className="text-[7px] font-semibold uppercase tracking-[0.18em] text-black/30">
            Journal / Najibzadeh
          </span>
          <span className="h-px flex-1 bg-black/[0.08]" />
          <span className="text-[7px] font-medium tabular-nums tracking-[0.14em] text-black/26">
            {String(posts.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
