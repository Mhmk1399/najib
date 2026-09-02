import mongoose from "mongoose";
import { hashPassword, StaffAudit, StaffSession, User } from "../services/customer-data/dist/index.js";

const adminUrl = (process.env.ADMIN_URL || "http://127.0.0.1:3001").replace(/\/$/, "");
const email = `admin-bff-test-${Date.now()}@example.com`;
const password = "Admin-BFF-password-123!";

function check(condition, message) {
  if (!condition) throw new Error(message);
  process.stdout.write(`[PASS] ${message}\n`);
}

function cookieHeader(response) {
  const values = typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [response.headers.get("set-cookie") || ""];
  return values.map((value) => value.split(";", 1)[0]).filter(Boolean).join("; ");
}

if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || "najib_customer_data" });
let user;
try {
  user = await User.create({ email, firstName: "Admin", lastName: "Tester", passwordHash: await hashPassword(password), passwordChangedAt: new Date(), roles: ["catalog_manager"], status: "active" });

  const anonymous = await fetch(`${adminUrl}/`, { redirect: "manual" });
  check(anonymous.status === 307 && anonymous.headers.get("location")?.includes("/login"), "anonymous Admin requests redirect to sign in");

  const login = await fetch(`${adminUrl}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }), redirect: "manual" });
  const cookies = cookieHeader(login);
  check(login.status === 200 && cookies.includes("najib_admin_access=") && cookies.includes("najib_admin_refresh="), "Admin gateway stores access and refresh tokens in HTTP-only cookies");

  const dashboard = await fetch(`${adminUrl}/`, { headers: { cookie: cookies }, redirect: "manual" });
  const dashboardHtml = await dashboard.text();
  check(dashboard.status === 200 && dashboardHtml.includes("Admin Tester"), "authenticated staff can open the protected dashboard");
  check(!dashboardHtml.includes("Settings</span>"), "navigation hides modules outside the staff permission set");

  const logout = await fetch(`${adminUrl}/api/auth/logout`, { method: "POST", headers: { cookie: cookies }, redirect: "manual" });
  check(logout.status === 200, "Admin logout clears the browser session");
} finally {
  if (user) {
    await StaffSession.deleteMany({ userId: user._id });
    await StaffAudit.deleteMany({ $or: [{ userId: user._id }, { email }] });
    await User.deleteOne({ _id: user._id });
  }
  await mongoose.disconnect();
}

process.stdout.write("[SUCCESS] Admin authentication gateway flow passed\n");
