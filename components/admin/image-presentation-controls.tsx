"use client";

import type { CSSProperties } from "react";
import { AdminSelect } from "@/components/admin/admin-select";
import {
  defaultImageFit,
  defaultImagePosition,
  imageObjectFits,
  imageObjectPositions,
  type ImageObjectFit,
  type ImageObjectPosition,
} from "@/lib/catalog/image-presentation";

export const fitOptions = imageObjectFits.map((value) => ({
  value,
  label:
    value === "cover"
      ? "پوشش کامل"
      : value === "contain"
        ? "نمایش کامل"
        : value === "fill"
          ? "کشیده"
          : value === "none"
            ? "اندازه اصلی"
            : "کوچک‌سازی",
}));

export const positionOptions = imageObjectPositions.map((value) => ({
  value,
  label:
    value === "center"
      ? "مرکز"
      : value === "top"
        ? "بالا"
        : value === "bottom"
          ? "پایین"
          : value === "left"
            ? "چپ"
            : value === "right"
              ? "راست"
              : value === "left top"
                ? "بالا چپ"
                : value === "right top"
                  ? "بالا راست"
                  : value === "left bottom"
                    ? "پایین چپ"
                    : "پایین راست",
}));

export function imageStyleFor({
  objectFit,
  objectPosition,
  focalPointX,
  focalPointY,
}: {
  objectFit?: ImageObjectFit;
  objectPosition?: ImageObjectPosition;
  focalPointX?: number;
  focalPointY?: number;
}): CSSProperties {
  return {
    objectFit: objectFit || defaultImageFit,
    objectPosition:
      objectPosition && objectPosition !== defaultImagePosition
        ? objectPosition
        : `${focalPointX ?? 50}% ${focalPointY ?? 50}%`,
  };
}

export function ImageFitSelect({
  value,
  onChange,
}: {
  value?: ImageObjectFit;
  onChange: (value: ImageObjectFit) => void;
}) {
  return (
    <AdminSelect
      value={value || defaultImageFit}
      onChange={(next) => onChange(next as ImageObjectFit)}
      options={fitOptions}
    />
  );
}

export function ImagePositionSelect({
  value,
  onChange,
}: {
  value?: ImageObjectPosition;
  onChange: (value: ImageObjectPosition) => void;
}) {
  return (
    <AdminSelect
      value={value || defaultImagePosition}
      onChange={(next) => onChange(next as ImageObjectPosition)}
      options={positionOptions}
    />
  );
}
