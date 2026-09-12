import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;
import { requiredSlugField } from "./_catalog-fields.js";
import { createLocalizedTextSchema, requiredLocalizedNameField } from "./_localized-content.js";

const collectionSchema = new Schema(
  {
    name: requiredLocalizedNameField,
    slug: requiredSlugField,
    description: { type: createLocalizedTextSchema(4000, false) },
    heroImageId: { type: Schema.Types.ObjectId, ref: "ImageAsset" },
    isActive: { type: Boolean, default: true, index: true },
    startsAt: Date,
    endsAt: Date,
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

collectionSchema.index({ slug: 1 }, { unique: true });

export type CollectionDocument = InferSchemaType<typeof collectionSchema>;
export const Collection =
  models.Collection || model("Collection", collectionSchema);
