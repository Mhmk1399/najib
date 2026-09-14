import type { Metadata } from "next";

import { SubcategoryPageClient } from "@/components/static/Category/CategoryPageClient";

type SubcategoryPageProps = {
  params: Promise<{
    categorySlug: string;
    subcategorySlug: string;
  }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: SubcategoryPageProps): Promise<Metadata> {
  const { categorySlug, subcategorySlug } = await params;

  return {
    title: `${decodeURIComponent(subcategorySlug)} | ${decodeURIComponent(
      categorySlug,
    )} | Najibzadeh`,
    description: "زیردسته‌های فعال فروشگاه نجیب‌زاده.",
  };
}

export default async function SubcategoryPage({
  params,
}: SubcategoryPageProps) {
  const { categorySlug, subcategorySlug } = await params;

  return (
    <SubcategoryPageClient
      categorySlug={categorySlug}
      subcategorySlug={subcategorySlug}
    />
  );
}
