import "server-only";

import { createHash } from "node:crypto";
import mongoose, { type ClientSession } from "mongoose";
import { CATALOG_CURRENCY } from "@/lib/catalog/currency";
import { connectToDatabase } from "@/lib/server/db";
import { badRequest, conflict } from "@/lib/server/errors";
import { StaffAudit } from "@/models/auth/staff-audit";
import { Category } from "@/models/catalog/category";
import { Color } from "@/models/catalog/color";
import { ImageAsset } from "@/models/catalog/image-asset";
import { ProductCreateRequest } from "@/models/catalog/product-create-request";
import { ProductVariant } from "@/models/catalog/product-variant";
import { Product } from "@/models/catalog/product";
import { Size } from "@/models/catalog/size";
import { Subcategory } from "@/models/catalog/subcategory";
import { InventoryLocation } from "@/models/inventory/inventory-location";
import { adjustInventoryInSession } from "@/services/inventory/service";
import { completeProductSchema, type CompleteProductInput } from "./product-composer-schema";

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonicalize(item)]));
  return value;
}

function requestHash(input: CompleteProductInput) {
  return createHash("sha256").update(JSON.stringify(canonicalize(input))).digest("hex");
}

async function validateReferences(input: CompleteProductInput, session: ClientSession) {
  const colorIds = [...new Set(input.variants.map((item) => item.colorId))];
  const sizeIds = [...new Set(input.variants.map((item) => item.sizeId))];
  const locationIds = [...new Set(input.stock.filter((item) => item.quantity > 0).map((item) => item.locationId))];
  const [category, subcategory, colorCount, sizeCount, locationCount, imageCount] = await Promise.all([
    Category.exists({ _id: input.product.categoryId, isActive: true }).session(session),
    Subcategory.findOne({ _id: input.product.subcategoryId, categoryId: input.product.categoryId, isActive: true }).session(session).lean(),
    Color.countDocuments({ _id: { $in: colorIds }, isActive: true }).session(session),
    Size.countDocuments({ _id: { $in: sizeIds }, isActive: true }).session(session),
    InventoryLocation.countDocuments({ _id: { $in: locationIds }, isActive: true }).session(session),
    input.product.primaryImageId ? ImageAsset.countDocuments({ _id: input.product.primaryImageId, isActive: true }).session(session) : Promise.resolve(1),
  ]);
  if (!category) badRequest("دسته‌بندی فعال پیدا نشد.");
  if (!subcategory) badRequest("زیردسته فعال نیست یا به دسته انتخاب‌شده تعلق ندارد.");
  if (colorCount !== colorIds.length) badRequest("یک یا چند رنگ فعال پیدا نشد.");
  if (sizeCount !== sizeIds.length) badRequest("یک یا چند سایز فعال پیدا نشد.");
  if (locationCount !== locationIds.length) badRequest("یک یا چند شعبه یا انبار فعال پیدا نشد.");
  if (!imageCount) badRequest("تصویر اصلی فعال پیدا نشد.");
  return { colorIds, sizeIds };
}

function duplicate(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

type StoredRequest = {
  requestHash: string;
  result: Record<string, unknown>;
};

export const productComposerService = {
  parse(value: unknown) { return completeProductSchema.parse(value); },

  async create(value: CompleteProductInput, actorId: string) {
    await connectToDatabase();
    const hash = requestHash(value);
    const previous = await ProductCreateRequest.findOne({ key: value.idempotencyKey }).lean() as StoredRequest | null;
    if (previous) {
      if (previous.requestHash !== hash) conflict("این کلید ثبت قبلاً برای محصول دیگری استفاده شده است.");
      return { ...(previous.result as Record<string, unknown>), idempotent: true };
    }

    try {
      return await mongoose.connection.transaction(async (session) => {
        const replay = await ProductCreateRequest.findOne({ key: value.idempotencyKey }).session(session).lean() as StoredRequest | null;
        if (replay) {
          if (replay.requestHash !== hash) conflict("این کلید ثبت قبلاً برای محصول دیگری استفاده شده است.");
          return { ...(replay.result as Record<string, unknown>), idempotent: true };
        }
        const { colorIds, sizeIds } = await validateReferences(value, session);
        const [product] = await Product.create([{ ...value.product, basePriceMinor: value.product.priceIrrMinor, currency: CATALOG_CURRENCY, colorIds, sizeIds, collectionIds: [], imageIds: [], material: { fa: [], en: [], ar: [] }, seasons: { fa: [], en: [], ar: [] }, occasions: { fa: [], en: [], ar: [] }, styleTags: { fa: [], en: [], ar: [] } }], { session });
        const variants = await ProductVariant.create(value.variants.map((item) => ({ ...item, productId: product._id, sku: item.sku.toUpperCase(), isActive: true })), { session });
        // Preserve newly introduced fields while Next dev still holds an older cached Mongoose model.
        await Product.collection.updateOne({ _id: product._id }, { $set: { priceIrrMinor: value.product.priceIrrMinor, priceUsdMinor: value.product.priceUsdMinor } }, { session });
        for (const [index, variant] of variants.entries()) {
          const source = value.variants[index];
          await ProductVariant.collection.updateOne({ _id: variant._id }, { $set: { ...(source.priceOverrideIrrMinor === undefined ? {} : { priceOverrideIrrMinor: source.priceOverrideIrrMinor }), ...(source.priceOverrideUsdMinor === undefined ? {} : { priceOverrideUsdMinor: source.priceOverrideUsdMinor }) } }, { session });
        }
        const variantByKey = new Map(variants.map((variant) => [`${variant.colorId}:${variant.sizeId}`, variant]));
        let totalUnits = 0;
        for (const [index, row] of value.stock.entries()) {
          if (row.quantity === 0) continue;
          const variant = variantByKey.get(row.variantKey);
          if (!variant) badRequest("تنوع مربوط به موجودی پیدا نشد.");
          await adjustInventoryInSession({ idempotencyKey: `${value.idempotencyKey}:stock:${index}`, variantId: variant.id, locationId: row.locationId, delta: row.quantity, reason: "موجودی اولیه هنگام ساخت محصول" }, actorId, session, false);
          totalUnits += row.quantity;
        }
        await StaffAudit.create([{ userId: actorId, action: "catalog.product.complete.create", outcome: "success", reason: "ساخت یکپارچه محصول و موجودی اولیه", targetType: "product", targetId: product.id }], { session });
        const result = { product: product.toObject(), variants: variants.map((item) => item.toObject()), totalUnits, currency: CATALOG_CURRENCY, idempotent: false };
        await ProductCreateRequest.create([{ key: value.idempotencyKey, requestHash: hash, productId: product._id, result }], { session });
        return result;
      });
    } catch (error) {
      if (duplicate(error)) {
        const replay = await ProductCreateRequest.findOne({ key: value.idempotencyKey }).lean() as StoredRequest | null;
        if (replay) {
          if (replay.requestHash !== hash) conflict("این کلید ثبت قبلاً برای محصول دیگری استفاده شده است.");
          return { ...replay.result, idempotent: true };
        }
        conflict("شناسه URL، کد کالا یا بارکد قبلاً استفاده شده است.");
      }
      throw error;
    }
  },
};
