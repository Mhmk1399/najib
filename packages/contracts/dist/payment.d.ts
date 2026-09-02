import { z } from "zod";
export declare const createPaymentRequestSchema: z.ZodObject<{
    orderId: z.ZodString;
    amount: z.ZodObject<{
        amountMinor: z.ZodNumber;
        currency: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    }, z.core.$strict>;
    provider: z.ZodString;
    paymentMethodToken: z.ZodString;
    idempotencyKey: z.ZodString;
    correlationId: z.ZodString;
}, z.core.$strict>;
export declare const paymentStatusSchema: z.ZodEnum<{
    cancelled: "cancelled";
    refunded: "refunded";
    created: "created";
    requires_customer_action: "requires_customer_action";
    authorized: "authorized";
    captured: "captured";
    failed: "failed";
    partially_refunded: "partially_refunded";
}>;
export declare const paymentResultSchema: z.ZodObject<{
    paymentId: z.ZodString;
    orderId: z.ZodString;
    status: z.ZodEnum<{
        cancelled: "cancelled";
        refunded: "refunded";
        created: "created";
        requires_customer_action: "requires_customer_action";
        authorized: "authorized";
        captured: "captured";
        failed: "failed";
        partially_refunded: "partially_refunded";
    }>;
    authorized: z.ZodObject<{
        amountMinor: z.ZodNumber;
        currency: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    }, z.core.$strict>;
    failureCode: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const paymentCallbackSchema: z.ZodObject<{
    paymentId: z.ZodString;
    orderId: z.ZodString;
    status: z.ZodEnum<{
        captured: "captured";
        failed: "failed";
    }>;
    correlationId: z.ZodString;
    failureCode: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type CreatePaymentRequest = z.infer<typeof createPaymentRequestSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type PaymentResult = z.infer<typeof paymentResultSchema>;
export type PaymentCallback = z.infer<typeof paymentCallbackSchema>;
