import { requireCustomerApiAccount } from "@/lib/account/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { paymentService } from "@/services/payment/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const account = await requireCustomerApiAccount();
    return jsonResponse(
      await paymentService.createIntent(
        account.id,
        (await context.params).id,
        await request.json(),
      ),
      { status: 201, cache: "no-store" },
    );
  } catch (error) {
    return jsonError(error);
  }
}
