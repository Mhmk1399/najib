import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const adjustmentLineSchema = new Schema(
  {
    productVariantId: { type: String, required: true, trim: true },
    quantityDelta: {
      type: Number,
      required: true,
      validate: {
        validator: (value: number) => Number.isSafeInteger(value) && value !== 0,
        message: "Adjustment quantity must be a non-zero integer",
      },
    },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { _id: false },
);

const inventoryAdjustmentSchema = new Schema(
  {
    adjustmentNumber: { type: String, required: true, trim: true, uppercase: true },
    idempotencyKey: { type: String, required: true, trim: true },
    inventoryLocationId: {
      type: Schema.Types.ObjectId,
      ref: "InventoryLocation",
      required: true,
      index: true,
    },
    lines: {
      type: [adjustmentLineSchema],
      required: true,
      validate: [
        (lines: unknown[]) => lines.length > 0,
        "Adjustment requires at least one line",
      ],
    },
    status: {
      type: String,
      enum: ["draft", "approved", "applied", "rejected", "cancelled"],
      default: "draft",
      index: true,
    },
    requestedBy: { type: String, required: true, trim: true },
    approvedBy: { type: String, trim: true },
    appliedAt: Date,
    correlationId: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

inventoryAdjustmentSchema.index({ adjustmentNumber: 1 }, { unique: true });
inventoryAdjustmentSchema.index({ idempotencyKey: 1 }, { unique: true });

export type InventoryAdjustmentDocument = InferSchemaType<
  typeof inventoryAdjustmentSchema
>;
export const InventoryAdjustment =
  models.InventoryAdjustment ||
  model("InventoryAdjustment", inventoryAdjustmentSchema);

