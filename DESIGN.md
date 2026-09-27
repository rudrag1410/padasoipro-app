# DESIGN

## Architecture

A pnpm/Turborepo monorepo with three packages:

- **`packages/api`** — Express + TypeScript, SQLite (`node:sqlite`, no external DB server to install). Layered as
  routes → controllers → services → repositories, with an `infrastructure/` folder for swappable concerns
  (bcrypt password hasher, HMAC OTP hasher, JWT token service, SMTP/console mailer, crypto OTP generator). Services
  depend on interfaces, not concrete infrastructure, so e.g. the mailer or hasher can be swapped or mocked without
  touching business logic.
- **`packages/mobile`** — Expo (Expo Router for navigation, React Query for server state, react-hook-form + zod
  resolvers for forms, `expo-secure-store` for the session token).
- **`packages/shared`** — zod schemas, types and constants imported by **both** apps (`email/password/profile/OTP
  rules`, API route shapes, error codes). This is the main trade-off decision: validation rules are written once and
  the same zod schema runs on the client (instant inline errors) and the server (source of truth), so they can't
  drift apart.

Data flow: mobile never talks to SQLite or the mailer directly — everything goes through the versioned REST API
(`/api/v1/...`), authenticated with a bearer JWT after verification. The API is the single source of truth for
validation, rate limiting and error shape; the mobile app trusts nothing about its own state until the server
confirms it (e.g. `profileCompleted` / `hasSelectedTasks` on `GET /me` drive which screen the router shows next,
rather than the client guessing from local state).

## Key trade-offs

- **SQLite over Postgres.** The brief allows either; SQLite means `docker compose up` needs no separate DB
  container and reviewers get a working stack in one command with zero extra services. Cost: no real concurrent
  writers, not representative of a production deployment — acceptable for a take-home, called out explicitly here
  rather than left implicit.
- **OTP as HMAC-SHA256, not stored plaintext or even a fast hash.** The code is short (6 digits, ~1M keyspace) so a
  slow password hash (bcrypt) is unnecessary/slow for something checked constantly during a 10-minute window; HMAC
  with a server-side secret plus a `timingSafeEqual` compare gives the "never store the raw code" requirement
  without the latency cost bcrypt would add to every attempt.
- **JWT over server sessions.** No session store to run/scale; trade-off is that revocation before expiry isn't
  possible (a 7-day token stays valid if "stolen"), which is fine for this scope but would need a
  revocation/refresh-token scheme for production.
- **Console mail driver as the default reviewer path, Mailpit as the "real SMTP" path.** Both are documented; Mailpit
  is closer to production (an actual SMTP hop) but console output is faster to skim when re-running the flow many
  times while developing.
- **Centering the app's screen layout for form-style screens.** Rather than pinning content to the top, the shared
  `Screen` component centers body content vertically (with a separate top-pinned slot for back buttons), matching
  the marketing site's look on short screens, at the cost of slightly more layout code than a plain top-anchored
  `ScrollView`.

## What was left out

- **Rate limiting is per-process, in-memory**, not shared across instances — fine for one API container, wrong for
  a horizontally-scaled deployment.
- **No refresh tokens** — a single long-lived JWT, no silent renewal or revoke-on-logout server-side (logout is
  client-side token deletion only).
- **No push notifications / background sync** for the Lifestyle Manager side of the product (out of scope — the
  brief only covers the customer's first journey).
- **No CI pipeline** committed (tests and typecheck are wired as `turbo` tasks, ready to plug into one, but no
  `.github/workflows` was added since the brief doesn't ask for it).
- **iOS build not attempted** — Android APK only, per the brief's explicit allowance ("Android alone is completely
  fine").