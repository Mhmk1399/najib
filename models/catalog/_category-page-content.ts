import mongoose from "mongoose";
import { createLocalizedTextSchema } from "./_localized-content";
import {
  defaultImageFit,
  defaultImagePosition,
  imageObjectFits,
  imageObjectPositions,
} from "@/lib/catalog/image-presentation";

const { Schema } = mongoose;

const pageBannerSchema = new Schema(
  {
    imageId: {
      type: Schema.Types.ObjectId,
      ref: "ImageAsset",
      required: true,
    },
    objectFit: {
      type: String,
      enum: imageObjectFits,
      default: defaultImageFit,
    },
    objectPosition: {
      type: String,
      enum: imageObjectPositions,
      default: defaultImagePosition,
    },
    eyebrow: { type: createLocalizedTextSchema(120, false) },
    heading: { type: createLocalizedTextSchema(240), required: true },
    body: { type: createLocalizedTextSchema(1200, false) },
    ctaLabel: { type: createLocalizedTextSchema(80, false) },
    ctaHref: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false },
);

const pageDescriptionSchema = new Schema(
  {
    heading: { type: createLocalizedTextSchema(240, false) },
    body: { type: createLocalizedTextSchema(5000), required: true },
  },
  { _id: false },
);

export const categoryPageContentSchema = new Schema(
  {
    primaryBanner: { type: pageBannerSchema, required: true },
    primaryDescription: { type: pageDescriptionSchema, required: true },
    secondaryBanner: { type: pageBannerSchema, required: true },
    secondaryDescription: { type: pageDescriptionSchema, required: true },
    seoTitle: { type: createLocalizedTextSchema(70, false) },
    seoDescription: { type: createLocalizedTextSchema(170, false) },
  },
  { _id: false },
);
