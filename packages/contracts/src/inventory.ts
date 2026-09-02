import { z } from "zod";
import {
  correlationIdSchema,
  externalIdSchema,
  idempotencyKeySchema,
  mongoObjectIdSchema,
} from "./common.js";

export const inventoryVariantLineSchema = z
  .object({
    productVariantId: externalIdSchema,
    quantity: z.number().int().positive().max(10_000),
  })
  .strict();

const uniqueVariantLinesSchema = z
  .array(inventoryVariantLineSchema)
  .min(1)
  .max(100)
  .superRefine((lines, context) => {
    const seen = new Set<string>();
    for (const [index, line] of lines.entries()) {
      if (seen.has(line.productVariantId)) {
        context.addIssue({
          code: "custom",
          path: [index, "productVariantId"],
          message: "A variant may appear only once",
        });
      }
      seen.add(line.productVariantId);
    }
  });

export const availabilityRequestSchema = z
  .object({
    storeId: mongoObjectIdSchema,
    lines: uniqueVariantLinesSchema,
  })
  .strict();

export const availabilityLineSchema = inventoryVariantLineSchema.extend({
  available: z.number().int().nonnegative(),
  sufficient: z.boolean(),
});

export const availabilityResponseSchema = z
  .object({
    storeId: mongoObjectIdSchema,
    inventoryPoolId: mongoObjectIdSchema,
    lines: z.array(availabilityLineSchema),
  })
  .strict();

export const createReservationSchema = z
  .object({
    idempotencyKey: idempotencyKeySchema,
    orderId: externalIdSchema,
    storeId: mongoObjectIdSchema,
    lines: uniqueVariantLinesSchema,
    expiresAt: z.coerce.date().refine((date) => date.getTime() > Date.now(), {
      message: "Reservation expiry must be in the future",
    }),
    correlationId: correlationIdSchema,
    actorId: externalIdSchema.optional(),
  })
  .strict();

export const reservationIdSchema = mongoObjectIdSchema;

export const reservationActionSchema = z
  .object({
    correlationId: correlationIdSchema,
    actorId: externalIdSchema.optional(),
    reason: z.string().trim().min(1).max(500).optional(),
  })
  .strict();

export const expireReservationsSchema = z
  .object({
    limit: z.number().int().min(1).max(500).default(100),
    correlationId: correlationIdSchema,
  })
  .strict();

export const reservationStatusSchema = z.enum([
  "active",
  "committed",
  "released",
  "expired",
  "cancelled",
]);

export type InventoryVariantLine = z.infer<typeof inventoryVariantLineSchema>;
export type AvailabilityRequest = z.infer<typeof availabilityRequestSchema>;
export type AvailabilityResponse = z.infer<typeof availabilityResponseSchema>;
export type CreateReservationRequest = z.infer<typeof createReservationSchema>;
export type ReservationAction = z.infer<typeof reservationActionSchema>;
