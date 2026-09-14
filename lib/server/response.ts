import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isApiError } from "@/lib/server/errors";

export function jsonError(error: unknown) {
  if (isApiError(error)) {
    return NextResponse.json(
      { error: error.message, ...(error.details === undefined ? {} : { details: error.details }) },
      { status: error.status },
    );
  }
  if (error instanceof ZodError) {
    return NextResponse.json({ error: "Validation failed.", details: error.issues }, { status: 400 });
  }
  if (error instanceof Error && error.message === "MONGODB_URI is not configured.") {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }
  if (error instanceof Error && error.message === "S3 upload storage is not configured.") {
    return NextResponse.json({ error: "Upload storage is not configured." }, { status: 503 });
  }
  if (isStorageProviderError(error)) {
    return NextResponse.json(
      {
        error:
          "Upload storage rejected the file. Check S3 endpoint, bucket, credentials, ACL, and public URL settings.",
      },
      { status: 502 },
    );
  }
  return NextResponse.json({ error: "Internal server error." }, { status: 500 });
}

function isStorageProviderError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const withMetadata = error as Error & {
    $metadata?: { httpStatusCode?: number };
    Code?: string;
    code?: string;
  };
  if (withMetadata.$metadata?.httpStatusCode) return true;
  const code = withMetadata.Code ?? withMetadata.code ?? error.name;
  return [
    "AccessDenied",
    "CredentialsProviderError",
    "InvalidAccessKeyId",
    "NoSuchBucket",
    "SignatureDoesNotMatch",
  ].includes(code);
}
