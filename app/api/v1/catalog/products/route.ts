import { jsonError, jsonResponse } from "@/lib/server/response";
import { listPublicProducts, publicProductQuerySchema } from "@/lib/server/catalog/public-catalog";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const startedAt = performance.now();

  try {
    const url = new URL(request.url);
    const query = publicProductQuerySchema.parse(Object.fromEntries(url.searchParams));
    const result = await listPublicProducts(query);
    return jsonResponse(result, { cache: "public", startedAt });
  } catch (error) {
    return jsonError(error);
  }
}
