import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import mongoose from "mongoose";

const api = { commerce: "http://127.0.0.1:4001/api/v1", inventory: "http://127.0.0.1:4002/api/v1", payment: "http://127.0.0.1:4003/api/v1" };
const runId = randomUUID();
const ids = Object.fromEntries(["category", "subcategory", "sizeGroup", "large", "small", "white", "black", "product", "whiteLarge", "whiteSmall", "blackLarge", "berlin", "dubai", "berlinPool", "dubaiPool", "berlinStore", "dubaiStore", "berlinLocation", "dubaiLocation"].map((key) => [key, new mongoose.Types.ObjectId()]));
const now = new Date();

function log(label, message) { process.stdout.write(`[${label}] ${message}\n`); }
async function environment() {
  const text = await readFile(new URL("../.env", import.meta.url), "utf8"); const result = {};
  for (const source of text.split(/\r?\n/)) { const line = source.trim(); if (!line || line.startsWith("#")) continue; const at = line.indexOf("="); if (at < 0) continue; let value = line.slice(at + 1).trim(); if ((value[0] === '"' && value.at(-1) === '"') || (value[0] === "'" && value.at(-1) === "'")) value = value.slice(1, -1); result[line.slice(0, at).trim()] = value; }
  return result;
}
async function request(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { "content-type": "application/json", ...(options.headers ?? {}) }, body: options.body === undefined ? undefined : JSON.stringify(options.body) });
  const body = await response.json();
  if (!response.ok) throw new Error(`${response.status} ${url}: ${JSON.stringify(body)}`);
  return body;
}
async function waitForServices() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const ready = await Promise.all(Object.values(api).map(async (baseUrl) => {
      try { return (await fetch(`${baseUrl}/health/ready`)).ok; } catch { return false; }
    }));
    if (ready.every(Boolean)) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("The four backend services were not ready within 30 seconds");
}

const env = await environment();
if (!env.MONGODB_URI) throw new Error("MONGODB_URI is missing");
const root = mongoose.createConnection(env.MONGODB_URI, { serverSelectionTimeoutMS: 5_000 });
await root.asPromise();
const commerce = root.useDb("najib_commerce"); const inventory = root.useDb("najib_inventory");
const payment = root.useDb("najib_payment"); const customer = root.useDb("najib_customer_data");
let cartId; let orderId; let paymentId;

