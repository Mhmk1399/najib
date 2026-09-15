"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AccountLogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const logout = async () => {
    if (pending) return;
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    } finally {
      router.replace("/auth?mode=login");
      router.refresh();
    }
  };

  return <button type="button" onClick={logout} disabled={pending} className="transition hover:text-white disabled:opacity-50">{pending ? "در حال خروج…" : "خروج"}</button>;
}
