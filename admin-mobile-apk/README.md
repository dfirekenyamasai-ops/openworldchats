# OpenWorld Admin Mobile APK

Android-focused mobile app for admin payment monitoring with realtime alerts from Supabase.

## Features

- Realtime subscription to `payment_requests` (`status = pending`)
- Local notification when a new payment request is created
- Quick button to open web admin console
- Live feed of latest requests and pending count

## Setup

1. Install dependencies:
   - `npm install`
2. Run locally:
   - `npm run dev`
3. Build web bundle:
   - `npm run build`

## Build Android APK

1. Sync Capacitor Android project:
   - `npm run cap:sync`
2. Open Android Studio:
   - `npm run cap:open`
3. In Android Studio:
   - Build > Build Bundle(s) / APK(s) > Build APK(s)

Or run helper:
- `npm run apk:debug`

## Supabase Requirements

Enable Realtime for `public.payment_requests`, then run:

```sql
create table if not exists public.payment_requests (
  id bigserial primary key,
  name text,
  phone text not null,
  mpesa_code text not null,
  status text not null default 'pending',
  approved_by text,
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create unique index if not exists uniq_payment_requests_phone_code
  on public.payment_requests (phone, mpesa_code);
```
