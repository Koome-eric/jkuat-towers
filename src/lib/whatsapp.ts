import type { ProductSearchResult } from "@/lib/search";

const GRAPH_VERSION = "v21.0";

function getConfig() {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    throw new Error("WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID are not set. Add them to your .env file.");
  }
  return { token, phoneNumberId };
}

// Sends a plain text WhatsApp message via the Meta Cloud API.
// preview_url:true so product links unfurl into a tappable card.
export async function sendWhatsAppText(to: string, body: string): Promise<void> {
  const { token, phoneNumberId } = getConfig();

  const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body, preview_url: true },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`WhatsApp send failed (${res.status}): ${detail}`);
  }
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

// The link a product recommendation sends the customer to — their shop's
// storefront, scrolled/highlighted straight to that product.
export function productDeepLink(shopSlug: string, productId: string): string {
  return `${appUrl()}/shops/${shopSlug}?highlight=${productId}`;
}

// Turns AI-recommended products into WhatsApp-friendly lines with a real,
// clickable link under each one — this is what makes "click product ->
// goes to the vendor's shop" work from a WhatsApp thread.
export function formatProductLinksForWhatsApp(products: ProductSearchResult[], limit = 5): string {
  if (!products.length) return "";
  return products
    .slice(0, limit)
    .map((p) => {
      const location = [p.shop.shopNumber, p.shop.floor].filter(Boolean).join(", ");
      return `• *${p.name}* — KSh ${p.price.toLocaleString()}\n  ${p.shop.name} (${location})\n  ${productDeepLink(p.shop.slug, p.id)}`;
    })
    .join("\n\n");
}
