# GROEARNX trading foundation

## Current safety state
- Binance Spot **Testnet only**.
- Bot starts disabled and the API refuses to start it until a background execution worker is installed.
- No live-money order endpoint exists in this release.
- Exchange keys are encrypted with AES-256-GCM on the server. They are never returned by an API route.
- The database stores only encrypted credentials. Do not add credentials to Git, browser storage, chat, or screenshots.

## Required Vercel environment variables
1. `NEXT_PUBLIC_SUPABASE_URL` (already configured for the app)
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` (already configured for the app)
3. `SUPABASE_SERVICE_ROLE_KEY` (server-only; never prefix with NEXT_PUBLIC)
4. `GROEARNX_ENCRYPTION_KEY` (server-only 64-character hexadecimal value)

Generate the encryption key locally with:
```bash
openssl rand -hex 32
```
Add it in Vercel Project → Settings → Environment Variables for Production and Preview as needed. Never commit the value. Back it up securely; losing it makes saved exchange credentials unrecoverable.

## Connect Binance Spot Testnet
1. Create a Spot Testnet account at https://testnet.binance.vision/
2. Generate a testnet API key.
3. Enable spot trading only. Disable withdrawals.
4. Enter the key and secret only into the authenticated GROEARNX exchange connection form (once the form is deployed).
5. The connection API verifies the account, encrypts the credentials, and stores them server-side.

## API
- `GET /api/trading/connection`: connection metadata only.
- `POST /api/trading/connection`: verifies and stores testnet credentials.
- `DELETE /api/trading/connection`: disconnects and stops the bot.
- `GET /api/trading/bot`: settings, recent audit events, and orders.
- `PUT /api/trading/bot`: validates and saves conservative testnet settings; always leaves bot stopped.
- `DELETE /api/trading/bot`: emergency stop.

## Not yet enabled
A recurring worker, strategy evaluation, position reconciliation, exchange order placement, realized-P/L accounting, daily loss enforcement against exchange fills, and full end-to-end test coverage still need implementation and verification. Do not enable live trading before these pass on testnet.
