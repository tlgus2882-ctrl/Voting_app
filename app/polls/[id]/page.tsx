import { notFound } from "next/navigation";
import { formatKst } from "@/lib/kst";
import { getDb } from "@/lib/neon-db";
import { getPoll } from "@/lib/polls";
import { readViewer } from "@/lib/viewer";
import { ResultView } from "./result-view";
import { VoteForm } from "./vote-form";

export default async function PollPage({ params, searchParams }: PageProps<"/polls/[id]">) {
  const { id } = await params;
  const { notice } = await searchParams;
  if (!/^\d+$/.test(id)) notFound();

  const poll = await getPoll(getDb(), Number(id), await readViewer(), new Date());
  if (!poll) notFound();

  return (
    <div className="flex flex-col gap-6">
      {notice === "poll-closed" && (
        <p
          role="status"
          className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200"
        >
          마감된 투표 주제입니다.
        </p>
      )}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{poll.question}</h1>
        {poll.closed ? (
          <p className="text-sm text-zinc-500">마감됨</p>
        ) : (
          poll.deadline && (
            <p className="text-sm text-zinc-500">{formatKst(poll.deadline)} 마감</p>
          )
        )}
      </div>
      {poll.result && (
        <ResultView
          result={poll.result}
          myOptionId={poll.myOptionId}
          chartType={poll.chartType}
        />
      )}
      {poll.myOptionId === null && !poll.closed && (
        <VoteForm pollId={poll.id} options={poll.options} />
      )}
    </div>
  );
}
