# GROEARNX

GROEARNX is a static single-page trading workspace deployed on Vercel and backed by the GROEARNX Supabase project.

## Production application

- Production URL: https://groearnx.vercel.app/
- Repository: https://github.com/ARTHURBUKENYA30/groearnx
- Hosting: Vercel
- Backend: Supabase project `dxpprprcmgjvjpvyorbm`
- Entry point: `index.html`
- Client application: `app.js`
- Styles: `styles.css`
- SPA route fallback: `vercel.json`

The repository root now contains the same entry point, JavaScript, and stylesheet used by the production deployment. Keep these files in sync when making changes.

## Authentication and account data

The client uses Supabase Auth for email/password registration, sign-in, persistent sessions, and password-reset requests. Authenticated reads are scoped by Supabase Row Level Security. Do not put service-role keys, exchange API secrets, or user passwords in client code or source control.

Supabase email-confirmation delivery, redirect allowlists, and a real end-to-end registration/login have not yet been verified. A newly registered user may need to confirm their email before signing in.

## Trading safety

- The trading Edge Function is `groearnx-trading`.
- A scheduled worker is configured to run once per minute.
- Worker execution supports paper simulation and Binance Spot Testnet paths.
- Testnet orders use test funds only.
- Real-money execution is not enabled or authorized by this frontend.
- Never commit exchange API credentials or server secrets.
- Do not describe a testnet or paper fill as a real-money trade.

Before enabling any automated testnet execution, verify testnet credentials, order fills, fee accounting, balance reconciliation, stop-loss/take-profit behavior, daily loss limits, emergency stop, and retry/idempotency handling.

## Deploy

The project is deployed from the GitHub `main` branch to Vercel. Vercel rewrites application routes to `index.html` using `vercel.json`.
