import { getCategories, getReceipts } from "@/lib/receipts";
import { createClient } from "@/lib/supabase/server";
import { getIdentity } from "@/lib/identity";
import { getSubscriptionForUser, isPro } from "@/lib/subscription";
import { FREE_SCAN_LIMIT, scansThisMonth } from "@/lib/scanLimit";
import { ReceiptsApp } from "@/components/ReceiptsApp";
import { Header } from "@/components/Header";

export default async function Home() {
  const [categories, receipts] = await Promise.all([getCategories(), getReceipts()]);

  const { userId, isAuthenticated } = await getIdentity();
  const subscription = await getSubscriptionForUser(userId);
  let uploadDisabled = false;
  if (isAuthenticated && userId && !isPro(subscription)) {
    const supabase = await createClient();
    const used = await scansThisMonth(supabase, userId);
    uploadDisabled = used >= FREE_SCAN_LIMIT;
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Header />

      <ReceiptsApp
        initialReceipts={receipts}
        categories={categories}
        uploadDisabled={uploadDisabled}
        uploadDisabledReason="You've used your 5 free scans — upgrade to continue"
        signInRequired={!isAuthenticated}
      />
    </main>
  );
}
