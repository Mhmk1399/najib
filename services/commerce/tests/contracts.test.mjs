import test from "node:test";
import assert from "node:assert/strict";
import { orderStatusSchema } from "@najib/contracts";
import { ORDER_STATUSES } from "../dist/models/order.js";

test("Commerce order statuses match the shared contract", () => {
  assert.deepEqual([...ORDER_STATUSES], [...orderStatusSchema.options]);
});
