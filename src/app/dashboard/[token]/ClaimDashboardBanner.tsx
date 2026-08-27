"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClaimDashboardBanner({ dashboardToken }: { dashboardToken: string }) {
  const router = useRouter();
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function claim() {
    setClaiming(true);
    setError(null);
    const res = await fetch(`/api/dashboard/${dashboardToken}/claim`, { method: "POST" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? "Couldn't claim this dashboard.");
      setClaiming(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="bg-signal-50 border border-signal-100 text-signal-900 text-sm rounded-xl px-4 py-3 mb-4 flex flex-wrap items-center justify-between gap-3">
      <span>
        This dashboard isn&apos;t linked to your account yet. Claim it so <strong>/dashboard</strong> always brings
        you straight here.
      </span>
      <div className="flex items-center gap-3 shrink-0">
        {error ? <span className="text-red-600 text-xs">{error}</span> : null}
        <button onClick={claim} disabled={claiming} className="btn-primary text-xs px-3 py-1.5 disabled:opacity-60">
          {claiming ? "Claiming…" : "Claim this dashboard"}
        </button>
      </div>
    </div>
  );
}
