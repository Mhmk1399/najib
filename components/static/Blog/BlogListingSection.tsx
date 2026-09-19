"use client";

import Image from "next/image";
import Link from "next/link";

import {
  type CSSProperties,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ArrowRightIcon, Button } from "@/components/ui/Button";

import { CustomInput } from "@/components/ui/CustomInput";

import { CustomSelect, type SelectOption } from "@/components/ui/CustomSelect";

import { brandColors, lightTokens } from "@/theme/theme-colors";

/* ==========================================================================
   TYPES
============================================================================ */

export type BlogPost = {
  id: string;

  slug: string;

  title: string;

  excerpt: string;

  image: string;

  imageAlt?: string;

  imagePosition?: string;

  category: string;

  publishedAt: string;

  readingTime?: string;

  author?: string;

  featured?: boolean;
};

export type BlogHeroData = {
  eyebrow?: string;

  title: string;

  description?: string;

  image: string;

  imageAlt?: string;

  mobileImagePosition?: string;

  desktopImagePosition?: string;

  action?: {
    label: string;
    href: string;
  };
};

export type BlogNewsletterData = {
  eyebrow?: string;

  title: string;

  description?: string;
};

type BlogListingPageProps = {
  hero: BlogHeroData;

  posts: BlogPost[];

  categories?: string[];

  newsletter?: BlogNewsletterData;

  loading?: boolean;

  postsPerPage?: number;

  className?: string;
};

/* ==========================================================================
   FAKE DATA
============================================================================ */

