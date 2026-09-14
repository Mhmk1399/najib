import { connection } from "mongoose";
import { connectToDatabase } from "@/lib/server/db";
import { jsonError, jsonResponse } from "@/lib/server/response";

export const runtime = "nodejs";

export async function GET() {
  const startedAt = performance.now();

  try {
    await connectToDatabase();
    if (!connection.db) throw new Error("MongoDB connection is not ready.");
    await connection.db.admin().ping();
    return jsonResponse(
      { status: "ok", database: "ready", timestamp: new Date().toISOString() },
      { cache: "no-store", startedAt },
    );
  } catch (error) {
    return jsonError(error);
  }
}
