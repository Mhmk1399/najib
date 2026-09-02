import { z } from "zod";
import { correlationIdSchema, externalIdSchema, idempotencyKeySchema, moneySchema, } from "./common.js";
export const createPaymentRequestSchema = z
    .object({
    orderId: externalIdSchema,
    amount: moneySchema,
    provider: z.string().trim().min(1).max(80),
    paymentMethodToken: z.string().trim().min(1).max(500),
    idempotencyKey: idempotencyKeySchema,
    correlationId: correlationIdSchema,
})
    .strict();
export const paymentStatusSchema = z.enum([
    "created",
    "requires_customer_action",
    "authorized",
    "captured",
    "failed",
    "cancelled",
    "partially_refunded",
    "refunded",
]);
export const paymentResultSchema = z
    .object({
    paymentId: externalIdSchema,
    orderId: externalIdSchema,
    status: paymentStatusSchema,
    authorized: moneySchema,
    failureCode: z.string().trim().max(120).optional(),
})
    .strict();
export const paymentCallbackSchema = z
    .object({
    paymentId: externalIdSchema,
    orderId: externalIdSchema,
    status: z.enum(["captured", "failed"]),
    correlationId: correlationIdSchema,
    failureCode: z.string().trim().max(120).optional(),
})
    .strict();
