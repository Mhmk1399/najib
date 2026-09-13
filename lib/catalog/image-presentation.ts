export const imageObjectFits = [
  "cover",
  "contain",
  "fill",
  "none",
  "scale-down",
] as const;

export const imageObjectPositions = [
  "center",
  "top",
  "bottom",
  "left",
  "right",
  "left top",
  "right top",
  "left bottom",
  "right bottom",
] as const;

export type ImageObjectFit = (typeof imageObjectFits)[number];
export type ImageObjectPosition = (typeof imageObjectPositions)[number];

export const defaultImageFit: ImageObjectFit = "cover";
export const defaultImagePosition: ImageObjectPosition = "center";

export type ImagePresentation = {
  objectFit?: ImageObjectFit;
  objectPosition?: ImageObjectPosition;
};
