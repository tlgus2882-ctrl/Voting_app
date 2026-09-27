import Link from "next/link";
import { redirect } from "next/navigation";
import { formatKst } from "@/lib/kst";
import { getDb } from "@/lib/neon-db";
import { Badge } from "../badge";
import { isOperator } from "@/lib/operator-session";
import { listPolls } from "@/lib/polls";
import { readViewer } from "@/lib/viewer";
import { signOut } from "./actions";
import { CreatePollForm } from "./create-poll-form";
import { DeletePollButton } from "./delete-poll-button";

export default async function OperatorPage() {
  if (!(await isOperator())) redirect("/operator/login");

  const polls = await listPolls(getDb(), await readViewer(), new Date());

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">투표 주제 관리</h1>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            로그아웃
          </button>
        </form>
      </div>

      <CreatePollForm />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">올린 투표 주제</h2>
        {polls.length === 0 ? (
          <p className="text-zinc-500">아직 올린 투표 주제가 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {polls.map((poll) => (
              <li
                key={poll.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/polls/${poll.id}`} className="font-medium hover:underline">
                      {poll.question}
                    </Link>
                    {poll.closed && <Badge>마감됨</Badge>}
                  </div>
                  <span className="text-sm text-zinc-500">
                    {poll.totalVotes ?? 0}표
                    {!poll.closed && poll.deadline && ` · ${formatKst(poll.deadline)} 마감`}
                  </span>
                </div>
                <DeletePollButton pollId={poll.id} totalVotes={poll.totalVotes ?? 0} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
