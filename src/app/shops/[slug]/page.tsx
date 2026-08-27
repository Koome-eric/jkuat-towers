import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShopPlaque } from "@/components/ShopPlaque";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { StorefrontTemplate } from "@/components/templates";
import { getTemplateForCategory } from "@/lib/templates";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ welcome?: string; highlight?: string }>;
}) {
  const { slug } = await params;
  const { welcome, highlight } = await searchParams;

  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: {
      products: { where: { isActive: true }, orderBy: { name: "asc" } },
      floor: true,
      deals: {
        where: { OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }] },
        orderBy: { startsAt: "desc" },
        take: 5,
        select: { id: true, title: true },
      },
    },
  });

  if (!shop) return notFound();

  const whatsappLink = shop.whatsapp ? `https://wa.me/${shop.whatsapp.replace(/\D/g, "")}` : null;

  // Premium niche templates (src/components/templates/) — a shop whose
  // onboarding category maps to one of the 5 niche templates renders in
  // that fully custom storefront design instead of the neutral default
  // below. Shops in categories with no premium template (Services, Other,
  // etc.) keep the neutral layout.
  const templateKey = getTemplateForCategory(shop.category);
  if (templateKey) {
    return (
      <StorefrontTemplate
        templateKey={templateKey}
        shop={{
          name: shop.name,
          category: shop.category,
          shopNumber: shop.shopNumber,
          floorLabel: shop.floor?.label ?? null,
          aboutBusiness: shop.aboutBusiness,
          openingHours: shop.openingHours,
          whatsappLink,
          paymentMethods: shop.paymentMethods,
          themeColor: shop.themeColor,
        }}
        products={shop.products.map((p) => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          category: p.category,
          price: Number(p.price),
          stock: p.stock,
          description: p.description,
          tags: p.tags,
        }))}
        deals={shop.deals}
        highlightProductId={highlight}
      />
    );
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link href="/" className="text-sm text-ink-soft hover:text-ink transition-colors">
          ← Back to JKUAT Towers
        </Link>

        {welcome ? (
          <Reveal>
            <div className="bg-signal-50 border border-signal-100 text-signal-900 text-sm rounded-xl px-4 py-3 mt-4">
              🎉 Your shop is live! Share this page&apos;s link so customers can find you.
            </div>
          </Reveal>
        ) : null}

        <Reveal delay={welcome ? 0.05 : 0}>
          <div className="card p-6 sm:p-8 mt-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-signal-600 uppercase tracking-wide">{shop.category}</p>
                <h1 className="text-2xl sm:text-3xl font-semibold mt-1">{shop.name}</h1>
              </div>
              <ShopPlaque shopNumber={shop.shopNumber} floor={shop.floor?.label} />
            </div>

            {shop.aboutBusiness ? <p className="mt-4 text-sm text-ink-soft max-w-lg">{shop.aboutBusiness}</p> : null}
            {shop.openingHours ? (
              <p className="text-sm text-ink-soft mt-2">🕒 {shop.openingHours}</p>
            ) : null}

            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 mt-5 bg-signal-500 hover:bg-signal-600 transition-colors text-white text-sm font-medium rounded-xl px-4 py-2.5"
              >
                💬 Chat on WhatsApp
              </a>
            ) : null}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="text-lg font-semibold mt-10 mb-4">Products</h2>
        </Reveal>
        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {shop.products.map((p) => (
            <RevealItem key={p.id}>
              <div className="card card-interactive p-5 h-full">
                <p className="font-medium">{p.name}</p>
                {p.brand ? <p className="text-xs text-ink-soft mt-0.5">{p.brand}</p> : null}
                <p className="text-xl font-semibold font-tabular mt-2">
                  KSh {Number(p.price).toLocaleString()}
                </p>
                {p.description ? <p className="text-sm text-ink-soft mt-2">{p.description}</p> : null}
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
        {!shop.products.length ? (
          <div className="card p-8 text-center">
            <p className="text-ink-soft text-sm">No products listed yet.</p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
