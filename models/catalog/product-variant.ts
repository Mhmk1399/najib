import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const productVariantSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    colorId: {
      type: Schema.Types.ObjectId,
      ref: "Color",
      required: true,
      index: true,
    },
    sizeId: {
      type: Schema.Types.ObjectId,
      ref: "Size",
      required: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 80,
    },
    barcode: { type: String, trim: true, maxlength: 120 },
    priceOverrideMinor: {
      type: Number,
      min: 0,
      validate: Number.isSafeInteger,
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

productVariantSchema.index(
  { productId: 1, colorId: 1, sizeId: 1 },
  { unique: true },
);
productVariantSchema.index({ sku: 1 }, { unique: true });
productVariantSchema.index(
  { barcode: 1 },
  { unique: true, sparse: true },
);

export type ProductVariantDocument = InferSchemaType<
  typeof productVariantSchema
>;
export const ProductVariant =
  models.ProductVariant || model("ProductVariant", productVariantSchema);

