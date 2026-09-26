export const CATALOG_CURRENCY = "IRR" as const;
export const CHECKOUT_CURRENCIES = ["IRR", "USD"] as const;
export type CheckoutCurrency = (typeof CHECKOUT_CURRENCIES)[number];

export function canonicalCatalogCurrency() {
  return CATALOG_CURRENCY;
}

export function isCheckoutCurrency(value: unknown): value is CheckoutCurrency {
  return typeof value === "string" && CHECKOUT_CURRENCIES.includes(value.toUpperCase() as CheckoutCurrency);
}

type DualPrice = {
  basePriceMinor?: number | null;
  currency?: string | null;
  priceIrrMinor?: number | null;
  priceUsdMinor?: number | null;
};

/** New fields win. Legacy price is only a fallback in its original currency; no FX conversion. */
export function explicitPriceForCurrency(value: DualPrice, currency: CheckoutCurrency) {
  const explicit = currency === "IRR" ? value.priceIrrMinor : value.priceUsdMinor;
  if (Number.isSafeInteger(explicit) && Number(explicit) >= 0) return Number(explicit);
  if (value.currency?.toUpperCase() === currency && Number.isSafeInteger(value.basePriceMinor)) {
    return Number(value.basePriceMinor);
  }
  return null;
}

/** IRR is stored as whole rials. Legacy ISO currencies keep their historical 1/100 minor-unit snapshots. */
export function amountForCurrencyDisplay(value: number, currency: string) {
  return currency.toUpperCase() === CATALOG_CURRENCY ? value : value / 100;
}
