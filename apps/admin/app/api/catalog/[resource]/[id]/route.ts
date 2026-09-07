import { forwardCatalogRequest } from "@/lib/catalog-gateway";

type RouteContext = { params: Promise<{ resource: string; id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { resource, id } = await context.params;
  return forwardCatalogRequest(request, resource, id);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { resource, id } = await context.params;
  return forwardCatalogRequest(request, resource, id);
}
