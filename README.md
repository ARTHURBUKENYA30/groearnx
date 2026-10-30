# GROEARNX

A responsive Next.js application with Supabase server-side authentication and a clearly labeled crypto-trading product preview.

## Local setup

1. Install Node.js 20.9 or later.
2. Copy `.env.example` to `.env.local`.
3. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL`.
4. In Supabase Authentication → URL Configuration, set the Site URL to your app origin and allow `/auth/callback` on that origin.
5. Configure production SMTP and email confirmation settings in Supabase Auth.
6. Run `npm install`, then `npm run dev`, and open `http://localhost:3000`.

## Authentication included

- Email/password sign-up and login
- Server-side session refresh and authenticated dashboard routing
- Logout
- Password recovery email flow and reset form
- Redirect destination validation
- Generic password-reset responses to avoid revealing whether an email is registered

Password reset and confirmation flows require the production URL and redirect allowlist to be configured in Supabase. Live end-to-end auth still needs to be verified using an actual account and a delivered email.

## Current product status

Implemented: responsive public landing page, account forms, protected dashboard, password recovery UI/actions, user-scoped watchlist add/remove, and portfolio quantity create/update/remove using existing Supabase tables and RLS policies.

Live market display: the dashboard requests 24-hour ticker data for BTC, ETH, SOL, BNB, and XRP from Binance's public market-data endpoint. The server route validates the response, times out after five seconds, and returns a clear unavailable response rather than presenting stale sample prices as live. The feed is cached briefly and still requires a production runtime smoke test.

Preview only: portfolio valuation, bot status, signal rows, strategy cards, and exchange/risk controls are illustrative or non-operational. The app does not place orders, execute trading bots, connect exchange accounts, generate actionable trading signals, or reconcile live positions. Do not enter exchange API keys into this preview.

Not yet production trading software: persistent bot configuration, exchange adapters and encrypted secret storage, signal generation, order/position reconciliation, risk-limit enforcement, emergency-stop execution, financial audit operations, and independent security review require dedicated implementation and testing.

## Production checklist

- Configure Supabase Site URL, callback allowlist, SMTP, password policies, leaked-password protection, and rate limits.
- Confirm RLS policies and table grants before adding user-owned records.
- Configure the correct Vercel production/preview environment variables.
- Run the GitHub Actions CI workflow and verify production deployment logs.
- Perform end-to-end tests for signup, email confirmation, login, logout, password reset, and protected routes.
- Do not enable real trading until exchange permissions, server-side secret encryption, rate limits, idempotent order submission, position reconciliation, loss limits, emergency stop, observability, and independent security review are complete.

## Deployment

Vercel should use the Next.js framework with Output Directory set to Automatic (leave it blank). Configure the following variables in the Vercel environments you use:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase publishable key or anon key)
- `NEXT_PUBLIC_SITE_URL` (the canonical app origin)

In Supabase Authentication → URL Configuration, set Site URL to the canonical production origin and add `https://YOUR_DOMAIN/auth/callback` to Redirect URLs. Add `http://localhost:3000/auth/callback` for local development.
