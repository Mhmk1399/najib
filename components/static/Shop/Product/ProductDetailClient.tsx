"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { amountForCurrencyDisplay } from "@/lib/catalog/currency";

import {
  ProductDetailPage,
  type ProductColorVariant,
  type ProductDetailData,
  type ProductDetailImage,
  type ProductDetailSection,
  type ProductSizeOption,
  type RelatedProductItem,
} from "@/components/static/Shop/Product/ProductDetailPage";
import { Button } from "@/components/ui/Button";
import { BrandSketchLoader } from "@/components/ui/SketchLoader";
import {
  defaultLocale,
  getHtmlLang,
  getLocaleDirection,
  type Locale,
} from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/routes";
import { productDetailCopy } from "@/lib/i18n/product-detail-copy";

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

type CatalogImageAsset = {
  _id: string;
  url: string;
  alt?: LocalizedText;
  objectPosition?: string;
};

type CatalogProductRecord = {
  _id: string;
  name: LocalizedText;
  slug: string;
  description?: LocalizedText;
  categoryId: string;
  subcategoryId: string;
  basePriceMinor: number;
  currency: string;
  material?: LocalizedTextList;
  fit?: LocalizedText | null;
  silhouette?: LocalizedText | null;
  pattern?: LocalizedText | null;
  seasons?: LocalizedTextList;
  occasions?: LocalizedTextList;
  styleTags?: LocalizedTextList;
  primaryImageId?: string | null;
  primaryImageObjectPosition?: string;
  imageIds?: string[];
};

type CatalogTaxonomyRecord = {
  _id: string;
  name: LocalizedText;
  slug: string;
};

type CatalogColorRecord = CatalogTaxonomyRecord & {
  hex?: string;
  swatchImageUrl?: string;
};

type CatalogSizeRecord = {
  _id: string;
  name: LocalizedText;
  code: string;
  sortOrder?: number;
};

type CatalogVariantRecord = {
  _id: string;
  productId: string;
  colorId: string;
  sizeId: string;
  sku: string;
  isActive: boolean;
};

type ProductDetailPayload = {
  product: CatalogProductRecord;
  category?: CatalogTaxonomyRecord | null;
  subcategory?: CatalogTaxonomyRecord | null;
  variants: CatalogVariantRecord[];
  colors: CatalogColorRecord[];
  sizes: CatalogSizeRecord[];
  images: CatalogImageAsset[];
  relatedProducts: CatalogProductRecord[];
};

const FALLBACK_IMAGE = "/assets/images/banner.webp";
const queryOptions = {
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
    throw new Error(body?.error ?? "Product request failed.");
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

function localizedList(
  value: LocalizedTextList | null | undefined,
  locale: Locale,
) {
  return (
    value?.[locale]?.filter(Boolean) ??
    value?.fa?.filter(Boolean) ??
    value?.en?.filter(Boolean) ??
    value?.ar?.filter(Boolean) ??
    []
  );
}

function idOf(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toString" in value) {
    return String(value);
  }
  return "";
}

function moneyMinor(value: number, currency: string) {
  return Math.round(amountForCurrencyDisplay(value, currency));
}

function imageMapFrom(images: CatalogImageAsset[]) {
  return new Map(images.map((image) => [idOf(image._id), image]));
}

function productImages(
  product: CatalogProductRecord,
  images: CatalogImageAsset[],
  locale: Locale,
): ProductDetailImage[] {
  const imageMap = imageMapFrom(images);
  const imageIds = [
    product.primaryImageId,
    ...(Array.isArray(product.imageIds) ? product.imageIds : []),
  ]
    .filter(Boolean)
    .map(String);
  const uniqueIds = [...new Set(imageIds)];
  const productName = localized(product.name, locale, product.slug);

  const mapped = uniqueIds.reduce<ProductDetailImage[]>(
    (items, imageId, index) => {
      const image = imageMap.get(imageId);
      if (!image?.url) return items;

      items.push({
        id: `${product._id}-${index + 1}`,
        src: image.url,
        alt: localized(image.alt, locale, productName),
        position:
          index === 0
            ? product.primaryImageObjectPosition ?? image.objectPosition
            : image.objectPosition,
      });

      return items;
    },
    [],
  );

  return mapped.length
    ? mapped
    : [
        {
          id: `${product._id}-fallback`,
          src: FALLBACK_IMAGE,
          alt: productName,
          position: "center",
        },
      ];
}

