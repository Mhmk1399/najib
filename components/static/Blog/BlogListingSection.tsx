"use client";

import Image from "next/image";
import Link from "next/link";

import {
  type CSSProperties,
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ArrowLeftIcon, ArrowRightIcon, Button } from "@/components/ui/Button";
import { CustomInput } from "@/components/ui/CustomInput";
import { CustomSelect, type SelectOption } from "@/components/ui/CustomSelect";

import type {
  BlogCategoryKey,
  BlogCopy,
  BlogPostCopy,
} from "@/lib/i18n/blog-copy";
import {
  getHtmlLang,
  getLocaleDirection,
  type Locale,
} from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/routes";
import { brandColors, lightTokens } from "@/theme/theme-colors";

/* ========================================================================== 
   TYPES
============================================================================ */

export type BlogPost = BlogPostCopy;

type BlogSort = "latest" | "oldest" | "title";
type BlogCategoryFilter = BlogCategoryKey | "all";

type BlogListingPageProps = {
  locale: Locale;
  copy: BlogCopy;
  heroImage: string;
  heroMobileImagePosition?: string;
  heroDesktopImagePosition?: string;
  posts?: BlogPost[];
  loading?: boolean;
  postsPerPage?: number;
  className?: string;
};

/* ========================================================================== 
   HELPERS
============================================================================ */

function formatTemplate(
  template: string,
  values: Record<string, string | number>,
) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(getHtmlLang(locale)).format(value);
}

function formatIndex(value: number, locale: Locale) {
  return new Intl.NumberFormat(getHtmlLang(locale), {
    minimumIntegerDigits: 2,
    useGrouping: false,
  }).format(value);
}

