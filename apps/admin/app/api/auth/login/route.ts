import { NextResponse } from "next/server";
import { z } from "zod";
import { ACCESS_COOKIE, REFRESH_COOKIE, authSessionSchema, cookieOptions, customerDataApiUrl } from "@/lib/auth";

const loginSchema = z.object({ email: z.email().trim().toLowerCase(), password: z.string().min(12).max(128) });

export async function POST(request: Request) {
  let input: z.infer<typeof loginSchema>;
  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) {
      const fields = z.flattenError(parsed.error).fieldErrors;
      return NextResponse.json({ error: "Check your sign-in details.", fieldErrors: { email: fields.email?.[0], password: fields.password?.[0] } }, { status: 400 });
    }
    input = parsed.data;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${customerDataApiUrl()}/auth/staff/login`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json", "user-agent": request.headers.get("user-agent") || "Najib Admin BFF" },
      body: JSON.stringify(input),
      cache: "no-store",
      signal: AbortSignal.timeout(7_000),
    });
    if (!upstream.ok) return NextResponse.json({ error: upstream.status === 401 ? "Invalid email or password." : "Sign-in is temporarily unavailable." }, { status: upstream.status === 401 ? 401 : 503 });
    const parsed = authSessionSchema.safeParse(await upstream.json());
    if (!parsed.success) return NextResponse.json({ error: "The authentication service returned an invalid response." }, { status: 502 });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ACCESS_COOKIE, parsed.data.accessToken, cookieOptions(parsed.data.accessTokenExpiresInSeconds));
    response.cookies.set(REFRESH_COOKIE, parsed.data.refreshToken, cookieOptions(Math.max(1, Math.floor((new Date(parsed.data.refreshTokenExpiresAt).getTime() - Date.now()) / 1_000))));
    return response;
  } catch {
    return NextResponse.json({ error: "Sign-in is temporarily unavailable." }, { status: 503 });
  }
}