export const fakeBlogPosts: BlogPost[] = [
  {
    id: "blog-01",

    slug: "the-new-language-of-modern-dressing",

    title: "زبان تازه پوشش مدرن",

    excerpt:
      "نگاهی سنجیده به تناسب، متریال و سادگی؛ روایتی از اینکه کمد لباس مدرن چگونه آرام‌تر، شخصی‌تر و ماندگارتر می‌شود.",

        image: "/assets/images/hero4.webp",

    imagePosition: "center 30%",

    category: "یادداشت‌های استایل",

    publishedAt: "2026-08-24",

    readingTime: "۶ دقیقه مطالعه",

    author: "تحریریه نجیب‌زاده",

    featured: true,
  },

  {
    id: "blog-02",

    slug: "why-material-matters",

    title: "چرا کیفیت متریال بیش از همیشه اهمیت دارد",

    excerpt:
      "از کشمیر تا پشم ظریف، کیفیت یک لباس مدت‌ها پیش از شکل‌گرفتن فرم نهایی آن آغاز می‌شود.",

        image: "/assets/images/banner.webp",

    category: "هنر ساخت",

    publishedAt: "2026-08-21",

    readingTime: "۵ دقیقه مطالعه",

    author: "تحریریه نجیب‌زاده",
  },

  {
    id: "blog-03",

    slug: "building-a-timeless-wardrobe",

    title: "ساختن کمدی فراتر از فصل",

    excerpt:
      "قطعاتی که ارزش نگه‌داشتن دارند، معمولاً پرهیاهوترین‌ها نیستند؛ نگاهی به انعطاف‌پذیری، ماندگاری و طراحی سنجیده.",

        image: "/assets/images/banner.webp",

    category: "یادداشت‌های استایل",

    publishedAt: "2026-08-18",

    readingTime: "۴ دقیقه مطالعه",

    author: "تحریریه نجیب‌زاده",
  },

  {
    id: "blog-04",

    slug: "inside-the-atelier",

    title: "درون آتلیه؛ جزئیاتی که هرگز نمی‌بینید",

    excerpt:
      "نگاهی نزدیک به ساخت، پرداخت نهایی و تصمیم‌های ظریفی که خیاطی ممتاز را شکل می‌دهند.",

        image: "/assets/images/banner.webp",

    category: "درون خانه",

    publishedAt: "2026-08-14",

    readingTime: "۸ دقیقه مطالعه",

    author: "تحریریه نجیب‌زاده",
  },

  {
    id: "blog-05",

    slug: "the-art-of-quiet-luxury",

    title: "تجمل آرام به معنای نامرئی بودن نیست",

    excerpt:
      "سادگی واقعی به معنای حذف نیست؛ یعنی اطمینان از اینکه دقیقاً چه چیزی شایسته توجه است.",

        image: "/assets/images/banner.webp",

    category: "دیدگاه‌ها",

    publishedAt: "2026-08-09",

    readingTime: "۷ دقیقه مطالعه",

    author: "تحریریه نجیب‌زاده",
  },

  {
    id: "blog-06",

    slug: "a-study-in-black",

    title: "مطالعه‌ای در سیاه",

    excerpt:
      "بافت، سایه و تناسب نشان می‌دهند چگونه یک رنگ می‌تواند هویت یک کمد کامل را به دوش بکشد.",

        image: "/assets/images/banner.webp",

    category: "الهام",

    publishedAt: "2026-08-03",

    readingTime: "۳ دقیقه مطالعه",

    author: "تحریریه نجیب‌زاده",
  },

  {
    id: "blog-07",

    slug: "care-for-cashmere",

    title: "چگونه از کشمیر مراقبت کنیم",

    excerpt:
      "راهنمایی کاربردی برای شست‌وشو، نگهداری و حفظ یکی از ظریف‌ترین الیاف طبیعی جهان.",

        image: "/assets/images/banner.webp",

    category: "راهنمای نگهداری",

    publishedAt: "2026-07-29",

    readingTime: "۵ دقیقه مطالعه",

    author: "تحریریه نجیب‌زاده",
  },

  {
    id: "blog-08",

    slug: "the-perfect-jacket",

    title: "آناتومی یک کت بی‌نقص",

    excerpt:
      "سرشانه، یقه، تعادل و تناسب؛ چهار جزئیاتی که خیاطی را از یک پوشش ساده به شخصیت تبدیل می‌کنند.",

        image: "/assets/images/banner.webp",

    category: "هنر ساخت",

    publishedAt: "2026-07-23",

    readingTime: "۷ دقیقه مطالعه",

    author: "تحریریه نجیب‌زاده",
  },

  {
    id: "blog-09",

    slug: "objects-with-character",

    title: "اشیایی با شخصیت",

    excerpt:
      "چرا چیزهایی که برای زندگی انتخاب می‌کنیم باید سنجیده، ملموس و با گذر زمان شخصی‌تر شوند.",

        image: "/assets/images/banner.webp",

    category: "الهام",

    publishedAt: "2026-07-18",

    readingTime: "۴ دقیقه مطالعه",

    author: "تحریریه نجیب‌زاده",
  },
];

/* ==========================================================================
   SORT
============================================================================ */

type BlogSort = "latest" | "oldest" | "title";

const SORT_OPTIONS: SelectOption[] = [
  {
    value: "latest",
    label: "جدیدترین",
  },

  {
    value: "oldest",
    label: "قدیمی‌ترین",
  },

  {
    value: "title",
    label: "الفبا",
  },
];

/* ==========================================================================
   PAGE
============================================================================ */

