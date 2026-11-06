import { NextResponse, type NextRequest } from "next/server";

/**
 * Availability hotfix:
 * Keep requests flowing while Supabase session refresh in middleware is
 * investigated. Protected routes must continue to enforce authorization
 * in their server components/actions.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
