import type { TemplateProps } from "@/lib/templates";
import { getReadableText, buildTickerItems } from "@/lib/templates";
import { StorefrontNav } from "@/components/storefront/StorefrontNav";
import { StorefrontTicker } from "@/components/storefront/StorefrontTicker";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { HeroStats } from "@/components/storefront/HeroStats";
import { ScrollToHighlight } from "@/components/storefront/ScrollToHighlight";

// MARKET — food & grocery
// Cream + forest green, citrus accent by default (or the vendor's own).
// Bold rounded display. Signature: scalloped awning edge between hero and
// stall grid, live "fresh today" tag driven by the real stock field.
// Chrome matches the reference app's structure.

const BG = "#FBF7EC";
const SURFACE = "#FFFFFF";
const FOREST = "#1F4D3A";
const DEFAULT_ACCENT = "#EF9F2F";
const INK = "#1B2620";
const LINE = "#E7E0CC";
const SOFT = "#5C6B60";
const DISPLAY_FONT = "var(--font-bricolage)";

export default function GroceryTemplate({ shop, products, deals = [], highlightProductId }: TemplateProps) {
  const accent = shop.themeColor || DEFAULT_ACCENT;
  const accentText = getReadableText(accent);
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
    <div style={{ background: BG, color: INK, fontFamily: "var(--font-body)" }} className="min-h-screen -mx-6 sm:-mx-0">
      <ScrollToHighlight id={highlightProductId} />
      <StorefrontNav
        palette={palette}
        shopName={shop.name}
        shopNumber={shop.shopNumber}
        floorLabel={shop.floorLabel}
        whatsappLink={shop.whatsappLink}
        ctaLabel="Order on WhatsApp"
      />
      <StorefrontTicker items={ticker} palette={palette} />

      {/* Hero — market awning ---------------------------------------------- */}
      <section className="px-6 sm:px-0">
        <div
          className="max-w-4xl mx-auto pt-12 pb-10 sm:pt-16"
          style={{ background: FOREST, color: "#F3EFDF", borderRadius: "16px 16px 0 0", padding: "3rem 2rem 3.5rem" }}
        >
          <div className="grid md:grid-cols-[1fr_auto] gap-8 items-start">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: accent }}>
                {shop.category} · {shop.shopNumber}
                {shop.floorLabel ? ` · ${shop.floorLabel}` : ""}
              </p>
              <h1 className="text-4xl sm:text-5xl mt-3 leading-[1.05]" style={{ fontFamily: DISPLAY_FONT, fontWeight: 800 }}>
                {shop.name}
              </h1>
              {shop.aboutBusiness ? (
                <p className="mt-4 max-w-md text-[15px] leading-relaxed opacity-85">{shop.aboutBusiness}</p>
              ) : null}

              <div className="flex flex-wrap gap-3 mt-6">
                {shop.whatsappLink ? (
                  <a
                    href={shop.whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full transition-opacity hover:opacity-85"
                    style={{ background: accent, color: accentText }}
                  >
                    Order on WhatsApp
                  </a>
                ) : null}
                {shop.openingHours ? <span className="inline-flex items-center text-sm opacity-85">🕒 {shop.openingHours}</span> : null}
              </div>
            </div>

            <div className="w-full md:w-52 shrink-0">
              <HeroStats
                surface="rgba(255,255,255,0.06)"
                line="rgba(255,255,255,0.16)"
                ink="#F3EFDF"
                soft="rgba(243,239,223,0.7)"
                stats={[
                  { label: "Items", value: String(products.length) },
                  { label: "Fresh", value: String(inStock) },
                  { label: "Type", value: shop.category }
                ]}
              />
            </div>
          </div>
        </div>

        {/* scalloped awning edge — signature element */}
        <div
          className="max-w-4xl mx-auto h-4"
          style={{
            background: `radial-gradient(circle at 10px -4px, ${FOREST} 10px, transparent 11px)`,
            backgroundSize: "20px 16px",
            backgroundRepeat: "repeat-x",
          }}
          aria-hidden
        />
      </section>

      {/* Stall grid ---------------------------------------------------------- */}
      <section className="max-w-4xl mx-auto px-6 sm:px-0 pb-16 pt-4">
        <h2 className="text-lg font-bold mb-5" style={{ fontFamily: DISPLAY_FONT }}>
          Today at the stall
        </h2>

        {products.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((p) => (
              <article
                key={p.id}
                id={`product-${p.id}`}
                className="relative p-5 rounded-2xl flex flex-col gap-1.5 scroll-mt-24"
                style={{
                  background: SURFACE,
                  border: `1px solid ${p.id === highlightProductId ? accent : LINE}`,
                  boxShadow: p.id === highlightProductId ? `0 0 0 1px ${accent}` : "none",
                }}
              >
                <span
                  className="absolute top-3 right-3 text-[0.6rem] font-semibold uppercase px-2 py-1 rounded-full"
                  style={{
                    background: p.stock > 0 ? "#E7F2EA" : "#FBEAE8",
                    color: p.stock > 0 ? FOREST : "#B5453F",
                  }}
                >
                  {p.stock > 0 ? "Fresh today" : "Sold out"}
                </span>
                <h3 className="text-[15px] leading-snug pr-16">{p.name}</h3>
                {p.category ? (
                  <p className="text-xs" style={{ color: SOFT }}>
                    {p.category}
                  </p>
                ) : null}
                {p.description ? (
                  <p className="text-sm leading-relaxed mt-1" style={{ color: SOFT }}>
                    {p.description}
                  </p>
                ) : null}
                <p className="font-tabular text-lg mt-3 pt-3" style={{ borderTop: `1px dashed ${LINE}`, color: FOREST }}>
                  KSh {p.price.toLocaleString()}
                </p>
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
        palette={{ ink: FOREST, displayFont: DISPLAY_FONT, accent }}
        shopName={shop.name}
        aboutBusiness={shop.aboutBusiness}
        openingHours={shop.openingHours}
        paymentMethods={shop.paymentMethods}
        whatsappLink={shop.whatsappLink}
      />
    </div>
  );
}
