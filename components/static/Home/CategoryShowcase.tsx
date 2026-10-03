import { type CSSProperties } from "react";

import {
  getHtmlLang,
  getLocaleDirection,
  type Locale,
} from "@/lib/i18n/config";
import type { HomeCopy } from "@/lib/i18n/home-copy";
import { getStorefrontCatalog } from "@/services/catalog/storefront";
import { brandColors, lightTokens } from "@/theme/theme-colors";
import { CategoryMarquee } from "./category-marquee";
import { estedad } from "@/next-persian-fonts/estedad";

/* ========================================================================== 
   TYPES
============================================================================ */

export type CategoryItem = {
  id: string;
  name: string;
  href: string;
  image: string;
  imageAssetId?: string;
  imageAlt?: string;
  imageFit?: CSSProperties["objectFit"];
  imagePosition?: string;
};

type CategoryShowcaseProps = {
  categories?: CategoryItem[];
  copy: HomeCopy["categories"];
  locale: Locale;
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
  alt?: LocalizedText | string;
  objectFit?: string;
  objectPosition?: string;
};

type CatalogCategoryRecord = {
  _id: unknown;
  name?: LocalizedText | string;
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

function localizedText(
  value: LocalizedText | string | null | undefined,
  locale: Locale,
  fallback = "",
) {
  if (typeof value === "string") return value.trim() || fallback;

  const priorities: Record<Locale, Array<keyof LocalizedText>> = {
    fa: ["fa", "en", "ar"],
    en: ["en", "fa", "ar"],
    ar: ["ar", "fa", "en"],
  };

  for (const key of priorities[locale]) {
    const candidate = value?.[key]?.trim();
    if (candidate) return candidate;
  }

  return fallback;
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

export async function getHomeCategoryShowcaseItems(
  locale: Locale,
): Promise<CategoryItem[]> {
  const catalog = (await getStorefrontCatalog(locale)) as unknown as {
    categories?: CatalogCategoryRecord[];
    images?: CatalogImageAsset[];
  };

  const imageMap = new Map(
    (catalog.images ?? []).map((image) => [idOf(image._id), image]),
  );

  return (catalog.categories ?? []).map((category) => {
    const name = localizedText(category.name, locale, category.slug);
    const banner = category.pageContent?.primaryBanner;
    const imageId = category.thumbnailImageId ?? banner?.imageId;
    const image = imageMap.get(idOf(imageId));

    return {
      id: idOf(category._id) || category.slug,
      name,
      href: `/${category.slug}`,
      image: image?.url || FALLBACK_IMAGE,
      imageAssetId: image ? idOf(image._id) : undefined,
      imageAlt: localizedText(image?.alt, locale, name),
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
  copy,
  locale,
  className = "",
}: CategoryShowcaseProps) {
  const visibleCategories = categories;
  const direction = getLocaleDirection(locale);
  const htmlLang = getHtmlLang(locale);

  const themeVars = {
    "--cat-bg": lightTokens.surfaceBrand,
    "--cat-text": brandColors.black.hex,
    "--cat-muted": lightTokens.textMuted,
    "--cat-accent": brandColors.copper.hex,
    "--cat-black-rgb": brandColors.black.rgb,
  } as CSSProperties;

  if (!visibleCategories.length) return null;

  return (
    <section
      aria-labelledby="category-showcase-title"
      style={themeVars}
      dir={direction}
      lang={htmlLang}
      className={`relative w-full overflow-hidden bg-[var(--cat-bg)] text-[var(--cat-text)] ${className}`}
    >
      <div className="mx-auto w-full max-w-[1760px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 xl:px-10 xl:py-28">
        <header className="mx-auto flex max-w-[820px] flex-col items-center text-center">
          {copy.eyebrow ? (
            <div className="flex items-center justify-center gap-3 text-[12px] font-medium text-[var(--cat-accent)] sm:text-[14px]">
              <span
                aria-hidden="true"
                className="h-px w-7 bg-[var(--cat-accent)]/70"
              />
              <span>{copy.eyebrow}</span>
              <span
                aria-hidden="true"
                className="h-px w-7 bg-[var(--cat-accent)]/70"
              />
            </div>
          ) : null}

          <h2
            id="category-showcase-title"
            className="mt-5 max-w-[760px] text-balance text-[clamp(2.45rem,8vw,4.9rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-[var(--cat-text)] sm:mt-6 lg:text-[clamp(3.7rem,4.8vw,5rem)]"
          >
            {copy.title}
          </h2>
        </header>

        <CategoryMarquee
          categories={visibleCategories}
          copy={copy}
          locale={locale}
          direction={direction}
        />
      </div>
    </section>
  );
}
