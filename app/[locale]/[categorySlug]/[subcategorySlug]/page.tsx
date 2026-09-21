import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SubcategoryPageClient } from "@/components/static/Category/CategoryPageClient";
import { catalogPageCopy } from "@/lib/i18n/catalog-page-copy";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { localeAlternates, localizedOpenGraph } from "@/lib/i18n/metadata";
import { getStorefrontSubcategoryRoute } from "@/services/catalog/storefront";

type SubcategoryPageProps = {
  params: Promise<{
    locale: string;
    categorySlug: string;
    subcategorySlug: string;
  }>;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

function metadataImageUrl(value: unknown) {
  if (!value || typeof value !== "object") return "/assets/images/banner.webp";
  const record = value as Record<string, unknown>;
  return typeof record.url === "string" && record.url.trim()
    ? record.url
    : "/assets/images/banner.webp";
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: SubcategoryPageProps): Promise<Metadata> {
  const { categorySlug, locale: localeParam, subcategorySlug } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const category = normalizeSlug(categorySlug);
  const subcategory = normalizeSlug(subcategorySlug);

  if (!isLocale(localeParam) || !category || !subcategory) notFound();

  const route = await getStorefrontSubcategoryRoute(category, subcategory);

  if (!route) notFound();

  const copy = catalogPageCopy[locale];
  const routeRecord = route as Record<string, unknown>;
  const categoryRecord = route.category as Record<string, unknown>;
  const subcategoryRecord = route.subcategory as Record<string, unknown>;
  const categoryTitle = localizedText(categoryRecord.name, locale, category);
  const title = localizedText(subcategoryRecord.name, locale, subcategory);
  const description = localizedText(
    subcategoryRecord.description,
    locale,
    copy.metadata.subcategoryDescription(title, categoryTitle),
  );
  const pathname = `/${category}/${subcategory}`;
  const imageUrl = metadataImageUrl(routeRecord.metadataImage);

  return {
    title: `${title} | ${categoryTitle} | Najibzadeh`,
    description,
    alternates: localeAlternates(pathname, locale),
    openGraph: {
      ...localizedOpenGraph(locale),
      title: `${title} | ${categoryTitle} | Najibzadeh`,
      description,
      url: `/${locale}${pathname}`,
      images: [
        {
          url: imageUrl,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${categoryTitle} | Najibzadeh`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function SubcategoryPage({
  params,
}: SubcategoryPageProps) {
  const { categorySlug, locale: localeParam, subcategorySlug } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const category = normalizeSlug(categorySlug);
  const subcategory = normalizeSlug(subcategorySlug);

  if (!isLocale(localeParam) || !category || !subcategory) notFound();

  const route = await getStorefrontSubcategoryRoute(category, subcategory);

  if (!route) notFound();

  return (
    <SubcategoryPageClient
      categorySlug={category}
      locale={locale}
      subcategorySlug={subcategory}
    />
  );
}
