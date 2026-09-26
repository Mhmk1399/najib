import { requireCustomerApiAccount } from "@/lib/account/api-access";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { accountService } from "@/services/account/service";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const account = await requireCustomerApiAccount();
    const { productId } = await params;
    return jsonResponse(await accountService.removeWishlist(account.id, productId), {
      cache: "no-store",
    });
  } catch (error) {
    return jsonError(error);
  }
}
