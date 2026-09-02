import mongoose from "mongoose";
import { staffRoleSchema, type StaffRole } from "@najib/contracts";
import { hashPassword } from "../auth/password.js";
import { StaffAudit } from "../models/staff-audit.js";
import { StaffSession } from "../models/staff-session.js";
import { User } from "../models/user.js";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

const email = required("STAFF_EMAIL").toLowerCase();
const password = required("STAFF_PASSWORD");
if (password.length < 12 || password.length > 128) throw new Error("STAFF_PASSWORD must contain 12 to 128 characters");
const roles: StaffRole[] = (process.env.STAFF_ROLES || "owner").split(",").map((value) => staffRoleSchema.parse(value.trim()));
const mongoUri = required("MONGODB_URI");
const databaseName = process.env.MONGODB_DB_NAME || "najib_customer_data";

await mongoose.connect(mongoUri, { dbName: databaseName });
try {
  const passwordHash = await hashPassword(password);
  const user = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        email,
        firstName: process.env.STAFF_FIRST_NAME?.trim() || "Najib",
        lastName: process.env.STAFF_LAST_NAME?.trim() || "Administrator",
        passwordHash,
        passwordChangedAt: new Date(),
        roles,
        status: "active",
        failedLoginAttempts: 0,
      },
      $unset: { lockedUntil: 1 },
    },
    { upsert: true, new: true, runValidators: true },
  );
  await StaffSession.updateMany({ userId: user._id, revokedAt: { $exists: false } }, { $set: { revokedAt: new Date() } });
  await StaffAudit.create({ userId: user._id, email, action: "staff_bootstrap", outcome: "success" });
  process.stdout.write(`Staff account ready: ${email} (${roles.join(", ")})\n`);
} finally {
  await mongoose.disconnect();
}
