// Premium storefront templates — 5 niche-specific storefront designs that
// a vendor's shop is automatically dressed in based on the category they
// picked at onboarding. Every vendor still owns the same underlying Shop /
// Product data (prisma/schema.prisma) — templates are presentation only.
//
// Add a new template: create src/components/templates/<Name>Template.tsx,
// add its key below, and map the relevant onboarding categories to it.
// Categories with no mapping fall back to the neutral default layout in
// src/app/shops/[slug]/page.tsx (kept for "Services", "Other", etc. — shops
// that don't fit a retail-goods niche).

export const TEMPLATE_KEYS = ["fashion", "electronics", "beauty", "home", "grocery"] as const;
export type TemplateKey = (typeof TEMPLATE_KEYS)[number];

export const TEMPLATE_LABELS: Record<TemplateKey, string> = {
  fashion: "Atelier — fashion & apparel",
  electronics: "Bench — electronics & tech",
  beauty: "Vanity — beauty & fragrance",
  home: "Vignette — home & living",
  grocery: "Market — food & grocery",
};

// Onboarding category (see CATEGORIES in src/app/onboard/page.tsx) -> template.
// Keys are lowercased for a case-insensitive match against shop.category.
const CATEGORY_TO_TEMPLATE: Record<string, TemplateKey> = {
  fashion: "fashion",
  shoes: "fashion",
  jewelry: "fashion",
  bags: "fashion",
  watches: "fashion",
  tailoring: "fashion",

  electronics: "electronics",
  "phone accessories": "electronics",
  "tech repair": "electronics",

  perfume: "beauty",
  "beauty & barber": "beauty",

  gifts: "home",

  food: "grocery",
};

export function getTemplateForCategory(category: string | null | undefined): TemplateKey | null {
  if (!category) return null;
  return CATEGORY_TO_TEMPLATE[category.trim().toLowerCase()] ?? null;
}

// Shared shape every template component renders from — a trimmed, already
// display-ready projection of the Shop + Product Prisma models, so template
// files never touch Prisma types directly.
export type TemplateProduct = {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  price: number;
  stock: number;
  description: string | null;
  tags: string[];
};

export type TemplateShop = {
  name: string;
  category: string;
  shopNumber: string;
  floorLabel: string | null;
  aboutBusiness: string | null;
  openingHours: string | null;
  whatsappLink: string | null;
  paymentMethods: string[];
  // Vendor-chosen accent hex, e.g. "#3452FF". Null/undefined means "use
  // this template's own default accent" — see each Template file's
  // DEFAULT_ACCENT constant.
  themeColor?: string | null;
};

export type TemplateProps = {
  shop: TemplateShop;
  products: TemplateProduct[];
  deals?: { id: string; title: string }[];
  // Product id to scroll to and visually highlight — set when a customer
  // arrives via the WhatsApp assistant's product recommendation link.
  highlightProductId?: string;
};

// ---------------------------------------------------------------------------
// Vendor theme color
// ---------------------------------------------------------------------------

// Curated swatches offered at onboarding and in the dashboard. Chosen to
// read cleanly as a button/link accent against both light paper templates
// and the dark Electronics template.
export const THEME_SWATCHES: { label: string; value: string }[] = [
  { label: "Signal indigo", value: "#3452FF" },
  { label: "Oxblood", value: "#7C2A34" },
  { label: "Forest", value: "#1F4D3A" },
  { label: "Copper", value: "#FF7A30" },
  { label: "Plum", value: "#5B2A5E" },
  { label: "Gold", value: "#B08D3F" },
  { label: "Ink navy", value: "#0B1121" },
  { label: "Sage", value: "#6E7B5E" },
  { label: "Crimson", value: "#C23B3B" },
  { label: "Teal", value: "#0E8F5E" },
];

// Simple luminance check so accent-colored buttons always get readable
// text, whatever hex a vendor picks.
export function getReadableText(hex: string): "#0B1121" | "#FFFFFF" {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "#FFFFFF";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#0B1121" : "#FFFFFF";
}

// The set of colors every template's shared chrome (nav / ticker / footer)
// needs, so those components stay palette-agnostic and each Template file
// just supplies its own niche's values.
export type StorefrontPalette = {
  bg: string;
  surface: string;
  ink: string;
  soft: string;
  line: string;
  accent: string;
  accentText: string;
  radius: string; // corner radius token used by nav/footer CTAs, e.g. "0px" | "9999px"
  displayFont: string; // e.g. "var(--font-fraunces)"
};

// ---------------------------------------------------------------------------
// Storefront ticker — a lightweight stand-in for the reference app's price
// ticker. We don't track price history, so instead of price deltas this
// scrolls real signals from the shop's own data: active deals, low-stock
// items, and a sampling of the catalogue — still "real facts, not
// decoration," just not price-over-time.
// ---------------------------------------------------------------------------

export type TickerItem = { label: string; tone: "new" | "low" | "deal" | "steady" };

export function buildTickerItems(
  products: TemplateProduct[],
  deals: { title: string }[] = []
): TickerItem[] {
  const items: TickerItem[] = [];

  deals.slice(0, 4).forEach((d) => items.push({ label: d.title, tone: "deal" }));

  products
    .filter((p) => p.stock > 0 && p.stock <= 5)
    .slice(0, 5)
    .forEach((p) => items.push({ label: `${p.name} — ${p.stock} left`, tone: "low" }));

  products
    .slice(0, 6)
    .forEach((p) => items.push({ label: `${p.name} · KSh ${p.price.toLocaleString()}`, tone: "new" }));

  if (!items.length) items.push({ label: "Fresh stock added regularly", tone: "steady" });

  return items;
}
