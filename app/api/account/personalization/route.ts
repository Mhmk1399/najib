import { requireCustomerApiAccount } from "@/lib/account/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { getPersonalizationPreference, updatePersonalizationPreference } from "@/services/recommendations/service";
export const dynamic = "force-dynamic";
export async function GET() { try { const a = await requireCustomerApiAccount(); return jsonResponse(await getPersonalizationPreference(a.id)); } catch (e) { return jsonError(e); } }
export async function PATCH(request: Request) { try { const a = await requireCustomerApiAccount(); return jsonResponse(await updatePersonalizationPreference(a.id, await request.json())); } catch (e) { return jsonError(e); } }
