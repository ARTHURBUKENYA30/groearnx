import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AssetsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main style={{ minHeight: "100vh", background: "#0d0d0d", color: "#f2f0e9", padding: "40px 22px", fontFamily: "DM Sans, system-ui, sans-serif" }}>
      <div style={{ width: "min(760px, 100%)", margin: "0 auto" }}>
        <Link href="/dashboard" style={{ color: "#c9a64f", fontSize: 13 }}>← Back to dashboard</Link>
        <p style={{ color: "#c9a64f", fontSize: 11, letterSpacing: 2, marginTop: 34 }}>GROEANRX · TEST ENVIRONMENT</p>
        <h1 style={{ fontSize: 32, margin: "8px 0" }}>Assets & balances</h1>
        <p style={{ color: "#aaa", lineHeight: 1.7 }}>This page shows the status of your test trading account. It does not represent real funds, deposits, withdrawals, or investment returns.</p>
        <section style={{ border: "1px solid #333", borderRadius: 14, padding: 22, marginTop: 26, background: "#141414" }}>
          <h2 style={{ fontSize: 17, marginTop: 0 }}>Binance Spot Testnet</h2>
          <p style={{ color: "#aaa", lineHeight: 1.7 }}>No live-money account is connected to GROEANRX. Connect and verify a Binance Spot Testnet API key in Bot Controls to begin test-account verification. Keep withdrawals disabled on the API key.</p>
          <Link href="/dashboard?tab=bots#bot-controls" style={{ display: "inline-block", marginTop: 8, background: "#c9a64f", color: "#171717", borderRadius: 9, padding: "11px 15px", fontWeight: 700 }}>Open Bot Controls</Link>
        </section>
        <section style={{ border: "1px solid #333", borderRadius: 14, padding: 22, marginTop: 16 }}>
          <h2 style={{ fontSize: 17, marginTop: 0 }}>Safety status</h2>
          <ul style={{ color: "#aaa", lineHeight: 2, paddingLeft: 20 }}>
            <li>Real-money trading: disabled</li>
            <li>Deposits and withdrawals: unavailable</li>
            <li>Testnet balance: not yet verified</li>
            <li>Test BUY/SELL execution: pending authenticated Testnet connection</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
