import { requireCustomerApiAccount } from "@/lib/account/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { getRecommendations, recommendationQuerySchema } from "@/services/recommendations/service";
export const dynamic = "force-dynamic";
export async function GET(request: Request) { try { const a = await requireCustomerApiAccount(); const q = recommendationQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams.entries())); return jsonResponse(await getRecommendations(a.id, q)); } catch (e) { return jsonError(e); } }
