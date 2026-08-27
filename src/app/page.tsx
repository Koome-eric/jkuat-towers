import Link from "next/link";
import { Search, MessageCircle, Store, ArrowRight, MapPin, Smartphone, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ShopPlaque } from "@/components/ShopPlaque";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { BuildingIndexPanel, type IndexTickerItem } from "@/components/BuildingIndexPanel";

export const dynamic = "force-dynamic";

export default async function HomePage() {
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
          floor: { select: { label: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      deals: {
        where: { isFeatured: true },
        include: { shop: { select: { name: true, shopNumber: true } } },
        take: 6,
      },
    },
  });

  const shops = building?.shops ?? [];
  const categories = Array.from(new Set(shops.map((s) => s.category)));
  const productCount = await prisma.product.count({ where: { isActive: true, shop: { isActive: true } } });

  const featuredShops = shops.slice(0, 6);

  const tickerItems: IndexTickerItem[] = [
    ...(building?.deals ?? []).map((d) => ({ label: `${d.title} — ${d.shop.name}`, tone: "deal" as const })),
    ...shops.slice(0, 6).map((s) => ({ label: `${s.name} · ${s.category}`, tone: "new" as const })),
  ];
  if (!tickerItems.length) tickerItems.push({ label: "Shops listing soon", tone: "open" });

  return (
    <main className="min-h-screen">
      <SiteNav />

      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                */}
      {/* ------------------------------------------------------------------ */}
      <header className="relative overflow-hidden bg-ink text-white">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="grid lg:grid-cols-[1fr_320px] gap-12 lg:gap-16 items-center">
            <div>
              <Reveal>
                <div className="inline-flex items-center gap-2 shop-plaque bg-white/10 border-white/20 text-white mb-7">
                  <MapPin size={12} />
                  Nairobi CBD · {shops.length} shops live now
                </div>
              </Reveal>

              <Reveal delay={0.05}>
                <h1 className="text-4xl sm:text-6xl font-semibold leading-[1.05] max-w-xl">
                  Every shop in the building.
                  <span className="block text-white/50">One search away.</span>
                </h1>
              </Reveal>

              <Reveal delay={0.1}>
                <p className="text-white/60 mt-5 max-w-md text-base sm:text-lg leading-relaxed">
                  {building?.name ?? "JKUAT Towers"} lists every vendor&apos;s inventory in one place —
                  search once, message the shop that has it, walk over and buy it.
                </p>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl">
                  <form action="/search" className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        name="q"
                        placeholder="Try “perfume under 3000”"
                        className="w-full rounded-xl pl-10 pr-4 py-3.5 text-ink bg-white placeholder:text-neutral-400 outline-none ring-0 focus:ring-2 focus:ring-signal-500 transition-shadow text-sm"
                      />
                    </div>
                    <button className="btn-primary bg-signal-500 hover:bg-signal-600 px-5 shrink-0">Search</button>
                  </form>
                  <Link
                    href="/assistant"
                    className="btn-ai flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Sparkles size={15} />
                    Ask the AI
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <Link
                  href="/onboard"
                  className="inline-flex items-center gap-1.5 mt-8 text-sm text-white/50 hover:text-white transition-colors"
                >
                  Own a shop here? List it free
                  <ArrowRight size={14} />
                </Link>
              </Reveal>
            </div>

            <Reveal delay={0.1} className="w-full">
              <BuildingIndexPanel
                stats={[
                  { label: "Shops", value: String(shops.length) },
                  { label: "Products", value: String(productCount) },
                  { label: "Categories", value: String(categories.length) },
                ]}
                ticker={tickerItems}
              />
            </Reveal>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* How it works — preview                                             */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-20">
        <Reveal>
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold">How it works</h2>
            <Link href="/how-it-works" className="hidden sm:inline-flex items-center gap-1 text-sm text-signal-600 hover:text-signal-700 font-medium">
              Full guide <ArrowRight size={14} />
            </Link>
          </div>
        </Reveal>
        <RevealGroup className="grid sm:grid-cols-3 gap-5" stagger={0.06}>
          {[
            { icon: Search, step: "01", title: "Search or ask", body: "Type what you need, or ask the AI assistant to find it across every shop." },
            { icon: MessageCircle, step: "02", title: "Message the shop", body: "See the price and exact shop location, then message the vendor on WhatsApp." },
            { icon: Store, step: "03", title: "Walk over, buy it", body: "The shop's expecting you — pick it up, try it on, pay in person." },
          ].map(({ icon: Icon, step, title, body }) => (
            <RevealItem key={step}>
              <div className="card p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-lg bg-signal-50 flex items-center justify-center text-signal-600">
                    <Icon size={17} />
                  </div>
                  <span className="font-tabular text-xs text-ink-soft/60">{step}</span>
                </div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">{body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
        <Link href="/how-it-works" className="sm:hidden inline-flex items-center gap-1 text-sm text-signal-600 font-medium mt-6">
          Full guide <ArrowRight size={14} />
        </Link>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Categories                                                          */}
      {/* ------------------------------------------------------------------ */}
      {categories.length ? (
        <section className="max-w-5xl mx-auto px-6 py-6">
          <Reveal>
            <h2 className="text-lg font-semibold mb-4">Browse by category</h2>
          </Reveal>
          <RevealGroup className="flex flex-wrap gap-2" stagger={0.03}>
            {categories.map((c) => (
              <RevealItem key={c}>
                <Link href={`/search?category=${encodeURIComponent(c)}`} className="chip inline-block">
                  {c}
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      ) : null}

      {/* ------------------------------------------------------------------ */}
      {/* Featured shops                                                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <Reveal>
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-lg font-semibold">Shops on the directory</h2>
            <Link href="/shops" className="inline-flex items-center gap-1 text-sm text-signal-600 hover:text-signal-700 font-medium">
              View all {shops.length} <ArrowRight size={14} />
            </Link>
          </div>
        </Reveal>
        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {featuredShops.map((shop) => (
            <RevealItem key={shop.id}>
              <Link href={`/shops/${shop.slug}`} className="card card-interactive p-5 flex flex-col gap-3 h-full">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: shop.themeColor || "#94A3B8" }}
                        aria-hidden
                      />
                      <p className="font-medium">{shop.name}</p>
                    </div>
                    <p className="text-sm text-ink-soft mt-0.5">{shop.category}</p>
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
        {!shops.length ? (
          <p className="text-ink-soft text-sm">
            No shops yet — run the seed script (<code className="font-tabular">npm run db:seed</code>) to add sample data.
          </p>
        ) : null}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Deals                                                               */}
      {/* ------------------------------------------------------------------ */}
      {building?.deals?.length ? (
        <section className="max-w-5xl mx-auto px-6 py-10">
          <Reveal>
            <h2 className="text-lg font-semibold mb-4">Featured deals</h2>
          </Reveal>
          <RevealGroup className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 sm:mx-0 sm:px-0">
            {building.deals.map((d) => (
              <RevealItem key={d.id} className="min-w-[240px]">
                <div className="card card-interactive p-5 h-full border-amber-500/30">
                  <span className="chip !py-1 !px-2.5 !text-[10px] tracking-wider uppercase text-amber-700 border-amber-200 bg-amber-50">
                    Deal
                  </span>
                  <p className="font-medium mt-3">{d.title}</p>
                  <p className="text-sm text-ink-soft mt-1.5">
                    {d.shop.name} · <span className="font-tabular">{d.shop.shopNumber}</span>
                  </p>
                  {d.description ? <p className="text-sm text-ink-soft mt-2">{d.description}</p> : null}
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      ) : null}

      {/* ------------------------------------------------------------------ */}
      {/* Vendor CTA band                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-ink text-white mt-8">
        <div className="max-w-5xl mx-auto px-6 py-16 sm:py-20 grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <p className="text-[11px] tracking-widest uppercase text-white/40">For vendors</p>
            <h2 className="text-2xl sm:text-3xl font-semibold mt-2 max-w-lg">
              Own a shop in the building? List it free.
            </h2>
            <ul className="mt-5 flex flex-col gap-2 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <Smartphone size={15} className="text-signal-500 shrink-0" /> Customers find you from search and WhatsApp
              </li>
              <li className="flex items-center gap-2">
                <Sparkles size={15} className="text-violet-500 shrink-0" /> An AI Business Brain drafts quotes and invoices for you
              </li>
              <li className="flex items-center gap-2">
                <Store size={15} className="text-signal-500 shrink-0" /> A storefront page you can theme with your own color
              </li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <Link href="/onboard" className="btn-primary bg-signal-500 hover:bg-signal-600 text-center px-6 py-3">
              List your shop free
            </Link>
            <Link href="/sign-in" className="btn-secondary bg-white/5 border-white/20 text-white hover:bg-white/10 text-center px-6 py-3">
              Vendor sign in
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter buildingAddress={building?.address} />
    </main>
  );
}
