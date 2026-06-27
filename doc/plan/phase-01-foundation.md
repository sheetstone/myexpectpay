# Phase 01 — Foundation & Infrastructure

**Status:** 🔄 Restart (new Next.js architecture)
**Target:** Week 1–2  
**Roles involved:** Full-stack + DevOps

> Stand up the Next.js monolith with Firebase App Hosting, Firestore, and Firebase Auth configured locally via the emulator. The app must start, lint cleanly, and reach Firestore through the Admin SDK before any feature work begins.

> **Note:** The previous React + Express scaffold (frontend/ + backend/) is superseded. A fresh Next.js project is created at the repo root (or a new `nextjs/` directory), carrying over design tokens, translations, utils, and component logic.

---

## Prerequisites

- Phase 00 complete (architecture decided)
- Firebase project exists with Firestore, Authentication (Google + email/password), and App Hosting enabled
- GitHub repo exists
- Node.js 20 LTS installed locally
- Firebase CLI installed: `npm install -g firebase-tools`

---

## Tasks

### P01-001: Next.js Project Scaffold
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 2 hours  

**What to build:**  
`npx create-next-app@latest` with TypeScript, Tailwind CSS, App Router, and `src/` directory. Remove all default boilerplate pages and content. Configure `tsconfig.json` with `"strict": true` and path alias `@/` → `src/`.

**Acceptance criteria:**
- [ ] `npm run dev` starts at `http://localhost:3000` with no console errors
- [ ] `npm run build` completes with no TypeScript errors
- [ ] `tsconfig.json` has `"strict": true`
- [ ] Path alias `@/` → `src/` working
- [ ] All default Next.js boilerplate removed (no placeholder page content)

---

### P01-002: CSS Design Tokens & Tailwind Config
**Role:** Full-stack  
**Type:** [MIGRATE]  
**Estimate:** 1 hour  

**What to build:**  
Port `src/styles/tokens.css` (CSS custom properties for colours, typography, spacing, radius, shadow) from the old project. Extend `tailwind.config.ts` to reference brand CSS variables.

**Acceptance criteria:**
- [ ] `src/styles/tokens.css` contains all `--color-*`, `--font-*`, `--space-*`, `--radius-*`, `--shadow-*` variables
- [ ] `tailwind.config.ts` extends colors, fontFamily, fontSize via `var(--*)`
- [ ] Google Fonts (Roboto + Inter) loaded in `src/app/layout.tsx`

---

### P01-003: Firebase Client SDK — Auth Only
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 1 hour  

**What to build:**  
`src/lib/firebase/client.ts` — initialises Firebase client SDK and exports `auth` object. This file is only used for Firebase Authentication in the browser (Google popup, email/password sign-in). Never used for Firestore access.

**Acceptance criteria:**
- [ ] `src/lib/firebase/client.ts` exports `auth` (Firebase Auth instance)
- [ ] File reads config from `NEXT_PUBLIC_*` environment variables
- [ ] Does NOT initialise Firestore client SDK (server-only)
- [ ] No Firebase SDK errors in browser console with emulator running

---

### P01-004: Firebase Admin SDK — Server Only
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 1 hour  

**What to build:**  
`src/lib/firebase/admin.ts` — singleton for `firebase-admin` app. Exports `adminAuth` (for session cookie creation/verification) and `adminDb` (Firestore). This file must only ever be imported in Server Components, Route Handlers, or middleware.

**Acceptance criteria:**
- [ ] `src/lib/firebase/admin.ts` exports `adminAuth` and `adminDb`
- [ ] Singleton pattern: does not re-initialise on hot reload
- [ ] Reads credentials from `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` env vars
- [ ] When `FIRESTORE_EMULATOR_HOST` is set, Admin SDK uses the emulator automatically

---

### P01-005: Firestore Emulator Setup
**Role:** DevOps  
**Type:** [NEW]  
**Estimate:** 1 hour  

**What to build:**  
`firebase.json` and `.firebaserc` configured for the project. `firestore.rules` (deny all — Admin SDK bypasses rules). `firestore.indexes.json` (empty). `package.json` scripts for running emulators.

**Acceptance criteria:**
- [ ] `firebase emulators:start` starts Firestore + Auth emulators
- [ ] Emulator UI accessible at `http://localhost:4000`
- [ ] `npm run dev:full` starts Next.js and emulators concurrently
- [ ] `firestore.rules` denies all client SDK access

---

### P01-006: Session Management
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 2 hours  

**What to build:**  
`src/lib/session.ts` — exports `getSession(request)` which reads the `session` cookie, calls `adminAuth.verifySessionCookie()`, and returns `{ uid, email, name }` or `null`. Used by every Route Handler and Server Component that needs auth.

