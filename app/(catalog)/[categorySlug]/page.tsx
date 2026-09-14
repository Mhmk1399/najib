import type { Metadata } from "next";

import { CategoryPageClient } from "@/components/static/Category/CategoryPageClient";

type CategoryPageProps = {
  params: Promise<{
    categorySlug: string;
  }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;

  return {
    title: `${decodeURIComponent(categorySlug)} | Najibzadeh`,
    description: "دسته‌بندی‌های فعال فروشگاه نجیب‌زاده.",
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;

  return <CategoryPageClient categorySlug={categorySlug} />;
}
