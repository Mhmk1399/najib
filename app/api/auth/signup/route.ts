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
import { signupCustomer } from "@/services/auth/service";

const signupSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(12).max(128),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phone: z.string().trim().max(32).optional(),
  preferredLocale: z.enum(["fa", "en", "ar"]).default("fa"),
});

function metadata(request: Request) {
  return {
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    userAgent: request.headers.get("user-agent") || "Najib Account",
  };
}

export async function POST(request: Request) {
  try {
    const parsed = signupSchema.safeParse(await request.json());
    if (!parsed.success) {
      const fields = z.flattenError(parsed.error).fieldErrors;
      return NextResponse.json(
        {
          error: "اطلاعات ثبت‌نام را بررسی کنید.",
          fieldErrors: {
            email: fields.email?.[0] ? "ایمیل معتبر وارد کنید." : undefined,
            password: fields.password?.[0] ? "رمز عبور باید دست‌کم ۱۲ کاراکتر باشد." : undefined,
            firstName: fields.firstName?.[0] ? "نام را وارد کنید." : undefined,
            lastName: fields.lastName?.[0] ? "نام خانوادگی را وارد کنید." : undefined,
            phone: fields.phone?.[0] ? "شماره تماس معتبر نیست." : undefined,
          },
        },
        { status: 400 },
      );
    }

    const session = authSessionSchema.parse(
      await signupCustomer(parsed.data, metadata(request)),
    );
    const response = NextResponse.json({ ok: true, destination: accountDestination(session.staff) });
    response.cookies.set(
      ACCESS_COOKIE,
      session.accessToken,
      cookieOptions(session.accessTokenExpiresInSeconds),
    );
    response.cookies.set(
      REFRESH_COOKIE,
      session.refreshToken,
      cookieOptions(
        Math.max(
          1,
          Math.floor(
            (new Date(session.refreshTokenExpiresAt).getTime() - Date.now()) /
              1_000,
          ),
        ),
      ),
    );
    response.cookies.delete(LEGACY_ACCESS_COOKIE);
    response.cookies.delete(LEGACY_REFRESH_COOKIE);
    return response;
  } catch (error) {
    if (isApiError(error)) {
      return NextResponse.json(
        {
          error:
            error.status === 409
              ? "حسابی با این ایمیل وجود دارد. وارد حساب خود شوید."
              : "ثبت‌نام انجام نشد. دوباره تلاش کنید.",
        },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { error: "سرویس ثبت‌نام موقتاً در دسترس نیست." },
      { status: 500 },
    );
  }
}