Also create:
- `src/app/api/auth/session/route.ts` — `POST`: receives Firebase ID token, calls `adminAuth.createSessionCookie()`, sets `HttpOnly` cookie (5-day expiry)
- `src/app/api/auth/logout/route.ts` — `POST`: clears the session cookie, calls `adminAuth.revokeRefreshTokens(uid)`

**Acceptance criteria:**
- [ ] `POST /api/auth/session` with a valid Firebase ID token → sets session cookie, returns 200
- [ ] `POST /api/auth/session` with invalid token → returns 401
- [ ] `POST /api/auth/logout` → clears cookie, revokes tokens
- [ ] `getSession()` returns user data on valid cookie, `null` on missing/expired
- [ ] Session cookie is `HttpOnly`, `Secure` (in production), `SameSite=Strict`

---

### P01-007: Route Protection Middleware
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 1 hour  

**What to build:**  
`src/middleware.ts` — Next.js middleware that runs on every `/(dashboard)/...` route. If no valid session cookie, redirects to `/login`.

**Acceptance criteria:**
- [ ] Visiting `/` (dashboard) without a session → redirected to `/login`
- [ ] Visiting `/login` with a valid session → redirected to `/`
- [ ] `matcher` configured to exclude `/_next/`, `/api/auth/`, static files
- [ ] Middleware does NOT call Firestore (fast path — cookie check only)

---

### P01-008: Core Shared UI Primitives
**Role:** Full-stack  
**Type:** [MIGRATE]  
**Estimate:** 3 hours  

**What to build:**  
Port `Spinner`, `EmptyState`, `ErrorMessage`, `Modal`, `Pagination`, `Toast` / `useToast` from the old frontend into `src/components/ui/`. Add `"use client"` only to components that need it (Modal, Toast).

**Acceptance criteria:**
- [ ] All 6 primitives exist and render without errors
- [ ] `Spinner` and `EmptyState` are Server Components (no `"use client"`)
- [ ] `Modal` traps focus, responds to Escape key, restores focus on close
- [ ] `Toast` auto-dismisses after 4 seconds

---

### P01-009: Translations & react-intl Setup
**Role:** Full-stack  
**Type:** [MIGRATE]  
**Estimate:** 1 hour  

**What to build:**  
Port `en.json`, `de.json`, `es.json` into `src/translations/`. Create `src/components/providers/IntlProvider.tsx` (`"use client"`) that reads locale from `localStorage` and wraps children with `<IntlProvider>`. Mount it in the root layout.

**Acceptance criteria:**
- [ ] Default locale is EN
- [ ] All existing translation keys from the old project present
- [ ] `useIntl()` works in any Client Component
- [ ] Switching locale via `localStorage` takes effect on next render

---

### P01-010: Shared Utils & Types
**Role:** Full-stack  
**Type:** [MIGRATE]  
**Estimate:** 1 hour  

**What to build:**  
Port `validateRouting.ts`, `validateCaseNumber.ts`, `formatMoney.ts`, `formatDate.ts` into `src/utils/`. Port all TypeScript interfaces from the old `types/api.ts` into `src/types/`. Add `src/constants.ts`.

**Acceptance criteria:**
- [ ] All utils ported with no TypeScript errors
- [ ] `PaymentStatus` and `PaymentType` typed as const objects (not Prisma enums)
- [ ] `PAGE_SIZE = 20` in constants
- [ ] `ACCOUNT_ENCRYPTION_KEY` helper in `src/lib/crypto.ts` (AES-256-GCM encrypt/decrypt for account numbers)

---

### P01-011: GitHub Actions CI
**Role:** DevOps  
**Type:** [NEW]  
**Estimate:** 1 hour  

**What to build:**  
`.github/workflows/ci.yml` — on every push and PR: install → lint → type-check → test → build.

**Acceptance criteria:**
- [ ] CI passes on push to `main`
- [ ] Steps: `npm ci` → `npm run lint` → `npm run type-check` → `npm run test` → `npm run build`
- [ ] Firebase emulator not required in CI (unit tests mock Firebase)

---

## Phase Exit Criteria

- [ ] `npm run dev:full` → Next.js at `http://localhost:3000` + Firebase Emulators at `http://localhost:4000` — both running, no errors
- [ ] `POST /api/auth/session` with emulator ID token → session cookie set
- [ ] Visiting `/` without session → redirected to `/login`
- [ ] `npm run lint && npm run type-check && npm run build` all pass
- [ ] CI pipeline green on GitHub
- [ ] No `.env` or Firebase service account key committed to git
