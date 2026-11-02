import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function forwardTradingRequest(request: Request, action: "bot" | "connection") {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !anon) return NextResponse.json({ error: "Trading service is not configured." }, { status: 503 });

  const method = request.method;
  const body = method === "GET" || method === "DELETE" ? undefined : await request.text();
  try {
    const response = await fetch(base.replace(/\/$/, "") + "/functions/v1/groearnx-trading?action=" + action, {
      method,
      headers: {
        apikey: anon,
        Authorization: "Bearer " + session.access_token,
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const data = await response.json().catch(() => ({ error: "Trading service returned an invalid response." }));
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: "Trading service is temporarily unavailable. Please try again." }, { status: 503 });
  }
}
