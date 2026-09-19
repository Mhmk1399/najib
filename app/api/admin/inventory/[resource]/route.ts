import { requireAdminApiPermission } from "@/lib/admin/api-access";
import { notFound } from "@/lib/server/errors";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { inventoryListQuerySchema, isInventoryMasterResource, isInventoryResource } from "@/services/inventory/schemas";
import { inventoryService } from "@/services/inventory/service";

type RouteContext = { params: Promise<{ resource: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    await requireAdminApiPermission("inventory.read");
    const { resource } = await context.params;
    if (!isInventoryResource(resource)) notFound("منبع موجودی پیدا نشد.");
    const query = inventoryListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return jsonResponse(await inventoryService.list(resource, query), { cache: "no-store" });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const staff = await requireAdminApiPermission("inventory.write");
    const { resource } = await context.params;
    if (!isInventoryMasterResource(resource)) notFound("این منبع مستقیماً قابل ایجاد نیست.");
    return jsonResponse(await inventoryService.createMaster(resource, await request.json(), staff.id), {
      status: 201,
      cache: "no-store",
    });
  } catch (error) {
    return jsonError(error);
  }
}