function rotateImages(images: ProductDetailImage[], offset: number) {
  if (images.length === 0) return images;
  return images.map((_, index) => images[(index + offset) % images.length]);
}

function buildColors(
  payload: ProductDetailPayload,
  images: ProductDetailImage[],
  locale: Locale,
): ProductColorVariant[] {
  if (payload.colors.length === 0) {
    return [
      {
        id: "default",
        name: productDetailCopy[locale].defaultColor,
        code: payload.product.slug,
        swatch: "#111111",
        images,
      },
    ];
  }

  const activeColorIds = new Set(
    payload.variants
      .filter((variant) => variant.isActive)
      .map((variant) => idOf(variant.colorId)),
  );

  return payload.colors
    .filter(
      (color) => activeColorIds.size === 0 || activeColorIds.has(idOf(color._id)),
    )
    .map((color, index) => ({
      id: idOf(color._id),
      name: localized(color.name, locale, color.slug),
      code: payload.variants.find(
        (variant) => idOf(variant.colorId) === idOf(color._id),
      )?.sku,
      swatch: color.hex || "#111111",
      images: rotateImages(images, index),
    }));
}

function buildSizes(
  payload: ProductDetailPayload,
  locale: Locale,
): ProductSizeOption[] {
  const activeSizeIds = new Set(
    payload.variants
      .filter((variant) => variant.isActive)
      .map((variant) => idOf(variant.sizeId)),
  );

  return payload.sizes
    .slice()
    .sort((first, second) => (first.sortOrder ?? 0) - (second.sortOrder ?? 0))
    .map((size) => ({
      value: idOf(size._id),
      label: localized(size.name, locale, size.code),
      disabled: payload.variants.length > 0 && !activeSizeIds.has(idOf(size._id)),
    }));
}

function sentence(items: string[], fallback: string, locale: Locale) {
  if (!items.length) return fallback;
  return items.join(locale === "en" ? ", " : "، ");
}

function buildSections(
  product: CatalogProductRecord,
  locale: Locale,
): ProductDetailSection[] {
  const copy = productDetailCopy[locale];
  const material = localizedList(product.material, locale);
  const seasons = localizedList(product.seasons, locale);
  const occasions = localizedList(product.occasions, locale);
  const styleTags = localizedList(product.styleTags, locale);
  const specs = [
    product.fit ? `${copy.fitLabel}: ${localized(product.fit, locale)}` : "",
    product.silhouette
      ? `${copy.silhouetteLabel}: ${localized(product.silhouette, locale)}`
      : "",
    product.pattern
      ? `${copy.patternLabel}: ${localized(product.pattern, locale)}`
      : "",
  ].filter(Boolean);

  return [
    {
      id: "description",
      title: copy.sectionDescription,
      paragraphs: [
        localized(product.description, locale, copy.sectionFallbackDescription),
      ],
    },
    {
      id: "materials",
      title: copy.sectionMaterials,
      paragraphs: [
        `${copy.materialLabel}: ${sentence(material, copy.materialFallback, locale)}`,
        specs.length ? specs.join(locale === "en" ? ", " : "، ") : copy.specsFallback,
      ],
    },
    {
      id: "occasion",
      title: copy.sectionOccasion,
      paragraphs: [
        `${copy.seasonsLabel}: ${sentence(seasons, copy.seasonsFallback, locale)}`,
        `${copy.occasionsLabel}: ${sentence(
          [...occasions, ...styleTags],
          copy.occasionsFallback,
          locale,
        )}`,
      ],
    },
    {
      id: "shipping",
      title: copy.sectionShipping,
      paragraphs: copy.shippingParagraphs,
    },
  ];
}

