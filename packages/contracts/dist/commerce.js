import { z } from "zod";
import { correlationIdSchema, externalIdSchema, idempotencyKeySchema, moneySchema, mongoObjectIdSchema, } from "./common.js";
export const checkoutCustomerSchema = z
    .object({
    userId: externalIdSchema.optional(),
    anonymousId: externalIdSchema.optional(),
    email: z.email(),
    firstName: z.string().trim().min(1).max(120),
    lastName: z.string().trim().min(1).max(120),
    phone: z.string().trim().min(5).max(40).optional(),
})
    .strict()
    .refine((customer) => customer.userId || customer.anonymousId, {
    message: "A customer requires a userId or anonymousId",
});
export const startCheckoutRequestSchema = z
    .object({
    cartId: mongoObjectIdSchema,
    storeId: mongoObjectIdSchema,
    customer: checkoutCustomerSchema,
    paymentMethodToken: z.string().trim().min(1).max(500),
    idempotencyKey: idempotencyKeySchema,
    correlationId: correlationIdSchema,
})
    .strict();
export const orderStatusSchema = z.enum([
    "pending_inventory",
    "pending_payment",
    "payment_failed",
    "confirmed",
    "cancelled",
    "expired",
    "compensation_required",
    "fulfilled",
    "refunded",
]);
export const orderSummarySchema = z
    .object({
    orderId: mongoObjectIdSchema,
    orderNumber: externalIdSchema,
    status: orderStatusSchema,
    total: moneySchema,
})
    .strict();
