"use client";
import { useEffect, useState, type FormEvent } from "react";
type State = { connected:boolean; environment?:string; symbol?:string; quote_order_qty?:number; max_daily_loss_usdt?:number; stop_loss_pct?:number; take_profit_pct?:number; last_verified_at?:string|null };
export default function TradingControlPanel() {
  const [state,setState]=useState<State>({connected:false});
  const [apiKey,setApiKey]=useState(""); const [apiSecret,setApiSecret]=useState("");
  const [symbol,setSymbol]=useState("BTCUSDT"); const [amount,setAmount]=useState("10");
  const [loss,setLoss]=useState("5"); const [stop,setStop]=useState("1"); const [take,setTake]=useState("2");
  const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
  async function refresh(){try{const r=await fetch("/api/trading/connection",{cache:"no-store"});if(!r.ok)return;const d=await r.json();setState({connected:d.connected,environment:d.connection?.environment,last_verified_at:d.connection?.last_verified_at,...d.settings});if(d.settings){setSymbol(d.settings.symbol);setAmount(String(d.settings.quote_order_qty));setLoss(String(d.settings.max_daily_loss_usdt));setStop(String(d.settings.stop_loss_pct));setTake(String(d.settings.take_profit_pct));}}catch{}}
  useEffect(()=>{void refresh()},[]);
  async function connect(e:FormEvent){e.preventDefault();setBusy(true);setMessage("");try{const r=await fetch("/api/trading/connection",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey,apiSecret})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Connection failed.");setApiKey("");setApiSecret("");setMessage("Binance Spot Testnet connected. Your keys were encrypted on the server.");await refresh();}catch(err){setMessage(err instanceof Error?err.message:"Connection failed.");}finally{setBusy(false)}}
  async function save(){setBusy(true);setMessage("");try{const r=await fetch("/api/trading/bot",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({symbol,quote_order_qty:Number(amount),max_daily_loss_usdt:Number(loss),stop_loss_pct:Number(stop),take_profit_pct:Number(take)})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not save settings.");setMessage("Settings saved. Bot remains safely stopped.");}catch(e){setMessage(e instanceof Error?e.message:"Could not save settings.");}finally{setBusy(false)}}
  async function startBot(){setBusy(true);setMessage("");try{const r=await fetch("/api/trading/bot",{method:"POST"});const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not start bot.");setMessage(d.message||"Testnet bot started.");}catch(e){setMessage(e instanceof Error?e.message:"Could not start bot.");}finally{setBusy(false)}}
  async function stopBot(){setBusy(true);try{await fetch("/api/trading/bot",{method:"DELETE"});setMessage("Emergency stop sent. Bot is disabled.");}catch{setMessage("Could not confirm stop request.");}finally{setBusy(false)}}
  async function disconnect(){if(!confirm("Disconnect Binance Testnet and delete the saved encrypted API credentials?"))return;setBusy(true);try{const r=await fetch("/api/trading/connection",{method:"DELETE"});if(!r.ok)throw new Error("Disconnect failed.");setState({connected:false});setMessage("Exchange disconnected and bot disabled.");}catch(e){setMessage(e instanceof Error?e.message:"Disconnect failed.");}finally{setBusy(false)}}
  return <section className="panel wide-panel" id="trading-engine">
    <div className="panel-title"><div><h2>Binance trading engine</h2><p>Secure test connection and configure conservative bot limits.</p></div><span className="demo-tag">TESTNET ONLY</span></div>
    <div className="notice">This setup cannot place live-money orders. Keep withdrawals disabled on your API key. Never share your API key or secret in chat.</div>
    <div className="risk-row"><span>Exchange connection</span><b>{state.connected?"Connected · Binance Spot Testnet":"Not connected"}</b></div>
    {!state.connected?<form className="data-form" onSubmit={connect}>
      <label htmlFor="binance-api-key">Binance Spot Testnet API key</label><input id="binance-api-key" autoComplete="off" value={apiKey} onChange={e=>setApiKey(e.target.value)} required minLength={20} maxLength={128} placeholder="Paste testnet API key"/>
      <label htmlFor="binance-api-secret">Binance Spot Testnet secret</label><input id="binance-api-secret" type="password" autoComplete="new-password" value={apiSecret} onChange={e=>setApiSecret(e.target.value)} required minLength={20} maxLength={128} placeholder="Paste testnet API secret"/>
      <button className="button small" disabled={busy} type="submit">{busy?"Checking…":"Verify & securely connect"}</button>
    </form>:<div className="data-form-row"><span className="status-chip">Verified testnet account</span><button className="remove-button" type="button" disabled={busy} onClick={disconnect}>Disconnect</button></div>}
    <div className="panel-title"><div><h2>Bot risk settings</h2><p>Saved values do not start the bot.</p></div></div>
    <div className="strategy-grid">
      <label>Trading pair<input value={symbol} onChange={e=>setSymbol(e.target.value.toUpperCase())} maxLength={20}/></label>
      <label>Order size (USDT)<input type="number" min="5" max="100000" step="1" value={amount} onChange={e=>setAmount(e.target.value)}/></label>
      <label>Maximum daily loss (USDT)<input type="number" min="1" max="100000" step="1" value={loss} onChange={e=>setLoss(e.target.value)}/></label>
      <label>Stop-loss (%)<input type="number" min="0.1" max="10" step="0.1" value={stop} onChange={e=>setStop(e.target.value)}/></label>
      <label>Take-profit (%)<input type="number" min="0.1" max="30" step="0.1" value={take} onChange={e=>setTake(e.target.value)}/></label>
    </div>
    <div className="data-form-row"><button className="button small" type="button" onClick={save} disabled={busy}>Save risk settings</button><button className="button small" type="button" onClick={startBot} disabled={busy||!state.connected}>Start testnet bot</button><button className="remove-button" type="button" onClick={stopBot} disabled={busy}>Emergency stop</button></div>
    {message&&<p className="hint" role="status">{message}</p>}
    <p className="hint">The bot uses an EMA 9/21 moving-average crossover on one-minute candles. It can place testnet spot market orders when started. Testnet results do not predict live performance.</p>
  </section>;
}
