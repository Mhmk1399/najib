import { requireCustomerApiAccount } from "@/lib/account/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { createAddress, listAddresses } from "@/services/account/addresses";
export const dynamic = "force-dynamic";
export async function GET() { try { const a = await requireCustomerApiAccount(); return jsonResponse(await listAddresses(a.id)); } catch (e) { return jsonError(e); } }
export async function POST(request: Request) { try { const a = await requireCustomerApiAccount(); return jsonResponse(await createAddress(a.id, await request.json()), { status: 201 }); } catch (e) { return jsonError(e); } }
