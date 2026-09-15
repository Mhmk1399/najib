import { NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  LEGACY_ACCESS_COOKIE,
  LEGACY_REFRESH_COOKIE,
  REFRESH_COOKIE,
} from "@/lib/auth/session";
import { logoutAccount } from "@/services/auth/service";

function refreshTokenFrom(request: Request) {
  const parts = request.headers.get("cookie")?.split(";").map((part) => part.trim()) ?? [];
  for (const name of [REFRESH_COOKIE, LEGACY_REFRESH_COOKIE]) {
    const value = parts.find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1);
    if (value) return value;
  }
}

export async function POST(request: Request) {
  const refreshToken = refreshTokenFrom(request);
  if (refreshToken) {
    await logoutAccount(
      { refreshToken: decodeURIComponent(refreshToken) },
      {
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
        userAgent: request.headers.get("user-agent") || "Najib Account",
      },
    ).catch(() => undefined);
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  response.cookies.delete(LEGACY_ACCESS_COOKIE);
  response.cookies.delete(LEGACY_REFRESH_COOKIE);
  return response;
}
