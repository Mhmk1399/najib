import { z } from "zod";
export declare const inventoryVariantLineSchema: z.ZodObject<{
    productVariantId: z.ZodString;
    quantity: z.ZodNumber;
}, z.core.$strict>;
export declare const availabilityRequestSchema: z.ZodObject<{
    storeId: z.ZodString;
    lines: z.ZodArray<z.ZodObject<{
        productVariantId: z.ZodString;
        quantity: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const availabilityLineSchema: z.ZodObject<{
    productVariantId: z.ZodString;
    quantity: z.ZodNumber;
    available: z.ZodNumber;
    sufficient: z.ZodBoolean;
}, z.core.$strict>;
export declare const availabilityResponseSchema: z.ZodObject<{
    storeId: z.ZodString;
    inventoryPoolId: z.ZodString;
    lines: z.ZodArray<z.ZodObject<{
        productVariantId: z.ZodString;
        quantity: z.ZodNumber;
        available: z.ZodNumber;
        sufficient: z.ZodBoolean;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const createReservationSchema: z.ZodObject<{
    idempotencyKey: z.ZodString;
    orderId: z.ZodString;
    storeId: z.ZodString;
    lines: z.ZodArray<z.ZodObject<{
        productVariantId: z.ZodString;
        quantity: z.ZodNumber;
    }, z.core.$strict>>;
    expiresAt: z.ZodCoercedDate<unknown>;
    correlationId: z.ZodString;
    actorId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const reservationIdSchema: z.ZodString;
export declare const reservationActionSchema: z.ZodObject<{
    correlationId: z.ZodString;
    actorId: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const expireReservationsSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    correlationId: z.ZodString;
}, z.core.$strict>;
export declare const reservationStatusSchema: z.ZodEnum<{
    cancelled: "cancelled";
    expired: "expired";
    active: "active";
    committed: "committed";
    released: "released";
}>;
export type InventoryVariantLine = z.infer<typeof inventoryVariantLineSchema>;
export type AvailabilityRequest = z.infer<typeof availabilityRequestSchema>;
export type AvailabilityResponse = z.infer<typeof availabilityResponseSchema>;
export type CreateReservationRequest = z.infer<typeof createReservationSchema>;
export type ReservationAction = z.infer<typeof reservationActionSchema>;
