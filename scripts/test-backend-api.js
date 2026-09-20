const baseUrl = process.env.API_BASE_URL || "http://127.0.0.1:3000";

const checks = [
  {
    name: "database readiness",
    path: "/api/health",
    status: 200,
    validate: (body, response) =>
      body.status === "ok" &&
      body.database === "ready" &&
      response.headers.get("cache-control") === "no-store",
  },
  {
    name: "public categories",
    path: "/api/v1/catalog/categories",
    status: 200,
    validate: (body, response) =>
      Array.isArray(body) && response.headers.get("cache-control")?.includes("s-maxage=60"),
  },
  {
    name: "public product cursor page",
    path: "/api/v1/catalog/products?limit=2",
    status: 200,
    validate: (body) => {
      if (!Array.isArray(body.items) || !("nextCursor" in body)) return false;
      const product = body.items[0];
      return !product || ["fa", "en", "ar"].every((locale) => typeof product.name?.[locale] === "string");
    },
  },
  {
    name: "query validation",
    path: "/api/v1/catalog/products?limit=1000",
    status: 400,
    validate: (body) => body.error === "Validation failed.",
  },
  {
    name: "unknown product",
    path: "/api/v1/catalog/products/not-a-real-product",
    status: 404,
    validate: (body) => typeof body.error === "string",
  },
  {
    name: "checkout destinations expose safe active options",
    path: "/api/storefront/checkout-destinations",
    status: 200,
    validate: (body, response) =>
      Array.isArray(body.cities) &&
      Array.isArray(body.stores) &&
      body.stores.every((store) =>
        ["id", "code", "cityId", "name"].every((key) => key in store) &&
        !("locationId" in store) &&
        !("onHand" in store),
      ) &&
      response.headers.get("cache-control") === "no-store",
  },
  {
    name: "admin catalog is protected",
    path: "/api/catalog/products",
    status: 401,
    validate: (body, response) =>
      typeof body.error === "string" && response.headers.get("cache-control") === "no-store",
  },
  {
    name: "admin dashboard summary is protected",
    path: "/api/admin/dashboard-summary",
    status: 401,
    validate: (body, response) =>
      typeof body.error === "string" && response.headers.get("cache-control") === "no-store",
  },
  {
    name: "catalog reference data is protected",
    path: "/api/catalog/collections",
    status: 401,
    validate: (body, response) =>
      typeof body.error === "string" && response.headers.get("cache-control") === "no-store",
  },
  ...[
    ["admin orders are protected", "/api/admin/orders"],
    ["admin carts are protected", "/api/admin/carts"],
    ["admin checkouts are protected", "/api/admin/checkouts"],
    ["admin abandoned checkouts are protected", "/api/admin/abandoned-checkouts"],
    ["admin audit history is protected", "/api/admin/audit"],
    ["admin inventory is protected", "/api/admin/inventory/cities"],
    ["admin inventory reservations are protected", "/api/admin/inventory/reservations"],
    ["admin inventory transfers are protected", "/api/admin/inventory/transfers"],
  ].map(([name, path]) => ({
    name,
    path,
    status: 401,
    validate: (body, response) =>
      typeof body.error === "string" && response.headers.get("cache-control") === "no-store",
  })),
];

