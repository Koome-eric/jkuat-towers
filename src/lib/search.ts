import { prisma } from "@/lib/prisma";

export type ProductSearchParams = {
  q?: string;
  category?: string;
  maxPrice?: number;
};

export type ProductSearchResult = {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  shop: {
    name: string;
    shopNumber: string;
    floor: string | null;
    slug: string;
    whatsapp: string | null;
  };
};

// The single source of truth for "search everything in the building" —
// used by /api/search (for the search page) and by the AI assistant's
// search_products tool, so the AI can never see different results than
// the plain search page shows.
export async function searchProducts({
  q,
  category,
  maxPrice,
}: ProductSearchParams): Promise<ProductSearchResult[]> {
  const query = q?.trim();

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      shop: { isActive: true },
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { brand: { contains: query, mode: "insensitive" } },
              { tags: { has: query.toLowerCase() } },
            ],
          }
        : {}),
      ...(category ? { category: { equals: category, mode: "insensitive" } } : {}),
      ...(typeof maxPrice === "number" ? { price: { lte: maxPrice } } : {}),
    },
    include: {
      shop: {
        select: {
          name: true,
          shopNumber: true,
          slug: true,
          whatsapp: true,
          floor: { select: { label: true } },
        },
      },
    },
    orderBy: { price: "asc" },
    take: 25,
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    price: Number(p.price),
    shop: {
      name: p.shop.name,
      shopNumber: p.shop.shopNumber,
      floor: p.shop.floor?.label ?? null,
      slug: p.shop.slug,
      whatsapp: p.shop.whatsapp,
    },
  }));
}
