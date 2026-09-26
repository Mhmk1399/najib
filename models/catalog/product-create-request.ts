import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const productCreateRequestSchema = new Schema(
  {
    key: { type: String, required: true, trim: true, maxlength: 160 },
    requestHash: { type: String, required: true, minlength: 64, maxlength: 64 },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    result: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

productCreateRequestSchema.index({ key: 1 }, { unique: true });

export type ProductCreateRequestDocument = InferSchemaType<typeof productCreateRequestSchema>;
export const ProductCreateRequest =
  models.ProductCreateRequest || model("ProductCreateRequest", productCreateRequestSchema);

