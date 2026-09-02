import { z } from "zod";
export declare const checkoutCustomerSchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodString>;
    anonymousId: z.ZodOptional<z.ZodString>;
    email: z.ZodEmail;
    firstName: z.ZodString;
    lastName: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const startCheckoutRequestSchema: z.ZodObject<{
    cartId: z.ZodString;
    storeId: z.ZodString;
    customer: z.ZodObject<{
        userId: z.ZodOptional<z.ZodString>;
        anonymousId: z.ZodOptional<z.ZodString>;
        email: z.ZodEmail;
        firstName: z.ZodString;
        lastName: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    paymentMethodToken: z.ZodString;
    idempotencyKey: z.ZodString;
    correlationId: z.ZodString;
}, z.core.$strict>;
export declare const orderStatusSchema: z.ZodEnum<{
    pending_inventory: "pending_inventory";
    pending_payment: "pending_payment";
    payment_failed: "payment_failed";
    confirmed: "confirmed";
    cancelled: "cancelled";
    expired: "expired";
    compensation_required: "compensation_required";
    fulfilled: "fulfilled";
    refunded: "refunded";
}>;
export declare const orderSummarySchema: z.ZodObject<{
    orderId: z.ZodString;
    orderNumber: z.ZodString;
    status: z.ZodEnum<{
        pending_inventory: "pending_inventory";
        pending_payment: "pending_payment";
        payment_failed: "payment_failed";
        confirmed: "confirmed";
        cancelled: "cancelled";
        expired: "expired";
        compensation_required: "compensation_required";
        fulfilled: "fulfilled";
        refunded: "refunded";
    }>;
    total: z.ZodObject<{
        amountMinor: z.ZodNumber;
        currency: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type StartCheckoutRequest = z.infer<typeof startCheckoutRequestSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type OrderSummary = z.infer<typeof orderSummarySchema>;
