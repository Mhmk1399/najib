import { getPublicProduct } from "@/lib/server/catalog/public-catalog";
import { jsonError, jsonResponse } from "@/lib/server/response";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const startedAt = performance.now();

  try {
    const product = await getPublicProduct((await context.params).slug);
    return jsonResponse(product, { cache: "public", startedAt });
  } catch (error) {
    return jsonError(error);
  }
}
