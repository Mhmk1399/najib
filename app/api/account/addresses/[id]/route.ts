import { requireCustomerApiAccount } from "@/lib/account/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { deleteAddress, updateAddress } from "@/services/account/addresses";
export const dynamic = "force-dynamic";
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { try { const a = await requireCustomerApiAccount(); return jsonResponse(await updateAddress(a.id, (await params).id, await request.json())); } catch (e) { return jsonError(e); } }
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) { try { const a = await requireCustomerApiAccount(); return jsonResponse(await deleteAddress(a.id, (await params).id)); } catch (e) { return jsonError(e); } }
