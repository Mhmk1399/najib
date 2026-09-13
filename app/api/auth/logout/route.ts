import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/admin/auth";
import { logoutStaff } from "@/services/auth/service";

function refreshTokenFrom(request: Request) {
  return request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${REFRESH_COOKIE}=`))?.slice(REFRESH_COOKIE.length + 1);
}

export async function POST(request: Request) {
  const refreshToken = refreshTokenFrom(request);
  if (refreshToken) {
    await logoutStaff(
      { refreshToken: decodeURIComponent(refreshToken) },
      {
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
        userAgent: request.headers.get("user-agent") || "Najib Admin",
      },
    ).catch(() => undefined);
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}
