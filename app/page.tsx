import Link from "next/link";
import { ArrowRight, ArrowUpRight, Activity, Bot, ShieldCheck, Smartphone, Lock, ChartNoAxesCombined, CircleCheck, Globe, WalletCards, Zap, Landmark } from "lucide-react";

const features = [
  { icon: Bot, title: "Automated trading bots", body: "Spot and Futures bot workflows with clear controls and activity visibility." },
  { icon: ShieldCheck, title: "Your funds stay yours", body: "Connect your own exchange account. API keys should never have withdrawal permission." },
  { icon: Activity, title: "Liquid markets", body: "Follow actively traded markets and review price movement in one place." },
  { icon: ChartNoAxesCombined, title: "Trade activity", body: "Review orders, positions and profit-and-loss information from your dashboard." },
  { icon: Globe, title: "Multiple exchanges", body: "A unified workspace for supported exchange connections." },
  { icon: Smartphone, title: "Mobile ready", body: "Use the trading workspace from your phone, tablet or desktop." },
  { icon: Lock, title: "Account security", body: "Keep access protected with secure sign-in and careful API-key permissions." },
  { icon: Zap, title: "Live controls", body: "Manage bot activity with visible status and clear controls." },
];
const steps = [
  ["01", "Create your account", "Register with your email and a strong password."],
  ["02", "Connect an exchange", "Add an API key with only the permissions your chosen features require."],
  ["03", "Configure your strategy", "Review the settings and risk controls before enabling any live trading."],
];
export default function Home() {
  return <main className="trx-home">
    <header className="trx-nav">
      <Link href="/" className="trx-brand"><span className="trx-mark">G</span><span>GROEANR<span className="trx-gold">X</span></span></Link>
      <nav><a href="#features">Platform</a><a href="#exchanges">Exchanges</a><a href="#how">How it works</a></nav>
      <div className="trx-nav-actions"><Link href="/login">Sign in</Link><Link className="trx-button trx-button-small" href="/signup">Get started <ArrowUpRight size={15}/></Link></div>
    </header>

    <section className="trx-hero">
      <div className="trx-hero-glow"/>
      <div className="trx-hero-copy">
        <span className="trx-eyebrow"><span className="trx-pulse"/> AUTOMATED CRYPTO WORKSPACE</span>
        <h1>Trade smarter.<br/><span className="trx-gold">Stay in control.</span></h1>
        <p>GROEANRX brings automated trading tools, market signals and exchange activity into one clear dashboard. Connect your own exchange account and stay in control of your trading decisions.</p>
        <div className="trx-hero-actions"><Link className="trx-button" href="/signup">Create your account <ArrowRight size={17}/></Link><Link className="trx-outline-button" href="/login">Open dashboard</Link></div>
        <div className="trx-trust"><ShieldCheck size={15}/> Your exchange account. Your API permissions. Your control.</div>
      </div>
      <div className="trx-preview">
        <div className="trx-preview-top"><span><i/> WORKSPACE OVERVIEW</span><span className="trx-live">● DEMO PREVIEW</span></div>
        <div className="trx-balance"><div><small>PORTFOLIO OVERVIEW</small><strong>$12,840.56</strong><em>Illustrative interface preview</em></div><span className="trx-balance-icon">↗</span></div>
        <div className="trx-chart-label"><span>ACCOUNT PERFORMANCE</span><b>+8.42%</b></div>
        <svg className="trx-chart" viewBox="0 0 540 175" role="img" aria-label="Illustrative account performance chart"><defs><linearGradient id="trxArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#d6b65d" stopOpacity=".28"/><stop offset="100%" stopColor="#d6b65d" stopOpacity="0"/></linearGradient></defs><path d="M0 142 L35 126 68 135 103 99 139 111 175 81 210 91 245 57 279 74 315 48 350 62 385 29 420 44 455 19 490 34 540 9 L540 175 L0 175Z" fill="url(#trxArea)"/><path d="M0 142 L35 126 68 135 103 99 139 111 175 81 210 91 245 57 279 74 315 48 350 62 385 29 420 44 455 19 490 34 540 9" fill="none" stroke="#d6b65d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <div className="trx-chart-dates"><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span></div>
        <div className="trx-preview-stats"><div><small>ACTIVE BOTS</small><b>02</b><span>Illustrative</span></div><div><small>OPEN ORDERS</small><b>04</b><span>Illustrative</span></div><div><small>EXCHANGE</small><b>Connected</b><span>Demo state</span></div></div>
        <div className="trx-floating">✦ <span><b>Risk controls</b><small>Review before live trading</small></span></div>
      </div>
    </section>

    <section className="trx-proof"><div><b>Spot &amp; Futures</b><span>Trading modes</span></div><div><b>24 / 7</b><span>Market monitoring</span></div><div><b>Multi-exchange</b><span>One workspace</span></div><div><b>Risk first</b><span>Visible controls</span></div></section>

    <section className="trx-feature-intro" id="features"><span className="trx-eyebrow">TOOLS FOR ACTIVE TRADERS</span><h2>Everything in its right place.</h2><p>One workspace to connect, monitor and manage your trading activity.</p></section>
    <section className="trx-feature-grid">{features.map(({icon:Icon,title,body})=><article key={title}><div className="trx-feature-icon"><Icon size={21}/></div><h3>{title}</h3><p>{body}</p></article>)}</section>

    <section className="trx-exchanges" id="exchanges"><span className="trx-eyebrow">EXCHANGE CONNECTIONS</span><h2>Work with the exchanges you use.</h2><div className="trx-exchange-list"><b>BINANCE</b><b>BYBIT</b><b>HTX</b><b>OKX</b></div><p>Availability depends on the exchange, account type and enabled API permissions.</p></section>

    <section className="trx-how" id="how"><div><span className="trx-eyebrow">GET STARTED</span><h2>From setup to strategy in three steps.</h2><p>Take time to understand each permission and risk setting before enabling live trading.</p></div><div className="trx-steps">{steps.map(([n,title,body])=><article key={n}><b>{n}</b><div><h3>{title}</h3><p>{body}</p></div></article>)}</div></section>

    <section className="trx-cta"><div className="trx-cta-icon"><Landmark size={26}/></div><span className="trx-eyebrow">YOUR TRADING WORKSPACE</span><h2>Build your trading routine with clarity.</h2><p>Create an account to explore the GROEANRX dashboard and available tools.</p><Link className="trx-button" href="/signup">Create your account <ArrowRight size={17}/></Link></section>
    <footer className="trx-footer"><Link href="/" className="trx-brand"><span className="trx-mark">G</span><span>GROEANR<span className="trx-gold">X</span></span></Link><span>© {new Date().getFullYear()} GROEANRX</span><span>Crypto trading involves risk. No returns are guaranteed.</span></footer>
  </main>;
}