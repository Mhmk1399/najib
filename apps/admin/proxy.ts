import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth";

export function proxy(request: NextRequest) {
  if (request.cookies.has(ACCESS_COOKIE)) return NextResponse.next();
  const login = new URL("/login", request.url);
  if (request.cookies.has(REFRESH_COOKIE)) login.searchParams.set("refresh", "1");
  return NextResponse.redirect(login);
}

export const config = { matcher: ["/"] };
