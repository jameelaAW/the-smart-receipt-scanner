"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function AuthStatus({ email }: { email: string | null }) {
  if (!email) {
    return (
      <Link href="/login" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-neutral-500">
      <span className="max-w-[140px] truncate">{email}</span>
      <button
        onClick={async () => {
          const supabase = createClient();
          await supabase.auth.signOut();
          window.location.href = "/";
        }}
        className="font-medium text-neutral-600 hover:text-neutral-900"
      >
        Sign out
      </button>
    </div>
  );
}
