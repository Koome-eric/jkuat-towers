import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getBusinessSummary } from "@/lib/vendor-brain";
import { ShopPlaque } from "@/components/ShopPlaque";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import ProductManager from "./ProductManager";
import BrainChat from "./BrainChat";
import StorefrontSettings from "./StorefrontSettings";
import ClaimDashboardBanner from "./ClaimDashboardBanner";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { token } = await params;
  const { welcome } = await searchParams;

  const shop = await prisma.shop.findUnique({
    where: { dashboardToken: token },
    include: { products: { orderBy: { name: "asc" } }, floor: true },
  });

  if (!shop) return notFound();

  // If this shop has been claimed by a vendor account, only that account
  // may view it — send anyone else to sign in. Unclaimed (legacy/seeded)
  // shops stay reachable by token alone, but we prompt the signed-in
  // vendor to claim it below so /dashboard resolves here going forward.
  const { userId } = await auth();
  if (shop.clerkUserId) {
    if (shop.clerkUserId !== userId) redirect(`/sign-in?redirect_url=/dashboard/${token}`);
  }

  const summary = await getBusinessSummary(shop.id);

  return (
    <main className="min-h-screen bg-paper">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {!shop.clerkUserId && userId ? <ClaimDashboardBanner dashboardToken={token} /> : null}

        {welcome ? (
          <Reveal>
            <div className="bg-signal-50 border border-signal-100 text-signal-900 text-sm rounded-xl px-4 py-3 mb-4">
              🎉 Your shop is live! Bookmark this dashboard link — it&apos;s how you&apos;ll manage {shop.name}.
              Your public storefront is at{" "}
              <Link href={`/shops/${shop.slug}`} className="underline font-medium">
                /shops/{shop.slug}
              </Link>
              .
            </div>
          </Reveal>
        ) : null}

        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-semibold">{shop.name}</h1>
                <ShopPlaque shopNumber={shop.shopNumber} floor={shop.floor?.label} />
              </div>
              <p className="text-sm text-ink-soft mt-1">{shop.category}</p>
            </div>
            <Link href={`/shops/${shop.slug}`} className="btn-secondary text-sm">
              View storefront →
            </Link>
          </div>
        </Reveal>

        <RevealGroup className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <RevealItem>
            <StatCard label="Revenue (completed)" value={summary.totalRevenue} prefix="KSh " />
          </RevealItem>
          <RevealItem>
            <StatCard label="Orders" value={summary.totalOrders} sub={`${summary.pendingOrders} pending`} />
          </RevealItem>
          <RevealItem>
            <StatCard label="Products" value={summary.productCount} />
          </RevealItem>
          <RevealItem>
            <StatCard label="Customers" value={summary.customerCount} />
          </RevealItem>
        </RevealGroup>

        {summary.lowStockProducts.length ? (
          <Reveal delay={0.1}>
            <div className="bg-amber-50 border border-amber-500/20 text-amber-700 text-sm rounded-xl px-4 py-3 mt-4">
              ⚠️ Low stock: {summary.lowStockProducts.map((p) => `${p.name} (${p.stock})`).join(", ")}
            </div>
          </Reveal>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Reveal delay={0.1}>
            <ProductManager
              dashboardToken={token}
              initialProducts={shop.products.map((p) => ({
                id: p.id,
                name: p.name,
                price: Number(p.price),
                stock: p.stock,
                category: p.category,
                isActive: p.isActive,
              }))}
            />
          </Reveal>
          <Reveal delay={0.15}>
            <BrainChat dashboardToken={token} />
          </Reveal>
        </div>

        <div className="mt-6">
          <Reveal delay={0.2}>
            <StorefrontSettings dashboardToken={token} slug={shop.slug} initialThemeColor={shop.themeColor} />
          </Reveal>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, sub, prefix }: { label: string; value: number; sub?: string; prefix?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="text-lg font-semibold mt-1">
        <AnimatedNumber value={value} prefix={prefix} />
      </p>
      {sub ? <p className="text-xs text-neutral-400 mt-0.5 font-tabular">{sub}</p> : null}
    </div>
  );
}
