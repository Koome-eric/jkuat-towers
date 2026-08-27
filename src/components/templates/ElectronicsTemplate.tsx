import type { TemplateProps } from "@/lib/templates";
import { getReadableText, buildTickerItems } from "@/lib/templates";
import { StorefrontNav } from "@/components/storefront/StorefrontNav";
import { StorefrontTicker } from "@/components/storefront/StorefrontTicker";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { HeroStats } from "@/components/storefront/HeroStats";
import { ScrollToHighlight } from "@/components/storefront/ScrollToHighlight";

// BENCH — electronics, phone accessories, tech repair
// Near-black spec-sheet aesthetic, monospace throughout, copper accent (or
// the vendor's own). Signature: a real stock-level gauge bar per product.
// Chrome matches the reference app's structure (sticky nav, ticker,
// footer, stat panel); Bench keeps its own dark-panel identity.

const BG = "#0C0D10";
const PANEL = "#15171C";
const LINE = "#262A31";
const TEXT = "#E7E9ED";
const SOFT = "#8B92A0";
const DEFAULT_ACCENT = "#FF7A30";
const MINT = "#3FD9C4";
const DISPLAY_FONT = "var(--font-spacemono)";

function StockGauge({ stock, accent }: { stock: number; accent: string }) {
  const pct = Math.max(4, Math.min(100, (stock / 20) * 100));
  const color = stock === 0 ? "#E85555" : stock <= 5 ? accent : MINT;
  return (
    <div>
      <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: LINE }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <p className="text-[0.65rem] font-mono mt-1" style={{ color }}>
        {stock === 0 ? "OUT OF STOCK" : `${stock} UNIT${stock === 1 ? "" : "S"} IN STOCK`}
      </p>
    </div>
  );
}

export default function ElectronicsTemplate({ shop, products, deals = [], highlightProductId }: TemplateProps) {
  const accent = shop.themeColor || DEFAULT_ACCENT;
  const accentText = getReadableText(accent);
  const inStock = products.filter((p) => p.stock > 0).length;
  const ticker = buildTickerItems(products, deals.map((d) => ({ title: d.title })));

  const palette = {
    bg: BG,
    surface: PANEL,
    ink: TEXT,
    soft: SOFT,
    line: LINE,
    accent,
    accentText,
    radius: "6px",
    displayFont: DISPLAY_FONT,
  };

  return (
    <div style={{ background: BG, color: TEXT, fontFamily: "var(--font-body)" }} className="min-h-screen -mx-6 sm:-mx-0">
      <ScrollToHighlight id={highlightProductId} />
      <StorefrontNav
        palette={palette}
        shopName={shop.name}
        shopNumber={shop.shopNumber}
        floorLabel={shop.floorLabel}
        whatsappLink={shop.whatsappLink}
        ctaLabel="Message on WhatsApp"
      />
      <StorefrontTicker items={ticker} palette={palette} />

      {/* Hero — device readout panel ------------------------------------ */}
      <section className="max-w-5xl mx-auto px-6 sm:px-0 pt-10 pb-10 sm:pt-14">
        <div className="grid md:grid-cols-12 gap-6 items-stretch">
          <div
            className="md:col-span-8 relative overflow-hidden p-6 sm:p-8"
            style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: "10px" }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
            />
            <p className="text-xs tracking-[0.25em] uppercase font-mono" style={{ color: accent, fontFamily: DISPLAY_FONT }}>
              {shop.category} · {shop.shopNumber}
              {shop.floorLabel ? ` · ${shop.floorLabel}` : ""}
            </p>
            <h1 className="text-3xl sm:text-4xl mt-3 font-bold tracking-tight" style={{ fontFamily: DISPLAY_FONT }}>
              {shop.name}
            </h1>
            {shop.aboutBusiness ? (
              <p className="mt-3 max-w-lg text-sm leading-relaxed" style={{ color: SOFT }}>
                {shop.aboutBusiness}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-5 text-xs font-mono" style={{ color: SOFT }}>
              {shop.openingHours ? <span>UPTIME · {shop.openingHours}</span> : null}
              {shop.paymentMethods.length ? <span>PAY · {shop.paymentMethods.join("/").toUpperCase()}</span> : null}
            </div>

            {shop.whatsappLink ? (
              <a
                href={shop.whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 mt-6 text-sm font-medium px-5 py-2.5 rounded-md transition-opacity hover:opacity-85"
                style={{ background: accent, color: accentText }}
              >
                Message on WhatsApp
              </a>
            ) : null}
          </div>

          <div className="md:col-span-4">
            <HeroStats
              surface={PANEL}
              line={LINE}
              ink={TEXT}
              soft={SOFT}
              stats={[
                { label: "SKUs", value: String(products.length) },
                { label: "In stock", value: String(inStock) },
                { label: "Category", value: shop.category },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Inventory grid --------------------------------------------------- */}
      <section className="max-w-5xl mx-auto px-6 sm:px-0 pb-16">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-sm tracking-widest uppercase font-mono" style={{ color: SOFT }}>
            Inventory — {products.length} SKU{products.length === 1 ? "" : "s"}
          </h2>
        </div>

        {products.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {products.map((p) => (
              <article
                key={p.id}
                id={`product-${p.id}`}
                className="p-5 flex flex-col gap-3 scroll-mt-24"
                style={{
                  background: PANEL,
                  border: `1px solid ${p.id === highlightProductId ? accent : LINE}`,
                  borderRadius: "8px",
                  boxShadow: p.id === highlightProductId ? `0 0 0 1px ${accent}` : "none",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[15px] font-medium leading-snug">{p.name}</h3>
                    {p.brand ? (
                      <p className="text-xs font-mono mt-0.5" style={{ color: SOFT }}>
                        {p.brand}
                      </p>
                    ) : null}
                  </div>
                  {p.category ? (
                    <span
                      className="text-[0.6rem] font-mono uppercase px-2 py-1 rounded shrink-0"
                      style={{ background: BG, color: MINT, border: `1px solid ${LINE}` }}
                    >
                      {p.category}
                    </span>
                  ) : null}
                </div>

                {p.description ? (
                  <p className="text-sm leading-relaxed" style={{ color: SOFT }}>
                    {p.description}
                  </p>
                ) : null}

                <p className="text-2xl font-bold font-mono" style={{ color: TEXT }}>
                  KSh {p.price.toLocaleString()}
                </p>

                <StockGauge stock={p.stock} accent={accent} />
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: SOFT }}>
            No products listed yet.
          </p>
        )}
      </section>

      <StorefrontFooter
        palette={{ ink: PANEL, displayFont: DISPLAY_FONT, accent }}
        shopName={shop.name}
        aboutBusiness={shop.aboutBusiness}
        openingHours={shop.openingHours}
        paymentMethods={shop.paymentMethods}
        whatsappLink={shop.whatsappLink}
      />
    </div>
  );
}
