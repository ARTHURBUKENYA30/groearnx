# GROEANRX testnet trading engine

## Current safety state
- Binance Spot **Testnet only**. No live-money endpoint is enabled.
- The scheduled worker runs once per minute through the Supabase Edge Function `groearnx-trading`.
- The worker uses server-side Supabase credentials supplied by the Edge Function runtime; no service-role key is stored in Vercel or GitHub.
- Exchange API credentials are encrypted using AES-256-GCM. The encryption key and worker authorization secret are stored in Supabase Vault and are readable only through a service-role-only SQL function.
- Trade records include commission values. Realized P/L deducts quote-asset fees and includes base-asset commissions in the position cost basis / quantity consumed.
- Bot settings are saved stopped by default. Starting requires a verified Binance Spot Testnet connection.

## User setup required before test trades
1. Create a Binance Spot Testnet account at https://testnet.binance.vision/.
2. Generate a **Testnet** API key.
3. Enable Spot trading only and keep withdrawals disabled.
4. Sign in to GROEANRX and enter the Testnet key and secret in the Binance trading panel. Never paste exchange secrets into chat or GitHub.
5. Save conservative risk settings and start the testnet bot only after confirming the connection.

## Runtime
- `GET /api/trading/connection`: authenticated connection metadata.
- `POST /api/trading/connection`: verifies and encrypts testnet credentials.
- `DELETE /api/trading/connection`: disables the bot and disconnects the exchange.
- `GET /api/trading/bot`: settings, recent events, orders, trades, position and realized P/L.
- `PUT /api/trading/bot`: validates and saves settings; leaves the bot stopped.
- `POST /api/trading/bot`: starts the testnet worker for the account.
- `DELETE /api/trading/bot`: emergency stop.
- Supabase cron calls `/functions/v1/groearnx-trading?action=worker` every minute. The Edge Function validates the Vault-stored worker secret.

## Strategy and risk notes
- EMA 9/21 crossover on completed one-minute candles.
- Stop-loss and take-profit are checked by the recurring worker; they are not guaranteed exchange-native stop orders and can slip between checks.
- Daily loss limit is calculated from realized net P/L, including recorded trading fees, and pauses the bot when the configured limit is reached.
- Only USDT-quoted pairs are accepted for the worker so the daily loss limit and fee accounting share a consistent quote currency.
- Worker locks and deterministic Binance client order IDs reduce concurrent and retry duplicate-order risk.
- The database is the bot's ledger; after any exchange/database error, reconcile exchange order history and balances before restarting.

## Not yet verified
No user Binance Testnet API credentials were present during this deployment session, so real BUY/SELL fills, account-balance reconciliation, stop-loss/take-profit triggers, daily-loss auto-pause and emergency-stop behavior still require end-to-end tests with a funded Testnet account. Real-money trading remains disabled.
