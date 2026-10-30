import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminDb } from "@/lib/trading/binance";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function userId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}
export async function GET() {
  const id = await userId();
  if (!id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const db = adminDb();
  const [{ data: settings }, { data: events }, { data: orders }] = await Promise.all([
    db.from("bot_settings").select("enabled,mode,symbol,quote_order_qty,max_daily_loss_usdt,stop_loss_pct,take_profit_pct,updated_at").eq("user_id", id).maybeSingle(),
    db.from("bot_events").select("id,level,event,details,created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(20),
    db.from("bot_orders").select("id,symbol,side,quantity,quote_quantity,status,mode,created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(20),
  ]);
  return NextResponse.json({ settings, events: events ?? [], orders: orders ?? [] });
}
export async function PUT(request: Request) {
  const id = await userId();
  if (!id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  try {
    const b = await request.json();
    const symbol = typeof b.symbol === "string" ? b.symbol.toUpperCase() : "BTCUSDT";
    const amount = Number(b.quote_order_qty ?? 10);
    const dailyLoss = Number(b.max_daily_loss_usdt ?? 5);
    const stop = Number(b.stop_loss_pct ?? 1);
    const take = Number(b.take_profit_pct ?? 2);
    if (!/^[A-Z0-9]{5,20}$/.test(symbol)) throw new Error("Enter a valid symbol such as BTCUSDT.");
    if (!Number.isFinite(amount) || amount < 5 || amount > 100000) throw new Error("Order size must be between 5 and 100,000 USDT.");
    if (!Number.isFinite(dailyLoss) || dailyLoss < 1 || dailyLoss > 100000) throw new Error("Daily loss limit must be between 1 and 100,000 USDT.");
    if (!Number.isFinite(stop) || stop < 0.1 || stop > 10 || !Number.isFinite(take) || take < 0.1 || take > 30) throw new Error("Stop-loss must be 0.1–10%; take-profit must be 0.1–30%.");
    const db = adminDb();
    const { error } = await db.from("bot_settings").upsert({
      user_id: id, enabled: false, mode: "testnet", symbol, quote_order_qty: amount,
      max_daily_loss_usdt: dailyLoss, stop_loss_pct: stop, take_profit_pct: take, updated_at: new Date().toISOString(),
    });
    if (error) throw new Error("Could not save bot settings.");
    await db.from("bot_events").insert({ user_id: id, level: "info", event: "Bot settings saved (testnet; stopped)" });
    return NextResponse.json({ saved: true, enabled: false, mode: "testnet" });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Invalid bot settings." }, { status: 400 }); }
}
export async function POST() {
  const id = await userId();
  if (!id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const db = adminDb();
  await db.from("bot_settings").upsert({ user_id: id, enabled: false, mode: "testnet", updated_at: new Date().toISOString() });
  await db.from("bot_events").insert({ user_id: id, level: "warning", event: "Bot start blocked: automatic execution worker is not installed; live trading is disabled" });
  return NextResponse.json({ error: "The bot is safely stopped. Background execution must be installed and verified before it can start." }, { status: 409 });
}
export async function DELETE() {
  const id = await userId();
  if (!id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const db = adminDb();
  const { error } = await db.from("bot_settings").upsert({ user_id: id, enabled: false, mode: "testnet", updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: "Could not stop bot." }, { status: 500 });
  await db.from("bot_events").insert({ user_id: id, level: "warning", event: "Emergency stop requested" });
  return NextResponse.json({ enabled: false, stopped: true });
}
