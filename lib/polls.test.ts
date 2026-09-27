import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/lib/db";
import { castVote, createPoll, getPoll, listPolls } from "@/lib/polls";
import { createTestDb } from "@/test/pglite-db";

const voter = { voterId: "voter-a", isOperator: false };

async function postPoll(question: string, options: string[]): Promise<number> {
  const result = await createPoll(db, question, options);
  if (!result.ok) throw new Error(`could not post Poll: ${result.error}`);
  return result.pollId;
}

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

describe("getPoll", () => {
  it("returns the Question and trimmed Options in the order they were entered", async () => {
    const pollId = await postPoll("점심 뭐 먹을까?", [" 짬뽕 ", "짜장", "볶음밥"]);

    const poll = await getPoll(db, pollId, voter);

    expect(poll).toMatchObject({ id: pollId, question: "점심 뭐 먹을까?", myOptionId: null });
    expect(poll?.options.map((o) => o.text)).toEqual(["짬뽕", "짜장", "볶음밥"]);
  });

  it("returns null for a Poll that does not exist", async () => {
    expect(await getPoll(db, 999, voter)).toBeNull();
  });
});

describe("castVote", () => {
  it("records the Voter's Vote and marks the Poll as voted", async () => {
    const pollId = await postPoll("점심 뭐 먹을까?", ["짜장", "짬뽕"]);
    const jjamppong = (await getPoll(db, pollId, voter))!.options[1];

    expect(await castVote(db, pollId, jjamppong.id, "voter-a")).toBe("ok");

    expect((await getPoll(db, pollId, voter))?.myOptionId).toBe(jjamppong.id);
    expect((await listPolls(db, voter))[0].hasVoted).toBe(true);
  });

  it("rejects a second Vote from the same Voter and keeps the first", async () => {
    const pollId = await postPoll("Q?", ["짜장", "짬뽕"]);
    const [jjajang, jjamppong] = (await getPoll(db, pollId, voter))!.options;
    await castVote(db, pollId, jjajang.id, "voter-a");

    expect(await castVote(db, pollId, jjamppong.id, "voter-a")).toBe("already-voted");
    expect((await getPoll(db, pollId, voter))?.myOptionId).toBe(jjajang.id);
  });

  it("lets different Voters each Vote in the same Poll", async () => {
    const pollId = await postPoll("Q?", ["짜장", "짬뽕"]);
    const [jjajang] = (await getPoll(db, pollId, voter))!.options;

    expect(await castVote(db, pollId, jjajang.id, "voter-a")).toBe("ok");
    expect(await castVote(db, pollId, jjajang.id, "voter-b")).toBe("ok");
  });

  it("rejects an Option that belongs to another Poll", async () => {
    const lunch = await postPoll("점심?", ["짜장", "짬뽕"]);
    const dinner = await postPoll("저녁?", ["치킨", "피자"]);
    const [chicken] = (await getPoll(db, dinner, voter))!.options;

    expect(await castVote(db, lunch, chicken.id, "voter-a")).toBe("option-not-in-poll");
    expect((await getPoll(db, lunch, voter))?.myOptionId).toBeNull();
  });

  it("rejects a Vote in a Poll that does not exist", async () => {
    expect(await castVote(db, 999, 1, "voter-a")).toBe("poll-not-found");
  });
});

describe("Result", () => {
  it("is hidden from a Voter who has not voted", async () => {
    const pollId = await postPoll("Q?", ["짜장", "짬뽕"]);
    const [jjajang] = (await getPoll(db, pollId, voter))!.options;
    await castVote(db, pollId, jjajang.id, "voter-b");

    expect(await getPoll(db, pollId, voter)).not.toHaveProperty("result");
  });

  it("is shown to a Voter after they vote, with counts, percentages and total", async () => {
    const pollId = await postPoll("Q?", ["짜장", "짬뽕", "볶음밥"]);
    const [jjajang, jjamppong] = (await getPoll(db, pollId, voter))!.options;
    await castVote(db, pollId, jjajang.id, "voter-a");
    await castVote(db, pollId, jjajang.id, "voter-b");
    await castVote(db, pollId, jjamppong.id, "voter-c");

    const poll = await getPoll(db, pollId, voter);

    expect(poll?.result).toEqual({
      totalVotes: 3,
      options: [
        { optionId: jjajang.id, text: "짜장", votes: 2, percent: 67 },
        { optionId: jjamppong.id, text: "짬뽕", votes: 1, percent: 33 },
        { optionId: expect.any(Number), text: "볶음밥", votes: 0, percent: 0 },
      ],
    });
  });

  it("is shown to the Operator without voting", async () => {
    const pollId = await postPoll("Q?", ["짜장", "짬뽕"]);
    const [jjajang] = (await getPoll(db, pollId, voter))!.options;
    await castVote(db, pollId, jjajang.id, "voter-b");

    const poll = await getPoll(db, pollId, { voterId: null, isOperator: true });

    expect(poll?.result?.totalVotes).toBe(1);
  });

  it("shows 0% for every Option when there are no Votes", async () => {
    const pollId = await postPoll("Q?", ["짜장", "짬뽕"]);

    const poll = await getPoll(db, pollId, { voterId: null, isOperator: true });

    expect(poll?.result?.totalVotes).toBe(0);
    expect(poll?.result?.options.map((o) => o.percent)).toEqual([0, 0]);
  });
});
