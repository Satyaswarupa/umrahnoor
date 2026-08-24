import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  migrated: boolean;
};

declare global {
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongooseCache ?? { conn: null, promise: null, migrated: false };
global._mongooseCache = cache;

// One-time cleanup: `users.email` used to be `required + unique`, enforced
// by a non-sparse unique index. Mobile-based (OTP) accounts leave `email`
// unset, and a non-sparse unique index treats every missing value as the
// same `null` — so the *second* mobile-only signup would fail with a
// duplicate-key error on an index the schema no longer declares. Uniqueness
// for the (now optional) email field is enforced at the query level instead
// (see app/api/auth/signup), so the old index just needs to go.
// Returns true once it's actually confirmed the index is gone (or was never
// there) — callers should only remember "migration done" on that signal, not
// just on having attempted it, or a transient failure here would silently
// disable retries for the rest of the process's lifetime.
async function dropLegacyEmailUniqueIndex(connection: typeof mongoose): Promise<boolean> {
  try {
    const collection = connection.connection.collection("users");
    const indexes = await collection.indexes();
    const emailIndex = indexes.find((index) => index.key?.email === 1);
    if (emailIndex && emailIndex.unique && !emailIndex.sparse) {
      await collection.dropIndex(emailIndex.name!);
      console.log(`Dropped legacy non-sparse unique index "${emailIndex.name}" on users.email`);
    }
    return true;
  } catch (error) {
    // Missing collection/index on a fresh database is fine (still resolves
    // true above); any other failure here shouldn't block the app from
    // starting, but must be retried on the next connectToDatabase() call.
    console.error("dropLegacyEmailUniqueIndex failed", error);
    return false;
  }
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn) {
    // The migration below only needs to run once per process, but a
    // long-lived dev server can already have a cached connection from
    // before this check existed — so it's guarded independently of the
    // early-return above, not nested inside the "just connected" path.
    if (!cache.migrated) {
      cache.migrated = await dropLegacyEmailUniqueIndex(cache.conn);
    }
    return cache.conn;
  }

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }

  if (!cache.migrated) {
    cache.migrated = await dropLegacyEmailUniqueIndex(cache.conn);
  }

  return cache.conn;
}
