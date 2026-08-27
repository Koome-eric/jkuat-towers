import { MapPin, Mail, MessageCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal } from "@/components/Reveal";
import { ContactForm } from "./ContactForm";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const building = await prisma.building.findFirst({ select: { name: true, address: true } });

  return (
    <main className="min-h-screen">
      <SiteNav />

      <section className="bg-ink text-white">
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-14 sm:pt-20 sm:pb-16">
          <p className="text-[11px] tracking-widest uppercase text-white/40">Get in touch</p>
          <h1 className="text-3xl sm:text-4xl font-semibold mt-2">Contact us</h1>
          <p className="text-white/60 mt-3 max-w-lg text-[15px] leading-relaxed">
            Questions about the directory, a shop listing, or something that isn&apos;t working right — we read
            every message.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-14 sm:py-16 grid md:grid-cols-[1fr_380px] gap-10">
        <Reveal>
          <ContactForm />
        </Reveal>

        <Reveal delay={0.05}>
          <div className="flex flex-col gap-4">
            <InfoCard
              icon={MapPin}
              title="Visit us"
              body={building?.address || "Nairobi CBD, Kenya"}
            />
            <InfoCard
              icon={Mail}
              title="Email"
              body="hello@jkuattowers.com"
            />
            <InfoCard
              icon={MessageCircle}
              title="Vendor support"
              body="Already listed? Message us from your dashboard's AI Business Brain, or reach your account manager directly."
            />
          </div>
        </Reveal>
      </section>

      <SiteFooter buildingAddress={building?.address} />
    </main>
  );
}

function InfoCard({ icon: Icon, title, body }: { icon: typeof MapPin; title: string; body: string }) {
  return (
    <div className="card p-5 flex items-start gap-3.5">
      <div className="w-9 h-9 rounded-lg bg-paper flex items-center justify-center text-ink-soft shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <p className="font-medium text-[15px]">{title}</p>
        <p className="text-sm text-ink-soft mt-0.5 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
