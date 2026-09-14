import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { badRequest, forbidden, unauthorized } from "@/lib/server/errors";
import { jsonError } from "@/lib/server/response";
import { userManagementService } from "@/services/auth/user-management";

type RouteContext = { params: Promise<{ id: string }> };

async function assertStaffManagementAccess() {
  const session = await getAdminSession();
  if (!session || !session.staff.permissions.includes("admin.access")) {
    unauthorized("Your staff session has expired.");
  }
  if (!session.staff.permissions.includes("staff.manage")) {
    forbidden("You do not have permission to manage users.");
  }
  return session.staff;
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    badRequest("Request body must be valid JSON.");
  }
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await assertStaffManagementAccess();
    const { id } = await context.params;
    return NextResponse.json(await userManagementService.findById(id));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const staff = await assertStaffManagementAccess();
    const { id } = await context.params;
    return NextResponse.json(
      await userManagementService.update(id, await readJson(request), staff.id),
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const staff = await assertStaffManagementAccess();
    const { id } = await context.params;
    return NextResponse.json(await userManagementService.delete(id, staff.id));
  } catch (error) {
    return jsonError(error);
  }
}
