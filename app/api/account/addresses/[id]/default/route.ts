import { requireCustomerApiAccount } from "@/lib/account/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { makeDefaultAddress } from "@/services/account/addresses";
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) { try { const a = await requireCustomerApiAccount(); return jsonResponse(await makeDefaultAddress(a.id, (await params).id)); } catch (e) { return jsonError(e); } }
