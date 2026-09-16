import { requireAdminApiPermission } from "@/lib/admin/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { cartListQuerySchema, commerceOperationsService } from "@/services/admin/commerce-operations";

export async function GET(request: Request) {
  try {
    await requireAdminApiPermission("orders.read");
    const query = cartListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return jsonResponse(await commerceOperationsService.listCarts(query), { cache: "no-store" });
  } catch (error) {
    return jsonError(error);
  }
}
