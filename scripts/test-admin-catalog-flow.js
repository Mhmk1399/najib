import mongoose from "mongoose";
import { Category, Product, Subcategory } from "../services/commerce/dist/index.js";
import { hashPassword, StaffAudit, StaffSession, User } from "../services/customer-data/dist/index.js";

const adminUrl = (process.env.ADMIN_URL || "http://127.0.0.1:3001").replace(/\/$/, "");
const mongoUri = process.env.MONGODB_URI;
const email = `admin-catalog-test-${Date.now()}@example.com`;
const password = "Admin-catalog-test-password-123!";
const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const localized = (value) => ({ fa: value, en: value, ar: value });
const localizedList = (values = []) => ({ fa: values, en: values, ar: values });

if (!mongoUri) throw new Error("MONGODB_URI is required");

function check(condition, message) {
  if (!condition) throw new Error(message);
  process.stdout.write(`[PASS] ${message}\n`);
}

function cookieHeader(response) {
  const values = typeof response.headers.getSetCookie === "function"
    ? response.headers.getSetCookie()
    : [response.headers.get("set-cookie") || ""];
  return values.map((value) => value.split(";", 1)[0]).filter(Boolean).join("; ");
}

async function request(path, options = {}) {
  const response = await fetch(`${adminUrl}${path}`, {
    ...options,
    headers: { accept: "application/json", ...(options.body ? { "content-type": "application/json" } : {}), ...options.headers },
    redirect: "manual",
    signal: AbortSignal.timeout(8_000),
  });
  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : undefined; } catch { body = undefined; }
  return { response, status: response.status, body };
}

let user;
let category;
let otherCategory;
let subcategory;
let createdProductId;

try {
  await mongoose.connect(mongoUri, { dbName: "najib_customer_data" });
  user = await User.create({
    email,
    firstName: "Catalog",
    lastName: "Tester",
    passwordHash: await hashPassword(password),
    passwordChangedAt: new Date(),
    roles: ["catalog_manager"],
    status: "active",
  });
  await mongoose.disconnect();

  await mongoose.connect(mongoUri, { dbName: "najib_commerce" });
  const imageId = new mongoose.Types.ObjectId();
  const pageContent = {
    primaryBanner: { imageId, heading: localized("Primary edit") },
    primaryDescription: { body: localized("Primary category story.") },
    secondaryBanner: { imageId, heading: localized("Secondary edit") },
    secondaryDescription: { body: localized("Secondary category story.") },
  };
  category = await Category.create({ name: localized("Test tailoring"), slug: `test-tailoring-${suffix}`, pageContent });
  otherCategory = await Category.create({ name: localized("Test accessories"), slug: `test-accessories-${suffix}`, pageContent });
  subcategory = await Subcategory.create({ categoryId: category._id, name: localized("Test suits"), slug: `test-suits-${suffix}`, pageContent });

  const anonymous = await request("/api/catalog/products");
  check(anonymous.status === 401, "Admin catalog gateway rejects anonymous reads");

  const login = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const cookies = cookieHeader(login.response);
  check(login.status === 200 && cookies.includes("najib_admin_access="), "catalog manager signs in through the Admin gateway");

  const initialList = await request("/api/catalog/products?limit=5", { headers: { cookie: cookies } });
  check(initialList.status === 200 && Array.isArray(initialList.body?.items), "authorized staff can list real products");

  const create = await request("/api/catalog/products", {
    method: "POST",
    headers: { cookie: cookies },
    body: JSON.stringify({
      name: localized("Gateway Test Suit"),
      slug: `gateway-test-suit-${suffix}`,
      description: localized("Temporary product created by the isolated Admin catalog flow."),
      categoryId: String(category._id),
      subcategoryId: String(subcategory._id),
      collectionIds: [],
      basePriceMinor: 245000,
      currency: "EUR",
      status: "draft",
      material: localizedList(["wool"]),
      seasons: localizedList(["autumn"]),
      occasions: localizedList(["formal"]),
      styleTags: localizedList(["tailored"]),
      imageIds: [],
    }),
  });
  createdProductId = create.body?._id;
  check(create.status === 201 && createdProductId, "Admin gateway creates a validated draft product");

  const search = await request(`/api/catalog/products?search=${encodeURIComponent(`gateway-test-suit-${suffix}`)}`, { headers: { cookie: cookies } });
  check(search.status === 200 && search.body?.pagination?.total === 1, "product search returns the newly created real record");

  const update = await request(`/api/catalog/products/${createdProductId}`, {
    method: "PATCH",
    headers: { cookie: cookies },
    body: JSON.stringify({ status: "active", basePriceMinor: 250000 }),
  });
  check(update.status === 200 && update.body?.status === "active" && update.body?.basePriceMinor === 250000, "Admin gateway updates product status and integer price");

  const clearStoryField = await request(`/api/catalog/products/${createdProductId}`, {
    method: "PATCH",
    headers: { cookie: cookies },
    body: JSON.stringify({ fit: null }),
  });
  check(clearStoryField.status === 200 && clearStoryField.body?.fit === null, "optional product-story fields can be cleared explicitly");

  const invalidRelation = await request(`/api/catalog/products/${createdProductId}`, {
    method: "PATCH",
    headers: { cookie: cookies },
    body: JSON.stringify({ categoryId: String(otherCategory._id) }),
  });
  check(invalidRelation.status === 400, "Commerce rejects a subcategory that does not belong to the selected category");

  const invalidFilter = await request("/api/catalog/products?internalUrl=http://example.com", { headers: { cookie: cookies } });
  check(invalidFilter.status === 400, "Admin gateway rejects unsupported query parameters");
} finally {
  if (mongoose.connection.readyState) {
    if (createdProductId) await Product.deleteOne({ _id: createdProductId });
    if (subcategory) await Subcategory.deleteOne({ _id: subcategory._id });
    if (category) await Category.deleteOne({ _id: category._id });
    if (otherCategory) await Category.deleteOne({ _id: otherCategory._id });
    await mongoose.disconnect();
  }

  await mongoose.connect(mongoUri, { dbName: "najib_customer_data" });
  if (user) {
    await StaffSession.deleteMany({ userId: user._id });
    await StaffAudit.deleteMany({ $or: [{ userId: user._id }, { email }] });
    await User.deleteOne({ _id: user._id });
  }
  await mongoose.disconnect();
}

process.stdout.write("[SUCCESS] Admin catalog flow passed and temporary records were removed\n");
