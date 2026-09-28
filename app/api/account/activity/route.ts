import { requireCustomerApiAccount } from "@/lib/account/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { clearBehavior, recordProductView } from "@/services/recommendations/service";
export const dynamic = "force-dynamic";
export async function POST(request: Request) { try { const a = await requireCustomerApiAccount(); return jsonResponse(await recordProductView(a.id, await request.json())); } catch (e) { return jsonError(e); } }
export async function DELETE() { try { const a = await requireCustomerApiAccount(); return jsonResponse(await clearBehavior(a.id)); } catch (e) { return jsonError(e); } }
