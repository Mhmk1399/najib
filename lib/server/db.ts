import "server-only";
import mongoose from "mongoose";

type CachedConnection = {
  promise?: Promise<typeof mongoose>;
  connection?: typeof mongoose;
};

const cached = globalThis as typeof globalThis & { __najibMongoose?: CachedConnection };
cached.__najibMongoose ??= {};

export async function connectToDatabase() {
  if (cached.__najibMongoose?.connection) return cached.__najibMongoose.connection;

  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new Error("MONGODB_URI is not configured.");

  const dbName = process.env.MONGODB_DB_NAME?.trim() || "najib";
  cached.__najibMongoose!.promise ??= mongoose.connect(uri, {
    dbName,
    bufferCommands: false,
    maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 10),
    minPoolSize: Number(process.env.MONGODB_MIN_POOL_SIZE || 0),
    maxIdleTimeMS: 60_000,
    serverSelectionTimeoutMS: 5_000,
    socketTimeoutMS: 15_000,
  });

  try {
    cached.__najibMongoose!.connection = await cached.__najibMongoose!.promise;
    return cached.__najibMongoose!.connection;
  } catch (error) {
    // Allow a later request to retry after a temporary database outage.
    cached.__najibMongoose!.promise = undefined;
    throw error;
  }
}
