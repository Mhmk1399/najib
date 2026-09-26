import { requireCustomerApiAccount } from "@/lib/account/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { accountService, cartLocaleQuerySchema } from "@/services/account/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const account = await requireCustomerApiAccount();
    const locale = cartLocaleQuerySchema.parse({ locale: new URL(request.url).searchParams.get("locale") ?? undefined }).locale;
    return jsonResponse(
      await accountService.updateCartItem(
        account.id,
        (await context.params).id,
        await request.json(),
        locale,
      ),
      { cache: "no-store" },
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const account = await requireCustomerApiAccount();
    const locale = cartLocaleQuerySchema.parse({ locale: new URL(request.url).searchParams.get("locale") ?? undefined }).locale;
    return jsonResponse(
      await accountService.removeCartItem(account.id, (await context.params).id, locale),
      { cache: "no-store" },
    );
  } catch (error) {
    return jsonError(error);
  }
}
