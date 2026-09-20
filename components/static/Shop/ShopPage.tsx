"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";

import { brandColors, lightTokens } from "@/theme/theme-colors";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/CustomToast";
import { BrandSketchLoader } from "@/components/ui/SketchLoader";
import { useStorefrontCatalog } from "@/lib/catalog/storefront-client";

import {
  COLOR_OPTIONS,
  MATERIAL_OPTIONS,
  SIZE_OPTIONS,
  type ShopColorOption,
  type ShopProduct as FakeShopProduct,
  type ShopProductImage,
} from "@/data/fake-shop-products";

/* ────────────────────────────────────────────────────────────
   TYPES
   ──────────────────────────────────────────────────────────── */

type SortOption = "new-arrivals" | "price-low" | "price-high" | "featured";
type CollectionOption = "all" | "new-season";
type ProductCategory = string;

type Product = Omit<FakeShopProduct, "category" | "images"> & {
  category: ProductCategory;
  categoryLabel?: string;
  currency?: string;
  images: ShopProductImage[];
  colorSwatches?: ShopColorOption[];
  sizeOptions?: ShopSizeOption[];
};

type CategoryOption = {
  value: ProductCategory;
  label: string;
};

type LocalizedText = {
  fa?: string;
  en?: string;
  ar?: string;
};

type LocalizedTextList = {
  fa?: string[];
  en?: string[];
  ar?: string[];
};

type ShopSizeOption = {
  id: string;
  label: string;
};

type StorefrontProductRecord = {
  _id: string;
  name: LocalizedText;
  slug: string;
  description?: LocalizedText;
  categoryId: string;
  subcategoryId: string;
  basePriceMinor: number;
  currency: string;
  status: "draft" | "active" | "archived";
  material?: LocalizedTextList;
  primaryImageId?: string | null;
  primaryImageObjectPosition?: string;
  imageIds?: string[];
  colorIds?: string[];
  sizeIds?: string[];
  createdAt?: string;
};

type StorefrontProductPayload = {
  items: StorefrontProductRecord[];
  colors?: CatalogColorRecord[];
  sizes?: CatalogSizeRecord[];
};

type CatalogImageAsset = {
  _id: string;
  url: string;
  alt?: LocalizedText;
  objectPosition?: string;
};

type CatalogCategoryRecord = {
  _id: string;
  name: LocalizedText;
  slug: string;
};

type CatalogSubcategoryRecord = {
  _id: string;
  name: LocalizedText;
  slug: string;
  categoryId: string;
};

type CatalogColorRecord = CatalogCategoryRecord & {
  hex?: string;
  swatchImageUrl?: string;
};

type CatalogSizeRecord = {
  _id: string;
  name: LocalizedText;
  code: string;
  sortOrder?: number;
};

type ShopBanner = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imagePosition?: string;
  ctaText: string;
  ctaHref: string;
  theme: "dark" | "light";
  badge?: string;
};

type InterleavedItem =
  | { type: "product"; product: Product; index: number }
  | { type: "banner"; banner: ShopBanner };

type ProductChunk =
  | { kind: "products"; items: { product: Product; index: number }[] }
  | { kind: "banner"; banner: ShopBanner };

type CartActionState = "idle" | "adding" | "added";
type ProductPanelSide = "left" | "right";

/* ────────────────────────────────────────────────────────────
   CONSTANTS
   ──────────────────────────────────────────────────────────── */

const SHOP_BANNERS: ShopBanner[] = [
  {
    id: "banner-aw-collection",
    title: "The Autumn/Winter\nCollection",
    subtitle: "Now Available",
    description:
      "Meticulously crafted pieces that define the season. Explore tailored silhouettes in the finest fabrics.",
    image: "/assets/images/banner.webp",
    imagePosition: "center 30%",
    ctaText: "Explore the Collection",
    ctaHref: "/shop?collection=new-season",
    theme: "dark",
    badge: "New Season",
  },
];

const ALL_CATEGORY_OPTION: CategoryOption = { value: "all", label: "همه" };

const PRODUCTS_PER_BANNER = 6;

const SHOP_HERO_IMAGE = "/assets/images/p2.webp";
const SHOP_HERO_IMAGE_ALT = "Najibzadeh menswear collection";
const SHOP_HERO_IMAGE_POSITION = "center 34%";

const SORT_MENU_OPTIONS: {
  value: SortOption;
  label: string;
  shortLabel: string;
}[] = [
  { value: "new-arrivals", label: "جدیدترین", shortLabel: "جدیدترین" },
  { value: "featured", label: "ویژه", shortLabel: "ویژه" },
  { value: "price-low", label: "قیمت: کم به زیاد", shortLabel: "ارزان‌تر" },
  {
    value: "price-high",
    label: "قیمت: زیاد به کم",
    shortLabel: "گران‌تر",
  },
];

/* ────────────────────────────────────────────────────────────
   HELPERS
   ──────────────────────────────────────────────────────────── */

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("fa-IR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function fa(value: LocalizedText | null | undefined, fallback = "") {
  return (
    value?.fa?.trim() || value?.en?.trim() || value?.ar?.trim() || fallback
  );
}

function idOf(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toString" in value) {
    return String(value);
  }
  return "";
}

function listParam(value: string | null) {
  return value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function cleanList(values: string[]) {
  return [...new Set(values.map((item) => item.trim()).filter(Boolean))];
}

function validSort(value: string | null): SortOption {
  return SORT_MENU_OPTIONS.some((option) => option.value === value)
    ? (value as SortOption)
    : "new-arrivals";
}

function validCollection(value: string | null): CollectionOption {
  return value === "new-season" ? "new-season" : "all";
}

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
    throw new Error(body?.error ?? "دریافت محصولات ناموفق بود.");
  }

  return (await response.json()) as T;
}

function makeImageMap(images: CatalogImageAsset[] = []) {
  return new Map(images.map((image) => [idOf(image._id), image]));
}

function makeColorMap(colors: CatalogColorRecord[] = []) {
  return new Map(colors.map((color) => [idOf(color._id), color]));
}

function makeSizeMap(sizes: CatalogSizeRecord[] = []) {
  return new Map(sizes.map((size) => [idOf(size._id), size]));
}

function makeProductImages(
  product: StorefrontProductRecord,
  imageMap: Map<string, CatalogImageAsset>,
): ShopProductImage[] {
  const ids = cleanList([
    product.primaryImageId ?? "",
    ...(product.imageIds ?? []),
  ]);

  return ids.reduce<ShopProductImage[]>((items, imageId, index) => {
    const image = imageMap.get(imageId);
    if (!image?.url) return items;

    items.push({
      id: `${product._id}-${index + 1}`,
      src: image.url,
      alt: fa(image.alt, fa(product.name, product.slug)),
      position:
        index === 0
          ? (product.primaryImageObjectPosition ?? image.objectPosition)
          : image.objectPosition,
    });

    return items;
  }, []);
}

