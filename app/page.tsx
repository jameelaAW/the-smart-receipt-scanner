import { getCategories, getReceipts } from "@/lib/receipts";
import { createClient } from "@/lib/supabase/server";
import { getVisitorId } from "@/lib/visitor";
import { getSubscriptionForUser, isPro } from "@/lib/subscription";
import { FREE_SCAN_LIMIT, scansThisMonth } from "@/lib/scanLimit";
import { ReceiptsApp } from "@/components/ReceiptsApp";
import { Header } from "@/components/Header";

export default async function Home() {
  const [categories, receipts] = await Promise.all([getCategories(), getReceipts()]);

  const visitorId = await getVisitorId();
  const subscription = await getSubscriptionForUser(visitorId);
  let uploadDisabled = false;
  if (visitorId && !isPro(subscription)) {
    const supabase = await createClient();
    const used = await scansThisMonth(supabase, visitorId);
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
      />
    </main>
  );
}
