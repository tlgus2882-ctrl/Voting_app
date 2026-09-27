import { neon } from "@neondatabase/serverless";
import type { Db } from "@/lib/db";

let db: Db | undefined;

/** The production database, backed by Neon over HTTP. */
export function getDb(): Db {
  if (!db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    const sql = neon(url);
    db = {
      query: <T,>(text: string, params?: unknown[]) =>
        sql.query(text, params) as Promise<T[]>,
    };
  }
  return db;
}
