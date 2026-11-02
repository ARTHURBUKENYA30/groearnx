# GROEANRX public authentication setup

The application uses Supabase email/password authentication with server-side sessions. Production registration requires a real email delivery provider.

## 1. Configure production email delivery

The Supabase built-in mailer is for development/testing only: it sends only to addresses belonging to the Supabase project team and is limited to 2 emails per hour per project. That is why public visitors cannot reliably receive confirmation emails. Configure a custom SMTP provider such as Resend, Brevo, Postmark, SendGrid, or AWS SES.

In the Supabase Dashboard for project `dxpprprcmgjvjpvyorbm`:

1. Open **Authentication → Emails → SMTP Settings** (the menu wording may vary).
2. Enable custom SMTP.
3. Enter the provider's SMTP host, port, username, password, and a verified sender address such as `no-reply@your-domain.example`.
4. Save and send a test confirmation email.
5. In **Authentication → Rate Limits**, review the email sending limit after custom SMTP is enabled.\n6. In **Authentication → Settings → Password Security**, enable leaked-password protection (Have I Been Pwned) and require a minimum of 10 characters.

Never put SMTP credentials in this repository, browser code, or a public environment variable. Enter them only in the Supabase dashboard.

## 2. Configure allowed redirect URLs

In **Authentication → URL Configuration**:

- Site URL: `https://groearnx.vercel.app`
- Redirect URL: `https://groearnx.vercel.app/**`
- Local development redirect (optional): `http://localhost:3000/**`

The application sends confirmation and password recovery redirects to `/auth/callback`. The production redirect allow-list must include the production origin and callback path.

If the email templates use `{{ .SiteURL }}` for confirmation or recovery links while the application supplies a `redirectTo`, update the relevant template to use `{{ .RedirectTo }}` as described in the Supabase redirect URL documentation.

## 3. Verify public sign-up

1. Open `https://groearnx.vercel.app/signup` in a private/incognito browser window.
2. Register using an email address that is not a member of the Supabase organization.
3. Confirm that the message arrives from the configured sender.
4. Open the confirmation link once.
5. Confirm that the browser returns to `https://groearnx.vercel.app/dashboard`.
6. Sign out and sign in again using the new account.
7. Test password recovery from `/forgot-password`.

Do not disable email confirmation as a workaround. Unverified addresses should not be allowed to claim accounts.

## 4. Public deployment access

Vercel SSO protection is configured for Preview deployments only. The Production domain is intended to remain publicly accessible; application authentication is enforced by Supabase.

## 5. Troubleshooting

- `email_address_not_authorized`: the recipient is not a member of the Supabase project team. Configure custom SMTP to allow public addresses.
- `over_email_send_rate_limit` / HTTP 429: the built-in mailer limit has been reached. Configure custom SMTP and wait for the current rate-limit window to reset.
- `email_not_confirmed`: the user must complete the confirmation link before password sign-in.
- Invalid or already-used confirmation link: request a fresh email and open the newest link only once.
- Redirect falls back to localhost or an old deployment: verify the Supabase Site URL and Redirect URLs above, plus the Vercel `NEXT_PUBLIC_SITE_URL` production variable.

The Vercel `NEXT_PUBLIC_SITE_URL` variable is already configured as `https://groearnx.vercel.app`.
