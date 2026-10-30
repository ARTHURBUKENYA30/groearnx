"use client";

import Link from "next/link";
import TradingControlPanel from "@/app/components/trading-control-panel";
import { useState } from "react";
import {
  Activity, ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpRight, Bell,
  Bot, Check, ChevronDown, ChevronRight, CircleHelp, Copy, Eye, EyeOff,
  History, House, LockKeyhole, LogOut, Menu, Plus, Search, Settings,
  ShieldCheck, SlidersHorizontal, Star, TrendingDown, TrendingUp, UserRound,
  Wallet, Zap
} from "lucide-react";

type Tab = "home" | "trade" | "bots" | "manual" | "market" | "profile";
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
function Exchange() { return <div className="rw-exchange"><button className="selected">◈ Ava AI</button><button>● Live</button><button aria-label="More settings"><Settings size={13}/></button></div>; }
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
        <div className="rw-alert"><span>♧</span><div><b>Low Fuel Top up to start bots.</b><small>Fund your account and activate a trading bot.</small></div><ChevronRight size={15}/></div>
        <section className="rw-balance-card">
          <div className="rw-card-head"><small>LIFETIME WINS <span>⌄</span></small><div className="rw-tabs"><button>Spot</button><button className="active">Futures</button><button>◎</button></div></div>
          <div className="rw-balances"><div><small>◉ TOTAL PNL</small><b className="rw-green">+{showBalance ? "$0.00" : "••••"}</b><small>Today +$0.00</small></div><div><small>◉ AVAILABLE</small><b>{showBalance ? "$0.00" : "••••"}</b><small>In your Futures wallet</small></div></div>
          <div className="rw-money-actions"><button disabled><Plus size={14}/> Deposit</button><button disabled><ArrowUpRight size={14}/> Withdraw</button></div>
          <div className="rw-mini-stats"><span>Win rate <b>0%</b></span><span>Days <b>0/30</b></span><span>Active bots <b>0</b></span><span>Trades <b>0</b></span></div>
        </section>
        <section className="rw-auto-card"><div><b>Full Auto Futures</b><small>Let AI trade Futures on your behalf.</small></div><span className="rw-switch"/><small>Off</small></section>
        <section className="rw-shortcuts">{[["Share","↗"],["Earning","⌁"],["Orders","◷"],["Charts","⌗"],["Assets","▣"],["Invite","♧"],["API","⌘"],["More","•••"]].map(([label, icon])=><button key={label}><b>{icon}</b><span>{label}</span></button>)}</section>
        <div className="rw-section-head"><b>Market Movers</b><span>See all <ChevronRight size={12}/></span></div>
        <section className="rw-panel">
          <div className="rw-market-tabs"><button className="active">Spot</button><button>Futures</button><Search size={14}/></div>
          <div className="rw-signal-banner"><span>♧</span><div><b>AUTOMATED CRYPTO</b><small>Tracked by the Spot Momentum Bot</small></div><span className="rw-auto-tag">AI AUTO</span></div>
          <MarketRows/>
        </section>
      </>}
      {activeTab === "trade" && <>
        <div className="rw-page-title"><h1>Trades <span className="rw-dot"/></h1><Link href="/dashboard?tab=manual" className="rw-gold-btn"><Plus size={13}/> New Trade</Link></div>
        <div className="rw-filter-pills"><button className="active">All</button><button>Futures</button><button>Spot</button></div>
        <div className="rw-open-close"><button className="active">Open <small>0</small></button><button>Closed <small>0</small></button></div>
        <div className="rw-empty"><span>◷</span><b>No open positions.</b><small>Place a trade to start</small><Link href="/dashboard?tab=manual">Place a trade</Link></div>
      </>}
      {activeTab === "bots" && <>
        <div className="rw-page-title"><div><h1>Smart Bots</h1><p>Presets · activate to start trading</p></div></div>
        <div className="rw-warning"><b>⚠ Disclaimer</b><p>Bot strategies are not responsible for any losses caused by bad trades. Bots are designed to work with managed risk, but markets are volatile — some losses are normal and managed by stop-loss and trailing settings.</p></div>
        <div className="rw-warning red"><b>◎ Gas wallet below $10</b><p>Bots auto-pause when your wallet falls below $10. Top up to keep them trading.</p><button disabled>Top up</button></div>
        <div className="rw-step"><span>▣</span><div><b>Bind an API key first</b><small>Bind Trade API key from your Binance account.</small></div><button disabled>Bind</button></div>
        <div className="rw-step"><span>♧</span><div><b>Activate your account to unlock all bots</b><small>One-time $10 activation fee. Unlock access to every bot, AI safety tooling & referral rewards.</small></div><button disabled>Activate</button></div>
        <div className="rw-bot-tabs"><button className="active">All (3)</button><button>Spot (2)</button><button>Futures (1)</button></div>
        <div className="rw-bot-feature"><Exchange/><button className="rw-wide-gold" disabled>⚒ Activate Account to unlock · $10</button></div>
        {bots.map((b, i)=><article className="rw-bot-card" key={b[0]}><div className="rw-bot-card-head"><span className="rw-bot-avatar">♟</span><div><b>{b[0]}</b><small>{b[1]}</small><p>{b[2]}</p></div></div><button className="rw-wide-gold" disabled>⚒ Activate Account to unlock · $10</button></article>)}
        <div className="rw-note-grid"><span>Pair<br/><b>Temporarily locked</b></span><span>Stop<br/><b>With the correct settings</b></span></div>
      </>}
      {activeTab === "manual" && <>
        <div className="rw-page-title"><Link href="/dashboard?tab=trade"><ArrowLeft size={17}/></Link><h1>New Trade</h1><span className="rw-funds-pill">$0.000 <small>Binance Futures</small></span></div>
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
        <button className="rw-history"><History size={13}/> MANUAL TRADE HISTORY</button>\n        <details className="rw-advanced"><summary>Advanced · Binance Spot Testnet API binding</summary><TradingControlPanel/></details>
      </>}
      {activeTab === "market" && <>
        <div className="rw-page-title"><h1>Markets</h1><Search size={16}/></div>
        <div className="rw-filter-pills"><button className="active">Spot</button><button>Futures</button></div>
        <div className="rw-market-categories">{["All","Gainers","Losers","Favorites"].map((x,i)=><button className={i===0?"active":""} key={x}>{x}</button>)}</div>
        <section className="rw-panel"><div className="rw-market-head"><span>Pair</span><span>Price</span><span>24h</span><span>Vol</span></div><div className="rw-signal-banner"><span>♧</span><div><b>AUTOMATED CRYPTO</b><small>Tracked by the Spot Momentum Bot</small></div><span className="rw-auto-tag">AI AUTO</span></div><div className="rw-search"><Search size={13}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search markets"/></div><MarketRows query={query}/></section>
      </>}
      {activeTab === "profile" && <>
        <section className="rw-profile-card"><span className="rw-profile-avatar">{userName.slice(0,1).toUpperCase() || "B"}</span><div><b>{userName}</b><small>♙ Trader · Not active</small></div><ChevronRight size={15}/></section>
        <section className="rw-profile-section"><b>☎ Phone Number</b><div className="rw-profile-input">+1 555 000 1234 <button disabled>Save</button></div></section>
        <section className="rw-profile-section"><b>♧ YOUR SPONSOR / UPLINE</b><p>COACH HASSAN</p></section>
        <section className="rw-profile-section"><b>♙ Referral Code</b><div className="rw-profile-input">3RCPFCB <button><Copy size={13}/></button></div><small>YOUR REFERRAL LINK</small><div className="rw-profile-input">https://groearnx.vercel.app/signup?ref=3RCPFCB <button><Copy size={13}/></button></div></section>
        <section className="rw-profile-section"><b>♧ Referral Wallet</b><h2>$0.00</h2><small>Earned from your 3-level referral tree. USD withdrawal from $10.</small></section>
        <Exchange/>
        <section className="rw-menu-list">{[["Download App","Install GROEANRX on your phone"],["API Binding","Connect your exchange API key"],["My Referrals","View your invited people & levels"],["Change Password","Update your account password"],["Security","Manage account security"],["Support","Get help and feedback"],["About Us","About GROEANRX trading tools"]].map(([a,b])=><div key={a}><span><b>{a}</b><small>{b}</small></span><ChevronRight size={14}/></div>)}</section>
        <form action="/auth/logout" method="post"><button className="rw-signout" type="submit">↗ Sign Out</button></form>
      </>}
      {notice && <div className="rw-toast" role="status">{notice}<button onClick={()=>setNotice("")}>×</button></div>}
    </div>
    <button className="rw-chat" aria-label="Support chat" onClick={()=>setNotice("Support chat is not connected in this preview.")}>●</button>
    <nav className="rw-bottom-nav">{nav.map((item)=>{const Icon=item.icon;return <Link key={item.id} href={`/dashboard?tab=${item.id}`} className={activeTab===item.id?"active":""}><Icon size={17}/><small>{item.label}</small></Link>;})}</nav>
  </main>;
}
