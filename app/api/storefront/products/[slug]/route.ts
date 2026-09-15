import { NextResponse } from "next/server";
import { jsonError } from "@/lib/server/response";
import { badRequest } from "@/lib/server/errors";
import { getStorefrontProductBySlug } from "@/services/catalog/storefront";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const cleanSlug = decodeURIComponent(slug).trim();

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
      badRequest("Product slug is invalid.");
    }

    return NextResponse.json(await getStorefrontProductBySlug(cleanSlug));
  } catch (error) {
    return jsonError(error);
  }
}
