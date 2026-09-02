import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const inventoryBalanceSchema = new Schema(
  {
    productVariantId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    inventoryLocationId: {
      type: Schema.Types.ObjectId,
      ref: "InventoryLocation",
      required: true,
      index: true,
    },
    onHand: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      validate: Number.isSafeInteger,
    },
    reserved: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      validate: Number.isSafeInteger,
    },
    safetyStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      validate: Number.isSafeInteger,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    versionKey: "version",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

inventoryBalanceSchema.virtual("available").get(function availableInventory() {
  return Math.max(0, this.onHand - this.reserved - this.safetyStock);
});

inventoryBalanceSchema.pre("validate", function preventOverReservation() {
  const reservable = Math.max(0, this.onHand - this.safetyStock);
  if (this.reserved > reservable) {
    this.invalidate("reserved", "Reserved inventory exceeds available inventory");
  }
});

inventoryBalanceSchema.index(
  { productVariantId: 1, inventoryLocationId: 1 },
  { unique: true },
);

export type InventoryBalanceDocument = InferSchemaType<
  typeof inventoryBalanceSchema
>;
export const InventoryBalance =
  models.InventoryBalance || model("InventoryBalance", inventoryBalanceSchema);