function relatedProducts(
  payload: ProductDetailPayload,
  imageMap: Map<string, CatalogImageAsset>,
  locale: Locale,
): RelatedProductItem[] {
  return payload.relatedProducts.slice(0, 3).map((product) => {
    const image = imageMap.get(idOf(product.primaryImageId));
    const name = localized(product.name, locale, product.slug);

    return {
      id: idOf(product._id),
      slug: product.slug,
      name,
      subtitle: localized(product.description, locale),
      price: moneyMinor(product.basePriceMinor, product.currency),
      currency: product.currency,
      image: image?.url ?? FALLBACK_IMAGE,
      imageAlt: localized(image?.alt, locale, name),
    };
  });
}

function mapProduct(
  payload: ProductDetailPayload,
  locale: Locale,
): ProductDetailData {
  const images = productImages(payload.product, payload.images, locale);
  const imageMap = imageMapFrom(payload.images);
  const copy = productDetailCopy[locale];

  return {
    id: idOf(payload.product._id),
    slug: payload.product.slug,
    sku: idOf(payload.product._id).slice(-8).toUpperCase(),
    eyebrow: localized(
      payload.subcategory?.name,
      locale,
      localized(payload.category?.name, locale, copy.collectionFallback),
    ),
    name: localized(payload.product.name, locale, payload.product.slug),
    shortDescription: localized(payload.product.description, locale),
    price: moneyMinor(payload.product.basePriceMinor, payload.product.currency),
    currency: payload.product.currency,
    colors: buildColors(payload, images, locale),
    sizes: buildSizes(payload, locale),
    variants: payload.variants
      .filter((variant) => variant.isActive)
      .map((variant) => ({
        id: idOf(variant._id),
        colorId: idOf(variant.colorId),
        sizeId: idOf(variant.sizeId),
        sku: variant.sku,
      })),
    sections: buildSections(payload.product, locale),
    shippingNote: copy.shippingNote,
    relatedProducts: relatedProducts(payload, imageMap, locale),
  };
}

export function ProductDetailClient({
  slug,
  locale = defaultLocale,
}: {
  slug: string;
  locale?: Locale;
}) {
  const copy = productDetailCopy[locale];
  const query = useQuery({
    queryKey: ["storefront", "product-detail", locale, slug],
    queryFn: ({ signal }) =>
      fetchJson<ProductDetailPayload>(`/api/storefront/products/${slug}`, {
        signal,
      }),
    ...queryOptions,
  });

  const product = useMemo(
    () => (query.data ? mapProduct(query.data, locale) : null),
    [locale, query.data],
  );

  if (query.isLoading) {
    return <BrandSketchLoader open label={copy.loading} />;
  }

  if (query.isError) {
    return (
      <ProductDetailState
        locale={locale}
        title={copy.loadErrorTitle}
        description={copy.loadErrorDescription}
        actionLabel={copy.retry}
        onAction={() => void query.refetch()}
      />
    );
  }

  if (!product) {
    return (
      <ProductDetailState
        locale={locale}
        title={copy.notFoundTitle}
        description={copy.notFoundDescription}
        actionLabel={copy.backToShop}
        href={localizedHref("/shop", locale)}
      />
    );
  }

  return <ProductDetailPage copy={copy} locale={locale} product={product} />;
}

function ProductDetailState({
  locale,
  title,
  description,
  actionLabel,
  href,
  onAction,
}: {
  locale: Locale;
  title: string;
  description?: string;
  actionLabel?: string;
  href?: string;
  onAction?: () => void;
}) {
  const copy = productDetailCopy[locale];

  return (
    <main
      dir={getLocaleDirection(locale)}
      lang={getHtmlLang(locale)}
      className="grid min-h-screen place-items-center bg-[#F6F2EB] px-6 text-center text-black"
    >
      <div className="max-w-[460px]">
        <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-black/40">
          {copy.stateEyebrow}
        </p>
        <h1 className="mt-4 text-[clamp(2.8rem,12vw,4.8rem)] leading-[0.92] tracking-[-0.05em]">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-[360px] text-[11px] leading-7 text-black/50">
          {description ?? copy.tryAgain}
        </p>
        {actionLabel && (
          <div className="mx-auto mt-8 max-w-[220px]">
            <Button
              href={href}
              onClick={onAction}
              variant="black"
              size="lg"
              fullWidth
            >
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
