import { z } from "zod";
import { correlationIdSchema, externalIdSchema } from "./common.js";

export const customerActivityTypeSchema = z.enum([
  "PageViewed",
  "ProductViewed",
  "ColorSelected",
  "SizeSelected",
  "SearchPerformed",
  "RecommendationShown",
  "RecommendationClicked",
  "ProductSaved",
  "CartItemAdded",
  "CartItemRemoved",
  "CheckoutStarted",
  "CheckoutAbandoned",
  "OrderViewed",
  "PurchaseCompleted",
]);

export const recordCustomerActivitySchema = z
  .object({
    eventId: externalIdSchema,
    eventType: customerActivityTypeSchema,
    occurredAt: z.coerce.date(),
    userId: externalIdSchema.optional(),
    anonymousId: externalIdSchema.optional(),
    sessionId: externalIdSchema,
    productId: externalIdSchema.optional(),
    storeId: externalIdSchema.optional(),
    cityId: externalIdSchema.optional(),
    variantId: externalIdSchema.optional(),
    correlationId: correlationIdSchema,
    causationId: externalIdSchema.optional(),
    consentScope: z.enum(["essential", "analytics", "personalization", "marketing"]),
    payload: z.record(z.string(), z.unknown()).default({}),
  })
  .strict()
  .refine((activity) => activity.userId || activity.anonymousId, {
    message: "Activity requires a userId or anonymousId",
  });

export type CustomerActivityType = z.infer<typeof customerActivityTypeSchema>;
export type RecordCustomerActivity = z.infer<typeof recordCustomerActivitySchema>;