export function BlogListingPage({
  hero,

  posts,

  categories,

  newsletter = {
    eyebrow: "ژورنال نجیب‌زاده",

    title: "نزدیک به خانه نجیب‌زاده بمانید.",

    description:
      "روایت‌های تحریریه، کالکشن‌های تازه و نگاه‌های سنجیده را گاه‌به‌گاه دریافت کنید.",
  },

  loading = false,

  postsPerPage = 6,

  className = "",
}: BlogListingPageProps) {
  const [search, setSearch] = useState("");

  const [activeCategory, setActiveCategory] = useState("همه");

  const [sort, setSort] = useState<BlogSort>("latest");

  const [currentPage, setCurrentPage] = useState(1);

  /* ------------------------------------------------------------------------
     THEME
  ------------------------------------------------------------------------- */

  const themeVars = {
    "--blog-bg": lightTokens.surfaceBrand,

    "--blog-surface": brandColors.white.hex,

    "--blog-black": "#0B0B0B",

    "--blog-muted": lightTokens.textMuted,

    "--blog-soft": lightTokens.textSoft,

    "--blog-border": lightTokens.border,

    "--blog-copper": brandColors.copper.hex,
  } as CSSProperties;

  /* ------------------------------------------------------------------------
     CATEGORIES

     اگر از DB categories بدی، همونا استفاده میشن.
     در غیر این صورت از posts استخراج میشن.
  ------------------------------------------------------------------------- */

  const availableCategories = useMemo(() => {
    const source =
      categories ?? Array.from(new Set(posts.map((post) => post.category)));

    return ["همه", ...source.filter((category) => category !== "همه" && category !== "All")];
  }, [categories, posts]);

  /* ------------------------------------------------------------------------
     FEATURED
  ------------------------------------------------------------------------- */

  const featuredPost = useMemo(() => {
    return posts.find((post) => post.featured) ?? posts[0] ?? null;
  }, [posts]);

  /* ------------------------------------------------------------------------
     FILTER
  ------------------------------------------------------------------------- */

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = posts.filter((post) => {
      /*
       * Featured داخل لیست اصلی دوباره تکرار نشه
       * فقط در حالت default.
       */
      if (
        !search &&
        activeCategory === "همه" &&
        featuredPost &&
        post.id === featuredPost.id
      ) {
        return false;
      }

      const categoryMatch =
        activeCategory === "همه" || post.category === activeCategory;

      const searchMatch =
        !query ||
        [post.title, post.excerpt, post.category, post.author]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
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
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [posts, search, activeCategory, sort, featuredPost]);

  /* ------------------------------------------------------------------------
     PAGINATION
  ------------------------------------------------------------------------- */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPosts.length / postsPerPage),
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedPosts = useMemo(() => {
    const start = (safePage - 1) * postsPerPage;

    return filteredPosts.slice(start, start + postsPerPage);
  }, [filteredPosts, safePage, postsPerPage]);

  /* ------------------------------------------------------------------------
     RESET PAGE
  ------------------------------------------------------------------------- */

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeCategory, sort]);

  /* ------------------------------------------------------------------------
     SHOW FEATURE
  ------------------------------------------------------------------------- */

  const showFeatured = Boolean(
    featuredPost && !search && activeCategory === "همه" && safePage === 1,
  );

  return (
    <main
      style={themeVars}
      dir="rtl"
      className={`
        w-full
        overflow-hidden

        bg-[var(--blog-bg)]

        text-[var(--blog-black)]

        ${className}
      `}
    >
      {/* ===============================================================
          HERO
      ================================================================ */}

      <BlogHero hero={hero} />

      {/* ===============================================================
          FEATURED STORY
      ================================================================ */}

      {showFeatured && featuredPost && <FeaturedArticle post={featuredPost} />}

      {/* ===============================================================
          JOURNAL
      ================================================================ */}

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
        {/* =============================================================
            INTRO
        ============================================================== */}

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
          <div
            className="
              mx-auto
              max-w-[780px]
              text-center
            "
          >
            <Eyebrow>ژورنال نجیب‌زاده</Eyebrow>

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
              ایده‌هایی که
              <br />
              ارزش بازگشت دارند.
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
              نگاه‌هایی به پوشاک، هنر ساخت، متریال و جزئیات آرامی که جهان نجیب‌زاده را شکل می‌دهند.
            </p>
          </div>

          {/* ===========================================================
              SEARCH
          ============================================================ */}

          <div className="mx-auto w-full max-w-[420px]">
            <CustomInput
              type="search"
              value={search}
              onChange={(value) => setSearch(value)}
              placeholder="جست‌وجو در ژورنال"
              clearable
              leadingIcon={<SearchIcon />}
              aria-label="جست‌وجو در ژورنال"
            />
          </div>
        </div>

        {/* =============================================================
            FILTER BAR
        ============================================================== */}

        <div
          className="
            border-b
            border-[var(--blog-border)]

            py-5
          "
        >
          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              gap-5

              lg:flex-row
              lg:items-center
              lg:justify-center
            "
          >
            {/* =========================================================
                CATEGORY SCROLL
            ========================================================== */}

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

                          ${
                            active
                              ? `
                                !opacity-100

                                text-black
                              `
                              : `
                                text-black/45
                              `
                          }
                        `}
                    >
                      {blogCategoryLabel(category)}

                      {active && (
                        <span
                          className="
                              absolute

                              inset-x-4
                              bottom-0

                              h-px

                              bg-black
                            "
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* =========================================================
                SORT
            ========================================================== */}

            <div
              className="
                mx-auto
                w-full

                lg:w-[190px]
                lg:shrink-0
              "
            >
              <CustomSelect
                value={sort}
                options={SORT_OPTIONS}
                size="sm"
                ariaLabel="مرتب‌سازی مقاله‌ها"
                onChange={(value) => {
                  if (typeof value === "string") {
                    setSort(value as BlogSort);
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* =============================================================
            RESULTS META
        ============================================================== */}

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
              ? "در حال بارگذاری ژورنال"
              : `${new Intl.NumberFormat("fa-IR").format(filteredPosts.length)} ${
                  filteredPosts.length === 1 ? "مقاله" : "مقاله"
                }`}
          </p>

          {search && (
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
              نتایج برای &nbsp;
              <span
                className="
                  text-black
                "
              >
                “{search}”
              </span>
            </p>
          )}
        </div>

        {/* =============================================================
            GRID
        ============================================================== */}

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
              <BlogCard key={post.id} post={post} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState
            onReset={() => {
              setSearch("");

              setActiveCategory("همه");
            }}
          />
        )}

        {/* =============================================================
            PAGINATION
        ============================================================== */}

        {!loading && filteredPosts.length > 0 && totalPages > 1 && (
          <Pagination
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
        )}
      </section>

      {/* ===============================================================
          NEWSLETTER
      ================================================================ */}

      <NewsletterSection data={newsletter} />
    </main>
  );
}

/* ==========================================================================
   HERO
============================================================================ */

function BlogHero({ hero }: { hero: BlogHeroData }) {
  return (
    <section
      style={
        {
          "--hero-mobile-position": hero.mobileImagePosition ?? "center",

          "--hero-desktop-position": hero.desktopImagePosition ?? "center",
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
      {/* IMAGE */}

      <Image
        src={hero.image}
        alt={hero.imageAlt ?? hero.title}
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

      {/* DESKTOP GRADIENT */}

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

      {/* VIGNETTE */}

      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          -z-10

          bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.30)_130%)]
        "
      />

      {/* CONTENT */}

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
        <div
          className="
            mx-auto
            w-full
            max-w-[760px]
            text-center
          "
        >
          {hero.eyebrow && (
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
                className="
                  h-px
                  w-7
                  bg-[var(--blog-copper)]
                "
              />

              <span>{hero.eyebrow}</span>

              <span
                className="
                  h-px
                  w-7
                  bg-[var(--blog-copper)]
                "
              />
            </div>
          )}

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
            {hero.title}
          </h1>

          {hero.description && (
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
              {hero.description}
            </p>
          )}

          {/* CUSTOM BUTTON */}

          {hero.action && (
            <div
              className="
                mx-auto
                mt-8

                hidden

                w-full
                max-w-[240px]

                md:block
              "
            >
              <Button
                href={hero.action.href}
                variant="copper"
                size="lg"
                icon={<ArrowRightIcon />}
                iconPosition="right"
                fullWidth
              >
                {hero.action.label}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE CTA */}

      {hero.action && (
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
            href={hero.action.href}
            variant="black"
            size="lg"
            icon={<ArrowRightIcon />}
            iconPosition="right"
            fullWidth
          >
            {hero.action.label}
          </Button>
        </div>
      )}
    </section>
  );
}

/* ==========================================================================
   FEATURED ARTICLE
============================================================================ */

function FeaturedArticle({ post }: { post: BlogPost }) {
  const { ref, visible } = useRevealOnce<HTMLElement>();

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

          ${
            visible
              ? `
                translate-y-0
                opacity-100
              `
              : `
                translate-y-8
                opacity-0
              `
          }
        `}
      >
        {/* IMAGE */}

        <Link
          href={`/blog/${post.slug}`}
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
            alt={post.imageAlt ?? post.title}
            fill
            sizes="
              (max-width: 1023px) 100vw,
              60vw
            "
            draggable={false}
            style={{
              objectPosition: post.imagePosition ?? "center",
            }}
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
            داستان ویژه
          </span>
        </Link>

        {/* CONTENT */}

        <div
          className="
            flex
            flex-col
            items-center
            justify-center

            bg-[var(--blog-bg)]
            text-center

            px-6
            py-10

            sm:px-10
            sm:py-14

            lg:px-12
          "
        >
          <Eyebrow>{blogCategoryLabel(post.category)}</Eyebrow>

          <Link href={`/blog/${post.slug}`}>
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

          <ArticleMeta post={post} className="mt-6" />

          <div
            className="
              mx-auto
              mt-8

              w-full
              max-w-[210px]
            "
          >
            <Button
              href={`/blog/${post.slug}`}
              variant="black"
              size="lg"
              icon={<ArrowRightIcon />}
              iconPosition="right"
              fullWidth
            >
              مطالعه مقاله
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
}: {
  post: BlogPost;

  index: number;
}) {
  const { ref, visible } = useRevealOnce<HTMLElement>();

  return (
    <article
      ref={ref}
      style={{
        transitionDelay: `${Math.min(index * 60, 240)}ms`,
      }}
      className={`
        group

        min-w-0
        text-center

        border-black/10

        transition-[opacity,transform]
        duration-700

        ease-[cubic-bezier(0.22,1,0.36,1)]

        sm:px-4

        sm:[&:nth-child(odd)]:border-r

        lg:border-r
        lg:px-5

        lg:[&:nth-child(3n)]:border-r-0

        ${
          visible
            ? `
              translate-y-0
              opacity-100
            `
            : `
              translate-y-6
              opacity-0
            `
        }
      `}
    >
      {/* IMAGE */}

      <Link
        href={`/blog/${post.slug}`}
        className="
          relative

          block

          aspect-[4/3]

          overflow-hidden

          bg-[#E8E4DD]
        "
      >
        <Image
          src={post.image}
          alt={post.imageAlt ?? post.title}
          fill
          loading="lazy"
          sizes="
            (max-width: 639px) 100vw,
            (max-width: 1023px) 50vw,
            33vw
          "
          draggable={false}
          style={{
            objectPosition: post.imagePosition ?? "center",
          }}
          className="
            object-cover

            transition-transform
            duration-[900ms]

            ease-[cubic-bezier(0.22,1,0.36,1)]

            group-hover:scale-[1.03]
          "
        />

        {/* INDEX */}

        <span
          className="
            absolute

            bottom-4
            left-1/2
            -translate-x-1/2

            grid
            size-8

            place-items-center

            bg-white

            text-[7px]
            font-semibold

            text-black
          "
        >
          {new Intl.NumberFormat("fa-IR", { minimumIntegerDigits: 2, useGrouping: false }).format(index + 1)}
        </span>
      </Link>

      {/* CONTENT */}

      <div
        className="
          pt-5
        "
      >
        <div
          className="
            flex

            items-center
            justify-center

            gap-4
          "
        >
          <p
            className="
              text-[7px]
              font-semibold

              uppercase
              tracking-[0.17em]

              text-[var(--blog-copper)]
            "
          >
            {blogCategoryLabel(post.category)}
          </p>

          {post.readingTime && (
            <span
              className="
                text-[6.5px]
                font-medium

                uppercase
                tracking-[0.13em]

                text-black/30
              "
            >
              {formatReadingTime(post.readingTime)}
            </span>
          )}
        </div>

        <Link href={`/blog/${post.slug}`}>
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
            {formatDate(post.publishedAt)}
          </time>

          <Link
            href={`/blog/${post.slug}`}
            aria-label={`مطالعه ${post.title}`}
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

              hover:translate-x-1
              hover:text-black
            "
          >
            مطالعه
            <span>←</span>
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

  className = "",
}: {
  post: BlogPost;

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
      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>

      {post.readingTime && (
        <>
          <span
            className="
              size-[2px]

              bg-black/25
            "
          />

          <span>{formatReadingTime(post.readingTime)}</span>
        </>
      )}

      {post.author && (
        <>
          <span
            className="
              size-[2px]

              bg-black/25
            "
          />

          <span>{formatAuthor(post.author)}</span>
        </>
      )}
    </div>
  );
}

/* ==========================================================================
   PAGINATION
============================================================================ */

function Pagination({
  currentPage,

  totalPages,

  onChange,
}: {
  currentPage: number;

  totalPages: number;

  onChange: (page: number) => void;
}) {
  const pages = createPageRange(currentPage, totalPages);

  return (
    <nav
      aria-label="صفحه‌بندی وبلاگ"
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
      {/* PREVIOUS */}

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
        قبلی
      </button>

      {/* NUMBERS */}

      <div
        className="
          flex
          items-center
        "
      >
        {pages.map((page, index) => {
          if (page === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
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

          return (
            <button
              key={page}
              type="button"
              aria-current={active ? "page" : undefined}
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
                      ? `
                        bg-black

                        text-white
                      `
                      : `
                        text-black/45

                        hover:bg-black/5
                        hover:text-black
                      `
                  }
                `}
            >
              {new Intl.NumberFormat("fa-IR").format(page)}
            </button>
          );
        })}
      </div>

      {/* NEXT */}

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
        بعدی
      </button>
    </nav>
  );
}

/* ==========================================================================
   NEWSLETTER
============================================================================ */

function NewsletterSection({ data }: { data: BlogNewsletterData }) {
  const [email, setEmail] = useState("");

  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!email.trim()) {
      return;
    }

    /*
     * بعداً:
     *
     * await subscribeToNewsletter(email)
     */

    setSubmitted(true);
  }

  return (
    <section
      className="
        bg-[#0B0B0B]

        text-white
      "
    >
      <div
        className="
          mx-auto

          grid
          justify-items-center

          max-w-[900px]

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
        {/* CONTENT */}

        <div
          className="
            mx-auto
            max-w-[760px]
            text-center
          "
        >
          {data.eyebrow && (
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
                className="
                  h-px
                  w-6
                  bg-[var(--blog-copper)]
                "
              />

              {data.eyebrow}

              <span
                className="
                  h-px
                  w-6
                  bg-[var(--blog-copper)]
                "
              />
            </div>
          )}

          <h2
            className="
              mt-5

               

              text-[clamp(3rem,10vw,5.8rem)]

              leading-[0.92]
              tracking-[-0.06em]
            "
          >
            {data.title}
          </h2>

          {data.description && (
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
              {data.description}
            </p>
          )}
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-[480px] text-center"
        >
          {submitted ? (
            <div
              className="
                border-t
                border-white/20

                py-6
              "
            >
              <p
                className="
                   

                  text-[24px]
                "
              >
                عضویت شما ثبت شد.
              </p>

              <p
                className="
                  mt-2

                  text-[9px]

                  text-white/40
                "
              >
                از همراهی شما با ژورنال نجیب‌زاده سپاسگزاریم.
              </p>
            </div>
          ) : (
            <div
              className="
                space-y-3
              "
            >
              <CustomInput
                type="email"
                tone="dark"
                value={email}
                onChange={(value) => setEmail(value)}
                placeholder="آدرس ایمیل"
                autoComplete="email"
                required
              />

              <Button
                type="submit"
                variant="cream"
                size="lg"
                icon={<ArrowRightIcon />}
                iconPosition="right"
                fullWidth
              >
                عضویت
              </Button>

              <p
                className="
                  text-[6.5px]

                  leading-[1.6]

                  text-white/25
                "
              >
                با عضویت، با دریافت گاه‌به‌گاه مطالب تحریریه نجیب‌زاده موافقت می‌کنید.
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

function EmptyState({ onReset }: { onReset: () => void }) {
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

      <p
        className="
          mt-6

           

          text-[36px]

          tracking-[-0.045em]
        "
      >
        نتیجه‌ای پیدا نشد.
      </p>

      <p
        className="
          mt-3

          max-w-[340px]

          text-[10px]

          leading-[1.8]

          text-[var(--blog-muted)]
        "
      >
        عبارت دیگری جست‌وجو کنید یا همه داستان‌های ژورنال را ببینید.
      </p>

      <div
        className="
          mt-7

          w-full
          max-w-[190px]
        "
      >
        <Button
          type="button"
          variant="black"
          size="md"
          onClick={onReset}
          fullWidth
        >
          پاک‌کردن فیلترها
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
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <div
          key={index}
          className="
              animate-pulse

              motion-reduce:animate-none
            "
        >
          <div
            className="
                aspect-[4/3]

                bg-black/[0.07]
              "
          />

          <div
            className="
                mt-5
              "
          >
            <div
              className="
                  h-2
                  w-20

                  bg-black/[0.08]
                "
            />

            <div
              className="
                  mt-4

                  h-7
                  w-[82%]

                  bg-black/[0.08]
                "
            />

            <div
              className="
                  mt-2

                  h-7
                  w-[64%]

                  bg-black/[0.08]
                "
            />

            <div
              className="
                  mt-5

                  h-2
                  w-full

                  bg-black/[0.06]
                "
            />

            <div
              className="
                  mt-2

                  h-2
                  w-[76%]

                  bg-black/[0.06]
                "
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ==========================================================================
   EYEBROW
============================================================================ */

function Eyebrow({ children }: { children: React.ReactNode }) {
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
      <span className="h-px w-6 bg-[var(--blog-copper)]" />
      <span>{children}</span>
      <span className="h-px w-6 bg-[var(--blog-copper)]" />
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

    if (!node) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);

      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setVisible(true);

        observer.disconnect();
      },
      {
        threshold: 0.08,

        rootMargin: "0px 0px -5% 0px",
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return {
    ref,
    visible,
  };
}

/* ==========================================================================
   PAGINATION HELPER
============================================================================ */

function createPageRange(
  currentPage: number,

  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 5) {
    return Array.from(
      {
        length: totalPages,
      },
      (_, index) => index + 1,
    );
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
   LOCALIZATION HELPERS
============================================================================ */

function blogCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    "All": "همه",
    "Style Notes": "یادداشت‌های استایل",
    "Craftsmanship": "هنر ساخت",
    "Inside The House": "درون خانه",
    "Perspectives": "دیدگاه‌ها",
    "Inspiration": "الهام",
    "Care Guide": "راهنمای نگهداری",
  };

  return labels[category] ?? category;
}

function formatReadingTime(value?: string) {
  if (!value) return "";

  const minutes = value.match(/(\d+)\s*min/i)?.[1];

  if (!minutes) return value;

  return `${new Intl.NumberFormat("fa-IR").format(Number(minutes))} دقیقه مطالعه`;
}

function formatAuthor(value?: string) {
  if (!value) return "";

  return value === "Najibzadeh Editorial" ? "تحریریه نجیب‌زاده" : value;
}

/* ==========================================================================
   DATE
============================================================================ */

function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("fa-IR", {
    day: "2-digit",

    month: "short",

    year: "numeric",
  }).format(parsed);
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
      className="
        size-12

        text-black/25
      "
    >
      <circle cx="21" cy="21" r="13" stroke="currentColor" strokeWidth="1" />

      <path d="M30.5 30.5L41 41" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
