import { getIdentity } from "@/lib/identity";
import { getSubscriptionForUser, isPro } from "@/lib/subscription";
import { UpgradeButton } from "@/components/UpgradeButton";
import { AuthStatus } from "@/components/AuthStatus";

export async function Header() {
  const { userId, email } = await getIdentity();
  const subscription = await getSubscriptionForUser(userId);
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

      <div className="flex shrink-0 flex-col items-end gap-2">
        {pro ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white">
            ⭐ Pro
          </span>
        ) : (
          <UpgradeButton />
        )}
        <AuthStatus email={email} />
      </div>
    </header>
  );
}
