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
  return NextResponse.json({ error: "Internal server error." }, { status: 500 });
}
