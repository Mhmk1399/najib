import { timingSafeEqual } from "node:crypto";

import { jsonError, jsonResponse } from "@/lib/server/response";
import { expireDueCheckouts } from "@/services/checkout/expiry";

export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const header = request.headers.get("authorization");
  if (!secret || !header?.startsWith("Bearer ")) return false;
  const provided = header.slice(7);
  const expectedBuffer = Buffer.from(secret);
  const providedBuffer = Buffer.from(provided);
  return (
    expectedBuffer.length === providedBuffer.length &&
    timingSafeEqual(expectedBuffer, providedBuffer)
  );
}

export async function POST(request: Request) {
  try {
    if (!authorized(request)) {
      return jsonResponse({ error: "Unauthorized job request." }, { status: 401 });
    }
    return jsonResponse(await expireDueCheckouts());
  } catch (error) {
    return jsonError(error);
  }
}
