import test from "node:test";
import assert from "node:assert/strict";
import {
  availabilityRequestSchema,
  commerceOrderStatusChangedV1Schema,
  createPaymentRequestSchema,
  moneySchema,
  recordCustomerActivitySchema,
  serviceEventV1Schema,
  startCheckoutRequestSchema,
} from "../dist/index.js";

test("money accepts only non-negative integer minor units", () => {
  assert.equal(moneySchema.safeParse({ amountMinor: 12900, currency: "eur" }).success, true);
  assert.equal(moneySchema.safeParse({ amountMinor: 129.99, currency: "EUR" }).success, false);
});

test("inventory request rejects duplicate variants", () => {
  const result = availabilityRequestSchema.safeParse({
    storeId: "507f1f77bcf86cd799439011",
    lines: [
      { productVariantId: "variant-1", quantity: 1 },
      { productVariantId: "variant-1", quantity: 2 },
    ],
  });
  assert.equal(result.success, false);
});

test("guest checkout requires an anonymous or user identity", () => {
  const result = startCheckoutRequestSchema.safeParse({
    cartId: "507f1f77bcf86cd799439011",
    storeId: "507f1f77bcf86cd799439012",
    customer: { email: "guest@example.com" },
    idempotencyKey: "checkout-key-123",
    correlationId: "checkout-correlation",
  });
  assert.equal(result.success, false);
});

test("payment commands use the same money and tracing rules", () => {
  const result = createPaymentRequestSchema.safeParse({
    orderId: "order-1",
    amount: { amountMinor: 25900, currency: "EUR" },
    provider: "sandbox",
    paymentMethodToken: "sandbox-success",
    idempotencyKey: "payment-key-123",
    correlationId: "checkout-correlation",
  });
  assert.equal(result.success, true);
});

test("customer activity requires an anonymous or user identity", () => {
  const result = recordCustomerActivitySchema.safeParse({
    eventId: "event-1",
    eventType: "ProductViewed",
    occurredAt: new Date(),
    sessionId: "session-1",
    productId: "product-1",
    correlationId: "request-1",
    consentScope: "personalization",
  });
  assert.equal(result.success, false);
});

test("versioned event envelopes reject a wrong producer or event version", () => {
  const valid = {
    eventId: "event-1",
    eventType: "commerce.order.status-changed.v1",
    eventVersion: 1,
    occurredAt: new Date().toISOString(),
    producer: "commerce",
    correlationId: "checkout-1",
    payload: { orderId: "order-1", status: "pending_payment" },
  };
  assert.equal(commerceOrderStatusChangedV1Schema.safeParse(valid).success, true);
  assert.equal(serviceEventV1Schema.safeParse({ ...valid, eventVersion: 2 }).success, false);
  assert.equal(serviceEventV1Schema.safeParse({ ...valid, producer: "unknown" }).success, false);
  assert.equal(serviceEventV1Schema.safeParse({ ...valid, producer: "payment" }).success, false);
});
