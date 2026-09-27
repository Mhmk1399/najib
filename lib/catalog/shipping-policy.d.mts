export function configuredShippingMinor(raw: string | undefined): number | null;
export function resolveConfiguredStoreShippingFee(
  store: { shippingFeeMinor?: number | null; shippingFeeIrrMinor?: number | null; shippingFeeUsdMinor?: number | null },
  currency: "IRR" | "USD",
  globalFee: number | null,
): number | null;
