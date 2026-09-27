import type { ChartType } from "@/lib/chart-types";
import type { OptionTally, PollResult } from "@/lib/polls";

type ChartProps = { options: OptionTally[]; totalVotes: number; myOptionId: number | null };

const charts: Record<ChartType, (props: ChartProps) => React.ReactNode> = {
  "horizontal-bar": HorizontalBars,
  "vertical-bar": VerticalBars,
  donut: Donut,
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
      <Chart options={result.options} totalVotes={result.totalVotes} myOptionId={myOptionId} />
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

/** Mid-tone hues that read on both light and dark backgrounds. */
const DONUT_COLORS = ["#0ea5e9", "#f59e0b", "#10b981", "#f43f5e", "#8b5cf6"];

// A circle of radius 100/(2π) has a circumference of 100, so each segment's
// dash length is simply its share in percent.
const DONUT_RADIUS = 100 / (2 * Math.PI);

function Donut({ options, totalVotes, myOptionId }: ChartProps) {
  // Exact shares, not the rounded percents, so the segments close the ring.
  const shares = options.map((o) => (totalVotes === 0 ? 0 : (o.votes * 100) / totalVotes));
  const segments = options.map((option, i) => ({
    key: option.optionId,
    color: DONUT_COLORS[i],
    share: shares[i],
    startAt: shares.slice(0, i).reduce((sum, s) => sum + s, 0),
  }));

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative size-48 shrink-0">
        <svg viewBox="0 0 42 42" className="size-full -rotate-90" aria-hidden="true">
          <circle
            cx="21"
            cy="21"
            r={DONUT_RADIUS}
            fill="none"
            strokeWidth="6"
            className="stroke-zinc-200 dark:stroke-zinc-800"
          />
          {segments
            .filter((s) => s.share > 0)
            .map((s) => (
              <circle
                key={s.key}
                cx="21"
                cy="21"
                r={DONUT_RADIUS}
                fill="none"
                strokeWidth="6"
                stroke={s.color}
                strokeDasharray={`${s.share} ${100 - s.share}`}
                strokeDashoffset={-s.startAt}
              />
            ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {totalVotes === 0 ? (
            <span className="px-8 text-xs text-zinc-500">아직 표가 없습니다</span>
          ) : (
            <>
              <span className="text-2xl font-semibold tabular-nums">{totalVotes}</span>
              <span className="text-xs text-zinc-500">표</span>
            </>
          )}
        </div>
      </div>
      <ul className="flex w-full flex-col gap-2">
        {options.map((option, i) => {
          const mine = option.optionId === myOptionId;
          return (
            <li key={option.optionId} className="flex items-baseline gap-2">
              <span
                className="size-3 shrink-0 translate-y-0.5 rounded-sm"
                style={{ backgroundColor: DONUT_COLORS[i] }}
              />
              <span className={`min-w-0 flex-1 break-words ${mine ? "font-semibold" : ""}`}>
                {option.text}
                {mine && <span className="ml-2 text-xs font-normal text-zinc-500">내 선택</span>}
              </span>
              <span className="shrink-0 text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
                {option.votes}표 · {option.percent}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
