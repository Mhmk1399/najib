import { requireCustomerApiAccount } from "@/lib/account/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { accountService } from "@/services/account/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const account = await requireCustomerApiAccount();
    return jsonResponse(
      await accountService.updateCartItem(
        account.id,
        (await context.params).id,
        await request.json(),
      ),
      { cache: "no-store" },
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const account = await requireCustomerApiAccount();
    return jsonResponse(
      await accountService.removeCartItem(account.id, (await context.params).id),
      { cache: "no-store" },
    );
  } catch (error) {
    return jsonError(error);
  }
}
