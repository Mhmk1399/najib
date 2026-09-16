"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { BrandSketchLoader } from "@/components/ui/SketchLoader";
import {
  ProductDetailPage,
  type ProductColorVariant,
  type ProductDetailData,
  type ProductDetailImage,
  type ProductDetailSection,
  type ProductSizeOption,
  type RelatedProductItem,
} from "@/components/static/Shop/Product/ProductDetailPage";

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
    throw new Error(body?.error ?? "دریافت محصول ناموفق بود.");
  }

  return (await response.json()) as T;
}

function fa(value: LocalizedText | null | undefined, fallback = "") {
  return value?.fa?.trim() || value?.en?.trim() || value?.ar?.trim() || fallback;
}

function faList(value: LocalizedTextList | null | undefined) {
  return value?.fa?.filter(Boolean) ?? value?.en?.filter(Boolean) ?? [];
}

function idOf(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toString" in value) {
    return String(value);
  }
  return "";
}

function moneyMinor(value: number) {
  return Math.round(value / 100);
}

function imageMapFrom(images: CatalogImageAsset[]) {
  return new Map(images.map((image) => [idOf(image._id), image]));
}

function productImages(
  product: CatalogProductRecord,
  images: CatalogImageAsset[],
): ProductDetailImage[] {
  const imageMap = imageMapFrom(images);
  const imageIds = [
    product.primaryImageId,
    ...(Array.isArray(product.imageIds) ? product.imageIds : []),
  ].filter(Boolean).map(String);
  const uniqueIds = [...new Set(imageIds)];

  const mapped = uniqueIds.reduce<ProductDetailImage[]>(
    (items, imageId, index) => {
      const image = imageMap.get(imageId);
      if (!image?.url) return items;

      items.push({
        id: `${product._id}-${index + 1}`,
        src: image.url,
        alt: fa(image.alt, fa(product.name, product.slug)),
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
          alt: fa(product.name, product.slug),
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
): ProductColorVariant[] {
  if (payload.colors.length === 0) {
    return [
      {
        id: "default",
        name: "اصلی",
        code: payload.product.slug,
        swatch: "#111111",
        images,
      },
    ];
  }

  return payload.colors.map((color, index) => ({
    id: idOf(color._id),
    name: fa(color.name, color.slug),
    code: payload.variants.find(
      (variant) => idOf(variant.colorId) === idOf(color._id),
    )?.sku,
    swatch: color.hex || "#111111",
    images: rotateImages(images, index),
  }));
}

function buildSizes(payload: ProductDetailPayload): ProductSizeOption[] {
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
      label: fa(size.name, size.code),
      disabled: payload.variants.length > 0 && !activeSizeIds.has(idOf(size._id)),
    }));
}

function sentence(items: string[], fallback: string) {
  return items.length ? items.join("، ") : fallback;
}

function buildSections(product: CatalogProductRecord): ProductDetailSection[] {
  const material = faList(product.material);
  const seasons = faList(product.seasons);
  const occasions = faList(product.occasions);
  const styleTags = faList(product.styleTags);
  const specs = [
    product.fit ? `فرم: ${fa(product.fit)}` : "",
    product.silhouette ? `سیلوئت: ${fa(product.silhouette)}` : "",
    product.pattern ? `طرح: ${fa(product.pattern)}` : "",
  ].filter(Boolean);

  return [
    {
      id: "description",
      title: "توضیحات",
      paragraphs: [
        fa(product.description, "توضیحات این محصول به‌زودی تکمیل می‌شود."),
      ],
    },
    {
      id: "materials",
      title: "متریال و ساخت",
      paragraphs: [
        `متریال: ${sentence(material, "اطلاعات متریال ثبت نشده است.")}`,
        specs.length
          ? specs.join("، ")
          : "جزئیات فرم و ساخت این محصول به‌زودی تکمیل می‌شود.",
      ],
    },
    {
      id: "occasion",
      title: "فصل و موقعیت",
      paragraphs: [
        `فصل‌ها: ${sentence(seasons, "برای تمام فصل‌های منتخب.")}`,
        `موقعیت‌ها: ${sentence([...occasions, ...styleTags], "استایل رسمی و روزمره.")}`,
      ],
    },
    {
      id: "shipping",
      title: "ارسال و مرجوعی",
      paragraphs: [
        "ارسال و هماهنگی تحویل طبق شرایط فروشگاه انجام می‌شود.",
        "برای راهنمایی درباره سایز، موجودی یا نگهداری محصول با پشتیبانی تماس بگیرید.",
      ],
    },
  ];
}

function relatedProducts(
  payload: ProductDetailPayload,
  imageMap: Map<string, CatalogImageAsset>,
): RelatedProductItem[] {
  return payload.relatedProducts.slice(0, 3).map((product) => {
    const image = imageMap.get(idOf(product.primaryImageId));
    const name = fa(product.name, product.slug);

    return {
      id: idOf(product._id),
      slug: product.slug,
      name,
      subtitle: fa(product.description),
      price: moneyMinor(product.basePriceMinor),
      currency: product.currency,
      image: image?.url ?? FALLBACK_IMAGE,
      imageAlt: fa(image?.alt, name),
    };
  });
}

function mapProduct(payload: ProductDetailPayload): ProductDetailData {
  const images = productImages(payload.product, payload.images);
  const imageMap = imageMapFrom(payload.images);
  const name = fa(payload.product.name, payload.product.slug);

  return {
    id: idOf(payload.product._id),
    slug: payload.product.slug,
    sku: idOf(payload.product._id).slice(-8).toUpperCase(),
    eyebrow: fa(payload.subcategory?.name, fa(payload.category?.name, "کالکشن")),
    name,
    shortDescription: fa(payload.product.description),
    price: moneyMinor(payload.product.basePriceMinor),
    currency: payload.product.currency,
    colors: buildColors(payload, images),
    sizes: buildSizes(payload),
    sections: buildSections(payload.product),
    shippingNote: "ارسال و پشتیبانی خرید طبق شرایط فروشگاه نجیب‌زاده انجام می‌شود.",
    relatedProducts: relatedProducts(payload, imageMap),
  };
}

export function ProductDetailClient({ slug }: { slug: string }) {
  const query = useQuery({
    queryKey: ["storefront", "product-detail", slug],
    queryFn: ({ signal }) =>
      fetchJson<ProductDetailPayload>(`/api/storefront/products/${slug}`, {
        signal,
      }),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  });

  const product = useMemo(
    () => (query.data ? mapProduct(query.data) : null),
    [query.data],
  );

  if (query.isLoading) {
    return <BrandSketchLoader open label="در حال دریافت محصول" />;
  }

  if (query.isError) {
    return (
      <ProductDetailState
        title="دریافت محصول ناموفق بود"
        description="اتصال دیتابیس یا وضعیت محصول را بررسی کنید."
        actionLabel="تلاش دوباره"
        onAction={() => void query.refetch()}
      />
    );
  }

  if (!product) {
    return (
      <ProductDetailState
        title="محصول پیدا نشد"
        description="این محصول هنوز فعال نشده یا آدرس آن تغییر کرده است."
        actionLabel="بازگشت به فروشگاه"
        href="/shop"
      />
    );
  }

  return <ProductDetailPage product={product} />;
}

function ProductDetailState({
  title,
  description = "چند لحظه صبر کنید.",
  actionLabel,
  href,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  href?: string;
  onAction?: () => void;
}) {
  return (
    <main
      dir="rtl"
      className="grid min-h-screen place-items-center bg-[#F6F2EB] px-6 text-center text-black"
    >
      <div className="max-w-[460px]">
        <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-black/40">
          جزئیات محصول
        </p>
        <h1 className="mt-4 font-serif text-[clamp(2.8rem,12vw,4.8rem)] leading-[0.92] tracking-[-0.05em]">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-[360px] text-[11px] leading-7 text-black/50">
          {description}
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
