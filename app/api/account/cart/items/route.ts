import { requireCustomerApiAccount } from "@/lib/account/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { accountService } from "@/services/account/service";

export async function POST(request: Request) {
  try {
    const account = await requireCustomerApiAccount();
    return jsonResponse(
      await accountService.addCartItem(account.id, await request.json()),
      { cache: "no-store" },
    );
  } catch (error) {
    return jsonError(error);
  }
}
