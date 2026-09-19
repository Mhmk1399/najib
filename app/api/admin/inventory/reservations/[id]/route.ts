import { requireAdminApiPermission } from "@/lib/admin/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { inventoryService } from "@/services/inventory/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdminApiPermission("inventory.read");
    return jsonResponse(await inventoryService.getReservation((await context.params).id), { cache: "no-store" });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const staff = await requireAdminApiPermission("inventory.write");
    return jsonResponse(
      await inventoryService.actOnReservation((await context.params).id, await request.json(), staff.id),
      { cache: "no-store" },
    );
  } catch (error) {
    return jsonError(error);
  }
}
