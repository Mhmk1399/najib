import { ProductDetailPage } from "@/components/static/Shop/Product/ProductDetailPage";
import {
  getShopProductDetailBySlug,
  getShopProductStaticParams,
} from "@/data/fake-product-detail";
import { notFound } from "next/navigation";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = getShopProductDetailBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailPage product={product} />;
}

export function generateStaticParams() {
  return getShopProductStaticParams();
}
