import { DEFAULT_CHART_TYPE, isChartType, type ChartType } from "@/lib/chart-types";
import type { Db } from "@/lib/db";
import {
  MAX_DONUT_OPTIONS,
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
  deadline: Date | null;
  closed: boolean;
  /** Present only for the Operator. */
  totalVotes?: number;
};

/** All Polls, newest first. Vote counts are included for the Operator only. */
export async function listPolls(
  db: Db,
  viewer: Viewer,
  now: Date,
): Promise<PollSummary[]> {
  const rows = await db.query<{
    id: number;
    question: string;
    created_at: Date;
    deadline: Date | null;
    has_voted: boolean;
    total_votes: number;
  }>(
    `SELECT p.id, p.question, p.created_at, p.deadline,
            EXISTS (SELECT 1 FROM votes v WHERE v.poll_id = p.id AND v.voter_id = $1) AS has_voted,
            (SELECT count(*)::int FROM votes v WHERE v.poll_id = p.id) AS total_votes
       FROM polls p
      ORDER BY p.id DESC`,
    [viewer.voterId],
  );
  return rows.map((r) => ({
    id: r.id,
    question: r.question,
    createdAt: r.created_at,
    hasVoted: r.has_voted,
    deadline: r.deadline,
    closed: isClosed(r.deadline, now),
    ...(viewer.isOperator && { totalVotes: r.total_votes }),
  }));
}


export type CreatePollError =
  | "question-empty"
  | "question-too-long"
  | "too-few-options"
  | "too-many-options"
  | "option-empty"
  | "option-too-long"
  | "duplicate-options"
  | "deadline-not-in-future"
  | "invalid-chart-type"
  | "too-many-options-for-donut";

/** What the Operator fills in to post a Poll, before trimming and validation. */
export type NewPoll = {
  question: string;
  options: string[];
  /** When the Poll stops accepting Votes; omitted or null for never. */
  deadline?: Date | null;
  /** Omitted for the default, horizontal bars. */
  chartType?: string;
};

/** A Poll is Closed once its Deadline has passed; one without a Deadline never is. */
function isClosed(deadline: Date | null, now: Date): boolean {
  return deadline !== null && now.getTime() >= deadline.getTime();
}

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
  input: NewPoll,
  now: Date,
): Promise<CreatePollResult> {
  const question = input.question.trim();
  const options = input.options.map((o) => o.trim());
  const deadline = input.deadline ?? null;
  const chartType = input.chartType ?? DEFAULT_CHART_TYPE;
  const error =
    validatePoll(question, options) ??
    (deadline && deadline.getTime() <= now.getTime() ? "deadline-not-in-future" : null) ??
    (isChartType(chartType) ? null : "invalid-chart-type") ??
    (chartType === "donut" && options.length > MAX_DONUT_OPTIONS
      ? "too-many-options-for-donut"
      : null);
  if (error) return { ok: false, error };

  const rows = await db.query<{ poll_id: number }>(
    `WITH p AS (
       INSERT INTO polls (question, deadline, chart_type) VALUES ($1, $3, $4) RETURNING id
     )
     INSERT INTO options (poll_id, text, position)
     SELECT p.id, o.text, o.ord
       FROM p, unnest($2::text[]) WITH ORDINALITY AS o(text, ord)
     RETURNING poll_id`,
    [question, options, deadline, chartType],
  );
  return { ok: true, pollId: rows[0].poll_id };
}

export type PollOption = { id: number; text: string };

export type OptionTally = {
  optionId: number;
  text: string;
  votes: number;
  /** Whole-number share of all Votes; 0 when there are none. */
  percent: number;
};

export type PollResult = {
  totalVotes: number;
  /** In the order the Options were entered. */
  options: OptionTally[];
};

export type PollView = {
  id: number;
  question: string;
  deadline: Date | null;
  closed: boolean;
  chartType: ChartType;
  options: PollOption[];
  /** The Option this Voter chose, or null if they haven't voted. */
  myOptionId: number | null;
  /** Present only if the viewer has voted in this Poll, is the Operator, or the Poll is Closed. */
  result?: PollResult;
};

/**
 * One Poll as seen by `viewer`, or null if it doesn't exist. The Result is
 * left out entirely unless the viewer may see it.
 */
