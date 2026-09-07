import { forwardCatalogRequest } from "@/lib/catalog-gateway";

type RouteContext = { params: Promise<{ resource: string }> };

export async function GET(request: Request, context: RouteContext) {
  return forwardCatalogRequest(request, (await context.params).resource);
}

export async function POST(request: Request, context: RouteContext) {
  return forwardCatalogRequest(request, (await context.params).resource);
}
