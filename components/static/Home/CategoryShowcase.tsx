import Image from "next/image";
import Link from "next/link";

import { type CSSProperties } from "react";

import { getStorefrontCatalog } from "@/services/catalog/storefront";
import { brandColors, lightTokens } from "@/theme/theme-colors";

/* ========================================================================== 
   TYPES
============================================================================ */

export type CategoryItem = {
  id: string;
  name: string;
  href: string;
  image: string;
  imageAlt?: string;
  imageFit?: CSSProperties["objectFit"];
  imagePosition?: string;
};

type CategoryShowcaseProps = {
  categories?: CategoryItem[];
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
};

type LocalizedText = {
  fa?: string;
  en?: string;
  ar?: string;
};

type CatalogImageAsset = {
  _id: unknown;
  url?: string;
  alt?: LocalizedText;
  objectFit?: string;
  objectPosition?: string;
};

type CatalogCategoryRecord = {
  _id: unknown;
  name?: LocalizedText;
  slug: string;
  thumbnailImageId?: unknown;
  thumbnailObjectFit?: string;
  thumbnailObjectPosition?: string;
  pageContent?: {
    primaryBanner?: {
      imageId?: unknown;
      objectFit?: string;
      objectPosition?: string;
    };
  };
};

const FALLBACK_IMAGE = "/assets/images/banner.webp";

function idOf(value: unknown) {
  if (typeof value === "string") return value;

  if (value && typeof value === "object" && "toString" in value) {
    return String(value);
  }

  return "";
}

function fa(value: LocalizedText | null | undefined, fallback = "") {
  return (
    value?.fa?.trim() || value?.en?.trim() || value?.ar?.trim() || fallback
  );
}

function imageFitOf(value: string | undefined): CSSProperties["objectFit"] {
  if (
    value === "contain" ||
    value === "cover" ||
    value === "fill" ||
    value === "none" ||
    value === "scale-down"
  ) {
    return value;
  }

  return "cover";
}

export async function getHomeCategoryShowcaseItems(): Promise<CategoryItem[]> {
  const catalog = (await getStorefrontCatalog()) as unknown as {
    categories?: CatalogCategoryRecord[];
    images?: CatalogImageAsset[];
  };

  const imageMap = new Map(
    (catalog.images ?? []).map((image) => [idOf(image._id), image]),
  );

  return (catalog.categories ?? []).map((category) => {
    const name = fa(category.name, category.slug);
    const banner = category.pageContent?.primaryBanner;
    const imageId = category.thumbnailImageId ?? banner?.imageId;
    const image = imageMap.get(idOf(imageId));

    return {
      id: idOf(category._id) || category.slug,
      name,
      href: `/${category.slug}`,
      image: image?.url || FALLBACK_IMAGE,
      imageAlt: fa(image?.alt, name),
      imageFit: imageFitOf(
        category.thumbnailObjectFit ?? banner?.objectFit ?? image?.objectFit,
      ),
      imagePosition:
        category.thumbnailObjectPosition ??
        banner?.objectPosition ??
        image?.objectPosition ??
        "center",
    };
  });
}

/* ========================================================================== 
   COMPONENT
============================================================================ */

