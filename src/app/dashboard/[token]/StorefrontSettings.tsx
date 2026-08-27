"use client";

import { useState } from "react";
import { THEME_SWATCHES } from "@/lib/templates";

export default function StorefrontSettings({
  dashboardToken,
  slug,
  initialThemeColor,
}: {
  dashboardToken: string;
  slug: string;
  initialThemeColor: string | null;
}) {
  const [themeColor, setThemeColor] = useState<string | null>(initialThemeColor);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(next: string | null) {
    setThemeColor(next);
    setSaving(true);
    setSaved(false);
    await fetch(`/api/dashboard/${dashboardToken}/shop`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ themeColor: next }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold">Storefront theme</h2>
        {saving ? (
          <span className="text-xs text-ink-soft">Saving…</span>
        ) : saved ? (
          <span className="text-xs text-signal-600">Saved</span>
        ) : null}
      </div>
      <p className="text-sm text-ink-soft mt-1">
        Pick the accent color for your public storefront — buttons, prices, and highlights use it.
      </p>

      <div className="flex flex-wrap gap-2.5 mt-4">
        {THEME_SWATCHES.map((s) => (
          <button
            key={s.value}
            type="button"
            title={s.label}
            aria-label={s.label}
            onClick={() => save(s.value)}
            className="w-8 h-8 rounded-full shrink-0 transition-transform hover:scale-110"
            style={{
              background: s.value,
              boxShadow:
                themeColor === s.value
                  ? "0 0 0 2px white, 0 0 0 4px var(--color-ink)"
                  : "0 0 0 1px rgba(0,0,0,0.08)",
            }}
          />
        ))}

        <label
          className="w-8 h-8 rounded-full shrink-0 cursor-pointer relative overflow-hidden"
          style={{
            background: themeColor ?? "conic-gradient(from 0deg, red, yellow, lime, cyan, blue, magenta, red)",
            boxShadow:
              themeColor && !THEME_SWATCHES.some((s) => s.value === themeColor)
                ? "0 0 0 2px white, 0 0 0 4px var(--color-ink)"
                : "0 0 0 1px rgba(0,0,0,0.08)",
          }}
          title="Custom color"
        >
          <input
            type="color"
            value={themeColor ?? "#3452ff"}
            onChange={(e) => save(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-line">
        <button
          type="button"
          onClick={() => save(null)}
          className="text-xs text-ink-soft hover:text-ink transition-colors"
        >
          Reset to template default
        </button>
        <a href={`/shops/${slug}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-signal-600 hover:text-signal-700">
          Preview storefront →
        </a>
      </div>
    </div>
  );
}
