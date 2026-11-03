const marketPairs = [
  ["ZECUSDT","Zcash"],["PAXGUSDT","PAX Gold"],["LSKUSDT","Lisk"],["AEROUSDT","Aerodrome"],["DASHUSDT","Dash"],
  ["JSTUSDT","JUST"],["NIGHTUSDT","Midnight"],["CAKEUSDT","PancakeSwap"],["MUBARAKUSDT","Mubarak"],["ZENUSDT","Horizen"],
  ["TUTUSDT","Tutorial"],["LUMIAUSDT","Lumia"],["AVAUSDT","Travala"],["DUSKUSDT","Dusk"],["FFUSDT","Falcon Finance"],
  ["ATUSDT","APRO"],["GUNUSDT","Gunzilla"],["TWTUSDT","Trust Wallet"],["ALLOUSDT","Allora"],["STOUSDT","StakeStone"],
  ["LITUSDT","Lighter"],["VELOUSDT","Velo"],["LISTAUSDT","Lista"],["BTCUSDT","Bitcoin"],["ETHUSDT","Ethereum"],
  ["SOLUSDT","Solana"],["XRPUSDT","XRP"],["NEARUSDT","NEAR"],["BNBUSDT","BNB"],["UUSDT","United Stables"],
  ["SNDKUSDT","Sandisk"],["PEPEUSDT","Pepe"],["UNIUSDT","Uniswap"],["SPKUSDT","Spark"],["TRXUSDT","TRON"],
  ["RWDUSDT","Reward"],["SCKUSDT","Sick"],["HYPEUSDT","Hyperliquid"],["INTCUSDT","Intuition"],["DOGEUSDT","Dogecoin"],
  ["LINKUSDT","Chainlink"],["ENAUSDT","Ethena"],["AAVEUSDT","Aave"],["XAUTUSDT","Tether Gold"],["SUIUSDT","Sui"],
  ["GOOGLBUSDT","Google Token"],["MUBUSDT","Mub"],["NVDAXUSDT","Nvidia Token"],["CRCLUSDT","Circle"],["MSTRUSDT","MicroStrategy"],
  ["WLDUSDT","Worldcoin"],["AVAXUSDT","Avalanche"],["VETUSDT","VeChain"],["ALGOUSDT","Algorand"],["APTUSDT","Aptos"],
] as const;

export const revalidate = 60;

export async function GET() {
  try {
    // CoinPaprika provides global USD reference prices and is reachable from the
    // Vercel production region where Binance's public API returns HTTP 451.
    const response = await fetch("https://api.coinpaprika.com/v1/tickers?quotes=USD&limit=500", {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      return Response.json({ error: "The public market reference feed is temporarily unavailable." }, { status: 503 });
    }

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) {
      return Response.json({ error: "Unexpected response from the public market reference feed." }, { status: 502 });
    }

    const bySymbol = new Map<string, { name: string; rank: number; price: number; changePercent: number; quoteVolume: number }>();
    for (const row of payload) {
      if (!row || typeof row.symbol !== "string" || !row.quotes?.USD) continue;
      const price = Number(row.quotes.USD.price);
      const changePercent = Number(row.quotes.USD.percent_change_24h);
      const quoteVolume = Number(row.quotes.USD.volume_24h);
      if (!Number.isFinite(price) || !Number.isFinite(changePercent) || !Number.isFinite(quoteVolume)) continue;
      const rank = Number(row.rank) || Number.MAX_SAFE_INTEGER;
      const existing = bySymbol.get(row.symbol.toUpperCase());
      // If a ticker symbol is reused, prefer the higher-ranked asset.
      if (!existing || rank < existing.rank) {
        bySymbol.set(row.symbol.toUpperCase(), { name: String(row.name ?? row.symbol), rank, price, changePercent, quoteVolume });
      }
    }

    const markets = marketPairs.flatMap(([pairSymbol, fallbackName]) => {
      const assetSymbol = pairSymbol.replace(/USDT$/, "");
      const quote = bySymbol.get(assetSymbol);
      if (!quote) return [];
      return [{
        symbol: pairSymbol,
        name: quote.name || fallbackName,
        pair: `${assetSymbol}/USDT`,
        price: quote.price,
        changePercent: quote.changePercent,
        quoteVolume: quote.quoteVolume,
      }];
    });

    if (markets.length < 5) {
      return Response.json({ error: "The public market reference feed returned too few supported assets." }, { status: 502 });
    }

    return Response.json(
      {
        source: "CoinPaprika global market reference data",
        updatedAt: new Date().toISOString(),
        markets,
        note: "Indicative USD reference prices; not exchange order quotes or trade execution prices.",
      },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } },
    );
  } catch {
    return Response.json({ error: "The public market reference feed is temporarily unavailable." }, { status: 503 });
  }
}
