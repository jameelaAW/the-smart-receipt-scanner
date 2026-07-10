import { cookies } from "next/headers";

export const VISITOR_COOKIE = "src_vid";

/**
 * Anonymous visitor id — a random uuid set in a cookie by middleware.ts.
 * v1 has no login wall (PRD), but Stripe subscriptions and the free-tier
 * scan limit (TASKS.md Sprint 3) still need a stable "who is this" per
 * browser until real auth lands in Sprint 4. It is NOT used to restrict
 * read access — v1 RLS stays permissive/shared (ARCHITECTURE.md).
 */
export async function getVisitorId(): Promise<string | null> {
  const store = await cookies();
  return store.get(VISITOR_COOKIE)?.value ?? null;
}
