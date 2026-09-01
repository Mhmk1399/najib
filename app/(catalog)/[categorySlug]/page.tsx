import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryLandingPage } from "@/components/static/Category/CategoryLandingPage";

import {
  getCategoryLandingPageBySlug,
  getCategoryLandingStaticParams,
} from "@/data/fake-category-pages";

type CategoryPageProps = {
  params: Promise<{
    categorySlug: string;
  }>;
};

export const dynamicParams = true;
export const revalidate = 300;

export async function generateStaticParams() {
  return getCategoryLandingStaticParams();
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const data = await getCategoryLandingPageBySlug(categorySlug);

  if (!data) {
    return {
      title: "Category not found | Najibzadeh",
    };
  }

  return {
    title: `${data.name} | Najibzadeh`,
    description: data.hero.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const data = await getCategoryLandingPageBySlug(categorySlug);

  if (!data) {
    notFound();
  }

  return <CategoryLandingPage data={data} />;
}
