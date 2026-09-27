import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { badRequest, forbidden, unauthorized } from "@/lib/server/errors";
import { jsonError } from "@/lib/server/response";
import { connectToDatabase } from "@/lib/server/db";
import { ImageAsset } from "@/models/catalog/image-asset";
import { uploadToBucket } from "@/services/storage/s3-upload";

export const runtime = "nodejs";

const MAX_CATALOG_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const allowedKinds = [
  "product",
  "category_banner",
  "subcategory_banner",
  "collection_banner",
  "editorial",
  "lookbook",
] as const;

type CatalogImageKind = (typeof allowedKinds)[number];

async function assertCatalogUploadAccess() {
  const session = await getAdminSession();
  if (!session || !session.staff.permissions.includes("admin.access")) {
    unauthorized("نشست ادمین منقضی شده است؛ دوباره وارد شوید.");
  }
  if (!session.staff.permissions.includes("catalog.write")) {
    forbidden("دسترسی آپلود تصویر برای حساب شما فعال نیست.");
  }
}

function parseKind(request: Request): CatalogImageKind {
  const kind = new URL(request.url).searchParams.get("kind");
  if (!kind || !allowedKinds.includes(kind as CatalogImageKind)) {
    badRequest("کاربرد تصویر معتبر نیست.");
  }
  return kind as CatalogImageKind;
}

function filenameAlt(fileName: string) {
  const base = fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim();
  return base || "Catalog image";
}

function optionalAlt(body: FormData, key: string, fallback: string) {
  const value = body.get(key);
  if (typeof value !== "string") return fallback;
  const clean = value.trim();
  if (clean.length > 500) badRequest("متن جایگزین تصویر باید حداکثر ۵۰۰ نویسه باشد.");
  return clean || fallback;
}

export async function POST(request: Request) {
  try {
    await assertCatalogUploadAccess();

    const kind = parseKind(request);
    const body = await request.formData();
    const file = body.get("file");
    if (!(file instanceof File)) badRequest("انتخاب فایل تصویر الزامی است.");
    if (!IMAGE_EXTENSIONS[file.type]) {
      badRequest("تصویر باید از نوع JPG، PNG یا WebP باشد.");
    }
    if (file.size > MAX_CATALOG_IMAGE_SIZE_BYTES) {
      badRequest("حجم تصویر باید کمتر از ۵ مگابایت باشد.");
    }
    const fallbackAlt = filenameAlt(file.name);
    const alt = {
      fa: optionalAlt(body, "altFa", fallbackAlt),
      en: optionalAlt(body, "altEn", fallbackAlt),
      ar: optionalAlt(body, "altAr", fallbackAlt),
    };

    const extension = IMAGE_EXTENSIONS[file.type];
    const result = await uploadToBucket({
      buffer: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
      extension,
      folder: `catalog/${kind}`,
      metadata: {
        originalName: file.name.slice(0, 180),
        purpose: "catalog-image",
        kind,
      },
    });

    await connectToDatabase();
    const image = await ImageAsset.create({
      url: result.url,
      alt,
      kind,
      objectFit: "cover",
      objectPosition: "center",
      isActive: true,
    });

    return NextResponse.json({
      imageId: String(image._id),
      image: {
        _id: String(image._id),
        url: image.url,
        alt: image.alt,
        kind: image.kind,
        objectFit: image.objectFit,
        objectPosition: image.objectPosition,
        isActive: image.isActive,
      },
      url: result.url,
      key: result.key,
      bucket: result.bucket,
      size: result.size,
      contentType: result.contentType,
    });
  } catch (error) {
    return jsonError(error);
  }
}
