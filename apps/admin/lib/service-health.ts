import "server-only";

export type ServiceHealth = {
  name: string;
  status: "Operational" | "Unavailable";
  latency?: number;
};

const services = [
  ["Commerce", "COMMERCE_API_URL", "http://127.0.0.1:4001/api/v1"],
  ["Inventory", "INVENTORY_API_URL", "http://127.0.0.1:4002/api/v1"],
  ["Payments", "PAYMENT_API_URL", "http://127.0.0.1:4003/api/v1"],
  ["Customer Data", "CUSTOMER_DATA_API_URL", "http://127.0.0.1:4004/api/v1"],
] as const;

async function inspectService(name: string, envName: string, fallback: string): Promise<ServiceHealth> {
  const baseUrl = process.env[envName] ?? fallback;
  const startedAt = Date.now();
  try {
    const response = await fetch(`${baseUrl}/health/live`, {
      cache: "no-store",
      signal: AbortSignal.timeout(900),
    });
    if (!response.ok) throw new Error("Health check failed");
    return { name, status: "Operational", latency: Date.now() - startedAt };
  } catch {
    return { name, status: "Unavailable" };
  }
}

export async function getServiceHealth(): Promise<ServiceHealth[]> {
  return Promise.all(services.map(([name, envName, fallback]) => inspectService(name, envName, fallback)));
}
