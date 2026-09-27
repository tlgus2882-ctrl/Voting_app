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

export type PollOption = { id: number; text: string };

export type PollView = {
  id: number;
  question: string;
  options: PollOption[];
  /** The Option this Voter chose, or null if they haven't voted. */
  myOptionId: number | null;
};

/** One Poll as seen by `viewer`, or null if it doesn't exist. */
export async function getPoll(
  db: Db,
  pollId: number,
  viewer: Viewer,
): Promise<PollView | null> {
  const [poll] = await db.query<{ id: number; question: string; my_option_id: number | null }>(
    `SELECT p.id, p.question,
            (SELECT v.option_id FROM votes v WHERE v.poll_id = p.id AND v.voter_id = $2) AS my_option_id
       FROM polls p
      WHERE p.id = $1`,
    [pollId, viewer.voterId],
  );
  if (!poll) return null;

  const options = await db.query<PollOption>(
    `SELECT id, text FROM options WHERE poll_id = $1 ORDER BY position`,
    [pollId],
  );
  return {
    id: poll.id,
    question: poll.question,
    options,
    myOptionId: poll.my_option_id,
  };
}

export type CastVoteResult =
  | "ok"
  | "already-voted"
  | "poll-not-found"
  | "option-not-in-poll";

/**
 * Records one Voter's Vote for one Option. A Vote is final: a Voter's second
 * Vote in the same Poll is rejected, not applied.
 */
export async function castVote(
  db: Db,
  pollId: number,
  optionId: number,
  voterId: string,
): Promise<CastVoteResult> {
  const inserted = await db.query(
    `INSERT INTO votes (poll_id, option_id, voter_id)
     SELECT poll_id, id, $3 FROM options WHERE poll_id = $1 AND id = $2
     ON CONFLICT (poll_id, voter_id) DO NOTHING
     RETURNING poll_id`,
    [pollId, optionId, voterId],
  );
  if (inserted.length > 0) return "ok";

  const [why] = await db.query<{ poll_exists: boolean; option_in_poll: boolean }>(
    `SELECT EXISTS (SELECT 1 FROM polls WHERE id = $1) AS poll_exists,
            EXISTS (SELECT 1 FROM options WHERE poll_id = $1 AND id = $2) AS option_in_poll`,
    [pollId, optionId],
  );
  if (!why.poll_exists) return "poll-not-found";
  if (!why.option_in_poll) return "option-not-in-poll";
  return "already-voted";
}
