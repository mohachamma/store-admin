/** Report periods shared by the profit and ads screens. Dates are counted in Algeria time, like the API does. */
export const PERIODS = ["month", "last", "7d", "30d", "custom"] as const;
export type Period = (typeof PERIODS)[number];

export const ymd = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Algiers" }).format(d);
const addDays = (s: string, n: number) => ymd(new Date(new Date(`${s}T12:00:00Z`).getTime() + n * 864e5));

export function rangeOf(period: Period, today: string, from?: string, to?: string): { from: string; to: string } {
  const first = `${today.slice(0, 8)}01`;
  if (period === "last") {
    const lastEnd = addDays(first, -1);
    return { from: `${lastEnd.slice(0, 8)}01`, to: lastEnd };
  }
  if (period === "7d") return { from: addDays(today, -6), to: today };
  if (period === "30d") return { from: addDays(today, -29), to: today };
  if (period === "custom" && from && to && /^\d{4}-\d{2}-\d{2}$/.test(from) && /^\d{4}-\d{2}-\d{2}$/.test(to) && from <= to) return { from, to };
  return { from: first, to: today };
}

