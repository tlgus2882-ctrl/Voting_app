import type { PollResult } from "@/lib/polls";

export function ResultView({
  result,
  myOptionId,
}: {
  result: PollResult;
  myOptionId: number | null;
}) {
  return (
    <section className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {result.options.map((option) => {
          const mine = option.optionId === myOptionId;
          return (
            <li key={option.optionId} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-4">
                <span className={mine ? "font-semibold" : undefined}>
                  {option.text}
                  {mine && (
                    <span className="ml-2 text-xs font-normal text-zinc-500">내 선택</span>
                  )}
                </span>
                <span className="shrink-0 text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
                  {option.votes}표 · {option.percent}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className={`h-full rounded-full ${mine ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-400 dark:bg-zinc-500"}`}
                  style={{ width: `${option.percent}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-sm text-zinc-500">총 {result.totalVotes}표</p>
    </section>
  );
}
