import "server-only";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

const resources = new Set([
  "categories",
  "subcategories",
  "collections",
  "colors",
  "size-groups",
  "sizes",
  "products",
  "variants",
  "images",
]);

const queryKeys = new Set([
  "page",
  "limit",
  "search",
  "isActive",
  "status",
  "categoryId",
  "subcategoryId",
  "productId",
  "sizeGroupId",
  "kind",
]);

function commerceApiUrl(): string {
  return (process.env.COMMERCE_API_URL || "http://127.0.0.1:4001/api/v1").replace(/\/$/, "");
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function forwardCatalogRequest(
  request: Request,
  resource: string,
  id?: string,
): Promise<NextResponse> {
  if (!resources.has(resource)) return jsonError("Catalog resource not found.", 404);

  const method = request.method.toUpperCase();
  if (!["GET", "POST", "PATCH"].includes(method)) return jsonError("Method not allowed.", 405);

  const session = await getAdminSession();
  if (!session || !session.staff.permissions.includes("admin.access")) {
    return jsonError("Your staff session has expired.", 401);
  }

  const requiredPermission = method === "GET" ? "catalog.read" : "catalog.write";
  if (!session.staff.permissions.includes(requiredPermission)) {
    return jsonError("You do not have permission for this catalog action.", 403);
  }

  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(`${commerceApiUrl()}/catalog/${resource}${id ? `/${encodeURIComponent(id)}` : ""}`);
  for (const [key, value] of incomingUrl.searchParams) {
    if (!queryKeys.has(key)) return jsonError(`Unsupported catalog filter: ${key}.`, 400);
    upstreamUrl.searchParams.append(key, value);
  }

  const headers: HeadersInit = {
    accept: "application/json",
    authorization: `Bearer ${session.accessToken}`,
  };
  let body: string | undefined;
  if (method !== "GET") {
    const declaredLength = Number(request.headers.get("content-length") || 0);
    if (declaredLength > 128_000) return jsonError("Catalog request is too large.", 413);
    body = await request.text();
    if (body.length > 128_000) return jsonError("Catalog request is too large.", 413);
    try {
      JSON.parse(body);
    } catch {
      return jsonError("Invalid JSON request.", 400);
    }
    headers["content-type"] = "application/json";
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    const text = await upstream.text();
    if (!text) return new NextResponse(null, { status: upstream.status });
    try {
      return NextResponse.json(JSON.parse(text), { status: upstream.status });
    } catch {
      return jsonError("The catalog service returned an invalid response.", 502);
    }
  } catch {
    return jsonError("The catalog service is temporarily unavailable.", 503);
  }
}
