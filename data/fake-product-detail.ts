import {
  SHOP_PRODUCTS,
  getShopProductDetailBySlug,
  getShopProductStaticParams,
} from "@/data/fake-shop-products";

const firstProduct = SHOP_PRODUCTS[0];

const firstProductDetail = getShopProductDetailBySlug(firstProduct.slug);

if (!firstProductDetail) {
  throw new Error("Missing fake product detail.");
}

export const fakeProductDetail = firstProductDetail;

export { getShopProductDetailBySlug, getShopProductStaticParams };
