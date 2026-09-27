import Link from "next/link";
import { getDb } from "@/lib/neon-db";
import { Badge } from "./badge";
import { listPolls, type PollSummary } from "@/lib/polls";
import { readViewer } from "@/lib/viewer";

export default async function Home({ searchParams }: PageProps<"/">) {
  const { notice } = await searchParams;
  const polls = await listPolls(getDb(), await readViewer(), new Date());

  return (
    <div className="flex flex-col gap-4">
      {notice === "poll-deleted" && (
        <p
          role="status"
          className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200"
        >
          삭제된 투표 주제입니다.
        </p>
      )}
      {polls.length === 0 ? (
        <p className="py-16 text-center text-zinc-500">
          아직 올라온 투표 주제가 없습니다.
        </p>
      ) : (
        <PollList polls={polls} />
      )}
    </div>
  );
}

function PollList({ polls }: { polls: PollSummary[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {polls.map((poll) => (
        <li key={poll.id}>
          <Link
            href={`/polls/${poll.id}`}
            className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white px-4 py-3 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
          >
            <span className="font-medium">{poll.question}</span>
            <span className="flex shrink-0 gap-1">
              {poll.closed && <Badge>마감됨</Badge>}
              {poll.hasVoted && <Badge>투표 완료</Badge>}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
