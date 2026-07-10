import { getVisitorId } from "@/lib/visitor";
import { getSubscriptionForUser, isPro } from "@/lib/subscription";
import { NextResponse } from "next/server";

export async function GET() {
  const visitorId = await getVisitorId();
  const subscription = await getSubscriptionForUser(visitorId);
  return NextResponse.json({ subscription, isPro: isPro(subscription) });
}
