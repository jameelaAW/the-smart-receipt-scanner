import { getVisitorId } from "@/lib/visitor";
import { getSubscriptionForUser, isPro } from "@/lib/subscription";
import { SuccessStatus } from "@/components/SuccessStatus";

export default async function SuccessPage() {
  const visitorId = await getVisitorId();
  const subscription = await getSubscriptionForUser(visitorId);

  return <SuccessStatus initialIsPro={isPro(subscription)} />;
}
