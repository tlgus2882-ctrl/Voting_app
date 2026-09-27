import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/lib/db";
import { createPoll, listPolls } from "@/lib/polls";
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

  it("lists Polls newest first", async () => {
    await createPoll(db, "첫 번째", ["a", "b"]);
    await createPoll(db, "두 번째", ["a", "b"]);
    await createPoll(db, "세 번째", ["a", "b"]);

    const questions = (await listPolls(db, voter)).map((p) => p.question);
    expect(questions).toEqual(["세 번째", "두 번째", "첫 번째"]);
  });
});

describe("createPoll", () => {
  it("posts a Poll that then appears in the list", async () => {
    const result = await createPoll(db, "점심 뭐 먹을까?", ["짜장", "짬뽕"]);

    expect(result.ok).toBe(true);
    expect(await listPolls(db, voter)).toMatchObject([
      { question: "점심 뭐 먹을까?", hasVoted: false },
    ]);
  });
});

describe("createPoll validation", () => {
  it.each([
    ["one Option", ["a"], "too-few-options"],
    ["eleven Options", Array.from({ length: 11 }, (_, i) => `o${i}`), "too-many-options"],
  ])("rejects a Poll with %s", async (_, options, error) => {
    expect(await createPoll(db, "Q?", options)).toEqual({ ok: false, error });
    expect(await listPolls(db, voter)).toEqual([]);
  });

  it("accepts exactly 2 and exactly 10 Options", async () => {
    const ten = Array.from({ length: 10 }, (_, i) => `o${i}`);
    expect((await createPoll(db, "Q?", ["a", "b"])).ok).toBe(true);
    expect((await createPoll(db, "Q?", ten)).ok).toBe(true);
  });

  it.each([
    ["an empty Question", "", ["a", "b"], "question-empty"],
    ["a whitespace-only Question", "   ", ["a", "b"], "question-empty"],
    ["a 201-character Question", "가".repeat(201), ["a", "b"], "question-too-long"],
    ["an empty Option", "Q?", ["a", "  "], "option-empty"],
    ["a 101-character Option", "Q?", ["a", "나".repeat(101)], "option-too-long"],
    ["the same Option twice", "Q?", ["짜장", "짬뽕", "짜장"], "duplicate-options"],
    ["Options equal after trimming", "Q?", ["짜장", " 짜장 "], "duplicate-options"],
  ])("rejects %s", async (_, question, options, error) => {
    expect(await createPoll(db, question, options)).toEqual({ ok: false, error });
    expect(await listPolls(db, voter)).toEqual([]);
  });

  it("accepts a 200-character Question and 100-character Options", async () => {
    const result = await createPoll(db, "가".repeat(200), ["나".repeat(100), "b"]);
    expect(result.ok).toBe(true);
  });

  it("trims the Question", async () => {
    await createPoll(db, "  점심 뭐 먹을까?  ", ["짜장", "짬뽕"]);
    expect((await listPolls(db, voter))[0].question).toBe("점심 뭐 먹을까?");
  });
});
