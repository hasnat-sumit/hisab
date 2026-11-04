import "server-only";

import { MongoClient } from "mongodb";
import mongoose from "mongoose";

export class MissingConfigError extends Error {}

function mongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new MissingConfigError(
      "MONGODB_URI is not set. Add it to .env.local (see .env.example).",
    );
  }
  return uri;
}

// Serverless functions and dev hot reloads re-run this module, so connections
// are kept on globalThis to avoid opening a new pool every time.
const cache = globalThis as typeof globalThis & {
  hisabMongoose?: Promise<typeof mongoose>;
  hisabAuthClient?: { uri: string; client: MongoClient };
};

/** Connection used by the Mongoose models. */
export async function connectDB(): Promise<typeof mongoose> {
  cache.hisabMongoose ??= mongoose
    .connect(mongoUri(), { bufferCommands: false, maxPoolSize: 5 })
    .catch((error) => {
      cache.hisabMongoose = undefined;
      throw error;
    });
  return cache.hisabMongoose;
}

/** Native driver client required by the Better Auth adapter. */
export function getMongoClient(): MongoClient {
  const uri = mongoUri();
  // A client keeps its address for life, so a changed address needs a new one.
  if (cache.hisabAuthClient?.uri !== uri) {
    void cache.hisabAuthClient?.client.close().catch(() => {});
    cache.hisabAuthClient = {
      uri,
      client: new MongoClient(uri, { maxPoolSize: 5 }),
    };
  }
  return cache.hisabAuthClient.client;
}
