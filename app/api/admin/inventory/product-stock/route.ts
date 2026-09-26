import { requireAdminApiPermission } from "@/lib/admin/api-access";
import { forbidden } from "@/lib/server/errors";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { inventoryService } from "@/services/inventory/service";

export async function GET(request: Request) {
  try {
    await requireAdminApiPermission("inventory.read");
    const params = new URL(request.url).searchParams;
    return jsonResponse(await inventoryService.productStock(params.get("productId") ?? "", params.get("locationId") ?? ""), { cache: "no-store" });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const staff = await requireAdminApiPermission("inventory.write");
    if (!staff.permissions.includes("catalog.write")) forbidden("دسترسی catalog.write لازم است.");
    return jsonResponse(await inventoryService.addProductStock(await request.json(), staff.id), { status: 201, cache: "no-store" });
  } catch (error) {
    return jsonError(error);
  }
}
