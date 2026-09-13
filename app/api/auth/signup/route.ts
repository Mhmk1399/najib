import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  authSessionSchema,
  cookieOptions,
} from "@/lib/admin/auth";
import { jsonError } from "@/lib/server/response";
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
          error: "Check your sign-up details.",
          fieldErrors: {
            email: fields.email?.[0],
            password: fields.password?.[0],
            firstName: fields.firstName?.[0],
            lastName: fields.lastName?.[0],
            phone: fields.phone?.[0],
          },
        },
        { status: 400 },
      );
    }

    const session = authSessionSchema.parse(
      await signupCustomer(parsed.data, metadata(request)),
    );
    const response = NextResponse.json({ ok: true, destination: "/" });
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
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
