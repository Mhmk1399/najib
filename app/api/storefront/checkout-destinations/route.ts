import { jsonError, jsonResponse } from "@/lib/server/response";
import { checkoutService } from "@/services/checkout/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return jsonResponse(await checkoutService.destinations(), { cache: "no-store" });
  } catch (error) {
    return jsonError(error);
  }
}
