"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type {
  CategoryPageData,
  CategoryProduct,
  CategorySubcategory,
  SubcategoryPageData,
} from "@/types/category-page";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { catalogPageCopy } from "@/lib/i18n/catalog-page-copy";
import { localizedHref } from "@/lib/i18n/routes";
import { shellCopy } from "@/lib/i18n/shell-copy";

type LocalizedText = {
  fa?: string;
  en?: string;
  ar?: string;
};

type CatalogImageAsset = {
  _id: string;
  url: string;
  alt?: LocalizedText;
  objectFit?: string;
  objectPosition?: string;
};

type PageBanner = {
  imageId?: string | null;
  objectFit?: string;
  objectPosition?: string;
  eyebrow?: LocalizedText;
  heading?: LocalizedText;
  body?: LocalizedText;
  ctaLabel?: LocalizedText;
  ctaHref?: string;
};

type PageDescription = {
  heading?: LocalizedText;
  body?: LocalizedText;
};

type PageContent = {
  primaryBanner?: PageBanner;
  primaryDescription?: PageDescription;
  secondaryBanner?: PageBanner;
  secondaryDescription?: PageDescription;
};

type CatalogCategoryRecord = {
  _id: string;
  name: LocalizedText;
  slug: string;
  description?: LocalizedText | null;
  thumbnailImageId?: string | null;
  thumbnailObjectPosition?: string;
  pageContent?: PageContent;
};

type CatalogSubcategoryRecord = CatalogCategoryRecord & {
  categoryId: string;
};

type CatalogProductRecord = {
  _id: string;
  name: LocalizedText;
  slug: string;
  description?: LocalizedText;
  basePriceMinor: number;
  currency: string;
  primaryImageId?: string | null;
  primaryImageObjectPosition?: string;
  colorIds?: string[];
};

type CatalogColorRecord = {
  _id: string;
  name: LocalizedText;
  slug: string;
  hex?: string;
};

type StorefrontCatalogPayload = {
  categories: CatalogCategoryRecord[];
  subcategories: CatalogSubcategoryRecord[];
  images: CatalogImageAsset[];
};

type StorefrontProductPayload = {
  items: CatalogProductRecord[];
  colors?: CatalogColorRecord[];
};

export type StorefrontMenuSection = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  groups: Array<{
    title: string;
    items: Array<{
      label: string;
      href: string;
      badge?: string;
    }>;
  }>;
  image: string;
  imageLabel: string;
};

const FALLBACK_IMAGE = "/assets/images/banner.webp";
const FALLBACK_PRODUCT_IMAGE = "/assets/images/p1.webp";

const storefrontQueryOptions = {
  staleTime: Infinity,
  gcTime: Infinity,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false,
  retry: 1,
} as const;

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    headers: {
      Accept: "application/json",
      ...Object.fromEntries(new Headers(init?.headers).entries()),
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "دریافت اطلاعات کاتالوگ ناموفق بود.");
  }

  return (await response.json()) as T;
}

function localized(
  value: LocalizedText | null | undefined,
  locale: Locale,
  fallback = "",
) {
  return (
    value?.[locale]?.trim() ||
    value?.fa?.trim() ||
    value?.en?.trim() ||
    value?.ar?.trim() ||
    fallback
  );
}

function idOf(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toString" in value) {
    return String(value);
  }
  return "";
}

function imageMapFrom(images: CatalogImageAsset[]) {
  return new Map(images.map((image) => [idOf(image._id), image]));
}

function colorMapFrom(colors: CatalogColorRecord[] = []) {
  return new Map(colors.map((color) => [idOf(color._id), color]));
}

function imageUrl(
  imageMap: Map<string, CatalogImageAsset>,
  imageId?: string | null,
  fallback = FALLBACK_IMAGE,
) {
  return imageMap.get(idOf(imageId))?.url || fallback;
}

function imageAlt(
  imageMap: Map<string, CatalogImageAsset>,
  imageId: string | null | undefined,
  locale: Locale,
  fallback: string,
) {
  return localized(imageMap.get(idOf(imageId))?.alt, locale, fallback);
}

function imagePosition(
  imageMap: Map<string, CatalogImageAsset>,
  imageId?: string | null,
  explicit?: string,
) {
  return explicit || imageMap.get(idOf(imageId))?.objectPosition || "center";
}

