import type { TemplateProps } from "@/lib/templates";
import { getReadableText, buildTickerItems } from "@/lib/templates";
import { StorefrontNav } from "@/components/storefront/StorefrontNav";
import { StorefrontTicker } from "@/components/storefront/StorefrontTicker";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { HeroStats } from "@/components/storefront/HeroStats";
import { ScrollToHighlight } from "@/components/storefront/ScrollToHighlight";

// VANITY — perfume, beauty & barber
// Champagne + plum, gold accent by default (or the vendor's own). Fraunces
// italic, radial glow behind the headline. Signature: a wax-seal badge
// (shop's initial) on every product card. Chrome (nav/ticker/footer/stats)
// matches the reference app's structure.

const BG = "#F2E7D8";
const SURFACE = "#FBF5EC";
const PLUM = "#3B1E2C";
const DEFAULT_ACCENT = "#B08D3F";
const BLUSH = "#E7C9BE";
const SOFT = "#6E5A55";
const DISPLAY_FONT = "var(--font-fraunces)";

export default function BeautyTemplate({ shop, products, deals = [], highlightProductId }: TemplateProps) {
  const accent = shop.themeColor || DEFAULT_ACCENT;
  const accentText = getReadableText(accent);
  const seal = shop.name.trim().charAt(0).toUpperCase() || "•";
  const inStock = products.filter((p) => p.stock > 0).length;
  const ticker = buildTickerItems(products, deals.map((d) => ({ title: d.title })));

  const palette = {
    bg: BG,
    surface: SURFACE,
    ink: PLUM,
    soft: SOFT,
    line: BLUSH,
    accent,
    accentText,
    radius: "9999px",
    displayFont: DISPLAY_FONT,
  };

  return (
    <div style={{ background: BG, color: PLUM, fontFamily: "var(--font-body)" }} className="min-h-screen w-full overflow-x-hidden">
      <ScrollToHighlight id={highlightProductId} />
      <StorefrontNav
        palette={palette}
        shopName={shop.name}
        shopNumber={shop.shopNumber}
        floorLabel={shop.floorLabel}
        whatsappLink={shop.whatsappLink}
        ctaLabel="Chat on WhatsApp"
      />
      <StorefrontTicker items={ticker} palette={palette} />

      {/* Hero — centered with radial glow --------------------------------- */}
      <section className="relative text-center pt-16 pb-10 sm:pt-20 sm:pb-10 overflow-hidden px-6 sm:px-0">
        <div
          className="absolute inset-x-0 top-0 h-72 pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 0%, ${BLUSH} 0%, transparent 65%)` }}
        />
        <div className="relative max-w-lg mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase" style={{ color: accent }}>
            {shop.category}
          </p>
          <h1 className="text-4xl sm:text-5xl mt-3 italic" style={{ fontFamily: DISPLAY_FONT, fontWeight: 500 }}>
            {shop.name}
          </h1>
          {shop.aboutBusiness ? (
            <p className="mt-4 text-[15px] leading-relaxed" style={{ color: SOFT }}>
              {shop.aboutBusiness}
            </p>
          ) : null}

          <div className="flex items-center justify-center gap-2 mt-5">
            <span className="h-px w-8" style={{ background: accent }} />
            <span className="text-xs font-tabular" style={{ color: accent }}>
              {shop.shopNumber}
              {shop.floorLabel ? ` · ${shop.floorLabel}` : ""}
            </span>
            <span className="h-px w-8" style={{ background: accent }} />
          </div>

          {shop.whatsappLink ? (
            <a
              href={shop.whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-7 text-sm font-medium px-6 py-2.5 rounded-full transition-opacity hover:opacity-85"
              style={{ background: PLUM, color: SURFACE }}
            >
              Chat with the boutique
            </a>
          ) : null}
        </div>
      </section>

      <section className="max-w-lg mx-auto px-6 sm:px-0 pb-4">
        <HeroStats
          surface={SURFACE}
          line={BLUSH}
          ink={PLUM}
          soft={SOFT}
          stats={[
            { label: "Pieces", value: String(products.length) },
            { label: "Available", value: String(inStock) },
            { label: "Category", value: shop.category },
          ]}
        />
      </section>

      {/* Shelf ------------------------------------------------------------ */}
      <section className="max-w-5xl mx-auto px-6 sm:px-0 pb-16 pt-8">
        <h2 className="text-lg italic text-center mb-8" style={{ fontFamily: DISPLAY_FONT }}>
          On the shelf
        </h2>

        {products.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {products.map((p) => (
              <article
                key={p.id}
                id={`product-${p.id}`}
                className="relative p-5 pt-8 rounded-2xl flex flex-col gap-1.5 scroll-mt-24"
                style={{
                  background: SURFACE,
                  border: `1px solid ${p.id === highlightProductId ? accent : BLUSH}`,
                  boxShadow: p.id === highlightProductId ? `0 0 0 1px ${accent}` : "none",
                }}
              >
                {/* wax-seal badge — signature element */}
                <span
                  className="absolute -top-3 left-5 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium italic"
                  style={{
                    background: `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${accent} 60%, white), ${accent})`,
                    color: accentText,
                    fontFamily: DISPLAY_FONT,
                    boxShadow: "0 2px 6px rgba(59,30,44,0.25)",
                  }}
                >
                  {seal}
                </span>

                <h3 className="text-[15px] mt-2 leading-snug">{p.name}</h3>
                {p.brand ? (
                  <p className="text-xs uppercase tracking-wide" style={{ color: accent }}>
                    {p.brand}
                  </p>
                ) : null}
                {p.description ? (
                  <p className="text-sm leading-relaxed mt-1" style={{ color: SOFT }}>
                    {p.description}
                  </p>
                ) : null}
                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: `1px dotted ${BLUSH}` }}>
                  <p className="font-tabular text-base">KSh {p.price.toLocaleString()}</p>
                  <p className="text-[0.65rem]" style={{ color: p.stock > 0 ? accent : "#B5453F" }}>
                    {p.stock > 0 ? "Available" : "Sold out"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-center" style={{ color: SOFT }}>
            No products listed yet.
          </p>
        )}
      </section>

      <StorefrontFooter
        palette={{ ink: PLUM, displayFont: DISPLAY_FONT, accent }}
        shopName={shop.name}
        aboutBusiness={shop.aboutBusiness}
        openingHours={shop.openingHours}
        paymentMethods={shop.paymentMethods}
        whatsappLink={shop.whatsappLink}
      />
    </div>
  );
}
