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

async function run(request: Request) {
  try {
    if (!authorized(request)) {
      return jsonResponse({ error: "Unauthorized job request." }, { status: 401 });
    }
    const startedAt = Date.now();
    const maxBatches = 4;
    let scanned = 0;
    let expired = 0;
    let failed = 0;
    let hasMore = false;
    for (let batch = 0; batch < maxBatches; batch += 1) {
      const result = await expireDueCheckouts({ limit: 50 });
      scanned += result.scanned;
      expired += result.expired;
      failed += result.failed;
      hasMore = result.hasMore;
      if (!hasMore || Date.now() - startedAt > 45_000) break;
    }
    return jsonResponse({ scanned, expired, failed, hasMore });
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      return jsonResponse({ error: "Checkout expiry job failed." }, { status: 500 });
    }
    return jsonError(error);
  }
}

export const GET = run;
export const POST = run;
