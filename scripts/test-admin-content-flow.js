import mongoose from "mongoose";
import { Category, ImageAsset, Product, Subcategory } from "../services/commerce/dist/index.js";
import { hashPassword, StaffAudit, StaffSession, User } from "../services/customer-data/dist/index.js";

const adminUrl = (process.env.ADMIN_URL || "http://127.0.0.1:3001").replace(/\/$/, "");
const mongoUri = process.env.MONGODB_URI;
const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const email = `admin-content-test-${suffix}@example.com`;
const password = "Admin-content-test-password-123!";

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
    headers: {
      accept: "application/json",
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...options.headers,
    },
    redirect: "manual",
    signal: AbortSignal.timeout(8_000),
  });
  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : undefined; } catch { body = undefined; }
  return { response, status: response.status, body };
}

let user;
const createdIds = { images: [], categories: [], subcategories: [], products: [] };

try {
  await mongoose.connect(mongoUri, { dbName: "najib_customer_data" });
  user = await User.create({
    email,
    firstName: "Content",
    lastName: "Tester",
    passwordHash: await hashPassword(password),
    passwordChangedAt: new Date(),
    roles: ["catalog_manager"],
    status: "active",
  });
  await mongoose.disconnect();

  const login = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const cookies = cookieHeader(login.response);
  check(login.status === 200 && cookies.includes("najib_admin_access="), "catalog manager signs in for content management");

  const firstImage = await request("/api/catalog/images", {
    method: "POST",
    headers: { cookie: cookies },
    body: JSON.stringify({
      url: `/review-assets/primary-${suffix}.jpg`,
      alt: `Primary tailoring campaign ${suffix}`,
      kind: "category_banner",
      focalPointX: 48,
      focalPointY: 42,
      linkedProducts: [],
      isActive: true,
    }),
  });
  check(firstImage.status === 201 && firstImage.body?._id, "image library creates a safe category banner record");
  createdIds.images.push(firstImage.body._id);

  const secondImage = await request("/api/catalog/images", {
    method: "POST",
    headers: { cookie: cookies },
    body: JSON.stringify({
      url: `https://images.example.com/secondary-${suffix}.jpg`,
      alt: `Secondary evening campaign ${suffix}`,
      kind: "editorial",
      width: 1600,
      height: 2000,
      focalPointX: 50,
      focalPointY: 35,
      linkedProducts: [],
      isActive: true,
    }),
  });
  check(secondImage.status === 201 && secondImage.body?._id, "image library accepts HTTP(S) editorial metadata");
  createdIds.images.push(secondImage.body._id);

  const unsafeImage = await request("/api/catalog/images", {
    method: "POST",
    headers: { cookie: cookies },
    body: JSON.stringify({ url: "javascript:alert(1)", alt: "Unsafe", kind: "editorial" }),
  });
  check(unsafeImage.status === 400, "unsafe image URL schemes are rejected");

  const pageContent = {
    primaryBanner: { imageId: firstImage.body._id, eyebrow: "Atelier study", heading: "Tailoring, composed", body: "A precise study in proportion." },
    primaryDescription: { heading: "The line", body: "Built around an assured, architectural line." },
    secondaryBanner: { imageId: secondImage.body._id, heading: "After-dark form", ctaLabel: "Explore the edit", ctaHref: "/collections/evening" },
    secondaryDescription: { heading: "The finish", body: "Quiet details reward a closer view." },
    seoTitle: "Tailoring | Najibzadeh",
    seoDescription: "Discover tailored Najibzadeh pieces and campaign stories.",
  };
  const category = await request("/api/catalog/categories", {
    method: "POST",
    headers: { cookie: cookies },
    body: JSON.stringify({ name: "Test tailoring", slug: `content-tailoring-${suffix}`, description: "Test category", pageContent, isActive: true, sortOrder: 1 }),
  });
  check(category.status === 201 && category.body?._id, "page composer creates a category with two real banners and descriptions");
  createdIds.categories.push(category.body._id);

  const missingParent = await request("/api/catalog/subcategories", {
    method: "POST",
    headers: { cookie: cookies },
    body: JSON.stringify({ categoryId: new mongoose.Types.ObjectId().toString(), name: "Invalid child", slug: `invalid-child-${suffix}`, pageContent, isActive: true, sortOrder: 0 }),
  });
  check(missingParent.status === 400, "subcategory creation rejects a missing parent category");

  const subcategory = await request("/api/catalog/subcategories", {
    method: "POST",
    headers: { cookie: cookies },
    body: JSON.stringify({ categoryId: category.body._id, name: "Test suits", slug: `content-suits-${suffix}`, pageContent: { ...pageContent, primaryBanner: { ...pageContent.primaryBanner, imageId: secondImage.body._id } }, isActive: true, sortOrder: 1 }),
  });
  check(subcategory.status === 201 && subcategory.body?._id, "page composer creates a subcategory under a real parent");
  createdIds.subcategories.push(subcategory.body._id);

  const product = await request("/api/catalog/products", {
    method: "POST",
    headers: { cookie: cookies },
    body: JSON.stringify({
      name: "Content Flow Suit",
      slug: `content-flow-suit-${suffix}`,
      description: "Temporary product for shoppable-image validation.",
      categoryId: category.body._id,
      subcategoryId: subcategory.body._id,
      collectionIds: [],
      basePriceMinor: 175000,
      currency: "EUR",
      status: "draft",
      material: ["wool"],
      seasons: [],
      occasions: [],
      styleTags: [],
      imageIds: [],
    }),
  });
  check(product.status === 201 && product.body?._id, "real product is available for hotspot linking");
  createdIds.products.push(product.body._id);

  const shoppable = await request(`/api/catalog/images/${secondImage.body._id}`, {
    method: "PATCH",
    headers: { cookie: cookies },
    body: JSON.stringify({
      linkedProducts: [{ productId: product.body._id, label: "Shop the suit", hotspotX: 37.5, hotspotY: 44, sortOrder: 0 }],
    }),
  });
  check(shoppable.status === 200 && shoppable.body?.linkedProducts?.length === 1, "image story saves a real product hotspot");

  const invalidLink = await request(`/api/catalog/images/${secondImage.body._id}`, {
    method: "PATCH",
    headers: { cookie: cookies },
    body: JSON.stringify({ linkedProducts: [{ productId: new mongoose.Types.ObjectId().toString(), hotspotX: 10, hotspotY: 20 }] }),
  });
  check(invalidLink.status === 400, "shoppable image rejects a missing linked product");

  const productImages = await request(`/api/catalog/images?productId=${product.body._id}`, { headers: { cookie: cookies } });
  check(productImages.status === 200 && productImages.body?.items?.some((item) => item._id === secondImage.body._id), "linked-product image filter uses the nested hotspot relationship");

  const imageSearch = await request(`/api/catalog/images?search=${encodeURIComponent(`evening campaign ${suffix}`)}`, { headers: { cookie: cookies } });
  check(imageSearch.status === 200 && imageSearch.body?.pagination?.total === 1, "image library searches real alt text");

  const categoryUpdate = await request(`/api/catalog/categories/${category.body._id}`, {
    method: "PATCH",
    headers: { cookie: cookies },
    body: JSON.stringify({ pageContent: { ...pageContent, seoTitle: "Updated tailoring | Najibzadeh" } }),
  });
  check(categoryUpdate.status === 200 && categoryUpdate.body?.pageContent?.seoTitle.startsWith("Updated"), "page composer updates the complete nested page story safely");
} finally {
  if (mongoose.connection.readyState) await mongoose.disconnect();
  await mongoose.connect(mongoUri, { dbName: "najib_commerce" });
  if (createdIds.products.length) await Product.deleteMany({ _id: { $in: createdIds.products } });
  if (createdIds.subcategories.length) await Subcategory.deleteMany({ _id: { $in: createdIds.subcategories } });
  if (createdIds.categories.length) await Category.deleteMany({ _id: { $in: createdIds.categories } });
  if (createdIds.images.length) await ImageAsset.deleteMany({ _id: { $in: createdIds.images } });
  await mongoose.disconnect();

  await mongoose.connect(mongoUri, { dbName: "najib_customer_data" });
  if (user) {
    await StaffSession.deleteMany({ userId: user._id });
    await StaffAudit.deleteMany({ $or: [{ userId: user._id }, { email }] });
    await User.deleteOne({ _id: user._id });
  }
  await mongoose.disconnect();
}

process.stdout.write("[SUCCESS] Admin page-content and shoppable-image flow passed; temporary records removed\n");
