"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type {
  CategoryPageData,
  CategoryProduct,
  CategorySubcategory,
  SubcategoryPageData,
} from "@/types/category-page";

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

function fa(value: LocalizedText | null | undefined, fallback = "") {
  return value?.fa?.trim() || value?.en?.trim() || value?.ar?.trim() || fallback;
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
  fallback: string,
) {
  return fa(imageMap.get(idOf(imageId))?.alt, fallback);
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

function formatMoney(minor: number, currency: string) {
  try {
    return new Intl.NumberFormat("fa-IR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(minor / 100);
  } catch {
    return new Intl.NumberFormat("fa-IR").format(minor / 100);
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
): CategorySubcategory {
  const fallbackTitle = fa(subcategory.name, "زیردسته");
  const imageId =
    subcategory.thumbnailImageId ?? subcategory.pageContent?.primaryBanner?.imageId;

  return {
    id: idOf(subcategory._id),
    title: fallbackTitle,
    href: `/${category.slug}/${subcategory.slug}`,
    image: imageUrl(imageMap, imageId),
    imageAlt: imageAlt(imageMap, imageId, fallbackTitle),
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
): CategoryPageData | null {
  const category = catalog.categories.find((item) => item.slug === categorySlug);
  if (!category) return null;

  const imageMap = imageMapFrom(catalog.images);
  const name = fa(category.name, category.slug);
  const content = category.pageContent ?? {};
  const primaryBanner = content.primaryBanner ?? {};
  const secondaryBanner = content.secondaryBanner ?? {};
  const primaryDescription = content.primaryDescription ?? {};
  const secondaryDescription = content.secondaryDescription ?? {};
  const primaryImageId = primaryBanner.imageId;
  const secondaryImageId = secondaryBanner.imageId;

  const subcategories = catalog.subcategories
    .filter((item) => idOf(item.categoryId) === idOf(category._id))
    .map((subcategory) => toSubcategoryCard(subcategory, category, imageMap));

  return {
    id: idOf(category._id),
    slug: category.slug,
    name,
    breadcrumbLabel: name,
    hero: {
      eyebrow: fa(primaryBanner.eyebrow, "نجیب‌زاده"),
      title: fa(primaryBanner.heading, name),
      description: fa(
        primaryBanner.body,
        fa(category.description, "کالکشن‌های منتخب نجیب‌زاده را مرور کنید."),
      ),
      image: imageUrl(imageMap, primaryImageId),
      imageAlt: imageAlt(imageMap, primaryImageId, name),
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
        label: fa(primaryBanner.ctaLabel, "مشاهده محصولات"),
        href: primaryBanner.ctaHref || `/shop?category=${category.slug}`,
      },
    },
    intro: {
      eyebrow: "درباره دسته",
      title: fa(primaryDescription.heading),
      description: fa(
        primaryDescription.body,
        fa(category.description, "جزئیات این دسته به‌زودی تکمیل می‌شود."),
      ),
    },
    subcategories,
    feature: {
      eyebrow: fa(secondaryBanner.eyebrow, "انتخاب ویژه"),
      title: fa(secondaryBanner.heading, name),
      description: fa(
        secondaryBanner.body,
        fa(secondaryDescription.body, "جزئیات انتخاب ویژه این دسته به‌زودی تکمیل می‌شود."),
      ),
      image: imageUrl(imageMap, secondaryImageId),
      imageAlt: imageAlt(imageMap, secondaryImageId, name),
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
      eyebrow: fa(secondaryDescription.heading, "ادامه مسیر"),
      title: fa(secondaryBanner.ctaLabel, `خرید ${name}`),
      description: fa(
        secondaryDescription.body,
        fa(secondaryBanner.body, "برای دیدن محصولات این دسته وارد فروشگاه شوید."),
      ),
      image: imageUrl(imageMap, secondaryImageId),
      imageAlt: imageAlt(imageMap, secondaryImageId, name),
      imagePosition: imagePosition(
        imageMap,
        secondaryImageId,
        secondaryBanner.objectPosition,
      ),
      action: {
        label: fa(secondaryBanner.ctaLabel, "ورود به فروشگاه"),
        href: secondaryBanner.ctaHref || `/shop?category=${category.slug}`,
      },
    },
  };
}

function productCard(
  product: CatalogProductRecord,
  imageMap: Map<string, CatalogImageAsset>,
  colorMap: Map<string, CatalogColorRecord>,
): CategoryProduct {
  const title = fa(product.name, product.slug);
  const imageId = product.primaryImageId;
  const colors = (product.colorIds ?? [])
    .map((colorId) => colorMap.get(idOf(colorId))?.hex)
    .filter((hex): hex is string => Boolean(hex));

  return {
    id: idOf(product._id),
    title,
    subtitle: firstSentence(fa(product.description), 70),
    href: `/shop/${product.slug}`,
    image: imageUrl(imageMap, imageId, FALLBACK_PRODUCT_IMAGE),
    imageAlt: imageAlt(imageMap, imageId, title),
    imagePosition: imagePosition(
      imageMap,
      imageId,
      product.primaryImageObjectPosition,
    ),
    priceLabel: formatMoney(product.basePriceMinor, product.currency),
    colors,
  };
}

function buildSubcategoryPageData(
  catalog: StorefrontCatalogPayload,
  categorySlug: string,
  subcategorySlug: string,
  products: CatalogProductRecord[],
  colors: CatalogColorRecord[] = [],
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
  const name = fa(subcategory.name, subcategory.slug);
  const categoryName = fa(category.name, category.slug);
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
      eyebrow: fa(primaryBanner.eyebrow, categoryName),
      title: fa(primaryBanner.heading, name),
      description: fa(
        primaryBanner.body,
        fa(subcategory.description, "محصولات منتخب این زیردسته را مرور کنید."),
      ),
      image: imageUrl(imageMap, primaryImageId),
      imageAlt: imageAlt(imageMap, primaryImageId, name),
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
        label: fa(primaryBanner.ctaLabel, "مشاهده محصولات"),
        href: primaryBanner.ctaHref || `/shop?subcategory=${subcategory.slug}`,
      },
    },
    intro: {
      eyebrow: categoryName,
      title: fa(primaryDescription.heading),
      description: fa(
        primaryDescription.body,
        fa(subcategory.description, "جزئیات این زیردسته به‌زودی تکمیل می‌شود."),
      ),
    },
    products: products.map((product) => productCard(product, imageMap, colorMap)),
    feature: {
      eyebrow: fa(secondaryBanner.eyebrow, "جزئیات کالکشن"),
      title: fa(secondaryBanner.heading, name),
      description: fa(
        secondaryBanner.body,
        fa(secondaryDescription.body, "جزئیات انتخاب ویژه این زیردسته به‌زودی تکمیل می‌شود."),
      ),
      image: imageUrl(imageMap, secondaryImageId),
      imageAlt: imageAlt(imageMap, secondaryImageId, name),
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
      eyebrow: fa(secondaryDescription.heading, "خرید انتخاب‌شده"),
      title: fa(secondaryBanner.ctaLabel, `خرید ${name}`),
      description: fa(
        secondaryDescription.body,
        fa(secondaryBanner.body, "همه محصولات این زیردسته را در فروشگاه ببینید."),
      ),
      image: imageUrl(imageMap, secondaryImageId),
      imageAlt: imageAlt(imageMap, secondaryImageId, name),
      imagePosition: imagePosition(
        imageMap,
        secondaryImageId,
        secondaryBanner.objectPosition,
      ),
      action: {
        label: fa(secondaryBanner.ctaLabel, "مشاهده فروشگاه"),
        href: secondaryBanner.ctaHref || `/shop?subcategory=${subcategory.slug}`,
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

export function useCategoryPageData(categorySlug: string) {
  const catalogQuery = useStorefrontCatalog();

  const data = useMemo(
    () =>
      catalogQuery.data
        ? buildCategoryPageData(catalogQuery.data, categorySlug)
        : null,
    [catalogQuery.data, categorySlug],
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
) {
  const catalogQuery = useStorefrontCatalog();

  const base = useMemo(
    () => findSubcategoryBase(catalogQuery.data, categorySlug, subcategorySlug),
    [catalogQuery.data, categorySlug, subcategorySlug],
  );

  const productsQuery = useQuery({
    queryKey: ["storefront", "products", base?.subcategory._id ?? null],
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
    );
  }, [
    base,
    catalogQuery.data,
    categorySlug,
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

export function useStorefrontMenuSections() {
  const catalogQuery = useStorefrontCatalog();

  return useMemo<StorefrontMenuSection[]>(() => {
    if (!catalogQuery.data) {
      return [
        {
          id: "catalog-loading",
          title: "دسته‌بندی‌ها",
          subtitle: "در حال دریافت دسته‌بندی‌های فروشگاه.",
          href: "/shop",
          groups: [
            {
              title: "فروشگاه",
              items: [{ label: "همه محصولات", href: "/shop" }],
            },
          ],
          image: FALLBACK_IMAGE,
          imageLabel: "کاتالوگ نجیب‌زاده",
        },
      ];
    }

    const imageMap = imageMapFrom(catalogQuery.data.images);

    if (catalogQuery.data.categories.length === 0) {
      return [
        {
          id: "catalog-empty",
          title: "دسته‌بندی‌ها",
          subtitle: "هنوز دسته‌بندی فعالی برای نمایش عمومی ثبت نشده است.",
          href: "/shop",
          groups: [
            {
              title: "فروشگاه",
              items: [{ label: "همه محصولات", href: "/shop" }],
            },
          ],
          image: FALLBACK_IMAGE,
          imageLabel: "کاتالوگ نجیب‌زاده",
        },
      ];
    }

    return catalogQuery.data.categories.map((category) => {
      const name = fa(category.name, category.slug);
      const subs = catalogQuery.data.subcategories.filter(
        (subcategory) => idOf(subcategory.categoryId) === idOf(category._id),
      );
      const subcategoryItems = subs.map((subcategory) => ({
        label: fa(subcategory.name, subcategory.slug),
        href: `/${category.slug}/${subcategory.slug}`,
      }));
      const groups = [
        {
          title: "دسترسی سریع",
          items: [
            { label: `صفحه ${name}`, href: `/${category.slug}` },
            { label: "همه محصولات", href: `/shop?category=${category.slug}` },
          ],
        },
        ...chunk(subcategoryItems, 6).map((items, index) => ({
          title: index === 0 ? "زیردسته‌ها" : "زیردسته‌های بیشتر",
          items,
        })),
      ];
      const primaryBanner = category.pageContent?.primaryBanner;
      const imageId = category.thumbnailImageId ?? primaryBanner?.imageId;

      return {
        id: category.slug,
        title: name,
        subtitle: firstSentence(
          fa(
            category.description,
            fa(
              category.pageContent?.primaryDescription?.body,
              "کالکشن‌های فعال این دسته را مرور کنید.",
            ),
          ),
        ),
        href: `/${category.slug}`,
        groups,
        image: imageUrl(imageMap, imageId),
        imageLabel: name,
      };
    });
  }, [catalogQuery.data]);
}
