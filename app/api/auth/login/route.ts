import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ACCESS_COOKIE,
  LEGACY_ACCESS_COOKIE,
  LEGACY_REFRESH_COOKIE,
  REFRESH_COOKIE,
  accountDestination,
  authSessionSchema,
  cookieOptions,
} from "@/lib/auth/session";
import { isApiError } from "@/lib/server/errors";
import { loginAccount } from "@/services/auth/service";

const loginSchema = z.object({ email: z.email().trim().toLowerCase(), password: z.string().min(12).max(128) });

function metadata(request: Request) {
  return {
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    userAgent: request.headers.get("user-agent") || "Najib Account",
  };
}

export async function POST(request: Request) {
  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) {
      const fields = z.flattenError(parsed.error).fieldErrors;
      return NextResponse.json({ error: "اطلاعات ورود را بررسی کنید.", fieldErrors: { email: fields.email?.[0] ? "ایمیل معتبر وارد کنید." : undefined, password: fields.password?.[0] ? "رمز عبور باید دست‌کم ۱۲ کاراکتر باشد." : undefined } }, { status: 400 });
    }

    const session = authSessionSchema.parse(await loginAccount(parsed.data, metadata(request)));
    const destination = accountDestination(session.staff);
    const response = NextResponse.json({ ok: true, destination });
    response.cookies.set(ACCESS_COOKIE, session.accessToken, cookieOptions(session.accessTokenExpiresInSeconds));
    response.cookies.set(REFRESH_COOKIE, session.refreshToken, cookieOptions(Math.max(1, Math.floor((new Date(session.refreshTokenExpiresAt).getTime() - Date.now()) / 1_000))));
    response.cookies.delete(LEGACY_ACCESS_COOKIE);
    response.cookies.delete(LEGACY_REFRESH_COOKIE);
    return response;
  } catch (error) {
    if (isApiError(error)) {
      return NextResponse.json(
        { error: error.status === 401 ? "ایمیل یا رمز عبور نادرست است." : "ورود انجام نشد. دوباره تلاش کنید." },
        { status: error.status },
      );
    }
    return NextResponse.json({ error: "سرویس ورود موقتاً در دسترس نیست." }, { status: 500 });
  }
}
