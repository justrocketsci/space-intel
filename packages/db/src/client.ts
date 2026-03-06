import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

// Lazy-initialize the database connection so the app can start
// without DATABASE_URL (UI pages use mock data and don't need the DB).
let _connection: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function getConnection() {
  if (!_connection) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL environment variable is required. " +
          "Run `docker compose up -d` and copy .env.example to .env.local.",
      );
    }
    _connection = postgres(url, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return _connection;
}

function getDb() {
  if (!_db) {
    _db = drizzle(getConnection(), { schema });
  }
  return _db;
}

// Export as getters so the connection is only created when first accessed
export const connection = new Proxy({} as ReturnType<typeof postgres>, {
  get(_, prop) {
    return Reflect.get(getConnection(), prop);
  },
});

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    return Reflect.get(getDb(), prop);
  },
});
