import { requireAdminApiPermission } from "@/lib/admin/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { recoveryService } from "@/services/checkout/recovery";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: RouteContext<"/api/admin/abandoned-checkouts/[id]/recovery-link">) {
  try {
    const staff = await requireAdminApiPermission("orders.write");
    const origin = new URL(request.url).origin;
    return jsonResponse(
      await recoveryService.rotateLink(
        (await context.params).id,
        await request.json(),
        staff.id,
        origin,
      ),
      { status: 201, cache: "no-store" },
    );
  } catch (error) {
    return jsonError(error);
  }
}
