import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import * as inventoryModels from "../dist/index.js";

const { Types } = mongoose;
const {
  InventoryBalance,
  InventoryPool,
  InventoryReservation,
  InventoryTransfer,
  StoreInventoryPoolBinding,
} = inventoryModels;

test("inventory balance is unique for an exact variant and location", () => {
  const index = InventoryBalance.schema.indexes().find(
    ([fields]) =>
      fields.productVariantId === 1 && fields.inventoryLocationId === 1,
  );

  assert.ok(index);
  assert.equal(index[1].unique, true);
});

test("available inventory subtracts reservations and safety stock", async () => {
  const balance = new InventoryBalance({
    productVariantId: "white-large-variant",
    inventoryLocationId: new Types.ObjectId(),
    onHand: 8,
    reserved: 2,
    safetyStock: 1,
  });

  await balance.validate();
  assert.equal(balance.available, 5);
});

test("inventory cannot reserve more than the location can provide", async () => {
  const balance = new InventoryBalance({
    productVariantId: "white-large-variant",
    inventoryLocationId: new Types.ObjectId(),
    onHand: 3,
    reserved: 3,
    safetyStock: 1,
  });

  await assert.rejects(
    balance.validate(),
    /Reserved inventory exceeds available inventory/,
  );
});

test("every inventory pool belongs to one city", async () => {
  const pool = new InventoryPool({
    name: "Berlin Inventory Pool",
    code: "BERLIN",
  });

  await assert.rejects(pool.validate(), /cityId.*required/);
});

test("stores require an explicit inventory-pool binding", () => {
  const index = StoreInventoryPoolBinding.schema.indexes().find(
    ([fields]) => fields.storeId === 1 && fields.inventoryPoolId === 1,
  );

  assert.ok(index);
  assert.equal(index[1].unique, true);
});

test("reservation allocations must equal requested quantities", async () => {
  const reservation = new InventoryReservation({
    reservationNumber: "RES-1001",
    idempotencyKey: "reserve-order-1001",
    orderId: "order-1001",
    storeId: new Types.ObjectId(),
    inventoryPoolId: new Types.ObjectId(),
    expiresAt: new Date(Date.now() + 15 * 60_000),
    lines: [
      {
        productVariantId: "white-large-variant",
        quantity: 2,
        allocations: [
          {
            inventoryLocationId: new Types.ObjectId(),
            quantity: 1,
          },
        ],
      },
    ],
  });

  await assert.rejects(
    reservation.validate(),
    /Allocated quantity must equal requested quantity/,
  );
});

test("duplicate reservation commands are prevented by idempotency key", () => {
  const index = InventoryReservation.schema.indexes().find(
    ([fields]) => fields.idempotencyKey === 1,
  );

  assert.ok(index);
  assert.equal(index[1].unique, true);
});

test("inventory cannot transfer to the same location", async () => {
  const locationId = new Types.ObjectId();
  const transfer = new InventoryTransfer({
    transferNumber: "TR-1001",
    idempotencyKey: "transfer-1001",
    fromLocationId: locationId,
    toLocationId: locationId,
    requestedBy: "inventory-manager-1",
    correlationId: "correlation-1001",
    lines: [{ productVariantId: "white-large-variant", quantity: 1 }],
  });

  await assert.rejects(transfer.validate(), /Transfer locations must be different/);
});
