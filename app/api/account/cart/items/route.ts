import { requireCustomerApiAccount } from "@/lib/account/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { accountService, cartLocaleQuerySchema } from "@/services/account/service";

export async function POST(request: Request) {
  try {
    const account = await requireCustomerApiAccount();
    const locale = cartLocaleQuerySchema.parse({ locale: new URL(request.url).searchParams.get("locale") ?? undefined }).locale;
    return jsonResponse(
      await accountService.addCartItem(account.id, await request.json(), locale),
      { cache: "no-store" },
    );
  } catch (error) {
    return jsonError(error);
  }
}