export async function getPoll(
  db: Db,
  pollId: number,
  viewer: Viewer,
  now: Date,
): Promise<PollView | null> {
  const [poll] = await db.query<{
    id: number;
    question: string;
    deadline: Date | null;
    chart_type: ChartType;
    my_option_id: number | null;
  }>(
    `SELECT p.id, p.question, p.deadline, p.chart_type,
            (SELECT v.option_id FROM votes v WHERE v.poll_id = p.id AND v.voter_id = $2) AS my_option_id
       FROM polls p
      WHERE p.id = $1`,
    [pollId, viewer.voterId],
  );
  if (!poll) return null;

  const rows = await db.query<{ id: number; text: string; votes: number }>(
    `SELECT o.id, o.text, count(v.voter_id)::int AS votes
       FROM options o
       LEFT JOIN votes v ON v.option_id = o.id
      WHERE o.poll_id = $1
      GROUP BY o.id
      ORDER BY o.position`,
    [pollId],
  );
  const view: PollView = {
    id: poll.id,
    question: poll.question,
    deadline: poll.deadline,
    closed: isClosed(poll.deadline, now),
    chartType: poll.chart_type,
    options: rows.map(({ id, text }) => ({ id, text })),
    myOptionId: poll.my_option_id,
  };
  if (poll.my_option_id !== null || viewer.isOperator || view.closed) {
    view.result = tally(rows);
  }
  return view;
}

/** One Voter choosing one Option in one Poll. */
export type NewVote = {
  pollId: number;
  optionId: number;
  voterId: string;
};

export type CastVoteResult =
  | "ok"
  | "already-voted"
  | "poll-not-found"
  | "poll-closed"
  | "option-not-in-poll";

/**
 * Records one Voter's Vote for one Option. A Vote is final: a Voter's second
 * Vote in the same Poll is rejected, not applied. A Closed Poll takes no Votes.
 */
export async function castVote(
  db: Db,
  { pollId, optionId, voterId }: NewVote,
  now: Date,
): Promise<CastVoteResult> {
  // The Deadline is checked in the same statement that inserts, so a Poll
  // can't close between the check and the Vote.
  const inserted = await db.query(
    `INSERT INTO votes (poll_id, option_id, voter_id)
     SELECT o.poll_id, o.id, $3
       FROM options o JOIN polls p ON p.id = o.poll_id
      WHERE o.poll_id = $1 AND o.id = $2
        AND (p.deadline IS NULL OR p.deadline > $4)
     ON CONFLICT (poll_id, voter_id) DO NOTHING
     RETURNING poll_id`,
    [pollId, optionId, voterId, now],
  );
  if (inserted.length > 0) return "ok";

  const [rejection] = await db.query<{
    deadline: Date | null;
    poll_exists: boolean;
    option_in_poll: boolean;
  }>(
    `SELECT (SELECT deadline FROM polls WHERE id = $1) AS deadline,
            EXISTS (SELECT 1 FROM polls WHERE id = $1) AS poll_exists,
            EXISTS (SELECT 1 FROM options WHERE poll_id = $1 AND id = $2) AS option_in_poll`,
    [pollId, optionId],
  );
  if (!rejection.poll_exists) return "poll-not-found";
  if (isClosed(rejection.deadline, now)) return "poll-closed";
  if (!rejection.option_in_poll) return "option-not-in-poll";
  return "already-voted";
}

function tally(rows: { id: number; text: string; votes: number }[]): PollResult {
  const totalVotes = rows.reduce((sum, r) => sum + r.votes, 0);
  return {
    totalVotes,
    options: rows.map((r) => ({
      optionId: r.id,
      text: r.text,
      votes: r.votes,
      percent: totalVotes === 0 ? 0 : Math.round((r.votes * 100) / totalVotes),
    })),
  };
}

/**
 * Permanently deletes a Poll and its Votes. Returns how many Votes were
 * deleted, or null if the Poll doesn't exist.
 */
export async function deletePoll(
  db: Db,
  pollId: number,
): Promise<{ deletedVotes: number } | null> {
  // The subquery sees the pre-delete snapshot, so it counts the doomed Votes.
  const [row] = await db.query<{ deleted_votes: number }>(
    `WITH d AS (DELETE FROM polls WHERE id = $1 RETURNING id)
     SELECT (SELECT count(*)::int FROM votes WHERE poll_id = $1) AS deleted_votes FROM d`,
    [pollId],
  );
  return row ? { deletedVotes: row.deleted_votes } : null;
}
