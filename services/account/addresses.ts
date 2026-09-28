import "server-only";

import mongoose from "mongoose";
import { z } from "zod";
import { connectToDatabase } from "@/lib/server/db";
import { conflict, notFound } from "@/lib/server/errors";
import { User } from "@/models/auth/user";

const text = (max: number) => z.string().trim().min(1).max(max);
export const addressInputSchema = z.object({
  label: z.string().trim().max(80).default(""), firstName: text(100), lastName: text(100),
  phone: z.string().trim().max(30).regex(/^[+\d\s()-]*$/).default(""),
  line1: text(300), line2: z.string().trim().max(300).default(""),
  city: text(120), region: z.string().trim().max(120).default(""),
  postalCode: text(30),
  // Iran is the only supported address country. Keep accepting this key from
  // older clients, but never validate or trust its value.
  countryCode: z.unknown().optional(),
  isDefault: z.boolean().optional(),
}).strict().transform((address) => ({
  ...address,
  countryCode: "IR" as const,
}));

function normalize(addresses: Array<Record<string, unknown>>) {
  if (!addresses.length) return addresses;
  const selectedIndex = Math.max(0, addresses.findIndex((address) => Boolean(address.isDefault)));
  return addresses.map((address, index) => ({ ...address, isDefault: index === selectedIndex }));
}

function safe(address: Record<string, unknown>) {
  return { ...address, id: String(address._id), _id: undefined };
}

async function activeUser(accountId: string) {
  const user = await User.findOne({ _id: accountId, roles: "customer", status: "active" });
  if (!user) notFound("حساب کاربری پیدا نشد.");
  return user;
}

async function saveWithConcurrency(user: InstanceType<typeof User>) {
  try { await user.save(); }
  catch (error) {
    if ((error as Error).name === "VersionError") conflict("نشانی‌ها هم‌زمان در دستگاه دیگری تغییر کردند؛ دوباره تلاش کنید.");
    throw error;
  }
}

export async function listAddresses(accountId: string) {
  await connectToDatabase();
  const user = await activeUser(accountId);
  return { items: normalize(user.addresses.map((a: { toObject(): Record<string, unknown> }) => a.toObject())).map(safe) };
}

export async function createAddress(accountId: string, value: unknown) {
  const input = addressInputSchema.parse(value);
  await connectToDatabase();
  const user = await activeUser(accountId);
  if (user.addresses.length >= 10) conflict("حداکثر ۱۰ نشانی قابل ذخیره است.");
  const current = normalize(user.addresses.map((a: { toObject(): Record<string, unknown> }) => a.toObject()));
  if (input.isDefault || current.length === 0) current.forEach((a) => { a.isDefault = false; });
  user.addresses = [...current, { ...input, isDefault: input.isDefault || current.length === 0 }];
  await saveWithConcurrency(user);
  return { items: user.addresses.map((a: { toObject(): Record<string, unknown> }) => safe(a.toObject())) };
}

export async function updateAddress(accountId: string, addressId: string, value: unknown) {
  if (!mongoose.Types.ObjectId.isValid(addressId)) notFound("نشانی پیدا نشد.");
  const input = addressInputSchema.parse(value);
  await connectToDatabase();
  const user = await activeUser(accountId);
  const addresses = normalize(user.addresses.map((a: { toObject(): Record<string, unknown> }) => a.toObject()));
  const index = addresses.findIndex((a) => String(a._id) === addressId);
  if (index < 0) notFound("نشانی پیدا نشد.");
  if (input.isDefault) addresses.forEach((a) => { a.isDefault = false; });
  addresses[index] = { ...addresses[index], ...input };
  user.addresses = normalize(addresses);
  await saveWithConcurrency(user);
  return { items: user.addresses.map((a: { toObject(): Record<string, unknown> }) => safe(a.toObject())) };
}

export async function deleteAddress(accountId: string, addressId: string) {
  if (!mongoose.Types.ObjectId.isValid(addressId)) notFound("نشانی پیدا نشد.");
  await connectToDatabase();
  const user = await activeUser(accountId);
  const addresses: Array<Record<string, unknown>> = user.addresses.map((a: { toObject(): Record<string, unknown> }) => a.toObject());
  if (!addresses.some((a) => String(a._id) === addressId)) notFound("نشانی پیدا نشد.");
  user.addresses = normalize(addresses.filter((a) => String(a._id) !== addressId));
  await saveWithConcurrency(user);
  return { items: user.addresses.map((a: { toObject(): Record<string, unknown> }) => safe(a.toObject())) };
}

export async function makeDefaultAddress(accountId: string, addressId: string) {
  if (!mongoose.Types.ObjectId.isValid(addressId)) notFound("نشانی پیدا نشد.");
  await connectToDatabase();
  const user = await activeUser(accountId);
  const addresses: Array<Record<string, unknown>> = user.addresses.map((a: { toObject(): Record<string, unknown> }) => a.toObject());
  if (!addresses.some((a) => String(a._id) === addressId)) notFound("نشانی پیدا نشد.");
  user.addresses = addresses.map((a) => ({ ...a, isDefault: String(a._id) === addressId }));
  await saveWithConcurrency(user);
  return { items: user.addresses.map((a: { toObject(): Record<string, unknown> }) => safe(a.toObject())) };
}
