import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { badRequest, forbidden, unauthorized } from "@/lib/server/errors";
import { jsonError } from "@/lib/server/response";
import { userManagementService } from "@/services/auth/user-management";

const allowedQueryKeys = new Set([
  "page",
  "limit",
  "search",
  "status",
  "role",
  "sortKey",
  "sortDirection",
]);

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

function queryFrom(request: Request) {
  const url = new URL(request.url);
  const query: Record<string, string> = {};
  for (const [key, value] of url.searchParams) {
    if (!allowedQueryKeys.has(key)) {
      throw new Error(`Unsupported user filter: ${key}.`);
    }
    query[key] = value;
  }
  return query;
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    badRequest("Request body must be valid JSON.");
  }
}

export async function GET(request: Request) {
  try {
    await assertStaffManagementAccess();
    const query = userManagementService.parseListQuery(queryFrom(request));
    return NextResponse.json(await userManagementService.list(query));
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unsupported user filter:")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const staff = await assertStaffManagementAccess();
    return NextResponse.json(
      await userManagementService.create(await readJson(request), staff.id),
      { status: 201 },
    );
  } catch (error) {
    return jsonError(error);
  }
}
