import { z } from "zod";
import { localizedTextSchema, objectIdSchema } from "@/services/catalog/schemas";

export const inventoryResources = [
  "cities",
  "stores",
  "pools",
  "locations",
  "balances",
  "movements",
] as const;

export const inventoryMasterResources = ["cities", "stores", "pools", "locations"] as const;
export type InventoryResource = (typeof inventoryResources)[number];
export type InventoryMasterResource = (typeof inventoryMasterResources)[number];

export function isInventoryResource(value: string): value is InventoryResource {
  return inventoryResources.includes(value as InventoryResource);
}

export function isInventoryMasterResource(value: string): value is InventoryMasterResource {
  return inventoryMasterResources.includes(value as InventoryMasterResource);
}

export const inventoryListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).max(120).optional(),
    isActive: z.enum(["true", "false"]).optional(),
    type: z.enum(["warehouse", "store", "virtual"]).optional(),
    cityId: objectIdSchema.optional(),
    poolId: objectIdSchema.optional(),
    storeId: objectIdSchema.optional(),
    variantId: objectIdSchema.optional(),
    locationId: objectIdSchema.optional(),
    status: z.enum(["active", "committed", "released", "expired", "completed", "cancelled"]).optional(),
    include: z.enum(["references"]).optional(),
  })
  .strict();

const codeSchema = z.string().trim().min(2).max(40).regex(/^[A-Za-z0-9_-]+$/);
const activeSchema = z.boolean().default(true);
const localizedNameSchema = localizedTextSchema(160);

const citySchema = z
  .object({
    code: codeSchema,
    name: localizedNameSchema,
    countryCode: z.string().trim().length(2),
    isActive: activeSchema,
  })
  .strict();

const storeSchema = z
  .object({
    code: codeSchema,
    name: localizedNameSchema,
    cityId: objectIdSchema,
    address: localizedTextSchema(500, 0).optional(),
    isActive: activeSchema,
  })
  .strict();

const poolSchema = z
  .object({
    code: codeSchema,
    name: localizedNameSchema,
    cityId: objectIdSchema.nullable().optional(),
    isActive: activeSchema,
  })
  .strict();

const locationBaseSchema = z
  .object({
    code: codeSchema,
    name: localizedNameSchema,
    type: z.enum(["warehouse", "store", "virtual"]),
    cityId: objectIdSchema,
    poolId: objectIdSchema,
    storeId: objectIdSchema.nullable().optional(),
    isActive: activeSchema,
  })
  .strict();

const locationSchema = locationBaseSchema
  .superRefine((value, context) => {
    if (value.type === "store" && !value.storeId) {
      context.addIssue({ code: "custom", path: ["storeId"], message: "A store location requires storeId." });
    }
  });

export const inventoryMasterCreateSchemas = {
  cities: citySchema,
  stores: storeSchema,
  pools: poolSchema,
  locations: locationSchema,
} as const;

export const inventoryMasterPatchSchemas = {
  cities: citySchema.partial().strict(),
  stores: storeSchema.partial().strict(),
  pools: poolSchema.partial().strict(),
  locations: locationBaseSchema.partial().strict(),
} as const;

const idempotencyKeySchema = z.string().trim().min(8).max(160).regex(/^[A-Za-z0-9._:-]+$/);

export const inventoryAdjustmentSchema = z
  .object({
    idempotencyKey: idempotencyKeySchema,
    variantId: objectIdSchema,
    locationId: objectIdSchema,
    delta: z.number().int().min(-1_000_000).max(1_000_000).default(0),
    safetyStock: z.number().int().nonnegative().max(1_000_000).optional(),
    reason: z.string().trim().min(3).max(500),
  })
  .strict()
  .refine((value) => value.delta !== 0 || value.safetyStock !== undefined, {
    message: "Provide a non-zero delta or safetyStock.",
  });

const reservationItemSchema = z
  .object({
    variantId: objectIdSchema,
    locationId: objectIdSchema,
    quantity: z.number().int().positive().max(100_000),
  })
  .strict();

export const createInventoryReservationSchema = z
  .object({
    idempotencyKey: idempotencyKeySchema,
    cartId: objectIdSchema.optional(),
    checkoutSessionId: objectIdSchema.optional(),
    orderId: objectIdSchema.optional(),
    userId: objectIdSchema.optional(),
    items: z.array(reservationItemSchema).min(1).max(100),
    expiresAt: z.coerce.date(),
  })
  .strict()
  .refine((value) => value.expiresAt.getTime() > Date.now(), {
    path: ["expiresAt"],
    message: "Reservation expiry must be in the future.",
  })
  .refine(
    (value) => new Set(value.items.map((item) => `${item.variantId}:${item.locationId}`)).size === value.items.length,
    { path: ["items"], message: "Reservation items must be unique per variant and location." },
  );

export const inventoryReservationActionSchema = z
  .object({
    action: z.enum(["commit", "release", "expire"]),
    reason: z.string().trim().min(3).max(500).optional(),
  })
  .strict();

const transferItemSchema = z
  .object({ variantId: objectIdSchema, quantity: z.number().int().positive().max(100_000) })
  .strict();

export const inventoryTransferSchema = z
  .object({
    idempotencyKey: idempotencyKeySchema,
    sourceLocationId: objectIdSchema,
    destinationLocationId: objectIdSchema,
    items: z.array(transferItemSchema).min(1).max(100),
    reason: z.string().trim().min(3).max(500),
  })
  .strict()
  .refine((value) => value.sourceLocationId !== value.destinationLocationId, {
    path: ["destinationLocationId"],
    message: "Source and destination locations must differ.",
  })
  .refine((value) => new Set(value.items.map((item) => item.variantId)).size === value.items.length, {
    path: ["items"],
    message: "Transfer variants must be unique.",
  });

export const inventoryAvailabilityQuerySchema = z
  .object({
    variantId: objectIdSchema,
    storeId: objectIdSchema.optional(),
    cityId: objectIdSchema.optional(),
  })
  .strict();
