# Environment variables

## Rules

- **Server-only secrets** go in `.env.local` and must **not** start with `NEXT_PUBLIC_`.
- Only use `NEXT_PUBLIC_*` for values that are safe to expose to the browser.

## Variables used by this project

### Authentication

- **`AUTH_SECRET`** (server-only, required)\n
  Used to sign and verify the HttpOnly session cookie (`yalla_session`).

### App origin (server fetch)

- **`APP_URL`** (server-only, recommended)\n
  Used by `lib/api/client.ts` to build absolute URLs when server-side code calls `/api/*`.
\n
  Alternatives:\n
  - `NEXT_PUBLIC_APP_URL` (if you want to share a single value in both server + client)\n
  - `VERCEL_URL` is used automatically on Vercel if set.

### Marketing lead capture (n8n)

- **`GOOGLE_SHEETS_WEBHOOK_URL`** (server-only, recommended)\n
  Used by lead-capture endpoints to forward submissions to your automation / sheet backend.

- **`N8N_WEBHOOK_URL`** (server-only, legacy)\n
  Used by:\n
  - `app/api/register-cphq/route.ts`\n
  - `app/api/webinar-register/route.ts`

### Payments

- **`NEXT_PUBLIC_PAYPAL_CLIENT_ID`** (public)\n
  Used by `components/features/checkout/PayCreditPaypalView.tsx`.

## Local setup

Use `.env.example` as a template.\n
Create `.env.local` and fill the required variables.

