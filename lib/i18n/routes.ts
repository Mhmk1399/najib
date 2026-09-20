import { defaultLocale, isLocale, locales, type Locale } from "@/lib/i18n/config";

const PUBLIC_FILE_PATTERN = /\.(?:.*)$/;

export const localePrefixPattern = `/:locale(${locales.join("|")})`;

export function splitLocalePathname(pathname: string): {
  locale: Locale | null;
  pathnameWithoutLocale: string;
} {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  if (!isLocale(first)) {
    return {
      locale: null,
      pathnameWithoutLocale: pathname || "/",
    };
  }

  const rest = `/${segments.slice(1).join("/")}`.replace(/\/$/, "") || "/";
  return {
    locale: first,
    pathnameWithoutLocale: rest,
  };
}

export function localizedPath(pathname: string, locale: Locale = defaultLocale) {
  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const { pathnameWithoutLocale } = splitLocalePathname(cleanPath);

  if (pathnameWithoutLocale === "/") return `/${locale}`;
  return `/${locale}${pathnameWithoutLocale}`;
}

export function isExternalHref(href: string) {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(href);
}

export function localizedHref(href: string, locale: Locale = defaultLocale) {
  if (!href || isExternalHref(href)) return href;

  const [pathAndQuery, hash = ""] = href.split("#");
  const [pathname = "/", query = ""] = pathAndQuery.split("?");
  const localized = localizedPath(pathname || "/", locale);

  return `${localized}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

export function getLocaleFromPathname(pathname: string | null | undefined) {
  if (!pathname) return defaultLocale;
  return splitLocalePathname(pathname).locale ?? defaultLocale;
}

export function switchLocalePath(pathname: string, nextLocale: Locale) {
  const { pathnameWithoutLocale } = splitLocalePathname(pathname || "/");
  return localizedPath(pathnameWithoutLocale, nextLocale);
}

export function isInternalAssetPath(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/pwa") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js" ||
    PUBLIC_FILE_PATTERN.test(pathname)
  );
}

export function isUnlocalizedSystemPath(pathname: string) {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    isInternalAssetPath(pathname)
  );
}
