import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ShopPlaque } from "@/components/ShopPlaque";
import { RevealGroup, RevealItem } from "@/components/Reveal";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; maxPrice?: string }>;
}) {
  const { q = "", category, maxPrice } = await searchParams;

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      shop: { isActive: true },
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { brand: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(category ? { category: { equals: category, mode: "insensitive" } } : {}),
      ...(maxPrice ? { price: { lte: Number(maxPrice) } } : {}),
    },
    include: {
      shop: { select: { name: true, shopNumber: true, slug: true, floor: { select: { label: true } } } },
    },
    orderBy: { price: "asc" },
    take: 30,
  });

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link href="/" className="text-sm text-ink-soft hover:text-ink transition-colors">
          ← Back to JKUAT Towers
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-3 mt-3 mb-6">
          <div>
            <h1 className="text-2xl font-semibold">
              {q ? `“${q}”` : category ? category : "Search"}
            </h1>
            <p className="text-sm text-ink-soft mt-1">
              {products.length} match{products.length === 1 ? "" : "es"} across the building
            </p>
          </div>
          <Link href="/assistant" className="btn-ai text-sm">
            💬 Ask AI instead
          </Link>
        </div>

        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((p) => (
            <RevealItem key={p.id}>
              <Link href={`/shops/${p.shop.slug}`} className="card card-interactive p-5 flex flex-col gap-2 h-full">
                <div>
                  <p className="font-medium">{p.name}</p>
                  {p.brand ? <p className="text-xs text-ink-soft mt-0.5">{p.brand}</p> : null}
                </div>
                <p className="text-xl font-semibold font-tabular">
                  KSh {Number(p.price).toLocaleString()}
                </p>
                <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                  <ShopPlaque shopNumber={p.shop.shopNumber} floor={p.shop.floor?.label} />
                  <span className="text-xs font-medium text-signal-600">{p.shop.name} →</span>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>

        {!products.length ? (
          <div className="card p-10 text-center mt-4">
            <p className="text-ink-soft text-sm">
              No matches yet. Try a broader term, or ask the AI assistant to help you find alternatives.
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
