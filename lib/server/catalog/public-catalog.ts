import "server-only";
import mongoose from "mongoose";
import { z } from "zod";
import { connectToDatabase } from "@/lib/server/db";
import { notFound } from "@/lib/server/errors";
import { Category } from "@/models/catalog/category";
import { Collection } from "@/models/catalog/collection";
import { Product } from "@/models/catalog/product";

const slugSchema = z.string().trim().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const publicProductQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().regex(/^[a-f\d]{24}$/i).optional(),
  category: slugSchema.optional(),
  collection: slugSchema.optional(),
  q: z.string().trim().min(2).max(80).optional(),
}).strict();

const productCardFields = {
  name: 1,
  slug: 1,
  basePriceMinor: 1,
  currency: 1,
  categoryId: 1,
  subcategoryId: 1,
  collectionIds: 1,
  primaryImageId: 1,
  primaryImageObjectFit: 1,
  primaryImageObjectPosition: 1,
  material: 1,
  fit: 1,
  updatedAt: 1,
} as const;

export type PublicProductQuery = z.infer<typeof publicProductQuerySchema>;

export async function listPublicProducts(query: PublicProductQuery) {
  await connectToDatabase();

  const [category, collection] = await Promise.all([
    query.category
      ? Category.findOne({ slug: query.category, isActive: true }).select({ _id: 1 }).lean()
      : Promise.resolve(undefined),
    query.collection
      ? Collection.findOne({ slug: query.collection, isActive: true }).select({ _id: 1 }).lean()
      : Promise.resolve(undefined),
  ]);
  const categoryRecord = category as { _id?: unknown } | null | undefined;
  const collectionRecord = collection as { _id?: unknown } | null | undefined;
  const categoryId = query.category ? categoryRecord?._id ?? null : undefined;
  const collectionId = query.collection ? collectionRecord?._id ?? null : undefined;

  if (categoryId === null || collectionId === null) {
    return { items: [], nextCursor: null };
  }

  const filter: Record<string, unknown> = { status: "active" };
  if (categoryId) filter.categoryId = categoryId;
  if (collectionId) filter.collectionIds = collectionId;
  if (query.cursor) filter._id = { $lt: new mongoose.Types.ObjectId(query.cursor) };
  if (query.q) filter.$text = { $search: query.q };

  const sort: Record<string, -1 | { $meta: "textScore" }> = query.q
    ? { score: { $meta: "textScore" } }
    : { _id: -1 };
  const projection = query.q
    ? { ...productCardFields, score: { $meta: "textScore" as const } }
    : productCardFields;
  const items = await Product.find(filter)
    .select(projection)
    .sort(sort)
    .limit(query.limit + 1)
    .lean();

  const hasMore = items.length > query.limit;
  if (hasMore) items.pop();
  const lastItem = items.at(-1) as { _id?: mongoose.Types.ObjectId } | undefined;

  return {
    items,
    nextCursor: !query.q && hasMore && lastItem?._id ? String(lastItem._id) : null,
  };
}

export async function getPublicProduct(slug: string) {
  await connectToDatabase();
  const product = await Product.findOne({ slug: slugSchema.parse(slug), status: "active" }).lean();
  if (!product) notFound("Product was not found.");
  return product;
}

export async function listPublicCategories() {
  await connectToDatabase();
  return Category.find({ isActive: true })
    .select({
      name: 1,
      slug: 1,
      description: 1,
      thumbnailImageId: 1,
      thumbnailObjectFit: 1,
      thumbnailObjectPosition: 1,
      sortOrder: 1,
    })
    .sort({ sortOrder: 1, _id: 1 })
    .lean();
}

export async function getPublicCategory(slug: string) {
  await connectToDatabase();
  const category = await Category.findOne({ slug: slugSchema.parse(slug), isActive: true }).lean();
  if (!category) notFound("Category was not found.");
  return category;
}
