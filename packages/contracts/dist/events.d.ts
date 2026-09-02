import { z } from "zod";
export declare function eventEnvelopeSchema<TType extends string, TProducer extends "commerce" | "inventory" | "payment" | "customer-data", TPayload extends z.ZodType>(eventType: TType, producer: TProducer, payload: TPayload): z.ZodObject<{
    eventId: z.ZodString;
    eventType: z.ZodLiteral<TType>;
    eventVersion: z.ZodLiteral<1>;
    occurredAt: z.ZodISODateTime;
    producer: z.ZodLiteral<TProducer>;
    correlationId: z.ZodString;
    causationId: z.ZodOptional<z.ZodString>;
    payload: TPayload;
}, z.core.$strict>;
export declare const inventoryReservationChangedV1Schema: z.ZodObject<{
    eventId: z.ZodString;
    eventType: z.ZodLiteral<"inventory.reservation.changed.v1">;
    eventVersion: z.ZodLiteral<1>;
    occurredAt: z.ZodISODateTime;
    producer: z.ZodLiteral<"inventory">;
    correlationId: z.ZodString;
    causationId: z.ZodOptional<z.ZodString>;
    payload: z.ZodObject<{
        reservationId: z.ZodString;
        orderId: z.ZodString;
        status: z.ZodEnum<{
            cancelled: "cancelled";
            expired: "expired";
            active: "active";
            committed: "committed";
            released: "released";
        }>;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const commerceOrderStatusChangedV1Schema: z.ZodObject<{
    eventId: z.ZodString;
    eventType: z.ZodLiteral<"commerce.order.status-changed.v1">;
    eventVersion: z.ZodLiteral<1>;
    occurredAt: z.ZodISODateTime;
    producer: z.ZodLiteral<"commerce">;
    correlationId: z.ZodString;
    causationId: z.ZodOptional<z.ZodString>;
    payload: z.ZodObject<{
        orderId: z.ZodString;
        previousStatus: z.ZodOptional<z.ZodEnum<{
            pending_inventory: "pending_inventory";
            pending_payment: "pending_payment";
            payment_failed: "payment_failed";
            confirmed: "confirmed";
            cancelled: "cancelled";
            expired: "expired";
            compensation_required: "compensation_required";
            fulfilled: "fulfilled";
            refunded: "refunded";
        }>>;
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
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const commerceOrderConfirmedV1Schema: z.ZodObject<{
    eventId: z.ZodString;
    eventType: z.ZodLiteral<"commerce.order.confirmed.v1">;
    eventVersion: z.ZodLiteral<1>;
    occurredAt: z.ZodISODateTime;
    producer: z.ZodLiteral<"commerce">;
    correlationId: z.ZodString;
    causationId: z.ZodOptional<z.ZodString>;
    payload: z.ZodObject<{
        orderId: z.ZodString;
        previousStatus: z.ZodOptional<z.ZodEnum<{
            pending_inventory: "pending_inventory";
            pending_payment: "pending_payment";
            payment_failed: "payment_failed";
            confirmed: "confirmed";
            cancelled: "cancelled";
            expired: "expired";
            compensation_required: "compensation_required";
            fulfilled: "fulfilled";
            refunded: "refunded";
        }>>;
        status: z.ZodLiteral<"confirmed">;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const paymentStatusChangedV1Schema: z.ZodObject<{
    eventId: z.ZodString;
    eventType: z.ZodLiteral<"payment.status-changed.v1">;
    eventVersion: z.ZodLiteral<1>;
    occurredAt: z.ZodISODateTime;
    producer: z.ZodLiteral<"payment">;
    correlationId: z.ZodString;
    causationId: z.ZodOptional<z.ZodString>;
    payload: z.ZodObject<{
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
        amount: z.ZodObject<{
            amountMinor: z.ZodNumber;
            currency: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
        }, z.core.$strict>;
        failureCode: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const serviceEventV1Schema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    eventId: z.ZodString;
    eventType: z.ZodLiteral<"inventory.reservation.changed.v1">;
    eventVersion: z.ZodLiteral<1>;
    occurredAt: z.ZodISODateTime;
    producer: z.ZodLiteral<"inventory">;
    correlationId: z.ZodString;
    causationId: z.ZodOptional<z.ZodString>;
    payload: z.ZodObject<{
        reservationId: z.ZodString;
        orderId: z.ZodString;
        status: z.ZodEnum<{
            cancelled: "cancelled";
            expired: "expired";
            active: "active";
            committed: "committed";
            released: "released";
        }>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    eventId: z.ZodString;
    eventType: z.ZodLiteral<"commerce.order.status-changed.v1">;
    eventVersion: z.ZodLiteral<1>;
    occurredAt: z.ZodISODateTime;
    producer: z.ZodLiteral<"commerce">;
    correlationId: z.ZodString;
    causationId: z.ZodOptional<z.ZodString>;
    payload: z.ZodObject<{
        orderId: z.ZodString;
        previousStatus: z.ZodOptional<z.ZodEnum<{
            pending_inventory: "pending_inventory";
            pending_payment: "pending_payment";
            payment_failed: "payment_failed";
            confirmed: "confirmed";
            cancelled: "cancelled";
            expired: "expired";
            compensation_required: "compensation_required";
            fulfilled: "fulfilled";
            refunded: "refunded";
        }>>;
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
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    eventId: z.ZodString;
    eventType: z.ZodLiteral<"commerce.order.confirmed.v1">;
    eventVersion: z.ZodLiteral<1>;
    occurredAt: z.ZodISODateTime;
    producer: z.ZodLiteral<"commerce">;
    correlationId: z.ZodString;
    causationId: z.ZodOptional<z.ZodString>;
    payload: z.ZodObject<{
        orderId: z.ZodString;
        previousStatus: z.ZodOptional<z.ZodEnum<{
            pending_inventory: "pending_inventory";
            pending_payment: "pending_payment";
            payment_failed: "payment_failed";
            confirmed: "confirmed";
            cancelled: "cancelled";
            expired: "expired";
            compensation_required: "compensation_required";
            fulfilled: "fulfilled";
            refunded: "refunded";
        }>>;
        status: z.ZodLiteral<"confirmed">;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    eventId: z.ZodString;
    eventType: z.ZodLiteral<"payment.status-changed.v1">;
    eventVersion: z.ZodLiteral<1>;
    occurredAt: z.ZodISODateTime;
    producer: z.ZodLiteral<"payment">;
    correlationId: z.ZodString;
    causationId: z.ZodOptional<z.ZodString>;
    payload: z.ZodObject<{
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
        amount: z.ZodObject<{
            amountMinor: z.ZodNumber;
            currency: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
        }, z.core.$strict>;
        failureCode: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>], "eventType">;
export type InventoryReservationChangedV1 = z.infer<typeof inventoryReservationChangedV1Schema>;
export type CommerceOrderStatusChangedV1 = z.infer<typeof commerceOrderStatusChangedV1Schema>;
export type CommerceOrderConfirmedV1 = z.infer<typeof commerceOrderConfirmedV1Schema>;
export type PaymentStatusChangedV1 = z.infer<typeof paymentStatusChangedV1Schema>;
export type ServiceEventV1 = z.infer<typeof serviceEventV1Schema>;
