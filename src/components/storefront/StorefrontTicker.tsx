import type { StorefrontPalette, TickerItem } from "@/lib/templates";

// The reference app's signature element is a scrolling price ticker driven
// by PriceHistory rows. We don't track price over time, so this scrolls
// real signals instead — deals, low stock, catalogue items — same marquee
// mechanic (duplicate the row, animate to -50%), same "it's data, not
// decoration" spirit.
const TONE_LABEL: Record<TickerItem["tone"], string> = {
  new: "IN STOCK",
  low: "LOW STOCK",
  deal: "DEAL",
  steady: "OPEN",
};

const TONE_COLOR: Record<TickerItem["tone"], string> = {
  new: "#9CA3AF",
  low: "#F5A623",
  deal: "var(--ticker-accent)",
  steady: "#9CA3AF",
};

export function StorefrontTicker({ items, palette }: { items: TickerItem[]; palette: StorefrontPalette }) {
  if (!items.length) return null;
  const row = [...items, ...items];

  return (
    <div
      className="overflow-hidden border-b w-full"
      style={
        {
          background: palette.ink,
          borderColor: "rgba(255,255,255,0.12)",
          "--ticker-accent": palette.accent,
        } as React.CSSProperties
      }
      aria-label="Shop activity"
    >
      <div className="flex w-max animate-storefront-ticker">
        {row.map((item, i) => (
          <div
            key={`${item.label}-${i}`}
            className="flex items-center gap-2 px-5 py-2 border-r whitespace-nowrap"
            style={{ borderColor: "rgba(255,255,255,0.12)" }}
          >
            <span className="font-tabular text-[10px] tracking-wider" style={{ color: TONE_COLOR[item.tone] }}>
              {TONE_LABEL[item.tone]}
            </span>
            <span className="font-tabular text-[11px]" style={{ color: "#F3F4F6" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
