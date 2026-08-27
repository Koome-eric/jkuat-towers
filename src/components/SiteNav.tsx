"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { VendorAuthLinks } from "@/components/VendorAuthLinks";

const NAV_LINKS = [
  { href: "/shops", label: "Browse Shops" },
  { href: "/search", label: "Browse Products" },
  { href: "/onboard", label: "Become a Vendor" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/contact", label: "Contact Us" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-line">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2 shrink-0" onClick={() => setOpen(false)}>
          <span className="font-display font-semibold text-[15px] tracking-tight text-ink">JKUAT TOWERS</span>
          <span className="hidden sm:inline text-[10px] font-tabular tracking-widest uppercase text-ink-soft">
            Nairobi CBD
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-[13.5px] font-medium transition-colors ${
                  active ? "text-ink" : "text-ink-soft hover:text-ink"
                }`}
              >
                {link.label}
                {active ? (
                  <span className="absolute -bottom-[19px] left-0 right-0 h-[2px] bg-signal-500 rounded-full" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-5">
          <VendorAuthLinks />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden -mr-2 p-2 text-ink"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open ? (
        <div className="md:hidden border-t border-line bg-white px-6 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between py-2.5 text-[15px] font-medium text-ink border-b border-line last:border-0"
            >
              {link.label}
              <ArrowUpRight size={15} className="text-ink-soft" />
            </Link>
          ))}
          <div className="pt-3">
            <VendorAuthLinks />
          </div>
        </div>
      ) : null}
    </header>
  );
}