function firstLine(value: string, max = 80) {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max).trim()}...`;
}

function mapStorefrontProduct({
  product,
  imageMap,
  subcategoryMap,
  colorMap,
  sizeMap,
}: {
  product: StorefrontProductRecord;
  imageMap: Map<string, CatalogImageAsset>;
  subcategoryMap: Map<string, CatalogSubcategoryRecord>;
  colorMap: Map<string, CatalogColorRecord>;
  sizeMap: Map<string, CatalogSizeRecord>;
}): Product {
  const title = fa(product.name, product.slug);
  const subcategory = subcategoryMap.get(idOf(product.subcategoryId));
  const subcategoryLabel = fa(subcategory?.name, subcategory?.slug ?? "محصول");
  const images = makeProductImages(product, imageMap);
  const fallbackImage = images[0] ?? {
    id: `${product._id}-fallback`,
    src: "/assets/images/banner.webp",
    alt: title,
    position: "center",
  };
  const materials =
    product.material?.fa?.map((item) => item.toLowerCase()) ?? [];
  const colorIds = cleanList(product.colorIds ?? []);
  const sizeIds = cleanList(product.sizeIds ?? []);
  const colorSwatches = colorIds.map((colorId) => {
    const color = colorMap.get(colorId);
    return {
      id: colorId,
      label: fa(color?.name, color?.slug ?? colorId),
      value: color?.hex || "#111111",
    };
  });
  const sizeOptions = sizeIds.map((sizeId) => {
    const size = sizeMap.get(sizeId);
    return {
      id: sizeId,
      label: fa(size?.name, size?.code ?? sizeId),
    };
  });

  return {
    id: idOf(product._id),
    slug: product.slug,
    sku: idOf(product._id).slice(-8).toUpperCase(),
    title,
    subtitle: subcategoryLabel,
    description: fa(product.description, title),
    price: Math.round(product.basePriceMinor / 100),
    currency: product.currency,
    href: `/shop/${product.slug}`,
    image: fallbackImage.src,
    imageAlt: fallbackImage.alt ?? title,
    imagePosition: fallbackImage.position ?? "center",
    category: subcategory?.slug ?? idOf(product.subcategoryId),
    categoryLabel: subcategoryLabel,
    isNew: Boolean(product.createdAt),
    colors: colorIds,
    colorSwatches,
    sizes: sizeIds,
    sizeOptions,
    materials,
    origin: firstLine(fa(product.description), 42),
    images: images.length ? images : [fallbackImage],
  };
}

function getColorMeta(
  colorId: string,
  colorMap?: Map<string, ShopColorOption>,
) {
  return (
    colorMap?.get(colorId) ??
    COLOR_OPTIONS.find((c) => c.id === colorId) ?? {
      id: colorId,
      label: colorId,
      value: "#111111",
    }
  );
}

function activeFilterCount(
  category: ProductCategory,
  selectedSizes: string[],
  selectedColors: string[],
  selectedMaterials: string[],
  maxPrice: number,
  collection: CollectionOption,
  defaultMaxPrice: number,
) {
  let count = 0;
  if (category !== "all") count += 1;
  count += selectedSizes.length;
  count += selectedColors.length;
  count += selectedMaterials.length;
  if (maxPrice < defaultMaxPrice) count += 1;
  if (collection !== "all") count += 1;
  return count;
}

function buildContentChunks(content: InterleavedItem[]): ProductChunk[] {
  const chunks: ProductChunk[] = [];
  let cur: { product: Product; index: number }[] = [];
  content.forEach((item) => {
    if (item.type === "product") {
      cur.push({ product: item.product, index: item.index });
      return;
    }
    if (cur.length > 0) {
      chunks.push({ kind: "products", items: [...cur] });
      cur = [];
    }
    chunks.push({ kind: "banner", banner: item.banner });
  });
  if (cur.length > 0) chunks.push({ kind: "products", items: cur });
  return chunks;
}

function stopLenis() {
  // @ts-expect-error Lenis may be attached globally.
  const l = window.__lenis ?? window.lenis;
  if (l && typeof l.stop === "function") l.stop();
}

function startLenis() {
  // @ts-expect-error Lenis may be attached globally.
  const l = window.__lenis ?? window.lenis;
  if (l && typeof l.start === "function") l.start();
}

/* ────────────────────────────────────────────────────────────
   SHOP PAGE
   ──────────────────────────────────────────────────────────── */

export function ShopPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const catalogQuery = useStorefrontCatalog();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [desktopFilterOpen, setDesktopFilterOpen] = useState(false);
  const [desktopFilterPinned, setDesktopFilterPinned] = useState(false);

  const selectedSubcategorySlug = searchParams.get("subcategory") ?? "";
  const selectedCategorySlug = searchParams.get("category") ?? "";
  const searchQuery = (searchParams.get("search") ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  const category: ProductCategory = selectedSubcategorySlug || "all";
  const sort = validSort(searchParams.get("sort"));
  const selectedSizes = useMemo(
    () => listParam(searchParams.get("size")),
    [searchParams],
  );
  const selectedColors = useMemo(
    () => listParam(searchParams.get("color")),
    [searchParams],
  );
  const selectedMaterials = useMemo(
    () => listParam(searchParams.get("material")),
    [searchParams],
  );
  const collection = validCollection(searchParams.get("collection"));

  const catalogCategories = useMemo(
    () => (catalogQuery.data?.categories ?? []) as CatalogCategoryRecord[],
    [catalogQuery.data?.categories],
  );
  const catalogSubcategories = useMemo(
    () =>
      (catalogQuery.data?.subcategories ?? []) as CatalogSubcategoryRecord[],
    [catalogQuery.data?.subcategories],
  );
  const catalogImages = useMemo(
    () => (catalogQuery.data?.images ?? []) as CatalogImageAsset[],
    [catalogQuery.data?.images],
  );

  const selectedCategoryRecord = useMemo(
    () =>
      catalogCategories.find((item) => item.slug === selectedCategorySlug) ??
      null,
    [catalogCategories, selectedCategorySlug],
  );

  const selectedSubcategoryRecord = useMemo(
    () =>
      catalogSubcategories.find(
        (item) => item.slug === selectedSubcategorySlug,
      ) ?? null,
    [catalogSubcategories, selectedSubcategorySlug],
  );

  const categoryOptions = useMemo<CategoryOption[]>(
    () => [
      ALL_CATEGORY_OPTION,
      ...catalogSubcategories.map((item) => ({
        value: item.slug,
        label: fa(item.name, item.slug),
      })),
    ],
    [catalogSubcategories],
  );

  const updateUrlFilters = useCallback(
    (
      updates: Record<string, string | string[] | number | null | undefined>,
    ) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (
          value === null ||
          value === undefined ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        ) {
          params.delete(key);
          continue;
        }

        params.set(
          key,
          Array.isArray(value) ? cleanList(value).join(",") : String(value),
        );
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const setCategory = useCallback(
    (value: ProductCategory) => {
      updateUrlFilters({
        subcategory: value === "all" ? null : value,
        category: null,
      });
    },
    [updateUrlFilters],
  );

  const setSort = useCallback(
    (value: SortOption) => {
      updateUrlFilters({ sort: value === "new-arrivals" ? null : value });
    },
    [updateUrlFilters],
  );

  const setSelectedSizes = useCallback(
    (values: string[]) => updateUrlFilters({ size: values }),
    [updateUrlFilters],
  );

  const setSelectedColors = useCallback(
    (values: string[]) => updateUrlFilters({ color: values }),
    [updateUrlFilters],
  );

  const setSelectedMaterials = useCallback(
    (values: string[]) => updateUrlFilters({ material: values }),
    [updateUrlFilters],
  );

  const setCollection = useCallback(
    (value: CollectionOption) => {
      updateUrlFilters({ collection: value === "all" ? null : value });
    },
    [updateUrlFilters],
  );

  const selectedCategoryId = idOf(selectedCategoryRecord?._id);
  const selectedSubcategoryId = idOf(selectedSubcategoryRecord?._id);

  const productsQueryUrl = useMemo(() => {
    const params = new URLSearchParams({ limit: "100" });

    if (selectedSubcategoryId) {
      params.set("subcategoryId", selectedSubcategoryId);
    } else if (selectedCategoryId) {
      params.set("categoryId", selectedCategoryId);
    }

    return `/api/storefront/products?${params.toString()}`;
  }, [selectedCategoryId, selectedSubcategoryId]);

  const invalidUrlTaxonomy =
    (selectedSubcategorySlug &&
      catalogQuery.isSuccess &&
      !selectedSubcategoryRecord) ||
    (selectedCategorySlug && catalogQuery.isSuccess && !selectedCategoryRecord);

  const productsQuery = useQuery({
    queryKey: ["storefront", "shop-products", productsQueryUrl],
    queryFn: ({ signal }) =>
      fetchJson<StorefrontProductPayload>(productsQueryUrl, { signal }),
    enabled: catalogQuery.isSuccess && !invalidUrlTaxonomy,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  });

  const themeVars = {
    "--shop-bg": lightTokens.canvas,
    "--shop-surface": lightTokens.surface,
    "--shop-surface-muted": lightTokens.surfaceMuted,
    "--shop-cream": lightTokens.surfaceBrand,
    "--shop-black": brandColors.black.hex,
    "--shop-text": lightTokens.text,
    "--shop-muted": lightTokens.textMuted,
    "--shop-soft": lightTokens.textSoft,
    "--shop-border": lightTokens.border,
    "--shop-copper": brandColors.copper.hex,
    "--shop-copper-strong": lightTokens.accentStrong,
    "--shop-copper-soft": `rgb(${brandColors.copper.rgb} / 0.08)`,
    "--shop-copper-soft-strong": `rgb(${brandColors.copper.rgb} / 0.14)`,
    "--shop-scrollbar-thumb": `rgb(${brandColors.copper.rgb} / 0.58)`,
    "--shop-scrollbar-thumb-hover": `rgb(${brandColors.copper.rgb} / 0.82)`,
    "--shop-scrollbar-track": "rgb(35 31 32 / 0.06)",
  } as CSSProperties;

  useEffect(() => {
    if (!mobileFiltersOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    stopLenis();
    return () => {
      document.body.style.overflow = prev;
      startLenis();
    };
  }, [mobileFiltersOpen]);

  const mappedProducts = useMemo(() => {
    if (invalidUrlTaxonomy) return [];

    const imageMap = makeImageMap(catalogImages);
    const colorMap = makeColorMap(productsQuery.data?.colors ?? []);
    const sizeMap = makeSizeMap(productsQuery.data?.sizes ?? []);
    const subcategoryMap = new Map(
      catalogSubcategories.map((item) => [idOf(item._id), item]),
    );

    return (productsQuery.data?.items ?? []).map((product) =>
      mapStorefrontProduct({
        product,
        imageMap,
        subcategoryMap,
        colorMap,
        sizeMap,
      }),
    );
  }, [
    catalogImages,
    catalogSubcategories,
    invalidUrlTaxonomy,
    productsQuery.data?.colors,
    productsQuery.data?.items,
    productsQuery.data?.sizes,
  ]);

  const colorFilterOptions = useMemo<ShopColorOption[]>(() => {
    const dynamic =
      productsQuery.data?.colors?.map((color) => ({
        id: idOf(color._id),
        label: fa(color.name, color.slug),
        value: color.hex || "#111111",
      })) ?? [];

    return dynamic.length ? dynamic : COLOR_OPTIONS;
  }, [productsQuery.data?.colors]);

  const sizeFilterOptions = useMemo<ShopSizeOption[]>(() => {
    const dynamic =
      productsQuery.data?.sizes?.map((size) => ({
        id: idOf(size._id),
        label: fa(size.name, size.code),
      })) ?? [];

    return dynamic.length
      ? dynamic
      : SIZE_OPTIONS.map((size) => ({ id: size, label: size }));
  }, [productsQuery.data?.sizes]);

  const defaultMaxPrice = useMemo(
    () =>
      Math.max(
        5000,
        ...mappedProducts.map(
          (product) => Math.ceil(product.price / 100) * 100,
        ),
      ),
    [mappedProducts],
  );

  const maxPrice = Math.max(
    0,
    Number(searchParams.get("max") ?? defaultMaxPrice) || defaultMaxPrice,
  );

  const setMaxPrice = useCallback(
    (value: number) => {
      updateUrlFilters({
        max: value >= defaultMaxPrice ? null : value,
      });
    },
    [defaultMaxPrice, updateUrlFilters],
  );

  const products = useMemo(() => {
    let r = [...mappedProducts];
    if (searchQuery) {
      r = r.filter((product) => {
        const haystack = [
          product.title,
          product.subtitle,
          product.description,
          product.categoryLabel,
          product.origin,
          ...(product.materials ?? []),
          ...(product.colorSwatches?.map((color) => color.label) ?? []),
          ...(product.sizeOptions?.map((size) => size.label) ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(searchQuery);
      });
    }
    if (selectedSizes.length)
      r = r.filter((p) => p.sizes?.some((s) => selectedSizes.includes(s)));
    if (selectedColors.length)
      r = r.filter((p) => p.colors?.some((c) => selectedColors.includes(c)));
    if (selectedMaterials.length)
      r = r.filter((p) =>
        p.materials?.some((m) => selectedMaterials.includes(m.toLowerCase())),
      );
    r = r.filter((p) => p.price <= maxPrice);
    if (collection === "new-season") r = r.filter((p) => p.isNew);
    if (sort === "price-low") r.sort((a, b) => a.price - b.price);
    if (sort === "price-high") r.sort((a, b) => b.price - a.price);
    if (sort === "new-arrivals")
      r.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    return r;
  }, [
    mappedProducts,
    searchQuery,
    sort,
    selectedSizes,
    selectedColors,
    selectedMaterials,
    maxPrice,
    collection,
  ]);

  const interleavedContent = useMemo(() => {
    const items: InterleavedItem[] = [];

    products.forEach((product, index) => {
      items.push({ type: "product", product, index });

      const productNumber = index + 1;
      if (productNumber % PRODUCTS_PER_BANNER !== 0) return;

      const baseBanner =
        SHOP_BANNERS[
          (productNumber / PRODUCTS_PER_BANNER - 1) % SHOP_BANNERS.length
        ];

      if (!baseBanner) return;

      items.push({
        type: "banner",
        banner: {
          ...baseBanner,
          id: `${baseBanner.id}-${productNumber}`,
        },
      });
    });

    return items;
  }, [products]);

  const resetFilters = useCallback(() => {
    updateUrlFilters({
      category: null,
      subcategory: null,
      sort: null,
      size: null,
      color: null,
      material: null,
      max: null,
      collection: null,
    });
  }, [updateUrlFilters]);

  const filterCount = activeFilterCount(
    category,
    selectedSizes,
    selectedColors,
    selectedMaterials,
    maxPrice,
    collection,
    defaultMaxPrice,
  );

  const desktopFilterExpanded = desktopFilterOpen || desktopFilterPinned;
  const isLoadingProducts = catalogQuery.isLoading || productsQuery.isLoading;
  const hasProductsError = catalogQuery.isError || productsQuery.isError;

  return (
    <main
      style={themeVars}
      dir="rtl"
      className="min-h-screen bg-[var(--shop-bg)] text-[var(--shop-text)]"
    >
      <BrandSketchLoader
        open={isLoadingProducts}
        label="در حال دریافت محصولات"
      />

      {/* The shop hero starts at page top so the existing transparent navbar can sit over it. */}
      <ShopHero
        image={SHOP_HERO_IMAGE}
        alt={SHOP_HERO_IMAGE_ALT}
        position={SHOP_HERO_IMAGE_POSITION}
      />

      {/* Desktop */}
      <section className="relative mx-auto hidden max-w-[1920px] lg:block">
        <div className="w-full">
          <div className="px-8 pb-16 pt-0 xl:px-10">
            {/* Desktop filter rail: every filter is exposed individually, like the reference. */}
            <div className="sticky top-[76px] z-[90] -mx-8 mb-0 border-b border-[var(--shop-border)] bg-[var(--shop-bg)] px-8 py-3 xl:-mx-10 xl:px-10">
              <div className="relative flex min-h-[52px] items-center justify-between gap-3">
                <div className="relative z-10 flex min-w-0 flex-1 items-center gap-1.5">
                  <DesktopFilterIsland
                    expanded={desktopFilterExpanded}
                    pinned={desktopFilterPinned}
                    onHoverOpen={() => setDesktopFilterOpen(true)}
                    onHoverClose={() => setDesktopFilterOpen(false)}
                    onTogglePin={() => setDesktopFilterPinned((v) => !v)}
                    category={category}
                    setCategory={setCategory}
                    categoryOptions={categoryOptions}
                    selectedSizes={selectedSizes}
                    setSelectedSizes={setSelectedSizes}
                    sizeOptions={sizeFilterOptions}
                    selectedColors={selectedColors}
                    setSelectedColors={setSelectedColors}
                    colorOptions={colorFilterOptions}
                    selectedMaterials={selectedMaterials}
                    setSelectedMaterials={setSelectedMaterials}
                    maxPrice={maxPrice}
                    setMaxPrice={setMaxPrice}
                    defaultMaxPrice={defaultMaxPrice}
                    filterCount={filterCount}
                    resetFilters={resetFilters}
                  />

                  <DesktopToolbarPopover
                    label="دسته‌بندی"
                    active={category !== "all"}
                    widthClass="w-[220px]"
                  >
                    <div className="p-1.5">
                      {categoryOptions.map((item) => {
                        const active = category === item.value;
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setCategory(item.value)}
                            className={`flex min-h-9 w-full items-center justify-between px-3 text-right text-[7px] font-semibold uppercase tracking-[0.08em] transition-colors ${
                              active
                                ? "bg-[var(--shop-copper-soft)] text-[var(--shop-text)] ring-1 ring-inset ring-[var(--shop-copper)]"
                                : "text-[var(--shop-muted)] hover:bg-[var(--shop-surface-muted)] hover:text-[var(--shop-text)]"
                            }`}
                          >
                            {item.label}
                            {active ? <CheckIcon className="size-2.5" /> : null}
                          </button>
                        );
                      })}
                    </div>
                  </DesktopToolbarPopover>

                  <DesktopToolbarPopover
                    label="سایز"
                    active={selectedSizes.length > 0}
                    widthClass="w-[250px]"
                  >
                    <div className="p-4">
                      <SizeSelector
                        options={sizeFilterOptions}
                        values={selectedSizes}
                        onChange={setSelectedSizes}
                      />
                    </div>
                  </DesktopToolbarPopover>

                  <DesktopToolbarPopover
                    label="رنگ"
                    active={selectedColors.length > 0}
                    widthClass="w-[290px]"
                  >
                    <div className="p-4">
                      <ColorSelector
                        options={colorFilterOptions}
                        values={selectedColors}
                        onChange={setSelectedColors}
                      />
                    </div>
                  </DesktopToolbarPopover>

                  <DesktopToolbarPopover
                    label="قیمت"
                    active={maxPrice < defaultMaxPrice}
                    widthClass="w-[270px]"
                  >
                    <div className="p-4">
                      <PriceSelector
                        value={maxPrice}
                        max={defaultMaxPrice}
                        onChange={setMaxPrice}
                      />
                    </div>
                  </DesktopToolbarPopover>

                  <DesktopToolbarPopover
                    label="جنس"
                    active={selectedMaterials.length > 0}
                    widthClass="w-[230px]"
                  >
                    <div className="p-4">
                      <MaterialSelector
                        values={selectedMaterials}
                        onChange={setSelectedMaterials}
                      />
                    </div>
                  </DesktopToolbarPopover>

                  <DesktopToolbarPopover
                    label="کالکشن"
                    active={collection !== "all"}
                    widthClass="w-[210px]"
                  >
                    <div className="p-1.5">
                      {[
                        { value: "all" as const, label: "همه کالکشن‌ها" },
                        { value: "new-season" as const, label: "فصل جدید" },
                      ].map((item) => {
                        const active = collection === item.value;
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setCollection(item.value)}
                            className={`flex min-h-9 w-full items-center justify-between px-3 text-right text-[7px] font-semibold uppercase tracking-[0.08em] transition-colors ${
                              active
                                ? "bg-[var(--shop-copper-soft)] text-[var(--shop-text)] ring-1 ring-inset ring-[var(--shop-copper)]"
                                : "text-[var(--shop-muted)] hover:bg-[var(--shop-surface-muted)] hover:text-[var(--shop-text)]"
                            }`}
                          >
                            {item.label}
                            {active ? <CheckIcon className="size-2.5" /> : null}
                          </button>
                        );
                      })}
                    </div>
                  </DesktopToolbarPopover>
                </div>

                <div className="relative z-10 flex shrink-0 items-center gap-2">
                  <span className="hidden text-[5.5px] font-semibold uppercase tracking-[0.12em] text-black/38 xl:block">
                    مرتب‌سازی
                  </span>
                  <DesktopSortControl value={sort} onChange={setSort} />
                </div>
              </div>
            </div>

            <div className="flex min-h-[54px] items-center justify-between border-b border-[var(--shop-border)] px-1">
              <span className="text-[6.5px] font-semibold uppercase tracking-[0.18em] text-black/62">
                {new Intl.NumberFormat("fa-IR").format(products.length)} محصول
              </span>
              <div className="flex items-center gap-4">
                <span className="text-[5.5px] font-semibold uppercase tracking-[0.2em] text-black/28">
                  انتخاب‌های دقیق نجیب‌زاده
                </span>
                <span className="h-px w-16 bg-black/14" />
              </div>
            </div>

            <div className="pt-4">
              {isLoadingProducts ? (
                <ShopProductsState title="در حال دریافت محصولات" />
              ) : hasProductsError ? (
                <ShopProductsState
                  title="دریافت محصولات ناموفق بود"
                  description="اتصال دیتابیس یا سرویس فروشگاه را بررسی کنید."
                />
              ) : products.length ? (
                <DesktopInterleavedGrid content={interleavedContent} />
              ) : (
                <EmptyProducts resetFilters={resetFilters} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile sticky toolbar */}
      <div className="sticky top-[72px] z-[90] border-b border-[var(--shop-border)] bg-[var(--shop-bg)] px-3 py-2 lg:hidden">
        <div className="relative z-10 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="group/mobile-filter relative flex h-11 min-w-0 items-center justify-center gap-2 overflow-hidden border border-white/70 bg-white/32 px-3 text-black shadow-[0_8px_22px_-16px_rgba(11,11,11,0.32),inset_0_1px_0_rgba(255,255,255,0.80)] ring-1 ring-inset ring-black/[0.025] backdrop-blur-[18px] transition-[background-color,border-color,transform,box-shadow] duration-200 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
          >
            <span className="grid size-6 shrink-0 place-items-center bg-black/[0.055] text-black/70">
              <FilterIcon />
            </span>
            <span className="text-[7px] font-semibold uppercase tracking-[0.14em]">
              فیلترها
            </span>
            {filterCount > 0 && (
              <span className="grid size-[18px] shrink-0 place-items-center bg-[var(--shop-copper)] text-[7px] font-bold tabular-nums text-white">
                {new Intl.NumberFormat("fa-IR").format(filterCount)}
              </span>
            )}
            <span className="absolute inset-x-3 bottom-0 h-px origin-left scale-x-0 bg-[var(--shop-copper)] transition-transform duration-300 group-active/mobile-filter:scale-x-100" />
          </button>
          <GlassSortControl
            value={sort}
            onChange={setSort}
            compact
            align="right"
          />
        </div>
      </div>

      <div className="flex min-h-[42px] items-center justify-between border-b border-[var(--shop-border)] px-4 lg:hidden">
        <span className="text-[6px] font-semibold uppercase tracking-[0.18em] text-black/62">
          {new Intl.NumberFormat("fa-IR").format(products.length)} محصول
        </span>
        <span className="text-[5.5px] font-semibold uppercase tracking-[0.16em] text-black/28">
          انتخاب نجیب‌زاده
        </span>
      </div>

      {/* Mobile grid — ProductCard itself is intentionally untouched. */}
      <div className="pb-6 lg:hidden">
        {isLoadingProducts ? (
          <ShopProductsState title="در حال دریافت محصولات" />
        ) : hasProductsError ? (
          <ShopProductsState
            title="دریافت محصولات ناموفق بود"
            description="اتصال دیتابیس یا سرویس فروشگاه را بررسی کنید."
          />
        ) : products.length ? (
          <MobileInterleavedGrid content={interleavedContent} />
        ) : (
          <EmptyProducts resetFilters={resetFilters} />
        )}
      </div>

      {/* Mobile filter drawer */}
      <MobileFilters
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        category={category}
        setCategory={setCategory}
        categoryOptions={categoryOptions}
        sort={sort}
        setSort={setSort}
        selectedSizes={selectedSizes}
        setSelectedSizes={setSelectedSizes}
        sizeOptions={sizeFilterOptions}
        selectedColors={selectedColors}
        setSelectedColors={setSelectedColors}
        colorOptions={colorFilterOptions}
        selectedMaterials={selectedMaterials}
        setSelectedMaterials={setSelectedMaterials}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        defaultMaxPrice={defaultMaxPrice}
        resetFilters={resetFilters}
        resultCount={products.length}
      />
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHOP HERO — transparent navbar sits over this image
   ═══════════════════════════════════════════════════════════ */

function ShopHero({
  image,
  alt,
  position,
}: {
  image: string;
  alt: string;
  position: string;
}) {
  return (
    <section className="relative isolate h-[340px] w-full overflow-hidden bg-black text-white sm:h-[370px] lg:h-[410px]">
      <Image
        src={image}
        alt={alt}
        fill
        priority
        sizes="100vw"
        draggable={false}
        style={{ objectPosition: position }}
        className="-z-30 object-top object-cover"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(270deg,rgba(11,11,11,0.78)_0%,rgba(11,11,11,0.48)_34%,rgba(11,11,11,0.10)_68%,rgba(11,11,11,0.22)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(11,11,11,0.30)_0%,transparent_48%,rgba(11,11,11,0.18)_100%)]"
      />

      <div className="mx-auto flex h-full max-w-[1920px] items-end justify-between px-5 pb-7 pt-[94px] sm:px-7 sm:pb-8 lg:px-10 lg:pb-10 lg:pt-[108px] xl:px-12">
        <div className="text-right">
          <h1 className="  text-[44px] font-normal leading-[0.9] tracking-[-0.045em] sm:text-[52px] lg:text-[62px]">
             فروشگاه 
          </h1>
          <p className="mt-2   text-[15px] italic leading-[1.2] text-white/80 sm:text-[17px] lg:text-[19px]">
             پرفروش‌ترین محصولات برند نجیب‌زاده
          </p>
        </div>

        <div className="mb-1 hidden border-r border-white/20 pr-5 text-right lg:block">
          <span className="block text-[5px] font-semibold uppercase tracking-[0.24em] text-white/46">
             کیفیت
          </span>
          <span className="mt-1 block text-[5px] font-semibold uppercase tracking-[0.24em] text-white/46">
            دست دوز
          </span>
          <span className="mt-1 block text-[5px] font-semibold uppercase tracking-[0.24em] text-white/46">
            شخصیت
          </span>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   DESKTOP FILTER TOOLBAR POPOVER
   ═══════════════════════════════════════════════════════════ */

function DesktopToolbarPopover({
  label,
  active = false,
  widthClass = "w-[240px]",
  children,
}: {
  label: string;
  active?: boolean;
  widthClass?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (!root || root.contains(event.target as Node)) return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={`group/filter-chip relative flex h-9 items-center gap-2 border px-3 text-[7px] font-semibold uppercase tracking-[0.08em] transition-[background-color,border-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15 ${
          open
            ? "border-[var(--shop-copper)] bg-[var(--shop-surface)] text-[var(--shop-text)] shadow-[0_10px_26px_-20px_rgba(35,31,32,0.32)]"
            : active
              ? "border-[var(--shop-copper)] bg-[var(--shop-copper-soft)] text-[var(--shop-text)]"
              : "border-[var(--shop-border)] bg-[var(--shop-surface)] text-[var(--shop-muted)] hover:border-[var(--shop-copper)] hover:text-[var(--shop-text)]"
        }`}
      >
        <span>{label}</span>
        {active ? (
          <span
            aria-hidden="true"
            className={`size-1.5 ${open ? "bg-[var(--shop-copper)]" : "bg-[var(--shop-copper)]"}`}
          />
        ) : null}
        <ChevronDownIcon
          className={`size-2.5 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      <div
        id={menuId}
        aria-hidden={!open}
        className={`absolute right-0 top-[calc(100%_+_7px)] z-[130] ${widthClass} origin-top-right border border-[var(--shop-border)] bg-[var(--shop-surface)] text-right shadow-[0_18px_42px_-26px_rgba(35,31,32,0.30)] ${
          open ? "pointer-events-auto visible" : "pointer-events-none invisible"
        }`}
      >
        <div className="border-b border-[var(--shop-border)] bg-[var(--shop-surface-muted)] px-4 py-2.5 text-right">
          <p className="text-[5.5px] font-semibold uppercase tracking-[0.18em] text-[var(--shop-muted)]">
            {label}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DESKTOP FILTER ISLAND
   ═══════════════════════════════════════════════════════════ */

function DesktopFilterIsland({
  expanded,
  pinned,
  onHoverOpen,
  onHoverClose,
  onTogglePin,
  category,
  setCategory,
  categoryOptions,
  selectedSizes,
  setSelectedSizes,
  sizeOptions,
  selectedColors,
  setSelectedColors,
  colorOptions,
  selectedMaterials,
  setSelectedMaterials,
  maxPrice,
  setMaxPrice,
  defaultMaxPrice,
  filterCount,
  resetFilters,
}: {
  expanded: boolean;
  pinned: boolean;
  onHoverOpen: () => void;
  onHoverClose: () => void;
  onTogglePin: () => void;
  category: ProductCategory;
  setCategory: (v: ProductCategory) => void;
  categoryOptions: CategoryOption[];
  selectedSizes: string[];
  setSelectedSizes: (v: string[]) => void;
  sizeOptions: ShopSizeOption[];
  selectedColors: string[];
  setSelectedColors: (v: string[]) => void;
  colorOptions: ShopColorOption[];
  selectedMaterials: string[];
  setSelectedMaterials: (v: string[]) => void;
  maxPrice: number;
  setMaxPrice: (v: number) => void;
  defaultMaxPrice: number;
  filterCount: number;
  resetFilters: () => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const hoverOpenTimer = useRef<number | null>(null);
  const hoverCloseTimer = useRef<number | null>(null);
  const popoverId = useId();

  function clearOpen() {
    if (hoverOpenTimer.current !== null) {
      window.clearTimeout(hoverOpenTimer.current);
      hoverOpenTimer.current = null;
    }
  }
  function clearClose() {
    if (hoverCloseTimer.current !== null) {
      window.clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }
  }
  function scheduleOpen() {
    clearClose();
    if (expanded || hoverOpenTimer.current !== null) return;
    hoverOpenTimer.current = window.setTimeout(() => {
      onHoverOpen();
      hoverOpenTimer.current = null;
    }, 115);
  }
  function scheduleClose() {
    if (pinned) return;
    clearOpen();
    clearClose();
    hoverCloseTimer.current = window.setTimeout(() => {
      onHoverClose();
      hoverCloseTimer.current = null;
    }, 230);
  }
  function closeFilter() {
    clearOpen();
    clearClose();
    if (pinned) onTogglePin();
    onHoverClose();
  }
  function togglePinned() {
    clearOpen();
    clearClose();
    if (pinned) {
      onTogglePin();
      onHoverClose();
      return;
    }
    onHoverOpen();
    onTogglePin();
  }

  useEffect(() => {
    if (!pinned) return;
    function closePinnedFilter() {
      clearOpen();
      clearClose();
      onTogglePin();
      onHoverClose();
    }
    function onPD(e: PointerEvent) {
      const r = rootRef.current;
      if (!r || r.contains(e.target as Node)) return;
      closePinnedFilter();
    }
    function onKD(e: KeyboardEvent) {
      if (e.key === "Escape") closePinnedFilter();
    }
    document.addEventListener("pointerdown", onPD);
    window.addEventListener("keydown", onKD);
    return () => {
      document.removeEventListener("pointerdown", onPD);
      window.removeEventListener("keydown", onKD);
    };
  }, [onHoverClose, onTogglePin, pinned]);

  useEffect(
    () => () => {
      clearOpen();
      clearClose();
    },
    [],
  );

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={scheduleOpen}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={popoverId}
        onClick={togglePinned}
        onFocus={scheduleOpen}
        className={`group/filter relative flex h-9 items-center gap-2 overflow-hidden border px-3 text-right transition-[background-color,border-color,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15 ${
          expanded
            ? "border-[var(--shop-copper)] bg-[var(--shop-surface)] text-[var(--shop-text)] shadow-[0_10px_26px_-20px_rgba(35,31,32,0.32)]"
            : "border-[var(--shop-border)] bg-[var(--shop-surface)] text-[var(--shop-muted)] hover:border-[var(--shop-copper)] hover:text-[var(--shop-text)]"
        }`}
      >
        <span
          className={`grid size-5 shrink-0 place-items-center transition-colors ${
            expanded ? "text-[var(--shop-copper)]" : "text-[var(--shop-muted)]"
          }`}
        >
          <FilterIcon />
        </span>
        <span className="text-[7px] font-semibold uppercase tracking-[0.08em]">
          فیلترها
        </span>
        {filterCount > 0 && (
          <span className="grid size-[16px] shrink-0 place-items-center bg-[var(--shop-copper)] text-[6px] font-bold tabular-nums text-white">
            {filterCount}
          </span>
        )}
        <span
          className={`ml-0.5 transition-[color,transform] duration-300 ${
            expanded
              ? "rotate-180 text-[var(--shop-copper)]"
              : "rotate-0 text-[var(--shop-soft)]"
          }`}
        >
          <ChevronDownIcon className="size-3" />
        </span>
        <span
          aria-hidden="true"
          className={`absolute inset-x-3 bottom-0 h-px origin-left bg-[var(--shop-copper)] transition-transform duration-300 ${
            expanded
              ? "scale-x-100"
              : "scale-x-0 group-hover/filter:scale-x-100"
          }`}
        />
      </button>

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute right-5 top-[calc(100%_+_6px)] z-[59] size-3 rotate-45 border-l border-t border-[var(--shop-border)] bg-[var(--shop-surface)] ${
          expanded ? "visible" : "invisible"
        }`}
      />

      <div
        id={popoverId}
        role="region"
        aria-label="فیلترهای محصول"
        aria-hidden={!expanded}
        className={`absolute right-0 top-[calc(100%_+_11px)] z-[60] w-[342px] max-w-[calc(100vw_-_5rem)] origin-top-right text-right ${
          expanded ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-0 overflow-hidden border border-[var(--shop-border)] bg-[var(--shop-surface)] shadow-[0_24px_60px_-34px_rgba(35,31,32,0.34)] ${
            expanded ? "opacity-100" : "opacity-[0.001]"
          }`}
          style={{
            background: "var(--shop-surface)",
          }}
        />
        <div className={expanded ? "visible" : "invisible"}>
          <div className="relative z-10 flex items-start justify-between border-b border-[var(--shop-border)] bg-[var(--shop-surface-muted)] px-5 pb-4 pt-[18px]">
            <div className="flex items-center gap-2.5">
              <span className="grid size-7 place-items-center border border-[var(--shop-copper)] bg-[var(--shop-copper)] text-white shadow-[0_8px_20px_-14px_rgba(11,11,11,0.60)]">
                <FilterIcon />
              </span>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-[var(--shop-text)]">
                  فیلترها
                </p>
                <p className="mt-1 text-[6.5px] font-medium uppercase tracking-[0.10em] text-[var(--shop-muted)]">
                  {filterCount > 0
                    ? `${new Intl.NumberFormat("fa-IR").format(filterCount)} فیلتر فعال`
                    : "انتخاب‌ها را دقیق‌تر کنید"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={resetFilters}
                disabled={filterCount === 0}
                className="min-h-8 px-2 text-[7px] font-semibold uppercase tracking-[0.12em] text-[var(--shop-copper)] transition-opacity hover:opacity-65 disabled:pointer-events-none disabled:opacity-25"
              >
                پاک‌کردن
              </button>
              <button
                type="button"
                aria-label="بستن فیلترها"
                onClick={closeFilter}
                className="grid size-8 place-items-center border border-[var(--shop-border)] bg-[var(--shop-surface)] text-[var(--shop-muted)] transition-[background-color,border-color,color,transform] hover:border-[var(--shop-copper)] hover:bg-[var(--shop-copper-soft)] hover:text-[var(--shop-copper-strong)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--shop-copper-soft-strong)]"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
          <div
            data-lenis-prevent=""
            className="relative z-10 max-h-[min(640px,calc(100svh_-_190px))] overflow-y-auto overscroll-contain px-5 py-2 [scrollbar-color:rgb(11_11_11_/_0.18)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-black/15 [&::-webkit-scrollbar-track]:bg-transparent"
          >
            <IslandAccordion title="دسته‌بندی" defaultOpen>
              <div className="space-y-0.5">
                {categoryOptions.map((item) => {
                  const active = category === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setCategory(item.value)}
                      className={`group/category flex min-h-[32px] w-full items-center justify-between border px-2.5 text-right backdrop-blur-sm transition-[background-color,border-color,color,transform] duration-200 ${
                        active
                          ? "border-[var(--shop-copper)] bg-[var(--shop-copper-soft)] text-[var(--shop-text)]"
                          : "border-transparent bg-transparent text-[var(--shop-muted)] hover:-translate-x-0.5 hover:border-[var(--shop-border)] hover:bg-[var(--shop-surface-muted)] hover:text-[var(--shop-text)]"
                      }`}
                    >
                      <span className="flex items-center gap-2.5 text-[8px] font-semibold uppercase tracking-[0.08em]">
                        <span
                          className={`block size-1 transition-colors ${
                            active
                              ? "bg-[var(--shop-copper)]"
                              : "bg-black/16 group-hover/category:bg-black/35"
                          }`}
                        />
                        {item.label}
                      </span>
                      {active && (
                        <CheckIcon className="size-2.5 text-[var(--shop-copper)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </IslandAccordion>
            <IslandAccordion title="سایز">
              <SizeSelector
                options={sizeOptions}
                values={selectedSizes}
                onChange={setSelectedSizes}
              />
            </IslandAccordion>
            <IslandAccordion title="رنگ" defaultOpen>
              <ColorSelector
                options={colorOptions}
                values={selectedColors}
                onChange={setSelectedColors}
              />
            </IslandAccordion>
            <IslandAccordion title="جنس">
              <MaterialSelector
                values={selectedMaterials}
                onChange={setSelectedMaterials}
              />
            </IslandAccordion>
            <IslandAccordion title="قیمت" defaultOpen>
              <PriceSelector
                value={maxPrice}
                max={defaultMaxPrice}
                onChange={setMaxPrice}
              />
            </IslandAccordion>
          </div>
          <div className="relative z-10 flex items-center justify-between border-t border-[var(--shop-border)] bg-[var(--shop-surface-muted)] px-5 py-3">
            <div className="flex items-center gap-2">
              <span
                className={`size-1.5 ${
                  pinned ? "bg-[var(--shop-copper)]" : "bg-[var(--shop-soft)]"
                }`}
              />
              <span className="text-[6.5px] font-semibold uppercase tracking-[0.11em] text-[var(--shop-muted)]">
                {pinned ? "ثابت شده" : "پیش‌نمایش"}
              </span>
            </div>
            <span className="text-[6.5px] font-medium uppercase tracking-[0.1em] text-[var(--shop-soft)]">
              کلیک برای {pinned ? "آزاد کردن" : "ثابت کردن"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   GLASS SORT CONTROL
   ═══════════════════════════════════════════════════════════ */

function GlassSortControl({
  value,
  onChange,
  compact = false,
  dark = false,
  align = "right",
}: {
  value: SortOption;
  onChange: (v: SortOption) => void;
  compact?: boolean;
  dark?: boolean;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();
  const current =
    SORT_MENU_OPTIONS.find((o) => o.value === value) ?? SORT_MENU_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    function onPD(e: PointerEvent) {
      const r = rootRef.current;
      if (!r || r.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKD(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPD);
    window.addEventListener("keydown", onKD);
    return () => {
      document.removeEventListener("pointerdown", onPD);
      window.removeEventListener("keydown", onKD);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={`relative ${compact ? "min-w-0" : "min-w-[196px]"}`}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className={`group/sort relative flex w-full items-center overflow-hidden border shadow-[0_9px_24px_-18px_rgba(11,11,11,0.34),inset_0_1px_0_rgba(255,255,255,0.74)] ring-1 ring-inset backdrop-blur-[18px] backdrop-saturate-150 transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 ${
          compact ? "h-11 gap-2 px-3" : "h-10 gap-3 px-3.5"
        } ${
          dark
            ? open
              ? "border-white/26 bg-white/16 text-white ring-white/[0.05] focus-visible:ring-white/25"
              : "border-white/16 bg-white/[0.08] text-white ring-white/[0.035] hover:border-white/28 hover:bg-white/[0.13] focus-visible:ring-white/20"
            : open
              ? "border-[var(--shop-copper)] bg-[var(--shop-surface)] text-[var(--shop-text)] ring-[var(--shop-copper-soft)] shadow-[0_12px_28px_-22px_rgba(35,31,32,0.28)] focus-visible:ring-[var(--shop-copper-soft-strong)]"
              : "border-[var(--shop-border)] bg-[var(--shop-surface)] text-[var(--shop-text)] ring-black/[0.025] hover:-translate-y-px hover:border-[var(--shop-copper)] hover:bg-[var(--shop-surface-muted)] focus-visible:ring-[var(--shop-copper-soft-strong)]"
        }`}
      >
        <span
          className={`grid size-6 shrink-0 place-items-center border ${
            dark
              ? "border-white/10 bg-white/[0.08] text-white/72"
              : "border-[var(--shop-border)] bg-[var(--shop-surface-muted)] text-[var(--shop-muted)]"
          }`}
        >
          <SortIcon />
        </span>
        <span className="min-w-0 flex-1 text-right">
          {!compact && (
            <span
              className={`block text-[5.5px] font-semibold uppercase tracking-[0.16em] ${
                dark ? "text-white/42" : "text-[var(--shop-soft)]"
              }`}
            >
              مرتب‌سازی
            </span>
          )}
          <span
            className={`${compact ? "text-[7px]" : "mt-0.5 text-[7.5px]"} block truncate font-semibold uppercase tracking-[0.10em] ${
              dark ? "text-white/84" : "text-[var(--shop-text)]"
            }`}
          >
            {compact ? current.shortLabel : current.label}
          </span>
        </span>
        <ChevronDownIcon
          className={`size-3 shrink-0 transition-transform duration-250 ${
            open ? "rotate-180" : "rotate-0"
          } ${dark ? "text-white/56" : "text-[var(--shop-soft)]"}`}
        />
        <span
          aria-hidden="true"
          className={`absolute inset-x-3 bottom-0 h-px origin-left bg-[var(--shop-copper)] transition-transform duration-300 ${
            open ? "scale-x-100" : "scale-x-0 group-hover/sort:scale-x-100"
          }`}
        />
      </button>

      <div
        id={menuId}
        role="listbox"
        aria-label="مرتب‌سازی محصولات"
        aria-hidden={!open}
        className={`absolute top-[calc(100%_+_8px)] z-[120] w-[228px] ${
          align === "right"
            ? "right-0 origin-top-right"
            : "left-0 origin-top-left"
        } ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-0 overflow-hidden border shadow-[0_26px_62px_-22px_rgba(11,11,11,0.42),inset_0_1px_0_rgba(255,255,255,0.30)] ring-1 ring-inset ${
            dark
              ? "border-white/22 ring-white/[0.06]"
              : "border-white/82 ring-black/[0.055]"
          } ${open ? "opacity-100" : "opacity-[0.001]"}`}
          style={{
            background: dark
              ? "linear-gradient(145deg, rgba(19,19,19,0.76) 0%, rgba(6,6,6,0.72) 100%)"
              : "var(--shop-surface)",
            backdropFilter: "blur(42px) saturate(145%)",
            WebkitBackdropFilter: "blur(42px) saturate(145%)",
            willChange: "opacity, backdrop-filter",
          }}
        />
        <div
          className={`${open ? "visible" : "invisible"} relative z-10 ${
            dark ? "text-white" : "text-black"
          }`}
        >
          <div
            className={`border-b px-4 py-3 ${
              dark ? "border-white/10" : "border-black/[0.06]"
            }`}
          >
            <p
              className={`text-[6px] font-semibold uppercase tracking-[0.16em] ${
                dark ? "text-white/36" : "text-black/34"
              }`}
            >
              Sort collection
            </p>
          </div>
          <div className="p-1.5">
            {SORT_MENU_OPTIONS.map((opt) => {
              const sel = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={sel}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`group/option flex min-h-10 w-full items-center justify-between border px-3 text-right transition-[background-color,border-color,color,transform] duration-180 ${
                    dark
                      ? sel
                        ? "border-white/18 bg-white/14 text-white"
                        : "border-transparent text-white/54 hover:translate-x-0.5 hover:border-white/10 hover:bg-white/[0.07] hover:text-white"
                      : sel
                        ? "border-[var(--shop-copper)] bg-[var(--shop-copper-soft)] text-[var(--shop-text)]"
                        : "border-transparent text-[var(--shop-muted)] hover:-translate-x-0.5 hover:border-[var(--shop-border)] hover:bg-[var(--shop-surface-muted)] hover:text-[var(--shop-text)]"
                  }`}
                >
                  <span className="text-[7px] font-semibold uppercase tracking-[0.09em]">
                    {opt.label}
                  </span>
                  <span
                    className={`grid size-5 place-items-center border transition-colors ${
                      sel
                        ? "border-[var(--shop-copper)] bg-[var(--shop-copper)] text-white"
                        : dark
                          ? "border-white/10 text-transparent group-hover/option:border-white/24"
                          : "border-black/10 text-transparent group-hover/option:border-black/24"
                    }`}
                  >
                    <CheckIcon className="size-2.5" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopSortControl({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (v: SortOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();
  const current =
    SORT_MENU_OPTIONS.find((option) => option.value === value) ??
    SORT_MENU_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (!root || root.contains(event.target as Node)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative w-[150px] xl:w-[164px]">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((state) => !state)}
        className={`flex h-9 w-full items-center justify-between gap-3 border px-3 text-right transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15 ${
          open
            ? "border-[var(--shop-copper)] bg-[var(--shop-surface)] text-[var(--shop-text)] shadow-[0_10px_24px_-20px_rgba(35,31,32,0.30)]"
            : "border-[var(--shop-border)] bg-[var(--shop-surface)] text-[var(--shop-text)] hover:border-[var(--shop-copper)] hover:bg-[var(--shop-surface-muted)]"
        }`}
      >
        <span className="truncate text-[7px] font-semibold tracking-[0.02em]">
          {current.label}
        </span>
        <ChevronDownIcon
          className={`size-2.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      <div
        id={menuId}
        role="listbox"
        aria-label="مرتب‌سازی محصولات"
        aria-hidden={!open}
        className={`absolute right-0 top-[calc(100%_+_7px)] z-[140] w-[210px] border border-[var(--shop-border)] bg-[var(--shop-surface)] p-1.5 text-right shadow-[0_20px_55px_-24px_rgba(11,11,11,0.34)] ${
          open ? "pointer-events-auto visible" : "pointer-events-none invisible"
        }`}
      >
        {SORT_MENU_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`flex min-h-9 w-full items-center justify-between px-3 text-right text-[7px] font-semibold tracking-[0.02em] transition-colors ${
                active
                  ? "bg-[var(--shop-copper-soft)] text-[var(--shop-text)] ring-1 ring-inset ring-[var(--shop-copper)]"
                  : "text-[var(--shop-muted)] hover:bg-[var(--shop-surface-muted)] hover:text-[var(--shop-text)]"
              }`}
            >
              {option.label}
              {active ? <CheckIcon className="size-2.5" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ACCORDION
   ═══════════════════════════════════════════════════════════ */

function IslandAccordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-black/8 py-3 last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-7 w-full items-center justify-between text-right"
      >
        <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-black/80">
          {title}
        </span>
        <span
          className={`text-[13px] font-light text-black/40 transition-transform duration-300 ${
            open ? "rotate-45" : "rotate-0"
          }`}
        >
          +
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DESKTOP GRID
   ═══════════════════════════════════════════════════════════ */

function DesktopInterleavedGrid({ content }: { content: InterleavedItem[] }) {
  const chunks = useMemo(() => buildContentChunks(content), [content]);
  return (
    <div className="space-y-6">
      {chunks.map((chunk, ci) => {
        if (chunk.kind === "products") {
          return (
            <div
              key={`dp-${ci}`}
              className="grid grid-cols-1 md:grid-cols-2 gap-1"
            >
              {chunk.items.map(({ product, index }, cardIndex) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  preload={index < 4}
                  panelSide={cardIndex % 2 === 0 ? "left" : "right"}
                />
              ))}
            </div>
          );
        }
        return (
          <InterstitialBanner key={chunk.banner.id} banner={chunk.banner} />
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MOBILE GRID (single-column, alternating panel side)
   ═══════════════════════════════════════════════════════════ */

function MobileInterleavedGrid({ content }: { content: InterleavedItem[] }) {
  const chunks = useMemo(() => buildContentChunks(content), [content]);
  return (
    <div>
      {chunks.map((chunk, ci) => {
        if (chunk.kind === "products") {
          return (
            <div
              key={`mp-${ci}`}
              className="grid grid-cols-1 gap-px bg-[var(--shop-border)]"
            >
              {chunk.items.map(({ product, index }, cardIndex) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  preload={index < 2}
                  compact
                  panelSide={cardIndex % 2 === 0 ? "right" : "left"}
                />
              ))}
            </div>
          );
        }
        return (
          <InterstitialBannerMobile
            key={chunk.banner.id}
            banner={chunk.banner}
          />
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT CARD — Optical Atelier Glass Object
   ═══════════════════════════════════════════════════════════ */

function ProductCard({
  product,
  preload = false,
  compact = false,
  panelSide = "right",
}: {
  product: Product;
  preload?: boolean;
  compact?: boolean;
  panelSide?: ProductPanelSide;
}) {
  const toast = useToast();
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previewTrackRef = useRef<HTMLDivElement | null>(null);
  const previewAnimatingRef = useRef(false);
  const previewAnimationTimerRef = useRef<number | null>(null);
  const hoverOpenTimerRef = useRef<number | null>(null);
  const hoverCloseTimerRef = useRef<number | null>(null);
  const hoverSuppressedUntilRef = useRef(0);
  const swipeFrameRef = useRef<number | null>(null);
  const pendingSwipeXRef = useRef<number | null>(null);
  const suppressClickUntilRef = useRef(0);

  const swipeRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastTime: 0,
    velocityX: 0,
    moved: false,
  });

  const productImages = product.images?.length
    ? product.images
    : [
        {
          id: `${product.id}-fb`,
          src: product.image,
          alt: product.imageAlt ?? product.title,
          position: product.imagePosition,
        },
      ];

  const colorMetaMap = useMemo(
    () =>
      new Map((product.colorSwatches ?? []).map((color) => [color.id, color])),
    [product.colorSwatches],
  );
  const colors = (product.colors ?? []).map((colorId) =>
    getColorMeta(colorId, colorMetaMap),
  );
  const sizeOptions =
    product.sizeOptions ??
    (product.sizes ?? []).map((size) => ({ id: size, label: size }));

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [selColorId, setSelColorId] = useState(colors[0]?.id ?? "");
  const [selSizeId, setSelSizeId] = useState("");
  const [hoverOpen, setHoverOpen] = useState(false);
  const [lockedOpen, setLockedOpen] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [cartState, setCartState] = useState<CartActionState>("idle");
  const [panelHovered, setPanelHovered] = useState(false);

  const open = compact ? lockedOpen : hoverOpen || lockedOpen;
  const panelOnLeft = panelSide === "left";
  const activeImage = productImages[activeImgIdx] ?? productImages[0];
  const selectedColor = colors.find((c) => c.id === selColorId) ?? colors[0];
  const categoryLabel =
    product.categoryLabel ?? String(product.category).replaceAll("-", " ");

  const prevIdx =
    (activeImgIdx - 1 + productImages.length) % productImages.length;
  const nextIdx = (activeImgIdx + 1) % productImages.length;
  const prevImage = productImages[prevIdx] ?? activeImage;
  const curPreviewImage = activeImage;
  const nextImage = productImages[nextIdx] ?? activeImage;

  const canCycle = productImages.length > 1;
  const hiddenTab = open ? 0 : -1;
  const progressPct =
    productImages.length > 1
      ? ((activeImgIdx + 1) / productImages.length) * 100
      : 100;

  useLayoutEffect(() => {
    const track = previewTrackRef.current;
    if (!track) return;
    track.style.transition = "none";
    track.style.transform = "translate3d(-100%, 0, 0)";
    track.style.willChange = "";
    previewAnimatingRef.current = false;
  }, [activeImgIdx]);

  useEffect(
    () => () => {
      if (hoverOpenTimerRef.current !== null)
        window.clearTimeout(hoverOpenTimerRef.current);
      if (hoverCloseTimerRef.current !== null)
        window.clearTimeout(hoverCloseTimerRef.current);
      if (swipeFrameRef.current !== null)
        cancelAnimationFrame(swipeFrameRef.current);
      if (previewAnimationTimerRef.current !== null)
        window.clearTimeout(previewAnimationTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!lockedOpen) return;
    function onPD(e: PointerEvent) {
      const p = panelRef.current;
      if (!p || p.contains(e.target as Node)) return;
      setLockedOpen(false);
      if (!compact) setHoverOpen(false);
    }
    function onKD(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setLockedOpen(false);
        setHoverOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPD);
    window.addEventListener("keydown", onKD);
    return () => {
      document.removeEventListener("pointerdown", onPD);
      window.removeEventListener("keydown", onKD);
    };
  }, [lockedOpen, compact]);

  function clearHoverOpen() {
    if (hoverOpenTimerRef.current !== null) {
      window.clearTimeout(hoverOpenTimerRef.current);
      hoverOpenTimerRef.current = null;
    }
  }
  function clearHoverClose() {
    if (hoverCloseTimerRef.current !== null) {
      window.clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
  }
  function scheduleHoverOpen() {
    if (
      compact ||
      lockedOpen ||
      performance.now() < hoverSuppressedUntilRef.current
    )
      return;
    clearHoverClose();
    clearHoverOpen();
    hoverOpenTimerRef.current = window.setTimeout(() => {
      setHoverOpen(true);
      hoverOpenTimerRef.current = null;
    }, 145);
  }
  function scheduleHoverClose() {
    if (compact || lockedOpen) return;
    clearHoverOpen();
    clearHoverClose();
    hoverCloseTimerRef.current = window.setTimeout(() => {
      setHoverOpen(false);
      hoverCloseTimerRef.current = null;
    }, 230);
  }
  function pinOrToggle() {
    clearHoverOpen();
    clearHoverClose();
    if (compact) {
      setLockedOpen((v) => !v);
      return;
    }
    if (lockedOpen) {
      setLockedOpen(false);
      setHoverOpen(false);
      hoverSuppressedUntilRef.current = performance.now() + 380;
      return;
    }
    setHoverOpen(false);
    setLockedOpen(true);
  }

  /* swipe helpers */
  function writeOffset(dx: number, anim = false) {
    const t = previewTrackRef.current;
    if (!t) return;
    const w = t.parentElement?.clientWidth ?? 1;
    const s = Math.max(-w * 0.96, Math.min(w * 0.96, dx));
    t.style.transition = anim
      ? "transform 320ms cubic-bezier(0.22,1,0.36,1)"
      : "none";
    t.style.transform = `translate3d(calc(-100% + ${s}px), 0, 0)`;
  }
  function scheduleOffset(dx: number) {
    pendingSwipeXRef.current = dx;
    if (swipeFrameRef.current !== null) return;
    swipeFrameRef.current = requestAnimationFrame(() => {
      swipeFrameRef.current = null;
      const p = pendingSwipeXRef.current;
      pendingSwipeXRef.current = null;
      if (p === null) return;
      writeOffset(p, false);
    });
  }
  function snapCenter() {
    const t = previewTrackRef.current;
    if (!t) return;
    t.style.transition = "transform 320ms cubic-bezier(0.22,1,0.36,1)";
    t.style.transform = "translate3d(-100%, 0, 0)";
  }
  function animateSlide(dir: -1 | 1) {
    if (!canCycle || previewAnimatingRef.current) return;
    const t = previewTrackRef.current;
    if (!t) return;
    previewAnimatingRef.current = true;
    if (previewAnimationTimerRef.current !== null)
      window.clearTimeout(previewAnimationTimerRef.current);
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    t.style.willChange = "transform";
    t.style.transition = rm
      ? "none"
      : "transform 320ms cubic-bezier(0.22,1,0.36,1)";
    t.style.transform =
      dir === 1 ? "translate3d(-200%, 0, 0)" : "translate3d(0%, 0, 0)";
    const commit = () => {
      if (!previewAnimatingRef.current) return;
      setActiveImgIdx(
        (c) => (c + dir + productImages.length) % productImages.length,
      );
    };
    if (rm) {
      requestAnimationFrame(commit);
      return;
    }
    previewAnimationTimerRef.current = window.setTimeout(() => {
      previewAnimationTimerRef.current = null;
      commit();
    }, 320);
  }
  function onPDown(e: ReactPointerEvent<HTMLButtonElement>) {
    if (previewAnimatingRef.current) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    swipeRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastTime: performance.now(),
      velocityX: 0,
      moved: false,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    const t = previewTrackRef.current;
    if (t) {
      t.style.transition = "none";
      t.style.willChange = "transform";
    }
  }
  function onPMove(e: ReactPointerEvent<HTMLButtonElement>) {
    const s = swipeRef.current;
    if (!s.active || s.pointerId !== e.pointerId) return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    if (Math.abs(dx) > 7 && Math.abs(dx) > Math.abs(dy) * 1.15) {
      e.preventDefault();
      s.moved = true;
    }
    if (!s.moved) return;
    const now = performance.now();
    const dt = Math.max(1, now - s.lastTime);
    s.velocityX = s.velocityX * 0.68 + ((e.clientX - s.lastX) / dt) * 0.32;
    s.lastX = e.clientX;
    s.lastTime = now;
    scheduleOffset(dx);
  }
  function onPUp(e: ReactPointerEvent<HTMLButtonElement>) {
    const s = swipeRef.current;
    if (!s.active || s.pointerId !== e.pointerId) return;
    s.active = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    if (swipeFrameRef.current !== null) {
      cancelAnimationFrame(swipeFrameRef.current);
      swipeFrameRef.current = null;
    }
    if (pendingSwipeXRef.current !== null) {
      writeOffset(pendingSwipeXRef.current, false);
      pendingSwipeXRef.current = null;
    }
    const dx = e.clientX - s.startX;
    const nav =
      canCycle &&
      s.moved &&
      (Math.abs(dx) > 34 || Math.abs(s.velocityX) > 0.48);
    if (s.moved) suppressClickUntilRef.current = performance.now() + 280;
    if (nav) {
      animateSlide(dx < 0 ? 1 : -1);
      return;
    }
    snapCenter();
    const t = previewTrackRef.current;
    if (t)
      window.setTimeout(() => {
        t.style.willChange = "";
      }, 340);
  }
  function onPCancel(e: ReactPointerEvent<HTMLButtonElement>) {
    swipeRef.current.active = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    snapCenter();
  }
  function handlePreviewClick() {
    if (performance.now() < suppressClickUntilRef.current) return;
    pinOrToggle();
  }
  function centerOption(el: HTMLElement) {
    const rail = el.closest(
      "[data-glass-option-rail]",
    ) as HTMLDivElement | null;
    if (!rail) return;
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rr = rail.getBoundingClientRect();
    const or = el.getBoundingClientRect();
    const t =
      rail.scrollLeft + (or.left - rr.left) - (rail.clientWidth - or.width) / 2;
    rail.scrollTo({
      left: Math.max(0, t),
      behavior: rm ? "auto" : "smooth",
    });
  }
  function selectColor(cid: string, ci: number) {
    setSelColorId(cid);
    if (productImages[ci]) setActiveImgIdx(ci);
  }
  function toggleFav() {
    const n = !favorite;
    setFavorite(n);
    toast.info(n ? "به علاقه‌مندی‌ها اضافه شد" : "از علاقه‌مندی‌ها حذف شد", {
      description: product.title,
    });
  }
  async function addToBag() {
    if (sizeOptions.length && !selSizeId) {
      setLockedOpen(true);
      toast.info("سایز را انتخاب کنید", {
        description: "قبل از افزودن محصول به سبد، یک سایز انتخاب کنید.",
      });
      return;
    }
    if (cartState !== "idle") return;
    setCartState("adding");
    try {
      await new Promise((r) => window.setTimeout(r, 520));
      setCartState("added");
      toast.success("به سبد خرید اضافه شد", {
        description: [
          product.title,
          selectedColor?.label,
          selSizeId
            ? `سایز ${
                sizeOptions.find((size) => size.id === selSizeId)?.label ??
                selSizeId
              }`
            : undefined,
        ]
          .filter(Boolean)
          .join(" — "),
      });
      await new Promise((r) => window.setTimeout(r, 760));
      setCartState("idle");
      setLockedOpen(false);
      if (compact) setHoverOpen(false);
    } catch {
      setCartState("idle");
      toast.error("افزودن محصول ناموفق بود", {
        description: "دوباره برای افزودن محصول تلاش کنید.",
      });
    }
  }

  /* Localized panel-side vignette */
  const vignetteGradient = panelOnLeft
    ? "radial-gradient(ellipse 70% 60% at 10% 85%, rgba(0,0,0,0.50) 0%, transparent 70%)"
    : "radial-gradient(ellipse 70% 60% at 90% 85%, rgba(0,0,0,0.50) 0%, transparent 70%)";

  const panelLifted = panelHovered && !open && !compact;

  return (
    <article
      className={`group/product relative isolate min-w-0 overflow-hidden bg-[#0B0B0B] [contain:paint] ${
        compact
          ? "aspect-[3/4]"
          : "aspect-[4/5] sm:aspect-[4/3] lg:aspect-[1.4/1]"
      }`}
    >
      {/* Main product image */}
      <Link
        href={product.href}
        aria-label={`مشاهده ${product.title}`}
        className="absolute inset-0 z-0 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
      >
        <Image
          key={activeImage.src}
          src={activeImage.src}
          alt={activeImage.alt ?? product.imageAlt ?? product.title}
          fill
          preload={preload}
          sizes={compact ? "100vw" : "50vw"}
          draggable={false}
          style={{
            objectPosition:
              activeImage.position ?? product.imagePosition ?? "center",
          }}
          className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/product:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
        />
        {/* Bottom metadata gradient */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.12)_62%,rgba(0,0,0,0.62)_100%)]"
        />
        {/* Localized panel-side vignette */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: vignetteGradient }}
        />
      </Link>

      {/* Wishlist button */}
      <button
        type="button"
        aria-label={
          favorite
            ? `حذف ${product.title} از علاقه‌مندی‌ها`
            : `افزودن ${product.title} به علاقه‌مندی‌ها`
        }
        aria-pressed={favorite}
        onClick={toggleFav}
        className={`absolute z-30 grid place-items-center border border-white/20 bg-black/30 text-white backdrop-blur-md transition-[opacity,background-color,border-color,transform] duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white ${
          open
            ? "pointer-events-none opacity-0"
            : compact
              ? "right-2.5 top-2.5 size-9 opacity-70 active:scale-95"
              : favorite
                ? "right-4 top-4 size-9 opacity-100"
                : "right-4 top-4 size-9 opacity-0 group-hover/product:opacity-70 hover:border-white/40 hover:bg-black/50 hover:opacity-100 focus-visible:opacity-100"
        }`}
      >
        <HeartIcon filled={favorite} />
      </button>

      {/* Product name + price (editorial composition) */}
      <div
        className={`pointer-events-none absolute z-10 transition-opacity duration-300 ${
          open ? "opacity-0" : "opacity-100"
        } ${
          compact
            ? panelOnLeft
              ? "bottom-5 left-[168px] right-4 text-right"
              : "bottom-5 left-4 right-[168px] text-left"
            : panelOnLeft
              ? "bottom-5 left-[230px] right-5 text-right md:bottom-6 md:left-[238px] md:right-6"
              : "bottom-5 left-5 right-[230px] text-left md:bottom-6 md:left-6 md:right-[238px]"
        }`}
      >
        <h2
          title={product.title}
          className={`font-semibold uppercase leading-tight text-white drop-shadow-md line-clamp-1 ${
            compact
              ? "text-[13px] tracking-[0.12em]"
              : "text-[12px] tracking-[0.15em] md:text-[12px]"
          }`}
        >
          {product.title}
        </h2>
        {/* <div
          className={`mt-1.5 flex flex-col gap-1 ${
            panelOnLeft ? "items-end" : "items-start"
          }`}
        >
          <span
            className={`font-medium tabular-nums text-white/90 drop-shadow-sm ${
              compact ? "text-[12px]" : "text-[10px] md:text-[11px]"
            }`}
          >
            {money(product.price, product.currency)}
          </span>
          <div
            className={`bg-[var(--shop-copper)] ${
              compact ? "mt-1 h-px w-4" : "mt-1.5 h-[1.5px] w-5"
            }`}
          />
        </div> */}
      </div>

      {/* ══════ OPTICAL ATELIER GLASS PANEL ══════ */}
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        <div
          ref={panelRef}
          onMouseEnter={() => {
            setPanelHovered(true);
            scheduleHoverOpen();
          }}
          onMouseLeave={() => {
            setPanelHovered(false);
            scheduleHoverClose();
          }}
          onFocusCapture={() => {
            if (compact || lockedOpen) return;
            clearHoverOpen();
            clearHoverClose();
            setHoverOpen(true);
          }}
          onBlurCapture={(e) => {
            if (compact || lockedOpen) return;
            const nt = e.relatedTarget;
            if (!(nt instanceof Node) || !e.currentTarget.contains(nt))
              scheduleHoverClose();
          }}
          style={{
            /* ▸ Smoked glass body */
            background:
              "linear-gradient(145deg, rgba(14,14,14,0.62) 0%, rgba(8,8,8,0.74) 100%)",
            backdropFilter: "blur(22px) saturate(146%)",
            WebkitBackdropFilter: "blur(22px) saturate(146%)",
            /* ▸ Layered depth shadow */
            boxShadow:
              panelLifted || open
                ? "0 38px 92px -26px rgba(0,0,0,.94), 0 16px 36px -16px rgba(0,0,0,.84), inset 0 1px 0 rgba(255,255,255,.16)"
                : "0 36px 90px -26px rgba(0,0,0,.90), 0 14px 34px -16px rgba(0,0,0,.78), inset 0 1px 0 rgba(255,255,255,.12)",
            /* ▸ Structural 1px border, brighter on hover intent */
            border: panelLifted
              ? "1px solid rgba(255,255,255,0.20)"
              : "1px solid rgba(255,255,255,0.14)",
            /* ▸ Immediate hover feedback lift */
            transform: panelLifted ? "translateY(-2px)" : undefined,
          }}
          className={`pointer-events-auto absolute flex flex-col overflow-hidden text-white transform-gpu transition-[width,height,transform,box-shadow,border-color] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            panelOnLeft ? "origin-bottom-left" : "origin-bottom-right"
          } ${
            compact
              ? open
                ? panelOnLeft
                  ? "bottom-2 left-2 h-[min(420px,calc(100%_-_1rem))] w-[min(360px,calc(100%_-_1rem))]"
                  : "bottom-2 right-2 h-[min(420px,calc(100%_-_1rem))] w-[min(360px,calc(100%_-_1rem))]"
                : panelOnLeft
                  ? "bottom-3 left-3 h-[200px] max-h-[calc(100%_-_1.5rem)] w-[148px] max-w-[calc(100%_-_1.5rem)]"
                  : "bottom-3 right-3 h-[200px] max-h-[calc(100%_-_1.5rem)] w-[148px] max-w-[calc(100%_-_1.5rem)]"
              : open
                ? panelOnLeft
                  ? "bottom-5 left-4 h-[340px] max-h-[calc(100%_-_2rem)] w-[260px] max-w-[calc(100%_-_2rem)]"
                  : "bottom-5 right-4 h-[340px] max-h-[calc(100%_-_2rem)] w-[260px] max-w-[calc(100%_-_2rem)]"
                : panelOnLeft
                  ? "bottom-5 left-4 h-[228px] max-h-[calc(100%_-_2rem)] w-[206px] max-w-[calc(100%_-_2rem)]"
                  : "bottom-5 right-4 h-[228px] max-h-[calc(100%_-_2rem)] w-[206px] max-w-[calc(100%_-_2rem)]"
          }`}
        >
          {/* Optical edge highlights + copper locator */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
          >
            {/* Top-edge light catch (near anchor) */}
            <span
              className={`absolute top-0 h-px transition-[background-color,width] duration-200 ${
                panelOnLeft ? "left-0" : "right-0"
              } ${panelLifted ? "w-[42%] bg-white/60" : "w-[38%] bg-white/50"}`}
            />
            {/* Opposite darker edge */}
            <span
              className={`absolute top-0 h-px bg-black/30 ${
                panelOnLeft ? "right-0 w-[55%]" : "left-0 w-[55%]"
              }`}
            />
            {/* Copper locator — vertical + horizontal micro-line */}
            <span
              className={`absolute bottom-0 h-[28px] w-px bg-[var(--shop-copper)] ${
                panelOnLeft ? "left-0" : "right-0"
              }`}
            />
            <span
              className={`absolute bottom-0 h-px w-[18px] bg-[var(--shop-copper)] ${
                panelOnLeft ? "left-0" : "right-0"
              }`}
            />
            {/* Diagonal sheen */}
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06)_0%,transparent_28%)]" />
          </div>

          {/* Preview image — hero of the panel */}
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={
              open
                ? "Close quick product options"
                : "Open quick product options"
            }
            onPointerDown={onPDown}
            onPointerMove={onPMove}
            onPointerUp={onPUp}
            onPointerCancel={onPCancel}
            onClick={handlePreviewClick}
            className={`group/preview relative z-10 block flex-none touch-pan-y select-none overflow-hidden border border-white/12 bg-black/20 text-left shadow-[0_12px_28px_-18px_rgba(0,0,0,0.82),inset_0_1px_0_rgba(255,255,255,0.10)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white transition-[height,width,margin] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              compact
                ? open
                  ? "mx-2.5 mt-2.5 h-[180px] w-[calc(100%_-_1.25rem)]"
                  : "mx-2 mt-2 h-[120px] w-[calc(100%_-_1rem)]"
                : open
                  ? "mx-3 mt-3 h-[118px] w-[calc(100%_-_1.5rem)]"
                  : "mx-2 mt-2 h-[158px] w-[calc(100%_-_1rem)]"
            }`}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div
                ref={previewTrackRef}
                dir="ltr"
                style={{ transform: "translate3d(-100%, 0, 0)" }}
                className="absolute inset-0 flex [backface-visibility:hidden]"
              >
                {[prevImage, curPreviewImage, nextImage].map((img, si) => (
                  <div
                    key={`${img.id}-${si}`}
                    className="relative h-full min-w-full shrink-0 overflow-hidden"
                  >
                    <Image
                      src={img.src}
                      alt={img.alt ?? product.title}
                      fill
                      loading="lazy"
                      sizes={compact ? "(max-width:640px) 360px" : "260px"}
                      draggable={false}
                      style={{ objectPosition: img.position ?? "center" }}
                      className="pointer-events-none object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-[linear-gradient(180deg,transparent_52%,rgba(0,0,0,0.24)_100%)]"
                    />
                  </div>
                ))}
              </div>
            </div>
            {!open && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.10)_0%,transparent_42%)]"
              />
            )}
          </button>

          {/* CLOSED — MOBILE (Mini Lookbook Card) */}
          {compact && !open && (
            <button
              type="button"
              aria-label="گزینه‌های سریع"
              onClick={() => setLockedOpen(true)}
              className="relative z-10 flex min-h-0 flex-1 flex-col items-start justify-center gap-1 border-t border-white/8 px-3 text-left transition-colors active:bg-white/[0.04] focus-visible:outline-none focus-visible:bg-white/[0.04]"
            >
              <span className="text-[7px] font-semibold tabular-nums tracking-[0.12em] text-white/78">
                {String(activeImgIdx + 1).padStart(2, "0")}
                <span className="mx-1 text-white/20">/</span>
                {String(productImages.length).padStart(2, "0")}
              </span>
              <span className="max-w-full truncate text-[6.5px] font-semibold uppercase tracking-[0.14em] text-white/54">
                {categoryLabel}
              </span>
              <span className="text-[5.5px] font-semibold uppercase tracking-[0.16em] text-white/30">
                گزینه‌های سریع
              </span>
            </button>
          )}

          {/* CLOSED — DESKTOP */}
          {!compact && !open && (
            <div className="relative z-10 flex flex-1 items-center justify-between gap-3 px-3">
              <div className="min-w-0">
                <span className="block text-[6px] font-semibold tabular-nums tracking-[0.12em] text-white/68">
                  {String(activeImgIdx + 1).padStart(2, "0")}
                  <span className="mx-1 text-white/22">/</span>
                  {String(productImages.length).padStart(2, "0")}
                </span>
                <span className="mt-1 block max-w-[94px] truncate text-[5.5px] font-semibold uppercase tracking-[0.12em] text-white/40">
                  {categoryLabel}
                </span>
              </div>
              <div className="flex items-center">
                <GlassIconButton
                  label="Previous image"
                  disabled={!canCycle}
                  onClick={() => animateSlide(-1)}
                  compact={false}
                >
                  <ArrowRightSmallIcon />
                </GlassIconButton>
                <GlassIconButton
                  label="Next image"
                  disabled={!canCycle}
                  onClick={() => animateSlide(1)}
                  compact={false}
                >
                  <ArrowLeftIcon />
                </GlassIconButton>
                <button
                  type="button"
                  aria-expanded={false}
                  aria-controls={panelId}
                  aria-label="Open quick product options"
                  onClick={pinOrToggle}
                  className="grid size-7 place-items-center text-white/50 transition-[background-color,color] hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                >
                  <ChevronQuickIcon open={false} />
                </button>
              </div>
            </div>
          )}

          {/* OPEN — options and CTA */}
          <div
            id={panelId}
            aria-hidden={!open}
            className={`relative z-10 flex min-h-0  flex-1 flex-col transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              open
                ? "translate-y-0 opacity-100 delay-75"
                : "pointer-events-none translate-y-1 opacity-0"
            }`}
          >
            {/* Gallery progress rail */}
            <div
              className={`flex flex-none items-center gap-2.5 border-b border-white/8 ${
                compact ? "min-h-[40px] px-3" : "min-h-[34px] px-3"
              }`}
            >
              <span className="text-[6.5px] font-semibold tabular-nums tracking-[0.12em] text-white/58">
                {String(activeImgIdx + 1).padStart(2, "0")}
                <span className="mx-1 text-white/22">/</span>
                {String(productImages.length).padStart(2, "0")}
              </span>
              <div className="relative h-[1.5px] flex-1 bg-white/12">
                <div
                  className="absolute inset-y-0 left-0 bg-white/72 transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex items-center">
                <GlassIconButton
                  label="Previous image"
                  disabled={!canCycle}
                  onClick={() => animateSlide(-1)}
                  compact={compact}
                >
                  <ArrowRightSmallIcon />
                </GlassIconButton>
                <GlassIconButton
                  label="Next image"
                  disabled={!canCycle}
                  onClick={() => animateSlide(1)}
                  compact={compact}
                >
                  <ArrowLeftIcon />
                </GlassIconButton>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  aria-label="Close quick product options"
                  onClick={pinOrToggle}
                  className={`grid place-items-center text-white/50 transition-[background-color,color] hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white ${
                    compact ? "size-[44px]" : "size-7"
                  }`}
                >
                  <ChevronQuickIcon open={open} />
                </button>
              </div>
            </div>

            {/* Color + Size */}
            <div
              className={`min-h-0 flex-1  ${
                compact ? "space-y-2 px-3 py-3.5" : "space-y-2.5 px-3 py-2.5"
              }`}
            >
              {colors.length > 0 && (
                <GlassOptionRail
                  label="رنگ"
                  compact={compact}
                  selectedLabel={selectedColor?.label}
                >
                  {colors.map((color, ci) => {
                    const active = selColorId === color.id;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        tabIndex={hiddenTab}
                        aria-label={`انتخاب رنگ ${color.label}`}
                        aria-pressed={active}
                        onClick={(e) => {
                          selectColor(color.id, ci);
                          centerOption(e.currentTarget);
                        }}
                        className={`relative grid shrink-0 snap-center place-items-center border transition-[border-color,opacity,transform] duration-200 ${
                          compact ? "size-[34px]" : "size-7"
                        } ${
                          active
                            ? "border-white opacity-100"
                            : "border-white/14 opacity-50 hover:scale-[1.03] hover:border-white/40 hover:opacity-100"
                        }`}
                      >
                        <span
                          style={{ background: color.value }}
                          className={
                            compact ? "block size-[20px]" : "block size-4"
                          }
                        />
                        {active && (
                          <span className="absolute -bottom-[4px] left-1/2 h-[1.5px] w-3 -translate-x-1/2 bg-[var(--shop-copper)]" />
                        )}
                      </button>
                    );
                  })}
                </GlassOptionRail>
              )}
              {sizeOptions.length > 0 && (
                <GlassOptionRail
                  label="سایز"
                  compact={compact}
                  selectedLabel={
                    sizeOptions.find((size) => size.id === selSizeId)?.label
                  }
                >
                  {sizeOptions.map((size) => {
                    const active = selSizeId === size.id;
                    return (
                      <button
                        key={size.id}
                        type="button"
                        tabIndex={hiddenTab}
                        aria-label={`انتخاب سایز ${size.label}`}
                        aria-pressed={active}
                        onClick={(e) => {
                          setSelSizeId(size.id);
                          centerOption(e.currentTarget);
                        }}
                        className={`shrink-0 snap-center border font-semibold transition-[background-color,border-color,color] duration-150 ${
                          compact
                            ? "min-h-[34px] min-w-[34px] px-3.5 text-[8px]"
                            : "min-h-7 px-2.5 text-[7px]"
                        } ${
                          active
                            ? "border-[var(--shop-copper)] bg-white/[0.08] text-white"
                            : "border-white/14 text-white/50 hover:border-white/42 hover:text-white"
                        }`}
                      >
                        {size.label}
                      </button>
                    );
                  })}
                </GlassOptionRail>
              )}
            </div>

            {/* CTA */}
            {/* CTA */}
            <div
              className={`flex-none border-t border-white/10 ${
                compact ? "p-3" : "p-3"
              }`}
            >
              <Button
                type="button"
                variant="copper"
                size="sm"
                fullWidth
                loading={cartState === "adding"}
                disabled={cartState !== "idle"}
                onClick={addToBag}
                align="center"
                aria-label="add to cart"
              >
                {cartState === "added" ? (
                  <span className="inline-flex items-center gap-2">
                    <AddedCheckIcon />
                    اضافه شد
                  </span>
                ) : (
                  <span>{money(product.price, product.currency)} خرید</span>
                )}
              </Button>

              {/* بقیه کد بدون تغییر */}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ═══════════════════════════════════════════════════════════
   GLASS ICON BUTTON
   ═══════════════════════════════════════════════════════════ */

function GlassIconButton({
  label,
  disabled,
  onClick,
  compact,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  compact: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`grid place-items-center text-white/42 transition-[background-color,color] hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-15 ${
        compact ? "size-[44px]" : "size-6"
      }`}
    >
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   GLASS OPTION RAIL (Color / Size)
   ═══════════════════════════════════════════════════════════ */

function GlassOptionRail({
  label,
  compact,
  children,
  selectedLabel,
}: {
  label: string;
  compact: boolean;
  children: ReactNode;
  selectedLabel?: string;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const measure = useCallback(() => {
    const r = railRef.current;
    if (!r) return;
    const ov = r.scrollWidth > r.clientWidth + 2;
    const max = Math.max(0, r.scrollWidth - r.clientWidth);
    setHasOverflow(ov);
    setCanPrev(ov && r.scrollLeft > 2);
    setCanNext(ov && r.scrollLeft < max - 2);
  }, []);

  useEffect(() => {
    const r = railRef.current;
    if (!r) return;
    let frame: number | null = null;
    const onScroll = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        measure();
      });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(r);
    r.addEventListener("scroll", onScroll, { passive: true });
    measure();
    return () => {
      ro.disconnect();
      r.removeEventListener("scroll", onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [measure]);

  function scroll(dir: -1 | 1) {
    const r = railRef.current;
    if (!r) return;
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    r.scrollBy({
      left: dir * Math.max(compact ? 86 : 96, r.clientWidth * 0.72),
      behavior: rm ? "auto" : "smooth",
    });
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {/* Heading row: label + selected value */}
      <div className="flex min-w-0 items-baseline justify-between gap-2">
        <span
          className={`shrink-0 font-semibold uppercase tracking-[0.16em] text-white/44 ${
            compact ? "text-[6px]" : "text-[6px]"
          }`}
        >
          {label}
        </span>
        {selectedLabel && (
          <span
            className={`truncate font-semibold uppercase tracking-[0.10em] text-white/72 ${
              compact ? "text-[6.5px]" : "text-[6px]"
            }`}
          >
            {selectedLabel}
          </span>
        )}
      </div>

      {/* Rail row */}
      <div className="flex min-w-0 items-center gap-1.5">
        {hasOverflow && (
          <RailArrowButton
            label={`Previous ${label.toLowerCase()} options`}
            onClick={() => scroll(-1)}
            compact={compact}
            disabled={!canPrev}
          >
            <ArrowLeftIcon />
          </RailArrowButton>
        )}
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-4 bg-gradient-to-r from-[rgba(14,14,14,0.92)] via-[rgba(14,14,14,0.42)] to-transparent transition-opacity duration-200 ${
              canPrev ? "opacity-100" : "opacity-0"
            }`}
          />
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-4 bg-gradient-to-l from-[rgba(14,14,14,0.92)] via-[rgba(14,14,14,0.42)] to-transparent transition-opacity duration-200 ${
              canNext ? "opacity-100" : "opacity-0"
            }`}
          />
          <div
            ref={railRef}
            data-glass-option-rail
            data-lenis-prevent
            className="flex min-w-0 snap-x snap-proximity items-center gap-1.5 overflow-x-auto overscroll-x-contain px-0.5 pb-[5px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {children}
          </div>
        </div>
        {hasOverflow && (
          <RailArrowButton
            label={`Next ${label.toLowerCase()} options`}
            onClick={() => scroll(1)}
            compact={compact}
            disabled={!canNext}
          >
            <ArrowRightSmallIcon />
          </RailArrowButton>
        )}
      </div>
    </div>
  );
}

function RailArrowButton({
  label,
  onClick,
  compact,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  compact: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid shrink-0 place-items-center border border-white/10 text-white/42 transition-[border-color,background-color,color,opacity] hover:border-white/24 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-20 ${
        compact ? "size-[36px]" : "size-5"
      }`}
    >
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   MOBILE FILTERS
   ═══════════════════════════════════════════════════════════ */

function MobileFilters({
  open,
  onClose,
  category,
  setCategory,
  categoryOptions,
  sort,
  setSort,
  selectedSizes,
  setSelectedSizes,
  sizeOptions,
  selectedColors,
  setSelectedColors,
  colorOptions,
  selectedMaterials,
  setSelectedMaterials,
  maxPrice,
  setMaxPrice,
  defaultMaxPrice,
  resetFilters,
  resultCount,
}: {
  open: boolean;
  onClose: () => void;
  category: ProductCategory;
  setCategory: (v: ProductCategory) => void;
  categoryOptions: CategoryOption[];
  sort: SortOption;
  setSort: (v: SortOption) => void;
  selectedSizes: string[];
  setSelectedSizes: (v: string[]) => void;
  sizeOptions: ShopSizeOption[];
  selectedColors: string[];
  setSelectedColors: (v: string[]) => void;
  colorOptions: ShopColorOption[];
  selectedMaterials: string[];
  setSelectedMaterials: (v: string[]) => void;
  maxPrice: number;
  setMaxPrice: (v: number) => void;
  defaultMaxPrice: number;
  resetFilters: () => void;
  resultCount: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !open) return;
    const stop = (e: Event) => e.stopPropagation();
    el.addEventListener("wheel", stop, { passive: false });
    el.addEventListener("touchstart", stop, { passive: true });
    el.addEventListener("touchmove", stop, { passive: false });
    return () => {
      el.removeEventListener("wheel", stop);
      el.removeEventListener("touchstart", stop);
      el.removeEventListener("touchmove", stop);
    };
  }, [open]);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-[1199] bg-black/35 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        aria-hidden={!open}
        className={`fixed inset-x-2 bottom-2 top-[84px] z-[1200] flex flex-col lg:hidden ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-0 overflow-hidden border border-[var(--shop-border)] bg-[var(--shop-surface)] shadow-[0_28px_70px_-30px_rgba(35,31,32,0.38)] ring-1 ring-inset ring-black/[0.03] ${
            open ? "opacity-100" : "opacity-[0.001]"
          }`}
          style={{ background: "var(--shop-surface)" }}
        />
        <div
          className={`${open ? "visible" : "invisible"} relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden text-[var(--shop-text)]`}
        >
          <div className="relative z-10 flex h-16 flex-none items-center justify-between border-b border-[var(--shop-border)] bg-[var(--shop-surface-muted)] px-4 text-right">
            <button
              type="button"
              aria-label="بستن فیلترها"
              onClick={onClose}
              className="grid size-10 place-items-center border border-[var(--shop-border)] bg-[var(--shop-surface)] text-[var(--shop-muted)] transition-[background-color,border-color,color,transform] hover:border-[var(--shop-copper)] hover:bg-[var(--shop-copper-soft)] hover:text-[var(--shop-copper-strong)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--shop-copper-soft-strong)]"
            >
              <CloseIcon />
            </button>
            <div className="text-right">
              <span className="block text-[9px] font-semibold uppercase tracking-[0.21em]">
                فیلترها
              </span>
              <span className="mt-1 block text-[5.5px] font-semibold uppercase tracking-[0.12em] text-[var(--shop-muted)]">
                {new Intl.NumberFormat("fa-IR").format(resultCount)} نتیجه
              </span>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="min-h-10 px-2 text-[7px] font-semibold uppercase tracking-[0.14em] text-[var(--shop-copper)] transition-opacity active:opacity-60"
            >
              پاک
            </button>
          </div>
          <div
            ref={scrollRef}
            data-lenis-prevent
            className="relative z-10 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 [scrollbar-color:rgb(193_84_39_/_0.42)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[var(--shop-copper)] [&::-webkit-scrollbar-track]:bg-transparent"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <MobileFilterBlock title="دسته‌بندی" defaultOpen>
              <div className="grid grid-cols-2 gap-2 pt-3">
                {categoryOptions.map((item) => {
                  const active = category === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setCategory(item.value)}
                      className={`relative min-h-11 border px-3 text-right text-[7px] font-semibold uppercase tracking-[0.08em] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md transition-[border-color,color,background-color,transform] active:scale-[0.985] ${
                        active
                          ? "border-[var(--shop-copper)] bg-[var(--shop-copper-soft)] text-[var(--shop-text)]"
                          : "border-[var(--shop-border)] bg-[var(--shop-surface)] text-[var(--shop-muted)] hover:border-[var(--shop-copper)] hover:bg-[var(--shop-surface-muted)] hover:text-[var(--shop-text)]"
                      }`}
                    >
                      {item.label}
                      {active && (
                        <span className="absolute bottom-1 left-1/2 h-px w-4 -translate-x-1/2 bg-[var(--shop-copper)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </MobileFilterBlock>
            <MobileFilterBlock title="سایز">
              <SizeSelector
                options={sizeOptions}
                values={selectedSizes}
                onChange={setSelectedSizes}
              />
            </MobileFilterBlock>
            <MobileFilterBlock title="رنگ" defaultOpen>
              <ColorSelector
                options={colorOptions}
                values={selectedColors}
                onChange={setSelectedColors}
              />
            </MobileFilterBlock>
            <MobileFilterBlock title="جنس">
              <MaterialSelector
                values={selectedMaterials}
                onChange={setSelectedMaterials}
              />
            </MobileFilterBlock>
            <MobileFilterBlock title="قیمت" defaultOpen>
              <PriceSelector
                value={maxPrice}
                max={defaultMaxPrice}
                onChange={setMaxPrice}
              />
            </MobileFilterBlock>
            <div className="flex min-h-[82px] items-center justify-between gap-3 border-b border-[var(--shop-border)] py-3 text-right">
              <div>
                <span className="block text-[8px] font-semibold uppercase tracking-[0.15em] text-[var(--shop-text)]">
                  مرتب‌سازی
                </span>
                <span className="mt-1 block text-[5.5px] font-medium uppercase tracking-[0.1em] text-[var(--shop-muted)]">
                  ترتیب نمایش محصولات
                </span>
              </div>
              <div className="w-[168px] max-w-[58vw]">
                <GlassSortControl
                  value={sort}
                  onChange={setSort}
                  compact
                  align="right"
                />
              </div>
            </div>
          </div>
          <div className="relative z-10 flex-none border-t border-[var(--shop-border)] bg-[var(--shop-surface-muted)] p-3">
            <Button
              type="button"
              variant="black"
              size="lg"
              fullWidth
              onClick={onClose}
            >
              مشاهده {new Intl.NumberFormat("fa-IR").format(resultCount)} محصول
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

function MobileFilterBlock({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[var(--shop-border)] py-5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-right"
      >
        <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--shop-text)]">
          {title}
        </span>
        <span
          className={`text-[14px] font-light text-[var(--shop-soft)] transition-transform duration-300 ${
            open ? "rotate-45" : "rotate-0"
          }`}
        >
          +
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FILTER SELECTORS
   ═══════════════════════════════════════════════════════════ */

function SizeSelector({
  options,
  values,
  onChange,
  dark = false,
}: {
  options?: ShopSizeOption[];
  values: string[];
  onChange: (v: string[]) => void;
  dark?: boolean;
}) {
  const items = options?.length
    ? options
    : SIZE_OPTIONS.map((size) => ({ id: size, label: size }));

  function toggle(v: string) {
    onChange(
      values.includes(v) ? values.filter((i) => i !== v) : [...values, v],
    );
  }
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((size) => {
        const sel = values.includes(size.id);
        return (
          <button
            key={size.id}
            type="button"
            aria-pressed={sel}
            onClick={() => toggle(size.id)}
            className={`min-h-9 border text-[8px] font-semibold transition-[background-color,border-color,color] ${
              dark
                ? sel
                  ? "border-white bg-white text-black"
                  : "border-white/10 text-white/48 hover:border-white/35 hover:bg-white/5 hover:text-white"
                : sel
                  ? "border-[var(--shop-copper)] bg-[var(--shop-copper-soft)] text-[var(--shop-text)]"
                  : "border-[var(--shop-border)] text-[var(--shop-muted)] hover:border-[var(--shop-copper)] hover:bg-[var(--shop-surface-muted)] hover:text-[var(--shop-text)]"
            }`}
          >
            {size.label}
          </button>
        );
      })}
    </div>
  );
}

function ColorSelector({
  options,
  values,
  onChange,
  dark = false,
}: {
  options?: ShopColorOption[];
  values: string[];
  onChange: (v: string[]) => void;
  dark?: boolean;
}) {
  const items = options?.length ? options : COLOR_OPTIONS;

  function toggle(v: string) {
    onChange(
      values.includes(v) ? values.filter((i) => i !== v) : [...values, v],
    );
  }
  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map((color) => {
        const sel = values.includes(color.id);
        return (
          <button
            key={color.id}
            type="button"
            aria-label={color.label}
            aria-pressed={sel}
            onClick={() => toggle(color.id)}
            className="group/color flex flex-col items-center gap-1.5"
          >
            <span
              className={`relative grid size-8 place-items-center border transition-[border-color,opacity] ${
                sel
                  ? dark
                    ? "border-white"
                    : "border-[var(--shop-copper)]"
                  : dark
                    ? "border-white/10 group-hover/color:border-white/38"
                    : "border-black/12 group-hover/color:border-black/34"
              }`}
            >
              <span
                className="block size-5"
                style={{ background: color.value }}
              />
              {sel && (
                <span className="absolute -bottom-[4px] left-1/2 h-[1.5px] w-4 -translate-x-1/2 bg-[var(--shop-copper)]" />
              )}
            </span>
            <span
              className={`text-[6px] uppercase tracking-[0.06em] ${
                dark
                  ? sel
                    ? "text-white"
                    : "text-white/34"
                  : sel
                    ? "text-black"
                    : "text-black/34"
              }`}
            >
              {color.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function MaterialSelector({
  values,
  onChange,
  dark = false,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  dark?: boolean;
}) {
  function toggle(v: string) {
    const n = v.toLowerCase();
    onChange(
      values.includes(n) ? values.filter((i) => i !== n) : [...values, n],
    );
  }
  return (
    <div className="space-y-1">
      {MATERIAL_OPTIONS.map((mat) => {
        const sel = values.includes(mat.toLowerCase());
        return (
          <button
            key={mat}
            type="button"
            aria-pressed={sel}
            onClick={() => toggle(mat)}
            className="group flex min-h-8 w-full items-center gap-3 text-right"
          >
            <span
              className={`grid size-[16px] flex-none place-items-center border transition-colors ${
                dark
                  ? "border-white/20 group-hover:border-white/40"
                  : "border-[var(--shop-border)] group-hover:border-[var(--shop-copper)]"
              } ${sel ? (dark ? "border-white bg-white" : "border-[var(--shop-copper)] bg-[var(--shop-copper)]") : ""}`}
            >
              {sel && (
                <CheckIcon
                  className={`size-2.5 ${dark ? "text-black" : "text-white"}`}
                />
              )}
            </span>
            <span
              className={`text-[8px] font-medium uppercase tracking-[0.07em] transition-colors ${
                dark
                  ? sel
                    ? "text-white"
                    : "text-white/48 group-hover:text-white/80"
                  : sel
                    ? "text-[var(--shop-text)]"
                    : "text-[var(--shop-muted)] group-hover:text-[var(--shop-text)]"
              }`}
            >
              {mat}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PriceSelector({
  value,
  max,
  onChange,
  dark = false,
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
  dark?: boolean;
}) {
  const min = 0;
  const safeMax = Math.max(max, 100);
  const pct = (Math.min(value, safeMax) / safeMax) * 100;
  return (
    <div>
      <div className="flex justify-between text-[7px] font-semibold uppercase tracking-[0.08em]">
        <span className={dark ? "text-white/34" : "text-black/34"}>
          {money(min)}
        </span>
        <span className={dark ? "text-white/78" : "text-black/78"}>
          {money(value)}
        </span>
      </div>
      <div className="relative mt-4 h-6">
        <div
          className={`absolute right-0 top-1/2 h-[2px] w-full -translate-y-1/2 ${
            dark ? "bg-white/10" : "bg-black/10"
          }`}
        />
        <div
          className="absolute right-0 top-1/2 h-[2px] -translate-y-1/2 bg-[var(--shop-copper)]"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={safeMax}
          step={100}
          value={value}
          aria-label="حداکثر قیمت"
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 size-3 translate-x-1/2 -translate-y-1/2 border border-[var(--shop-copper)] bg-[var(--shop-surface)]"
          style={{ right: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════════════════ */

function ShopProductsState({
  title,
  description = "چند لحظه صبر کنید.",
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 grid size-14 place-items-center border border-black/8">
        <SearchIcon className="size-5 text-black/28" />
      </div>
      <p className="  text-[34px] tracking-[-0.03em] text-black sm:text-[40px]">
        {title}
      </p>
      <p className="mt-3 max-w-[320px] text-[10px] leading-[1.7] text-black/44">
        {description}
      </p>
    </div>
  );
}

function EmptyProducts({ resetFilters }: { resetFilters: () => void }) {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 grid size-14 place-items-center border border-black/8">
        <SearchIcon className="size-5 text-black/28" />
      </div>
      <p className="  text-[34px] tracking-[-0.03em] text-black sm:text-[40px]">
        محصولی پیدا نشد
      </p>
      <p className="mt-3 max-w-[320px] text-[10px] leading-[1.7] text-black/44">
        فیلترها را تغییر دهید تا محصولات بیشتری از فروشگاه نمایش داده شود.
      </p>
      <div className="mt-7">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={resetFilters}
        >
          پاک‌کردن فیلترها
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INTERSTITIAL BANNERS
   ═══════════════════════════════════════════════════════════ */

function InterstitialBanner({ banner }: { banner: ShopBanner }) {
  const isDark = banner.theme === "dark";
  return (
    <section className="group relative col-span-full overflow-hidden">
      <div className="relative aspect-[21/7] min-h-[300px] overflow-hidden xl:min-h-[360px]">
        <Image
          src={banner.image}
          alt={banner.title}
          fill
          sizes="(max-width: 1920px) 100vw, 1610px"
          className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
          style={{ objectPosition: banner.imagePosition ?? "center" }}
        />
        <div
          aria-hidden="true"
          className={`absolute inset-0 ${
            isDark
              ? "bg-gradient-to-l from-black/78 via-black/42 to-black/8"
              : "bg-gradient-to-l from-white/88 via-white/54 to-white/10"
          }`}
        />
        <div className="absolute inset-0 flex items-center">
          <div className="w-full max-w-[570px] px-10 text-right xl:px-14">
            {banner.badge && (
              <div className="mb-5 flex items-center gap-3 text-[6px] font-semibold uppercase tracking-[0.2em] text-[var(--shop-copper)]">
                <span className="h-px w-6 bg-[var(--shop-copper)]" />
                {banner.badge}
              </div>
            )}
            <p
              className={`text-[8px] font-semibold uppercase tracking-[0.19em] ${
                isDark ? "text-white/48" : "text-black/40"
              }`}
            >
              {banner.subtitle}
            </p>
            <h3
              className={`mt-3   text-[38px] font-normal leading-[1.04] tracking-[-0.025em] xl:text-[46px] ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              {banner.title.split("\n").map((line, i) => (
                <span key={`${line}-${i}`}>
                  {line}
                  {i < banner.title.split("\n").length - 1 && <br />}
                </span>
              ))}
            </h3>
            <p
              className={`mt-4 max-w-[390px] text-[10px] leading-[1.8] xl:text-[11px] ${
                isDark ? "text-white/54" : "text-black/48"
              }`}
            >
              {banner.description}
            </p>
            <div className="mt-7">
              <Button href={banner.ctaHref} variant="cream" size="md">
                {banner.ctaText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InterstitialBannerMobile({ banner }: { banner: ShopBanner }) {
  const isDark = banner.theme === "dark";
  return (
    <section className="relative col-span-full overflow-hidden">
      <div className="relative aspect-[4/5] min-h-[420px] overflow-hidden sm:aspect-[3/4] sm:min-h-[480px]">
        <Image
          src={banner.image}
          alt={banner.title}
          fill
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: banner.imagePosition ?? "center" }}
        />
        <div
          aria-hidden="true"
          className={`absolute inset-0 ${
            isDark
              ? "bg-gradient-to-t from-black/82 via-black/28 to-black/8"
              : "bg-gradient-to-t from-white/90 via-white/38 to-white/12"
          }`}
        />
        <div className="absolute inset-0 flex items-end">
          <div className="w-full p-6 pb-8 text-right sm:p-8 sm:pb-10">
            {banner.badge && (
              <div className="mb-4 flex items-center gap-2 text-[6px] font-semibold uppercase tracking-[0.18em] text-[var(--shop-copper)]">
                <span className="h-px w-5 bg-[var(--shop-copper)]" />
                {banner.badge}
              </div>
            )}
            <p
              className={`text-[7px] font-semibold uppercase tracking-[0.17em] ${
                isDark ? "text-white/44" : "text-black/36"
              }`}
            >
              {banner.subtitle}
            </p>
            <h3
              className={`mt-2   text-[30px] font-normal leading-[1.06] tracking-[-0.02em] sm:text-[36px] ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              {banner.title.split("\n").map((line, i) => (
                <span key={`${line}-${i}`}>
                  {line}
                  {i < banner.title.split("\n").length - 1 && <br />}
                </span>
              ))}
            </h3>
            <p
              className={`mt-3 max-w-[310px] text-[9px] leading-[1.75] sm:text-[10px] ${
                isDark ? "text-white/50" : "text-black/44"
              }`}
            >
              {banner.description}
            </p>
            <div className="mt-5">
              <Button href={banner.ctaHref} variant="cream" size="md">
                {banner.ctaText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   ICONS
   ═══════════════════════════════════════════════════════════ */

function SortIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" className="size-4">
      <path d="M3 5H12" stroke="currentColor" strokeWidth="1.1" />
      <path d="M3 9H10" stroke="currentColor" strokeWidth="1.1" />
      <path d="M3 13H8" stroke="currentColor" strokeWidth="1.1" />
      <path
        d="M13.5 4V13M11.5 11L13.5 13L15.5 11"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
function FilterIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" className="size-4">
      <path d="M2 5H16M2 13H16" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="6" cy="5" r="1.5" stroke="currentColor" strokeWidth="1" />
      <circle cx="12" cy="13" r="1.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" className="size-5">
      <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3">
      <path
        d="M10.5 3L5.5 8L10.5 13"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
function ArrowRightSmallIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3">
      <path
        d="M5.5 3L10.5 8L5.5 13"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
function ChevronQuickIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={`size-3 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        open ? "rotate-180" : "rotate-0"
      }`}
    >
      <path
        d="M3 6L8 11L13 6"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 16L20 20" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill={filled ? "currentColor" : "none"}
      aria-hidden="true"
      className="size-[13px]"
    >
      <path
        d="M10 16.3L4 10.7C1.2 8.1 2.7 4 6.3 4C8 4 9.2 4.9 10 6C10.8 4.9 12 4 13.7 4C17.3 4 18.8 8.1 16 10.7L10 16.3Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
function AddedCheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3">
      <path
        d="M3 8.2L6.4 11.2L13 4.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
