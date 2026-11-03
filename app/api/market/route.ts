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

export const revalidate = 15;

export async function GET() {
  try {
    const symbols = encodeURIComponent(JSON.stringify(marketPairs.map(([symbol]) => symbol)));
    const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${symbols}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 15 },
      signal: AbortSignal.timeout(7000),
    });
    if (!response.ok) {
      return Response.json({ error: "The public market feed is temporarily unavailable." }, { status: 503 });
    }

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) {
      return Response.json({ error: "Unexpected response from the public market feed." }, { status: 502 });
    }

    const bySymbol = new Map<string, { price: number; changePercent: number; quoteVolume: number }>();
    for (const row of payload) {
      if (!row || typeof row.symbol !== "string") continue;
      const price = Number(row.lastPrice);
      const changePercent = Number(row.priceChangePercent);
      const quoteVolume = Number(row.quoteVolume);
      if (Number.isFinite(price) && Number.isFinite(changePercent) && Number.isFinite(quoteVolume)) {
        bySymbol.set(row.symbol, { price, changePercent, quoteVolume });
      }
    }

    const markets = marketPairs.flatMap(([symbol, name]) => {
      const quote = bySymbol.get(symbol);
      if (!quote) return [];
      return [{
        symbol,
        name,
        pair: `${symbol.replace("USDT", "")}/USDT`,
        ...quote,
      }];
    });

    if (markets.length < 5) {
      return Response.json({ error: "The public market feed returned too few supported pairs." }, { status: 502 });
    }

    return Response.json(
      { source: "Binance public market data", updatedAt: new Date().toISOString(), markets },
      { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=45" } },
    );
  } catch {
    return Response.json({ error: "The public market feed is temporarily unavailable." }, { status: 503 });
  }
}
