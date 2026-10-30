import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Activity, ArrowDownRight, ArrowUpRight, Bot, CircleHelp, Clock3, Coins, Gauge, Link2, ListChecks, LockKeyhole, Play, RadioTower, ShieldAlert, ShieldCheck, Signal, Square, TrendingUp, WalletCards, Zap } from "lucide-react";
import { addWatchlistAsset, removeWatchlistAsset, savePortfolioHolding, removePortfolioHolding } from "./actions";
import LiveMarketTable from "@/app/components/live-market-table";

const strategies = [
  ["Grid trading", "Range-bound markets", "Places staggered orders inside a defined price range."],
  ["DCA", "Staged entries", "Splits entries into smaller purchases at configured intervals."],
  ["Support / resistance", "Reversal setups", "Watches defined levels for potential reaction zones."],
  ["CVD volume", "Volume confirmation", "Uses cumulative volume delta as a confirmation signal."],
  ["Momentum", "Trend continuation", "Looks for strength and continuation after a breakout."],
  ["Custom strategy", "Your rules", "A future workspace for configuring your own conditions."],
];
export default async function Dashboard({ searchParams }: { searchParams: Promise<{ message?: string; error?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: holdingsData }, { data: watchlistData }] = await Promise.all([
    supabase.from("portfolio_holdings").select("asset_id,quantity,updated_at").eq("user_id", user.id).order("asset_id"),
    supabase.from("watchlist_assets").select("asset_id,created_at").eq("user_id", user.id).order("asset_id"),
  ]);
  const holdings = holdingsData ?? [];
  const watchlist = watchlistData ?? [];
  const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "there";
  return <main className="dash">
    <aside className="sidebar">
      <Link href="/" className="brand"><span className="mark">G</span> GROEARN<span className="lime">X</span></Link>
      <p className="side-label">TRADING WORKSPACE</p>
      <a className="side-item active" href="#overview"><Gauge size={16}/> Overview</a>
      <a className="side-item" href="#bots"><Bot size={16}/> Trading bots</a>
      <a className="side-item" href="#signals"><Signal size={16}/> Signals</a>
      <a className="side-item" href="#positions"><Activity size={16}/> Positions &amp; orders</a>
      <a className="side-item" href="#watchlist"><TrendingUp size={16}/> Watchlist</a>
      <a className="side-item" href="#portfolio"><WalletCards size={16}/> Portfolio</a>
      <a className="side-item" href="#markets"><ArrowUpRight size={16}/> Market watch</a>
      <a className="side-item" href="#exchanges"><Link2 size={16}/> Exchanges</a>
      <a className="side-item" href="#strategies"><Zap size={16}/> Strategies</a>
      <a className="side-item" href="#risk"><ShieldAlert size={16}/> Risk controls</a>
      <a className="side-item" href="#activity"><Clock3 size={16}/> Activity log</a>
      <div className="side-bottom">
        <p className="security-box"><ShieldCheck size={15}/> Account protected<br/><small>Private dashboard session.</small></p>
        <form action="/auth/logout" method="post"><button className="side-item" type="submit">↗ &nbsp; Sign out</button></form>
      </div>
    </aside>
    <section className="dash-main">
      <header className="dash-top">
        <Link href="/" className="mobile-brand brand"><span className="mark">G</span> GROEARN<span className="lime">X</span></Link>
        <span className="crumb">Trading workspace / <b>Overview</b></span>
        <span className="account"><span className="avatar">{String(name).charAt(0).toUpperCase()}</span>{name}</span>
      </header>
      <div className="dash-content">
        <section id="overview" className="trading-intro">
          <div><div className="eyebrow">YOUR TRADING WORKSPACE</div><h1>Welcome back, {name}.</h1><p className="muted">Monitor the market, review strategies and manage your trading setup.</p></div>
          <span className="demo-pill"><span/> Preview mode · No exchange connected</span>
        </section>
        <div className="notice" role="status">Trading features are shown as a product preview. No orders are sent, no exchange keys are stored here, and all figures below are illustrative until live data and a trading engine are configured.</div>
        {params.error && <div className="notice error" role="alert">{params.error}</div>}
        {params.message && <div className="notice" role="status">{params.message}</div>}
        <div className="stats">
          <article className="stat"><span>Demo portfolio value</span><WalletCards/><h2>$12,773.01</h2><small className="positive">↗ +1.82% <i>sample data</i></small></article>
          <article className="stat"><span>Active bots</span><Bot/><h2>0 <small>running</small></h2><small className="muted">Connect an execution engine</small></article>
          <article className="stat"><span>Open positions</span><Activity/><h2>0 <small>positions</small></h2><small className="muted">No exchange connected</small></article>
          <article className="stat"><span>Signal scanner</span><RadioTower/><h2>Preview</h2><small className="muted">No live signal feed</small></article>
        </div>
        <section className="panel wide-panel" id="bots">
          <div className="panel-title"><div><h2><Bot size={17}/> Automated trading bots</h2><p>Plan, configure and monitor bot strategies.</p></div><span className="demo-tag">NOT CONNECTED</span></div>
          <div className="feature-grid trading-cards">
            <article><div className="mini-icon"><Zap/></div><h3>Smart bot</h3><p>Preset strategy for a guided setup with conservative defaults.</p><span className="status-chip">Setup required</span><button className="button small" type="button" disabled title="Requires a trading engine and exchange connection">Configure bot</button></article>
            <article><div className="mini-icon"><Gauge/></div><h3>Premium bot</h3><p>Advanced multi-signal strategy with configurable risk parameters.</p><span className="status-chip">Setup required</span><button className="button small" type="button" disabled title="Requires a trading engine and exchange connection">Configure bot</button></article>
            <article><div className="mini-icon"><ListChecks/></div><h3>Custom bot</h3><p>Combine strategy, pair, timeframe and position-sizing rules.</p><span className="status-chip">Setup required</span><button className="button small" type="button" disabled title="Requires a trading engine and exchange connection">Build strategy</button></article>
          </div>
          <p className="hint">Bot start/stop controls are intentionally disabled until the server-side execution engine, exchange permissions, risk checks and audit logging are implemented.</p>
        </section>
        <div className="dash-grid">
          <section className="panel" id="signals">
            <div className="panel-title"><div><h2><Signal size={16}/> Signal scanner</h2><p>4H + 1H trend with 15M entry confirmation</p></div><span className="demo-tag">SAMPLE</span></div>
            <div className="signal-score"><div><small>Scanner status</small><b>Not connected</b></div><div><small>Score range</small><b>0–100</b></div></div>
            <div className="table-scroll"><table className="trading-table"><thead><tr><th>Pair</th><th>Bias</th><th>Score</th><th>Timeframe</th></tr></thead><tbody>
              <tr><td>BTC/USDT</td><td><span className="status-chip">Example only</span></td><td>—</td><td>4H / 1H / 15M</td></tr>
              <tr><td>ETH/USDT</td><td><span className="status-chip">Example only</span></td><td>—</td><td>4H / 1H / 15M</td></tr>
              <tr><td>SOL/USDT</td><td><span className="status-chip">Example only</span></td><td>—</td><td>4H / 1H / 15M</td></tr>
            </tbody></table></div>
            <p className="hint">No buy/sell recommendation is generated by this preview.</p>
          </section>
          <section className="panel" id="risk">
            <div className="panel-title"><div><h2><ShieldAlert size={16}/> Risk controls</h2><p>Controls required before real execution</p></div></div>
            <div className="risk-row"><span><LockKeyhole/> Exchange-side stop-loss</span><b>Not configured</b></div>
            <div className="risk-row"><span><TrendingUp/> Take-profit targets</span><b>Not configured</b></div>
            <div className="risk-row"><span><Coins/> Position sizing & exposure</span><b>Not configured</b></div>
            <div className="risk-row"><span><Square/> Emergency kill switch</span><b>Not connected</b></div>
            <p className="notice">Do not enable live trading until exchange-side protection, maximum-loss limits, order validation and an emergency stop have been tested.</p>
          </section>
        </div>
        <section className="panel wide-panel" id="positions">
          <div className="panel-title"><div><h2><Activity size={17}/> Open positions & orders</h2><p>Live position, entry price, unrealized P/L and order status will appear here.</p></div><span className="demo-tag">NO LIVE ORDERS</span></div>
          <div className="empty-state"><div className="mini-icon"><WalletCards/></div><b>No connected positions</b><p>Connect a supported exchange and configure a verified execution service to populate this table.</p></div>
        </section>
        <div className="dash-grid user-data-grid">
          <section className="panel" id="watchlist">
            <div className="panel-title"><div><h2><TrendingUp size={16}/> Your watchlist</h2><p>Saved to your signed-in account</p></div><span className="demo-tag">{watchlist.length}/20 ASSETS</span></div>
            <form className="data-form" action={addWatchlistAsset}>
              <label htmlFor="watchlist-asset">Asset or pair</label>
              <div className="data-form-row"><input id="watchlist-asset" name="asset_id" maxLength={40} required placeholder="e.g. BTC/USDT"/><button className="button small" type="submit">Add asset</button></div>
            </form>
            {watchlist.length === 0 ? <div className="empty-state compact"><b>Your watchlist is empty</b><p>Add symbols such as BTC, ETH, or BTC/USDT to keep them here.</p></div> :
              <div className="asset-management-list">{watchlist.map((item) => <div className="asset-management-row" key={item.asset_id}><span><b>{item.asset_id}</b><small>Saved asset</small></span><form action={removeWatchlistAsset}><input type="hidden" name="asset_id" value={item.asset_id}/><button className="remove-button" type="submit" aria-label={`Remove ${item.asset_id} from watchlist`}>Remove</button></form></div>)}</div>}
          </section>
          <section className="panel" id="portfolio">
            <div className="panel-title"><div><h2><WalletCards size={16}/> Your portfolio holdings</h2><p>Asset quantities saved privately to your account</p></div><span className="demo-tag">{holdings.length} HOLDINGS</span></div>
            <form className="data-form" action={savePortfolioHolding}>
              <label htmlFor="holding-asset">Asset symbol</label>
              <div className="data-form-row"><input id="holding-asset" name="asset_id" maxLength={40} required placeholder="e.g. BTC"/><input aria-label="Quantity" name="quantity" type="number" min="0.00000001" max="1000000000000" step="any" required placeholder="Quantity"/><button className="button small" type="submit">Save</button></div>
              <p className="hint">Saving an existing symbol updates its quantity. Values and profit/loss are not calculated without verified prices.</p>
            </form>
            {holdings.length === 0 ? <div className="empty-state compact"><b>No holdings saved</b><p>Add a symbol and quantity to create your personal portfolio list.</p></div> :
              <div className="asset-management-list">{holdings.map((item) => <div className="asset-management-row" key={item.asset_id}><span><b>{item.asset_id}</b><small>Quantity: {String(item.quantity)}</small></span><form action={removePortfolioHolding}><input type="hidden" name="asset_id" value={item.asset_id}/><button className="remove-button" type="submit" aria-label={`Remove ${item.asset_id} holding`}>Remove</button></form></div>)}</div>}
          </section>
        </div>
        <div className="dash-grid">
          <section className="panel" id="exchanges">
            <div className="panel-title"><div><h2><Link2 size={16}/> Exchange connections</h2><p>Connect an exchange using restricted API credentials.</p></div></div>
            <div className="exchange-list">{["Binance","Bybit","MEXC","OKX","HTX"].map(x=><div className="exchange-row" key={x}><span className="exchange-mark">{x.slice(0,1)}</span><b>{x}</b><span className="status-chip">Not connected</span></div>)}</div>
            <p className="hint">Use trade-only keys; withdrawals must remain disabled. Secure server-side encryption and IP restrictions must be completed before accepting keys.</p>
            <button className="button small" type="button" disabled title="Secure key storage and exchange adapters are not yet configured">Connect exchange</button>
          </section>
          <section className="panel" id="activity">
            <div className="panel-title"><div><h2><Clock3 size={16}/> Bot activity & audit log</h2><p>Decision traces, orders and error events</p></div></div>
            <div className="empty-state compact"><div className="mini-icon"><Activity/></div><b>No activity recorded</b><p>Audit events will appear when the backend execution service is connected.</p></div>
          </section>
        </div>
        <section className="panel wide-panel" id="strategies">
          <div className="panel-title"><div><h2><Zap size={17}/> Strategy library</h2><p>Strategy descriptions for the future bot configuration flow.</p></div><span className="demo-tag">CATALOGUE PREVIEW</span></div>
          <div className="strategy-grid">{strategies.map(([title,kind,desc])=><article className="strategy-card" key={title}><span className="strategy-symbol">◇</span><div><b>{title}</b><small>{kind}</small><p>{desc}</p></div></article>)}</div>
        </section>
        <section className="panel wide-panel" id="markets">
          <div className="panel-title"><div><h2><TrendingUp size={17}/> Market watch</h2><p>Public quotes refresh about once per minute.</p></div></div>
          <LiveMarketTable variant="dashboard"/>
        </section>
        <div className="setup-footer"><CircleHelp size={15}/> This release includes the trading dashboard surfaces, not a live trading service. No real trades, deposits, withdrawals or custody are enabled.</div>
        <footer>© {new Date().getFullYear()} GROEARNX · Demo figures only · Trading involves risk · Not financial advice</footer>
      </div>
    </section>
  </main>;
}