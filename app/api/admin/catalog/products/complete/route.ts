import { requireAdminApiPermission } from "@/lib/admin/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { productComposerService } from "@/services/catalog/product-composer-service";

export async function POST(request: Request) {
  try {
    const staff = await requireAdminApiPermission("catalog.write");
    if (!staff.permissions.includes("inventory.write")) {
      await requireAdminApiPermission("inventory.write");
    }
    const input = productComposerService.parse(await request.json());
    return jsonResponse(await productComposerService.create(input, staff.id), { status: 201, cache: "no-store" });
  } catch (error) {
    return jsonError(error);
  }
}

