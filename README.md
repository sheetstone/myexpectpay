# MyExpertPay

Payment management portal for Expertpay account holders. Employers pay employees via debit cards; this portal lets users view balances, manage bank accounts, manage child-support cases and recipients, and review payment history.

**Stack:** Next.js 16 (App Router, TypeScript) · Firebase Authentication · Firestore · Firebase App Hosting

---

## Local Setup

### Prerequisites

- Node.js 20+
- [Firebase CLI](https://firebase.google.com/docs/cli) — `npm install -g firebase-tools`

### Quick start

```bash
# Clone and install
git clone https://github.com/sheetstone/myexpectpay.git
cd myexpectpay
npm install

# Start Next.js dev server only
npm run dev          # http://localhost:3000

# Start Firebase emulators only (Firestore + Auth)
npm run emulators    # Firestore :8080 · Auth :9099 · UI :4000

# Start both together
npm run dev:full
```

> The app runs without real Firebase credentials in development — the Admin SDK falls back to a local demo project when `FIREBASE_*` env vars are absent.

---

## Environment variables

**Never commit `.env` files.** In production, secrets are managed via Firebase App Hosting (see [issue #37](https://github.com/sheetstone/myexpectpay/issues/37)).

For local development, create a `.env.local` file at the project root (git-ignored):

```bash
# Firebase Admin (server-side — never exposed to browser)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Firebase client (public — safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_APP_ID=1:000000000000:web:0000000000000000

# AES-256 key for encrypting account numbers (32 bytes = 64 hex chars)
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ACCOUNT_ENCRYPTION_KEY=your-64-hex-char-key
```

---

## Development commands

```bash
npm run dev          # Next.js dev server (http://localhost:3000)
npm run emulators    # Firebase emulators (Firestore + Auth)
npm run dev:full     # Both concurrently

npm run lint         # ESLint
npm run type-check   # TypeScript strict check
npm run test         # Vitest unit tests
npm run build        # Production build
```

---

## Project structure

```
myexpectpay/
├── src/
│   ├── app/
│   │   ├── (auth)/          # /login  /register  /forgot-password
│   │   ├── (dashboard)/     # / (dashboard) + sub-pages
│   │   └── api/             # Route Handlers (REST API)
│   ├── components/          # UI primitives + layout shell
│   ├── lib/
│   │   ├── firebase/        # Admin SDK singleton + client SDK
│   │   ├── firestore/       # Data access layer (one file per collection)
│   │   └── crypto.ts        # AES-256-GCM encryption for account numbers
│   ├── hooks/               # Client-side React hooks
│   ├── translations/        # en.json  de.json  es.json
│   ├── types/               # Shared TypeScript interfaces + enums
│   ├── utils/               # formatMoney, formatDate, validateRouting, etc.
│   ├── constants.ts
│   ├── proxy.ts             # Route protection (Next.js 16 proxy)
│   └── lib/session.ts       # getSession() — reads + verifies session cookie
├── doc/
│   ├── REQUIREMENTS.md      # Full feature spec
│   ├── MIGRATION_PLAN.md    # SDLC phases overview
│   ├── MANUAL_TEST_CASES.md # Manual QA test cases
│   ├── plan/                # Detailed task plans per phase
│   ├── log/                 # Phase completion logs
│   └── adr/                 # Architecture Decision Records
├── firebase.json
├── apphosting.yaml          # Firebase App Hosting config + secret references
├── firestore.rules          # Deny all client SDK access (Admin SDK only)
└── CLAUDE.md                # Coding standards and AI guidance
```

---

## Architecture

```
[Browser]
  │
  ├─ Server Components (RSC)  →  Firebase Admin SDK  →  Firestore
  │
  └─ Client Components
       └─ fetch() / TanStack Query  →  Route Handlers (/api/...)
                                          └─ verify session cookie
                                          └─ Firebase Admin SDK  →  Firestore
```

Auth flow: Firebase client SDK (Google popup / email+password) → ID token → `POST /api/auth/session` → Firebase Admin creates a 5-day HttpOnly session cookie → `src/proxy.ts` verifies the cookie on every protected request.

All Firestore reads/writes are server-side only (Admin SDK). The `firestore.rules` file denies all client SDK access.

---

## Docs

- [`doc/REQUIREMENTS.md`](./doc/REQUIREMENTS.md) — full feature spec
- [`doc/MIGRATION_PLAN.md`](./doc/MIGRATION_PLAN.md) — SDLC phases overview
- [`doc/MANUAL_TEST_CASES.md`](./doc/MANUAL_TEST_CASES.md) — manual QA test cases
- [`doc/plan/`](./doc/plan/) — detailed task plans per phase
- [`doc/adr/`](./doc/adr/) — Architecture Decision Records
- [`CLAUDE.md`](./CLAUDE.md) — coding standards and tech stack guidance
