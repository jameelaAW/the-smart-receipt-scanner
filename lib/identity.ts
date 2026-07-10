import { createClient } from "@/lib/supabase/server";
import { getVisitorId } from "@/lib/visitor";

/**
 * Real signed-in user (auth.uid()) when present, otherwise the anonymous
 * visitor-id cookie used pre-lockdown. TASKS.md Sprint 4 gates scanning to
 * signed-in users only, but reads still fall back to the visitor id so
 * layout/header code doesn't need two code paths.
 */
export async function getIdentity(): Promise<{
  userId: string | null;
  isAuthenticated: boolean;
  email: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return { userId: user.id, isAuthenticated: true, email: user.email ?? null };
  }

  const visitorId = await getVisitorId();
  return { userId: visitorId, isAuthenticated: false, email: null };
}
