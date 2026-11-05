import Link from "next/link";
import { ArrowRight, ArrowUpRight, Activity, Bot, ShieldCheck, Smartphone, Lock, ChartNoAxesCombined, CircleCheck, Globe, WalletCards, Zap, Landmark } from "lucide-react";

const features = [
  { icon: Bot, title: "Automated Trading Bots", body: "Configure a spot strategy and monitor its decisions, orders and status from one workspace. Automated execution is currently limited to isolated test environments." },
  { icon: ShieldCheck, title: "Your Funds Stay Yours", body: "Paper mode uses simulated funds. Binance Spot Testnet uses exchange test funds. Live-money trading and withdrawals remain disabled." },
  { icon: Activity, title: "Liquid Markets", body: "Follow actively traded crypto pairs and review current public market prices in one place." },
  { icon: ChartNoAxesCombined, title: "Real-Time Trades", body: "Review recorded test orders, simulated fills, fees and profit-and-loss information." },
  { icon: Globe, title: "Wide Market Coverage", body: "Browse a broad list of liquid markets and choose a supported USDT trading pair." },
  { icon: Smartphone, title: "Trade From Anywhere", body: "Use the responsive GROEARNX workspace from desktop, tablet or mobile." },
  { icon: Lock, title: "Encrypted API Keys", body: "Testnet credentials are encrypted server-side. Never enable withdrawal permission on an exchange API key." },
  { icon: Zap, title: "Live Controls", body: "Review bot status, save risk settings and use the emergency stop to disable automated test orders." },
];
const steps = [
  ["01", "Create your account", "Register with your email and confirm your address."],
  ["02", "Connect a test environment", "Use Paper Trading or a Binance Spot Testnet API key. Never enter live exchange credentials."],
  ["03", "Start a bot or simulate trades", "Set your order size, stop-loss, take-profit and daily loss limit before starting."],
];
export default function Home() {
  return <main className="trx-home">
    <header className="trx-nav">
      <Link href="/" className="trx-brand"><span className="trx-mark">G</span><span>GROEARN<span className="trx-gold">X</span></span></Link>
      <nav><a href="#features">Platform</a><a href="#exchanges">Environments</a><a href="#how">How it works</a></nav>
      <div className="trx-nav-actions"><Link href="/login">Log In</Link><Link className="trx-button trx-button-small" href="/signup">Launch App <ArrowUpRight size={15}/></Link></div>
    </header>

    <section className="trx-hero">
      <div className="trx-hero-glow"/>
      <div className="trx-hero-copy">
        <span className="trx-eyebrow"><span className="trx-pulse"/> AUTOMATED CRYPTO TRADING WORKSPACE</span>
        <h1>Trade easily.<br/><span className="trx-gold">The smart way.</span></h1>
        <p>GROEARNX brings automated trading tools, liquid-market data and trade monitoring into one dashboard. Test strategies in Paper Trading or connect Binance Spot Testnet before considering any live trading.</p>
        <div className="trx-hero-actions"><Link className="trx-button" href="/signup">Get Started <ArrowRight size={17}/></Link><Link className="trx-outline-button" href="/dashboard">Open Trading Dashboard</Link></div>
        <div className="trx-trust"><ShieldCheck size={15}/> Test environments only · Live-money trading disabled</div>
      </div>
      <div className="trx-preview">
        <div className="trx-preview-top"><span><i/> WORKSPACE OVERVIEW</span><span className="trx-live">● TEST ENVIRONMENT</span></div>
        <div className="trx-balance"><div><small>ACCOUNT STATUS</small><strong>Not connected</strong><em>Connect Paper Trading or Spot Testnet after sign-in</em></div><span className="trx-balance-icon">↗</span></div>
        <div className="trx-chart-label"><span>TRADING ENGINE</span><b>EMA 9 / 21</b></div>
        <svg className="trx-chart" viewBox="0 0 540 175" role="img" aria-label="Illustrative market movement line"><defs><linearGradient id="trxArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#d6b65d" stopOpacity=".28"/><stop offset="100%" stopColor="#d6b65d" stopOpacity="0"/></linearGradient></defs><path d="M0 142 L35 126 68 135 103 99 139 111 175 81 210 91 245 57 279 74 315 48 350 62 385 29 420 44 455 19 490 34 540 9 L540 175 L0 175Z" fill="url(#trxArea)"/><path d="M0 142 L35 126 68 135 103 99 139 111 175 81 210 91 245 57 279 74 315 48 350 62 385 29 420 44 455 19 490 34 540 9" fill="none" stroke="#d6b65d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <div className="trx-chart-dates"><span>1M</span><span>5M</span><span>15M</span><span>1H</span><span>4H</span><span>1D</span><span>1W</span></div>
        <div className="trx-preview-stats"><div><small>MODE</small><b>Paper</b><span>Simulated funds</span></div><div><small>EXCHANGE</small><b>Testnet</b><span>Binance Spot</span></div><div><small>LIVE FUNDS</small><b>Disabled</b><span>Safety lock</span></div></div>
        <div className="trx-floating">✦ <span><b>Risk controls</b><small>Set limits before starting</small></span></div>
      </div>
    </section>

    <section className="trx-proof"><div><b>30+ markets</b><span>Public market pairs</span></div><div><b>Paper mode</b><span>Simulated execution</span></div><div><b>Spot Testnet</b><span>Exchange test funds</span></div><div><b>24/7 worker</b><span>Scheduled checks</span></div></section>

    <section className="trx-feature-intro"><span className="trx-eyebrow">AUTOMATED EXECUTION</span><h2>Understand the big moves before they happen.</h2><p>Review market movement, bot decisions and recorded orders in one place.</p></section>
    <section className="trx-how"><div><span className="trx-eyebrow">MARKET MONITORING</span><h2>Your trading desk, in your pocket.</h2><p>The responsive GROEARNX workspace keeps your bot controls, market data and order history accessible across devices.</p></div><div className="trx-steps"><article><b>01</b><div><h3>Monitor markets</h3><p>Follow liquid crypto pairs using public market data.</p></div></article><article><b>02</b><div><h3>Review every action</h3><p>Inspect bot status, test orders, simulated fills and fees.</p></div></article><article><b>03</b><div><h3>Stay in control</h3><p>Save risk limits and stop the worker whenever needed.</p></div></article></div></section>

    <section className="trx-feature-intro" id="features"><span className="trx-eyebrow">BUILT FOR SERIOUS TRADERS</span><h2>Every feature engineered to minimise risk.</h2><p>Explore the tools available in the current GROEARNX release.</p></section>
    <section className="trx-feature-grid">{features.map(({icon:Icon,title,body})=><article key={title}><div className="trx-feature-icon"><Icon size={21}/></div><h3>{title}</h3><p>{body}</p></article>)}</section>

    <section className="trx-exchanges" id="exchanges"><span className="trx-eyebrow">TRADING ENVIRONMENTS</span><h2>Start in a safe test environment.</h2><div className="trx-exchange-list"><b>PAPER TRADING</b><b>BINANCE SPOT TESTNET</b></div><p>Paper mode simulates orders with a separate ledger. Spot Testnet uses exchange test funds. Other exchanges, Futures and live-money trading are not enabled.</p></section>

    <section className="trx-how" id="how"><div><span className="trx-eyebrow">START TRADING IN THREE STEPS</span><h2>From setup to strategy.</h2><p>Check every permission and risk setting before starting the test bot.</p></div><div className="trx-steps">{steps.map(([n,title,body])=><article key={n}><b>{n}</b><div><h3>{title}</h3><p>{body}</p></div></article>)}</div></section>

    <section className="trx-cta"><div className="trx-cta-icon"><Landmark size={26}/></div><span className="trx-eyebrow">YOUR TRADING WORKSPACE</span><h2>Your trading engine starts here.</h2><p>Explore GROEARNX with simulated funds or Binance Spot Testnet. No live-money trading or withdrawal access is enabled.</p><Link className="trx-button" href="/signup">Create Account <ArrowRight size={17}/></Link></section>
    <footer className="trx-footer"><Link href="/" className="trx-brand"><span className="trx-mark">G</span><span>GROEARN<span className="trx-gold">X</span></span></Link><span>© {new Date().getFullYear()} GROEARNX</span><span>Crypto trading involves risk. No returns are guaranteed.</span><span><Link href="/disclaimer">Disclaimer</Link> · <Link href="/privacy">Privacy Policy</Link></span></footer>
  </main>;
}
