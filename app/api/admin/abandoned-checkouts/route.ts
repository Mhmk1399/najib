import { requireAdminApiPermission } from "@/lib/admin/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { abandonedListQuerySchema, commerceOperationsService } from "@/services/admin/commerce-operations";

export async function GET(request: Request) {
  try {
    await requireAdminApiPermission("orders.read");
    const query = abandonedListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return jsonResponse(await commerceOperationsService.listAbandoned(query), { cache: "no-store" });
  } catch (error) {
    return jsonError(error);
  }
}
