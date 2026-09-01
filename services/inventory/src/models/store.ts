import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const storeSchema = new Schema(
  {
    cityId: {
      type: Schema.Types.ObjectId,
      ref: "City",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 40,
    },
    address: { type: String, trim: true, maxlength: 1000 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

storeSchema.index({ code: 1 }, { unique: true });

const storeInventoryPoolBindingSchema = new Schema(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    inventoryPoolId: {
      type: Schema.Types.ObjectId,
      ref: "InventoryPool",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    effectiveFrom: { type: Date, required: true, default: Date.now },
    effectiveUntil: Date,
  },
  { timestamps: true },
);

storeInventoryPoolBindingSchema.index(
  { storeId: 1, inventoryPoolId: 1 },
  { unique: true },
);

export type StoreDocument = InferSchemaType<typeof storeSchema>;
export type StoreInventoryPoolBindingDocument = InferSchemaType<
  typeof storeInventoryPoolBindingSchema
>;
export const Store = models.Store || model("Store", storeSchema);
export const StoreInventoryPoolBinding =
  models.StoreInventoryPoolBinding ||
  model("StoreInventoryPoolBinding", storeInventoryPoolBindingSchema);

