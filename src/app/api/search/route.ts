import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/search";

// GET /api/search?q=perfume&maxPrice=3000
// This is the core "killer feature": search across every participating
// vendor's inventory in the building at once. Shares logic with the AI
// assistant's search_products tool via src/lib/search.ts.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const maxPrice = searchParams.get("maxPrice");
  const category = searchParams.get("category");

  if (!q && !category) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchProducts({
    q,
    category: category ?? undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  });

  return NextResponse.json({ query: q, count: results.length, results });
}
