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
  });

  cached.__najibMongoose!.connection = await cached.__najibMongoose!.promise;
  return cached.__najibMongoose!.connection;
}
