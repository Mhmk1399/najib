import { requireAdminApiPermission } from "@/lib/admin/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { commerceOperationsService } from "@/services/admin/commerce-operations";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdminApiPermission("orders.read");
    return jsonResponse(await commerceOperationsService.getCheckout((await context.params).id), { cache: "no-store" });
  } catch (error) {
    return jsonError(error);
  }
}
