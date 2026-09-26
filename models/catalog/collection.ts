import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;
import { requiredSlugField } from "./_catalog-fields";
import { createLocalizedTextSchema, requiredLocalizedNameField } from "./_localized-content";
import {
  defaultImageFit,
  defaultImagePosition,
  imageObjectFits,
  imageObjectPositions,
} from "@/lib/catalog/image-presentation";

const collectionSchema = new Schema(
  {
    name: requiredLocalizedNameField,
    slug: requiredSlugField,
    description: { type: createLocalizedTextSchema(4000, false) },
    productIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Product" }],
      default: [],
    },
    heroImageId: { type: Schema.Types.ObjectId, ref: "ImageAsset" },
    heroObjectFit: {
      type: String,
      enum: imageObjectFits,
      default: defaultImageFit,
    },
    heroObjectPosition: {
      type: String,
      enum: imageObjectPositions,
      default: defaultImagePosition,
    },
    isActive: { type: Boolean, default: true, index: true },
    startsAt: Date,
    endsAt: Date,
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

collectionSchema.index({ slug: 1 }, { unique: true });
collectionSchema.index({ isActive: 1, sortOrder: 1, _id: 1 });
collectionSchema.index({ isActive: 1, productIds: 1, sortOrder: 1 });

export type CollectionDocument = InferSchemaType<typeof collectionSchema>;
export const Collection =
  models.Collection || model("Collection", collectionSchema);
