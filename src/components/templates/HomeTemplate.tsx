import type { TemplateProps } from "@/lib/templates";
import { getReadableText, buildTickerItems } from "@/lib/templates";
import { StorefrontNav } from "@/components/storefront/StorefrontNav";
import { StorefrontTicker } from "@/components/storefront/StorefrontTicker";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { HeroStats } from "@/components/storefront/HeroStats";
import { ScrollToHighlight } from "@/components/storefront/ScrollToHighlight";

// VIGNETTE — home & living, gifts
// Sand + sage, warm and roomy. Signature: a dotted "room path" spine down
// the page, section labels grouped by each product's own category. Ochre
// accent by default (or the vendor's own). Chrome matches the reference
// app's structure.

const BG = "#EDE6D9";
const SURFACE = "#FAF7F0";
const INK = "#2B2A26";
const SAGE = "#6E7B5E";
const DEFAULT_ACCENT = "#C79A3D";
const LINE = "#E1D8C6";
const SOFT = "#726C60";
const DISPLAY_FONT = "var(--font-bricolage)";

function groupByCategory(products: TemplateProps["products"]) {
  const groups = new Map<string, TemplateProps["products"]>();
  for (const p of products) {
    const key = p.category?.trim() || "More from the shop";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }
  return Array.from(groups.entries());
}

export default function HomeTemplate({ shop, products, deals = [], highlightProductId }: TemplateProps) {
  const accent = shop.themeColor || DEFAULT_ACCENT;
  const accentText = getReadableText(accent);
  const groups = groupByCategory(products);
  const inStock = products.filter((p) => p.stock > 0).length;
  const ticker = buildTickerItems(products, deals.map((d) => ({ title: d.title })));

  const palette = {
    bg: BG,
    surface: SURFACE,
    ink: INK,
    soft: SOFT,
    line: LINE,
    accent,
    accentText,
    radius: "9999px",
    displayFont: DISPLAY_FONT,
  };

  return (
    <div style={{ background: BG, color: INK, fontFamily: "var(--font-body)" }} className="min-h-screen w-full overflow-x-hidden">
      <ScrollToHighlight id={highlightProductId} />
      <StorefrontNav
        palette={palette}
        shopName={shop.name}
        shopNumber={shop.shopNumber}
        floorLabel={shop.floorLabel}
        whatsappLink={shop.whatsappLink}
        ctaLabel="Visit on WhatsApp"
      />
      <StorefrontTicker items={ticker} palette={palette} />

      {/* Hero -------------------------------------------------------------- */}
      <section className="max-w-4xl mx-auto px-6 sm:px-0 pt-14 pb-10 sm:pt-20">
        <div className="grid sm:grid-cols-[1fr_auto] gap-8 items-start">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: SAGE }}>
              {shop.category} · {shop.shopNumber}
              {shop.floorLabel ? ` · ${shop.floorLabel}` : ""}
            </p>
            <h1 className="text-4xl sm:text-5xl mt-3 leading-[1.08]" style={{ fontFamily: DISPLAY_FONT, fontWeight: 700 }}>
              {shop.name}
            </h1>
            {shop.aboutBusiness ? (
              <p className="mt-4 max-w-md text-[15px] leading-relaxed" style={{ color: SOFT }}>
                {shop.aboutBusiness}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3 mt-6">
              {shop.whatsappLink ? (
                <a
                  href={shop.whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-2xl transition-opacity hover:opacity-85"
                  style={{ background: accent, color: accentText }}
                >
                  Visit on WhatsApp
                </a>
              ) : null}
              {shop.openingHours ? (
                <span
                  className="inline-flex items-center text-sm px-4 py-2.5 rounded-2xl"
                  style={{ background: SURFACE, color: SOFT, border: `1px solid ${LINE}` }}
                >
                  🕒 {shop.openingHours}
                </span>
              ) : null}
            </div>
          </div>

          <div className="w-full sm:w-56 shrink-0">
            <HeroStats
              surface={SURFACE}
              line={LINE}
              ink={INK}
              soft={SOFT}
              stats={[
                { label: "Items", value: String(products.length) },
                { label: "In stock", value: String(inStock) },
                { label: "Cats.", value: String(groups.length) },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Room path spine + grouped sections --------------------------------- */}
      <section className="max-w-4xl mx-auto px-6 sm:px-0 pb-16 relative">
        {groups.length ? (
          <div className="relative pl-6 sm:pl-8">
            <div className="absolute left-0 top-2 bottom-2 w-px" style={{ borderLeft: `2px dotted ${accent}` }} />
            {groups.map(([label, items]) => (
              <div key={label} className="mb-10 relative">
                <span
                  className="absolute -left-6 sm:-left-8 top-1 w-3 h-3 rounded-full"
                  style={{ background: accent, boxShadow: `0 0 0 4px ${BG}` }}
                />
                <h2 className="text-lg mb-4" style={{ fontFamily: DISPLAY_FONT, fontWeight: 700 }}>
                  {label}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {items.map((p) => (
                    <article
                      key={p.id}
                      id={`product-${p.id}`}
                      className="p-5 rounded-2xl flex flex-col gap-1.5 scroll-mt-24"
                      style={{
                        background: SURFACE,
                        border: `1px solid ${p.id === highlightProductId ? accent : LINE}`,
                        boxShadow: p.id === highlightProductId ? `0 0 0 1px ${accent}` : "none",
                      }}
                    >
                      <h3 className="text-[15px] leading-snug">{p.name}</h3>
                      {p.brand ? (
                        <p className="text-xs" style={{ color: SOFT }}>
                          {p.brand}
                        </p>
                      ) : null}
                      {p.description ? (
                        <p className="text-sm leading-relaxed mt-1" style={{ color: SOFT }}>
                          {p.description}
                        </p>
                      ) : null}
                      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: `1px solid ${LINE}` }}>
                        <p className="font-tabular text-base">KSh {p.price.toLocaleString()}</p>
                        <p className="text-[0.65rem]" style={{ color: p.stock > 0 ? SAGE : "#B5453F" }}>
                          {p.stock > 0 ? "In stock" : "Out of stock"}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: SOFT }}>
            No products listed yet.
          </p>
        )}
      </section>

      <StorefrontFooter
        palette={{ ink: INK, displayFont: DISPLAY_FONT, accent }}
        shopName={shop.name}
        aboutBusiness={shop.aboutBusiness}
        openingHours={shop.openingHours}
        paymentMethods={shop.paymentMethods}
        whatsappLink={shop.whatsappLink}
      />
    </div>
  );
}
