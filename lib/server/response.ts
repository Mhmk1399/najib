import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isApiError } from "@/lib/server/errors";

type JsonOptions = {
  status?: number;
  cache?: "public" | "private" | "no-store";
  startedAt?: number;
};

const cacheHeaders = {
  public: "public, s-maxage=60, stale-while-revalidate=300",
  private: "private, max-age=0, must-revalidate",
  "no-store": "no-store",
} as const;

export function jsonResponse(data: unknown, options: JsonOptions = {}) {
  const headers = new Headers({
    "Cache-Control": cacheHeaders[options.cache ?? "no-store"],
    "X-Content-Type-Options": "nosniff",
  });

  if (options.startedAt !== undefined) {
    headers.set("Server-Timing", `app;dur=${(performance.now() - options.startedAt).toFixed(1)}`);
  }

  return NextResponse.json(data, { status: options.status ?? 200, headers });
}

export function jsonError(error: unknown) {
  if (isApiError(error)) {
    return jsonResponse(
      { error: error.message, ...(error.details === undefined ? {} : { details: error.details }) },
      { status: error.status, cache: "no-store" },
    );
  }
  if (error instanceof ZodError) {
    return jsonResponse({ error: "Validation failed.", details: error.issues }, { status: 400 });
  }
  if (error instanceof Error && error.message === "MONGODB_URI is not configured.") {
    return jsonResponse({ error: "Database is not configured." }, { status: 503 });
  }
  if (error instanceof Error && error.message === "S3 upload storage is not configured.") {
    return jsonResponse({ error: "Upload storage is not configured." }, { status: 503 });
  }
  return jsonResponse({ error: "Internal server error." }, { status: 500 });
}