function formatDate(date: string, locale: Locale) {
  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat(getHtmlLang(locale), {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatReadingTime(
  minutes: number | undefined,
  locale: Locale,
  template: string,
) {
  if (!minutes) return "";

  return formatTemplate(template, {
    minutes: formatNumber(minutes, locale),
  });
}

/* ========================================================================== 
   PAGE
============================================================================ */

export function BlogListingPage({
  locale,
  copy,
  heroImage,
  heroMobileImagePosition = "62% center",
  heroDesktopImagePosition = "center",
  posts = copy.posts,
  loading = false,
  postsPerPage = 6,
  className = "",
}: BlogListingPageProps) {
  const direction = getLocaleDirection(locale);
  const htmlLang = getHtmlLang(locale);
  const isRtl = direction === "rtl";

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<BlogCategoryFilter>("all");
  const [sort, setSort] = useState<BlogSort>("latest");
  const [currentPage, setCurrentPage] = useState(1);

  const sortOptions = useMemo<SelectOption[]>(
    () => [
      { value: "latest", label: copy.filters.sort.latest },
      { value: "oldest", label: copy.filters.sort.oldest },
      { value: "title", label: copy.filters.sort.title },
    ],
    [copy.filters.sort],
  );

  const themeVars = {
    "--blog-bg": lightTokens.surfaceBrand,
    "--blog-surface": brandColors.white.hex,
    "--blog-black": "#0B0B0B",
    "--blog-muted": lightTokens.textMuted,
    "--blog-soft": lightTokens.textSoft,
    "--blog-border": lightTokens.border,
    "--blog-copper": brandColors.copper.hex,
  } as CSSProperties;

  const availableCategories = useMemo<BlogCategoryFilter[]>(() => {
    const unique = Array.from(new Set(posts.map((post) => post.category)));
    return ["all", ...unique];
  }, [posts]);

  const featuredPost = useMemo(
    () => posts.find((post) => post.featured) ?? posts[0] ?? null,
    [posts],
  );

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(htmlLang);

    let result = posts.filter((post) => {
      if (
        !search &&
        activeCategory === "all" &&
        featuredPost &&
        post.id === featuredPost.id
      ) {
        return false;
      }

      const categoryMatch =
        activeCategory === "all" || post.category === activeCategory;

      const categoryLabel = copy.categories[post.category];

      const searchMatch =
        !query ||
        [post.title, post.excerpt, categoryLabel, post.author]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase(htmlLang)
          .includes(query);

      return categoryMatch && searchMatch;
    });

    result = [...result];

    if (sort === "latest") {
      result.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
    }

    if (sort === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
      );
    }

    if (sort === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title, htmlLang));
    }

    return result;
  }, [
    activeCategory,
    copy.categories,
    featuredPost,
    htmlLang,
    posts,
    search,
    sort,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPosts.length / postsPerPage),
  );
  const safePage = Math.min(currentPage, totalPages);

  const paginatedPosts = useMemo(() => {
    const start = (safePage - 1) * postsPerPage;
    return filteredPosts.slice(start, start + postsPerPage);
  }, [filteredPosts, postsPerPage, safePage]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setCurrentPage(1));
    return () => cancelAnimationFrame(frame);
  }, [search, activeCategory, sort]);

  const showFeatured = Boolean(
    featuredPost && !search && activeCategory === "all" && safePage === 1,
  );

  return (
    <main
      style={themeVars}
      dir={direction}
      lang={htmlLang}
      className={`
        w-full
        overflow-x-clip
        bg-[var(--blog-bg)]
        text-[var(--blog-black)]
        ${className}
      `}
    >
      <BlogHero
        locale={locale}
        copy={copy}
        image={heroImage}
        mobileImagePosition={heroMobileImagePosition}
        desktopImagePosition={heroDesktopImagePosition}
      />

      {showFeatured && featuredPost ? (
        <FeaturedArticle
          locale={locale}
          copy={copy}
          post={featuredPost}
          isRtl={isRtl}
        />
      ) : null}

      <section
        id="journal"
        className="
          mx-auto
          w-full
          max-w-[1680px]
          px-5
          py-14
          sm:px-8
          sm:py-18
          lg:px-10
          lg:py-24
          xl:px-14
        "
      >
        <div
          className="
            grid
            justify-items-center
            gap-8
            border-b
            border-[var(--blog-border)]
            pb-10
            text-center
            lg:gap-10
            lg:pb-12
          "
        >
          <div className="mx-auto max-w-[780px] text-center">
            <Eyebrow>{copy.journal.eyebrow}</Eyebrow>

            <h2
              className="
                mx-auto
                mt-5
                text-[clamp(3rem,10vw,5.7rem)]
                font-normal
                leading-[0.92]
                tracking-[-0.06em]
                text-black
              "
            >
              {copy.journal.titleLine1}
              <br />
              {copy.journal.titleLine2}
            </h2>

            <p
              className="
                mx-auto
                mt-6
                max-w-[570px]
                text-[11px]
                leading-[1.85]
                text-[var(--blog-muted)]
                sm:text-[12px]
              "
            >
              {copy.journal.description}
            </p>
          </div>

          <div className="mx-auto w-full max-w-[420px]">
            <CustomInput
              type="search"
              value={search}
              onChange={(value) => setSearch(value)}
              placeholder={copy.filters.searchPlaceholder}
              clearable
              leadingIcon={<SearchIcon />}
              aria-label={copy.filters.searchAriaLabel}
            />
          </div>
        </div>

        <div className="border-b border-[var(--blog-border)] py-5">
          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              gap-5
              lg:flex-row
            "
          >
            <div
              className="
                -mx-5
                w-full
                overflow-x-auto
                px-5
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
                sm:-mx-8
                sm:px-8
                lg:mx-0
                lg:px-0
              "
            >
              <div
                className="
                  group/categories
                  mx-auto
                  flex
                  w-max
                  items-center
                  justify-center
                "
              >
                {availableCategories.map((category) => {
                  const active = activeCategory === category;
                  const label =
                    category === "all"
                      ? copy.filters.all
                      : copy.categories[category];

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`
                        relative
                        min-h-10
                        whitespace-nowrap
                        px-4
                        text-[8px]
                        font-semibold
                        uppercase
                        tracking-[0.14em]
                        transition-[opacity,color]
                        duration-300
                        group-hover/categories:opacity-30
                        hover:!opacity-100
                        ${active ? "!opacity-100 text-black" : "text-black/45"}
                      `}
                    >
                      {label}

                      {active ? (
                        <span
                          aria-hidden="true"
                          className="
                            absolute
                            inset-x-4
                            bottom-0
                            h-px
                            bg-black
                          "
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mx-auto w-full lg:w-[190px] lg:shrink-0">
              <CustomSelect
                value={sort}
                options={sortOptions}
                size="sm"
                ariaLabel={copy.filters.sortAriaLabel}
                onChange={(value) => {
                  if (
                    value === "latest" ||
                    value === "oldest" ||
                    value === "title"
                  ) {
                    setSort(value);
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div
          className="
            flex
            flex-col
            items-center
            justify-center
            gap-2
            py-6
            text-center
          "
        >
          <p
            className="
              text-[7px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-black/40
            "
          >
            {loading
              ? copy.filters.loading
              : formatTemplate(copy.filters.articlesCountTemplate, {
                  count: formatNumber(filteredPosts.length, locale),
                })}
          </p>

          {search ? (
            <p
              className="
                hidden
                max-w-[320px]
                truncate
                text-[8px]
                text-black/40
                sm:block
              "
            >
              {formatTemplate(copy.filters.resultsForTemplate, {
                query: search,
              })}
            </p>
          ) : null}
        </div>

        {loading ? (
          <BlogSkeleton />
        ) : paginatedPosts.length > 0 ? (
          <div
            className="
              grid
              grid-cols-1
              gap-x-px
              gap-y-12
              sm:grid-cols-2
              lg:grid-cols-3
              lg:gap-y-16
            "
          >
            {paginatedPosts.map((post, index) => (
              <BlogCard
                key={post.id}
                post={post}
                index={index}
                locale={locale}
                copy={copy}
                isRtl={isRtl}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            copy={copy}
            onReset={() => {
              setSearch("");
              setActiveCategory("all");
            }}
          />
        )}

        {!loading && filteredPosts.length > 0 && totalPages > 1 ? (
          <Pagination
            locale={locale}
            copy={copy}
            currentPage={safePage}
            totalPages={totalPages}
            onChange={(page) => {
              setCurrentPage(page);

              document.getElementById("journal")?.scrollIntoView({
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                  .matches
                  ? "auto"
                  : "smooth",
                block: "start",
              });
            }}
          />
        ) : null}
      </section>

      <NewsletterSection copy={copy} locale={locale} isRtl={isRtl} />
    </main>
  );
}

/* ========================================================================== 
   HERO
============================================================================ */

function BlogHero({
  locale,
  copy,
  image,
  mobileImagePosition,
  desktopImagePosition,
}: {
  locale: Locale;
  copy: BlogCopy;
  image: string;
  mobileImagePosition: string;
  desktopImagePosition: string;
}) {
  const isRtl = getLocaleDirection(locale) === "rtl";
  const ActionIcon = isRtl ? ArrowLeftIcon : ArrowRightIcon;

  return (
    <section
      style={
        {
          "--hero-mobile-position": mobileImagePosition,
          "--hero-desktop-position": desktopImagePosition,
        } as CSSProperties
      }
      className="
        relative
        isolate
        min-h-[100svh]
        overflow-hidden
        bg-black
        text-white
      "
    >
      <Image
        src={image}
        alt={copy.hero.imageAlt}
        fill
        priority
        sizes="100vw"
        draggable={false}
        className="
          -z-30
          object-cover
          object-[var(--hero-mobile-position)]
          md:object-[var(--hero-desktop-position)]
        "
      />

      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          -z-20
          bg-[linear-gradient(90deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.58)_35%,rgba(0,0,0,0.10)_72%)]
          max-md:bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.10)_38%,rgba(0,0,0,0.90)_100%)]
        "
      />

      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          -z-10
          bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.30)_130%)]
        "
      />

      <div
        className="
          mx-auto
          flex
          min-h-[100svh]
          max-w-[1680px]
          items-end
          justify-center
          px-5
          pb-28
          pt-28
          sm:px-8
          md:items-center
          md:px-10
          md:pb-0
          xl:px-14
        "
      >
        <div className="mx-auto w-full max-w-[760px] text-center">
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
              tracking-[0.23em]
              text-[var(--blog-copper)]
              sm:text-[8px]
            "
          >
            <span
              aria-hidden="true"
              className="h-px w-7 bg-[var(--blog-copper)]"
            />
            <span>{copy.hero.eyebrow}</span>
            <span
              aria-hidden="true"
              className="h-px w-7 bg-[var(--blog-copper)]"
            />
          </div>

          <h1
            className="
              mx-auto
              max-w-[740px]
              text-[clamp(3.8rem,14vw,6rem)]
              font-normal
              leading-[0.88]
              tracking-[-0.065em]
              text-white
              md:text-[clamp(5.5rem,7vw,8rem)]
            "
          >
            {copy.hero.title}
          </h1>

          <p
            className="
              mx-auto
              mt-7
              max-w-[520px]
              text-[10px]
              leading-[1.9]
              text-white/62
              sm:text-[11px]
            "
          >
            {copy.hero.description}
          </p>

          <div className="mx-auto mt-8 hidden w-full max-w-[240px] md:block">
            <Button
              href="#journal"
              variant="copper"
              size="lg"
              icon={<ActionIcon />}
              iconPosition="right"
              fullWidth
            >
              {copy.hero.actionLabel}
            </Button>
          </div>
        </div>
      </div>

      <div
        className="
          absolute
          inset-x-4
          bottom-[max(18px,env(safe-area-inset-bottom))]
          z-20
          md:hidden
        "
      >
        <Button
          href="#journal"
          variant="black"
          size="lg"
          icon={<ActionIcon />}
          iconPosition="right"
          fullWidth
        >
          {copy.hero.actionLabel}
        </Button>
      </div>
    </section>
  );
}

/* ========================================================================== 
   FEATURED ARTICLE
============================================================================ */

function FeaturedArticle({
  post,
  locale,
  copy,
  isRtl,
}: {
  post: BlogPost;
  locale: Locale;
  copy: BlogCopy;
  isRtl: boolean;
}) {
  const { ref, visible } = useRevealOnce<HTMLElement>();
  const ActionIcon = isRtl ? ArrowLeftIcon : ArrowRightIcon;
  const href = localizedHref(`/blog/${post.slug}`, locale);

  return (
    <section
      ref={ref}
      className="
        bg-white
        px-5
        py-14
        sm:px-8
        sm:py-18
        lg:px-10
        lg:py-24
        xl:px-14
      "
    >
      <div
        className={`
          mx-auto
          grid
          max-w-[1570px]
          overflow-hidden
          border-y
          border-black/10
          transition-[opacity,transform]
          duration-[900ms]
          ease-[cubic-bezier(0.22,1,0.36,1)]
          lg:grid-cols-[1.18fr_0.82fr]
          ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}
        `}
      >
        <Link
          href={href}
          className="
            group
            relative
            min-h-[420px]
            overflow-hidden
            bg-[#EAE6DF]
            sm:min-h-[540px]
            lg:min-h-[680px]
          "
        >
          <Image
            src={post.image}
            alt={post.imageAlt}
            fill
            sizes="(max-width: 1023px) 100vw, 60vw"
            draggable={false}
            style={{ objectPosition: post.imagePosition ?? "center" }}
            className="
              object-cover
              transition-transform
              duration-[1100ms]
              ease-[cubic-bezier(0.22,1,0.36,1)]
              group-hover:scale-[1.025]
            "
          />

          <span
            className="
              absolute
              left-1/2
              top-5
              -translate-x-1/2
              bg-black
              px-3
              py-2
              text-[6px]
              font-semibold
              uppercase
              tracking-[0.17em]
              text-white
            "
          >
            {copy.featured.badge}
          </span>
        </Link>

        <div
          className="
            flex
            flex-col
            items-center
            justify-center
            bg-[var(--blog-bg)]
            px-6
            py-10
            text-center
            sm:px-10
            sm:py-14
            lg:px-12
          "
        >
          <Eyebrow>{copy.categories[post.category]}</Eyebrow>

          <Link href={href}>
            <h2
              className="
                mx-auto
                mt-6
                max-w-[560px]
                text-[clamp(2.8rem,9vw,5rem)]
                leading-[0.94]
                tracking-[-0.055em]
                text-black
                transition-opacity
                hover:opacity-55
              "
            >
              {post.title}
            </h2>
          </Link>

          <p
            className="
              mx-auto
              mt-6
              max-w-[480px]
              text-[10px]
              leading-[1.85]
              text-[var(--blog-muted)]
              sm:text-[11px]
            "
          >
            {post.excerpt}
          </p>

          <ArticleMeta
            post={post}
            locale={locale}
            copy={copy}
            className="mt-6"
          />

          <div className="mx-auto mt-8 w-full max-w-[210px]">
            <Button
              href={href}
              variant="black"
              size="lg"
              icon={<ActionIcon />}
              iconPosition="right"
              fullWidth
            >
              {copy.featured.readArticle}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== 
   BLOG CARD
============================================================================ */

function BlogCard({
  post,
  index,
  locale,
  copy,
  isRtl,
}: {
  post: BlogPost;
  index: number;
  locale: Locale;
  copy: BlogCopy;
  isRtl: boolean;
}) {
  const { ref, visible } = useRevealOnce<HTMLElement>();
  const href = localizedHref(`/blog/${post.slug}`, locale);
  const ReadIcon = isRtl ? ArrowLeftIcon : ArrowRightIcon;

  return (
    <article
      ref={ref}
      style={{ transitionDelay: `${Math.min(index * 60, 240)}ms` }}
      className={`
        group
        min-w-0
        border-black/10
        text-center
        transition-[opacity,transform]
        duration-700
        ease-[cubic-bezier(0.22,1,0.36,1)]
        sm:px-4
        sm:[&:nth-child(odd)]:border-r
        lg:border-r
        lg:px-5
        lg:[&:nth-child(3n)]:border-r-0
        ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}
      `}
    >
      <Link
        href={href}
        className="relative block aspect-[4/3] overflow-hidden bg-[#E8E4DD]"
      >
        <Image
          src={post.image}
          alt={post.imageAlt}
          fill
          loading="lazy"
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
          draggable={false}
          style={{ objectPosition: post.imagePosition ?? "center" }}
          className="
            object-cover
            transition-transform
            duration-[900ms]
            ease-[cubic-bezier(0.22,1,0.36,1)]
            group-hover:scale-[1.03]
          "
        />

        <span
          className="
            absolute
            bottom-4
            left-1/2
            grid
            size-8
            -translate-x-1/2
            place-items-center
            bg-white
            text-[7px]
            font-semibold
            text-black
          "
        >
          {formatIndex(index + 1, locale)}
        </span>
      </Link>

      <div className="pt-5">
        <div className="flex items-center justify-center gap-4">
          <p
            className="
              text-[7px]
              font-semibold
              uppercase
              tracking-[0.17em]
              text-[var(--blog-copper)]
            "
          >
            {copy.categories[post.category]}
          </p>

          {post.readingMinutes ? (
            <span
              className="
                text-[6.5px]
                font-medium
                uppercase
                tracking-[0.13em]
                text-black/30
              "
            >
              {formatReadingTime(
                post.readingMinutes,
                locale,
                copy.article.readingTimeTemplate,
              )}
            </span>
          ) : null}
        </div>

        <Link href={href}>
          <h3
            className="
              mx-auto
              mt-4
              max-w-[480px]
              text-[26px]
              leading-[1.02]
              tracking-[-0.04em]
              text-black
              transition-opacity
              duration-300
              group-hover:opacity-55
              sm:text-[29px]
            "
          >
            {post.title}
          </h3>
        </Link>

        <p
          className="
            mx-auto
            mt-4
            line-clamp-3
            max-w-[450px]
            text-[9.5px]
            leading-[1.8]
            text-[var(--blog-muted)]
          "
        >
          {post.excerpt}
        </p>

        <div
          className="
            mt-5
            flex
            items-center
            justify-center
            gap-6
            border-t
            border-black/10
            pt-4
          "
        >
          <time
            dateTime={post.publishedAt}
            className="
              text-[6.5px]
              font-semibold
              uppercase
              tracking-[0.13em]
              text-black/30
            "
          >
            {formatDate(post.publishedAt, locale)}
          </time>

          <Link
            href={href}
            aria-label={formatTemplate(copy.article.readAriaTemplate, {
              title: post.title,
            })}
            className="
              flex
              items-center
              gap-2
              text-[7px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-black/50
              transition-[opacity,transform]
              hover:text-black
            "
          >
            <span>{copy.article.read}</span>
            <ReadIcon aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ========================================================================== 
   ARTICLE META
============================================================================ */

function ArticleMeta({
  post,
  locale,
  copy,
  className = "",
}: {
  post: BlogPost;
  locale: Locale;
  copy: BlogCopy;
  className?: string;
}) {
  return (
    <div
      className={`
        flex
        flex-wrap
        items-center
        justify-center
        gap-x-4
        gap-y-2
        text-[6.5px]
        font-semibold
        uppercase
        tracking-[0.13em]
        text-black/35
        ${className}
      `}
    >
      <time dateTime={post.publishedAt}>
        {formatDate(post.publishedAt, locale)}
      </time>

      {post.readingMinutes ? (
        <>
          <MetaDot />
          <span>
            {formatReadingTime(
              post.readingMinutes,
              locale,
              copy.article.readingTimeTemplate,
            )}
          </span>
        </>
      ) : null}

      {post.author ? (
        <>
          <MetaDot />
          <span>{post.author}</span>
        </>
      ) : null}
    </div>
  );
}

function MetaDot() {
  return <span aria-hidden="true" className="size-[2px] bg-black/25" />;
}

/* ========================================================================== 
   PAGINATION
============================================================================ */

function Pagination({
  currentPage,
  totalPages,
  onChange,
  locale,
  copy,
}: {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
  locale: Locale;
  copy: BlogCopy;
}) {
  const pages = createPageRange(currentPage, totalPages);

  return (
    <nav
      aria-label={copy.pagination.ariaLabel}
      className="
        mt-16
        flex
        items-center
        justify-center
        gap-5
        border-t
        border-[var(--blog-border)]
        pt-7
        lg:mt-20
      "
    >
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
        className="
          min-h-10
          text-[7px]
          font-semibold
          uppercase
          tracking-[0.15em]
          text-black/50
          transition-colors
          hover:text-black
          disabled:cursor-not-allowed
          disabled:opacity-20
        "
      >
        {copy.pagination.previous}
      </button>

      <div className="flex items-center">
        {pages.map((page, index) => {
          if (page === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                aria-hidden="true"
                className="
                  grid
                  size-9
                  place-items-center
                  text-[8px]
                  text-black/30
                "
              >
                •••
              </span>
            );
          }

          const active = page === currentPage;
          const formattedPage = formatNumber(page, locale);

          return (
            <button
              key={page}
              type="button"
              aria-current={active ? "page" : undefined}
              aria-label={formatTemplate(copy.pagination.pageAriaTemplate, {
                page: formattedPage,
              })}
              onClick={() => onChange(page)}
              className={`
                grid
                size-9
                place-items-center
                text-[8px]
                font-semibold
                transition-[background-color,color]
                ${
                  active
                    ? "bg-black text-white"
                    : "text-black/45 hover:bg-black/5 hover:text-black"
                }
              `}
            >
              {formattedPage}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onChange(currentPage + 1)}
        className="
          min-h-10
          text-[7px]
          font-semibold
          uppercase
          tracking-[0.15em]
          text-black/50
          transition-colors
          hover:text-black
          disabled:cursor-not-allowed
          disabled:opacity-20
        "
      >
        {copy.pagination.next}
      </button>
    </nav>
  );
}

/* ========================================================================== 
   NEWSLETTER
============================================================================ */

function NewsletterSection({
  copy,
  locale,
  isRtl,
}: {
  copy: BlogCopy;
  locale: Locale;
  isRtl: boolean;
}) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const ActionIcon = isRtl ? ArrowLeftIcon : ArrowRightIcon;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) return;

    setSubmitted(true);
  }

  return (
    <section className="bg-[#0B0B0B] text-white">
      <div
        className="
          mx-auto
          grid
          max-w-[900px]
          justify-items-center
          gap-10
          px-5
          py-14
          sm:px-8
          sm:py-18
          lg:px-10
          lg:py-20
          xl:px-14
        "
      >
        <div className="mx-auto max-w-[760px] text-center">
          <div
            className="
              flex
              items-center
              justify-center
              gap-3
              text-[7px]
              font-semibold
              uppercase
              tracking-[0.22em]
              text-[var(--blog-copper)]
            "
          >
            <span
              aria-hidden="true"
              className="h-px w-6 bg-[var(--blog-copper)]"
            />
            <span>{copy.newsletter.eyebrow}</span>
            <span
              aria-hidden="true"
              className="h-px w-6 bg-[var(--blog-copper)]"
            />
          </div>

          <h2
            className="
              mt-5
              text-[clamp(3rem,10vw,5.8rem)]
              leading-[0.92]
              tracking-[-0.06em]
            "
          >
            {copy.newsletter.title}
          </h2>

          <p
            className="
              mx-auto
              mt-5
              max-w-[530px]
              text-[10px]
              leading-[1.85]
              text-white/48
              sm:text-[11px]
            "
          >
            {copy.newsletter.description}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-[480px] text-center"
          dir={getLocaleDirection(locale)}
        >
          {submitted ? (
            <div className="border-t border-white/20 py-6">
              <p className="text-[24px]">{copy.newsletter.successTitle}</p>
              <p className="mt-2 text-[9px] text-white/40">
                {copy.newsletter.successDescription}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <CustomInput
                type="email"
                tone="dark"
                value={email}
                onChange={(value) => setEmail(value)}
                placeholder={copy.newsletter.emailPlaceholder}
                autoComplete="email"
                required
              />

              <Button
                type="submit"
                variant="cream"
                size="lg"
                icon={<ActionIcon />}
                iconPosition="right"
                fullWidth
              >
                {copy.newsletter.submit}
              </Button>

              <p className="text-[6.5px] leading-[1.6] text-white/25">
                {copy.newsletter.consent}
              </p>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

/* ========================================================================== 
   EMPTY STATE
============================================================================ */

function EmptyState({
  onReset,
  copy,
}: {
  onReset: () => void;
  copy: BlogCopy;
}) {
  return (
    <div
      className="
        flex
        min-h-[420px]
        flex-col
        items-center
        justify-center
        border-y
        border-[var(--blog-border)]
        px-6
        text-center
      "
    >
      <SearchLargeIcon />

      <p className="mt-6 text-[36px] tracking-[-0.045em]">{copy.empty.title}</p>

      <p
        className="
          mt-3
          max-w-[340px]
          text-[10px]
          leading-[1.8]
          text-[var(--blog-muted)]
        "
      >
        {copy.empty.description}
      </p>

      <div className="mt-7 w-full max-w-[190px]">
        <Button
          type="button"
          variant="black"
          size="md"
          onClick={onReset}
          fullWidth
        >
          {copy.empty.reset}
        </Button>
      </div>
    </div>
  );
}

/* ========================================================================== 
   SKELETON
============================================================================ */

function BlogSkeleton() {
  return (
    <div
      className="
        grid
        grid-cols-1
        gap-x-5
        gap-y-14
        sm:grid-cols-2
        lg:grid-cols-3
      "
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="animate-pulse motion-reduce:animate-none">
          <div className="aspect-[4/3] bg-black/[0.07]" />
          <div className="mt-5">
            <div className="h-2 w-20 bg-black/[0.08]" />
            <div className="mt-4 h-7 w-[82%] bg-black/[0.08]" />
            <div className="mt-2 h-7 w-[64%] bg-black/[0.08]" />
            <div className="mt-5 h-2 w-full bg-black/[0.06]" />
            <div className="mt-2 h-2 w-[76%] bg-black/[0.06]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ========================================================================== 
   EYEBROW
============================================================================ */

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div
      className="
        flex
        items-center
        justify-center
        gap-3
        text-center
        text-[7px]
        font-semibold
        tracking-[0.12em]
        text-[var(--blog-copper)]
      "
    >
      <span aria-hidden="true" className="h-px w-6 bg-[var(--blog-copper)]" />
      <span>{children}</span>
      <span aria-hidden="true" className="h-px w-6 bg-[var(--blog-copper)]" />
    </div>
  );
}

/* ========================================================================== 
   REVEAL
============================================================================ */

function useRevealOnce<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -5% 0px",
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

/* ========================================================================== 
   PAGINATION HELPER
============================================================================ */

function createPageRange(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      "ellipsis",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
}

/* ========================================================================== 
   ICONS
============================================================================ */

function SearchIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" className="size-4">
      <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1" />
      <path d="M12 12L16 16" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function SearchLargeIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="size-12 text-black/25"
    >
      <circle cx="21" cy="21" r="13" stroke="currentColor" strokeWidth="1" />
      <path d="M30.5 30.5L41 41" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
