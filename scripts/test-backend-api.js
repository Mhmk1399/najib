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
    name: "atomic product composer is protected",
    path: "/api/admin/catalog/products/complete",
    method: "POST",
    body: {},
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
    signal: AbortSignal.timeout(20_000),
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
  let cartImageId;
  let foreignCartId;
  let foreignCartItemId;
  let checkoutCityId;
  let checkoutPoolId;
  let checkoutStoreId;
  let checkoutLocationId;
  let checkoutLocationId2;
  let splitStoreId;
  let splitProductId;
  let splitVariantId;
  let mismatchedStoreId;
  let mismatchedLocationId;
  let mismatchedLocationCityId;
  let inventoryVariantId;
  let recoveryAbandonedId;
  let recoveryUnavailableVariantId;
  let recoveryCheckoutId;
  let recoveryPaymentId;
  let foreignRecoveryUserId;
  let composerCategoryId;
  let composerSubcategoryId;
  let composerProductId;
  let composerVariantId;
  let composerColor2Id;
  const inventoryIds = [];
  const composerPermissionUserIds = [];
  const inventoryKeyPrefix = `inventory-test-${suffix}`;

  try {
    const anonymousMe = await apiRequest("/api/auth/me");
    failed += result("unauthenticated account profile is protected", anonymousMe.response.status === 401, String(anonymousMe.response.status));

    const anonymousCustomer = await apiRequest("/customer-dashboard", { redirect: "manual" });
    const anonymousCustomerLocalized = await apiRequest("/fa/customer-dashboard", { redirect: "manual" });
    const anonymousCustomerLocation = anonymousCustomer.response.headers.get("location") || "";
    const anonymousCustomerLocalizedLocation = anonymousCustomerLocalized.response.headers.get("location") || "";
    const anonymousCustomerLogin = await apiRequest(anonymousCustomerLocalizedLocation, { redirect: "manual" });
    const anonymousCustomerLoginLocation = anonymousCustomerLogin.response.headers.get("location") || "";
    failed += result(
      "customer dashboard is protected",
      [303, 307, 308].includes(anonymousCustomer.response.status) &&
        anonymousCustomerLocation === "/fa/customer-dashboard" &&
        [303, 307, 308].includes(anonymousCustomerLocalized.response.status) &&
        anonymousCustomerLocalizedLocation.includes("/auth?mode=login") &&
        [303, 307, 308].includes(anonymousCustomerLogin.response.status) &&
        anonymousCustomerLoginLocation.includes("/fa/auth?mode=login"),
      `${anonymousCustomer.response.status}:${anonymousCustomerLocation} -> ${anonymousCustomerLocalized.response.status}:${anonymousCustomerLocalizedLocation} -> ${anonymousCustomerLogin.response.status}:${anonymousCustomerLoginLocation}`,
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
    cartImageId = new mongoose.Types.ObjectId();
    foreignCartId = new mongoose.Types.ObjectId();
    foreignCartItemId = new mongoose.Types.ObjectId();
    checkoutCityId = new mongoose.Types.ObjectId();
    checkoutPoolId = new mongoose.Types.ObjectId();
    checkoutStoreId = new mongoose.Types.ObjectId();
    checkoutLocationId = new mongoose.Types.ObjectId();
    checkoutLocationId2 = new mongoose.Types.ObjectId();
    splitStoreId = new mongoose.Types.ObjectId();
    splitProductId = new mongoose.Types.ObjectId();
    splitVariantId = new mongoose.Types.ObjectId();
    mismatchedStoreId = new mongoose.Types.ObjectId();
    mismatchedLocationId = new mongoose.Types.ObjectId();
    mismatchedLocationCityId = new mongoose.Types.ObjectId();
    composerCategoryId = new mongoose.Types.ObjectId();
    composerSubcategoryId = new mongoose.Types.ObjectId();
    composerColor2Id = new mongoose.Types.ObjectId();
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
        currency: "USD",
        items: [{ _id: new mongoose.Types.ObjectId(), variantId: cartVariantId, quantity: 2, unitPriceMinor: 400_000, addedAt: now }],
        status: "active",
        expiresAt: new Date(now.getTime() + 86_400_000),
        createdAt: now,
        updatedAt: now,
      }),
      db.collection("carts").insertOne({
        _id: foreignCartId,
        userId: String(new mongoose.Types.ObjectId()),
        currency: "IRR",
        items: [{ _id: foreignCartItemId, variantId: cartVariantId, quantity: 1, unitPriceMinor: 850_000, addedAt: now }],
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
        currency: "USD",
        primaryImageId: cartImageId,
        status: "active",
        createdAt: now,
        updatedAt: now,
      }),
      db.collection("imageassets").insertOne({
        _id: cartImageId,
        url: "/assets/images/banner.webp",
        alt: { fa: "تصویر پیراهن تست", en: "Cart test shirt image", ar: "صورة قميص اختبار السلة" },
        objectPosition: "center",
        isActive: true,
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
      db.collection("categories").insertOne({ _id: composerCategoryId, name: { fa: "دسته سازنده", en: "Composer category", ar: "فئة المنشئ" }, slug: `composer-category-${suffix}`, isActive: true, createdAt: now, updatedAt: now }),
      db.collection("subcategories").insertOne({ _id: composerSubcategoryId, categoryId: composerCategoryId, name: { fa: "زیردسته سازنده", en: "Composer subcategory", ar: "فئة فرعية للمنشئ" }, slug: `composer-subcategory-${suffix}`, isActive: true, createdAt: now, updatedAt: now }),
      db.collection("colors").insertOne({ _id: composerColor2Id, name: { fa: "سفید سازنده", en: "Composer white", ar: "أبيض المنشئ" }, slug: `composer-white-${suffix}`, family: { fa: "سفید", en: "White", ar: "أبيض" }, isActive: true, createdAt: now, updatedAt: now }),
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
        shippingFeeMinor: 75_000,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }),
      db.collection("stores").insertOne({
        _id: mismatchedStoreId,
        code: `MISMATCHED-STORE-${suffix}`.toUpperCase(),
        name: { fa: "فروشگاه با محل نامعتبر", en: "Mismatched location store", ar: "متجر بموقع غير متطابق" },
        cityId: checkoutCityId,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }),
      db.collection("stores").insertOne({
        _id: splitStoreId,
        code: `Z-SPLIT-STORE-${suffix}`.toUpperCase(),
        name: { fa: "شعبه دوم ارسال", en: "Second shipping branch", ar: "فرع الشحن الثاني" },
        cityId: checkoutCityId,
        shippingFeeMinor: 25_000,
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
        storeId: splitStoreId,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }),
      db.collection("inventorybalances").insertOne({
        _id: new mongoose.Types.ObjectId(),
        variantId: cartVariantId,
        locationId: checkoutLocationId,
        onHand: 2,
        reserved: 0,
        safetyStock: 0,
        version: 0,
        createdAt: now,
        updatedAt: now,
      }),
      db.collection("inventorylocations").insertOne({
        _id: checkoutLocationId2,
        code: `CHECKOUT-LOCATION-SECOND-${suffix}`.toUpperCase(),
        name: { fa: "موجودی دوم Checkout", en: "Second checkout stock", ar: "مخزون الدفع الثاني" },
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
        locationId: checkoutLocationId2,
        onHand: 2,
        reserved: 0,
        safetyStock: 0,
        version: 0,
        createdAt: now,
        updatedAt: now,
      }),
      db.collection("inventorylocations").insertOne({
        _id: mismatchedLocationId,
        code: `MISMATCHED-LOCATION-${suffix}`.toUpperCase(),
        name: { fa: "محل شهر دیگر", en: "Other-city location", ar: "موقع مدينة أخرى" },
        type: "store",
        cityId: mismatchedLocationCityId,
        poolId: checkoutPoolId,
        storeId: mismatchedStoreId,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }),
      db.collection("inventorybalances").insertOne({
        _id: new mongoose.Types.ObjectId(),
        variantId: cartVariantId,
        locationId: mismatchedLocationId,
        onHand: 99,
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

    for (const path of ["/api/account/summary", "/api/account/orders", "/api/account/cart", "/api/account/profile", "/api/account/checkouts", "/api/account/checkouts/000000000000000000000000", "/api/account/payments/000000000000000000000000"]) {
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
    const englishCart = await apiRequest("/api/account/cart?locale=en", { jar: customerCookies });
    const arabicCart = await apiRequest("/api/account/cart?locale=ar", { jar: customerCookies });
    const invalidLocaleCart = await apiRequest("/api/account/cart?locale=de", { jar: customerCookies });
    failed += result(
      "customer cart is owned and localized in fa/en/ar",
      accountCart.response.status === 200 && accountCart.body?.id === String(cartId) && accountCart.body?.itemCount === 2 &&
        accountCart.body?.items?.[0]?.productName === "پیراهن تست سبد" &&
        englishCart.response.status === 200 && englishCart.body?.items?.[0]?.productName === "Cart test shirt" &&
        englishCart.body?.items?.[0]?.colorName === "Test blue" && englishCart.body?.items?.[0]?.sizeName === "Medium" &&
        englishCart.body?.items?.[0]?.imageAlt === "Cart test shirt image" &&
        arabicCart.response.status === 200 && arabicCart.body?.items?.[0]?.productName === "قميص اختبار السلة" &&
        arabicCart.body?.items?.[0]?.colorName === "أزرق اختباري" && arabicCart.body?.items?.[0]?.sizeName === "متوسط" &&
        arabicCart.body?.items?.[0]?.imageAlt === "صورة قميص اختبار السلة" && invalidLocaleCart.response.status === 400,
      `${accountCart.response.status}/${englishCart.response.status}/${arabicCart.response.status}/${invalidLocaleCart.response.status}`,
    );

    const addCartItem = await apiRequest("/api/account/cart/items?locale=en", {
      method: "POST",
      jar: customerCookies,
      body: { variantId: String(cartVariantId), quantity: 2 },
    });
    const addedItem = addCartItem.body?.items?.find((item) => item.variantId === String(cartVariantId));
    const updateCartItem = await apiRequest(`/api/account/cart/items/${addedItem?.id}?locale=ar`, {
      method: "PATCH",
      jar: customerCookies,
      body: { quantity: 3 },
    });
    const rejectedClientPrice = await apiRequest("/api/account/cart/items", {
      method: "POST",
      jar: customerCookies,
      body: { variantId: String(cartVariantId), quantity: 1, unitPriceMinor: 1 },
    });
    const checkoutDestinations = await apiRequest("/api/account/checkouts", { jar: customerCookies });
    const repeatedPlanPreview = await apiRequest("/api/account/checkouts", { jar: customerCookies });
    const checkoutShipment = checkoutDestinations.body?.shipments?.find(
      (shipment) => shipment.storeId === String(checkoutStoreId),
    );
    failed += result(
      "checkout builds a deterministic shipment plan",
      checkoutDestinations.response.status === 200 && checkoutShipment?.shippingMinor === 75_000 &&
        checkoutDestinations.body?.shipmentCount === 2 && checkoutDestinations.body?.shippingMinor === 100_000 &&
        checkoutDestinations.body?.shipments?.every((shipment) => shipment.items?.length > 0) &&
        checkoutDestinations.body?.shipments?.reduce((sum, shipment) => sum + shipment.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0) === 3 &&
        checkoutDestinations.body?.totalMinor === checkoutDestinations.body?.subtotalMinor + 100_000 &&
        typeof checkoutDestinations.body?.fulfillmentPlanHash === "string" &&
        repeatedPlanPreview.body?.fulfillmentPlanHash === checkoutDestinations.body?.fulfillmentPlanHash &&
        JSON.stringify(repeatedPlanPreview.body?.shipments) === JSON.stringify(checkoutDestinations.body?.shipments),
      `${checkoutDestinations.response.status}/${checkoutDestinations.body?.shipmentCount}/${checkoutDestinations.body?.shippingMinor}`,
    );
    await db.collection("carts").updateOne({ _id: cartId }, { $set: { "items.0.quantity": 5 } });
    const unavailablePlan = await apiRequest("/api/account/checkouts", { jar: customerCookies });
    await db.collection("carts").updateOne({ _id: cartId }, { $set: { "items.0.quantity": 3 } });
    failed += result(
      "checkout explains insufficient combined branch inventory",
      unavailablePlan.response.status === 200 && unavailablePlan.body?.fulfillable === false &&
        unavailablePlan.body?.shipments?.length === 0 && unavailablePlan.body?.unavailableItems?.[0]?.requested === 5 &&
        unavailablePlan.body?.unavailableItems?.[0]?.available === 4,
      `${unavailablePlan.response.status}/${unavailablePlan.body?.unavailableItems?.[0]?.requested}/${unavailablePlan.body?.unavailableItems?.[0]?.available}`,
    );
    await db.collection("productvariants").updateOne({ _id: cartVariantId }, { $set: { priceOverrideMinor: 860_000 } });
    const staleCheckout = await apiRequest("/api/account/checkouts", {
      method: "POST", jar: customerCookies,
      body: { idempotencyKey: `checkout-stale-${suffix}`, fulfillmentPlanHash: checkoutDestinations.body?.fulfillmentPlanHash },
    });
    const staleReservation = await db.collection("inventoryreservations").findOne({ idempotencyKey: `checkout-stale-${suffix}:inventory` });
    await db.collection("productvariants").updateOne({ _id: cartVariantId }, { $set: { priceOverrideMinor: 850_000 } });
    const refreshedCheckoutPlan = await apiRequest("/api/account/checkouts", { jar: customerCookies });
    failed += result(
      "stale price plan rolls back without a partial reservation",
      staleCheckout.response.status === 409 && staleCheckout.body?.details?.code === "STALE_FULFILLMENT_PLAN" && !staleReservation,
      `${staleCheckout.response.status}/${staleCheckout.body?.details?.code}/${Boolean(staleReservation)}`,
    );
    const checkoutKey = `checkout-test-${suffix}`;
    const startCheckout = await apiRequest("/api/account/checkouts", {
      method: "POST",
      jar: customerCookies,
      body: {
        idempotencyKey: checkoutKey,
        fulfillmentPlanHash: refreshedCheckoutPlan.body?.fulfillmentPlanHash,
      },
    });
    const checkoutId = startCheckout.body?.id;
    const repeatCheckout = await apiRequest("/api/account/checkouts", {
      method: "POST",
      jar: customerCookies,
      body: {
        idempotencyKey: checkoutKey,
        fulfillmentPlanHash: refreshedCheckoutPlan.body?.fulfillmentPlanHash,
      },
    });
    const checkoutDetail = await apiRequest(`/api/account/checkouts/${checkoutId}`, {
      jar: customerCookies,
    });
    const [reservedBalances, checkoutCart] = await Promise.all([
      db.collection("inventorybalances").find({
        variantId: cartVariantId,
        locationId: { $in: [checkoutLocationId, checkoutLocationId2] },
      }).toArray(),
      db.collection("carts").findOne({ _id: cartId }),
    ]);
    const reservedQuantity = reservedBalances.reduce((sum, balance) => sum + balance.reserved, 0);
    failed += result(
      "checkout reserves exact variant once and is idempotent",
      startCheckout.response.status === 201 && startCheckout.body?.status === "reserved" &&
        startCheckout.body?.itemCount === 3 && startCheckout.body?.subtotalMinor === 2_550_000 &&
        repeatCheckout.response.status === 201 && repeatCheckout.body?.id === checkoutId &&
        repeatCheckout.body?.idempotent === true && checkoutDetail.response.status === 200 &&
        reservedQuantity === 3 && reservedBalances.every((balance) => balance.reserved > 0) && checkoutCart?.status === "checkout_started",
      `${startCheckout.response.status}/${repeatCheckout.response.status}/${checkoutDetail.response.status}/${reservedQuantity}`,
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

    const sourceProduct = await db.collection("products").findOne({ _id: cartProductId });
    await Promise.all([
      db.collection("products").insertOne({ ...sourceProduct, _id: splitProductId, name: { fa: "شلوار تست ارسال", en: "Split shipping trousers", ar: "بنطال اختبار الشحن" }, slug: `split-product-${suffix}`, currency: "EUR", primaryImageId: cartImageId, createdAt: now, updatedAt: now }),
      db.collection("productvariants").insertOne({ _id: splitVariantId, productId: splitProductId, colorId: cartColorId, sizeId: cartSizeId, sku: `SPLIT-${suffix}`.toUpperCase(), priceOverrideMinor: 600_000, isActive: true, createdAt: now, updatedAt: now }),
      db.collection("inventorybalances").updateOne({ variantId: cartVariantId, locationId: checkoutLocationId }, { $set: { onHand: 0, reserved: 0 } }),
      db.collection("inventorybalances").insertOne({ _id: new mongoose.Types.ObjectId(), variantId: splitVariantId, locationId: checkoutLocationId, onHand: 1, reserved: 0, safetyStock: 0, version: 0, createdAt: now, updatedAt: now }),
    ]);
    await db.collection("carts").updateOne({ _id: cartId }, { $set: { items: [{ _id: new mongoose.Types.ObjectId(), variantId: cartVariantId, quantity: 1, unitPriceMinor: 850_000, addedAt: now }, { _id: new mongoose.Types.ObjectId(), variantId: splitVariantId, quantity: 1, unitPriceMinor: 600_000, addedAt: now }] } });
    const twoProductPlan = await apiRequest("/api/account/checkouts", { jar: customerCookies });
    failed += result(
      "two different products are assigned to their actual stores",
      twoProductPlan.response.status === 200 && twoProductPlan.body?.currency === "IRR" && twoProductPlan.body?.shipmentCount === 2 &&
        new Set(twoProductPlan.body?.shipments?.map((shipment) => shipment.storeId)).size === 2 &&
        new Set(twoProductPlan.body?.shipments?.flatMap((shipment) => shipment.items.map((item) => item.variantId))).size === 2,
      `${twoProductPlan.response.status}/${twoProductPlan.body?.shipmentCount}`,
    );
    const missingVariantId = new mongoose.Types.ObjectId();
    const inactiveLineId = new mongoose.Types.ObjectId();
    const missingLineId = new mongoose.Types.ObjectId();
    const validLineId = new mongoose.Types.ObjectId();
    await Promise.all([
      db.collection("productvariants").updateOne({ _id: cartVariantId }, { $set: { isActive: false } }),
      db.collection("carts").updateOne({ _id: cartId }, { $set: { status: "active", currency: "USD", items: [
        { _id: inactiveLineId, variantId: cartVariantId, quantity: 1, unitPriceMinor: 111, addedAt: now },
        { _id: missingLineId, variantId: missingVariantId, quantity: 1, unitPriceMinor: 222, addedAt: now },
        { _id: validLineId, variantId: splitVariantId, quantity: 1, unitPriceMinor: 333, addedAt: now },
      ] } }),
    ]);
    const readableUnavailableCart = await apiRequest("/api/account/cart", { jar: customerCookies });
    const removeUnavailableOne = await apiRequest(`/api/account/cart/items/${missingLineId}`, { method: "DELETE", jar: customerCookies });
    const clearUnavailableCart = await apiRequest("/api/account/cart", { method: "DELETE", jar: customerCookies });
    failed += result(
      "cart stays readable and removable with multiple unavailable legacy-currency lines",
      readableUnavailableCart.response.status === 200 && readableUnavailableCart.body?.currency === "IRR" && readableUnavailableCart.body?.items?.length === 3 && readableUnavailableCart.body.items.filter((item) => item.available === false).length === 2 && readableUnavailableCart.body.items.find((item) => item.variantId === String(splitVariantId))?.unitPriceMinor === 600_000 && removeUnavailableOne.response.status === 200 && clearUnavailableCart.response.status === 200,
      `${readableUnavailableCart.response.status}/${removeUnavailableOne.response.status}/${clearUnavailableCart.response.status}`,
    );
    await Promise.all([
      db.collection("productvariants").updateOne({ _id: cartVariantId }, { $set: { isActive: true } }),
      db.collection("carts").updateOne({ _id: cartId }, { $set: { status: "active", items: [{ _id: new mongoose.Types.ObjectId(addedItem.id), variantId: cartVariantId, quantity: 3, unitPriceMinor: 850_000, addedAt: now }] } }),
      db.collection("inventorybalances").updateOne({ variantId: cartVariantId, locationId: checkoutLocationId }, { $set: { onHand: 2, reserved: 0 } }),
    ]);

    const retainedItemId = new mongoose.Types.ObjectId();
    await db.collection("carts").updateOne(
      { _id: cartId },
      { $push: { items: { _id: retainedItemId, variantId: cartVariantId, quantity: 1, unitPriceMinor: 850_000, addedAt: now } } },
    );
    const invalidLocalePost = await apiRequest("/api/account/cart/items?locale=de", {
      method: "POST", jar: customerCookies, body: { variantId: String(cartVariantId), quantity: 1 },
    });
    const invalidLocalePatch = await apiRequest(`/api/account/cart/items/${addedItem?.id}?locale=de`, {
      method: "PATCH", jar: customerCookies, body: { quantity: 2 },
    });
    const invalidLocaleDelete = await apiRequest(`/api/account/cart/items/${addedItem?.id}?locale=de`, {
      method: "DELETE", jar: customerCookies,
    });
    const invalidLocaleClear = await apiRequest("/api/account/cart?locale=de", {
      method: "DELETE", jar: customerCookies,
    });
    const foreignItemUpdate = await apiRequest(`/api/account/cart/items/${foreignCartItemId}?locale=en`, {
      method: "PATCH", jar: customerCookies, body: { quantity: 9 },
    });
    const foreignItemRemove = await apiRequest(`/api/account/cart/items/${foreignCartItemId}?locale=ar`, {
      method: "DELETE", jar: customerCookies,
    });
    const foreignCartAfterAttempts = await db.collection("carts").findOne({ _id: foreignCartId });
    const removeCartItem = await apiRequest(`/api/account/cart/items/${addedItem?.id}?locale=en`, {
      method: "DELETE",
      jar: customerCookies,
    });
    const clearCart = await apiRequest("/api/account/cart?locale=ar", {
      method: "DELETE",
      jar: customerCookies,
    });
    failed += result(
      "customer cart mutations use server price and enforce ownership",
      addCartItem.response.status === 200 && addedItem?.unitPriceMinor === 850_000 &&
        addedItem?.productName === "Cart test shirt" &&
        updateCartItem.response.status === 200 && updateCartItem.body?.itemCount === 3 &&
        updateCartItem.body?.items?.[0]?.productName === "قميص اختبار السلة" &&
        rejectedClientPrice.response.status === 400 && removeCartItem.response.status === 200 &&
        removeCartItem.body?.itemCount === 1 && removeCartItem.body?.items?.[0]?.productName === "Cart test shirt" &&
        removeCartItem.body?.items?.[0]?.colorName === "Test blue" && removeCartItem.body?.items?.[0]?.sizeName === "Medium" &&
        invalidLocalePost.response.status === 400 && invalidLocalePatch.response.status === 400 &&
        invalidLocaleDelete.response.status === 400 && invalidLocaleClear.response.status === 400 &&
        foreignItemUpdate.response.status === 404 && foreignItemRemove.response.status === 404 &&
        foreignCartAfterAttempts?.items?.[0]?.quantity === 1 && clearCart.response.status === 200 && clearCart.body?.itemCount === 0,
      `${addCartItem.response.status}/${updateCartItem.response.status}/${rejectedClientPrice.response.status}/${removeCartItem.response.status}/${clearCart.response.status}; invalid=${invalidLocalePost.response.status}/${invalidLocalePatch.response.status}/${invalidLocaleDelete.response.status}/${invalidLocaleClear.response.status}; foreign=${foreignItemUpdate.response.status}/${foreignItemRemove.response.status}`,
    );

    const addPaymentItem = await apiRequest("/api/account/cart/items", {
      method: "POST",
      jar: customerCookies,
      body: { variantId: String(cartVariantId), quantity: 2 },
    });
    const paymentCheckoutKey = `payment-checkout-${suffix}`;
    const paymentPlan = await apiRequest("/api/account/checkouts", { jar: customerCookies });
    const paymentCheckout = await apiRequest("/api/account/checkouts", {
      method: "POST",
      jar: customerCookies,
      body: {
        idempotencyKey: paymentCheckoutKey,
        fulfillmentPlanHash: paymentPlan.body?.fulfillmentPlanHash,
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
        createPayment.body?.amountMinor === 1_725_000 && repeatPayment.body?.id === paymentId &&
        repeatPayment.body?.idempotent === true && failedPayment.body?.payment?.status === "failed" &&
        balanceAfterFailure?.reserved === 2 && successfulPayment.body?.payment?.status === "succeeded" &&
        successfulPayment.body?.order?.status === "confirmed" && successfulPayment.body?.sms?.status === "accepted" &&
        repeatedSuccess.body?.payment?.idempotent === true && paymentDetail.body?.status === "succeeded" &&
        balanceAfterPayment?.onHand === 0 && balanceAfterPayment?.reserved === 0 &&
        convertedCart?.status === "converted" && completedCheckout?.status === "completed" &&
        storedPayment?.status === "succeeded" && createdOrder?.subtotalMinor === 1_700_000 &&
        createdOrder?.shippingMinor === 25_000 && createdOrder?.totalMinor === 1_725_000 &&
        createdOrder?.shipments?.length === 1,
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

    const composerBody = {
      idempotencyKey: `composer:${suffix}:success`,
      product: {
        name: localizedName("پیراهن آبی سازنده", "Composer blue shirt", "قميص أزرق منشئ"),
        slug: `composer-blue-shirt-${suffix}`,
        description: localizedName("توضیح تست", "Test description", "وصف اختباري"),
        categoryId: String(composerCategoryId),
        subcategoryId: String(composerSubcategoryId),
        basePriceMinor: 100_000,
        status: "draft",
        primaryImageId: null,
        primaryImageObjectFit: "cover",
        primaryImageObjectPosition: "center",
      },
      variants: [
        { colorId: String(cartColorId), sizeId: String(cartSizeId), sku: `COMPOSER-${suffix}`.toUpperCase(), barcode: `626${Date.now()}` },
        { colorId: String(composerColor2Id), sizeId: String(cartSizeId), sku: `COMPOSER-WHITE-${suffix}`.toUpperCase(), barcode: `629${Date.now()}` },
      ],
      stock: [
        { variantKey: `${cartColorId}:${cartSizeId}`, locationId: sourceLocationId, quantity: 3 },
        { variantKey: `${cartColorId}:${cartSizeId}`, locationId: destinationLocationId, quantity: 5 },
        { variantKey: `${composerColor2Id}:${cartSizeId}`, locationId: sourceLocationId, quantity: 2 },
      ],
    };
    const composerCreate = await apiRequest("/api/admin/catalog/products/complete", { method: "POST", jar: adminCookies, body: composerBody });
    const composerRetry = await apiRequest("/api/admin/catalog/products/complete", { method: "POST", jar: adminCookies, body: composerBody });
    const composerMismatch = await apiRequest("/api/admin/catalog/products/complete", { method: "POST", jar: adminCookies, body: { ...composerBody, product: { ...composerBody.product, name: localizedName("متفاوت", "Different", "مختلف") } } });
    composerProductId = composerCreate.body?.product?._id;
    composerVariantId = composerCreate.body?.variants?.[0]?._id;
    const composerVariantIds = (composerCreate.body?.variants ?? []).map((item) => new mongoose.Types.ObjectId(item._id));
    const [composerBalances, composerMovements] = composerVariantIds.length ? await Promise.all([
      db.collection("inventorybalances").find({ variantId: { $in: composerVariantIds } }).toArray(),
      db.collection("inventorymovements").find({ variantId: { $in: composerVariantIds }, referenceType: "adjustment" }).toArray(),
    ]) : [[], []];
    failed += result(
      "product composer atomically creates exact stock and is idempotent",
      composerCreate.response.status === 201 && composerCreate.body?.currency === "IRR" && composerCreate.body?.product?.basePriceMinor === 100_000 && composerCreate.body?.product?.colorIds?.length === 2 && composerCreate.body?.product?.sizeIds?.length === 1 && composerCreate.body?.totalUnits === 10 && composerBalances.length === 3 && composerBalances.reduce((sum, row) => sum + row.onHand, 0) === 10 && composerMovements.length === 3 && composerMovements.every((row) => row.reason === "موجودی اولیه هنگام ساخت محصول" && row.onHandDelta > 0) && composerRetry.response.status === 201 && composerRetry.body?.idempotent === true && composerMismatch.response.status === 409,
      `${composerCreate.response.status}/${composerRetry.response.status}/${composerMismatch.response.status}; balances=${composerBalances.length}; movements=${composerMovements.length}`,
    );

    const duplicateSlug = `composer-duplicate-${suffix}`;
    const duplicateSku = await apiRequest("/api/admin/catalog/products/complete", { method: "POST", jar: adminCookies, body: { ...composerBody, idempotencyKey: `composer:${suffix}:duplicate`, product: { ...composerBody.product, slug: duplicateSlug }, stock: [], variants: [{ ...composerBody.variants[0], barcode: `627${Date.now()}` }] } });
    const invalidSlug = `composer-invalid-location-${suffix}`;
    await db.collection("inventorylocations").updateOne({ _id: new mongoose.Types.ObjectId(destinationLocationId) }, { $set: { isActive: false } });
    const invalidLocation = await apiRequest("/api/admin/catalog/products/complete", { method: "POST", jar: adminCookies, body: { ...composerBody, idempotencyKey: `composer:${suffix}:invalid-location`, product: { ...composerBody.product, slug: invalidSlug }, variants: [{ ...composerBody.variants[0], sku: `INVALID-LOCATION-${suffix}`.toUpperCase(), barcode: `628${Date.now()}` }], stock: [{ variantKey: `${cartColorId}:${cartSizeId}`, locationId: destinationLocationId, quantity: 2 }] } });
    await db.collection("inventorylocations").updateOne({ _id: new mongoose.Types.ObjectId(destinationLocationId) }, { $set: { isActive: true } });
    const rolledBack = await db.collection("products").countDocuments({ slug: { $in: [duplicateSlug, invalidSlug] } });
    failed += result("product composer rolls back duplicate SKU and invalid location", duplicateSku.response.status === 409 && invalidLocation.response.status === 400 && rolledBack === 0, `${duplicateSku.response.status}/${invalidLocation.response.status}; products=${rolledBack}`);
    const catalogOnlyEmail = `catalog-only-${suffix}@example.test`;
    const inventoryOnlyEmail = `inventory-only-${suffix}@example.test`;
    const catalogOnlyCookies = new Map();
    const inventoryOnlyCookies = new Map();
    await apiRequest("/api/auth/signup", { method: "POST", jar: catalogOnlyCookies, body: { firstName: "کاتالوگ", lastName: "محدود", email: catalogOnlyEmail, password } });
    await apiRequest("/api/auth/signup", { method: "POST", jar: inventoryOnlyCookies, body: { firstName: "موجودی", lastName: "محدود", email: inventoryOnlyEmail, password } });
    const permissionUsers = await db.collection("users").find({ email: { $in: [catalogOnlyEmail, inventoryOnlyEmail] } }).toArray();
    composerPermissionUserIds.push(...permissionUsers.map((item) => item._id));
    await Promise.all([
      db.collection("users").updateOne({ email: catalogOnlyEmail }, { $set: { roles: ["catalog_manager"], permissions: [] } }),
      db.collection("users").updateOne({ email: inventoryOnlyEmail }, { $set: { roles: ["inventory_manager"], permissions: [] } }),
    ]);
    catalogOnlyCookies.clear(); inventoryOnlyCookies.clear();
    await apiRequest("/api/auth/login", { method: "POST", jar: catalogOnlyCookies, body: { email: catalogOnlyEmail, password } });
    await apiRequest("/api/auth/login", { method: "POST", jar: inventoryOnlyCookies, body: { email: inventoryOnlyEmail, password } });
    const catalogOnlyForbidden = await apiRequest("/api/admin/catalog/products/complete", { method: "POST", jar: catalogOnlyCookies, body: composerBody });
    const inventoryOnlyForbidden = await apiRequest("/api/admin/catalog/products/complete", { method: "POST", jar: inventoryOnlyCookies, body: composerBody });
    const composerOverLimit = await apiRequest("/api/admin/catalog/products/complete", { method: "POST", jar: adminCookies, body: { ...composerBody, idempotencyKey: `composer:${suffix}:limit`, variants: Array.from({ length: 101 }, (_, index) => ({ ...composerBody.variants[0], sku: `LIMIT-${suffix}-${index}`.toUpperCase() })), stock: [] } });
    failed += result("product composer independently requires catalog and inventory write permissions", catalogOnlyForbidden.response.status === 403 && inventoryOnlyForbidden.response.status === 403 && composerOverLimit.response.status === 400, `${catalogOnlyForbidden.response.status}/${inventoryOnlyForbidden.response.status}/${composerOverLimit.response.status}`);

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

    for (const path of ["/api/account/summary", "/api/account/orders", "/api/account/cart", "/api/account/profile", "/api/account/checkouts", "/api/account/checkouts/000000000000000000000000", "/api/account/payments/000000000000000000000000"]) {
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

    const unauthenticatedRecoveryLink = await apiRequest(
      "/api/admin/abandoned-checkouts/000000000000000000000000/recovery-link",
      { method: "POST", body: { reason: "آزمون دسترسی" } },
    );
    failed += result(
      "recovery link generation requires orders.write",
      unauthenticatedRecoveryLink.response.status === 401,
      String(unauthenticatedRecoveryLink.response.status),
    );

    recoveryAbandonedId = new mongoose.Types.ObjectId();
    recoveryUnavailableVariantId = new mongoose.Types.ObjectId();
    await db.collection("abandonedcheckouts").insertOne({
      _id: recoveryAbandonedId,
      checkoutSessionId: `recovery-source-${suffix}`,
      cartId: `recovery-old-cart-${suffix}`,
      userId: String(userId),
      email,
      storeId: String(checkoutStoreId),
      cityId: String(checkoutCityId),
      currency: "IRR",
      items: [{
        variantId: String(cartVariantId),
        productName: { fa: "پیراهن بازیابی", en: "Recovery shirt", ar: "قميص الاستعادة" },
        colorName: { fa: "آبی تست", en: "Test blue", ar: "أزرق اختباري" },
        sizeName: { fa: "متوسط", en: "Medium", ar: "متوسط" },
        quantity: 2,
        unitPriceMinor: 800_000,
      }, {
        variantId: String(recoveryUnavailableVariantId),
        productName: { fa: "کالای ناموجود", en: "Unavailable item", ar: "عنصر غير متاح" },
        colorName: { fa: "مشکی", en: "Black", ar: "أسود" },
        sizeName: { fa: "بزرگ", en: "Large", ar: "كبير" },
        quantity: 1,
        unitPriceMinor: 500_000,
      }],
      subtotalMinor: 2_100_000,
      abandonedAt: now,
      reason: "reservation_expired",
      recoveryStatus: "eligible",
      createdAt: now,
      updatedAt: now,
    });
    await db.collection("productvariants").updateOne(
      { _id: cartVariantId },
      { $set: { priceOverrideMinor: 910_000 } },
    );

    const firstLink = await apiRequest(`/api/admin/abandoned-checkouts/${recoveryAbandonedId}/recovery-link`, {
      method: "POST",
      jar: adminCookies,
      body: { reason: "آزمون ایزوله ساخت لینک بازیابی" },
    });
    const firstToken = firstLink.body?.recoveryUrl
      ? new URL(firstLink.body.recoveryUrl).searchParams.get("token")
      : null;
    const firstStoredRecovery = await db.collection("abandonedcheckouts").findOne({ _id: recoveryAbandonedId });
    const secondLink = await apiRequest(`/api/admin/abandoned-checkouts/${recoveryAbandonedId}/recovery-link`, {
      method: "POST",
      jar: adminCookies,
      body: { reason: "آزمون ایزوله نوسازی لینک بازیابی" },
    });
    const secondToken = secondLink.body?.recoveryUrl
      ? new URL(secondLink.body.recoveryUrl).searchParams.get("token")
      : null;
    await db.collection("users").updateOne({ _id: userId }, { $set: { roles: ["customer"], permissions: [] } });
    const rotatedToken = await apiRequest(`/api/account/abandoned-checkouts/recovery?token=${encodeURIComponent(firstToken || "")}`, { jar: customerCookies });
    failed += result(
      "recovery tokens are hashed, single-display, and rotation invalidates old links",
      firstLink.response.status === 201 && secondLink.response.status === 201 &&
        typeof firstToken === "string" && firstToken.length === 43 && firstToken !== secondToken &&
        typeof firstStoredRecovery?.recoveryTokenHash === "string" &&
        firstStoredRecovery.recoveryTokenHash.length === 64 &&
        firstStoredRecovery.recoveryTokenHash !== firstToken &&
        !JSON.stringify(firstStoredRecovery).includes(firstToken) && rotatedToken.response.status === 404,
      `${firstLink.response.status}/${secondLink.response.status}/${rotatedToken.response.status}`,
    );

    const foreignCookies = new Map();
    const foreignEmail = `najib-recovery-foreign-${suffix}@example.test`;
    const foreignSignup = await apiRequest("/api/auth/signup", {
      method: "POST",
      jar: foreignCookies,
      body: { firstName: "کاربر", lastName: "دیگر", email: foreignEmail, password, preferredLocale: "fa" },
    });
    foreignRecoveryUserId = (await db.collection("users").findOne({ email: foreignEmail }))?._id;
    const wrongOwner = await apiRequest(`/api/account/abandoned-checkouts/recovery?token=${encodeURIComponent(secondToken || "")}`, { jar: foreignCookies });
    failed += result(
      "recovery preview enforces exact account ownership",
      foreignSignup.response.status === 200 && wrongOwner.response.status === 403,
      `${foreignSignup.response.status}/${wrongOwner.response.status}`,
    );

    await db.collection("abandonedcheckouts").updateOne(
      { _id: recoveryAbandonedId },
      { $set: { recoveryTokenExpiresAt: new Date(Date.now() - 1_000) } },
    );
    const expiredToken = await apiRequest(`/api/account/abandoned-checkouts/recovery?token=${encodeURIComponent(secondToken || "")}`, { jar: customerCookies });
    await db.collection("users").updateOne({ _id: userId }, { $set: { roles: ["owner"], permissions: [] } });
    const finalLink = await apiRequest(`/api/admin/abandoned-checkouts/${recoveryAbandonedId}/recovery-link`, {
      method: "POST",
      jar: adminCookies,
      body: { reason: "ساخت لینک نهایی برای آزمون بازیابی" },
    });
    const finalToken = finalLink.body?.recoveryUrl
      ? new URL(finalLink.body.recoveryUrl).searchParams.get("token")
      : null;
    await db.collection("users").updateOne({ _id: userId }, { $set: { roles: ["customer"], permissions: [] } });
    const previewRecovery = await apiRequest(`/api/account/abandoned-checkouts/recovery?token=${encodeURIComponent(finalToken || "")}`, { jar: customerCookies });
    const pricedRecoveryItem = previewRecovery.body?.items?.find((item) => item.variantId === String(cartVariantId));
    const unavailableRecoveryItem = previewRecovery.body?.items?.find((item) => item.variantId === String(recoveryUnavailableVariantId));
    failed += result(
      "recovery preview rejects expiry, reprices on server, and explains unavailable items",
      expiredToken.response.status === 409 && finalLink.response.status === 201 &&
        previewRecovery.response.status === 200 && pricedRecoveryItem?.currentUnitPriceMinor === 910_000 &&
        pricedRecoveryItem?.previousUnitPriceMinor === 800_000 && pricedRecoveryItem?.priceChanged === true &&
        pricedRecoveryItem?.restorableQuantity === 2 && unavailableRecoveryItem?.restorableQuantity === 0 &&
        unavailableRecoveryItem?.skipCode === "not_sellable",
      `${expiredToken.response.status}/${finalLink.response.status}/${previewRecovery.response.status}`,
    );

    const restoreRecovery = await apiRequest("/api/account/abandoned-checkouts/recovery", {
      method: "POST",
      jar: customerCookies,
      body: { token: finalToken },
    });
    const restoredCartId = restoreRecovery.body?.recoveryCartId;
    const restoredCartBeforeRetry = restoredCartId
      ? await db.collection("carts").findOne({ _id: new mongoose.Types.ObjectId(restoredCartId) })
      : null;
    const retryRecovery = await apiRequest("/api/account/abandoned-checkouts/recovery", {
      method: "POST",
      jar: customerCookies,
      body: { token: finalToken },
    });
    const restoredCartAfterRetry = restoredCartId
      ? await db.collection("carts").findOne({ _id: new mongoose.Types.ObjectId(restoredCartId) })
      : null;
    const recoveryBeforePayment = await db.collection("abandonedcheckouts").findOne({ _id: recoveryAbandonedId });
    failed += result(
      "restore merges safely, skips unavailable items, and retries idempotently",
      restoreRecovery.response.status === 200 && restoreRecovery.body?.restored === true &&
        restoreRecovery.body?.idempotent === false && restoredCartBeforeRetry?.items?.length === 1 &&
        restoredCartBeforeRetry.items[0]?.quantity === 2 && restoredCartBeforeRetry.items[0]?.unitPriceMinor === 910_000 &&
        retryRecovery.response.status === 200 && retryRecovery.body?.idempotent === true &&
        restoredCartAfterRetry?.items?.[0]?.quantity === 2 && recoveryBeforePayment?.recoveryStatus === "eligible",
      `${restoreRecovery.response.status}/${retryRecovery.response.status}/${restoredCartAfterRetry?.items?.[0]?.quantity}`,
    );

    const recoveryPlan = await apiRequest("/api/account/checkouts", { jar: customerCookies });
    const recoveryCheckout = await apiRequest("/api/account/checkouts", {
      method: "POST",
      jar: customerCookies,
      body: { idempotencyKey: `recovery-checkout-${suffix}`, fulfillmentPlanHash: recoveryPlan.body?.fulfillmentPlanHash },
    });
    recoveryCheckoutId = recoveryCheckout.body?.id;
    const recoveryPayment = await apiRequest(`/api/account/checkouts/${recoveryCheckoutId}/payment-intents`, {
      method: "POST",
      jar: customerCookies,
      body: { idempotencyKey: `recovery-payment-${suffix}` },
    });
    recoveryPaymentId = recoveryPayment.body?.id;
    const recoveryFailedPayment = await apiRequest(`/api/account/payments/${recoveryPaymentId}/confirm`, {
      method: "POST",
      jar: customerCookies,
      body: { idempotencyKey: `recovery-failed-${suffix}`, outcome: "failed" },
    });
    const recordAfterFailedPayment = await db.collection("abandonedcheckouts").findOne({ _id: recoveryAbandonedId });
    const recoverySuccessfulPayment = await apiRequest(`/api/account/payments/${recoveryPaymentId}/confirm`, {
      method: "POST",
      jar: customerCookies,
      body: { idempotencyKey: `recovery-success-${suffix}`, outcome: "succeeded" },
    });
    const recordAfterSuccessfulPayment = await db.collection("abandonedcheckouts").findOne({ _id: recoveryAbandonedId });
    failed += result(
      "only successful order creation marks an abandoned checkout recovered",
      recoveryCheckout.response.status === 201 && recoveryPayment.response.status === 201 &&
        recoveryFailedPayment.body?.payment?.status === "failed" && recordAfterFailedPayment?.recoveryStatus === "eligible" &&
        recoverySuccessfulPayment.body?.payment?.status === "succeeded" &&
        recordAfterSuccessfulPayment?.recoveryStatus === "recovered" &&
        String(recordAfterSuccessfulPayment?.recoveredOrderId) === String(recoverySuccessfulPayment.body?.order?._id) &&
        recordAfterSuccessfulPayment?.recoveryCheckoutSessionId === recoveryCheckoutId,
      `${recoveryCheckout.response.status}/${recoveryFailedPayment.body?.payment?.status}/${recoverySuccessfulPayment.body?.payment?.status}`,
    );

    await apiRequest("/api/auth/logout", { method: "POST", jar: foreignCookies });
    await apiRequest("/api/auth/logout", { method: "POST", jar: customerCookies });
    await db.collection("users").updateOne({ _id: userId }, { $set: { roles: ["owner"], permissions: [] } });

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
    const adminCustomerLocalized = await apiRequest("/fa/customer-dashboard", { jar: adminCookies, redirect: "manual" });
    const adminCustomerLocation = adminCustomer.response.headers.get("location") || "";
    const adminCustomerLocalizedLocation = adminCustomerLocalized.response.headers.get("location") || "";
    failed += result(
      "admin is isolated from customer dashboard",
      [303, 307, 308].includes(adminCustomer.response.status) &&
        adminCustomerLocation === "/fa/customer-dashboard" &&
        [303, 307, 308].includes(adminCustomerLocalized.response.status) &&
        adminCustomerLocalizedLocation.endsWith("/admin"),
      `${adminCustomer.response.status}:${adminCustomerLocation} -> ${adminCustomerLocalized.response.status}:${adminCustomerLocalizedLocation}`,
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
        db.collection("staffsessions").deleteMany({ userId: foreignRecoveryUserId }),
        db.collection("staffaudits").deleteMany({ userId }),
        db.collection("orders").deleteMany({
          $or: [{ userId: String(userId) }, { _id: foreignOrderId }],
        }),
        db.collection("carts").deleteMany({
          $or: [
            { _id: { $in: [cartId, foreignCartId].filter(Boolean) } },
            { recoveryAbandonedCheckoutId: String(recoveryAbandonedId) },
          ],
        }),
        db.collection("abandonedcheckouts").deleteMany({ _id: recoveryAbandonedId }),
        db.collection("checkoutsessions").deleteMany({ userId: String(userId) }),
        db.collection("paymentintents").deleteMany({ userId }),
        db.collection("paymentattempts").deleteMany({ idempotencyKey: { $regex: `${suffix}$` } }),
        db.collection("productvariants").deleteMany({ _id: cartVariantId }),
        db.collection("productvariants").deleteMany({ _id: splitVariantId }),
        db.collection("productvariants").deleteMany({ productId: composerProductId ? new mongoose.Types.ObjectId(composerProductId) : null }),
        db.collection("products").deleteMany({ _id: cartProductId }),
        db.collection("products").deleteMany({ _id: splitProductId }),
        db.collection("products").deleteMany({ _id: composerProductId ? new mongoose.Types.ObjectId(composerProductId) : null }),
        db.collection("productcreaterequests").deleteMany({ key: { $regex: `^composer:${suffix}` } }),
        db.collection("categories").deleteMany({ _id: composerCategoryId }),
        db.collection("subcategories").deleteMany({ _id: composerSubcategoryId }),
        db.collection("imageassets").deleteMany({ _id: cartImageId }),
        db.collection("sizes").deleteMany({ _id: cartSizeId }),
        db.collection("sizegroups").deleteMany({ _id: cartSizeGroupId }),
        db.collection("colors").deleteMany({ _id: cartColorId }),
        db.collection("colors").deleteMany({ _id: composerColor2Id }),
        db.collection("outboxes").deleteMany({
          $or: [{ correlationId: `test-${suffix}` }, { "payload.userId": String(userId) }],
        }),
        db.collection("inventorymovements").deleteMany({ actorId: userId }),
        db.collection("inventoryreservations").deleteMany({ userId }),
        db.collection("inventorybalances").deleteMany({ variantId: cartVariantId }),
        db.collection("inventorybalances").deleteMany({ variantId: splitVariantId }),
        db.collection("inventorybalances").deleteMany({ variantId: composerVariantId ? new mongoose.Types.ObjectId(composerVariantId) : null }),
        db.collection("inventorylocations").deleteMany({ _id: { $in: [checkoutLocationId, checkoutLocationId2, mismatchedLocationId].filter(Boolean) } }),
        db.collection("inventorypools").deleteMany({ _id: checkoutPoolId }),
        db.collection("stores").deleteMany({ _id: { $in: [checkoutStoreId, splitStoreId, mismatchedStoreId].filter(Boolean) } }),
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
        db.collection("users").deleteOne({ _id: foreignRecoveryUserId }),
        db.collection("users").deleteMany({ _id: { $in: composerPermissionUserIds } }),
        db.collection("staffsessions").deleteMany({ userId: { $in: composerPermissionUserIds } }),
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
        method: check.method || "GET",
        headers: { accept: "application/json", ...(check.body === undefined ? {} : { "content-type": "application/json" }) },
        body: check.body === undefined ? undefined : JSON.stringify(check.body),
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
