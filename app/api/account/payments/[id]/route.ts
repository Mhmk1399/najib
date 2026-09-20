import { requireCustomerApiAccount } from "@/lib/account/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { paymentService } from "@/services/payment/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const account = await requireCustomerApiAccount();
    return jsonResponse(
      await paymentService.get(account.id, (await context.params).id),
      { cache: "no-store" },
    );
  } catch (error) {
    return jsonError(error);
  }
}
