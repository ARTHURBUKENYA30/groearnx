const marketPairs = [
  { symbol: "BTCUSDT", name: "Bitcoin", pair: "BTC/USDT" },
  { symbol: "ETHUSDT", name: "Ethereum", pair: "ETH/USDT" },
  { symbol: "SOLUSDT", name: "Solana", pair: "SOL/USDT" },
  { symbol: "BNBUSDT", name: "BNB", pair: "BNB/USDT" },
  { symbol: "XRPUSDT", name: "XRP", pair: "XRP/USDT" },
] as const;

export const revalidate = 15;

export async function GET() {
  try {
    const symbols = encodeURIComponent(JSON.stringify(marketPairs.map((item) => item.symbol)));
    const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${symbols}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 15 },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return Response.json({ error: "The public market feed is temporarily unavailable." }, { status: 503 });
    }

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) {
      return Response.json({ error: "Unexpected response from the public market feed." }, { status: 502 });
    }

    const bySymbol = new Map<string, { lastPrice: string; priceChangePercent: string }>();
    for (const row of payload) {
      if (
        row &&
        typeof row.symbol === "string" &&
        typeof row.lastPrice === "string" &&
        typeof row.priceChangePercent === "string" &&
        Number.isFinite(Number(row.lastPrice)) &&
        Number.isFinite(Number(row.priceChangePercent))
      ) {
        bySymbol.set(row.symbol, { lastPrice: row.lastPrice, priceChangePercent: row.priceChangePercent });
      }
    }

    const markets = marketPairs.flatMap((item) => {
      const quote = bySymbol.get(item.symbol);
      if (!quote) return [];
      return [{
        ...item,
        price: Number(quote.lastPrice),
        changePercent: Number(quote.priceChangePercent),
      }];
    });

    if (markets.length !== marketPairs.length) {
      return Response.json({ error: "The public market feed returned incomplete data." }, { status: 502 });
    }

    return Response.json(
      { source: "Binance public market data", updatedAt: new Date().toISOString(), markets },
      { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=45" } },
    );
  } catch {
    return Response.json({ error: "The public market feed is temporarily unavailable." }, { status: 503 });
  }
}
