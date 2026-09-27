/** How a Poll's Result can be drawn. Safe to import from client components. */
export const CHART_TYPES = ["horizontal-bar", "vertical-bar"] as const;

export type ChartType = (typeof CHART_TYPES)[number];

export const DEFAULT_CHART_TYPE: ChartType = "horizontal-bar";

export const CHART_TYPE_LABELS: Record<ChartType, string> = {
  "horizontal-bar": "가로 막대",
  "vertical-bar": "세로 막대",
};

export function isChartType(value: string): value is ChartType {
  return (CHART_TYPES as readonly string[]).includes(value);
}
