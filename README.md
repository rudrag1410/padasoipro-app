# PadosiPro: onboarding app + API

A native mobile app (Expo / React Native) and its own backend (Node.js + Express), in a Turborepo monorepo.
It covers the first customer journey: **register → verify email with an OTP → log in → first-login profile → pick tasks → home**.

```
padosipro/
├── packages/
│   ├── api/        Express + TypeScript API, SQLite (node:sqlite), JWT, bcrypt, SMTP (Mailpit)
│   ├── mobile/     Expo SDK 57 app, Expo Router, React Query, react-hook-form
│   └── shared/     Zod schemas, types, constants and utils used by BOTH apps
├── docker-compose.yml   API + Mailpit, one command
├── turbo.json
└── DESIGN.md       Architecture, trade-offs, what's next
```

## Prerequisites

| Tool | Version | Needed for |
| --- | --- | --- |
| Node.js | **22.13+** (tested on 24 and 26) | everything (the API uses the built-in `node:sqlite`) |
| pnpm | 9+ | workspaces |
| Docker Desktop | any recent | the one-command backend (optional but easiest) |
| Expo Go app, Android emulator or iOS simulator | Expo SDK 57 | running the app on a device |

## Quick start (about 5 minutes)

```bash
git clone <repo> padosipro && cd padosipro
pnpm install
```

### 1. Start the backend: one command

```bash
docker compose up --build
```

- API: http://localhost:4000/api/v1/health → `{"status":"ok"}`
- **Mailpit inbox: http://localhost:8025**. Every OTP email lands here.

The database is created and the task catalogue seeded automatically on start.

<details>
<summary>Without Docker</summary>

```bash
cp packages/api/.env.example packages/api/.env      # then put two long random strings in JWT_SECRET and OTP_HASH_SECRET
pnpm run dev:api                            # http://localhost:4000
```

Emails go to SMTP on `localhost:1025`. Either run only Mailpit (`docker compose up mailpit`), or set
`MAIL_DRIVER=console` in `packages/api/.env` and the OTP email is printed in the API terminal.
</details>

### 2. Start the app

```bash
cd packages/mobile
npx expo start
```

Then press `a` (Android emulator), `i` (iOS simulator) or scan the QR code with **Expo Go** on a phone on the same Wi‑Fi.
Press `w` for a quick browser preview.

The app finds the API on its own: it uses the IP of the machine running `expo start`, port 4000.
To point it elsewhere, set `EXPO_PUBLIC_API_URL` (see `packages/mobile/.env.example`).

### 3. Try the flow

