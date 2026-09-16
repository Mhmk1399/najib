import "server-only";

import { connectToDatabase } from "@/lib/server/db";
import { notFound } from "@/lib/server/errors";
import { Category } from "@/models/catalog/category";
import { Color } from "@/models/catalog/color";
import { ImageAsset } from "@/models/catalog/image-asset";
import { Product } from "@/models/catalog/product";
import { ProductVariant } from "@/models/catalog/product-variant";
import { Size } from "@/models/catalog/size";
import { Subcategory } from "@/models/catalog/subcategory";

type ProductListInput = {
  categoryId?: string;
  subcategoryId?: string;
  limit?: number;
};

type PlainCatalogRecord = Record<string, unknown>;

function toPlainJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function uniqueIds(values: unknown[]) {
  return [
    ...new Set(
      values
        .filter(Boolean)
        .map(String)
        .filter(Boolean),
    ),
  ];
}

function recordIds(value: unknown) {
  return Array.isArray(value) ? value.filter(Boolean).map(String) : [];
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

export async function getStorefrontCategoryRoute(slug: string) {
  await connectToDatabase();

  const category = await Category.findOne({ slug, isActive: true })
    .select({ name: 1, slug: 1 })
    .lean();

  return category ? toPlainJson(category as PlainCatalogRecord) : null;
}

export async function getStorefrontSubcategoryRoute(
  categorySlug: string,
  subcategorySlug: string,
) {
  await connectToDatabase();

  const category = (await Category.findOne({
    slug: categorySlug,
    isActive: true,
  })
    .select({ name: 1, slug: 1 })
    .lean()) as PlainCatalogRecord | null;

  if (!category) return null;

  const subcategory = (await Subcategory.findOne({
    slug: subcategorySlug,
    categoryId: category._id,
    isActive: true,
  })
    .select({ name: 1, slug: 1, categoryId: 1 })
    .lean()) as PlainCatalogRecord | null;

  if (!subcategory) return null;

  return toPlainJson({ category, subcategory });
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
    .lean() as PlainCatalogRecord[];

  const productIds = products.map((product) => String(product._id));
  const variants = productIds.length
    ? await ProductVariant.find({ productId: { $in: productIds }, isActive: true })
        .select({ productId: 1, colorId: 1, sizeId: 1 })
        .lean() as PlainCatalogRecord[]
    : [];

  const variantsByProduct = new Map<string, PlainCatalogRecord[]>();
  for (const variant of variants) {
    const key = String(variant.productId);
    const items = variantsByProduct.get(key) ?? [];
    items.push(variant);
    variantsByProduct.set(key, items);
  }

  const enrichedProducts = products.map((product) => {
    const productVariants = variantsByProduct.get(String(product._id)) ?? [];
    const colorIds = uniqueIds([
      ...recordIds(product.colorIds),
      ...productVariants.map((variant) => variant.colorId),
    ]);
    const sizeIds = uniqueIds([
      ...recordIds(product.sizeIds),
      ...productVariants.map((variant) => variant.sizeId),
    ]);

    return {
      ...product,
      colorIds,
      sizeIds,
    };
  });

  const colorIds = uniqueIds(
    enrichedProducts.flatMap((product) => recordIds(product.colorIds)),
  );
  const sizeIds = uniqueIds(
    enrichedProducts.flatMap((product) => recordIds(product.sizeIds)),
  );

  const [colors, sizes] = await Promise.all([
    colorIds.length
      ? Color.find({ _id: { $in: colorIds }, isActive: true })
          .sort({ sortOrder: 1, createdAt: -1 })
          .lean()
      : [],
    sizeIds.length
      ? Size.find({ _id: { $in: sizeIds }, isActive: true })
          .sort({ sortOrder: 1, createdAt: -1 })
          .lean()
      : [],
  ]);

  return toPlainJson({
    items: enrichedProducts,
    colors,
    sizes,
    pagination: {
      page: 1,
      limit,
      total: enrichedProducts.length,
      pages: enrichedProducts.length > 0 ? 1 : 0,
    },
  });
}

export async function getStorefrontProductBySlug(slug: string) {
  await connectToDatabase();

  const product = (await Product.findOne({
    slug,
    status: "active",
  }).lean()) as PlainCatalogRecord | null;

  if (!product) notFound("Product was not found.");

  const productId = String(product._id);
  const [variants, category, subcategory, relatedProducts] = await Promise.all([
    ProductVariant.find({ productId, isActive: true })
      .sort({ createdAt: -1 })
      .lean(),
    Category.findById(product.categoryId).lean(),
    Subcategory.findById(product.subcategoryId).lean(),
    Product.find({
      _id: { $ne: product._id },
      status: "active",
      $or: [
        { subcategoryId: product.subcategoryId },
        { categoryId: product.categoryId },
      ],
    })
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(6)
      .lean(),
  ]) as [
    PlainCatalogRecord[],
    PlainCatalogRecord | null,
    PlainCatalogRecord | null,
    PlainCatalogRecord[],
  ];

  const colorIds = uniqueIds([
    ...recordIds(product.colorIds),
    ...variants.map((variant) => variant.colorId),
  ]);
  const sizeIds = uniqueIds([
    ...recordIds(product.sizeIds),
    ...variants.map((variant) => variant.sizeId),
  ]);
  const productImageIds = [
    product.primaryImageId,
    ...(Array.isArray(product.imageIds) ? product.imageIds : []),
    ...relatedProducts.map((item) => item.primaryImageId),
  ].filter(Boolean).map(String);

  const [colors, sizes, images] = await Promise.all([
    colorIds.length
      ? Color.find({ _id: { $in: colorIds }, isActive: true })
          .sort({ sortOrder: 1, createdAt: -1 })
          .lean()
      : [],
    sizeIds.length
      ? Size.find({ _id: { $in: sizeIds }, isActive: true })
          .sort({ sortOrder: 1, createdAt: -1 })
          .lean()
      : [],
    ImageAsset.find({
      isActive: true,
      $or: [
        { _id: { $in: productImageIds } },
        { "linkedProducts.productId": product._id },
      ],
    })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean(),
  ]);

  return toPlainJson({
    product,
    category,
    subcategory,
    variants,
    colors,
    sizes,
    images,
    relatedProducts,
  });
}
