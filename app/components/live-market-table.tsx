"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Star, ArrowUpRight } from "lucide-react";

type Market = {
  symbol: string;
  name: string;
  pair: string;
  price: number;
  changePercent: number;
  quoteVolume?: number;
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

function volumeLabel(value?: number) {
  if (!Number.isFinite(value)) return "—";
  const amount = Number(value);
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount.toFixed(0)}`;
}

function changeLabel(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export default function LiveMarketTable({ variant }: Props) {
  const [markets, setMarkets] = useState(initialMarkets);
  const [status, setStatus] = useState<"sample" | "live" | "unavailable">("sample");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "gainers" | "losers" | "favorites">("all");
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    const loadMarkets = async () => {
      try {
        const response = await fetch("/api/market", { cache: "no-store" });
        if (!response.ok) throw new Error("Market feed unavailable");
        const payload = await response.json();
        if (!Array.isArray(payload.markets) || payload.markets.length < 5) throw new Error("Market feed response incomplete");
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
    const timer = window.setInterval(() => void loadMarkets(), 30_000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const filteredMarkets = useMemo(() => markets
    .filter((market) => {
      const matchesQuery = `${market.pair} ${market.name}`.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === "all" ||
        (filter === "gainers" && market.changePercent > 0) ||
        (filter === "losers" && market.changePercent < 0) ||
        (filter === "favorites" && favorites.includes(market.symbol));
      return matchesQuery && matchesFilter;
    })
    .sort((a, b) => filter === "gainers" ? b.changePercent - a.changePercent :
      filter === "losers" ? a.changePercent - b.changePercent : 0), [markets, query, filter, favorites]);

  const statusText = status === "live"
    ? `LIVE · CoinPaprika global prices · reference only${updatedAt ? ` · Updated ${new Date(updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}`
    : status === "unavailable"
      ? "LIVE PRICE FEED UNAVAILABLE · Showing illustrative fallback values"
      : "CONNECTING TO LIVE PRICE FEED · Illustrative values shown until connected";

  return <>
    <div className="market-toolbar">
      <div className="market-search"><Search size={13}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search markets"/></div>
      <div className="market-filter-pills">
        {(["all", "gainers", "losers", "favorites"] as const).map((key) =>
          <button key={key} className={filter === key ? "active" : ""} onClick={() => setFilter(key)}>
            {key === "all" ? "All" : key === "gainers" ? "Gainers" : key === "losers" ? "Losers" : "☆ Favorites"}
          </button>
        )}
      </div>
    </div>
    <div className={`market-feed-status ${status}`} role="status" aria-live="polite">{statusText}</div>
    <div className="market-table">
      <div className="market-row table-head"><span>Pair</span><span>Price</span><span>24h</span><span>Vol.</span></div>
      {filteredMarkets.map((market) => {
        const style = assetStyle[market.symbol] ?? { glyph: market.symbol.slice(0, 1), tone: "teal" };
        return <div className="market-row" key={market.symbol}>
          <div className="asset"><button className={`market-star ${favorites.includes(market.symbol) ? "saved" : ""}`} onClick={() => setFavorites((current) => current.includes(market.symbol) ? current.filter((item) => item !== market.symbol) : [...current, market.symbol])} aria-label={`${favorites.includes(market.symbol) ? "Remove" : "Add"} ${market.pair} ${favorites.includes(market.symbol) ? "from" : "to"} favorites`}><Star size={10}/></button><span className={`coin ${style.tone}`}>{style.glyph}</span><span><b>{market.pair}</b><small>{market.name}</small></span></div>
          <b>{priceLabel(market.price)}</b>
          <span className={market.changePercent >= 0 ? "positive" : "negative"}>{changeLabel(market.changePercent)}</span>
          <small className="market-volume">{volumeLabel(market.quoteVolume)}</small>
        </div>;
      })}
      {filteredMarkets.length === 0 && <div className="market-empty">No markets match this filter.</div>}
    </div>
    {variant === "home" && <div className="market-view-all"><Link href="/dashboard?tab=market">Open full market list <ArrowUpRight size={12}/></Link></div>}
  </>;
}
