"use client";

import { useState } from "react";

export function UpgradeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        if (json.signUpRequired) {
          window.location.href = "/login";
          return;
        }
        setError(json.error ?? "Couldn't start checkout");
        setLoading(false);
        return;
      }
      window.location.href = json.url;
    } catch {
      setError("Couldn't start checkout — try again");
      setLoading(false);
    }
  }

  return (
    <div className="text-right">
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Redirecting…" : "Upgrade to Pro"}
      </button>
      {error && <p className="mt-1 max-w-[220px] text-xs text-red-600">{error}</p>}
    </div>
  );
}
