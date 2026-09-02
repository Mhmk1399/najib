import test from "node:test";
import assert from "node:assert/strict";
import { customerActivityTypeSchema } from "@najib/contracts";
import { CUSTOMER_ACTIVITY_TYPES } from "../dist/models/activity.js";

test("Customer activity names match the shared contract", () => {
  assert.deepEqual(
    [...CUSTOMER_ACTIVITY_TYPES],
    [...customerActivityTypeSchema.options],
  );
});
