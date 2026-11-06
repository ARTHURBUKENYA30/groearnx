import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Middleware must never take the entire site down if auth configuration
    // is temporarily unavailable. Protected pages still perform their own
    // server-side authorization checks.
    if (!url || !key) {
      return response;
    }

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(values) {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          values.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.warn("[auth-middleware] Session lookup returned an error:", error.message);
    }

    const path = request.nextUrl.pathname;
    if (user && (path === "/login" || path === "/signup")) {
      const destination = request.nextUrl.clone();
      destination.pathname = "/dashboard";
      return NextResponse.redirect(destination);
    }

    return response;
  } catch (error) {
    // Keep public pages available during transient Supabase/network failures.
    // Do not log cookies, tokens, or environment variable values.
    console.error(
      "[auth-middleware] Session refresh failed:",
      error instanceof Error ? error.message : "Unknown middleware error",
    );
    return NextResponse.next({ request });
  }
}