async function envValue(name) {
  if (process.env[name]) return process.env[name];
  try {
    const { readFile } = await import("node:fs/promises");
    const line = (await readFile(".env", "utf8"))
      .split(/\r?\n/)
      .find((entry) => entry.trim().startsWith(`${name}=`));
    if (!line) return undefined;
    return line.slice(line.indexOf("=") + 1).trim().replace(/^(['"])(.*)\1$/, "$2");
  } catch {
    return undefined;
  }
}

function addResponseCookies(jar, response) {
  const setCookies = typeof response.headers.getSetCookie === "function"
    ? response.headers.getSetCookie()
    : (response.headers.get("set-cookie") || "").split(/,(?=[^;,]+=)/);
  for (const value of setCookies) {
    if (!value) continue;
    const [pair, ...attributes] = value.split(";");
    const separator = pair.indexOf("=");
    if (separator < 1) continue;
    const name = pair.slice(0, separator).trim();
    const cookieValue = pair.slice(separator + 1).trim();
    const deleting = attributes.some((attribute) => /max-age=0/i.test(attribute));
    if (deleting || cookieValue === "") jar.delete(name);
    else jar.set(name, cookieValue);
  }
}

async function apiRequest(path, { method = "GET", body, jar, redirect = "follow" } = {}) {
  const headers = { accept: "application/json" };
  if (body !== undefined) headers["content-type"] = "application/json";
  if (jar?.size) headers.cookie = [...jar].map(([name, value]) => `${name}=${value}`).join("; ");
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect,
    signal: AbortSignal.timeout(8_000),
  });
  if (jar) addResponseCookies(jar, response);
  const responseBody = response.headers.get("content-type")?.includes("application/json")
    ? await response.json()
    : null;
  return { response, body: responseBody };
}

function result(name, passed, detail) {
  console.log(`[${passed ? "PASS" : "FAIL"}] ${name}${detail ? ` (${detail})` : ""}`);
  return passed ? 0 : 1;
}

async function runAuthFlow() {
  let failed = 0;
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const email = `najib-auth-test-${suffix}@example.test`;
  const password = `Safe-test-${suffix}-password`;
  const customerCookies = new Map();
  const adminCookies = new Map();
  let db;
  let userId;
  let mongoose;
  let ownedOrderId;
  let foreignOrderId;
  let cartId;
  let cartProductId;
  let cartColorId;
  let cartSizeGroupId;
  let cartSizeId;
  let cartVariantId;
  let checkoutCityId;
  let checkoutPoolId;
  let checkoutStoreId;
  let checkoutLocationId;
  let inventoryVariantId;
  const inventoryIds = [];
  const inventoryKeyPrefix = `inventory-test-${suffix}`;

  try {
    const anonymousMe = await apiRequest("/api/auth/me");
    failed += result("unauthenticated account profile is protected", anonymousMe.response.status === 401, String(anonymousMe.response.status));

    const anonymousCustomer = await apiRequest("/customer-dashboard", { redirect: "manual" });
    failed += result(
      "customer dashboard is protected",
      [303, 307, 308].includes(anonymousCustomer.response.status) && (anonymousCustomer.response.headers.get("location") || "").includes("/auth?mode=login"),
      String(anonymousCustomer.response.status),
    );

    const anonymousAdmin = await apiRequest("/admin", { redirect: "manual" });
    failed += result(
      "admin dashboard is protected",
      [303, 307, 308].includes(anonymousAdmin.response.status) && (anonymousAdmin.response.headers.get("location") || "").includes("/auth?mode=login"),
      String(anonymousAdmin.response.status),
    );

    const signup = await apiRequest("/api/auth/signup", {
      method: "POST",
      jar: customerCookies,
      body: { firstName: "کاربر", lastName: "آزمایشی", email, password, preferredLocale: "fa" },
    });
    failed += result(
      "customer signup destination",
      signup.response.status === 200 && signup.body?.destination === "/customer-dashboard" && customerCookies.has("najib_access") && customerCookies.has("najib_refresh"),
      `${signup.response.status}, ${signup.body?.destination || "no destination"}`,
    );

    const mongoUri = await envValue("MONGODB_URI");
    if (!mongoUri) throw new Error("MONGODB_URI is required for the isolated role test.");
    ({ default: mongoose } = await import("mongoose"));
    const connection = await mongoose.connect(mongoUri, {
      dbName: (await envValue("MONGODB_DB_NAME")) || "najib",
      serverSelectionTimeoutMS: 5_000,
    });
    db = connection.connection.db;
    const user = await db.collection("users").findOne({ email });
    if (!user) throw new Error("Temporary auth-test user was not found.");
    userId = user._id;

    const now = new Date();
    ownedOrderId = new mongoose.Types.ObjectId();
    foreignOrderId = new mongoose.Types.ObjectId();
    cartId = new mongoose.Types.ObjectId();
    cartProductId = new mongoose.Types.ObjectId();
    cartColorId = new mongoose.Types.ObjectId();
    cartSizeGroupId = new mongoose.Types.ObjectId();
    cartSizeId = new mongoose.Types.ObjectId();
    cartVariantId = new mongoose.Types.ObjectId();
    checkoutCityId = new mongoose.Types.ObjectId();
    checkoutPoolId = new mongoose.Types.ObjectId();
    checkoutStoreId = new mongoose.Types.ObjectId();
    checkoutLocationId = new mongoose.Types.ObjectId();
    const orderBase = {
      orderNumber: `TEST-${suffix}`.toUpperCase(),
      idempotencyKey: `test-${suffix}`,
      correlationId: `test-${suffix}`,
      cartId: String(cartId),
      checkoutSessionId: `checkout-${suffix}`,
      contact: { email, firstName: "کاربر", lastName: "آزمایشی", phone: "+989121234567" },
      storeId: "test-store",
      cityId: "test-city",
      currency: "IRR",
      items: [{
        _id: new mongoose.Types.ObjectId(),
        variantId: "test-variant",
        productId: "test-product",
        productName: { fa: "کت آزمایشی", en: "Test jacket", ar: "سترة اختبار" },
        sku: "TEST-SKU",
        colorName: { fa: "مشکی", en: "Black", ar: "أسود" },
        sizeName: { fa: "متوسط", en: "Medium", ar: "متوسط" },
        unitPriceMinor: 1_200_000,
        taxMinor: 0,
        discountMinor: 0,
        quantity: 1,
        lineTotalMinor: 1_200_000,
      }],
      subtotalMinor: 1_200_000,
      taxMinor: 0,
      discountMinor: 0,
      shippingMinor: 0,
      totalMinor: 1_200_000,
      status: "confirmed",
      policyVersion: "test-v1",
      confirmedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    await Promise.all([
      db.collection("orders").insertOne({ ...orderBase, _id: ownedOrderId, userId: String(userId) }),
      db.collection("orders").insertOne({
        ...orderBase,
        _id: foreignOrderId,
        orderNumber: `FOREIGN-${suffix}`.toUpperCase(),
        idempotencyKey: `foreign-${suffix}`,
        checkoutSessionId: `foreign-checkout-${suffix}`,
        userId: String(new mongoose.Types.ObjectId()),
      }),
      db.collection("carts").insertOne({
        _id: cartId,
        userId: String(userId),
        currency: "IRR",
        items: [{ _id: new mongoose.Types.ObjectId(), variantId: cartVariantId, quantity: 2, unitPriceMinor: 400_000, addedAt: now }],
        status: "active",
        expiresAt: new Date(now.getTime() + 86_400_000),
        createdAt: now,
        updatedAt: now,
      }),
      db.collection("products").insertOne({
        _id: cartProductId,
        name: { fa: "پیراهن تست سبد", en: "Cart test shirt", ar: "قميص اختبار السلة" },
        slug: `cart-test-${suffix}`,
        description: { fa: "تست", en: "Test", ar: "اختبار" },
        categoryId: new mongoose.Types.ObjectId(),
        subcategoryId: new mongoose.Types.ObjectId(),
        collectionIds: [],
        colorIds: [cartColorId],
        sizeIds: [cartSizeId],
        basePriceMinor: 900_000,
        currency: "IRR",
        status: "active",
        createdAt: now,
        updatedAt: now,
      }),
      db.collection("colors").insertOne({
        _id: cartColorId,
        name: { fa: "آبی تست", en: "Test blue", ar: "أزرق اختباري" },
        slug: `cart-test-blue-${suffix}`,
        family: { fa: "آبی", en: "Blue", ar: "أزرق" },
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }),
      db.collection("sizegroups").insertOne({
        _id: cartSizeGroupId,
        name: { fa: "سایز تست", en: "Test size", ar: "مقاس اختبار" },
        code: `CART-${suffix}`.toUpperCase(),
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }),
      db.collection("sizes").insertOne({
        _id: cartSizeId,
        sizeGroupId: cartSizeGroupId,
        name: { fa: "متوسط", en: "Medium", ar: "متوسط" },
        code: `M-${suffix}`.toUpperCase(),
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }),
      db.collection("productvariants").insertOne({
        _id: cartVariantId,
        productId: cartProductId,
        colorId: cartColorId,
        sizeId: cartSizeId,
        sku: `CART-${suffix}`.toUpperCase(),
        priceOverrideMinor: 850_000,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }),
      db.collection("cities").insertOne({
        _id: checkoutCityId,
        code: `CHECKOUT-CITY-${suffix}`.toUpperCase(),
        name: { fa: "شهر Checkout", en: "Checkout city", ar: "مدينة الدفع" },
        countryCode: "IR",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }),
      db.collection("inventorypools").insertOne({
        _id: checkoutPoolId,
        code: `CHECKOUT-POOL-${suffix}`.toUpperCase(),
        name: { fa: "استخر Checkout", en: "Checkout pool", ar: "مجموعة الدفع" },
        cityId: checkoutCityId,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }),
      db.collection("stores").insertOne({
        _id: checkoutStoreId,
        code: `CHECKOUT-STORE-${suffix}`.toUpperCase(),
        name: { fa: "فروشگاه Checkout", en: "Checkout store", ar: "متجر الدفع" },
        cityId: checkoutCityId,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }),
      db.collection("inventorylocations").insertOne({
        _id: checkoutLocationId,
        code: `CHECKOUT-LOCATION-${suffix}`.toUpperCase(),
        name: { fa: "موجودی Checkout", en: "Checkout stock", ar: "مخزون الدفع" },
        type: "store",
        cityId: checkoutCityId,
        poolId: checkoutPoolId,
        storeId: checkoutStoreId,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }),
      db.collection("inventorybalances").insertOne({
        _id: new mongoose.Types.ObjectId(),
        variantId: cartVariantId,
        locationId: checkoutLocationId,
        onHand: 10,
        reserved: 0,
        safetyStock: 0,
        version: 0,
        createdAt: now,
        updatedAt: now,
      }),
      db.collection("users").updateOne({ _id: userId }, { $set: { phone: "+989121234567", addresses: [{ _id: new mongoose.Types.ObjectId(), label: "خانه", firstName: "کاربر", lastName: "آزمایشی", phone: "+989121234567", line1: "نشانی آزمایشی", city: "تهران", postalCode: "1234567890", countryCode: "IR", isDefault: true }] } }),
    ]);

    const customerMe = await apiRequest("/api/auth/me", { jar: customerCookies });
    failed += result(
      "customer account profile",
      customerMe.response.status === 200 && customerMe.body?.account?.email === email && customerMe.body?.destination === "/customer-dashboard" && !customerMe.body?.accessToken,
      String(customerMe.response.status),
    );

    for (const path of ["/api/account/summary", "/api/account/orders", "/api/account/cart", "/api/account/profile", "/api/account/checkouts/000000000000000000000000", "/api/account/payments/000000000000000000000000"]) {
      const anonymousAccount = await apiRequest(path);
      failed += result(`anonymous is blocked from ${path}`, anonymousAccount.response.status === 401, String(anonymousAccount.response.status));
    }

    const accountSummary = await apiRequest("/api/account/summary", { jar: customerCookies });
    failed += result(
      "customer summary is scoped and safe",
      accountSummary.response.status === 200 && accountSummary.body?.orders?.total === 1 && accountSummary.body?.profile?.addressCount === 1 && !accountSummary.body?.profile?.passwordHash && accountSummary.response.headers.get("cache-control") === "no-store",
      String(accountSummary.response.status),
    );

    const accountOrders = await apiRequest("/api/account/orders?limit=10", { jar: customerCookies });
    failed += result(
      "customer order list enforces ownership",
      accountOrders.response.status === 200 && accountOrders.body?.items?.length === 1 && accountOrders.body.items[0]?.id === String(ownedOrderId) && !JSON.stringify(accountOrders.body).includes(`FOREIGN-${suffix}`.toUpperCase()),
      String(accountOrders.response.status),
    );

    const ownOrder = await apiRequest(`/api/account/orders/${ownedOrderId}`, { jar: customerCookies });
    const foreignOrder = await apiRequest(`/api/account/orders/${foreignOrderId}`, { jar: customerCookies });
    failed += result(
      "customer order detail is localized and owned",
      ownOrder.response.status === 200 && ownOrder.body?.items?.[0]?.productName === "کت آزمایشی" && ownOrder.body?.items?.[0]?.colorName === "مشکی" && foreignOrder.response.status === 404,
      `${ownOrder.response.status}/${foreignOrder.response.status}`,
    );

    const accountCart = await apiRequest("/api/account/cart", { jar: customerCookies });
    failed += result(
      "customer cart is scoped to the session account",
      accountCart.response.status === 200 && accountCart.body?.id === String(cartId) && accountCart.body?.itemCount === 2,
      String(accountCart.response.status),
    );

    const addCartItem = await apiRequest("/api/account/cart/items", {
      method: "POST",
      jar: customerCookies,
      body: { variantId: String(cartVariantId), quantity: 2 },
    });
    const addedItem = addCartItem.body?.items?.find((item) => item.variantId === String(cartVariantId));
    const updateCartItem = await apiRequest(`/api/account/cart/items/${addedItem?.id}`, {
      method: "PATCH",
      jar: customerCookies,
      body: { quantity: 3 },
    });
    const rejectedClientPrice = await apiRequest("/api/account/cart/items", {
      method: "POST",
      jar: customerCookies,
      body: { variantId: String(cartVariantId), quantity: 1, unitPriceMinor: 1 },
    });
    const checkoutKey = `checkout-test-${suffix}`;
    const startCheckout = await apiRequest("/api/account/checkouts", {
      method: "POST",
      jar: customerCookies,
      body: {
        idempotencyKey: checkoutKey,
        storeId: String(checkoutStoreId),
        cityId: String(checkoutCityId),
      },
    });
    const checkoutId = startCheckout.body?.id;
    const repeatCheckout = await apiRequest("/api/account/checkouts", {
      method: "POST",
      jar: customerCookies,
      body: {
        idempotencyKey: checkoutKey,
        storeId: String(checkoutStoreId),
        cityId: String(checkoutCityId),
      },
    });
    const checkoutDetail = await apiRequest(`/api/account/checkouts/${checkoutId}`, {
      jar: customerCookies,
    });
    const [reservedBalance, checkoutCart] = await Promise.all([
      db.collection("inventorybalances").findOne({
        variantId: cartVariantId,
        locationId: checkoutLocationId,
      }),
      db.collection("carts").findOne({ _id: cartId }),
    ]);
    failed += result(
      "checkout reserves exact variant once and is idempotent",
      startCheckout.response.status === 201 && startCheckout.body?.status === "reserved" &&
        startCheckout.body?.itemCount === 3 && startCheckout.body?.subtotalMinor === 2_550_000 &&
        repeatCheckout.response.status === 201 && repeatCheckout.body?.id === checkoutId &&
        repeatCheckout.body?.idempotent === true && checkoutDetail.response.status === 200 &&
        reservedBalance?.reserved === 3 && checkoutCart?.status === "checkout_started",
      `${startCheckout.response.status}/${repeatCheckout.response.status}/${checkoutDetail.response.status}/${reservedBalance?.reserved}`,
    );

    const cancelCheckout = await apiRequest(`/api/account/checkouts/${checkoutId}`, {
      method: "PATCH",
      jar: customerCookies,
      body: { action: "cancel" },
    });
    const cancelCheckoutAgain = await apiRequest(`/api/account/checkouts/${checkoutId}`, {
      method: "PATCH",
      jar: customerCookies,
      body: { action: "cancel" },
    });
    const [releasedBalance, reopenedCart] = await Promise.all([
      db.collection("inventorybalances").findOne({
        variantId: cartVariantId,
        locationId: checkoutLocationId,
      }),
      db.collection("carts").findOne({ _id: cartId }),
    ]);
    failed += result(
      "checkout cancellation releases stock and reopens cart",
      cancelCheckout.response.status === 200 && cancelCheckout.body?.status === "cancelled" &&
        cancelCheckoutAgain.response.status === 200 && cancelCheckoutAgain.body?.idempotent === true &&
        releasedBalance?.reserved === 0 && reopenedCart?.status === "active",
      `${cancelCheckout.response.status}/${cancelCheckoutAgain.response.status}/${releasedBalance?.reserved}/${reopenedCart?.status}`,
    );

    const removeCartItem = await apiRequest(`/api/account/cart/items/${addedItem?.id}`, {
      method: "DELETE",
      jar: customerCookies,
    });
    const clearCart = await apiRequest("/api/account/cart", {
      method: "DELETE",
      jar: customerCookies,
    });
    failed += result(
      "customer cart mutations use server price and enforce ownership",
      addCartItem.response.status === 200 && addedItem?.unitPriceMinor === 850_000 &&
        updateCartItem.response.status === 200 && updateCartItem.body?.itemCount === 3 &&
        rejectedClientPrice.response.status === 400 && removeCartItem.response.status === 200 &&
        removeCartItem.body?.itemCount === 0 && clearCart.response.status === 200 && clearCart.body?.itemCount === 0,
      `${addCartItem.response.status}/${updateCartItem.response.status}/${rejectedClientPrice.response.status}/${removeCartItem.response.status}/${clearCart.response.status}`,
    );

    const addPaymentItem = await apiRequest("/api/account/cart/items", {
      method: "POST",
      jar: customerCookies,
      body: { variantId: String(cartVariantId), quantity: 2 },
    });
    const paymentCheckoutKey = `payment-checkout-${suffix}`;
    const paymentCheckout = await apiRequest("/api/account/checkouts", {
      method: "POST",
      jar: customerCookies,
      body: {
        idempotencyKey: paymentCheckoutKey,
        storeId: String(checkoutStoreId),
        cityId: String(checkoutCityId),
      },
    });
    const paymentCheckoutId = paymentCheckout.body?.id;
    const paymentIntentKey = `payment-intent-${suffix}`;
    const createPayment = await apiRequest(`/api/account/checkouts/${paymentCheckoutId}/payment-intents`, {
      method: "POST",
      jar: customerCookies,
      body: { idempotencyKey: paymentIntentKey },
    });
    const paymentId = createPayment.body?.id;
    const repeatPayment = await apiRequest(`/api/account/checkouts/${paymentCheckoutId}/payment-intents`, {
      method: "POST",
      jar: customerCookies,
      body: { idempotencyKey: paymentIntentKey },
    });
    const failedPayment = await apiRequest(`/api/account/payments/${paymentId}/confirm`, {
      method: "POST",
      jar: customerCookies,
      body: { idempotencyKey: `payment-test-fail-${suffix}`, outcome: "failed" },
    });
    const balanceAfterFailure = await db.collection("inventorybalances").findOne({
      variantId: cartVariantId,
      locationId: checkoutLocationId,
    });
    const successfulPayment = await apiRequest(`/api/account/payments/${paymentId}/confirm`, {
      method: "POST",
      jar: customerCookies,
      body: { idempotencyKey: `payment-test-success-${suffix}`, outcome: "succeeded" },
    });
    const repeatedSuccess = await apiRequest(`/api/account/payments/${paymentId}/confirm`, {
      method: "POST",
      jar: customerCookies,
      body: { idempotencyKey: `payment-test-success-${suffix}`, outcome: "succeeded" },
    });
    const paymentDetail = await apiRequest(`/api/account/payments/${paymentId}`, {
      jar: customerCookies,
    });
    const [balanceAfterPayment, convertedCart, completedCheckout, storedPayment, createdOrder] = await Promise.all([
      db.collection("inventorybalances").findOne({ variantId: cartVariantId, locationId: checkoutLocationId }),
      db.collection("carts").findOne({ _id: cartId }),
      db.collection("checkoutsessions").findOne({ _id: new mongoose.Types.ObjectId(paymentCheckoutId) }),
      db.collection("paymentintents").findOne({ _id: new mongoose.Types.ObjectId(paymentId) }),
      db.collection("orders").findOne({ checkoutSessionId: paymentCheckoutId }),
    ]);
    failed += result(
      "temporary payment and SMS providers complete the order safely",
      addPaymentItem.response.status === 200 && paymentCheckout.response.status === 201 &&
        createPayment.response.status === 201 && createPayment.body?.status === "requires_action" &&
        createPayment.body?.amountMinor === 1_700_000 && repeatPayment.body?.id === paymentId &&
        repeatPayment.body?.idempotent === true && failedPayment.body?.payment?.status === "failed" &&
        balanceAfterFailure?.reserved === 2 && successfulPayment.body?.payment?.status === "succeeded" &&
        successfulPayment.body?.order?.status === "confirmed" && successfulPayment.body?.sms?.status === "accepted" &&
        repeatedSuccess.body?.payment?.idempotent === true && paymentDetail.body?.status === "succeeded" &&
        balanceAfterPayment?.onHand === 8 && balanceAfterPayment?.reserved === 0 &&
        convertedCart?.status === "converted" && completedCheckout?.status === "completed" &&
        storedPayment?.status === "succeeded" && createdOrder?.totalMinor === 1_700_000,
      `${createPayment.response.status}/${failedPayment.body?.payment?.status}/${successfulPayment.response.status}:${successfulPayment.body?.error || successfulPayment.body?.payment?.status}/${successfulPayment.body?.sms?.status}`,
    );

    const safeProfileUpdate = await apiRequest("/api/account/profile", {
      method: "PATCH",
      jar: customerCookies,
      body: { firstName: "نام جدید", lastName: "آزمایشی", phone: "+98 912 123 4567", preferredLocale: "fa" },
    });
    const unsafeProfileUpdate = await apiRequest("/api/account/profile", {
      method: "PATCH",
      jar: customerCookies,
      body: { roles: ["owner"], status: "suspended", email: "attacker@example.test" },
    });
    const profileAfterUpdates = await apiRequest("/api/account/profile", { jar: customerCookies });
    const storedCustomer = await db.collection("users").findOne({ _id: userId });
    failed += result(
      "profile accepts safe fields and rejects privilege fields",
      safeProfileUpdate.response.status === 200 && safeProfileUpdate.body?.firstName === "نام جدید" && safeProfileUpdate.body?.addresses?.length === 1 && unsafeProfileUpdate.response.status === 400 && storedCustomer?.email === email && storedCustomer?.roles?.includes("customer") && profileAfterUpdates.body?.phone === "+98 912 123 4567",
      `${safeProfileUpdate.response.status}/${unsafeProfileUpdate.response.status}`,
    );

    const customerAdmin = await apiRequest("/admin", { jar: customerCookies, redirect: "manual" });
    failed += result(
      "customer cannot enter admin",
      [303, 307, 308].includes(customerAdmin.response.status) && (customerAdmin.response.headers.get("location") || "").endsWith("/customer-dashboard"),
      String(customerAdmin.response.status),
    );

    const customerRefresh = await apiRequest("/api/auth/refresh", { method: "POST", jar: customerCookies });
    failed += result(
      "customer refresh rotation",
      customerRefresh.response.status === 200 && customerRefresh.body?.destination === "/customer-dashboard",
      String(customerRefresh.response.status),
    );

    await apiRequest("/api/auth/logout", { method: "POST", jar: customerCookies });
    const afterLogout = await apiRequest("/api/auth/me", { jar: customerCookies });
    failed += result("customer logout revokes session", afterLogout.response.status === 401, String(afterLogout.response.status));

    const customerLogin = await apiRequest("/api/auth/login", {
      method: "POST",
      jar: customerCookies,
      body: { email, password },
    });
    failed += result(
      "customer login destination",
      customerLogin.response.status === 200 && customerLogin.body?.destination === "/customer-dashboard",
      `${customerLogin.response.status}, ${customerLogin.body?.destination || "no destination"}`,
    );

    customerCookies.set("najib_admin_access", customerCookies.get("najib_access"));
    customerCookies.set("najib_admin_refresh", customerCookies.get("najib_refresh"));
    customerCookies.delete("najib_access");
    customerCookies.delete("najib_refresh");
    const legacyMe = await apiRequest("/api/auth/me", { jar: customerCookies });
    const legacyRefresh = await apiRequest("/api/auth/refresh", { method: "POST", jar: customerCookies });
    failed += result(
      "legacy cookies migrate to unified cookies",
      legacyMe.response.status === 200 && legacyRefresh.response.status === 200 && customerCookies.has("najib_access") && customerCookies.has("najib_refresh") && !customerCookies.has("najib_admin_access") && !customerCookies.has("najib_admin_refresh"),
      String(legacyRefresh.response.status),
    );
    await apiRequest("/api/auth/logout", { method: "POST", jar: customerCookies });

    await db.collection("users").updateOne({ _id: userId }, { $set: { roles: ["owner"], permissions: [] } });

    const adminLogin = await apiRequest("/api/auth/login", {
      method: "POST",
      jar: adminCookies,
      body: { email, password },
    });
    failed += result(
      "admin login destination",
      adminLogin.response.status === 200 && adminLogin.body?.destination === "/admin",
      `${adminLogin.response.status}, ${adminLogin.body?.destination || "no destination"}`,
    );

    const adminMe = await apiRequest("/api/auth/me", { jar: adminCookies });
    failed += result(
      "admin account profile",
      adminMe.response.status === 200 && adminMe.body?.destination === "/admin" && adminMe.body?.account?.permissions?.includes("admin.access"),
      String(adminMe.response.status),
    );

    inventoryVariantId = new mongoose.Types.ObjectId();
    await db.collection("productvariants").insertOne({
      _id: inventoryVariantId,
      productId: new mongoose.Types.ObjectId(),
      colorId: new mongoose.Types.ObjectId(),
      sizeId: new mongoose.Types.ObjectId(),
      sku: `INV-${suffix}`.toUpperCase(),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const localizedName = (fa, en, ar) => ({ fa, en, ar });
    const cityCreate = await apiRequest("/api/admin/inventory/cities", {
      method: "POST",
      jar: adminCookies,
      body: {
        code: `city_${suffix}`,
        name: localizedName("شهر تست", "Test city", "مدينة اختبار"),
        countryCode: "IR",
        isActive: true,
      },
    });
    const cityId = cityCreate.body?._id;
    if (cityId) inventoryIds.push(cityId);
    const poolCreate = await apiRequest("/api/admin/inventory/pools", {
      method: "POST",
      jar: adminCookies,
      body: {
        code: `pool_${suffix}`,
        name: localizedName("استخر تست", "Test pool", "مجموعة اختبار"),
        cityId,
        isActive: true,
      },
    });
    const poolId = poolCreate.body?._id;
    if (poolId) inventoryIds.push(poolId);
    const storeCreate = await apiRequest("/api/admin/inventory/stores", {
      method: "POST",
      jar: adminCookies,
      body: {
        code: `store_${suffix}`,
        name: localizedName("فروشگاه تست", "Test store", "متجر اختبار"),
        cityId,
        isActive: true,
      },
    });
    const storeId = storeCreate.body?._id;
    if (storeId) inventoryIds.push(storeId);
    const sourceCreate = await apiRequest("/api/admin/inventory/locations", {
      method: "POST",
      jar: adminCookies,
      body: {
        code: `source_${suffix}`,
        name: localizedName("انبار تست", "Test warehouse", "مستودع اختبار"),
        type: "warehouse",
        cityId,
        poolId,
        isActive: true,
      },
    });
    const sourceLocationId = sourceCreate.body?._id;
    if (sourceLocationId) inventoryIds.push(sourceLocationId);
    const destinationCreate = await apiRequest("/api/admin/inventory/locations", {
      method: "POST",
      jar: adminCookies,
      body: {
        code: `destination_${suffix}`,
        name: localizedName("شعبه تست", "Test branch", "فرع اختبار"),
        type: "store",
        cityId,
        poolId,
        storeId,
        isActive: true,
      },
    });
    const destinationLocationId = destinationCreate.body?._id;
    if (destinationLocationId) inventoryIds.push(destinationLocationId);
    failed += result(
      "admin creates localized inventory hierarchy",
      [cityCreate, poolCreate, storeCreate, sourceCreate, destinationCreate].every(({ response }) => response.status === 201) &&
        Boolean(cityId && poolId && storeId && sourceLocationId && destinationLocationId),
      [cityCreate, poolCreate, storeCreate, sourceCreate, destinationCreate].map(({ response }) => response.status).join("/"),
    );

    const adjustmentBody = {
      idempotencyKey: `${inventoryKeyPrefix}:adjust`,
      variantId: String(inventoryVariantId),
      locationId: sourceLocationId,
      delta: 10,
      safetyStock: 0,
      reason: "isolated inventory adjustment test",
    };
    const adjustment = await apiRequest("/api/admin/inventory/adjustments", {
      method: "POST",
      jar: adminCookies,
      body: adjustmentBody,
    });
    const adjustmentRetry = await apiRequest("/api/admin/inventory/adjustments", {
      method: "POST",
      jar: adminCookies,
      body: adjustmentBody,
    });
    const adjustmentKeyConflict = await apiRequest("/api/admin/inventory/adjustments", {
      method: "POST",
      jar: adminCookies,
      body: { ...adjustmentBody, delta: 11 },
    });
    const initialAvailability = await apiRequest(`/api/storefront/inventory/availability?variantId=${inventoryVariantId}`);
    failed += result(
      "inventory adjustment is atomic and idempotent",
      adjustment.response.status === 201 && adjustment.body?.balance?.available === 10 &&
        adjustmentRetry.response.status === 201 && adjustmentRetry.body?.idempotent === true &&
        adjustmentKeyConflict.response.status === 409 &&
        initialAvailability.response.status === 200 && initialAvailability.body?.available === 10,
      `${adjustment.response.status}/${adjustmentRetry.response.status}/${adjustmentKeyConflict.response.status}/${initialAvailability.body?.available}`,
    );

    const reservation = await apiRequest("/api/admin/inventory/reservations", {
      method: "POST",
      jar: adminCookies,
      body: {
        idempotencyKey: `${inventoryKeyPrefix}:reserve`,
        items: [{ variantId: String(inventoryVariantId), locationId: sourceLocationId, quantity: 3 }],
        expiresAt: new Date(Date.now() + 600_000).toISOString(),
      },
    });
    const reservationId = reservation.body?.reservation?._id;
    const reservedAvailability = await apiRequest(`/api/storefront/inventory/availability?variantId=${inventoryVariantId}`);
    const commitReservation = await apiRequest(`/api/admin/inventory/reservations/${reservationId}`, {
      method: "PATCH",
      jar: adminCookies,
      body: { action: "commit", reason: "isolated checkout completion test" },
    });
    const committedAvailability = await apiRequest(`/api/storefront/inventory/availability?variantId=${inventoryVariantId}`);
    failed += result(
      "reservation reduces availability and commit consumes stock",
      reservation.response.status === 201 && reservedAvailability.body?.available === 7 &&
        commitReservation.response.status === 200 && commitReservation.body?.reservation?.status === "committed" &&
        committedAvailability.body?.available === 7,
      `${reservation.response.status}/${reservedAvailability.body?.available}/${commitReservation.response.status}/${committedAvailability.body?.available}`,
    );

    const transfer = await apiRequest("/api/admin/inventory/transfers", {
      method: "POST",
      jar: adminCookies,
      body: {
        idempotencyKey: `${inventoryKeyPrefix}:transfer`,
        sourceLocationId,
        destinationLocationId,
        items: [{ variantId: String(inventoryVariantId), quantity: 2 }],
        reason: "isolated inventory transfer test",
      },
    });
    const balances = await apiRequest(`/api/admin/inventory/balances?variantId=${inventoryVariantId}&include=references`, { jar: adminCookies });
    const movements = await apiRequest(`/api/admin/inventory/movements?variantId=${inventoryVariantId}`, { jar: adminCookies });
    const finalAvailability = await apiRequest(`/api/storefront/inventory/availability?variantId=${inventoryVariantId}`);
    failed += result(
      "inventory transfer preserves aggregate stock and writes ledger",
      transfer.response.status === 201 && balances.response.status === 200 && balances.body?.items?.length === 2 &&
        movements.body?.pagination?.total === 5 && finalAvailability.body?.available === 7,
      `${transfer.response.status}/${balances.body?.items?.length}/${movements.body?.pagination?.total}/${finalAvailability.body?.available}`,
    );

    for (const path of ["/api/account/summary", "/api/account/orders", "/api/account/cart", "/api/account/profile", "/api/account/checkouts/000000000000000000000000", "/api/account/payments/000000000000000000000000"]) {
      const staffAccount = await apiRequest(path, { jar: adminCookies });
      failed += result(`staff is isolated from ${path}`, staffAccount.response.status === 403, String(staffAccount.response.status));
    }

    for (const [name, path] of [
      ["admin can list orders", "/api/admin/orders?limit=2"],
      ["admin can list carts", "/api/admin/carts?limit=2"],
      ["admin can list checkouts", "/api/admin/checkouts?limit=2"],
      ["admin can list abandoned checkouts", "/api/admin/abandoned-checkouts?limit=2"],
      ["admin can read audit history", "/api/admin/audit?limit=2"],
    ]) {
      const operationalList = await apiRequest(path, { jar: adminCookies });
      failed += result(
        name,
        operationalList.response.status === 200 && Array.isArray(operationalList.body?.items),
        String(operationalList.response.status),
      );
    }

    const fulfillOrder = await apiRequest(`/api/admin/orders/${ownedOrderId}`, {
      method: "PATCH",
      jar: adminCookies,
      body: { action: "mark_fulfilled", reason: "isolated API transaction test" },
    });
    const [fulfilledOrder, fulfillmentAudit, fulfillmentEvent] = await Promise.all([
      db.collection("orders").findOne({ _id: ownedOrderId }),
      db.collection("staffaudits").findOne({
        userId,
        targetId: String(ownedOrderId),
        action: "order.mark_fulfilled",
      }),
      db.collection("outboxes").findOne({
        correlationId: `test-${suffix}`,
        eventType: "OrderFulfilled",
      }),
    ]);
    failed += result(
      "admin order action commits status, audit, and outbox atomically",
      fulfillOrder.response.status === 200 &&
        fulfilledOrder?.status === "fulfilled" &&
        Boolean(fulfillmentAudit) &&
        Boolean(fulfillmentEvent),
      String(fulfillOrder.response.status),
    );

    const adminCustomer = await apiRequest("/customer-dashboard", { jar: adminCookies, redirect: "manual" });
    failed += result(
      "admin is isolated from customer dashboard",
      [303, 307, 308].includes(adminCustomer.response.status) && (adminCustomer.response.headers.get("location") || "").endsWith("/admin"),
      String(adminCustomer.response.status),
    );

    const adminPage = await apiRequest("/admin", { jar: adminCookies, redirect: "manual" });
    failed += result("admin can enter admin dashboard", adminPage.response.status === 200, String(adminPage.response.status));

    await apiRequest("/api/auth/logout", { method: "POST", jar: adminCookies });
  } catch (error) {
    failed += 1;
    console.log(`[FAIL] isolated role-based auth flow: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    if (db && userId) {
      await Promise.all([
        db.collection("staffsessions").deleteMany({ userId }),
        db.collection("staffaudits").deleteMany({ userId }),
        db.collection("orders").deleteMany({
          $or: [{ userId: String(userId) }, { _id: foreignOrderId }],
        }),
        db.collection("carts").deleteMany({ _id: { $in: [cartId].filter(Boolean) } }),
        db.collection("checkoutsessions").deleteMany({ userId: String(userId) }),
        db.collection("paymentintents").deleteMany({ userId }),
        db.collection("paymentattempts").deleteMany({ idempotencyKey: { $regex: `${suffix}$` } }),
        db.collection("productvariants").deleteMany({ _id: cartVariantId }),
        db.collection("products").deleteMany({ _id: cartProductId }),
        db.collection("sizes").deleteMany({ _id: cartSizeId }),
        db.collection("sizegroups").deleteMany({ _id: cartSizeGroupId }),
        db.collection("colors").deleteMany({ _id: cartColorId }),
        db.collection("outboxes").deleteMany({
          $or: [{ correlationId: `test-${suffix}` }, { "payload.userId": String(userId) }],
        }),
        db.collection("inventorymovements").deleteMany({ actorId: userId }),
        db.collection("inventoryreservations").deleteMany({ userId }),
        db.collection("inventorybalances").deleteMany({ variantId: cartVariantId }),
        db.collection("inventorylocations").deleteMany({ _id: checkoutLocationId }),
        db.collection("inventorypools").deleteMany({ _id: checkoutPoolId }),
        db.collection("stores").deleteMany({ _id: checkoutStoreId }),
        db.collection("cities").deleteMany({ _id: checkoutCityId }),
        db.collection("inventorymovements").deleteMany({ idempotencyKey: { $regex: `^${inventoryKeyPrefix}` } }),
        db.collection("inventoryreservations").deleteMany({ idempotencyKey: { $regex: `^${inventoryKeyPrefix}` } }),
        db.collection("inventorytransfers").deleteMany({ idempotencyKey: { $regex: `^${inventoryKeyPrefix}` } }),
        db.collection("inventorybalances").deleteMany({ variantId: inventoryVariantId }),
        db.collection("inventorylocations").deleteMany({ _id: { $in: inventoryIds } }),
        db.collection("inventorypools").deleteMany({ _id: { $in: inventoryIds } }),
        db.collection("stores").deleteMany({ _id: { $in: inventoryIds } }),
        db.collection("cities").deleteMany({ _id: { $in: inventoryIds } }),
        db.collection("productvariants").deleteMany({ _id: inventoryVariantId }),
        db.collection("users").deleteOne({ _id: userId }),
      ]).catch(() => undefined);
    }
    if (mongoose && mongoose.connection.readyState !== 0) await mongoose.disconnect();
  }
  return failed;
}

async function main() {
  let failed = 0;
  console.log(`[API TEST] ${checks.length} backend checks + isolated role auth flow against ${baseUrl}`);

  for (const check of checks) {
    const startedAt = performance.now();
    try {
      const response = await fetch(`${baseUrl}${check.path}`, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(10_000),
      });
      const body = await response.json();
      const duration = Math.round(performance.now() - startedAt);
      const passed = response.status === check.status && check.validate(body, response);
      console.log(`[${passed ? "PASS" : "FAIL"}] ${check.name} (${response.status}, ${duration}ms)`);
      if (!passed) failed += 1;
    } catch (error) {
      failed += 1;
      console.log(`[FAIL] ${check.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  failed += await runAuthFlow();

  if (failed > 0) {
    console.error(`[FAILED] ${failed}/${checks.length} checks failed`);
    process.exit(1);
  }

  console.log("[SUCCESS] Backend and unified role-based auth checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
