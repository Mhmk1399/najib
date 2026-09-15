import type { Metadata } from "next";
import { ProductDetailClient } from "@/components/static/Shop/Product/ProductDetailClient";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  return <ProductDetailClient slug={slug} />;
}

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `${decodeURIComponent(slug)} | Najibzadeh`,
    description: "جزئیات محصول فروشگاه نجیب‌زاده.",
  };
}
