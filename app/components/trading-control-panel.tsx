"use client";
import { useEffect, useState, type FormEvent } from "react";
type State = { connected:boolean; enabled?:boolean; mode?:"paper"|"testnet"; paperAccount?:{starting_balance:number;cash_balance:number;cumulative_fees:number}|null; environment?:string; symbol?:string; quote_order_qty?:number; max_daily_loss_usdt?:number; stop_loss_pct?:number; take_profit_pct?:number; last_verified_at?:string|null; last_run_at?:string|null; last_signal?:string|null; paused_reason?:string|null };
function explainConnectionError(value: unknown): string {
  const raw = typeof value === "string" ? value.trim() : "";
  const message = raw || "Connection failed. Please try again.";
  const lower = message.toLowerCase();
  if (lower.includes("restricted location") || lower.includes("eligibility") || lower.includes("service unavailable from a restricted")) {
    return "Binance location eligibility restriction. Binance rejected the Spot Testnet request under its regional eligibility terms. This is not an API-key formatting error. GROERNX cannot bypass Binance's restriction. The submitted credentials were not saved and the bot remains stopped. Contact Binance Support to confirm whether Spot Testnet access is permitted for your account and location.";
  }
  if (message.includes("-2015") || lower.includes("invalid api-key") || lower.includes("permissions for this request")) {
    return "Binance rejected the API key. Confirm that it was created on Spot Testnet, has Spot trading permission, and has no incompatible IP restriction. Withdrawals must remain disabled.";
  }
  if (message.includes("-1022") || lower.includes("signature for this request is not valid")) {
    return "Binance could not verify the request signature. Check that the API secret belongs to this exact Testnet API key, then try again.";
  }
  if (message.includes("-1021") || lower.includes("timestamp for this request")) {
    return "The exchange rejected the request timestamp. Check the server clock and retry in a moment.";
  }
  return message.slice(0, 500);
}
export default function TradingControlPanel() {
  const [state,setState]=useState<State>({connected:false}); const [mode,setMode]=useState<"paper"|"testnet">("paper");
  const [apiKey,setApiKey]=useState(""); const [apiSecret,setApiSecret]=useState("");
  const [symbol,setSymbol]=useState("BTCUSDT"); const [amount,setAmount]=useState("10");
  const [loss,setLoss]=useState("5"); const [stop,setStop]=useState("1"); const [take,setTake]=useState("2");
  const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
  async function refresh(){try{const [cr,br]=await Promise.all([fetch("/api/trading/connection",{cache:"no-store"}),fetch("/api/trading/bot",{cache:"no-store"})]);if(!cr.ok)return;const d=await cr.json(),b=br.ok?await br.json():{};const next={connected:d.connected,environment:d.connection?.environment,last_verified_at:d.connection?.last_verified_at,...d.settings,paperAccount:b.paperAccount??null};setState(next);if(d.settings){setMode(d.settings.mode==="paper"?"paper":"testnet");setSymbol(d.settings.symbol);setAmount(String(d.settings.quote_order_qty));setLoss(String(d.settings.max_daily_loss_usdt));setStop(String(d.settings.stop_loss_pct));setTake(String(d.settings.take_profit_pct));}}catch{}}
  useEffect(()=>{void refresh()},[]);
  async function connect(e:FormEvent){e.preventDefault();setBusy(true);setMessage("");try{const r=await fetch("/api/trading/connection",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey,apiSecret})});const d=await r.json();if(!r.ok)throw new Error(explainConnectionError(d.error||"Connection failed."));setApiKey("");setApiSecret("");setMessage("Binance Spot Testnet connected. Your keys were encrypted on the server.");await refresh();}catch(err){setMessage(err instanceof Error?err.message:"Connection failed.");setApiKey("");setApiSecret("");}finally{setBusy(false)}}
  async function save(){setBusy(true);setMessage("");try{const r=await fetch("/api/trading/bot",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode,symbol,quote_order_qty:Number(amount),max_daily_loss_usdt:Number(loss),stop_loss_pct:Number(stop),take_profit_pct:Number(take)})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not save settings.");setMessage("Settings saved. Bot remains safely stopped.");await refresh();}catch(e){setMessage(e instanceof Error?e.message:"Could not save settings.");}finally{setBusy(false)}}
  async function startBot(){setBusy(true);setMessage("");try{const r=await fetch("/api/trading/bot",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not start bot.");setMessage(d.message||(mode==="paper"?"Paper trading started.":"Testnet bot started."));await refresh();}catch(e){setMessage(e instanceof Error?e.message:"Could not start bot.");}finally{setBusy(false)}}
  async function stopBot(){setBusy(true);try{const r=await fetch("/api/trading/bot",{method:"DELETE"});const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not stop bot.");setMessage("Emergency stop confirmed. Bot is disabled.");await refresh();}catch(e){setMessage(e instanceof Error?e.message:"Could not confirm stop request.");}finally{setBusy(false)}}
  async function disconnect(){if(!confirm("Disconnect Binance Testnet and delete the saved encrypted API credentials?"))return;setBusy(true);try{const r=await fetch("/api/trading/connection",{method:"DELETE"});if(!r.ok)throw new Error("Disconnect failed.");setState({connected:false});setMessage("Exchange disconnected and bot disabled.");}catch(e){setMessage(e instanceof Error?e.message:"Disconnect failed.");}finally{setBusy(false)}}
  return <section className="panel wide-panel" id="trading-engine">
    <div className="panel-title"><div><h2>Trading engine</h2><p>Run isolated paper simulations or Binance Spot Testnet orders.</p></div><span className="demo-tag">{mode==="paper"?"PAPER · NO REAL ORDERS":"TESTNET ONLY"}</span></div>
    <label className="mode-picker">Trading environment<select value={mode} onChange={e=>setMode(e.target.value as "paper"|"testnet")}><option value="paper">Paper trading · simulated funds</option><option value="testnet">Binance Spot Testnet · test funds</option></select></label>
    <div className="notice">{mode==="paper"?"Paper mode uses a separate simulated USDT account and ledger. It never sends exchange orders or uses Binance API credentials.":"Spot Testnet sends orders only to Binance test funds. Live-money trading is disabled. Keep withdrawals disabled and never share your API key or secret."}</div>
    <div className="risk-row"><span>{mode==="paper"?"Paper account":"Exchange connection"}</span><b>{mode==="paper"?"Isolated simulation":state.connected?"Connected · Binance Spot Testnet":"Not connected"}</b></div><div className="risk-row"><span>Bot status</span><b>{state.enabled&&state.mode===mode?"Running · "+(mode==="paper"?"Paper":"Testnet"):state.paused_reason?"Paused · Review required":"Stopped"}</b></div>{mode==="paper"&&state.paperAccount&&<><div className="risk-row"><span>Paper starting balance</span><b>{Number(state.paperAccount.starting_balance).toFixed(2)} USDT</b></div><div className="risk-row"><span>Paper cash balance</span><b>{Number(state.paperAccount.cash_balance).toFixed(2)} USDT</b></div><div className="risk-row"><span>Simulated fees paid</span><b>{Number(state.paperAccount.cumulative_fees).toFixed(4)} USDT</b></div></>}{state.paused_reason&&<p className="hint" role="status">{state.paused_reason}</p>}{state.last_run_at&&<p className="hint">Last worker check: {new Date(state.last_run_at).toLocaleString()} · {state.last_signal||"No signal"}</p>}
    {mode==="testnet"&&!state.connected?<form className="data-form" onSubmit={connect}>
      <label htmlFor="binance-api-key">Binance Spot Testnet API key</label><input id="binance-api-key" autoComplete="off" value={apiKey} onChange={e=>setApiKey(e.target.value)} required minLength={20} maxLength={128} placeholder="Paste testnet API key"/>
      <label htmlFor="binance-api-secret">Binance Spot Testnet secret</label><input id="binance-api-secret" type="password" autoComplete="new-password" value={apiSecret} onChange={e=>setApiSecret(e.target.value)} required minLength={20} maxLength={128} placeholder="Paste testnet API secret"/>
      <button className="button small" disabled={busy} type="submit">{busy?"Checking…":"Verify & securely connect"}</button>
    </form>:mode==="testnet"&&state.connected?<div className="data-form-row"><span className="status-chip">Verified testnet account</span><button className="remove-button" type="button" disabled={busy} onClick={disconnect}>Disconnect</button></div>:<p className="hint">Paper mode requires no exchange connection or API keys.</p>}
    <div className="panel-title"><div><h2>Bot risk settings</h2><p>Saved values do not start the bot.</p></div></div>
    <div className="strategy-grid">
      <label>Trading pair (USDT quote)<input value={symbol} onChange={e=>setSymbol(e.target.value.toUpperCase())} maxLength={20}/></label>
      <label>Order size (USDT)<input type="number" min="5" max="100000" step="1" value={amount} onChange={e=>setAmount(e.target.value)}/></label>
      <label>Maximum daily loss (USDT)<input type="number" min="1" max="100000" step="1" value={loss} onChange={e=>setLoss(e.target.value)}/></label>
      <label>Stop-loss (%)<input type="number" min="0.1" max="10" step="0.1" value={stop} onChange={e=>setStop(e.target.value)}/></label>
      <label>Take-profit (%)<input type="number" min="0.1" max="30" step="0.1" value={take} onChange={e=>setTake(e.target.value)}/></label>
    </div>
    <div className="data-form-row"><button className="button small" type="button" onClick={save} disabled={busy}>Save risk settings</button><button className="button small" type="button" onClick={startBot} disabled={busy||(mode==="testnet"&&!state.connected)}>Start {mode==="paper"?"paper bot":"testnet bot"}</button><button className="remove-button" type="button" onClick={stopBot} disabled={busy}>Emergency stop</button></div>
    {message&&<div className="notice" role="status"><p>{message}</p>{message.startsWith("Binance location eligibility restriction.")&&<a href="https://www.binance.com/en/support" target="_blank" rel="noreferrer">Contact Binance Support →</a>}</div>}
    <p className="hint">Both modes use an EMA 9/21 crossover on completed one-minute candles. Paper mode simulates fills with a 0.1% fee assumption and its own USDT ledger; Testnet mode uses Binance Spot Testnet only. Stop-loss and take-profit are checked by the worker and can slip between checks. Neither mode enables live-money trading.</p>
  </section>;
}
