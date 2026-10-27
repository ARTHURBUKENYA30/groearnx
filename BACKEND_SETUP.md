# GroEarnX backend setup

GroEarnX is currently a static HTML/CSS/JavaScript site. This repository adds Vercel serverless API routes for health checks, contact enquiries, and newsletter subscriptions, backed by Supabase Postgres.

## Routes

- `GET /api/health` — API status and whether storage environment variables are configured. This is not a database connectivity check.
- `POST /api/contact` — validates and stores contact enquiries.
- `POST /api/newsletter` — validates and stores newsletter subscriptions.

## Deploy setup

1. Keep the project deployed on Vercel with this repository as its source.
2. Create a Supabase project.
3. Run `supabase/schema.sql` in the Supabase SQL Editor.
4. In Vercel Project Settings → Environment Variables, add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for Production and Preview as appropriate. The service-role key is secret and must never be put in frontend JavaScript.
5. Redeploy the Vercel project after setting the variables.
6. Open `/api/health`. Confirm `storage` is `configured`, then submit a real test contact form and newsletter form and confirm rows arrive in Supabase.

## Local verification

The API routes use the Vercel Node.js function convention and Node's built-in `fetch`; no application dependencies are required. Use Vercel CLI to run the project locally if desired. Without the Supabase environment variables, write endpoints deliberately return HTTP 503 instead of pretending that submissions were saved.

## Security notes

- Server-side validation and payload size limits are applied.
- Database writes use the server-only Supabase service-role key.
- Public/anonymous table access is revoked by the SQL schema.
- Before production marketing traffic, add a persistent rate limit / bot protection provider and a privacy notice/retention policy. Do not use this starter backend to process deposits, wallets, crypto transfers, or investment balances; those need a separately designed and audited financial backend.
