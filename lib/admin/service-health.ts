import "server-only";
import { connectToDatabase } from "@/lib/server/db";

export type ServiceHealth = {
  name: string;
  status: "Operational" | "Unavailable";
  latency?: number;
};

async function inspectLocal(name: string, check: () => Promise<unknown>): Promise<ServiceHealth> {
  const startedAt = Date.now();
  try {
    await check();
    return { name, status: "Operational", latency: Date.now() - startedAt };
  } catch {
    return { name, status: "Unavailable" };
  }
}

export async function getServiceHealth(): Promise<ServiceHealth[]> {
  const database = await inspectLocal("Database", connectToDatabase);
  return [
    { name: "Next API", status: "Operational", latency: 0 },
    database,
    { name: "Catalog", status: database.status, latency: database.latency },
    { name: "Admin Auth", status: database.status, latency: database.latency },
  ];
}
