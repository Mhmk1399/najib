import { NextResponse } from "next/server";
import { jsonError } from "@/lib/server/response";
import { badRequest } from "@/lib/server/errors";
import { getStorefrontProducts } from "@/services/catalog/storefront";

const objectIdPattern = /^[a-f\d]{24}$/i;

function optionalObjectId(value: string | null, label: string) {
  if (!value) return undefined;
  if (!objectIdPattern.test(value)) badRequest(`${label} is invalid.`);
  return value;
}

function optionalLimit(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
    badRequest("limit must be an integer between 1 and 100.");
  }
  return parsed;
}

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    return NextResponse.json(
      await getStorefrontProducts({
        categoryId: optionalObjectId(url.searchParams.get("categoryId"), "categoryId"),
        subcategoryId: optionalObjectId(
          url.searchParams.get("subcategoryId"),
          "subcategoryId",
        ),
        limit: optionalLimit(url.searchParams.get("limit")),
      }),
    );
  } catch (error) {
    return jsonError(error);
  }
}
