import { requireCustomerApiAccount } from "@/lib/account/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { accountOrdersQuerySchema, accountService } from "@/services/account/service";

export async function GET(request: Request) {
  try {
    const account = await requireCustomerApiAccount();
    const query = accountOrdersQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return jsonResponse(await accountService.listOrders(account.id, query), { cache: "no-store" });
  } catch (error) {
    return jsonError(error);
  }
}
