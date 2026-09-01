import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const stockMovementSchema = new Schema(
  {
    movementId: { type: String, required: true, trim: true },
    productVariantId: { type: String, required: true, trim: true, index: true },
    inventoryLocationId: {
      type: Schema.Types.ObjectId,
      ref: "InventoryLocation",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "receipt",
        "reservation_created",
        "reservation_released",
        "reservation_committed",
        "adjustment",
        "transfer_out",
        "transfer_in",
        "return",
      ],
      required: true,
      index: true,
    },
    onHandDelta: { type: Number, required: true, validate: Number.isSafeInteger },
    reservedDelta: { type: Number, required: true, validate: Number.isSafeInteger },
    resultingOnHand: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
    resultingReserved: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
    referenceType: {
      type: String,
      enum: ["reservation", "adjustment", "transfer", "order", "receipt"],
      required: true,
    },
    referenceId: { type: String, required: true, trim: true },
    reason: { type: String, trim: true, maxlength: 1000 },
    correlationId: { type: String, required: true, trim: true },
    actorId: { type: String, trim: true },
    occurredAt: { type: Date, required: true, default: Date.now, index: true },
  },
  { timestamps: true },
);

stockMovementSchema.index({ movementId: 1 }, { unique: true });
stockMovementSchema.index(
  { productVariantId: 1, inventoryLocationId: 1, occurredAt: -1 },
);

export type StockMovementDocument = InferSchemaType<typeof stockMovementSchema>;
export const StockMovement =
  models.StockMovement || model("StockMovement", stockMovementSchema);

