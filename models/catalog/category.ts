import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;
import { requiredSlugField } from "./_catalog-fields";
import { categoryPageContentSchema } from "./_category-page-content";
import { createLocalizedTextSchema, requiredLocalizedNameField } from "./_localized-content";
import {
  defaultImageFit,
  defaultImagePosition,
  imageObjectFits,
  imageObjectPositions,
} from "@/lib/catalog/image-presentation";

const categorySchema = new Schema(
  {
    name: requiredLocalizedNameField,
    slug: requiredSlugField,
    description: { type: createLocalizedTextSchema(2000, false) },
    thumbnailImageId: { type: Schema.Types.ObjectId, ref: "ImageAsset" },
    thumbnailObjectFit: {
      type: String,
      enum: imageObjectFits,
      default: defaultImageFit,
    },
    thumbnailObjectPosition: {
      type: String,
      enum: imageObjectPositions,
      default: defaultImagePosition,
    },
    pageContent: { type: categoryPageContentSchema, required: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

categorySchema.index({ slug: 1 }, { unique: true });

export type CategoryDocument = InferSchemaType<typeof categorySchema>;
export const Category = models.Category || model("Category", categorySchema);
