import { MongoClient, type Db } from "mongodb";

/**
 * Cached MongoDB connection.
 *
 * Next.js reloads modules in dev (and spawns several workers in prod), so the
 * client is cached on `globalThis` — one connection pool per process, not one
 * per request.
 */

const uri = process.env.MONGODB_URI;

declare global {
  var __schoolOfMasteryMongo: Promise<MongoClient> | undefined;
  var __schoolOfMasteryIndexes: Promise<void> | undefined;
}

export function getClient(): Promise<MongoClient> {
  if (!uri) {
    throw new Error("MONGODB_URI is not set — copy .env.example to .env.local and fill it in.");
  }
  if (!global.__schoolOfMasteryMongo) {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    const connecting = client.connect();
    // A failed connection must not be cached, or every later request reuses the
    // same rejected promise and the form can never recover without a restart.
    connecting.catch(() => {
      global.__schoolOfMasteryMongo = undefined;
    });
    global.__schoolOfMasteryMongo = connecting;
  }
  return global.__schoolOfMasteryMongo;
}

/** The database named in MONGODB_URI, with the collection indexes ensured once. */
export async function getDb(): Promise<Db> {
  const client = await getClient();
  const db = client.db();
  await ensureIndexes(db);
  return db;
}

export const ENROLLMENTS_COLLECTION = "enrollments";

async function ensureIndexes(db: Db): Promise<void> {
  if (!global.__schoolOfMasteryIndexes) {
    global.__schoolOfMasteryIndexes = db
      .collection(ENROLLMENTS_COLLECTION)
      .createIndex({ transactionId: 1 }, { unique: true, name: "transactionId_unique" })
      .then(() => undefined)
      .catch((error) => {
        global.__schoolOfMasteryIndexes = undefined;
        throw error;
      });
  }
  return global.__schoolOfMasteryIndexes;
}
