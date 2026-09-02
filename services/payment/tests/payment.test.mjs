import test from "node:test";
import assert from "node:assert/strict";
import { Payment, PaymentAttempt } from "../dist/index.js";

function paymentData(overrides = {}) {
  return {
    orderId: "order_123",
    idempotencyKey: "idem_123",
    provider: "sandbox",
    currency: "eur",
    requestedAmountMinor: 12_000,
    authorizedAmountMinor: 12_000,
    capturedAmountMinor: 12_000,
    ...overrides,
  };
}

test("payments store money in integer minor units", async () => {
  const payment = new Payment(paymentData());
  await payment.validate();
  assert.equal(payment.currency, "EUR");
  assert.equal(payment.capturedAmountMinor, 12_000);
});

test("refunds cannot exceed captured funds", async () => {
  const payment = new Payment(paymentData({ refundedAmountMinor: 12_001 }));
  await assert.rejects(payment.validate(), /Refund exceeds captured amount/);
});

test("provider webhook events are deduplicated by index", () => {
  const index = PaymentAttempt.schema.indexes().find(
    ([fields]) => fields.providerEventId === 1,
  );
  assert.ok(index);
  assert.equal(index[1].unique, true);
});
