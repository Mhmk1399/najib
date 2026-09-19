import { NextResponse } from "next/server";

import { jsonError } from "@/lib/server/response";
import { getStorefrontImageStories } from "@/services/catalog/storefront";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getStorefrontImageStories());
  } catch (error) {
    return jsonError(error);
  }
}
