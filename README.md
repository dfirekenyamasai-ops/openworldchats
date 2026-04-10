# Open Worldchat

Monorepo layout:

| Path | Purpose |
|------|---------|
| `website/` | **Public user site** — landing redirect + signup / payment flow |
| `admin/` | **Web admin console** — approve payments, manage access |
| `admin-mobile-apk/` | **Android admin app** — realtime alerts + link to admin web |

## User site (local)

```bash
npm install
npm run dev
```

Then open [http://localhost:5173/website/signup.html](http://localhost:5173/website/signup.html) (or `/website/index.html`).

## Production (Vercel)

`vercel.json` rewrites keep old URLs working:

- `/` and `/signup.html` → user site under `website/`
- `/admin` and `/admin.html` → admin console under `admin/`

## Build

```bash
npm run build
```

Output is under `dist/` with the same `website/` and `admin/` structure.

## Admin as installable Chrome app (PWA)

1. Open the live admin URL (e.g. `https://openworldchats.vercel.app/admin/`).
2. Click **Enable payment alerts** and allow notifications.
3. Install:
   - If **Install app** appears, use it; or
   - Chrome menu → **Save and share** → **Install page as app**.

The app opens in its own window. Alerts fire when the **pending** queue **grows** (polling). They work best while the app is open or minimized; **true push when the app is fully quit** needs Web Push + a server (optional later).
