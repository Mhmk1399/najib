import { redirect } from "next/navigation";

import { accountDestination, getAccountSession } from "@/lib/auth/session";

export default async function ProfileAliasPage() {
  const session = await getAccountSession();
  if (!session) redirect("/auth?mode=login&refresh=1");
  redirect(accountDestination(session.account));
}
