import type { Db } from "@/lib/db";

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
