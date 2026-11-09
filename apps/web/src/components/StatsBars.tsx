/** A small bar chart of daily downloads. Pure markup, no client JavaScript. */
export function StatsBars({ series, label }: { series: { day: string; downloads: number }[]; label: string }) {
  const max = Math.max(1, ...series.map((d) => d.downloads));
  return (
    <div role="img" aria-label={`${label}. Peak ${max} downloads in a day.`} className="flex h-20 items-end gap-[3px]">
      {series.map((d) => (
        <div
          key={d.day}
          title={`${d.day}: ${d.downloads.toLocaleString("en-US")}`}
          className="flex-1 bg-accent/80"
          style={{ height: `${Math.max(d.downloads === 0 ? 2 : 6, (d.downloads / max) * 100)}%`, opacity: d.downloads === 0 ? 0.25 : 1 }}
        />
      ))}
    </div>
  );
}