try {
  await waitForServices();
  log("SETUP", "Creating isolated Berlin and Dubai catalog and inventory");
  await commerce.collection("categories").insertOne({ _id: ids.category, name: "Test Suits", slug: `test-suits-${runId}`, isActive: true, createdAt: now, updatedAt: now });
  await commerce.collection("subcategories").insertOne({ _id: ids.subcategory, categoryId: ids.category, name: "Test Tailoring", slug: `test-tailoring-${runId}`, isActive: true, createdAt: now, updatedAt: now });
  await commerce.collection("sizegroups").insertOne({ _id: ids.sizeGroup, name: "Test Clothing", code: `T${runId.slice(0, 8)}`, isActive: true, createdAt: now, updatedAt: now });
  await commerce.collection("sizes").insertMany([
    { _id: ids.large, sizeGroupId: ids.sizeGroup, name: "Large", code: `L${runId.slice(0, 6)}`, isActive: true, createdAt: now, updatedAt: now },
    { _id: ids.small, sizeGroupId: ids.sizeGroup, name: "Small", code: `S${runId.slice(0, 6)}`, isActive: true, createdAt: now, updatedAt: now },
  ]);
  await commerce.collection("colors").insertMany([
    { _id: ids.white, name: "White", slug: `white-${runId}`, family: "white", isActive: true, createdAt: now, updatedAt: now },
    { _id: ids.black, name: "Black", slug: `black-${runId}`, family: "black", isActive: true, createdAt: now, updatedAt: now },
  ]);
  await commerce.collection("products").insertOne({ _id: ids.product, name: "Test Berlin Suit", slug: `berlin-suit-${runId}`, description: "Vertical slice suit", categoryId: ids.category, subcategoryId: ids.subcategory, collectionIds: [], basePriceMinor: 120000, currency: "EUR", status: "active", imageIds: [], createdAt: now, updatedAt: now });
  await commerce.collection("productvariants").insertMany([
    { _id: ids.whiteLarge, productId: ids.product, colorId: ids.white, sizeId: ids.large, sku: `WL-${runId}`, isActive: true, createdAt: now, updatedAt: now },
    { _id: ids.whiteSmall, productId: ids.product, colorId: ids.white, sizeId: ids.small, sku: `WS-${runId}`, isActive: true, createdAt: now, updatedAt: now },
    { _id: ids.blackLarge, productId: ids.product, colorId: ids.black, sizeId: ids.large, sku: `BL-${runId}`, isActive: true, createdAt: now, updatedAt: now },
  ]);
  await inventory.collection("cities").insertMany([
    { _id: ids.berlin, name: "Berlin", code: `BER${runId.slice(0, 5)}`, countryCode: "DE", timezone: "Europe/Berlin", isActive: true, createdAt: now, updatedAt: now },
    { _id: ids.dubai, name: "Dubai", code: `DXB${runId.slice(0, 5)}`, countryCode: "AE", timezone: "Asia/Dubai", isActive: true, createdAt: now, updatedAt: now },
  ]);
  await inventory.collection("inventorypools").insertMany([
    { _id: ids.berlinPool, cityId: ids.berlin, name: "Berlin Pool", code: `BP${runId.slice(0, 5)}`, isActive: true, createdAt: now, updatedAt: now },
    { _id: ids.dubaiPool, cityId: ids.dubai, name: "Dubai Pool", code: `DP${runId.slice(0, 5)}`, isActive: true, createdAt: now, updatedAt: now },
  ]);
  await inventory.collection("stores").insertMany([
    { _id: ids.berlinStore, cityId: ids.berlin, name: "Berlin Store", code: `BS${runId.slice(0, 5)}`, isActive: true, createdAt: now, updatedAt: now },
    { _id: ids.dubaiStore, cityId: ids.dubai, name: "Dubai Store", code: `DS${runId.slice(0, 5)}`, isActive: true, createdAt: now, updatedAt: now },
  ]);
  await inventory.collection("storeinventorypoolbindings").insertMany([
    { storeId: ids.berlinStore, inventoryPoolId: ids.berlinPool, status: "active", effectiveFrom: now, createdAt: now, updatedAt: now },
    { storeId: ids.dubaiStore, inventoryPoolId: ids.dubaiPool, status: "active", effectiveFrom: now, createdAt: now, updatedAt: now },
  ]);
  await inventory.collection("inventorylocations").insertMany([
    { _id: ids.berlinLocation, inventoryPoolId: ids.berlinPool, name: "Berlin Stock", code: `BL${runId.slice(0, 5)}`, kind: "store", isActive: true, createdAt: now, updatedAt: now },
    { _id: ids.dubaiLocation, inventoryPoolId: ids.dubaiPool, name: "Dubai Stock", code: `DL${runId.slice(0, 5)}`, kind: "store", isActive: true, createdAt: now, updatedAt: now },
  ]);
  const balances = [ids.whiteLarge, ids.whiteSmall, ids.blackLarge].flatMap((variant) => [ids.berlinLocation, ids.dubaiLocation].map((location) => ({ productVariantId: variant.toString(), inventoryLocationId: location, onHand: 3, reserved: 0, safetyStock: 0, version: 0, createdAt: now, updatedAt: now })));
  await inventory.collection("inventorybalances").insertMany(balances);

  const availability = await request(`${api.inventory}/availability/check`, { method: "POST", body: { storeId: ids.berlinStore.toString(), lines: [{ productVariantId: ids.whiteLarge.toString(), quantity: 1 }] } });
  assert.equal(availability.lines[0].available, 3); log("PASS", "Berlin White/Large availability is exact");
  const cart = await request(`${api.commerce}/carts`, { method: "POST", body: { anonymousId: `guest-${runId}`, storeId: ids.berlinStore.toString(), cityId: ids.berlin.toString(), currency: "EUR" } }); cartId = cart._id;
  await request(`${api.commerce}/carts/${cartId}/items`, { method: "POST", body: { variantId: ids.whiteLarge.toString(), quantity: 1 } });
  const checkoutInput = { cartId, storeId: ids.berlinStore.toString(), customer: { anonymousId: `guest-${runId}`, email: "vertical@example.com", firstName: "Vertical", lastName: "Test" }, paymentMethodToken: "sandbox-success", idempotencyKey: `checkout-${runId}`, correlationId: runId };
  const checkout = await request(`${api.commerce}/checkouts`, { method: "POST", body: checkoutInput }); orderId = checkout.order._id; paymentId = checkout.payment._id;
  const duplicate = await request(`${api.commerce}/checkouts`, { method: "POST", body: checkoutInput }); assert.equal(duplicate.order._id, orderId); log("PASS", "Duplicate checkout returns the same order");
  const webhook = { eventId: `webhook-${runId}`, paymentId, outcome: "succeeded" };
  const signature = createHmac("sha256", env.SANDBOX_WEBHOOK_SECRET || "najib-local-sandbox-secret").update(`${webhook.eventId}.${webhook.paymentId}.${webhook.outcome}`).digest("hex");
  const webhookResult = await request(`${api.payment}/webhooks/sandbox`, { method: "POST", headers: { "x-sandbox-signature": signature }, body: webhook }); assert.equal(webhookResult.callbackDelivered, true, JSON.stringify(webhookResult));
  const order = await request(`${api.commerce}/orders/${orderId}`); assert.equal(order.status, "confirmed"); assert.equal(order.items[0].colorName, "White"); assert.equal(order.items[0].sizeName, "Large"); log("PASS", "Verified payment confirms the White/Large order");
  const current = await inventory.collection("inventorybalances").find({ productVariantId: { $in: [ids.whiteLarge.toString(), ids.whiteSmall.toString(), ids.blackLarge.toString()] } }).toArray();
  const stock = (variant, location) => current.find((item) => item.productVariantId === variant.toString() && item.inventoryLocationId.equals(location));
  assert.equal(stock(ids.whiteLarge, ids.berlinLocation).onHand, 2); assert.equal(stock(ids.whiteSmall, ids.berlinLocation).onHand, 3); assert.equal(stock(ids.blackLarge, ids.berlinLocation).onHand, 3); assert.equal(stock(ids.whiteLarge, ids.dubaiLocation).onHand, 3); log("PASS", "Only Berlin White/Large stock changed from 3 to 2");
  assert.equal(await customer.collection("customeractivityevents").countDocuments({ correlationId: runId, eventType: "PurchaseCompleted" }), 1);
  assert.equal(await commerce.collection("outboxes").countDocuments({ correlationId: runId, eventType: "commerce.order.confirmed.v1" }), 1);
  assert.equal(await commerce.collection("outboxes").countDocuments({ correlationId: runId, destination: "accounting" }), 1); log("PASS", "Activity, OrderConfirmed, and accounting work are recorded");
  log("SUCCESS", "Berlin / White / Large vertical slice passed");
} finally {
  log("CLEANUP", "Removing isolated vertical-slice data");
  await customer.collection("customeractivityevents").deleteMany({ correlationId: runId });
  const paymentIds = orderId ? (await payment.collection("payments").find({ orderId }).project({ _id: 1 }).toArray()).map((item) => item._id) : [];
  await payment.collection("paymentattempts").deleteMany({ paymentId: { $in: paymentIds } }); await payment.collection("payments").deleteMany({ _id: { $in: paymentIds } });
  await inventory.collection("stockmovements").deleteMany({ correlationId: runId }); if (orderId) await inventory.collection("inventoryreservations").deleteMany({ orderId });
  await inventory.collection("inventorybalances").deleteMany({ productVariantId: { $in: [ids.whiteLarge.toString(), ids.whiteSmall.toString(), ids.blackLarge.toString()] } });
  await inventory.collection("storeinventorypoolbindings").deleteMany({ storeId: { $in: [ids.berlinStore, ids.dubaiStore] } }); await inventory.collection("inventorylocations").deleteMany({ _id: { $in: [ids.berlinLocation, ids.dubaiLocation] } }); await inventory.collection("stores").deleteMany({ _id: { $in: [ids.berlinStore, ids.dubaiStore] } }); await inventory.collection("inventorypools").deleteMany({ _id: { $in: [ids.berlinPool, ids.dubaiPool] } }); await inventory.collection("cities").deleteMany({ _id: { $in: [ids.berlin, ids.dubai] } });
  await commerce.collection("outboxes").deleteMany({ correlationId: runId }); if (orderId) await commerce.collection("orders").deleteOne({ _id: new mongoose.Types.ObjectId(orderId) }); await commerce.collection("checkoutsessions").deleteMany({ correlationId: runId }); await commerce.collection("carts").deleteMany({ anonymousId: `guest-${runId}` });
  await commerce.collection("productvariants").deleteMany({ _id: { $in: [ids.whiteLarge, ids.whiteSmall, ids.blackLarge] } }); await commerce.collection("products").deleteOne({ _id: ids.product }); await commerce.collection("colors").deleteMany({ _id: { $in: [ids.white, ids.black] } }); await commerce.collection("sizes").deleteMany({ _id: { $in: [ids.large, ids.small] } }); await commerce.collection("sizegroups").deleteOne({ _id: ids.sizeGroup }); await commerce.collection("subcategories").deleteOne({ _id: ids.subcategory }); await commerce.collection("categories").deleteOne({ _id: ids.category });
  await root.close();
}
