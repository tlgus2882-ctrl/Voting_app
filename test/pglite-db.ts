import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import type { Db } from "@/lib/db";

const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");

/** A fresh in-memory Postgres with the app schema applied. */
export async function createTestDb(): Promise<Db> {
  const pg = new PGlite();
  await pg.exec(schema);
  return {
    async query<T>(text: string, params?: unknown[]) {
      const { rows } = await pg.query<T>(text, params);
      return rows;
    },
  };
}
