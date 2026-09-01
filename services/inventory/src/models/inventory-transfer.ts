import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const transferLineSchema = new Schema(
  {
    productVariantId: { type: String, required: true, trim: true },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: Number.isSafeInteger,
    },
  },
  { _id: false },
);

const inventoryTransferSchema = new Schema(
  {
    transferNumber: { type: String, required: true, trim: true, uppercase: true },
    idempotencyKey: { type: String, required: true, trim: true },
    fromLocationId: {
      type: Schema.Types.ObjectId,
      ref: "InventoryLocation",
      required: true,
      index: true,
    },
    toLocationId: {
      type: Schema.Types.ObjectId,
      ref: "InventoryLocation",
      required: true,
      index: true,
    },
    lines: {
      type: [transferLineSchema],
      required: true,
      validate: [
        (lines: unknown[]) => lines.length > 0,
        "Transfer requires at least one line",
      ],
    },
    status: {
      type: String,
      enum: ["draft", "approved", "in_transit", "received", "cancelled"],
      default: "draft",
      index: true,
    },
    requestedBy: { type: String, required: true, trim: true },
    approvedBy: { type: String, trim: true },
    shippedAt: Date,
    receivedAt: Date,
    correlationId: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

inventoryTransferSchema.pre("validate", function preventSameLocationTransfer() {
  if (
    this.fromLocationId &&
    this.toLocationId &&
    this.fromLocationId.equals(this.toLocationId)
  ) {
    this.invalidate("toLocationId", "Transfer locations must be different");
  }
});

inventoryTransferSchema.index({ transferNumber: 1 }, { unique: true });
inventoryTransferSchema.index({ idempotencyKey: 1 }, { unique: true });

export type InventoryTransferDocument = InferSchemaType<
  typeof inventoryTransferSchema
>;
export const InventoryTransfer =
  models.InventoryTransfer || model("InventoryTransfer", inventoryTransferSchema);
