import { requireCustomerApiAccount } from "@/lib/account/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { accountService } from "@/services/account/service";

export async function GET() {
  try {
    const account = await requireCustomerApiAccount();
    return jsonResponse(await accountService.getProfile(account.id), { cache: "no-store" });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const account = await requireCustomerApiAccount();
    return jsonResponse(
      await accountService.updateProfile(account.id, await request.json()),
      { cache: "no-store" },
    );
  } catch (error) {
    return jsonError(error);
  }
}
