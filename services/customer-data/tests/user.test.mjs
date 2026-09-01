import test from "node:test";
import assert from "node:assert/strict";
import customerModels from "../dist/index.js";

const { CustomerActivityEvent, CustomerPreferenceProfile, User } = customerModels;

test("new users default to the customer role", async () => {
  const user = new User({
    email: "CUSTOMER@EXAMPLE.COM",
    firstName: "N",
    lastName: "Customer",
  });

  await user.validate();
  assert.deepEqual(user.roles, ["customer"]);
  assert.equal(user.email, "customer@example.com");
});

test("the user email index is unique", () => {
  const index = User.schema.indexes().find(([fields]) => fields.email === 1);
  assert.ok(index);
  assert.equal(index[1].unique, true);
});

test("unknown staff roles are rejected", async () => {
  const user = new User({
    email: "invalid@example.com",
    firstName: "Invalid",
    lastName: "Role",
    roles: ["owner"],
  });

  await assert.rejects(user.validate(), /not a valid enum value/);
});

test("anonymous customer history is stored as activity events", async () => {
  const event = new CustomerActivityEvent({
    eventId: "event_123",
    eventType: "ProductViewed",
    anonymousId: "visitor_123",
    sessionId: "session_123",
    productId: "product_123",
    correlationId: "correlation_123",
    consentScope: "personalization",
  });

  await event.validate();
  assert.equal(event.eventType, "ProductViewed");
});

test("preference profiles store derived signals rather than unlimited raw history", async () => {
  const profile = new CustomerPreferenceProfile({
    userId: "507f1f77bcf86cd799439011",
    modelVersion: "preferences-v1",
    signals: [
      {
        kind: "color",
        value: "navy",
        confidence: 0.82,
        evidenceCount: 6,
        source: "activity",
      },
    ],
  });

  await profile.validate();
  assert.equal(profile.signals[0].value, "navy");
});
