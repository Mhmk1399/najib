import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { forbidden, unauthorized } from "@/lib/server/errors";
import { jsonError } from "@/lib/server/response";
import { catalogService } from "@/services/catalog/service";

type RouteContext = { params: Promise<{ resource: string; id: string }> };

async function assertCatalogAccess(write = false) {
  const session = await getAdminSession();
  if (!session || !session.staff.permissions.includes("admin.access")) unauthorized("Your staff session has expired.");
  const permission = write ? "catalog.write" : "catalog.read";
  if (!session.staff.permissions.includes(permission)) forbidden("You do not have permission for this catalog action.");
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await assertCatalogAccess(false);
    const { resource: rawResource, id: rawId } = await context.params;
    const resource = catalogService.parseResource(rawResource);
    const id = catalogService.parseId(rawId);
    return NextResponse.json(await catalogService.findById(resource, id));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await assertCatalogAccess(true);
    const { resource: rawResource, id: rawId } = await context.params;
    const resource = catalogService.parseResource(rawResource);
    const id = catalogService.parseId(rawId);
    const payload = catalogService.parseUpdate(resource, await request.json());
    return NextResponse.json(await catalogService.update(resource, id, payload));
  } catch (error) {
    return jsonError(error);
  }
}
