import "server-only";

import { connectToDatabase } from "@/lib/server/db";
import { Category } from "@/models/catalog/category";
import { ImageAsset } from "@/models/catalog/image-asset";
import { Product } from "@/models/catalog/product";
import { Subcategory } from "@/models/catalog/subcategory";

type ProductListInput = {
  categoryId?: string;
  subcategoryId?: string;
  limit?: number;
};

function toPlainJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function getStorefrontCatalog() {
  await connectToDatabase();

  const [categories, subcategories, images] = await Promise.all([
    Category.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean(),
    Subcategory.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean(),
    ImageAsset.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean(),
  ]);

  return toPlainJson({
    categories,
    subcategories,
    images,
  });
}

export async function getStorefrontProducts(input: ProductListInput = {}) {
  await connectToDatabase();

  const filter: Record<string, unknown> = {
    status: "active",
  };

  if (input.categoryId) filter.categoryId = input.categoryId;
  if (input.subcategoryId) filter.subcategoryId = input.subcategoryId;

  const limit = Math.min(Math.max(input.limit ?? 48, 1), 100);
  const products = await Product.find(filter)
    .sort({ sortOrder: 1, createdAt: -1 })
    .limit(limit)
    .lean();

  return toPlainJson({
    items: products,
    pagination: {
      page: 1,
      limit,
      total: products.length,
      pages: products.length > 0 ? 1 : 0,
    },
  });
}
