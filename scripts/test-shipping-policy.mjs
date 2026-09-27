import assert from "node:assert/strict";
import { configuredShippingMinor, resolveConfiguredStoreShippingFee } from "../lib/catalog/shipping-policy.mjs";

assert.equal(configuredShippingMinor(undefined), null, "missing config must remain unavailable");
assert.equal(configuredShippingMinor(""), null, "blank config must remain unavailable");
assert.equal(configuredShippingMinor("0"), 0, "explicit zero must mean free shipping");
assert.equal(configuredShippingMinor("350"), 350, "configured fee must be parsed exactly");
assert.equal(configuredShippingMinor("invalid"), null, "invalid config must remain unavailable");
assert.equal(resolveConfiguredStoreShippingFee({}, "IRR", 0), 0, "store must inherit explicit global zero");
assert.equal(resolveConfiguredStoreShippingFee({}, "USD", 350), 350, "store must inherit global USD fee");
assert.equal(resolveConfiguredStoreShippingFee({ shippingFeeUsdMinor: 125 }, "USD", 350), 125, "store USD override must win");
assert.equal(resolveConfiguredStoreShippingFee({ shippingFeeUsdMinor: 0 }, "USD", 350), 0, "store explicit zero override must win");
assert.equal(resolveConfiguredStoreShippingFee({ shippingFeeIrrMinor: null }, "IRR", 900), 900, "null override must inherit global fee");
assert.equal(resolveConfiguredStoreShippingFee({ shippingFeeMinor: 700 }, "IRR", 900), 700, "real legacy IRR fee must be preserved");
assert.equal(resolveConfiguredStoreShippingFee({}, "USD", null), null, "missing override and global config must remain unavailable");
console.log("[PASS] shipping policy: missing, explicit zero, inheritance, store override, and legacy fee");
