import { NextResponse } from "next/server";
import { jsonError } from "@/lib/server/response";
import { getStorefrontCatalog } from "@/services/catalog/storefront";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getStorefrontCatalog());
  } catch (error) {
    return jsonError(error);
  }
}
