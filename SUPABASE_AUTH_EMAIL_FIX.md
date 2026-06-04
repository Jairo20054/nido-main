# Supabase Auth email delivery checklist

## MCP diagnosis - 2026-06-04 UTC

- Supabase MCP connection succeeded.
- Project reviewed: `NIDO` (`hoqcfprckuozcsnwzgei`), status `ACTIVE_HEALTHY`.
- Database access through MCP SQL succeeded.
- `auth.users` currently has 4 users and 4 distinct emails.
- All 4 users are already confirmed.
- 2 users have `confirmation_sent_at`; 2 older/imported or provider-linked users do not.
- Newest auth user was created on 2026-05-18 21:29:12 UTC.
- Last-24-hour Auth Logs show `/signup` requests with `status 200`, but the auth action is `user_repeated_signup`.
- Last-24-hour Auth Logs did not show SMTP errors, email rate-limit errors, invalid redirect URL errors, template errors, or provider send failures.
- One `/token` event showed `invalid_credentials`; that is a login/password issue, not an email delivery issue.
- Recent signup tests were not creating new users; they were repeated signup attempts for already-existing confirmed accounts.

Root cause found from MCP evidence:

The app could show a confirmation-email message after a repeated signup attempt, while Supabase logged `user_repeated_signup` and did not create a new user or update `confirmation_sent_at`. For confirmed existing users, a new signup request is not proof that a new confirmation email was sent.

Code mitigation applied:

- Detect repeated signup responses where `data.user.identities` is an empty array.
- Do not show the "confirmation email sent" message for that case.
- Keep the resend button only for flows that look like a new pending confirmation.

MCP limitations:

- The available Supabase MCP tools did not expose direct reads for Auth URL Configuration, Email Templates, or SMTP Settings.
- Those dashboard-only settings must still be verified manually using the sections below.

## Current code status

- The frontend signup form sends the current `form.email` value to Supabase.
- Signup normalizes email with `trim().toLowerCase()` before `supabase.auth.signUp`.
- Password reset normalizes the typed email before `resetPasswordForEmail`.
- Signup and resend use `emailRedirectTo`.
- The app has confirmation and callback routes:
  - `http://localhost:5173/email-confirmed`
  - `http://localhost:5173/auth/callback`
  - `http://localhost:5173/reset-password`

## Supabase Dashboard checks

Go to Supabase Dashboard > Authentication > Providers > Email:

- Enable Email provider.
- Enable Confirm email if users must confirm before login.
- Confirm the templates are enabled.

Go to Supabase Dashboard > Authentication > URL Configuration:

- Site URL for local development: `http://localhost:5173`
- Site URL for production: the primary NIDO production domain.

Allowed Redirect URLs to add:

```txt
http://localhost:5173/**
http://localhost:5173/auth/callback
http://localhost:5173/email-confirmed
http://localhost:5173/reset-password

https://nido-main-git-main-jairo20054s-projects.vercel.app/**
https://nido-main-git-main-jairo20054s-projects.vercel.app/auth/callback
https://nido-main-git-main-jairo20054s-projects.vercel.app/email-confirmed
https://nido-main-git-main-jairo20054s-projects.vercel.app/reset-password

https://nido-main-3panswbon-jairo20054s-projects.vercel.app/**
https://nido-main-3panswbon-jairo20054s-projects.vercel.app/auth/callback
https://nido-main-3panswbon-jairo20054s-projects.vercel.app/email-confirmed
https://nido-main-3panswbon-jairo20054s-projects.vercel.app/reset-password
```

If NIDO has a custom production domain, add exact production paths too:

```txt
https://DOMINIO_REAL_DE_NIDO/auth/callback
https://DOMINIO_REAL_DE_NIDO/email-confirmed
https://DOMINIO_REAL_DE_NIDO/reset-password
```

## Email templates

Review these templates in Authentication > Email Templates:

- Confirm signup
- Magic Link
- Reset Password
- Change Email

The confirmation button/link must use Supabase dynamic variables. Prefer `{{ .ConfirmationURL }}` when available. If the template builds the URL manually and uses `redirectTo`, ensure it uses `{{ .RedirectTo }}` rather than a hardcoded localhost or old production URL.

There must be no hardcoded recipient email, old domain, or localhost-only link inside the templates.

## Auth Logs

After each test signup/reset/resend, check Authentication > Logs for:

- `Error sending confirmation email`
- `SMTP`
- `rate limit`
- `invalid redirect URL`
- `Email rate limit exceeded`
- `Unable to process request`
- `provider`
- `confirmation`

If the log says Supabase handed the email to the provider, continue debugging in the SMTP/email provider logs.

## SMTP recommendation

Supabase's built-in email provider is suitable for demos and has low limits. For production, configure a custom SMTP provider in Project Settings > Auth > SMTP Settings.

Recommended providers: Resend, SendGrid, Mailgun, Amazon SES, or Mailtrap for test environments.

Required checks:

- Host and port are correct.
- Username and password/API key are correct.
- Sender email is verified.
- Sending domain is verified.
- SPF and DKIM are configured.
- DMARC is recommended.

Never put SMTP credentials in frontend environment variables.

## Vercel environment variables

In Vercel Dashboard > Project > Settings > Environment Variables, set these for Production and Preview:

```txt
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SITE_URL
VITE_SUPABASE_EMAIL_CONFIRMATION_URL
VITE_SUPABASE_OAUTH_REDIRECT_URL
VITE_SUPABASE_REDIRECT_URL
```

Production values must point to the production app, not localhost. Preview values can use Vercel preview URLs or rely on `VITE_VERCEL_URL` where appropriate.
