import { z } from "zod";
import { requireAdminApiPermission } from "@/lib/admin/api-access";
import { notFound } from "@/lib/server/errors";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { isInventoryMasterResource, isInventoryResource } from "@/services/inventory/schemas";
import { inventoryService } from "@/services/inventory/service";

type RouteContext = { params: Promise<{ resource: string; id: string }> };
const detailQuerySchema = z.object({ include: z.enum(["references"]).optional() }).strict();

export async function GET(request: Request, context: RouteContext) {
  try {
    await requireAdminApiPermission("inventory.read");
    const { resource, id } = await context.params;
    if (!isInventoryResource(resource)) notFound("منبع موجودی پیدا نشد.");
    const query = detailQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return jsonResponse(await inventoryService.get(resource, id, query.include), { cache: "no-store" });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const staff = await requireAdminApiPermission("inventory.write");
    const { resource, id } = await context.params;
    if (!isInventoryMasterResource(resource)) notFound("این منبع مستقیماً قابل ویرایش نیست.");
    return jsonResponse(await inventoryService.updateMaster(resource, id, await request.json(), staff.id), {
      cache: "no-store",
    });
  } catch (error) {
    return jsonError(error);
  }
}
