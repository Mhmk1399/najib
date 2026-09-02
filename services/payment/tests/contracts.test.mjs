import test from "node:test";
import assert from "node:assert/strict";
import { paymentStatusSchema } from "@najib/contracts";
import { PAYMENT_STATUSES } from "../dist/models/payment.js";

test("Payment statuses match the shared contract", () => {
  assert.deepEqual([...PAYMENT_STATUSES], [...paymentStatusSchema.options]);
});
