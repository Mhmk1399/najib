import mongoose from "mongoose";

const { Schema } = mongoose;

const pageBannerSchema = new Schema(
  {
    imageId: {
      type: Schema.Types.ObjectId,
      ref: "ImageAsset",
      required: true,
    },
    eyebrow: { type: String, trim: true, maxlength: 120 },
    heading: { type: String, required: true, trim: true, maxlength: 240 },
    body: { type: String, trim: true, maxlength: 1200 },
    ctaLabel: { type: String, trim: true, maxlength: 80 },
    ctaHref: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false },
);

const pageDescriptionSchema = new Schema(
  {
    heading: { type: String, trim: true, maxlength: 240 },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
  },
  { _id: false },
);

export const categoryPageContentSchema = new Schema(
  {
    primaryBanner: { type: pageBannerSchema, required: true },
    primaryDescription: { type: pageDescriptionSchema, required: true },
    secondaryBanner: { type: pageBannerSchema, required: true },
    secondaryDescription: { type: pageDescriptionSchema, required: true },
    seoTitle: { type: String, trim: true, maxlength: 70 },
    seoDescription: { type: String, trim: true, maxlength: 170 },
  },
  { _id: false },
);

