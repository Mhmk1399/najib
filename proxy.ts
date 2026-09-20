import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { isUnlocalizedSystemPath } from "@/lib/i18n/routes";

const localeHeader = "x-najib-locale";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isUnlocalizedSystemPath(pathname)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(localeHeader, defaultLocale);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const firstSegment = pathname.split("/").filter(Boolean)[0];

  if (isLocale(firstSegment)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(localeHeader, firstSegment);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
