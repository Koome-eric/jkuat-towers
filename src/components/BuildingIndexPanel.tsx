export type IndexTickerItem = { label: string; tone: "new" | "deal" | "open" };

const TONE_LABEL: Record<IndexTickerItem["tone"], string> = {
  new: "NEW LISTING",
  deal: "DEAL",
  open: "OPEN NOW",
};

// The landing page's one deliberate risk: a dark "market index" console
// standing in for what a fintech hero usually spends on a product
// screenshot. It reports real counts from the database (no invented
// deltas or fake price history) — the building's own inventory, read like
// an index summary.
export function BuildingIndexPanel({
  stats,
  ticker,
}: {
  stats: { label: string; value: string }[];
  ticker: IndexTickerItem[];
}) {
  const row = ticker.length ? [...ticker, ...ticker] : [];

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 sm:px-5">
        <span className="text-[10px] font-tabular tracking-[0.2em] uppercase text-white/45">Building Index</span>
        <span className="flex items-center gap-1.5 text-[10px] font-tabular tracking-wider text-signal-500">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal-500 opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-signal-500" />
          </span>
          LIVE
        </span>
      </div>

      <div className="grid grid-cols-3">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`p-3 sm:p-5 ${i > 0 ? "border-l border-white/10" : ""}`}
          >
            <p className="font-tabular text-xl sm:text-2xl text-white leading-none">{s.value}</p>
            <p className="text-[8.5px] sm:text-[9.5px] tracking-widest uppercase text-white/40 mt-2">{s.label}</p>
          </div>
        ))}
      </div>

      {row.length ? (
        <div className="overflow-hidden border-t border-white/10">
          <div className="flex w-max animate-storefront-ticker">
            {row.map((item, i) => (
              <div
                key={`${item.label}-${i}`}
                className="flex items-center gap-2 px-4 py-2.5 border-r border-white/10 whitespace-nowrap"
              >
                <span
                  className="text-[9px] font-tabular tracking-wider"
                  style={{ color: item.tone === "deal" ? "#059669" : "rgba(255,255,255,0.4)" }}
                >
                  {TONE_LABEL[item.tone]}
                </span>
                <span className="text-[11px] font-tabular text-white/80">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
