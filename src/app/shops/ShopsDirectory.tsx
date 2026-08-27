"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { ShopPlaque } from "@/components/ShopPlaque";
import { RevealGroup, RevealItem } from "@/components/Reveal";

type Shop = {
  id: string;
  name: string;
  category: string;
  shopNumber: string;
  slug: string;
  themeColor: string | null;
  aboutBusiness: string | null;
  floor: { label: string; order: number } | null;
};

export function ShopsDirectory({ shops, categories }: { shops: Shop[]; categories: string[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return shops.filter((s) => {
      const matchesCategory = !category || s.category === category;
      const matchesQuery = !q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [shops, query, category]);

  return (
    <section className="max-w-5xl mx-auto px-6 py-10 -mt-6">
      <div className="card p-2 flex flex-col sm:flex-row gap-2 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shops by name or category"
            className="w-full pl-10 pr-4 py-2.5 text-sm outline-none bg-transparent"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button className="chip" data-active={category === null} onClick={() => setCategory(null)}>
          All ({shops.length})
        </button>
        {categories.map((c) => (
          <button key={c} className="chip" data-active={category === c} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      {filtered.length ? (
        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((shop) => (
            <RevealItem key={shop.id}>
              <Link href={`/shops/${shop.slug}`} className="card card-interactive p-5 flex flex-col gap-3 h-full">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: shop.themeColor || "#94A3B8" }}
                    aria-hidden
                  />
                  <div>
                    <p className="font-medium">{shop.name}</p>
                    <p className="text-sm text-ink-soft">{shop.category}</p>
                  </div>
                </div>
                {shop.aboutBusiness ? (
                  <p className="text-sm text-ink-soft leading-relaxed line-clamp-2">{shop.aboutBusiness}</p>
                ) : null}
                <ShopPlaque shopNumber={shop.shopNumber} floor={shop.floor?.label} className="self-start mt-auto" />
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      ) : (
        <p className="text-ink-soft text-sm py-12 text-center">No shops match that search.</p>
      )}
    </section>
  );
}
