import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const productLinkSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: Schema.Types.ObjectId,
      ref: "ProductVariant",
    },
    label: { type: String, trim: true, maxlength: 120 },
    hotspotX: { type: Number, min: 0, max: 100 },
    hotspotY: { type: Number, min: 0, max: 100 },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: true },
);

productLinkSchema.pre("validate", function validateHotspotCoordinates() {
  const hasX = this.hotspotX !== null && this.hotspotX !== undefined;
  const hasY = this.hotspotY !== null && this.hotspotY !== undefined;
  if (hasX !== hasY) {
    this.invalidate("hotspotY", "Hotspot X and Y must be provided together");
  }
});

const imageAssetSchema = new Schema(
  {
    url: { type: String, required: true, trim: true, maxlength: 2000 },
    alt: { type: String, required: true, trim: true, maxlength: 500 },
    kind: {
      type: String,
      enum: [
        "product",
        "category_banner",
        "subcategory_banner",
        "collection_banner",
        "editorial",
        "lookbook",
      ],
      required: true,
      index: true,
    },
    width: { type: Number, min: 1, validate: Number.isSafeInteger },
    height: { type: Number, min: 1, validate: Number.isSafeInteger },
    focalPointX: { type: Number, min: 0, max: 100, default: 50 },
    focalPointY: { type: Number, min: 0, max: 100, default: 50 },
    linkedProducts: { type: [productLinkSchema], default: [] },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

imageAssetSchema.index({ "linkedProducts.productId": 1 });

export type ImageAssetDocument = InferSchemaType<typeof imageAssetSchema>;
export const ImageAsset =
  models.ImageAsset || model("ImageAsset", imageAssetSchema);

