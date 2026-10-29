"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Market = {
  symbol: string;
  name: string;
  pair: string;
  price: number;
  changePercent: number;
};

type Props = { variant: "home" | "dashboard" };

const initialMarkets: Market[] = [
  { symbol: "BTCUSDT", name: "Bitcoin", pair: "BTC/USDT", price: 67482.1, changePercent: 2.41 },
  { symbol: "ETHUSDT", name: "Ethereum", pair: "ETH/USDT", price: 3521.84, changePercent: 1.08 },
  { symbol: "SOLUSDT", name: "Solana", pair: "SOL/USDT", price: 174.26, changePercent: -0.63 },
  { symbol: "BNBUSDT", name: "BNB", pair: "BNB/USDT", price: 598.2, changePercent: 0.86 },
  { symbol: "XRPUSDT", name: "XRP", pair: "XRP/USDT", price: 0.6241, changePercent: 0.42 },
];

const assetStyle: Record<string, { glyph: string; tone: string }> = {
  BTCUSDT: { glyph: "₿", tone: "orange" },
  ETHUSDT: { glyph: "◆", tone: "violet" },
  SOLUSDT: { glyph: "◎", tone: "teal" },
  BNBUSDT: { glyph: "◆", tone: "yellow" },
  XRPUSDT: { glyph: "✕", tone: "teal" },
};

function priceLabel(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
}

function changeLabel(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export default function LiveMarketTable({ variant }: Props) {
  const [markets, setMarkets] = useState(initialMarkets);
  const [status, setStatus] = useState<"sample" | "live" | "unavailable">("sample");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadMarkets = async () => {
      try {
        const response = await fetch("/api/market", { cache: "no-store" });
        if (!response.ok) throw new Error("Market feed unavailable");
        const payload = await response.json();
        if (!Array.isArray(payload.markets) || payload.markets.length !== initialMarkets.length) {
          throw new Error("Market feed response incomplete");
        }

        const nextMarkets: Market[] = payload.markets;
        if (!active || nextMarkets.some((item) => !Number.isFinite(item.price) || !Number.isFinite(item.changePercent))) return;
        setMarkets(nextMarkets);
        setStatus("live");
        setUpdatedAt(typeof payload.updatedAt === "string" ? payload.updatedAt : null);
      } catch {
        if (active) setStatus((current) => current === "live" ? "live" : "unavailable");
      }
    };

    void loadMarkets();
    const timer = window.setInterval(() => void loadMarkets(), 60_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const statusText = status === "live"
    ? `LIVE · Binance public data${updatedAt ? ` · Updated ${new Date(updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}`
    : status === "unavailable"
      ? "LIVE FEED UNAVAILABLE · Showing illustrative fallback values"
      : "CONNECTING TO LIVE FEED · Illustrative values shown until connected";

  if (variant === "home") {
    return <>
      <div className="market-feed-status" role="status" aria-live="polite">{statusText}</div>
      <div className="market-table">
        <div className="market-row table-head"><span>Asset</span><span>Price</span><span>24h change</span><span/></div>
        {markets.map((market) => {
          const style = assetStyle[market.symbol] ?? { glyph: "•", tone: "teal" };
          return <div className="market-row" key={market.symbol}>
            <div className="asset"><span className={`coin ${style.tone}`}>{style.glyph}</span><span><b>{market.name}</b><small>{market.symbol.replace("USDT", "")}</small></span></div>
            <b>{priceLabel(market.price)}</b>
            <span className={market.changePercent >= 0 ? "positive" : "negative"}>{changeLabel(market.changePercent)}</span>
            <Link href="/signup" aria-label={`Explore ${market.name}`}>↗</Link>
          </div>;
        })}
      </div>
    </>;
  }

  return <>
    <div className="market-feed-status" role="status" aria-live="polite">{statusText}</div>
    <div className="table-scroll"><table className="trading-table">
      <thead><tr><th>Asset</th><th>Pair</th><th>Price</th><th>24h change</th></tr></thead>
      <tbody>{markets.map((market) => <tr key={market.symbol}>
        <td>{market.name}</td><td>{market.pair}</td><td>{priceLabel(market.price)}</td>
        <td className={market.changePercent >= 0 ? "positive" : "negative"}>{changeLabel(market.changePercent)}</td>
      </tr>)}</tbody>
    </table></div>
  </>;
}
