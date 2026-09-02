import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;
import { requiredNameField, requiredSlugField } from "./_catalog-fields.js";

const collectionSchema = new Schema(
  {
    name: requiredNameField,
    slug: requiredSlugField,
    description: { type: String, trim: true, maxlength: 4000 },
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
