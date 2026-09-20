import { requireCustomerApiAccount } from "@/lib/account/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { checkoutService } from "@/services/checkout/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const account = await requireCustomerApiAccount();
    return jsonResponse(
      await checkoutService.get(account.id, (await context.params).id),
      { cache: "no-store" },
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const account = await requireCustomerApiAccount();
    return jsonResponse(
      await checkoutService.act(
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
