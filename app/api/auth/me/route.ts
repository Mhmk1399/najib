import { accountDestination, getAccountSession } from "@/lib/auth/session";
import { jsonResponse } from "@/lib/server/response";

export async function GET() {
  const session = await getAccountSession();
  if (!session) {
    return jsonResponse(
      { error: "نشست حساب معتبر نیست." },
      { status: 401, cache: "no-store" },
    );
  }

  return jsonResponse(
    {
      authenticated: true,
      account: session.account,
      destination: accountDestination(session.account),
    },
    { cache: "no-store" },
  );
}
