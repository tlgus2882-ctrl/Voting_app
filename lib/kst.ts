// The app's clock is Korean time, whatever time zone the server runs in.

const KST_OFFSET = "+09:00";

const deadlineFormat = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "long",
  day: "numeric",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/**
 * Reads a `datetime-local` value such as "2026-10-03T18:00" as Korean time.
 * Returns null if it isn't one.
 */
export function parseKstDateTime(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00${KST_OFFSET}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** e.g. "10월 3일 (토) 18:00", in Korean time. */
export function formatKst(date: Date): string {
  return deadlineFormat.format(date);
}
