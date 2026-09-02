import mongoose from "mongoose";
import { hashPassword, StaffAudit, StaffSession, User } from "../services/customer-data/dist/index.js";

const customerDataUrl = (process.env.CUSTOMER_DATA_API_URL || "http://127.0.0.1:4004/api/v1").replace(/\/$/, "");
const commerceUrl = (process.env.COMMERCE_API_URL || "http://127.0.0.1:4001/api/v1").replace(/\/$/, "");
const email = `auth-test-${Date.now()}@example.com`;
const password = "Auth-test-password-123!";

function check(condition, message) {
  if (!condition) throw new Error(message);
  process.stdout.write(`[PASS] ${message}\n`);
}

async function request(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { accept: "application/json", "content-type": "application/json", ...options.headers }, signal: AbortSignal.timeout(7_000) });
  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : undefined; } catch { body = undefined; }
  return { status: response.status, body };
}

if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || "najib_customer_data" });
let user;
try {
  user = await User.create({ email, firstName: "Auth", lastName: "Tester", passwordHash: await hashPassword(password), passwordChangedAt: new Date(), roles: ["owner"], status: "active" });

  const badLogin = await request(`${customerDataUrl}/auth/staff/login`, { method: "POST", body: JSON.stringify({ email, password: "Wrong-password-123!" }) });
  check(badLogin.status === 401, "invalid credentials are rejected");

  const login = await request(`${customerDataUrl}/auth/staff/login`, { method: "POST", body: JSON.stringify({ email, password }) });
  check(login.status === 201 && login.body?.staff?.email === email, "active staff can sign in");
  const firstAccess = login.body.accessToken;
  const firstRefresh = login.body.refreshToken;

  const profile = await request(`${customerDataUrl}/auth/staff/me`, { headers: { authorization: `Bearer ${firstAccess}` } });
  check(profile.status === 200 && profile.body?.permissions?.includes("admin.access"), "protected staff profile validates the database session");

  const refresh = await request(`${customerDataUrl}/auth/staff/refresh`, { method: "POST", body: JSON.stringify({ refreshToken: firstRefresh }) });
  check(refresh.status === 201 && refresh.body?.refreshToken !== firstRefresh, "refresh tokens rotate after use");

  const reused = await request(`${customerDataUrl}/auth/staff/refresh`, { method: "POST", body: JSON.stringify({ refreshToken: firstRefresh }) });
  check(reused.status === 401, "a rotated refresh token cannot be reused");

  const revokedFamily = await request(`${customerDataUrl}/auth/staff/refresh`, { method: "POST", body: JSON.stringify({ refreshToken: refresh.body.refreshToken }) });
  check(revokedFamily.status === 401, "refresh-token replay revokes the active token family");

  const unauthenticatedWrite = await request(`${commerceUrl}/catalog/products`, { method: "POST", body: "{}" });
  check(unauthenticatedWrite.status === 401, "catalog writes reject unauthenticated requests");

  const authorizedWrite = await request(`${commerceUrl}/catalog/products`, { method: "POST", headers: { authorization: `Bearer ${refresh.body.accessToken}` }, body: "{}" });
  check(authorizedWrite.status === 400, "catalog managers pass authorization before payload validation");

  const secondLogin = await request(`${customerDataUrl}/auth/staff/login`, { method: "POST", body: JSON.stringify({ email, password }) });
  check(secondLogin.status === 201, "staff can establish a new session after replay revocation");

  const logout = await request(`${customerDataUrl}/auth/staff/logout`, { method: "POST", body: JSON.stringify({ refreshToken: secondLogin.body.refreshToken }) });
  check(logout.status === 201, "logout revokes the active refresh session");

  const afterLogout = await request(`${customerDataUrl}/auth/staff/me`, { headers: { authorization: `Bearer ${secondLogin.body.accessToken}` } });
  check(afterLogout.status === 401, "revoked sessions cannot access the staff profile");
} finally {
  if (user) {
    await StaffSession.deleteMany({ userId: user._id });
    await StaffAudit.deleteMany({ $or: [{ userId: user._id }, { email }] });
    await User.deleteOne({ _id: user._id });
  }
  await mongoose.disconnect();
}

process.stdout.write("[SUCCESS] Staff authentication flow passed\n");
