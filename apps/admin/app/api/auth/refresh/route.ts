import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, authSessionSchema, cookieOptions, customerDataApiUrl } from "@/lib/auth";

export async function POST(request: Request) {
  const refreshToken = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${REFRESH_COOKIE}=`))?.slice(REFRESH_COOKIE.length + 1);
  if (!refreshToken) return NextResponse.json({ error: "No session to refresh." }, { status: 401 });
  try {
    const upstream = await fetch(`${customerDataApiUrl()}/auth/staff/refresh`, {
      method: "POST", headers: { "content-type": "application/json", accept: "application/json", "user-agent": request.headers.get("user-agent") || "Najib Admin BFF" },
      body: JSON.stringify({ refreshToken: decodeURIComponent(refreshToken) }), cache: "no-store", signal: AbortSignal.timeout(7_000),
    });
    if (!upstream.ok) {
      const response = NextResponse.json({ error: "Session expired." }, { status: 401 });
      response.cookies.delete(ACCESS_COOKIE); response.cookies.delete(REFRESH_COOKIE); return response;
    }
    const parsed = authSessionSchema.safeParse(await upstream.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid authentication response." }, { status: 502 });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ACCESS_COOKIE, parsed.data.accessToken, cookieOptions(parsed.data.accessTokenExpiresInSeconds));
    response.cookies.set(REFRESH_COOKIE, parsed.data.refreshToken, cookieOptions(Math.max(1, Math.floor((new Date(parsed.data.refreshTokenExpiresAt).getTime() - Date.now()) / 1_000))));
    return response;
  } catch {
    return NextResponse.json({ error: "Session refresh is temporarily unavailable." }, { status: 503 });
  }
}
