/** Minimal 7-day bar chart for the dark revenue card (no chart library needed). */
export function Sparkbars({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-14 items-end gap-1.5" dir="ltr" aria-hidden>
      {values.map((v, i) => (
        <div
          key={i}
          className={i === values.length - 1 ? "flex-1 rounded-md bg-paper" : "flex-1 rounded-md bg-paper/25"}
          style={{ height: `${Math.max(8, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}
