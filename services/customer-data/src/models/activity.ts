import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

export const CUSTOMER_ACTIVITY_TYPES = [
  "PageViewed",
  "ProductViewed",
  "ColorSelected",
  "SizeSelected",
  "SearchPerformed",
  "RecommendationShown",
  "RecommendationClicked",
  "ProductSaved",
  "CartItemAdded",
  "CartItemRemoved",
  "CheckoutStarted",
  "CheckoutAbandoned",
  "OrderViewed",
  "PurchaseCompleted",
] as const;

const customerActivityEventSchema = new Schema(
  {
    eventId: { type: String, required: true, trim: true },
    eventType: {
      type: String,
      enum: CUSTOMER_ACTIVITY_TYPES,
      required: true,
      index: true,
    },
    schemaVersion: { type: Number, required: true, min: 1, default: 1 },
    anonymousId: { type: String, trim: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    sessionId: { type: String, required: true, trim: true, index: true },
    storeId: { type: String, trim: true },
    cityId: { type: String, trim: true },
    productId: { type: String, trim: true },
    variantId: { type: String, trim: true },
    correlationId: { type: String, required: true, trim: true },
    causationId: { type: String, trim: true },
    consentScope: {
      type: String,
      enum: ["essential", "analytics", "personalization", "marketing"],
      required: true,
    },
    occurredAt: { type: Date, required: true, default: Date.now, index: true },
    payload: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

customerActivityEventSchema.pre("validate", function validateActivityIdentity() {
  if (!this.userId && !this.anonymousId) {
    this.invalidate("anonymousId", "Activity requires userId or anonymousId");
  }
});

customerActivityEventSchema.index({ eventId: 1 }, { unique: true });
customerActivityEventSchema.index({ userId: 1, occurredAt: -1 });
customerActivityEventSchema.index({ anonymousId: 1, occurredAt: -1 });
customerActivityEventSchema.index({ productId: 1, occurredAt: -1 });

const preferenceSignalSchema = new Schema(
  {
    kind: {
      type: String,
      enum: ["color", "size", "category", "style", "price_range", "city", "store"],
      required: true,
    },
    value: { type: String, required: true, trim: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    evidenceCount: { type: Number, required: true, min: 1, validate: Number.isSafeInteger },
    source: {
      type: String,
      enum: ["explicit", "activity", "purchase", "recommendation_feedback"],
      required: true,
    },
    updatedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

const customerPreferenceProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    signals: { type: [preferenceSignalSchema], default: [] },
    recentlyViewedProductIds: { type: [String], default: [] },
    savedProductIds: { type: [String], default: [] },
    rejectedProductIds: { type: [String], default: [] },
    lastComputedAt: { type: Date, required: true, default: Date.now },
    modelVersion: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);
customerPreferenceProfileSchema.index({ userId: 1 }, { unique: true });

const recommendationInteractionSchema = new Schema(
  {
    interactionId: { type: String, required: true, trim: true },
    recommendationId: { type: String, required: true, trim: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    anonymousId: { type: String, trim: true, index: true },
    sessionId: { type: String, required: true, trim: true },
    action: {
      type: String,
      enum: ["shown", "clicked", "saved", "added_to_cart", "rejected", "purchased"],
      required: true,
      index: true,
    },
    productId: { type: String, required: true, trim: true },
    variantId: { type: String, trim: true },
    cityId: { type: String, trim: true },
    occurredAt: { type: Date, required: true, default: Date.now },
    context: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);
recommendationInteractionSchema.pre(
  "validate",
  function validateRecommendationIdentity() {
    if (!this.userId && !this.anonymousId) {
      this.invalidate(
        "anonymousId",
        "Recommendation interaction requires userId or anonymousId",
      );
    }
  },
);
recommendationInteractionSchema.index({ interactionId: 1 }, { unique: true });
recommendationInteractionSchema.index({ userId: 1, occurredAt: -1 });

const customerSessionSchema = new Schema(
  {
    sessionId: { type: String, required: true, trim: true },
    anonymousId: { type: String, required: true, trim: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    storeId: { type: String, trim: true },
    cityId: { type: String, trim: true },
    startedAt: { type: Date, required: true, default: Date.now },
    lastSeenAt: { type: Date, required: true, default: Date.now },
    endedAt: Date,
    consentScopes: { type: [String], default: ["essential"] },
  },
  { timestamps: true },
);
customerSessionSchema.index({ sessionId: 1 }, { unique: true });

export type CustomerActivityEventDocument = InferSchemaType<
  typeof customerActivityEventSchema
>;
export type CustomerPreferenceProfileDocument = InferSchemaType<
  typeof customerPreferenceProfileSchema
>;
export type RecommendationInteractionDocument = InferSchemaType<
  typeof recommendationInteractionSchema
>;
export type CustomerSessionDocument = InferSchemaType<typeof customerSessionSchema>;

export const CustomerActivityEvent =
  models.CustomerActivityEvent ||
  model("CustomerActivityEvent", customerActivityEventSchema);
export const CustomerPreferenceProfile =
  models.CustomerPreferenceProfile ||
  model("CustomerPreferenceProfile", customerPreferenceProfileSchema);
export const RecommendationInteraction =
  models.RecommendationInteraction ||
  model("RecommendationInteraction", recommendationInteractionSchema);
export const CustomerSession =
  models.CustomerSession || model("CustomerSession", customerSessionSchema);
