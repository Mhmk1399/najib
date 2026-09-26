import { NextResponse } from "next/server";
import { jsonError } from "@/lib/server/response";
import { isLocale } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
import { getStorefrontCollections } from "@/services/catalog/storefront";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const requestedLocale =
      new URL(request.url).searchParams.get("locale") ?? undefined;
    const locale = isLocale(requestedLocale)
      ? requestedLocale
      : await getRequestLocale();

    return NextResponse.json(await getStorefrontCollections(locale));
  } catch (error) {
    return jsonError(error);
  }
}
