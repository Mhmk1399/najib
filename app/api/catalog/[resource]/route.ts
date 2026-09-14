import { getAdminSession } from "@/lib/admin/auth";
import { forbidden, unauthorized } from "@/lib/server/errors";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { catalogService } from "@/services/catalog/service";

type RouteContext = { params: Promise<{ resource: string }> };

const allowedQueryKeys = new Set(["page", "limit", "search", "isActive", "status", "categoryId", "subcategoryId", "productId", "sizeGroupId", "kind"]);

async function assertCatalogAccess(write = false) {
  const session = await getAdminSession();
  if (!session || !session.staff.permissions.includes("admin.access")) unauthorized("Your staff session has expired.");
  const permission = write ? "catalog.write" : "catalog.read";
  if (!session.staff.permissions.includes(permission)) forbidden("You do not have permission for this catalog action.");
}

function queryFrom(request: Request) {
  const url = new URL(request.url);
  const query: Record<string, string> = {};
  for (const [key, value] of url.searchParams) {
    if (!allowedQueryKeys.has(key)) throw new Error(`Unsupported catalog filter: ${key}.`);
    query[key] = value;
  }
  return query;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    await assertCatalogAccess(false);
    const resource = catalogService.parseResource((await context.params).resource);
    const query = catalogService.parseListQuery(queryFrom(request));
    return jsonResponse(await catalogService.list(resource, query), { cache: "no-store" });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unsupported catalog filter:")) {
      return jsonResponse({ error: error.message }, { status: 400 });
    }
    return jsonError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    await assertCatalogAccess(true);
    const resource = catalogService.parseResource((await context.params).resource);
    const payload = catalogService.parseCreate(resource, await request.json());
    return jsonResponse(await catalogService.create(resource, payload), {
      status: 201,
      cache: "no-store",
    });
  } catch (error) {
    return jsonError(error);
  }
}
