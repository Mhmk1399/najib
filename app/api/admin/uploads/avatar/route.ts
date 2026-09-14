import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { badRequest, forbidden, unauthorized } from "@/lib/server/errors";
import { jsonError } from "@/lib/server/response";
import { uploadToBucket } from "@/services/storage/s3-upload";

export const runtime = "nodejs";

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function assertStaffManagementAccess() {
  const session = await getAdminSession();
  if (!session || !session.staff.permissions.includes("admin.access")) {
    unauthorized("Your staff session has expired.");
  }
  if (!session.staff.permissions.includes("staff.manage")) {
    forbidden("You do not have permission to upload user avatars.");
  }
}

export async function POST(request: Request) {
  try {
    await assertStaffManagementAccess();

    const body = await request.formData();
    const file = body.get("file");
    if (!(file instanceof File)) badRequest("Avatar image file is required.");
    if (!IMAGE_EXTENSIONS[file.type]) {
      badRequest("Avatar must be a JPG, PNG, or WebP image.");
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      badRequest("Avatar image must be smaller than 2 MB.");
    }

    const extension = IMAGE_EXTENSIONS[file.type];
    const result = await uploadToBucket({
      buffer: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
      extension,
      folder: "avatars",
      metadata: {
        originalName: file.name.slice(0, 180),
        purpose: "admin-user-avatar",
      },
    });

    return NextResponse.json({
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
