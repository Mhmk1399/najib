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

    const customerMe = await apiRequest("/api/auth/me", { jar: customerCookies });
    failed += result(
      "customer account profile",
      customerMe.response.status === 200 && customerMe.body?.account?.email === email && customerMe.body?.destination === "/customer-dashboard" && !customerMe.body?.accessToken,
      String(customerMe.response.status),
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
        db.collection("users").deleteOne({ _id: userId }),
      ]).catch(() => undefined);
    }
    if (mongoose?.connection.readyState !== 0) await mongoose.disconnect();
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
        signal: AbortSignal.timeout(5_000),
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
