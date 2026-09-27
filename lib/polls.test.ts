import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/lib/db";
import { listPolls } from "@/lib/polls";
import { createTestDb } from "@/test/pglite-db";

const voter = { voterId: "voter-a", isOperator: false };

let db: Db;
beforeEach(async () => {
  db = await createTestDb();
});

describe("listPolls", () => {
  it("returns no Polls when none have been posted", async () => {
    expect(await listPolls(db, voter)).toEqual([]);
  });
});
