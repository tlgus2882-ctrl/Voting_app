import type { Db } from "@/lib/db";
import {
  MAX_OPTION_LENGTH,
  MAX_OPTIONS,
  MAX_QUESTION_LENGTH,
  MIN_OPTIONS,
} from "@/lib/poll-limits";

/** Who is looking: an anonymous Voter's browser, possibly also the Operator's. */
export type Viewer = {
  voterId: string | null;
  isOperator: boolean;
};

export type PollSummary = {
  id: number;
  question: string;
  createdAt: Date;
  hasVoted: boolean;
};

/** All Polls, newest first. Vote counts are never included. */
export async function listPolls(db: Db, viewer: Viewer): Promise<PollSummary[]> {
  const rows = await db.query<{
    id: number;
    question: string;
    created_at: Date;
    has_voted: boolean;
  }>(
    `SELECT p.id, p.question, p.created_at,
            EXISTS (SELECT 1 FROM votes v WHERE v.poll_id = p.id AND v.voter_id = $1) AS has_voted
       FROM polls p
      ORDER BY p.id DESC`,
    [viewer.voterId],
  );
  return rows.map((r) => ({
    id: r.id,
    question: r.question,
    createdAt: r.created_at,
    hasVoted: r.has_voted,
  }));
}


export type CreatePollError =
  | "question-empty"
  | "question-too-long"
  | "too-few-options"
  | "too-many-options"
  | "option-empty"
  | "option-too-long"
  | "duplicate-options";

export type CreatePollResult =
  | { ok: true; pollId: number }
  | { ok: false; error: CreatePollError };

/** Length in characters, not UTF-16 code units. */
const charLength = (s: string) => Array.from(s).length;

function validatePoll(question: string, options: string[]): CreatePollError | null {
  if (question === "") return "question-empty";
  if (charLength(question) > MAX_QUESTION_LENGTH) return "question-too-long";
  if (options.length < MIN_OPTIONS) return "too-few-options";
  if (options.length > MAX_OPTIONS) return "too-many-options";
  if (options.some((o) => o === "")) return "option-empty";
  if (options.some((o) => charLength(o) > MAX_OPTION_LENGTH)) return "option-too-long";
  if (new Set(options).size !== options.length) return "duplicate-options";
  return null;
}

/**
 * Posts a Poll with its Options, atomically. The Question and Options are
 * trimmed first; Options keep the order given.
 */
export async function createPoll(
  db: Db,
  rawQuestion: string,
  rawOptions: string[],
): Promise<CreatePollResult> {
  const question = rawQuestion.trim();
  const options = rawOptions.map((o) => o.trim());
  const error = validatePoll(question, options);
  if (error) return { ok: false, error };

  const rows = await db.query<{ poll_id: number }>(
    `WITH p AS (INSERT INTO polls (question) VALUES ($1) RETURNING id)
     INSERT INTO options (poll_id, text, position)
     SELECT p.id, o.text, o.ord
       FROM p, unnest($2::text[]) WITH ORDINALITY AS o(text, ord)
     RETURNING poll_id`,
    [question, options],
  );
  return { ok: true, pollId: rows[0].poll_id };
}
