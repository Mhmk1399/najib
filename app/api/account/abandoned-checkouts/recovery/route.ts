import { requireCustomerApiAccount } from "@/lib/account/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { recoveryService } from "@/services/checkout/recovery";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const account = await requireCustomerApiAccount();
    const token = new URL(request.url).searchParams.get("token");
    return jsonResponse(await recoveryService.preview(account.id, token), { cache: "no-store" });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const account = await requireCustomerApiAccount();
    return jsonResponse(
      await recoveryService.restore(account.id, await request.json()),
      { cache: "no-store" },
    );
  } catch (error) {
    return jsonError(error);
  }
}
