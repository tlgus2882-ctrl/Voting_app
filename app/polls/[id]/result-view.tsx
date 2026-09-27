import type { ChartType } from "@/lib/chart-types";
import type { OptionTally, PollResult } from "@/lib/polls";

type ChartProps = { options: OptionTally[]; myOptionId: number | null };

const charts: Record<ChartType, (props: ChartProps) => React.ReactNode> = {
  "horizontal-bar": HorizontalBars,
  "vertical-bar": VerticalBars,
};

export function ResultView({
  result,
  myOptionId,
  chartType,
}: {
  result: PollResult;
  myOptionId: number | null;
  chartType: ChartType;
}) {
  const Chart = charts[chartType];
  return (
    <section className="flex flex-col gap-4">
      <Chart options={result.options} myOptionId={myOptionId} />
      <p className="text-sm text-zinc-500">총 {result.totalVotes}표</p>
    </section>
  );
}

const barColor = (mine: boolean) =>
  mine ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-400 dark:bg-zinc-500";

function HorizontalBars({ options, myOptionId }: ChartProps) {
  return (
    <ul className="flex flex-col gap-3">
      {options.map((option) => {
        const mine = option.optionId === myOptionId;
        return (
          <li key={option.optionId} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-4">
              <span className={mine ? "font-semibold" : undefined}>
                {option.text}
                {mine && <span className="ml-2 text-xs font-normal text-zinc-500">내 선택</span>}
              </span>
              <span className="shrink-0 text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
                {option.votes}표 · {option.percent}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className={`h-full rounded-full ${barColor(mine)}`}
                style={{ width: `${option.percent}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function VerticalBars({ options, myOptionId }: ChartProps) {
  return (
    <ul className="flex items-stretch gap-2">
      {options.map((option) => {
        const mine = option.optionId === myOptionId;
        return (
          <li key={option.optionId} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <span className="text-center text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
              {option.votes}표
              <br />
              {option.percent}%
            </span>
            <div className="flex h-40 w-full max-w-12 items-end border-b border-zinc-300 dark:border-zinc-700">
              <div
                className={`w-full rounded-t ${barColor(mine)}`}
                style={{ height: `${option.percent}%` }}
              />
            </div>
            <span
              title={option.text}
              className={`line-clamp-2 w-full break-words text-center text-xs ${mine ? "font-semibold" : ""}`}
            >
              {option.text}
            </span>
            {mine && <span className="text-xs text-zinc-500">내 선택</span>}
          </li>
        );
      })}
    </ul>
  );
}
