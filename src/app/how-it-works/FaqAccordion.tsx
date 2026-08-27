"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="card divide-y divide-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 text-left px-5 py-4"
            >
              <span className="font-medium text-[15px]">{item.q}</span>
              <ChevronDown
                size={17}
                className={`shrink-0 text-ink-soft transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen ? (
              <div className="px-5 pb-4 -mt-1 text-sm text-ink-soft leading-relaxed max-w-2xl">{item.a}</div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
