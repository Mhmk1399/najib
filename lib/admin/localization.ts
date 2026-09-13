export const locales = ["fa", "en", "ar"] as const;
export type Locale = (typeof locales)[number];
export type LocalizedText = Record<Locale, string>;
export type LocalizedTextList = Record<Locale, string[]>;

export const emptyLocalizedText = (): LocalizedText => ({ fa: "", en: "", ar: "" });
export const emptyLocalizedList = (): LocalizedTextList => ({ fa: [], en: [], ar: [] });
export const localeLabels: Record<Locale, string> = { fa: "فارسی", en: "English", ar: "العربية" };
export const localeDirection = (locale: Locale) => locale === "en" ? "ltr" : "rtl";
export const fa = (value?: LocalizedText | null) => value?.fa || "—";
export const localizedComplete = (value: LocalizedText | LocalizedTextList, locale: Locale) => {
  const entry = value[locale];
  return Array.isArray(entry) ? entry.length > 0 : Boolean(entry.trim());
};
export const trimLocalized = (value: LocalizedText): LocalizedText => ({
  fa: value.fa.trim(), en: value.en.trim(), ar: value.ar.trim(),
});
