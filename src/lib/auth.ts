import "server-only";

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import type { Db } from "mongodb";

import { getMongoClient, MissingConfigError } from "./db";

function vercelUrl(host: string | undefined): string | undefined {
  return host ? `https://${host}` : undefined;
}

function createAuth() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new MissingConfigError(
      "BETTER_AUTH_SECRET is not set. Add it to .env.local (see .env.example).",
    );
  }

  const client = getMongoClient();
  const db = client.db();
  void ensureAuthIndexes(db);

  return betterAuth({
    secret,
    baseURL:
      process.env.BETTER_AUTH_URL ??
      vercelUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL),
    trustedOrigins: [vercelUrl(process.env.VERCEL_URL)].filter(
      (origin): origin is string => Boolean(origin),
    ),
    database: mongodbAdapter(db, { client }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
    },
    rateLimit: {
      enabled: true,
      // Serverless instances share nothing in memory, so limits live in the DB.
      storage: "database",
    },
  });
}

// The adapter does not create indexes, and email uniqueness must not depend on
// a check-then-insert. createIndex does nothing when the index already exists.
async function ensureAuthIndexes(db: Db): Promise<void> {
  try {
    await Promise.all([
      db.collection("user").createIndex({ email: 1 }, { unique: true }),
      db.collection("session").createIndex({ token: 1 }, { unique: true }),
      db.collection("session").createIndex({ userId: 1 }),
      db.collection("account").createIndex({ userId: 1 }),
      db.collection("verification").createIndex({ identifier: 1 }),
      db.collection("rateLimit").createIndex({ key: 1 }),
    ]);
  } catch (error) {
    console.error("Could not create auth indexes:", error);
  }
}

let auth:
  | { settings: string; instance: ReturnType<typeof createAuth> }
  | undefined;

// Created on first use, so builds work before the environment is configured.
// Rebuilt if the settings change, so editing .env.local takes effect at once.
export function getAuth() {
  const settings = JSON.stringify([
    process.env.MONGODB_URI,
    process.env.BETTER_AUTH_SECRET,
    process.env.BETTER_AUTH_URL,
  ]);
  if (auth?.settings !== settings) {
    auth = { settings, instance: createAuth() };
  }
  return auth.instance;
}
