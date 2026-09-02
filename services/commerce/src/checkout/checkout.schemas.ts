import { z } from "zod";
import { mongoObjectIdSchema, startCheckoutRequestSchema } from "@najib/contracts";
export { startCheckoutRequestSchema };
export const createCartSchema = z.object({
  userId: z.string().trim().min(1).max(160).optional(),
  anonymousId: z.string().trim().min(1).max(160).optional(),
  storeId: mongoObjectIdSchema,
  cityId: mongoObjectIdSchema,
  currency: z.string().trim().length(3),
}).strict().refine((value) => value.userId || value.anonymousId, { message: "A cart requires userId or anonymousId" });
export const addCartItemSchema = z.object({ variantId: mongoObjectIdSchema, quantity: z.number().int().positive().max(100) }).strict();
export const mongoIdSchema = mongoObjectIdSchema;
