import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryPageClient } from "@/components/static/Category/CategoryPageClient";
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

function localizedTitle(value: unknown, fallback: string) {
  if (!value || typeof value !== "object") return fallback;
  const record = value as Record<string, unknown>;
  return (
    (typeof record.fa === "string" && record.fa.trim()) ||
    (typeof record.en === "string" && record.en.trim()) ||
    fallback
  );
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const slug = normalizeSlug(categorySlug);

  if (!slug) notFound();

  const category = await getStorefrontCategoryRoute(slug);

  if (!category) notFound();

  return {
    title: `${localizedTitle(category.name, slug)} | Najibzadeh`,
    description: "دسته‌بندی‌های فعال فروشگاه نجیب‌زاده.",
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const slug = normalizeSlug(categorySlug);

  if (!slug) notFound();

  const category = await getStorefrontCategoryRoute(slug);

  if (!category) notFound();

  return <CategoryPageClient categorySlug={slug} />;
}
