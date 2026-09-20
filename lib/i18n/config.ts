export const locales = ["fa", "en", "ar"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fa";

export const localeLabels: Record<Locale, string> = {
  fa: "فارسی",
  en: "English",
  ar: "العربية",
};

export const localeDirections: Record<Locale, "rtl" | "ltr"> = {
  fa: "rtl",
  en: "ltr",
  ar: "rtl",
};

export const localeHtmlLang: Record<Locale, string> = {
  fa: "fa-IR",
  en: "en-US",
  ar: "ar",
};

export const localeOpenGraph: Record<Locale, string> = {
  fa: "fa_IR",
  en: "en_US",
  ar: "ar",
};

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export function getLocaleDirection(locale: Locale) {
  return localeDirections[locale];
}

export function getHtmlLang(locale: Locale) {
  return localeHtmlLang[locale];
}