function firstSentence(value: string, maxLength = 210) {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength).trim()}...`;
}

function formatMoney(minor: number, currency: string, locale: Locale) {
  try {
    return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(minor / 100);
  } catch {
    return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : locale).format(
      minor / 100,
    );
  }
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function toSubcategoryCard(
  subcategory: CatalogSubcategoryRecord,
  category: CatalogCategoryRecord,
  imageMap: Map<string, CatalogImageAsset>,
  locale: Locale,
): CategorySubcategory {
  const copy = catalogPageCopy[locale];
  const fallbackTitle = localized(
    subcategory.name,
    locale,
    copy.subcategoryFallbackTitle,
  );
  const imageId =
    subcategory.thumbnailImageId ?? subcategory.pageContent?.primaryBanner?.imageId;

  return {
    id: idOf(subcategory._id),
    title: fallbackTitle,
    href: localizedHref(`/${category.slug}/${subcategory.slug}`, locale),
    image: imageUrl(imageMap, imageId),
    imageAssetId: idOf(imageId),
    imageAlt: imageAlt(imageMap, imageId, locale, fallbackTitle),
    imagePosition: imagePosition(
      imageMap,
      imageId,
      subcategory.thumbnailObjectPosition ??
        subcategory.pageContent?.primaryBanner?.objectPosition,
    ),
  };
}

function buildCategoryPageData(
  catalog: StorefrontCatalogPayload,
  categorySlug: string,
  locale: Locale,
): CategoryPageData | null {
  const category = catalog.categories.find((item) => item.slug === categorySlug);
  if (!category) return null;

  const copy = catalogPageCopy[locale];
  const imageMap = imageMapFrom(catalog.images);
  const name = localized(category.name, locale, category.slug);
  const content = category.pageContent ?? {};
  const primaryBanner = content.primaryBanner ?? {};
  const secondaryBanner = content.secondaryBanner ?? {};
  const primaryDescription = content.primaryDescription ?? {};
  const secondaryDescription = content.secondaryDescription ?? {};
  const primaryImageId = primaryBanner.imageId;
  const secondaryImageId = secondaryBanner.imageId;

  const subcategories = catalog.subcategories
    .filter((item) => idOf(item.categoryId) === idOf(category._id))
    .map((subcategory) =>
      toSubcategoryCard(subcategory, category, imageMap, locale),
    );

  return {
    id: idOf(category._id),
    slug: category.slug,
    name,
    breadcrumbLabel: name,
    hero: {
      eyebrow: localized(primaryBanner.eyebrow, locale, copy.brandEyebrow),
      title: localized(primaryBanner.heading, locale, name),
      description: localized(
        primaryBanner.body,
        locale,
        localized(
          category.description,
          locale,
          copy.categoryFallbackDescription,
        ),
      ),
      image: imageUrl(imageMap, primaryImageId),
      imageAssetId: idOf(primaryImageId),
      imageAlt: imageAlt(imageMap, primaryImageId, locale, name),
      mobileImagePosition: imagePosition(
        imageMap,
        primaryImageId,
        primaryBanner.objectPosition,
      ),
      desktopImagePosition: imagePosition(
        imageMap,
        primaryImageId,
        primaryBanner.objectPosition,
      ),
      action: {
        label: localized(primaryBanner.ctaLabel, locale, copy.viewProducts),
        href: localizedHref(
          primaryBanner.ctaHref || `/shop?category=${category.slug}`,
          locale,
        ),
      },
    },
    intro: {
      eyebrow: copy.categoryAboutEyebrow,
      title: localized(primaryDescription.heading, locale),
      description: localized(
        primaryDescription.body,
        locale,
        localized(
          category.description,
          locale,
          copy.subcategoryIntroFallbackDescription,
        ),
      ),
    },
    subcategories,
    feature: {
      eyebrow: localized(secondaryBanner.eyebrow, locale, copy.categoryFeatureEyebrow),
      title: localized(secondaryBanner.heading, locale, name),
      description: localized(
        secondaryBanner.body,
        locale,
        localized(
          secondaryDescription.body,
          locale,
          copy.categoryFeatureDescription,
        ),
      ),
      image: imageUrl(imageMap, secondaryImageId),
      imageAssetId: idOf(secondaryImageId),
      imageAlt: imageAlt(imageMap, secondaryImageId, locale, name),
      mobileImagePosition: imagePosition(
        imageMap,
        secondaryImageId,
        secondaryBanner.objectPosition,
      ),
      desktopImagePosition: imagePosition(
        imageMap,
        secondaryImageId,
        secondaryBanner.objectPosition,
      ),
    },
    finalCTA: {
      eyebrow: localized(secondaryDescription.heading, locale, copy.categoryFinalEyebrow),
      title: localized(secondaryBanner.ctaLabel, locale, copy.categoryFinalTitle(name)),
      description: localized(
        secondaryDescription.body,
        locale,
        localized(secondaryBanner.body, locale, copy.categoryFinalDescription),
      ),
      image: imageUrl(imageMap, secondaryImageId),
      imageAssetId: idOf(secondaryImageId),
      imageAlt: imageAlt(imageMap, secondaryImageId, locale, name),
      imagePosition: imagePosition(
        imageMap,
        secondaryImageId,
        secondaryBanner.objectPosition,
      ),
      action: {
        label: localized(secondaryBanner.ctaLabel, locale, copy.enterShop),
        href: localizedHref(
          secondaryBanner.ctaHref || `/shop?category=${category.slug}`,
          locale,
        ),
      },
    },
  };
}

function productCard(
  product: CatalogProductRecord,
  imageMap: Map<string, CatalogImageAsset>,
  colorMap: Map<string, CatalogColorRecord>,
  locale: Locale,
): CategoryProduct {
  const title = localized(product.name, locale, product.slug);
  const imageId = product.primaryImageId;
  const colors = (product.colorIds ?? [])
    .map((colorId) => colorMap.get(idOf(colorId))?.hex)
    .filter((hex): hex is string => Boolean(hex));

  return {
    id: idOf(product._id),
    title,
    subtitle: firstSentence(localized(product.description, locale), 70),
    href: localizedHref(`/shop/${product.slug}`, locale),
    image: imageUrl(imageMap, imageId, FALLBACK_PRODUCT_IMAGE),
    imageAssetId: idOf(imageId),
    imageAlt: imageAlt(imageMap, imageId, locale, title),
    imagePosition: imagePosition(
      imageMap,
      imageId,
      product.primaryImageObjectPosition,
    ),
    priceLabel: formatMoney(product.basePriceMinor, product.currency, locale),
    colors,
  };
}

function buildSubcategoryPageData(
  catalog: StorefrontCatalogPayload,
  categorySlug: string,
  subcategorySlug: string,
  products: CatalogProductRecord[],
  colors: CatalogColorRecord[] = [],
  locale: Locale,
): SubcategoryPageData | null {
  const category = catalog.categories.find((item) => item.slug === categorySlug);
  if (!category) return null;

  const subcategory = catalog.subcategories.find(
    (item) =>
      item.slug === subcategorySlug && idOf(item.categoryId) === idOf(category._id),
  );
  if (!subcategory) return null;

  const imageMap = imageMapFrom(catalog.images);
  const colorMap = colorMapFrom(colors);
  const copy = catalogPageCopy[locale];
  const name = localized(subcategory.name, locale, subcategory.slug);
  const categoryName = localized(category.name, locale, category.slug);
  const content = subcategory.pageContent ?? {};
  const primaryBanner = content.primaryBanner ?? {};
  const secondaryBanner = content.secondaryBanner ?? {};
  const primaryDescription = content.primaryDescription ?? {};
  const secondaryDescription = content.secondaryDescription ?? {};
  const primaryImageId = primaryBanner.imageId;
  const secondaryImageId = secondaryBanner.imageId;

  return {
    id: idOf(subcategory._id),
    slug: subcategory.slug,
    categorySlug: category.slug,
    categoryName,
    name,
    breadcrumbLabel: name,
    hero: {
      eyebrow: localized(primaryBanner.eyebrow, locale, categoryName),
      title: localized(primaryBanner.heading, locale, name),
      description: localized(
        primaryBanner.body,
        locale,
        localized(
          subcategory.description,
          locale,
          copy.subcategoryFallbackDescription,
        ),
      ),
      image: imageUrl(imageMap, primaryImageId),
      imageAssetId: idOf(primaryImageId),
      imageAlt: imageAlt(imageMap, primaryImageId, locale, name),
      mobileImagePosition: imagePosition(
        imageMap,
        primaryImageId,
        primaryBanner.objectPosition,
      ),
      desktopImagePosition: imagePosition(
        imageMap,
        primaryImageId,
        primaryBanner.objectPosition,
      ),
      action: {
        label: localized(primaryBanner.ctaLabel, locale, copy.viewProducts),
        href: localizedHref(
          primaryBanner.ctaHref || `/shop?subcategory=${subcategory.slug}`,
          locale,
        ),
      },
    },
    intro: {
      eyebrow: categoryName,
      title: localized(primaryDescription.heading, locale),
      description: localized(
        primaryDescription.body,
        locale,
        localized(
          subcategory.description,
          locale,
          copy.subcategoryIntroFallbackDescription,
        ),
      ),
    },
    products: products.map((product) =>
      productCard(product, imageMap, colorMap, locale),
    ),
    feature: {
      eyebrow: localized(
        secondaryBanner.eyebrow,
        locale,
        copy.subcategoryFeatureEyebrow,
      ),
      title: localized(secondaryBanner.heading, locale, name),
      description: localized(
        secondaryBanner.body,
        locale,
        localized(
          secondaryDescription.body,
          locale,
          copy.subcategoryFeatureDescription,
        ),
      ),
      image: imageUrl(imageMap, secondaryImageId),
      imageAssetId: idOf(secondaryImageId),
      imageAlt: imageAlt(imageMap, secondaryImageId, locale, name),
      mobileImagePosition: imagePosition(
        imageMap,
        secondaryImageId,
        secondaryBanner.objectPosition,
      ),
      desktopImagePosition: imagePosition(
        imageMap,
        secondaryImageId,
        secondaryBanner.objectPosition,
      ),
    },
    finalCTA: {
      eyebrow: localized(
        secondaryDescription.heading,
        locale,
        copy.subcategoryFinalEyebrow,
      ),
      title: localized(
        secondaryBanner.ctaLabel,
        locale,
        copy.subcategoryFinalTitle(name),
      ),
      description: localized(
        secondaryDescription.body,
        locale,
        localized(secondaryBanner.body, locale, copy.subcategoryFinalDescription),
      ),
      image: imageUrl(imageMap, secondaryImageId),
      imageAssetId: idOf(secondaryImageId),
      imageAlt: imageAlt(imageMap, secondaryImageId, locale, name),
      imagePosition: imagePosition(
        imageMap,
        secondaryImageId,
        secondaryBanner.objectPosition,
      ),
      action: {
        label: localized(secondaryBanner.ctaLabel, locale, copy.viewShop),
        href: localizedHref(
          secondaryBanner.ctaHref || `/shop?subcategory=${subcategory.slug}`,
          locale,
        ),
      },
    },
  };
}

function findSubcategoryBase(
  catalog: StorefrontCatalogPayload | undefined,
  categorySlug: string,
  subcategorySlug: string,
) {
  if (!catalog) return null;
  const category = catalog.categories.find((item) => item.slug === categorySlug);
  if (!category) return null;
  const subcategory = catalog.subcategories.find(
    (item) =>
      item.slug === subcategorySlug && idOf(item.categoryId) === idOf(category._id),
  );
  if (!subcategory) return null;
  return { category, subcategory };
}

export function useStorefrontCatalog() {
  return useQuery({
    queryKey: ["storefront", "catalog"],
    queryFn: ({ signal }) =>
      fetchJson<StorefrontCatalogPayload>("/api/storefront/catalog", { signal }),
    ...storefrontQueryOptions,
  });
}

export function useCategoryPageData(
  categorySlug: string,
  locale: Locale = defaultLocale,
) {
  const catalogQuery = useStorefrontCatalog();

  const data = useMemo(
    () =>
      catalogQuery.data
        ? buildCategoryPageData(catalogQuery.data, categorySlug, locale)
        : null,
    [catalogQuery.data, categorySlug, locale],
  );

  return {
    data,
    isLoading: catalogQuery.isLoading,
    isError: catalogQuery.isError,
    isNotFound: catalogQuery.isSuccess && !data,
    refetch: catalogQuery.refetch,
  };
}

export function useSubcategoryPageData(
  categorySlug: string,
  subcategorySlug: string,
  locale: Locale = defaultLocale,
) {
  const catalogQuery = useStorefrontCatalog();

  const base = useMemo(
    () => findSubcategoryBase(catalogQuery.data, categorySlug, subcategorySlug),
    [catalogQuery.data, categorySlug, subcategorySlug],
  );

  const productsQuery = useQuery({
    queryKey: ["storefront", "products", locale, base?.subcategory._id ?? null],
    queryFn: ({ signal }) =>
      fetchJson<StorefrontProductPayload>(
        `/api/storefront/products?subcategoryId=${base?.subcategory._id}&limit=48`,
        { signal },
      ),
    enabled: Boolean(base?.subcategory._id),
    ...storefrontQueryOptions,
  });

  const data = useMemo(() => {
    if (!catalogQuery.data || !base || !productsQuery.data) return null;
    return buildSubcategoryPageData(
      catalogQuery.data,
      categorySlug,
      subcategorySlug,
      productsQuery.data.items,
      productsQuery.data.colors,
      locale,
    );
  }, [
    base,
    catalogQuery.data,
    categorySlug,
    locale,
    productsQuery.data,
    subcategorySlug,
  ]);

  return {
    data,
    isLoading:
      catalogQuery.isLoading ||
      (Boolean(base?.subcategory._id) && productsQuery.isLoading),
    isError: catalogQuery.isError || productsQuery.isError,
    isNotFound: catalogQuery.isSuccess && !base,
    refetch: () => {
      void catalogQuery.refetch();
      if (base?.subcategory._id) void productsQuery.refetch();
    },
  };
}

export function useStorefrontMenuSections(locale: Locale = defaultLocale) {
  const catalogQuery = useStorefrontCatalog();
  const copy = shellCopy[locale];

  return useMemo<StorefrontMenuSection[]>(() => {
    if (!catalogQuery.data) {
      return [
        {
          id: "catalog-loading",
          title: copy.footer.catalogTitle,
          subtitle:
            locale === "fa"
              ? "در حال دریافت دسته‌بندی‌های فروشگاه."
              : locale === "ar"
                ? "جار تحميل تصنيفات المتجر."
                : "Loading store categories.",
          href: "/shop",
          groups: [
            {
              title: copy.navbar.quickLinks[4]?.label ?? copy.footer.allProducts,
              items: [{ label: copy.footer.allProducts, href: "/shop" }],
            },
          ],
          image: FALLBACK_IMAGE,
          imageLabel:
            locale === "fa"
              ? "کاتالوگ نجیب‌زاده"
              : locale === "ar"
                ? "كتالوج نجيب زاده"
                : "Najibzadeh catalog",
        },
      ];
    }

    const imageMap = imageMapFrom(catalogQuery.data.images);

    if (catalogQuery.data.categories.length === 0) {
      return [
        {
          id: "catalog-empty",
          title: copy.footer.catalogTitle,
          subtitle:
            locale === "fa"
              ? "هنوز دسته‌بندی فعالی برای نمایش عمومی ثبت نشده است."
              : locale === "ar"
                ? "لم يتم نشر أي تصنيف نشط بعد."
                : "No active categories are published yet.",
          href: "/shop",
          groups: [
            {
              title: copy.navbar.quickLinks[4]?.label ?? copy.footer.allProducts,
              items: [{ label: copy.footer.allProducts, href: "/shop" }],
            },
          ],
          image: FALLBACK_IMAGE,
          imageLabel:
            locale === "fa"
              ? "کاتالوگ نجیب‌زاده"
              : locale === "ar"
                ? "كتالوج نجيب زاده"
                : "Najibzadeh catalog",
        },
      ];
    }

    return catalogQuery.data.categories.map((category) => {
      const name = localized(category.name, locale, category.slug);
      const subs = catalogQuery.data.subcategories.filter(
        (subcategory) => idOf(subcategory.categoryId) === idOf(category._id),
      );
      const subcategoryItems = subs.map((subcategory) => ({
        label: localized(subcategory.name, locale, subcategory.slug),
        href: `/${category.slug}/${subcategory.slug}`,
      }));
      const groups = [
        {
          title: copy.navbar.quickAccess,
          items: [
            {
              label:
                locale === "fa"
                  ? `صفحه ${name}`
                  : locale === "ar"
                    ? `صفحة ${name}`
                    : `${name} page`,
              href: `/${category.slug}`,
            },
            { label: copy.footer.allProducts, href: `/shop?category=${category.slug}` },
          ],
        },
        ...chunk(subcategoryItems, 6).map((items, index) => ({
          title:
            index === 0
              ? locale === "fa"
                ? "زیردسته‌ها"
                : locale === "ar"
                  ? "التصنيفات الفرعية"
                  : "Subcategories"
              : locale === "fa"
                ? "زیردسته‌های بیشتر"
                : locale === "ar"
                  ? "تصنيفات فرعية أخرى"
                  : "More subcategories",
          items,
        })),
      ];
      const primaryBanner = category.pageContent?.primaryBanner;
      const imageId = category.thumbnailImageId ?? primaryBanner?.imageId;

      return {
        id: category.slug,
        title: name,
        subtitle: firstSentence(
          localized(
            category.description,
            locale,
            localized(
              category.pageContent?.primaryDescription?.body,
              locale,
              locale === "fa"
                ? "کالکشن‌های فعال این دسته را مرور کنید."
                : locale === "ar"
                  ? "تصفح المجموعات النشطة في هذا التصنيف."
                  : "Explore active collections in this category.",
            ),
          ),
        ),
        href: `/${category.slug}`,
        groups,
        image: imageUrl(imageMap, imageId),
        imageLabel: name,
      };
    });
  }, [catalogQuery.data, copy, locale]);
}