1. **Create account** with any test email, e.g. `asha@example.com` / `secret123`.
2. Open **Mailpit** (http://localhost:8025) and copy the 6-digit code into the app.
3. Fill in the **profile** (mobile like `98765 43210`), pick some **tasks**, **confirm**.
4. Kill and reopen the app: you are still logged in. **Log out** from Home.

## Environment variables

### API (`packages/api/.env`, template in `.env.example`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `4000` | HTTP port |
| `DATABASE_PATH` | `./data/padosipro.db` | SQLite file (created on start) |
| `JWT_SECRET` | *required*, ≥ 32 chars | signs session tokens |
| `JWT_EXPIRES_IN_SECONDS` | `604800` (7 days) | session length |
| `OTP_HASH_SECRET` | *required*, ≥ 32 chars | HMAC key for stored OTP hashes |
| `BCRYPT_COST` | `12` | password hashing cost |
| `AUTH_RATE_LIMIT_MAX` | `50` | requests per IP per 15 min on `/auth/*` |
| `CORS_ORIGINS` | `http://localhost:8081` | browser origins allowed (web preview only) |
| `MAIL_DRIVER` | `smtp` | `smtp`, or `console` to print emails |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` | `localhost` / `1025` / `false` / empty | SMTP server (Mailpit by default) |
| `MAIL_FROM` | `PadosiPro <no-reply@padosipro.test>` | sender |

Generate secrets with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
`docker-compose.yml` ships clearly-marked **dev-only** defaults so it runs without a `.env`.

### App (`packages/mobile/.env`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | auto (dev server host, port 4000) | API origin. **Set it for APK builds**, e.g. `http://192.168.1.20:4000` |

## Email

Real SMTP through **[Mailpit](https://mailpit.axllent.org/)**, a local mail catcher (started by Docker Compose).
Nothing leaves your machine; open http://localhost:8025 to read the emails.
Any SMTP server works by changing the `SMTP_*` variables.

## Tests

```bash
pnpm test            # all workspaces via Turborepo (59 tests)
pnpm run typecheck   # API, shared and mobile
```

What's covered (`packages/api/tests`, `packages/shared/tests`):

- **OTP**: 6-digit generation (leading zeros kept), stored as HMAC not plaintext, 10-minute expiry (valid at 9:59, rejected at 10:00),
  single use, attempts countdown and lockout after 5 wrong tries (even the right code is refused after), 30-second resend
  cooldown, old code invalidated by a resend, undeliverable email doesn't block retry.
- **Login rules**: unverified users get `403 EMAIL_NOT_VERIFIED` plus a usable code (no token); the same `401` for an unknown email
  and a wrong password; wrong password on an unverified account doesn't reveal it; forged, expired and missing tokens rejected.
- **HTTP flows**: register validation and duplicates, bcrypt storage, profile rules (+91 mobile normalising), task selection
  (profile required, unknown ids, dedupe, replace), consistent error shape for 404 and malformed JSON.

Time-dependent rules are tested with an injected fake clock, not by sleeping.

## Build the APK

The app uses [EAS Build](https://docs.expo.dev/build/introduction/) (free tier is enough, no Android Studio needed).

```bash
cd packages/mobile
pnpm add -g eas-cli           # or use pnpm dlx eas-cli@latest
eas login                     # free Expo account
eas init                      # links the project (first time only)
# edit build.preview.env.EXPO_PUBLIC_API_URL in eas.json to your API, e.g. http://<your-computer-LAN-IP>:4000
eas build -p android --profile preview
```

The `preview` profile in `eas.json` outputs an installable **`.apk`**; EAS prints a download link / QR code when done.
(EAS builds in the cloud, so the API URL comes from `eas.json`, not your shell.)
The phone must reach the API at the URL you baked in: same Wi‑Fi as the machine running `docker compose up`, or a deployed URL.
Plain `http://` is allowed in the release build (`usesCleartextTraffic`, via `expo-build-properties`) for this local setup.

Local alternative (needs Android Studio + SDK):

```bash
cd packages/mobile
npx expo prebuild -p android
cd android && ./gradlew assembleRelease   # → android/app/build/outputs/apk/release/app-release.apk
```

## API reference

Base URL `http://localhost:4000/api/v1`. All errors look like
`{ "error": { "code": "OTP_INVALID", "message": "…", "fieldErrors": { "email": "…" }, "meta": { … } } }`.

| Method | Path | Auth | Body | Notes |
| --- | --- | --- | --- | --- |
| GET | `/health` | | | liveness |
| POST | `/auth/register` | | `email, password, confirmPassword` | 201 + OTP timing; emails a code |
| POST | `/auth/verify-otp` | | `email, code` | verifies and returns `{ token, expiresAt, user }` |
| POST | `/auth/resend-otp` | | `email` | 30 s cooldown (`429 OTP_RESEND_COOLDOWN`) |
| POST | `/auth/login` | | `email, password` | `403 EMAIL_NOT_VERIFIED` for unverified accounts |
| GET | `/me` | Bearer | | user incl. `profileCompleted`, `hasSelectedTasks` |
| PUT | `/me/profile` | Bearer | `name, mobile, address, businessName?` | |
| GET | `/tasks` | Bearer | | catalogue grouped by category |
| GET | `/me/tasks` | Bearer | | the user's selection |
| PUT | `/me/tasks` | Bearer | `taskIds[]` | replaces the selection |

## Useful commands

| Command | What it does |
| --- | --- |
| `pnpm run dev:api` | API with reload (`tsx watch`) |
| `pnpm run dev:mobile` | Expo dev server |
| `pnpm run db:seed` | re-seed the task catalogue (also runs on every API start) |
| `pnpm run build` | build the API (`packages/api/dist`) |
| `docker compose down -v` | stop and wipe the Docker database |
# padasoipro-app
