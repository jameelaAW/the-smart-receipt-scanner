"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/** Polls briefly for the webhook to land — TEST_PLAN.md: "Pro badge appears
 *  without manual refresh (webhook fired)". Stripe redirects here right after
 *  checkout, sometimes a beat before the webhook has been processed. */
export function SuccessStatus({ initialIsPro }: { initialIsPro: boolean }) {
  const [pro, setPro] = useState(initialIsPro);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (pro || attempts >= 8) return;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/subscription");
        const json = await res.json();
        if (json.isPro) setPro(true);
      } finally {
        setAttempts((a) => a + 1);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [pro, attempts]);

  return (
    <main className="mx-auto max-w-xl px-6 py-16 text-center">
      {pro ? (
        <>
          <p className="text-4xl">🎉</p>
          <h1 className="mt-3 text-xl font-bold text-neutral-900">You&apos;re Pro!</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Unlimited scans are unlocked. Your subscription is active.
          </p>
        </>
      ) : (
        <>
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
          <h1 className="mt-3 text-xl font-bold text-neutral-900">Payment received</h1>
          <p className="mt-1 text-sm text-neutral-500">Activating your subscription&hellip;</p>
        </>
      )}
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
      >
        Back to receipts
      </Link>
    </main>
  );
}
