import { requireAdminApiPermission } from "@/lib/admin/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { adminAuditService, auditListQuerySchema } from "@/services/admin/audit";

export async function GET(request: Request) {
  try {
    const staff = await requireAdminApiPermission();
    if (!staff.permissions.includes("settings.manage") && !staff.permissions.includes("staff.manage")) {
      await requireAdminApiPermission("settings.manage");
    }
    const query = auditListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return jsonResponse(await adminAuditService.list(query), { cache: "no-store" });
  } catch (error) {
    return jsonError(error);
  }
}
