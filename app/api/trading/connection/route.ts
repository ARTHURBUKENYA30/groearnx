import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminDb, decryptSecret, encryptSecret, verifyBinance } from "@/lib/trading/binance";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function currentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const db = adminDb();
  const [{ data: connection }, { data: settings }] = await Promise.all([
    db.from("exchange_credentials").select("exchange,environment,last_verified_at,created_at").eq("user_id", user.id).maybeSingle(),
    db.from("bot_settings").select("enabled,mode,symbol,quote_order_qty,max_daily_loss_usdt,stop_loss_pct,take_profit_pct").eq("user_id", user.id).maybeSingle(),
  ]);
  return NextResponse.json({ connected: Boolean(connection), connection, settings: settings ?? null });
}
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  try {
    const body = await request.json();
    const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
    const apiSecret = typeof body.apiSecret === "string" ? body.apiSecret.trim() : "";
    if (apiKey.length < 20 || apiKey.length > 128 || apiSecret.length < 20 || apiSecret.length > 128) {
      return NextResponse.json({ error: "Enter a valid Binance Spot Testnet API key and secret." }, { status: 400 });
    }
    await verifyBinance(apiKey, apiSecret);
    const db = adminDb();
    const { error } = await db.from("exchange_credentials").upsert({
      user_id: user.id, exchange: "binance", environment: "testnet",
      api_key_ciphertext: encryptSecret(apiKey), api_secret_ciphertext: encryptSecret(apiSecret),
      last_verified_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    });
    if (error) throw new Error("Could not securely save the exchange connection.");
    await db.from("bot_events").insert({ user_id: user.id, level: "info", event: "Binance Spot Testnet connected" });
    return NextResponse.json({ connected: true, environment: "testnet", message: "Testnet account verified and credentials encrypted." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Connection failed." }, { status: 400 });
  }
}
export async function DELETE() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const db = adminDb();
  await db.from("bot_settings").upsert({ user_id: user.id, enabled: false, mode: "testnet", updated_at: new Date().toISOString() });
  const { error } = await db.from("exchange_credentials").delete().eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "Could not disconnect exchange." }, { status: 500 });
  await db.from("bot_events").insert({ user_id: user.id, level: "warning", event: "Exchange disconnected; bot disabled" });
  return NextResponse.json({ connected: false, enabled: false });
}
