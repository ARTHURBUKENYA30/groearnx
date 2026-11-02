# GROEANRX

GROEANRX is a responsive Next.js crypto-trading workspace with Supabase email/password authentication, a protected dashboard, live public market data, and a Binance Spot Testnet bot workflow.

## Local setup

1. Install Node.js 20.9 or later.
2. Copy `.env.example` to `.env.local`.
3. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL`.
4. In Supabase Authentication → URL Configuration, set the Site URL to your app origin and allow the `/auth/callback` path.
5. Configure custom SMTP in Supabase Auth before enabling public registration and password recovery.
6. Run `npm install`, then `npm run dev`, and open `http://localhost:3000`.

## Authentication

- Email/password sign-up and login.
- Server-side session refresh and protected dashboard routing.
- Email confirmation resend, logout and password recovery.
- Redirect destination validation and generic password-reset responses.
- Public sign-up requires a verified custom SMTP provider. Supabase's built-in mailer only sends to project-team addresses and has a very low sending limit. Do not disable email confirmation as a workaround.

## Trading runtime

- Binance Spot **Testnet only**; no live-money order endpoint is enabled.
- Server-side trading operations run in the Supabase Edge Function `groearnx-trading`.
- Supabase cron invokes the worker once per minute.
- Exchange API credentials are encrypted with AES-256-GCM; the encryption key and worker authorization secret are stored in Supabase Vault.
- EMA 9/21 crossover strategy on completed one-minute candles.
- Configurable order size, stop-loss, take-profit and daily loss limit.
- Order records include commission data; realized P/L accounts for quote-asset fees and base-asset commissions.
- Worker locks, Binance client order IDs, post-order balance-delta checks and partial-fill pauses reduce execution/reconciliation risk.
- Stop-loss and take-profit are checked by the recurring worker, not exchange-native stop orders; execution can slip between checks.

## Required user setup for end-to-end trading tests

1. Create a Binance Spot Testnet account at https://testnet.binance.vision/.
2. Generate a Testnet API key with Spot trading permission and withdrawals disabled.
3. Sign in to GROEANRX and enter the Testnet key/secret only in the authenticated trading panel.
4. Configure conservative limits and start the testnet bot.
5. Verify a real testnet BUY and SELL, order history, balance reconciliation, fee-inclusive P/L, stop-loss, take-profit, daily loss pause, emergency stop and retry idempotency.

No Testnet API credentials were available during development, so those live exchange scenarios remain unverified. Real-money trading must remain disabled until all checks pass and an independent security review is complete.

## Deployment

Vercel uses the Next.js framework with automatic output settings. Configure these public app variables for Production and Preview:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

The Supabase Edge Function receives its service-role credential from the Supabase runtime; do not put the service-role key or Vault secrets in GitHub or public environment variables.

## Verification checklist

- Configure a verified SMTP sender and Supabase redirect allowlist.
- Run GitHub Actions type-check and production build.
- Verify sign-up, email confirmation, login, logout, password reset and protected routes with a real mailbox.
- Verify the Supabase worker cron returns successful responses.
- Perform the Testnet trading checks above using a funded Testnet account.
- Never enable live-money trading before exchange permissions, idempotency, fee accounting, balance reconciliation, loss limits, emergency stop, observability and independent security review have all passed.
