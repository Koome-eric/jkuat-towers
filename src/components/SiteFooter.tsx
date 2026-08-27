import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function SiteFooter({ buildingAddress }: { buildingAddress?: string | null }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-white mt-24">
      <div className="max-w-5xl mx-auto px-6 py-16 grid sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div className="md:col-span-1">
          <p className="font-display font-semibold text-[15px] tracking-tight">JKUAT TOWERS</p>
          <p className="text-sm text-white/55 mt-3 max-w-[28ch] leading-relaxed">
            Every independent shop in the building, listed in one place — search it, message it, walk over.
          </p>
          {buildingAddress ? (
            <p className="text-xs font-tabular text-white/40 mt-4">{buildingAddress}</p>
          ) : null}
        </div>

        <FooterColumn
          title="Marketplace"
          links={[
            { href: "/shops", label: "Browse Shops" },
            { href: "/search", label: "Browse Products" },
            { href: "/assistant", label: "Ask the AI" },
          ]}
        />
        <FooterColumn
          title="Vendors"
          links={[
            { href: "/onboard", label: "Become a Vendor" },
            { href: "/sign-in", label: "Vendor sign in" },
            { href: "/dashboard", label: "Vendor dashboard" },
          ]}
        />
        <FooterColumn
          title="Company"
          links={[
            { href: "/how-it-works", label: "How It Works" },
            { href: "/contact", label: "Contact Us" },
          ]}
        />
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col sm:flex-row gap-2 justify-between text-xs text-white/40 font-tabular">
          <span>© {year} JKUAT Towers Commerce Network</span>
          <span>Nairobi CBD, Kenya</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-[11px] tracking-widest uppercase text-white/40">{title}</p>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group inline-flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors"
            >
              {l.label}
              <ArrowUpRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
