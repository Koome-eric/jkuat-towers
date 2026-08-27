import Link from "next/link";
import type { StorefrontPalette } from "@/lib/templates";

// Sticky header used by every niche template — mirrors the reference app's
// Nav.tsx (sticky, blurred, wordmark + link cluster) but each template
// hands in its own palette so it still reads as that niche, not a generic
// bar bolted on top.
export function StorefrontNav({
  palette,
  shopName,
  shopNumber,
  floorLabel,
  whatsappLink,
  ctaLabel = "Message on WhatsApp",
}: {
  palette: StorefrontPalette;
  shopName: string;
  shopNumber: string;
  floorLabel?: string | null;
  whatsappLink?: string | null;
  ctaLabel?: string;
}) {
  return (
    <header
      className="sticky top-0 z-40 backdrop-blur -mx-6 px-6 sm:mx-0 sm:px-0"
      style={{
        background: `color-mix(in srgb, ${palette.bg} 88%, transparent)`,
        borderBottom: `1px solid ${palette.line}`,
      }}
    >
      <div className="max-w-5xl mx-auto h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-xs tracking-widest uppercase shrink-0 hover:opacity-70 transition-opacity"
          style={{ color: palette.soft }}
        >
          ← JKUAT Towers
        </Link>

        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="text-base sm:text-lg truncate leading-none"
            style={{ fontFamily: palette.displayFont, color: palette.ink, fontWeight: 600 }}
          >
            {shopName}
          </span>
          <span
            className="hidden sm:inline text-[0.65rem] font-tabular px-2 py-1 rounded-full shrink-0"
            style={{ border: `1px solid ${palette.line}`, color: palette.soft }}
          >
            {shopNumber}
            {floorLabel ? ` · ${floorLabel}` : ""}
          </span>
        </div>

        {whatsappLink ? (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center text-xs font-medium px-4 py-2 shrink-0 transition-opacity hover:opacity-85"
            style={{ background: palette.accent, color: palette.accentText, borderRadius: palette.radius }}
          >
            {ctaLabel}
          </a>
        ) : (
          <span />
        )}
      </div>
    </header>
  );
}
