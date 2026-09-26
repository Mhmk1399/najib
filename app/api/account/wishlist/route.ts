import { requireCustomerApiAccount } from "@/lib/account/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import {
  accountService,
  wishlistProductSchema,
  wishlistQuerySchema,
} from "@/services/account/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const account = await requireCustomerApiAccount();
    const query = wishlistQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams.entries()),
    );
    return jsonResponse(await accountService.listWishlist(account.id, query.locale), {
      cache: "no-store",
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const account = await requireCustomerApiAccount();
    const input = wishlistProductSchema.parse(await request.json());
    return jsonResponse(await accountService.addWishlist(account.id, input), {
      cache: "no-store",
    });
  } catch (error) {
    return jsonError(error);
  }
}
