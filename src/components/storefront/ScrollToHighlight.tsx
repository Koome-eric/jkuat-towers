"use client";

import { useEffect } from "react";

// Used across every storefront template (and the neutral fallback layout)
// so a "?highlight=<productId>" link — the kind the WhatsApp assistant
// sends — actually lands the customer on that exact product, not just
// the top of the shop.
export function ScrollToHighlight({ id }: { id?: string | null }) {
  useEffect(() => {
    if (!id) return;
    const el = document.getElementById(`product-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [id]);

  return null;
}
