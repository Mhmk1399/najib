import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, authSessionSchema, cookieOptions } from "@/lib/admin/auth";
import { jsonError } from "@/lib/server/response";
import { refreshStaffSession } from "@/services/auth/service";

function refreshTokenFrom(request: Request) {
  return request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${REFRESH_COOKIE}=`))?.slice(REFRESH_COOKIE.length + 1);
}

function metadata(request: Request) {
  return {
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    userAgent: request.headers.get("user-agent") || "Najib Admin",
  };
}

export async function POST(request: Request) {
  try {
    const refreshToken = refreshTokenFrom(request);
    if (!refreshToken) return NextResponse.json({ error: "No session to refresh." }, { status: 401 });
    const session = authSessionSchema.parse(await refreshStaffSession({ refreshToken: decodeURIComponent(refreshToken) }, metadata(request)));
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ACCESS_COOKIE, session.accessToken, cookieOptions(session.accessTokenExpiresInSeconds));
    response.cookies.set(REFRESH_COOKIE, session.refreshToken, cookieOptions(Math.max(1, Math.floor((new Date(session.refreshTokenExpiresAt).getTime() - Date.now()) / 1_000))));
    return response;
  } catch (error) {
    const response = jsonError(error);
    if (response.status === 401) {
      response.cookies.delete(ACCESS_COOKIE);
      response.cookies.delete(REFRESH_COOKIE);
    }
    return response;
  }
}
