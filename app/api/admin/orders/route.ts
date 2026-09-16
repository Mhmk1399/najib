import { requireAdminApiPermission } from "@/lib/admin/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { commerceOperationsService, orderListQuerySchema } from "@/services/admin/commerce-operations";

export async function GET(request: Request) {
  try {
    await requireAdminApiPermission("orders.read");
    const query = orderListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return jsonResponse(await commerceOperationsService.listOrders(query), { cache: "no-store" });
  } catch (error) {
    return jsonError(error);
  }
}
