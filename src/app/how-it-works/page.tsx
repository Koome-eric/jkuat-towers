import Link from "next/link";
import { Search, MessageCircle, Store, Sparkles, PackagePlus, Rocket, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { FaqAccordion } from "./FaqAccordion";

export const dynamic = "force-dynamic";

const CUSTOMER_STEPS = [
  { icon: Search, title: "Search or ask the AI", body: "Type what you're after in the search bar, or message the AI assistant on the site or WhatsApp — it searches every shop in the building at once." },
  { icon: MessageCircle, title: "Compare and message", body: "See the price, shop name, and exact location (floor + shop number) for every match. Message the vendor directly on WhatsApp with questions." },
  { icon: Store, title: "Walk over and buy it", body: "The vendor already knows what you're after. Head to their shop, try it on or check it over, and pay in person." },
];

const VENDOR_STEPS = [
  { icon: PackagePlus, title: "List your shop, free", body: "Sign up, tell us your shop name, category, and location in the building — takes about a minute, no fees." },
  { icon: Sparkles, title: "Add products & pick a theme", body: "List what you sell with prices and stock counts. Choose an accent color for your public storefront page from your dashboard." },
  { icon: Rocket, title: "Get discovered building-wide", body: "Your products show up in building-wide search and the AI assistant — including WhatsApp — with a link straight to your storefront." },
];

const FAQS = [
  {
    q: "Is it free to list my shop?",
    a: "Yes. Creating a vendor account and listing your shop and products is free.",
  },
  {
    q: "Do customers pay through the app?",
    a: "No — JKUAT Towers is a discovery and communication layer. Customers message you on WhatsApp and pay you directly, in person or however you already accept payment.",
  },
  {
    q: "How does the AI assistant know about my products?",
    a: "It searches the exact product list and prices in your dashboard — nothing is invented. Whatever you add there is what customers see, on the site and on WhatsApp.",
  },
  {
    q: "Can I change how my storefront looks?",
    a: "Every shop gets a storefront page styled for its category, and you can pick your own accent color from your dashboard at any time.",
  },
];

export default async function HowItWorksPage() {
  const building = await prisma.building.findFirst({ select: { address: true } });

  return (
    <main className="min-h-screen">
      <SiteNav />

      <section className="bg-ink text-white">
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-14 sm:pt-20 sm:pb-16">
          <p className="text-[11px] tracking-widest uppercase text-white/40">Guide</p>
          <h1 className="text-3xl sm:text-4xl font-semibold mt-2">How JKUAT Towers works</h1>
          <p className="text-white/60 mt-3 max-w-lg text-[15px] leading-relaxed">
            One directory, two sides — shoppers finding things fast, vendors getting found. Here&apos;s exactly
            how each works.
          </p>
        </div>
      </section>

      {/* Customers -------------------------------------------------------- */}
      <section className="max-w-5xl mx-auto px-6 py-14 sm:py-16">
        <Reveal>
          <p className="text-[11px] tracking-widest uppercase text-signal-600 font-medium">For customers</p>
          <h2 className="text-xl sm:text-2xl font-semibold mt-1.5">Find it, then go get it</h2>
        </Reveal>
        <RevealGroup className="grid sm:grid-cols-3 gap-5 mt-7" stagger={0.06}>
          {CUSTOMER_STEPS.map(({ icon: Icon, title, body }, i) => (
            <RevealItem key={title}>
              <div className="card p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-lg bg-signal-50 flex items-center justify-center text-signal-600">
                    <Icon size={17} />
                  </div>
                  <span className="font-tabular text-xs text-ink-soft/60">0{i + 1}</span>
                </div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">{body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
        <Reveal delay={0.1}>
          <div className="flex flex-wrap gap-3 mt-7">
            <Link href="/search" className="btn-primary bg-signal-500 hover:bg-signal-600">
              Browse products
            </Link>
            <Link href="/assistant" className="btn-ai">
              Ask the AI
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Vendors ------------------------------------------------------------ */}
      <section className="bg-paper border-y border-line">
        <div className="max-w-5xl mx-auto px-6 py-14 sm:py-16">
          <Reveal>
            <p className="text-[11px] tracking-widest uppercase text-violet-600 font-medium">For vendors</p>
            <h2 className="text-xl sm:text-2xl font-semibold mt-1.5">List once, get found everywhere</h2>
          </Reveal>
          <RevealGroup className="grid sm:grid-cols-3 gap-5 mt-7" stagger={0.06}>
            {VENDOR_STEPS.map(({ icon: Icon, title, body }, i) => (
              <RevealItem key={title}>
                <div className="card p-6 h-full bg-surface">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                      <Icon size={17} />
                    </div>
                    <span className="font-tabular text-xs text-ink-soft/60">0{i + 1}</span>
                  </div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">{body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
          <Reveal delay={0.1}>
            <Link href="/onboard" className="btn-primary inline-flex items-center gap-1.5 mt-7">
              List your shop free <ArrowRight size={15} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* FAQ ------------------------------------------------------------------ */}
      <section className="max-w-5xl mx-auto px-6 py-14 sm:py-16">
        <Reveal>
          <h2 className="text-xl sm:text-2xl font-semibold mb-6">Common questions</h2>
        </Reveal>
        <FaqAccordion items={FAQS} />
      </section>

      <SiteFooter buildingAddress={building?.address} />
    </main>
  );
}
