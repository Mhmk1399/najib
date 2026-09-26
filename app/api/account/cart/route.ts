import { requireCustomerApiAccount } from "@/lib/account/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { accountService, cartLocaleQuerySchema } from "@/services/account/service";

function localeFrom(request: Request) {
  return cartLocaleQuerySchema.parse({
    locale: new URL(request.url).searchParams.get("locale") ?? undefined,
  }).locale;
}

export async function GET(request: Request) {
  try {
    const account = await requireCustomerApiAccount();
    return jsonResponse(await accountService.getCart(account.id, localeFrom(request)), { cache: "no-store" });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const account = await requireCustomerApiAccount();
    return jsonResponse(await accountService.clearCart(account.id, localeFrom(request)), {
      cache: "no-store",
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const account = await requireCustomerApiAccount();
    return jsonResponse(await accountService.updateCartCurrency(account.id, await request.json(), localeFrom(request)), { cache: "no-store" });
  } catch (error) {
    return jsonError(error);
  }
}
