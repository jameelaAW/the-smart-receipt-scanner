import { getVisitorId } from "@/lib/visitor";
import { getSubscriptionForUser, isPro } from "@/lib/subscription";
import { UpgradeButton } from "@/components/UpgradeButton";

export async function Header() {
  const visitorId = await getVisitorId();
  const subscription = await getSubscriptionForUser(visitorId);
  const pro = isPro(subscription);

  return (
    <header className="mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          🧾 Smart Receipt Scanner
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Snap a receipt, let AI file the expense, correct anything it gets wrong.
        </p>
      </div>

      {pro ? (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white">
          ⭐ Pro
        </span>
      ) : (
        <UpgradeButton />
      )}
    </header>
  );
}
