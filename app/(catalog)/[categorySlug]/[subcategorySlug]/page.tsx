import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SubcategoryLandingPage } from "@/components/static/Category/SubcategoryLandingPage";

import {
  getSubcategoryLandingPageBySlug,
  getSubcategoryLandingStaticParams,
} from "@/data/fake-subcategory-pages";

type SubcategoryPageProps = {
  params: Promise<{
    categorySlug: string;
    subcategorySlug: string;
  }>;
};

export const dynamicParams = true;
export const revalidate = 300;

export async function generateStaticParams() {
  return getSubcategoryLandingStaticParams();
}

export async function generateMetadata({
  params,
}: SubcategoryPageProps): Promise<Metadata> {
  const { categorySlug, subcategorySlug } = await params;
  const data = await getSubcategoryLandingPageBySlug(
    categorySlug,
    subcategorySlug,
  );

  if (!data) {
    return {
      title: "Subcategory not found | Najibzadeh",
    };
  }

  return {
    title: `${data.name} | ${data.categoryName} | Najibzadeh`,
    description: data.hero.description,
  };
}

export default async function SubcategoryPage({
  params,
}: SubcategoryPageProps) {
  const { categorySlug, subcategorySlug } = await params;
  const data = await getSubcategoryLandingPageBySlug(
    categorySlug,
    subcategorySlug,
  );

  if (!data) {
    notFound();
  }

  return <SubcategoryLandingPage data={data} />;
}
