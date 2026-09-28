# Dandeli Direct

Booking platform prototype for verified Dandeli stays and reserved activities.

## Run locally

```powershell
npm install
npm run dev
```

Open `http://localhost:3000` for the guest site and `/partner` for the partner portal.

Without Supabase environment variables, the app uses its local in-memory store so the UI and API can be explored immediately.

## Connect Supabase

1. Create a Supabase project.
2. Open the Supabase SQL editor and run [`supabase/schema.sql`](supabase/schema.sql).
3. Copy `.env.example` to `.env.local`.
4. Set these values from Supabase project settings:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
QR_SECRET=long-random-secret
```

The service role key must only be used on the server and must never be exposed through `NEXT_PUBLIC_` variables.

When configured, the API uses Supabase for verified property search, atomic ten-minute inventory locks, booking persistence, escrow ledger records, and voucher check-in verification.

## Validation

```powershell
npm run build
```
