import { z } from "zod";
import { correlationIdSchema, dateTimeSchema, externalIdSchema, moneySchema, } from "./common.js";
import { reservationStatusSchema } from "./inventory.js";
import { orderStatusSchema } from "./commerce.js";
import { paymentStatusSchema } from "./payment.js";
export function eventEnvelopeSchema(eventType, producer, payload) {
    return z
        .object({
        eventId: externalIdSchema,
        eventType: z.literal(eventType),
        eventVersion: z.literal(1),
        occurredAt: dateTimeSchema,
        producer: z.literal(producer),
        correlationId: correlationIdSchema,
        causationId: externalIdSchema.optional(),
        payload,
    })
        .strict();
}
const inventoryReservationPayloadSchema = z
    .object({
    reservationId: externalIdSchema,
    orderId: externalIdSchema,
    status: reservationStatusSchema,
})
    .strict();
const orderStatusPayloadSchema = z
    .object({
    orderId: externalIdSchema,
    previousStatus: orderStatusSchema.optional(),
    status: orderStatusSchema,
})
    .strict();
const paymentStatusPayloadSchema = z
    .object({
    paymentId: externalIdSchema,
    orderId: externalIdSchema,
    status: paymentStatusSchema,
    amount: moneySchema,
    failureCode: z.string().trim().max(120).optional(),
})
    .strict();
export const inventoryReservationChangedV1Schema = eventEnvelopeSchema("inventory.reservation.changed.v1", "inventory", inventoryReservationPayloadSchema);
export const commerceOrderStatusChangedV1Schema = eventEnvelopeSchema("commerce.order.status-changed.v1", "commerce", orderStatusPayloadSchema);
export const commerceOrderConfirmedV1Schema = eventEnvelopeSchema("commerce.order.confirmed.v1", "commerce", orderStatusPayloadSchema.extend({ status: z.literal("confirmed") }));
export const paymentStatusChangedV1Schema = eventEnvelopeSchema("payment.status-changed.v1", "payment", paymentStatusPayloadSchema);
export const serviceEventV1Schema = z.discriminatedUnion("eventType", [
    inventoryReservationChangedV1Schema,
    commerceOrderStatusChangedV1Schema,
    commerceOrderConfirmedV1Schema,
    paymentStatusChangedV1Schema,
]);
