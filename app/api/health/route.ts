import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const healthy = supabaseConfigured;

  return NextResponse.json(
    {
      ok: healthy,
      service: "groearnx-web",
      status: healthy ? "ready" : "degraded",
      checks: {
        web: "ok",
        supabase_environment: supabaseConfigured ? "configured" : "missing",
      },
      note: "This endpoint checks web-process readiness and Supabase environment configuration only. It does not verify database access, email delivery, worker execution, Binance connectivity, or trading safety.",
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
