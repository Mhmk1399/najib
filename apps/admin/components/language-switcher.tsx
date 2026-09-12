"use client";

import { Check } from "lucide-react";
import { type Locale, localeLabels, locales } from "@/lib/localization";

export function LanguageSwitcher({ locale, onChange, complete }: {
  locale: Locale;
  onChange: (locale: Locale) => void;
  complete: Record<Locale, boolean>;
}) {
  return <div className="language-register" role="tablist" aria-label="زبان محتوای فروشگاه">
    <span>زبان محتوا</span>
    <div>
      {locales.map((item) => <button key={item} type="button" role="tab" aria-selected={locale === item} className={locale === item ? "active" : ""} onClick={() => onChange(item)}>
        <i className={complete[item] ? "complete" : ""}>{complete[item] ? <Check size={10} /> : "·"}</i>
        {localeLabels[item]}
      </button>)}
    </div>
  </div>;
}
