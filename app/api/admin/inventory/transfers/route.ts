import { requireAdminApiPermission } from "@/lib/admin/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { inventoryListQuerySchema } from "@/services/inventory/schemas";
import { inventoryService } from "@/services/inventory/service";

export async function GET(request: Request) {
  try {
    await requireAdminApiPermission("inventory.read");
    const query = inventoryListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return jsonResponse(await inventoryService.listTransfers(query), { cache: "no-store" });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const staff = await requireAdminApiPermission("inventory.write");
    return jsonResponse(await inventoryService.transfer(await request.json(), staff.id), {
      status: 201,
      cache: "no-store",
    });
  } catch (error) {
    return jsonError(error);
  }
}
