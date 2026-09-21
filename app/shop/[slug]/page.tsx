import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetailClient } from "@/components/static/Shop/Product/ProductDetailClient";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { localeAlternates, localizedOpenGraph } from "@/lib/i18n/metadata";
import { productDetailCopy } from "@/lib/i18n/product-detail-copy";
import { getStorefrontProductBySlug } from "@/services/catalog/storefront";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const fallbackImage = "/assets/images/banner.webp";

function normalizeSlug(value: string) {
  try {
    const slug = decodeURIComponent(value).trim().toLowerCase();
    return slugPattern.test(slug) ? slug : null;
  } catch {
    return null;
  }
}

function localizedText(value: unknown, locale: Locale, fallback = "") {
  if (!value || typeof value !== "object") return fallback;
  const record = value as Record<string, unknown>;
  return (
    (typeof record[locale] === "string" && record[locale].trim()) ||
    (typeof record.fa === "string" && record.fa.trim()) ||
    (typeof record.en === "string" && record.en.trim()) ||
    (typeof record.ar === "string" && record.ar.trim()) ||
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

function productImageUrl(product: Record<string, unknown>) {
  const images = Array.isArray(product.images)
    ? (product.images as Record<string, unknown>[])
    : [];
  const productRecord = product.product as Record<string, unknown> | undefined;
  const primaryImageId = idOf(productRecord?.primaryImageId);
  const primaryImage = images.find((image) => idOf(image._id) === primaryImageId);
  const image = primaryImage ?? images[0];

  return typeof image?.url === "string" && image.url.trim()
    ? image.url
    : fallbackImage;
}

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug: slugParam } = await params;
  const slug = normalizeSlug(slugParam);

  if (!slug) notFound();

  return <ProductDetailClient locale={defaultLocale} slug={slug} />;
}

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug: slugParam } = await params;
  const slug = normalizeSlug(slugParam);

  if (!slug) notFound();

  const payload = (await getStorefrontProductBySlug(slug)) as Record<
    string,
    unknown
  >;
  const product = payload.product as Record<string, unknown> | undefined;
  const copy = productDetailCopy[defaultLocale];
  const title = localizedText(product?.name, defaultLocale, slug);
  const description = localizedText(
    product?.description,
    defaultLocale,
    copy.metadataDescription(title),
  );
  const pathname = `/shop/${slug}`;
  const imageUrl = productImageUrl(payload);

  return {
    title: `${title} | Najibzadeh`,
    description,
    alternates: localeAlternates(pathname, defaultLocale),
    openGraph: {
      ...localizedOpenGraph(defaultLocale),
      title: `${title} | Najibzadeh`,
      description,
      url: `/${defaultLocale}${pathname}`,
      images: [
        {
          url: imageUrl,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Najibzadeh`,
      description,
      images: [imageUrl],
    },
  };
}
