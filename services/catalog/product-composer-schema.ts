import { z } from "zod";
import { imageObjectFits, imageObjectPositions } from "@/lib/catalog/image-presentation";
import { localizedTextSchema, objectIdSchema } from "@/services/catalog/schemas";

const key = z.string().trim().min(8).max(160).regex(/^[A-Za-z0-9._:-]+$/);

const product = z.object({
  name: localizedTextSchema(160),
  slug: z.string().trim().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: localizedTextSchema(12000, 0),
  categoryId: objectIdSchema,
  subcategoryId: objectIdSchema,
  priceIrrMinor: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  priceUsdMinor: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  status: z.enum(["draft", "active"]).default("draft"),
  primaryImageId: objectIdSchema.nullable().optional(),
  primaryImageObjectFit: z.enum(imageObjectFits).default("cover"),
  primaryImageObjectPosition: z.enum(imageObjectPositions).default("center"),
}).strict();

const variant = z.object({
  colorId: objectIdSchema,
  sizeId: objectIdSchema,
  sku: z.string().trim().min(1).max(80).regex(/^[A-Za-z0-9._-]+$/),
  barcode: z.string().trim().max(120).optional(),
  priceOverrideIrrMinor: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).optional(),
  priceOverrideUsdMinor: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).optional(),
}).strict();

const stock = z.object({
  variantKey: z.string().trim().min(1).max(80),
  locationId: objectIdSchema,
  quantity: z.number().int().nonnegative().max(1_000_000),
}).strict();

export const completeProductSchema = z.object({
  idempotencyKey: key,
  product,
  variants: z.array(variant).min(1).max(100),
  stock: z.array(stock).max(1000),
}).strict().superRefine((value, context) => {
  const combinations = new Set<string>();
  const skus = new Set<string>();
  for (const [index, item] of value.variants.entries()) {
    const combination = `${item.colorId}:${item.sizeId}`;
    const sku = item.sku.toUpperCase();
    if (combinations.has(combination)) context.addIssue({ code: "custom", path: ["variants", index], message: "ترکیب رنگ و سایز تکراری است." });
    if (skus.has(sku)) context.addIssue({ code: "custom", path: ["variants", index, "sku"], message: "کد کالا تکراری است." });
    combinations.add(combination);
    skus.add(sku);
  }
  const variantKeys = new Set(value.variants.map((item) => `${item.colorId}:${item.sizeId}`));
  const stockKeys = new Set<string>();
  for (const [index, item] of value.stock.entries()) {
    if (!variantKeys.has(item.variantKey)) context.addIssue({ code: "custom", path: ["stock", index, "variantKey"], message: "تنوع مربوط به موجودی پیدا نشد." });
    const unique = `${item.variantKey}:${item.locationId}`;
    if (stockKeys.has(unique)) context.addIssue({ code: "custom", path: ["stock", index], message: "موجودی این تنوع و محل تکراری است." });
    stockKeys.add(unique);
  }
});

export type CompleteProductInput = z.infer<typeof completeProductSchema>;
