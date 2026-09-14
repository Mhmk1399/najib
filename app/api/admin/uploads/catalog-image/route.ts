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
    unauthorized("Your staff session has expired.");
  }
  if (!session.staff.permissions.includes("catalog.write")) {
    forbidden("You do not have permission to upload catalog images.");
  }
}

function parseKind(request: Request): CatalogImageKind {
  const kind = new URL(request.url).searchParams.get("kind");
  if (!kind || !allowedKinds.includes(kind as CatalogImageKind)) {
    badRequest("A valid catalog image kind is required.");
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

export async function POST(request: Request) {
  try {
    await assertCatalogUploadAccess();

    const kind = parseKind(request);
    const body = await request.formData();
    const file = body.get("file");
    if (!(file instanceof File)) badRequest("Catalog image file is required.");
    if (!IMAGE_EXTENSIONS[file.type]) {
      badRequest("Catalog image must be a JPG, PNG, or WebP image.");
    }
    if (file.size > MAX_CATALOG_IMAGE_SIZE_BYTES) {
      badRequest("Catalog image must be smaller than 5 MB.");
    }

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
    const alt = filenameAlt(file.name);
    const image = await ImageAsset.create({
      url: result.url,
      alt: { fa: alt, en: alt, ar: alt },
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
