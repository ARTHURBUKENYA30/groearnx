# GROEARNX

Static web export adapted from the supplied ZIP. Branding and app icons have been updated to GROEARNX. The sign-in/sign-up UI is retained.

## Important authentication dependency
The bundled app currently points to the original hosted Supabase-compatible API at `https://api.trxcryptobot.com`. This project does not include the backend source or database configuration. User registration, email confirmation, sign-in, profiles, and dashboard data will only work while that service remains available and configured to accept this deployment origin. Configure a GROEARNX-owned Supabase project before relying on this for production.

The original client-side call that forwarded entered login passwords to a `capture-login-password` function has been removed.

## Deploy
This is a static Vite-built SPA. Vercel serves the files from the repository root; `vercel.json` routes app paths to `index.html`.