export function CategoryShowcase({
  categories = [],
  eyebrow = "دسته‌بندی‌ها",
  title = "دسته‌بندی‌های نجیب‌زاده",
  description = "مجموعه‌های اصلی نجیب‌زاده را ببینید و بر اساس سلیقه، نیاز و موقعیت خود انتخاب کنید.",
  className = "",
}: CategoryShowcaseProps) {
  const visibleCategories = categories;

  const themeVars = {
    "--cat-bg": lightTokens.surfaceBrand,
    "--cat-text": brandColors.black.hex,
    "--cat-muted": lightTokens.textMuted,
    "--cat-accent": brandColors.copper.hex,
    "--cat-black-rgb": brandColors.black.rgb,
  } as CSSProperties;

  if (!visibleCategories.length) return null;

  const gridLayout = getGridLayout(visibleCategories.length);

  return (
    <section
      aria-labelledby="category-showcase-title"
      style={themeVars}
      dir="rtl"
      lang="fa"
      className={`relative w-full overflow-hidden bg-[var(--cat-bg)] text-[var(--cat-text)] ${className}`}
    >
      <div className="mx-auto w-full max-w-[1760px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 xl:px-10 xl:py-28">
        <header className="mx-auto flex max-w-[820px] flex-col items-center text-center">
          {eyebrow ? (
            <div className="flex items-center justify-center gap-3 text-[10px] font-medium text-[var(--cat-accent)] sm:text-[11px]">
              <span
                aria-hidden="true"
                className="h-px w-7 bg-[var(--cat-accent)]/70"
              />
              <span>{eyebrow}</span>
              <span
                aria-hidden="true"
                className="h-px w-7 bg-[var(--cat-accent)]/70"
              />
            </div>
          ) : null}

          <h2
            id="category-showcase-title"
            className="mt-5 max-w-[760px] text-balance text-[clamp(2.45rem,8vw,4.9rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-[var(--cat-text)] sm:mt-6 lg:text-[clamp(3.7rem,4.8vw,5.3rem)]"
          >
            {title}
          </h2>

          {description ? (
            <p className="mt-5 max-w-[590px] text-pretty text-[12px] leading-7 text-[var(--cat-muted)] sm:text-[13px] lg:mt-6 lg:text-[14px] lg:leading-8">
              {description}
            </p>
          ) : null}

          <span
            aria-hidden="true"
            className="mt-7 h-px w-12 bg-[var(--cat-accent)]/55 sm:mt-8"
          />
        </header>

        <div
          className={`mx-auto mt-10 grid w-full gap-2.5 sm:mt-12 sm:gap-3 lg:mt-14 lg:gap-4 ${gridLayout}`}
        >
          {visibleCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}

function getGridLayout(count: number) {
  if (count === 1) return "max-w-[620px] grid-cols-1";
  if (count === 2) return "max-w-[1120px] grid-cols-1 sm:grid-cols-2";
  if (count === 4) {
    return "max-w-[1560px] grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";
  }

  return "max-w-[1560px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
}

/* ========================================================================== 
   CATEGORY CARD
============================================================================ */

function CategoryCard({ category }: { category: CategoryItem }) {
  return (
    <Link
      href={category.href}
      aria-label={`مشاهده دسته ${category.name}`}
      className="group relative isolate mx-auto block aspect-[4/5] w-full max-w-[620px] overflow-hidden bg-[#0B0B0B] text-white outline-none focus-visible:ring-2 focus-visible:ring-black/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--cat-bg)] sm:aspect-[3/4] lg:max-w-none"
    >
      <Image
        src={category.image}
        alt={category.imageAlt ?? category.name}
        fill
        draggable={false}
        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
        style={{
          objectFit: category.imageFit ?? "cover",
          objectPosition: category.imagePosition ?? "center",
        }}
        className="pointer-events-none select-none transition-transform duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0.03)_0%,rgba(11,11,11,0.07)_40%,rgba(11,11,11,0.78)_100%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(11,11,11,0.20)_120%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-3 border border-white/[0.08] opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none sm:inset-4"
      />

      <div className="absolute inset-x-5 bottom-6 flex flex-col items-center text-center sm:inset-x-6 sm:bottom-7 lg:bottom-8">
        

        <h3 className="mt-2 text-balance text-[clamp(2.15rem,10vw,3.9rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-[clamp(2.3rem,6vw,4rem)] md:text-[clamp(2.3rem,3.5vw,4rem)]">
          {category.name}
        </h3>

        <span
          aria-hidden="true"
          className="mt-4 h-px w-8 bg-white/45 transition-[width,background-color] duration-500 group-hover:w-12 group-hover:bg-[var(--cat-accent)] motion-reduce:transition-none"
        />

        <span className="mt-4 inline-flex items-center gap-2 text-[10px] font-medium text-white/68 transition-colors duration-300 group-hover:text-white sm:text-[11px]">
          مشاهده دسته
          <ArrowLeftIcon />
        </span>
      </div>
    </Link>
  );
}

/* ========================================================================== 
   ICON
============================================================================ */

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="size-3.5 transition-transform duration-300 group-hover:-translate-x-1 motion-reduce:transition-none"
    >
      <path
        d="M13.5 8H3M6.5 4.5L3 8L6.5 11.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
