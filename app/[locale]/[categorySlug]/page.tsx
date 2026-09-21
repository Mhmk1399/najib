import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryPageClient } from "@/components/static/Category/CategoryPageClient";
import { catalogPageCopy } from "@/lib/i18n/catalog-page-copy";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { localeAlternates, localizedOpenGraph } from "@/lib/i18n/metadata";
import { getStorefrontCategoryRoute } from "@/services/catalog/storefront";

type CategoryPageProps = {
  params: Promise<{
    locale: string;
    categorySlug: string;
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
}: CategoryPageProps): Promise<Metadata> {
  const { categorySlug, locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const slug = normalizeSlug(categorySlug);

  if (!isLocale(localeParam) || !slug) notFound();

  const category = await getStorefrontCategoryRoute(slug);

  if (!category) notFound();

  const copy = catalogPageCopy[locale];
  const categoryRecord = category as Record<string, unknown>;
  const title = localizedText(categoryRecord.name, locale, slug);
  const description = localizedText(
    categoryRecord.description,
    locale,
    copy.metadata.categoryDescription(title),
  );
  const pathname = `/${slug}`;
  const imageUrl = metadataImageUrl(categoryRecord.metadataImage);

  return {
    title: `${title} | Najibzadeh`,
    description,
    alternates: localeAlternates(pathname, locale),
    openGraph: {
      ...localizedOpenGraph(locale),
      title: `${title} | Najibzadeh`,
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
      title: `${title} | Najibzadeh`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug, locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const slug = normalizeSlug(categorySlug);

  if (!isLocale(localeParam) || !slug) notFound();

  const category = await getStorefrontCategoryRoute(slug);

  if (!category) notFound();

  return <CategoryPageClient categorySlug={slug} locale={locale} />;
}
