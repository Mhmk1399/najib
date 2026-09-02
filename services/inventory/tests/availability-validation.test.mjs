import test from "node:test";
import assert from "node:assert/strict";
import {
  availabilityRequestSchema,
  createReservationSchema,
  reservationActionSchema,
} from "../dist/availability/availability.schemas.js";

test("availability requires positive integer quantities", () => {
  const result = availabilityRequestSchema.safeParse({
    storeId: "507f1f77bcf86cd799439011",
    lines: [{ productVariantId: "variant-1", quantity: 1.5 }],
  });
  assert.equal(result.success, false);
});

test("availability rejects duplicate variant lines", () => {
  const result = availabilityRequestSchema.safeParse({
    storeId: "507f1f77bcf86cd799439011",
    lines: [
      { productVariantId: "variant-1", quantity: 1 },
      { productVariantId: "variant-1", quantity: 2 },
    ],
  });
  assert.equal(result.success, false);
});

test("reservation creation requires a future expiry and idempotency key", () => {
  const result = createReservationSchema.safeParse({
    idempotencyKey: "short",
    orderId: "order-1",
    storeId: "507f1f77bcf86cd799439011",
    lines: [{ productVariantId: "variant-1", quantity: 1 }],
    expiresAt: "2020-01-01T00:00:00.000Z",
    correlationId: "checkout-1",
  });
  assert.equal(result.success, false);
});

test("reservation actions require a correlation ID", () => {
  const result = reservationActionSchema.safeParse({ reason: "Cancelled" });
  assert.equal(result.success, false);
});
