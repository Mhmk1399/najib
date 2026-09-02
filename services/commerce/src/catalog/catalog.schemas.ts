import { z } from "zod";
import { mongoObjectIdSchema } from "@najib/contracts";

export const catalogResources = [
  "categories",
  "subcategories",
  "collections",
  "colors",
  "size-groups",
  "sizes",
  "products",
  "variants",
  "images",
] as const;

export type CatalogResource = (typeof catalogResources)[number];

export const objectIdSchema = mongoObjectIdSchema;

export const listCatalogQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).max(120).optional(),
    isActive: z.enum(["true", "false"]).optional(),
    status: z.enum(["draft", "active", "archived"]).optional(),
    categoryId: objectIdSchema.optional(),
    subcategoryId: objectIdSchema.optional(),
    productId: objectIdSchema.optional(),
    sizeGroupId: objectIdSchema.optional(),
    kind: z
      .enum([
        "product",
        "category_banner",
        "subcategory_banner",
        "collection_banner",
        "editorial",
        "lookbook",
      ])
      .optional(),
  })
  .strict();

const name = z.string().trim().min(1).max(160);
const slug = z
  .string()
  .trim()
  .min(1)
  .max(180)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase URL slug");
const optionalObjectId = objectIdSchema.optional();
const sortOrder = z.number().int().default(0);
const active = z.boolean().default(true);

const pageBannerSchema = z
  .object({
    imageId: objectIdSchema,
    eyebrow: z.string().trim().max(120).optional(),
    heading: z.string().trim().min(1).max(200),
    body: z.string().trim().min(1).max(2000),
    ctaLabel: z.string().trim().max(80).optional(),
    ctaHref: z.string().trim().max(500).optional(),
  })
  .strict();

const pageContentSchema = z
  .object({
    firstBanner: pageBannerSchema,
    firstDescription: z.string().trim().min(1).max(4000),
    secondBanner: pageBannerSchema,
    secondDescription: z.string().trim().min(1).max(4000),
  })
  .strict();

const categorySchema = z
  .object({
    name,
    slug,
    description: z.string().trim().max(2000).optional(),
    thumbnailImageId: optionalObjectId,
    pageContent: pageContentSchema,
    isActive: active,
    sortOrder,
  })
  .strict();

const subcategorySchema = categorySchema
  .extend({ categoryId: objectIdSchema })
  .strict();

const collectionSchema = z
  .object({
    name,
    slug,
    description: z.string().trim().max(4000).optional(),
    heroImageId: optionalObjectId,
    isActive: active,
    startsAt: z.coerce.date().optional(),
    endsAt: z.coerce.date().optional(),
    sortOrder,
  })
  .strict();

const colorSchema = z
  .object({
    name,
    slug,
    family: z.string().trim().min(1).max(80),
    hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    swatchImageUrl: z.string().trim().max(2000).optional(),
    isActive: active,
    sortOrder,
  })
  .strict();

const sizeGroupSchema = z
  .object({
    name,
    code: z.string().trim().min(1).max(40),
    isActive: active,
  })
  .strict();

const sizeSchema = z
  .object({
    sizeGroupId: objectIdSchema,
    name,
    code: z.string().trim().min(1).max(40),
    sortOrder,
    isActive: active,
  })
  .strict();

const productSchema = z
  .object({
    name,
    slug,
    description: z.string().trim().min(1).max(12000),
    categoryId: objectIdSchema,
    subcategoryId: objectIdSchema,
    collectionIds: z.array(objectIdSchema).default([]),
    basePriceMinor: z.number().int().nonnegative(),
    currency: z.string().trim().length(3),
    status: z.enum(["draft", "active", "archived"]).default("draft"),
    material: z.array(z.string().trim().min(1)).default([]),
    fit: z.string().trim().max(120).optional(),
    silhouette: z.string().trim().max(120).optional(),
    pattern: z.string().trim().max(120).optional(),
    seasons: z.array(z.string().trim().min(1)).default([]),
    occasions: z.array(z.string().trim().min(1)).default([]),
    styleTags: z.array(z.string().trim().min(1)).default([]),
    primaryImageId: optionalObjectId,
    imageIds: z.array(objectIdSchema).default([]),
  })
  .strict();

const variantSchema = z
  .object({
    productId: objectIdSchema,
    colorId: objectIdSchema,
    sizeId: objectIdSchema,
    sku: z.string().trim().min(1).max(80),
    barcode: z.string().trim().max(120).optional(),
    priceOverrideMinor: z.number().int().nonnegative().optional(),
    isActive: active,
  })
  .strict();

const productLinkSchema = z
  .object({
    productId: objectIdSchema,
    variantId: optionalObjectId,
    label: z.string().trim().max(120).optional(),
    hotspotX: z.number().min(0).max(100).optional(),
    hotspotY: z.number().min(0).max(100).optional(),
    sortOrder,
  })
  .strict()
  .refine((value) => (value.hotspotX === undefined) === (value.hotspotY === undefined), {
    message: "Hotspot X and Y must be provided together",
  });

const imageSchema = z
  .object({
    url: z.string().trim().min(1).max(2000),
    alt: z.string().trim().min(1).max(500),
    kind: z.enum([
      "product",
      "category_banner",
      "subcategory_banner",
      "collection_banner",
      "editorial",
      "lookbook",
    ]),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    focalPointX: z.number().min(0).max(100).default(50),
    focalPointY: z.number().min(0).max(100).default(50),
    linkedProducts: z.array(productLinkSchema).default([]),
    isActive: active,
  })
  .strict();

export const createSchemas = {
  categories: categorySchema,
  subcategories: subcategorySchema,
  collections: collectionSchema,
  colors: colorSchema,
  "size-groups": sizeGroupSchema,
  sizes: sizeSchema,
  products: productSchema,
  variants: variantSchema,
  images: imageSchema,
} satisfies Record<CatalogResource, z.ZodType>;

export const updateSchemas = {
  categories: categorySchema.partial(),
  subcategories: subcategorySchema.partial(),
  collections: collectionSchema.partial(),
  colors: colorSchema.partial(),
  "size-groups": sizeGroupSchema.partial(),
  sizes: sizeSchema.partial(),
  products: productSchema.partial(),
  variants: variantSchema.partial(),
  images: imageSchema.partial(),
} satisfies Record<CatalogResource, z.ZodType>;
