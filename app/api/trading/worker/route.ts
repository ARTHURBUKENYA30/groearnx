import { NextResponse } from "next/server";
import { adminDb, binanceSigned, decryptSecret } from "@/lib/trading/binance";
export const runtime="nodejs";
export const dynamic="force-dynamic";
type Kline=[number,string,string,string,string,string,number,string,string,string,string,string];
type Fill={price:string;qty:string;commission?:string;commissionAsset?:string};
type Order={orderId:number;status:string;executedQty:string;cummulativeQuoteQty:string;fills?:Fill[]};
function ema(values:number[],period:number){const k=2/(period+1);let v=values.slice(0,period).reduce((a,b)=>a+b,0)/period;for(let i=period;i<values.length;i++)v=values[i]*k+v*(1-k);return v;}
function avgFill(o:Order){const q=Number(o.executedQty),quote=Number(o.cummulativeQuoteQty);return q>0?quote/q:0;}
function clientId(uid:string,symbol:string,side:string,minute:number){return ("gx"+uid.replace(/-/g,"").slice(0,8)+symbol.slice(0,8)+side[0]+minute.toString(36)).slice(0,32);}
export async function GET(req:Request){
 const token=process.env.GROEARNX_WORKER_SECRET;
 if(!token||req.headers.get("authorization")!==`Bearer ${token}`)return NextResponse.json({error:"Unauthorized"},{status:401});
 const db=adminDb();
 const {data:settings,error}=await db.from("bot_settings").select("*").eq("enabled",true).eq("mode","testnet").limit(50);
 if(error)return NextResponse.json({error:"Could not load bot settings."},{status:500});
 const results=[];
 for(const s of settings??[]){
  try{
   const {data:cred}=await db.from("exchange_credentials").select("api_key_ciphertext,api_secret_ciphertext,environment").eq("user_id",s.user_id).maybeSingle();
   if(!cred||cred.environment!=="testnet")throw new Error("Testnet credentials are missing.");
   const key=decryptSecret(cred.api_key_ciphertext),secret=decryptSecret(cred.api_secret_ciphertext);
   const {data:daily}=await db.from("bot_trades").select("realized_pnl").eq("user_id",s.user_id).gte("created_at",new Date(new Date().setUTCHours(0,0,0,0)).toISOString());
   const pnl=(daily??[]).reduce((n,t)=>n+Number(t.realized_pnl||0),0);
   if(pnl<=-Number(s.max_daily_loss_usdt)){
    await db.from("bot_settings").update({enabled:false,paused_reason:"Daily loss limit reached",last_run_at:new Date().toISOString()}).eq("user_id",s.user_id);
    await db.from("bot_events").insert({user_id:s.user_id,level:"warning",event:"Bot auto-paused: daily loss limit reached",details:{realized_pnl:pnl}});
    results.push({user_id:s.user_id,status:"paused_loss_limit"});continue;
   }
   const klines=await binanceSigned<Kline[]>(key,secret,"/api/v3/klines",{symbol:s.symbol,interval:"1m",limit:"100"});
   const closes=klines.slice(0,-1).map(k=>Number(k[4]));
   if(closes.length<30)throw new Error("Not enough candle data.");
   const fastPrev=ema(closes.slice(0,-1),9),slowPrev=ema(closes.slice(0,-1),21);
   const fastNow=ema(closes,9),slowNow=ema(closes,21);
   const crossedUp=fastPrev<=slowPrev&&fastNow>slowNow;
   const crossedDown=fastPrev>=slowPrev&&fastNow<slowNow;
   const price=Number(closes[closes.length-1]);
   const {data:position}=await db.from("bot_positions").select("*").eq("user_id",s.user_id).eq("symbol",s.symbol).maybeSingle();
   let side:"BUY"|"SELL"|null=null,signal="";
   if(!position&&crossedUp){side="BUY";signal="EMA9 crossed above EMA21";}
   if(position){
    const change=(price-Number(position.entry_price))/Number(position.entry_price)*100;
    if(change<=-Number(s.stop_loss_pct)){side="SELL";signal="Stop-loss triggered";}
    else if(change>=Number(s.take_profit_pct)){side="SELL";signal="Take-profit triggered";}
    else if(crossedDown){side="SELL";signal="EMA9 crossed below EMA21";}
   }
   if(!side){
    await db.from("bot_settings").update({last_run_at:new Date().toISOString(),last_signal:"No trade"}).eq("user_id",s.user_id);
    results.push({user_id:s.user_id,status:"watching",price});continue;
   }
   const minute=Math.floor(Number(klines[klines.length-2][0])/60000);
   const cid=clientId(s.user_id,s.symbol,side,minute);
   const {data:existing}=await db.from("bot_orders").select("id").eq("client_order_id",cid).maybeSingle();
   if(existing){results.push({user_id:s.user_id,status:"duplicate_skipped"});continue;}
   const params:Record<string,string>={symbol:s.symbol,side,type:"MARKET",newClientOrderId:cid,newOrderRespType:"FULL"};
   if(side==="BUY")params.quoteOrderQty=String(s.quote_order_qty);
   else {
    const info=await binanceSigned<{symbols:{filters:{filterType:string,stepSize?:string}[]}[]}>(key,secret,"/api/v3/exchangeInfo",{symbol:s.symbol});
    const lot=info.symbols?.[0]?.filters?.find(f=>f.filterType==="LOT_SIZE");
    const step=Number(lot?.stepSize||"0.000001");
    const qty=Math.floor(Number(position.quantity)/step)*step;
    if(qty<=0)throw new Error("Position quantity is below the exchange minimum.");
    params.quantity=qty.toFixed(Math.min(12,Math.max(0,(String(step).split(".")[1]||"").length)));
   }
   const order=await binanceSigned<Order>(key,secret,"/api/v3/order",params,"POST");
   const qty=Number(order.executedQty),quote=Number(order.cummulativeQuoteQty),fill=avgFill(order);
   if(qty<=0||fill<=0)throw new Error("Exchange returned an order with no completed fills.");
   let realized=0;
   if(side==="BUY"){
    await db.from("bot_positions").upsert({user_id:s.user_id,symbol:s.symbol,quantity:qty,entry_price:fill,entry_quote:quote,opened_at:new Date().toISOString()});
   }else{
    realized=(fill-Number(position.entry_price))*qty;
    await db.from("bot_positions").delete().eq("user_id",s.user_id).eq("symbol",s.symbol);
   }
   await db.from("bot_orders").insert({user_id:s.user_id,exchange_order_id:String(order.orderId),symbol:s.symbol,side,order_type:"MARKET",quantity:qty,quote_quantity:quote,status:order.status,mode:"testnet",client_order_id:cid,response:{signal,avg_price:fill,realized_pnl:realized}});
   await db.from("bot_trades").insert({user_id:s.user_id,symbol:s.symbol,side,quantity:qty,price:fill,quote_amount:quote,realized_pnl:realized,exchange_order_id:String(order.orderId),strategy_signal:signal,mode:"testnet"});
   await db.from("bot_events").insert({user_id:s.user_id,level:"info",event:`Testnet ${side} order filled`,details:{symbol:s.symbol,quantity:qty,price:fill,signal,realized_pnl:realized}});
   await db.from("bot_settings").update({last_run_at:new Date().toISOString(),last_signal:signal}).eq("user_id",s.user_id);
   results.push({user_id:s.user_id,status:"order_filled",side,symbol:s.symbol,quantity:qty,price:fill,realized_pnl:realized});
  }catch(e){
   const message=e instanceof Error?e.message:"Worker error";
   await db.from("bot_events").insert({user_id:s.user_id,level:"error",event:"Trading worker error",details:{message:message.slice(0,180)}});
   results.push({user_id:s.user_id,status:"error",message:message.slice(0,180)});
  }
 }
 return NextResponse.json({processed:results.length,results,mode:"testnet"});
}
