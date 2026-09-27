import type { CheckoutCurrency } from "@/lib/catalog/currency";
import { configuredShippingMinor, resolveConfiguredStoreShippingFee } from "./shipping-policy.mjs";

/** Global fee per used branch. A store may explicitly override either currency. */
export function globalShippingFee(currency: CheckoutCurrency) {
  return configuredShippingMinor(process.env[currency === "IRR" ? "SHIPPING_FEE_IRR_MINOR" : "SHIPPING_FEE_USD_MINOR"]);
}

export type StoreShippingFees = {
  shippingFeeMinor?: number | null;
  shippingFeeIrrMinor?: number | null;
  shippingFeeUsdMinor?: number | null;
};

/** Null means that neither a store override nor the selected currency's global fee exists. */
export function resolveStoreShippingFee(store: StoreShippingFees, currency: CheckoutCurrency, globalFee = globalShippingFee(currency)) {
  return resolveConfiguredStoreShippingFee(store, currency, globalFee);
}
