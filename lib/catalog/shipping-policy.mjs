export function configuredShippingMinor(raw) {
  if (raw === undefined || String(raw).trim() === "") return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}

export function resolveConfiguredStoreShippingFee(store, currency, globalFee) {
  if (currency === "USD") return store.shippingFeeUsdMinor ?? globalFee;
  return store.shippingFeeIrrMinor ?? store.shippingFeeMinor ?? globalFee;
}
