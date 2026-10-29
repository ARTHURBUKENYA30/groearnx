# GROEARNX

Responsive Next.js starter with server-side Supabase authentication.

## Setup
1. Install Node.js 20.9+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and configure the Supabase URL, publishable/anon key, and site URL.
4. In Supabase Authentication → URL Configuration, add `http://localhost:3000/auth/callback` to allowed redirects; add the production callback before deploying.
5. Enable Email auth and configure SMTP/confirmation email if required.
6. Run `npm run dev` and visit `http://localhost:3000`.

## Status
Signup, password login, email callback, session refresh, protected dashboard routing, and logout are implemented, but **live auth has not been configured or tested** because no Supabase project credentials were provided. Market/portfolio values are illustrative only. No live market feed, trades, deposits, withdrawals, or crypto custody are implemented. The existing `a.zip` is retained; its screenshots could not be inspected through the text-file interface, so screenshot-perfect matching is not verified.

## Production checklist
Configure environment variables and redirect URLs, SMTP, recovery and rate limits; add database tables and Row Level Security before storing user data; run production build and end-to-end tests. Real financial operations require audited backend services, ledgering, authorization, reconciliation, and security review.