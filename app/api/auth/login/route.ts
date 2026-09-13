import { NextResponse } from "next/server";
import { z } from "zod";
import { ACCESS_COOKIE, REFRESH_COOKIE, authSessionSchema, cookieOptions } from "@/lib/admin/auth";
import { jsonError } from "@/lib/server/response";
import { loginStaff } from "@/services/auth/service";

const loginSchema = z.object({ email: z.email().trim().toLowerCase(), password: z.string().min(12).max(128) });

function metadata(request: Request) {
  return {
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    userAgent: request.headers.get("user-agent") || "Najib Admin",
  };
}

export async function POST(request: Request) {
  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) {
      const fields = z.flattenError(parsed.error).fieldErrors;
      return NextResponse.json({ error: "Check your sign-in details.", fieldErrors: { email: fields.email?.[0], password: fields.password?.[0] } }, { status: 400 });
    }

    const session = authSessionSchema.parse(await loginStaff(parsed.data, metadata(request)));
    const destination = session.staff.permissions.includes("admin.access") ? "/admin" : "/";
    const response = NextResponse.json({ ok: true, destination });
    response.cookies.set(ACCESS_COOKIE, session.accessToken, cookieOptions(session.accessTokenExpiresInSeconds));
    response.cookies.set(REFRESH_COOKIE, session.refreshToken, cookieOptions(Math.max(1, Math.floor((new Date(session.refreshTokenExpiresAt).getTime() - Date.now()) / 1_000))));
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
