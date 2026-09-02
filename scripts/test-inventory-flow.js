import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import mongoose from "../services/inventory/node_modules/mongoose/index.js";
import { AvailabilityService } from "../services/inventory/dist/availability/availability.service.js";
import { City } from "../services/inventory/dist/models/city.js";
import { InventoryBalance } from "../services/inventory/dist/models/inventory-balance.js";
import { InventoryLocation } from "../services/inventory/dist/models/inventory-location.js";
import { InventoryPool } from "../services/inventory/dist/models/inventory-pool.js";
import { InventoryReservation } from "../services/inventory/dist/models/inventory-reservation.js";
import { StockMovement } from "../services/inventory/dist/models/stock-movement.js";
import {
  Store,
  StoreInventoryPoolBinding,
} from "../services/inventory/dist/models/store.js";

function log(label, message) {
  process.stdout.write(`[${label}] ${message}\n`);
}

async function loadEnvironment() {
  const source = await readFile(new URL("../.env", import.meta.url), "utf8");
  const values = {};
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) value = value.slice(1, -1);
    values[key] = value;
  }
  return values;
}

const runId = randomUUID();
const variantId = `api-test-variant-${runId}`;
const firstKey = `api-test-reserve-commit-${runId}`;
const secondKey = `api-test-reserve-release-${runId}`;
const created = {};

try {
  const environment = await loadEnvironment();
  if (!environment.MONGODB_URI) throw new Error("MONGODB_URI is missing from .env");
  await mongoose.connect(environment.MONGODB_URI, {
    dbName: environment.MONGODB_INVENTORY_DB_NAME || "najib_inventory",
    serverSelectionTimeoutMS: 5_000,
  });

  log("FLOW", "Creating isolated inventory fixtures");
  created.city = await City.create({
    name: "API Test City",
    code: `T${runId.slice(0, 8)}`,
    countryCode: "DE",
    timezone: "Europe/Berlin",
  });
  created.pool = await InventoryPool.create({
    cityId: created.city._id,
    name: "API Test Pool",
    code: `T${runId.slice(0, 8)}`,
  });
  created.store = await Store.create({
    cityId: created.city._id,
    name: "API Test Store",
    code: `T${runId.slice(0, 8)}`,
  });
  created.binding = await StoreInventoryPoolBinding.create({
    storeId: created.store._id,
    inventoryPoolId: created.pool._id,
  });
  created.location = await InventoryLocation.create({
    inventoryPoolId: created.pool._id,
    name: "API Test Location",
    code: `T${runId.slice(0, 8)}`,
    kind: "store",
  });
  created.balance = await InventoryBalance.create({
    productVariantId: variantId,
    inventoryLocationId: created.location._id,
    onHand: 10,
    reserved: 0,
    safetyStock: 1,
  });

  const inventory = new AvailabilityService();
  const initial = await inventory.checkAvailability({
    storeId: created.store._id.toString(),
    lines: [{ productVariantId: variantId, quantity: 3 }],
  });
  assert.equal(initial.lines[0].available, 9);
  assert.equal(initial.lines[0].sufficient, true);
  log("PASS", "Availability subtracts safety stock");

  const commitInput = {
    idempotencyKey: firstKey,
    orderId: `order-${runId}`,
    storeId: created.store._id.toString(),
    lines: [{ productVariantId: variantId, quantity: 3 }],
    expiresAt: new Date(Date.now() + 15 * 60_000),
    correlationId: runId,
  };
  const firstReservation = await inventory.createReservation(commitInput);
  const repeatedReservation = await inventory.createReservation(commitInput);
  assert.equal(firstReservation._id.toString(), repeatedReservation._id.toString());
  log("PASS", "Idempotent retry returns the original reservation");

  await inventory.commitReservation(firstReservation._id.toString(), {
    correlationId: runId,
  });
  let balance = await InventoryBalance.findById(created.balance._id).lean();
  assert.equal(balance.onHand, 7);
  assert.equal(balance.reserved, 0);
  log("PASS", "Commit reduces on-hand and reserved stock exactly once");

  const secondReservation = await inventory.createReservation({
    ...commitInput,
    idempotencyKey: secondKey,
    orderId: `order-release-${runId}`,
    lines: [{ productVariantId: variantId, quantity: 2 }],
  });
  await inventory.releaseReservation(secondReservation._id.toString(), {
    correlationId: runId,
    reason: "Automated flow test",
  });
  balance = await InventoryBalance.findById(created.balance._id).lean();
  assert.equal(balance.onHand, 7);
  assert.equal(balance.reserved, 0);
  log("PASS", "Release restores availability without changing on-hand stock");
  log("SUCCESS", "Inventory transaction flow passed");
} finally {
  if (mongoose.connection.readyState !== 0) {
    log("CLEANUP", "Removing isolated inventory fixtures");
    await StockMovement.deleteMany({ correlationId: runId });
    await InventoryReservation.deleteMany({ idempotencyKey: { $in: [firstKey, secondKey] } });
    await InventoryBalance.deleteMany({ productVariantId: variantId });
    if (created.location) await InventoryLocation.deleteOne({ _id: created.location._id });
    if (created.binding) await StoreInventoryPoolBinding.deleteOne({ _id: created.binding._id });
    if (created.store) await Store.deleteOne({ _id: created.store._id });
    if (created.pool) await InventoryPool.deleteOne({ _id: created.pool._id });
    if (created.city) await City.deleteOne({ _id: created.city._id });
    await mongoose.disconnect();
  }
}
