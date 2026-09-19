import { requireAdminApiPermission } from "@/lib/admin/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { inventoryService } from "@/services/inventory/service";

export async function POST(request: Request) {
  try {
    const staff = await requireAdminApiPermission("inventory.write");
    return jsonResponse(await inventoryService.adjust(await request.json(), staff.id), {
      status: 201,
      cache: "no-store",
    });
  } catch (error) {
    return jsonError(error);
  }
}
