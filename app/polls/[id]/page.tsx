import { notFound } from "next/navigation";
import { getDb } from "@/lib/neon-db";
import { getPoll } from "@/lib/polls";
import { readViewer } from "@/lib/viewer";
import { ResultView } from "./result-view";
import { VoteForm } from "./vote-form";

export default async function PollPage({ params }: PageProps<"/polls/[id]">) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const poll = await getPoll(getDb(), Number(id), await readViewer(), new Date());
  if (!poll) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{poll.question}</h1>
      {poll.result && <ResultView result={poll.result} myOptionId={poll.myOptionId} />}
      {poll.myOptionId === null && <VoteForm pollId={poll.id} options={poll.options} />}
    </div>
  );
}
