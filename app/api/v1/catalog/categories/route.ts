import { listPublicCategories } from "@/lib/server/catalog/public-catalog";
import { jsonError, jsonResponse } from "@/lib/server/response";

export const runtime = "nodejs";

export async function GET() {
  const startedAt = performance.now();

  try {
    return jsonResponse(await listPublicCategories(), { cache: "public", startedAt });
  } catch (error) {
    return jsonError(error);
  }
}
