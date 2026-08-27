import { prisma } from "@/lib/prisma";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ShopsDirectory } from "./ShopsDirectory";

export const dynamic = "force-dynamic";

export default async function ShopsIndexPage() {
  const building = await prisma.building.findFirst({
    include: {
      shops: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          category: true,
          shopNumber: true,
          slug: true,
          themeColor: true,
          aboutBusiness: true,
          floor: { select: { label: true, order: true } },
        },
        orderBy: { name: "asc" },
      },
    },
  });

  const shops = building?.shops ?? [];
  const categories = Array.from(new Set(shops.map((s) => s.category))).sort();

  return (
    <main className="min-h-screen">
      <SiteNav />

      <section className="bg-ink text-white">
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-14 sm:pt-20 sm:pb-16">
          <p className="text-[11px] tracking-widest uppercase text-white/40">Directory</p>
          <h1 className="text-3xl sm:text-4xl font-semibold mt-2">Every shop in the building</h1>
          <p className="text-white/60 mt-3 max-w-lg text-[15px] leading-relaxed">
            {shops.length} shops across {building?.name ?? "JKUAT Towers"}. Filter by category or search by name.
          </p>
        </div>
      </section>

      <ShopsDirectory shops={shops} categories={categories} />

      <SiteFooter buildingAddress={building?.address} />
    </main>
  );
}
