import type { TemplateProps } from "@/lib/templates";
import { getReadableText, buildTickerItems } from "@/lib/templates";
import { StorefrontNav } from "@/components/storefront/StorefrontNav";
import { StorefrontTicker } from "@/components/storefront/StorefrontTicker";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { HeroStats } from "@/components/storefront/HeroStats";
import { ScrollToHighlight } from "@/components/storefront/ScrollToHighlight";

// ATELIER — fashion, shoes, jewelry, bags, watches, tailoring
// Ivory paper + oxblood (or the vendor's own accent), Fraunces italic
// display, runway "Look" numbering, fabric-swatch corner tag. Chrome
// (sticky nav, activity ticker, footer, stat panel) matches the reference
// app's structure; the palette and signature elements stay Atelier's own.

const INK = "#211A17";
const PAPER = "#F6F1E8";
const SURFACE = "#FFFFFF";
const DEFAULT_ACCENT = "#7C2A34";
const LINE = "#DED2BE";
const SOFT = "#6B5F53";
const DISPLAY_FONT = "var(--font-fraunces)";

export default function FashionTemplate({ shop, products, deals = [], highlightProductId }: TemplateProps) {
  const accent = shop.themeColor || DEFAULT_ACCENT;
  const accentText = getReadableText(accent);
  const inStock = products.filter((p) => p.stock > 0).length;
  const ticker = buildTickerItems(products, deals.map((d) => ({ title: d.title })));

  const palette = {
    bg: PAPER,
    surface: SURFACE,
    ink: INK,
    soft: SOFT,
    line: LINE,
    accent,
    accentText,
    radius: "2px",
    displayFont: DISPLAY_FONT,
  };

  return (
    <div style={{ background: PAPER, color: INK, fontFamily: "var(--font-body)" }} className="min-h-screen w-full overflow-x-hidden">
      <ScrollToHighlight id={highlightProductId} />
      <StorefrontNav
        palette={palette}
        shopName={shop.name}
        shopNumber={shop.shopNumber}
        floorLabel={shop.floorLabel}
        whatsappLink={shop.whatsappLink}
        ctaLabel="Enquire on WhatsApp"
      />
      <StorefrontTicker items={ticker} palette={palette} />

      {/* Hero ---------------------------------------------------------- */}
      <section className="max-w-5xl mx-auto px-6 sm:px-0 pt-10 pb-12 sm:pt-16 sm:pb-16">
        <div className="grid md:grid-cols-12 gap-8 md:gap-10 items-start">
          <div className="md:col-span-8 border-b pb-8" style={{ borderColor: LINE }}>
            <p className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: accent }}>
              {shop.category} atelier
            </p>
            <h1
              className="text-4xl sm:text-5xl mt-3 italic leading-[1.05]"
              style={{ fontFamily: DISPLAY_FONT, fontWeight: 500 }}
            >
              {shop.name}
            </h1>
            {shop.aboutBusiness ? (
              <p className="mt-4 max-w-md text-[15px] leading-relaxed" style={{ color: SOFT }}>
                {shop.aboutBusiness}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 text-xs" style={{ color: SOFT }}>
              {shop.openingHours ? <span>🕒 {shop.openingHours}</span> : null}
              {shop.paymentMethods.length ? <span>Accepts {shop.paymentMethods.join(", ")}</span> : null}
            </div>

            {shop.whatsappLink ? (
              <a
                href={shop.whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 mt-6 text-sm font-medium px-5 py-2.5 transition-opacity hover:opacity-85"
                style={{ background: accent, color: accentText, borderRadius: "2px" }}
              >
                Enquire on WhatsApp
              </a>
            ) : null}
          </div>

          <div className="md:col-span-4 flex flex-col gap-4">
            <div
              className="border px-4 py-3 text-right font-tabular text-xs"
              style={{ borderColor: accent, color: accent }}
            >
              <p className="tracking-wider uppercase" style={{ fontSize: "0.6rem" }}>
                Boutique
              </p>
              <p className="text-base mt-0.5" style={{ color: INK }}>
                {shop.shopNumber}
              </p>
              {shop.floorLabel ? <p style={{ color: SOFT }}>{shop.floorLabel}</p> : null}
            </div>
            <HeroStats
              surface={SURFACE}
              line={LINE}
              ink={INK}
              soft={SOFT}
              stats={[
                { label: "Pieces", value: String(products.length) },
                { label: "In stock", value: String(inStock) },
                { label: "Category", value: shop.category },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Collection ------------------------------------------------------ */}
      <section className="max-w-5xl mx-auto px-6 sm:px-0 pb-16">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-lg italic" style={{ fontFamily: DISPLAY_FONT }}>
            The collection
          </h2>
          <p className="text-xs font-tabular" style={{ color: SOFT }}>
            {products.length} {products.length === 1 ? "piece" : "pieces"}
          </p>
        </div>

        {products.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px" style={{ background: LINE }}>
            {products.map((p, i) => (
              <article
                key={p.id}
                id={`product-${p.id}`}
                className="relative p-6 flex flex-col gap-2 transition-shadow scroll-mt-24"
                style={{
                  background: SURFACE,
                  boxShadow: p.id === highlightProductId ? `inset 0 0 0 2px ${accent}` : "none",
                }}
              >
                {/* fabric-swatch corner tag — signature element */}
                <span
                  className="absolute top-0 right-0 text-[0.6rem] tracking-wider uppercase font-medium px-2 py-1"
                  style={{ background: accent, color: accentText, clipPath: "polygon(0 0, 100% 0, 100% 100%)" }}
                >
                  <span className="opacity-0">{p.category ?? ""}</span>
                </span>
                <p className="text-[0.65rem] font-tabular tracking-widest" style={{ color: SOFT }}>
                  LOOK {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="text-base leading-snug">{p.name}</h3>
                {p.brand ? (
                  <p className="text-xs uppercase tracking-wide" style={{ color: SOFT }}>
                    {p.brand}
                  </p>
                ) : null}
                {p.description ? (
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: SOFT }}>
                    {p.description}
                  </p>
                ) : null}
                <div className="flex items-end justify-between mt-3 pt-3 border-t" style={{ borderColor: LINE }}>
                  <p className="font-tabular text-lg" style={{ color: accent }}>
                    KSh {p.price.toLocaleString()}
                  </p>
                  <p className="text-[0.65rem] font-tabular" style={{ color: p.stock > 0 ? SOFT : accent }}>
                    {p.stock > 0 ? "In stock" : "Sold out"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: SOFT }}>
            No pieces listed yet.
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
