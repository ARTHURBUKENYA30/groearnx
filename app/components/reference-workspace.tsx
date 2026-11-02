"use client";

import Link from "next/link";
import TradingControlPanel from "@/app/components/trading-control-panel";
import LiveMarketTable from "@/app/components/live-market-table";
import { useEffect, useState } from "react";
import {
  Activity, ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpRight, Bell,
  Bot, Check, ChevronDown, ChevronRight, CircleHelp, Copy, Eye, EyeOff,
  History, House, LockKeyhole, LogOut, Menu, Plus, Search, Settings,
  ShieldCheck, SlidersHorizontal, Star, TrendingDown, TrendingUp, UserRound,
  Wallet, Zap
} from "lucide-react";

type Tab = "home" | "trade" | "bots" | "manual" | "market" | "profile";
type BotSnapshot = { settings?: { enabled?: boolean; symbol?: string } | null; realizedPnl?: number; trades?: unknown[]; position?: { symbol: string; quantity: number } | null };
const nav: { id: Tab; label: string; icon: typeof House }[] = [
  { id: "home", label: "Home", icon: House },
  { id: "trade", label: "Trade", icon: Activity },
  { id: "bots", label: "Bots", icon: Bot },
  { id: "manual", label: "Manual", icon: SlidersHorizontal },
  { id: "market", label: "Market", icon: TrendingUp },
  { id: "profile", label: "Profile", icon: UserRound },
];
const markets = [
  ["ZEC/USDT", "42.18", "-2.65%"], ["PAXG/USDT", "3,408.08", "-0.86%"],
  ["DASH/USDT", "50.060", "-4.61%"], ["FF/USDT", "0.0961", "-0.39%"],
  ["NIGHT/USDT", "0.0084", "-3.36%"], ["CAKE/USDT", "2.0490", "-4.43%"],
  ["TUT/USDT", "0.0092", "-1.50%"], ["AVA/USDT", "0.3301", "-1.23%"],
  ["JST/USDT", "0.0415", "+0.21%"], ["AERO/USDT", "0.6465", "-2.12%"],
  ["ZK/USDT", "0.0570", "-1.77%"], ["DUSK/USDT", "0.0947", "+1.08%"],
  ["MUBARAK/USDT", "0.0505", "-1.24%"], ["APT/USDT", "1.420", "-0.65%"],
  ["LSK/USDT", "0.7735", "+2.39%"], ["GLM/USDT", "0.2274", "-1.55%"],
  ["LUMIA/USDT", "0.0838", "-0.78%"], ["TWT/USDT", "0.4431", "-0.50%"],
  ["VET/USDT", "0.0209", "-1.21%"], ["ALGO/USDT", "0.2023", "-1.67%"],
  ["STO/USDT", "0.1023", "-1.75%"], ["LIT/USDT", "0.0795", "+2.49%"],
  ["BTC/USDT", "88,002.03", "-1.10%"], ["ETH/USDT", "2,332.04", "-1.25%"],
  ["BNB/USDT", "640.70", "-2.09%"], ["SOL/USDT", "140.400", "-2.85%"],
  ["NEAR/USDT", "4.3940", "-1.50%"], ["XRP/USDT", "2.3899", "-2.44%"],
  ["PEPE/USDT", "0.00000942", "-1.21%"], ["DOGE/USDT", "0.1876", "-1.37%"],
];
const bots = [
  ["TRX Spot Momentum Bot", "SPOT · 5 MIN · AUTO", "Momentum strategy for spot markets"],
  ["TRX Sniper Bot", "FUTURES · 15 MIN · AUTO", "Trend and breakout monitoring"],
  ["TRX SmartFlow", "SPOT + FUTURES · MULTI SIGNAL", "Multi-signal strategy with risk controls"],
];
function Brand() { return <span className="rw-brand"><span className="rw-mark">G</span><b>GROEANRX</b></span>; }
function Exchange() { return <div className="rw-exchange"><button className="selected">◈ Binance</button><button>Spot Testnet</button><button aria-label="Trading settings"><Settings size={13}/></button></div>; }
function MarketRows({ query = "" }: { query?: string }) {
  const filtered = markets.filter((m) => m[0].toLowerCase().includes(query.toLowerCase()));
  return <div className="rw-market-rows">{filtered.map((m, i) => <div className="rw-market-row" key={m[0]}>
    <span className="rw-star">☆</span><b>{m[0]}</b><span className="rw-price">${m[1]}</span>
    <span className={m[2].startsWith("+") ? "rw-change up" : "rw-change"}>{m[2]}</span><small>—</small>
  </div>)}</div>;
}
export default function ReferenceWorkspace({ activeTab, userName }: { activeTab: Tab; userName: string }) {
  const [query, setQuery] = useState("");
  const [showBalance, setShowBalance] = useState(true);
  const [side, setSide] = useState<"Long" | "Short">("Long");
  const [marketType, setMarketType] = useState<"Futures" | "Spot">("Futures");
  const [leverage, setLeverage] = useState("20x");
  const [notice, setNotice] = useState("");
  const tabTitle = nav.find((n) => n.id === activeTab)?.label ?? "Home";
  return <main className="rw-app">
    <header className="rw-topbar"><Brand/><div className="rw-top-actions"><Exchange/><button className="rw-icon-btn" aria-label="Notifications"><Bell size={15}/></button><button className="rw-icon-btn" aria-label="Menu"><Menu size={15}/></button></div></header>
    <div className="rw-content">
      {activeTab === "home" && <>
        <div className="rw-alert"><span>◎</span><div><b>Binance Spot Testnet only</b><small>Use test funds only. Connect your test account in the Bots tab.</small></div><ChevronRight size={15}/></div>
        <section className="rw-balance-card">
          <div className="rw-card-head"><small>TESTNET OVERVIEW <span>⌄</span></small><div className="rw-tabs"><button className="active">Spot Testnet</button><button>◎</button></div></div>
          <div className="rw-balances"><div><small>◉ REALIZED P/L</small><b className="rw-green">{showBalance ? (botSnapshot ? pnlLabel : "—") : "••••"}</b><small>{botSnapshot?.trades?.length ? "Recent recorded testnet trades" : "No testnet trades recorded yet"}</small></div><div><small>◉ ACCOUNT</small><b>{showBalance ? (botRunning ? "Bot running" : botSnapshot?.settings ? "Bot stopped" : "Not configured") : "••••"}</b><small>Manage connection in Bots</small></div></div>
          <div className="rw-money-actions"><Link href="/dashboard?tab=bots"><Plus size={14}/> Connect Testnet</Link><button disabled><LockKeyhole size={14}/> Withdrawals disabled</button></div>
          <div className="rw-mini-stats"><span>Environment <b>Testnet</b></span><span>Strategy <b>EMA 9/21</b></span><span>Live funds <b>Off</b></span><span>Bot <b>{botSnapshot ? (botRunning ? "Running" : "Stopped") : "—"}</b></span></div>
        </section>
        <section className="rw-auto-card"><div><b>Binance Spot Testnet Bot</b><small>One-minute EMA strategy with configurable risk limits.</small></div><span className="rw-switch"/><small>{botSnapshot ? (botRunning ? "Running" : "Stopped") : "—"}</small></section>
        <section className="rw-shortcuts">{[["Share","↗"],["Earning","⌁"],["Orders","◷"],["Charts","⌗"],["Assets","▣"],["Invite","♧"],["API","⌘"],["More","•••"]].map(([label, icon])=><button key={label}><b>{icon}</b><span>{label}</span></button>)}</section>
        <div className="rw-section-head"><b>Market Movers</b><span>See all <ChevronRight size={12}/></span></div>
        <section className="rw-panel">
          <div className="rw-market-tabs"><button className="active">Spot</button><button>Futures</button><Search size={14}/></div>
          <div className="rw-signal-banner"><span>◈</span><div><b>BINANCE PUBLIC MARKET DATA</b><small>Indicative prices; not trading signals</small></div></div>
          <LiveMarketTable variant="home"/>
        </section>
      </>}
      {activeTab === "trade" && <>
        <div className="rw-page-title"><h1>Trades <span className="rw-dot"/></h1><Link href="/dashboard?tab=manual" className="rw-gold-btn"><Plus size={13}/> New Trade</Link></div>
        <div className="rw-filter-pills"><button className="active">All</button><button>Futures</button><button>Spot</button></div>
        <div className="rw-open-close"><button className="active">Open <small>0</small></button><button>Closed <small>0</small></button></div>
        <div className="rw-empty"><span>◷</span><b>No open positions.</b><small>Place a trade to start</small><Link href="/dashboard?tab=manual">Place a trade</Link></div>
      </>}
      {activeTab === "bots" && <>
        <div className="rw-page-title"><div><h1>Testnet Trading Bot</h1><p>Connect Binance Spot Testnet and manage the real bot controls.</p></div></div>
        <div className="rw-warning"><b>TESTNET SAFETY</b><p>This build can submit orders only to Binance Spot Testnet. Use test funds, disable withdrawals on the API key, and do not enter live exchange credentials.</p></div>
        <TradingControlPanel/>
      </>}
      {activeTab === "manual" && <>
        <div className="rw-page-title"><Link href="/dashboard?tab=trade"><ArrowLeft size={17}/></Link><h1>Manual Trade</h1><span className="rw-funds-pill">Disabled <small>Testnet bot only</small></span></div><div className="rw-warning"><b>Manual order entry is not enabled</b><p>To test automated orders, open the Bots tab and connect a Binance Spot Testnet account. No Futures or live-money manual order endpoint is available.</p><Link href="/dashboard?tab=bots">Open testnet bot controls →</Link></div>
        <section className="rw-capital"><small>CAPITAL · FUTURES</small><h2>$0.00</h2><div><span>Max trades <b>$0.00</b></span><span>In use trades <b>$0.00</b></span><span>Available <b className="rw-green">$0.00</b></span></div></section>
        <div className="rw-futures-note"><b>FUTURES ACCOUNT</b><span>No active Futures API key · Sign in to bind one.</span></div>
        <div className="rw-label">QUICK PRESETS</div><div className="rw-presets">{["Scalp","Swing","Safe","Degen"].map(x=><button key={x}>{x}<small>Set preset</small></button>)}</div>
        <button className="rw-select-row"><span>◉</span> Select Pair <ChevronRight size={15}/></button>
        <div className="rw-side-toggle"><button className={side==="Long"?"long active":""} onClick={()=>setSide("Long")}>↗ Long</button><button className={side==="Short"?"short active":""} onClick={()=>setSide("Short")}>↘ Short</button></div>
        <div className="rw-three-tabs">{(["Futures","Spot","Market"] as const).map(x=><button key={x} className={marketType===x?"active":""} onClick={()=>setMarketType(x==="Market"?"Spot":x)}>{x}</button>)}</div>
        <div className="rw-label">LEVERAGE</div><div className="rw-leverage"><input type="range" min="1" max="125" defaultValue="20"/><b>{leverage}</b></div>
        <div className="rw-leverage-pills">{["1x","5x","10x","20x","50x","75x","125x"].map(x=><button className={leverage===x?"active":""} key={x} onClick={()=>setLeverage(x)}>{x}</button>)}</div>
        <div className="rw-label">MARGIN MODE</div><div className="rw-three-tabs"><button className="active">Cross</button><button>Isolated</button></div>
        <Exchange/>
        <div className="rw-amount-grid">{["10%","25%","50%","75%","100%"].map(x=><button key={x}>{x}</button>)}</div>
        <section className="rw-risk"><b>Risk Management</b><label><span>Take Profit</span><input type="checkbox" disabled/></label><label><span>Stop Loss</span><input type="checkbox" disabled/></label></section>
        <section className="rw-risk"><b>Pro Features</b><label><span>Smart Exit</span><input type="checkbox" disabled/></label><label><span>Smart DCA</span><input type="checkbox" disabled/></label></section>
        <div className="rw-warning">Select a trading pair to continue.</div><button className="rw-wide-gold" disabled>Place {side} Order</button>
        <button className="rw-history"><History size={13}/> MANUAL TRADE HISTORY</button>\n        
      </>}
      {activeTab === "market" && <>
        <div className="rw-page-title"><h1>Markets</h1><Search size={16}/></div>
        <div className="rw-filter-pills"><button className="active">Spot</button></div>
        <section className="rw-panel"><LiveMarketTable variant="dashboard"/></section>
      </>}
      {activeTab === "profile" && <>
        <section className="rw-profile-card"><span className="rw-profile-avatar">{userName.slice(0,1).toUpperCase() || "T"}</span><div><b>{userName}</b><small>GROEANRX account</small></div><ChevronRight size={15}/></section>
        <section className="rw-profile-section"><b>Trading environment</b><p>Binance Spot Testnet only</p><small>Live-money trading and withdrawals are disabled in this release.</small></section>
        <section className="rw-profile-section"><b>Exchange API connection</b><p>Manage your encrypted Testnet API connection in the Bots tab.</p><Link href="/dashboard?tab=bots">Open bot settings →</Link></section>
        <section className="rw-profile-section"><b>Account recovery</b><p>Reset your password securely using your verified email address.</p><Link href="/forgot-password">Reset password →</Link></section>
        <section className="rw-profile-section"><b>Support</b><p>Support chat is not connected yet.</p></section>
        <form action="/auth/logout" method="post"><button className="rw-signout" type="submit">↗ Sign Out</button></form>
      </>}
      {notice && <div className="rw-toast" role="status">{notice}<button onClick={()=>setNotice("")}>×</button></div>}
    </div>
    <button className="rw-chat" aria-label="Support chat" onClick={()=>setNotice("Support chat is not connected in this preview.")}>●</button>
    <nav className="rw-bottom-nav">{nav.map((item)=>{const Icon=item.icon;return <Link key={item.id} href={`/dashboard?tab=${item.id}`} className={activeTab===item.id?"active":""}><Icon size={17}/><small>{item.label}</small></Link>;})}</nav>
  </main>;
}
