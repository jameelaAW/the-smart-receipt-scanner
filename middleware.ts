import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { VISITOR_COOKIE } from "@/lib/visitor";

export async function middleware(request: NextRequest) {
  if (!request.cookies.get(VISITOR_COOKIE)) {
    request.cookies.set(VISITOR_COOKIE, crypto.randomUUID());
  }
  const visitorId = request.cookies.get(VISITOR_COOKIE)!.value;

  const response = await updateSession(request);

  response.cookies.set(VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
