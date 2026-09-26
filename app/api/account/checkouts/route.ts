import { requireCustomerApiAccount } from "@/lib/account/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { checkoutService } from "@/services/checkout/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const account = await requireCustomerApiAccount();
    const currency = new URL(request.url).searchParams.get("currency");
    return jsonResponse(await checkoutService.destinationsForCart(account.id, currency === "USD" ? "USD" : "IRR"), {
      cache: "no-store",
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const account = await requireCustomerApiAccount();
    return jsonResponse(
      await checkoutService.start(account.id, await request.json()),
      { status: 201, cache: "no-store" },
    );
  } catch (error) {
    return jsonError(error);
  }
}
