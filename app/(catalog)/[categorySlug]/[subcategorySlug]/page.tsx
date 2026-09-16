import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SubcategoryPageClient } from "@/components/static/Category/CategoryPageClient";
import { getStorefrontSubcategoryRoute } from "@/services/catalog/storefront";

type SubcategoryPageProps = {
  params: Promise<{
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
}: SubcategoryPageProps): Promise<Metadata> {
  const { categorySlug, subcategorySlug } = await params;
  const category = normalizeSlug(categorySlug);
  const subcategory = normalizeSlug(subcategorySlug);

  if (!category || !subcategory) notFound();

  const route = await getStorefrontSubcategoryRoute(category, subcategory);

  if (!route) notFound();

  return {
    title: `${localizedTitle(route.subcategory.name, subcategory)} | ${localizedTitle(
      route.category.name,
      category,
    )} | Najibzadeh`,
    description: "زیردسته‌های فعال فروشگاه نجیب‌زاده.",
  };
}

export default async function SubcategoryPage({
  params,
}: SubcategoryPageProps) {
  const { categorySlug, subcategorySlug } = await params;
  const category = normalizeSlug(categorySlug);
  const subcategory = normalizeSlug(subcategorySlug);

  if (!category || !subcategory) notFound();

  const route = await getStorefrontSubcategoryRoute(category, subcategory);

  if (!route) notFound();

  return (
    <SubcategoryPageClient
      categorySlug={category}
      subcategorySlug={subcategory}
    />
  );
}
