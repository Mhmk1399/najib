import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, customerDataApiUrl } from "@/lib/auth";

export async function POST(request: Request) {
  const refreshToken = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${REFRESH_COOKIE}=`))?.slice(REFRESH_COOKIE.length + 1);
  if (refreshToken) {
    try {
      await fetch(`${customerDataApiUrl()}/auth/staff/logout`, { method: "POST", headers: { "content-type": "application/json", "user-agent": request.headers.get("user-agent") || "Najib Admin BFF" }, body: JSON.stringify({ refreshToken: decodeURIComponent(refreshToken) }), cache: "no-store", signal: AbortSignal.timeout(5_000) });
    } catch { /* Local cookies are still cleared when the auth service is unavailable. */ }
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}
