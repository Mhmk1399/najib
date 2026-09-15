import { NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  LEGACY_ACCESS_COOKIE,
  LEGACY_REFRESH_COOKIE,
  REFRESH_COOKIE,
  accountDestination,
  authSessionSchema,
  cookieOptions,
} from "@/lib/auth/session";
import { jsonError } from "@/lib/server/response";
import { refreshAccountSession } from "@/services/auth/service";

function refreshTokenFrom(request: Request) {
  const parts = request.headers.get("cookie")?.split(";").map((part) => part.trim()) ?? [];
  for (const name of [REFRESH_COOKIE, LEGACY_REFRESH_COOKIE]) {
    const value = parts.find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1);
    if (value) return value;
  }
}

function metadata(request: Request) {
  return {
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    userAgent: request.headers.get("user-agent") || "Najib Account",
  };
}

export async function POST(request: Request) {
  try {
    const refreshToken = refreshTokenFrom(request);
    if (!refreshToken) return NextResponse.json({ error: "No session to refresh." }, { status: 401 });
    const session = authSessionSchema.parse(await refreshAccountSession({ refreshToken: decodeURIComponent(refreshToken) }, metadata(request)));
    const destination = accountDestination(session.staff);
    const response = NextResponse.json({ ok: true, destination });
    response.cookies.set(ACCESS_COOKIE, session.accessToken, cookieOptions(session.accessTokenExpiresInSeconds));
    response.cookies.set(REFRESH_COOKIE, session.refreshToken, cookieOptions(Math.max(1, Math.floor((new Date(session.refreshTokenExpiresAt).getTime() - Date.now()) / 1_000))));
    response.cookies.delete(LEGACY_ACCESS_COOKIE);
    response.cookies.delete(LEGACY_REFRESH_COOKIE);
    return response;
  } catch (error) {
    const response = jsonError(error);
    if (response.status === 401) {
      response.cookies.delete(ACCESS_COOKIE);
      response.cookies.delete(REFRESH_COOKIE);
      response.cookies.delete(LEGACY_ACCESS_COOKIE);
      response.cookies.delete(LEGACY_REFRESH_COOKIE);
    }
    return response;
  }
}
