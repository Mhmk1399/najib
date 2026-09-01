import { InferSchemaType, Schema, model, models } from "mongoose";

export const USER_ROLES = [
  "customer",
  "store_staff",
  "inventory_manager",
  "accountant",
  "customer_support",
  "merchandiser",
  "administrator",
] as const;

const addressSchema = new Schema(
  {
    label: { type: String, trim: true, maxlength: 80 },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    region: { type: String, trim: true },
    postalCode: { type: String, required: true, trim: true },
    countryCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 2,
      maxlength: 2,
    },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const consentSchema = new Schema(
  {
    scope: {
      type: String,
      enum: ["essential", "analytics", "personalization", "marketing"],
      required: true,
    },
    granted: { type: Boolean, required: true },
    source: { type: String, required: true, trim: true },
    recordedAt: { type: Date, required: true, default: Date.now },
    policyVersion: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 320,
    },
    passwordHash: { type: String, select: false },
    firstName: { type: String, required: true, trim: true, maxlength: 100 },
    lastName: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, trim: true },
    roles: {
      type: [{ type: String, enum: USER_ROLES }],
      default: ["customer"],
      required: true,
    },
    permissions: { type: [{ type: String, trim: true }], default: [] },
    allowedStoreIds: { type: [{ type: String, trim: true }], default: [] },
    status: {
      type: String,
      enum: ["invited", "active", "suspended", "deleted"],
      default: "active",
      index: true,
    },
    preferredLocale: { type: String, trim: true, default: "en" },
    preferredCityId: { type: String, trim: true },
    preferredStoreId: { type: String, trim: true },
    addresses: { type: [addressSchema], default: [] },
    consents: { type: [consentSchema], default: [] },
    lastLoginAt: Date,
  },
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });

export type UserDocument = InferSchemaType<typeof userSchema>;
export const User = models.User || model("User", userSchema);

