import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const inventoryBatchRequestSchema = new Schema({
  key: { type: String, required: true, unique: true, trim: true, maxlength: 160 },
  requestHash: { type: String, required: true, trim: true, maxlength: 64 },
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  locationId: { type: Schema.Types.ObjectId, ref: "InventoryLocation", required: true },
  result: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true });

export type InventoryBatchRequestDocument = InferSchemaType<typeof inventoryBatchRequestSchema>;
export const InventoryBatchRequest = models.InventoryBatchRequest || model("InventoryBatchRequest", inventoryBatchRequestSchema);
