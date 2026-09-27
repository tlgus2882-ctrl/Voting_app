import Link from "next/link";
import { getDb } from "@/lib/neon-db";
import { listPolls } from "@/lib/polls";
import { readVoterId } from "@/lib/voter";

export default async function Home() {
  const polls = await listPolls(getDb(), {
    voterId: await readVoterId(),
    isOperator: false,
  });

  if (polls.length === 0) {
    return (
      <p className="py-16 text-center text-zinc-500">
        아직 올라온 투표 주제가 없습니다.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {polls.map((poll) => (
        <li key={poll.id}>
          <Link
            href={`/polls/${poll.id}`}
            className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white px-4 py-3 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
          >
            <span className="font-medium">{poll.question}</span>
            {poll.hasVoted && (
              <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                투표 완료
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
