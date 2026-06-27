# MyExpertPay — Full Migration & Development Plan

**Version:** 2.0  
**Date:** 2026-06-27  
**Estimated duration:** ~10 weeks (1 developer, part-time) / ~5 weeks (1 developer, full-time)

> **Architecture updated June 2026.** The original v1.0 plan targeted React + Express + PostgreSQL + Railway.
> The project was re-architected to **Next.js 14+ + Firestore + Firebase App Hosting**.
> See `adr/` for the decisions behind each change. The detailed task list for each phase lives in `doc/plan/phase-NN-*.md`.

Legend:
- `[MIGRATE]` — exists in old app, port to new stack
- `[UPGRADE]` — exists in old app but incomplete or broken, fix + port
- `[NEW]` — not in old app at all, build from scratch
- `[GAP]` — identified gap in old app that blocked the product

---

## Overview — SDLC Phases

```
Phase 0 │ Planning & Architecture         │ ✅ Complete
Phase 1 │ Next.js Foundation & Firebase   │ Week 1–2    ← start here
Phase 2 │ Firestore Data Layer + API      │ Week 2–4
Phase 3 │ App Router Layouts + Auth Flows │ Week 2–4    (parallel with Phase 2)
Phase 4 │ Pages Migration to App Router   │ Week 4–7
Phase 5 │ New Features (Gap Fill)         │ Week 6–9    (overlaps Phase 4)
Phase 6 │ Testing & QA                    │ Week 8–10   (overlaps Phase 5)
Phase 7 │ Firebase App Hosting Deploy     │ Week 10–11
Phase 8 │ Data Migration (Firebase→Firestore) │ Week 11
Phase 9 │ Launch & Post-Launch            │ Week 12+
```

---

## Phase 0 — Planning & Architecture ✅ (Complete)

| # | Task | Status | Output |
|---|---|---|---|
| 0.1 | Analyse existing codebase | ✅ Done | `doc/REQUIREMENTS.md` |
| 0.2 | Write requirements document | ✅ Done | `doc/REQUIREMENTS.md` |
| 0.3 | Define tech stack + architecture | ✅ Done | `CLAUDE.md`, `adr/` |
| 0.4 | Define design system | ✅ Done | `.agents/skills/design-system/SKILL.md` |
| 0.5 | Define coding standards | ✅ Done | `.agents/skills/frontend-best-practices/SKILL.md` |
| 0.6 | Define deployment playbook | ✅ Done | `adr/ADR-005-firebase-app-hosting.md` |
| 0.7 | Write migration plan | ✅ Done | `doc/MIGRATION_PLAN.md` (this file) |
| 0.8 | Confirm all architecture decisions | ✅ Done | `adr/ADR-001` through `ADR-007` |

---

## Phase 1 — Foundation & Infrastructure

**Goal:** Empty repo → working skeleton that builds, lints, and deploys to a staging URL.

### 1.1 Repository Setup `[NEW]`

- [ ] Create GitHub repo `myexpertpay`
- [ ] Set up monorepo structure:
  ```
  myexpectpay/
  ├── frontend/
  ├── backend/
  ├── docker-compose.yml
  ├── Caddyfile
  ├── .github/workflows/
  └── CLAUDE.md
  ```
- [ ] Add `.gitignore` (exclude `.env`, `node_modules`, `dist`, `build`)
- [ ] Add `README.md` with setup instructions

### 1.2 Backend Scaffold `[NEW]`

- [ ] Initialise Node.js project: `npm init` in `backend/`
- [ ] Install core dependencies:
  - `express`, `cors`, `helmet`, `morgan` — server
  - `@prisma/client`, `prisma` — ORM
  - `zod` — validation
  - `firebase-admin` — token verification
  - `dotenv` — env config
  - `typescript`, `ts-node-dev`, `@types/*` — TypeScript
- [ ] Configure `tsconfig.json` (strict mode on)
- [ ] Configure `eslint` + `prettier`
- [ ] Write `src/app.ts` — Express app factory (no `listen` call — keeps it testable)
- [ ] Write `src/server.ts` — entry point (calls `listen`)
- [ ] Health check: `GET /api/health` → `{ status: 'ok', timestamp }`
- [ ] Global error handler middleware
- [ ] Request logger middleware
- [ ] Add `npm run dev`, `npm run build`, `npm run test` scripts

### 1.3 Database Setup `[NEW]`

- [ ] Write `prisma/schema.prisma` with all models from REQUIREMENTS.md §6:
  - `User`, `BankAccount`, `Case`, `Recipient`, `Payment`, `Message`
- [ ] Run `npx prisma migrate dev --name init` (creates dev DB)
- [ ] Create separate test database: `myexpertpay_test`
- [ ] Add seed script `prisma/seed.ts` with realistic test data
- [ ] Add `.env.example`:
  ```
  DATABASE_URL=postgresql://user:pass@localhost:5432/myexpertpay
  FIREBASE_PROJECT_ID=
  FIREBASE_CLIENT_EMAIL=
  FIREBASE_PRIVATE_KEY=
  ENCRYPTION_KEY=
  PORT=3001
  NODE_ENV=development
  CORS_ORIGIN=http://localhost:5173
  ```

### 1.4 Frontend Scaffold `[NEW]`

- [ ] Create Vite + React 18 + TypeScript project in `frontend/`:
  ```
  npm create vite@latest frontend -- --template react-ts
  ```
- [ ] Install core dependencies:
  - `react-router-dom` v6
  - `@tanstack/react-query`
  - `axios`
  - `react-hook-form`, `@hookform/resolvers`, `yup`
  - `react-intl`
  - `zustand`
  - `firebase`
  - `recharts`
  - `react-calendar`
  - `@heroicons/react`
- [ ] Install dev dependencies:
  - `tailwindcss`, `postcss`, `autoprefixer`
  - `sass`
  - `vitest`, `@testing-library/react`, `@testing-library/jest-dom`
- [ ] Configure Tailwind — extend with brand tokens from design-system skill
- [ ] Create `src/styles/tokens.css` — all CSS custom properties from design-system skill
- [ ] Configure `tsconfig.json` (strict mode on, path aliases)
- [ ] Configure `eslint` + `prettier`
- [ ] Add `npm run dev`, `npm run build`, `npm run test`, `npm run lint` scripts
- [ ] Verify dev server starts at `http://localhost:5173`

### 1.5 CI/CD Pipeline `[NEW]`

- [ ] Create `.github/workflows/ci.yml`:
  - Trigger: push to `main`, any PR
  - Jobs: lint → test (backend) → test (frontend) → build
  - Use test database via GitHub Actions service container (Postgres)
- [ ] Add branch protection on `main` — require CI green before merge

### 1.6 Docker Setup `[NEW]`

- [ ] Write `backend/Dockerfile` — multi-stage: tsc build → node:20-alpine
- [ ] Write `frontend/Dockerfile` — multi-stage: Vite build → nginx:alpine
- [ ] Write `frontend/nginx.conf` — SPA fallback + `/api/` proxy to `backend:3001`
- [ ] Write `docker-compose.yml` — four services: `postgres`, `backend`, `frontend`, `caddy`
- [ ] Write `Caddyfile` — placeholder domain for staging
- [ ] Verify `docker compose up --build` starts all four services cleanly

**Phase 1 exit criteria:**
- `GET http://localhost:3001/api/health` → 200
- `http://localhost:5173` → blank React app (no errors in console)
- `docker compose up --build` → all services healthy
- CI pipeline passes on an empty PR

---

## Phase 2 — Backend: Core API

**Goal:** All REST endpoints from REQUIREMENTS.md §7 implemented, validated, secured, and integration-tested.

### 2.1 Auth Middleware & Routes

- [ ] `[MIGRATE]` **Firebase token verification middleware** (`middleware/requireAuth.ts`)
  - Reads `Authorization: Bearer <token>` header
  - Calls Firebase Admin `verifyIdToken`
  - Attaches `req.user = { id, email }` on success
  - Returns 401 on failure
- [ ] `[NEW]` **`POST /api/auth/verify`** — receives Firebase ID token, upserts `User` row, returns user profile
- [ ] `[NEW]` **`POST /api/auth/register`** — email/password registration (creates Firebase user + DB row)
- [ ] Augment Express `Request` type: `src/types/express.d.ts`

### 2.2 Bank Accounts API `[MIGRATE + UPGRADE]`

Old app: direct Firebase Realtime DB calls from the browser with no server-side validation or ownership check.

- [ ] Write Zod schema `validators/bank.schema.ts`:
  - `routingNumber`: exactly 9 digits
  - `accountNumber`: 4–17 chars
  - `confirmAccountNumber`: must match `accountNumber`
  - `accountType`: enum `checking | saving`
- [ ] Write `services/bankService.ts`:
  - ABA checksum validation (`utils/validateRouting.ts`) `[MIGRATE]`
  - Account number encryption before storage
  - All queries scoped `WHERE userId = req.user.id`
  - Responses return `accountNumberLast4` only — never full number
- [ ] **`GET    /api/banks`** — list user's bank accounts
- [ ] **`POST   /api/banks`** — create bank account
- [ ] **`PATCH  /api/banks/:id`** — update account type
- [ ] **`DELETE /api/banks/:id`** — delete (check ownership)
- [ ] **`PATCH  /api/banks/:id/verify`** — toggle verified status `[MIGRATE]`
- [ ] **`GET    /api/banks/lookup/:routing`** — resolve bank name from routing number `[MIGRATE]`
  - Use local ABA JSON dataset (free, no API key needed)
- [ ] Integration tests: happy path + 401 + 400 + 404 for each route

### 2.3 Cases API `[MIGRATE + UPGRADE]`

Old app: Firebase CRUD, no case number format validation server-side, children stored as flat array.

- [ ] Write Zod schema `validators/case.schema.ts`
- [ ] Write `services/caseService.ts`:
  - Case number format validation `[MIGRATE]`
  - `children` stored as JSON array in Postgres
- [ ] **`GET    /api/cases`** — list user's cases
- [ ] **`POST   /api/cases`** — create case
- [ ] **`PATCH  /api/cases/:id`** — update case
- [ ] **`DELETE /api/cases/:id`** — delete case
- [ ] Integration tests

### 2.4 Recipients API `[UPGRADE]`

Old app: endpoint existed (`/recepients.json`) but forms were incomplete; typo in endpoint name.

- [ ] Write Zod schema `validators/recipient.schema.ts`
- [ ] Write `services/recipientService.ts`
- [ ] **`GET    /api/recipients`** — list user's recipients (paginated)
- [ ] **`POST   /api/recipients`** — create recipient
- [ ] **`PATCH  /api/recipients/:id`** — update recipient
- [ ] **`DELETE /api/recipients/:id`** — delete recipient
- [ ] Integration tests

### 2.5 Payments API `[MIGRATE + NEW]`

Old app: read-only list from Firebase; send/request buttons existed but were non-functional.

- [ ] Write Zod schema `validators/payment.schema.ts`:
  - Filter params: `startDate`, `endDate`, `status[]`, `page`, `limit`
  - Send money body: `amount`, `recipientId`, `bankId`, `caseNumber`
- [ ] Write `services/paymentService.ts`:
  - List with date range + multi-status filter + pagination `[MIGRATE]`
  - `buildWhereClause` helper
- [ ] **`GET  /api/payments`** — list payments (filter + paginate) `[MIGRATE]`
- [ ] **`POST /api/payments/send`** — initiate payment `[NEW]` `[GAP]`
  - Validate bank is verified and belongs to user
  - Validate amount > 0
  - Create payment record with status `in_progress`
- [ ] **`POST /api/payments/request`** — request payment `[NEW]` `[GAP]`
- [ ] Integration tests

### 2.6 Messages API `[MIGRATE + UPGRADE]`

Old app: messages loaded from static JSON file; no read/unread state.

- [ ] Write `services/messageService.ts`
- [ ] **`GET   /api/messages`** — list user's messages
- [ ] **`PATCH /api/messages/:id/read`** — mark as read `[NEW]` `[GAP]`
- [ ] Integration tests

### 2.7 Dashboard API `[NEW]` `[GAP]`

Old app: dashboard data was assembled client-side from multiple Firebase calls with no aggregation.

- [ ] **`GET /api/dashboard/summary`** — `{ balance, totalSent, totalReceived, pendingCount }`
- [ ] **`GET /api/dashboard/activity`** — payment counts grouped by day for last 30 days (for chart)
- [ ] Integration tests

**Phase 2 exit criteria:**
- All routes return correct data + correct status codes
- All routes return 401 without a valid token
- All routes scope data to `req.user.id`
- ≥70% line coverage on backend integration tests
- `npx prisma migrate deploy` runs cleanly on a fresh DB

---

## Phase 3 — Frontend: Foundation

**Goal:** React app has routing, auth, layout, i18n, and API client wired up. No page content yet.

### 3.1 Design Tokens & Global Styles `[NEW]`

- [ ] Create `src/styles/tokens.css` — all CSS custom properties from design-system skill
- [ ] Update `src/index.css` — import tokens, Tailwind base, global body styles
- [ ] Configure Tailwind to reference brand CSS variables
- [ ] Load Google Fonts (Roboto + Inter) in `index.html`

### 3.2 Axios Client & React Query `[NEW]`

- [ ] Create `src/api/client.ts` — Axios instance with:
  - `baseURL` from `VITE_API_BASE_URL`
  - Request interceptor: attach `Authorization: Bearer <token>` from auth store
  - Response interceptor: handle 401 → redirect to login
- [ ] Create `src/api/` files per resource: `banksApi.ts`, `casesApi.ts`, `recipientsApi.ts`, `paymentsApi.ts`, `messagesApi.ts`, `dashboardApi.ts`
- [ ] Wrap app in `QueryClientProvider`

### 3.3 Firebase Auth + Zustand Store `[MIGRATE]`

Old app: used Context API + RxJS BehaviorSubject. New app: Zustand.

- [ ] Initialise Firebase SDK (`src/api/firebase.ts`) with env vars
- [ ] Create `src/store/authStore.ts` (Zustand):
  - State: `user | null`, `loading: boolean`, `token: string | null`
  - Actions: `signInWithGoogle()`, `signInWithEmail()`, `signOut()`, `setUser()`
- [ ] Firebase `onAuthStateChanged` listener in `App.tsx` — keeps store in sync
- [ ] On auth: call `POST /api/auth/verify` to upsert user row, store JWT if needed

### 3.4 Routing & Auth Guard `[MIGRATE]`

- [ ] Set up React Router v6 in `App.tsx` with all routes from REQUIREMENTS.md
- [ ] `AuthGuard` component — redirects unauthenticated users to `/login` `[MIGRATE]`
- [ ] Protected route wrapper applied to all non-auth routes
- [ ] 404 / Not Found page `[MIGRATE]`

### 3.5 i18n Setup `[MIGRATE]`

Old app: react-intl with EN/DE/ES JSON files. New app: same library, same structure.

- [ ] Create `src/translations/en.json`, `de.json`, `es.json` (port all keys from old app)
- [ ] Create `src/components/LanguageProvider.tsx` — wraps app in `IntlProvider`
- [ ] Locale stored in `localStorage` (`LS_LOCALE` constant) `[MIGRATE]`
- [ ] All new translation keys added to all three files (no missing key left blank)

### 3.6 Layout Components `[MIGRATE + UPGRADE]`

- [ ] **Header** — sticky, white with blur, logo, user display name, locale toggle, sign-out `[MIGRATE]`
  - Upgrade: `position: sticky` + `backdrop-filter: blur(8px)` per design-system skill
- [ ] **Navigation** — links with sliding bottom-bar indicator animation `[MIGRATE]`
  - Unread message count badge on Messages link `[NEW]` `[GAP]`
- [ ] **Footer** — dark slate background (upgraded from flat grey) `[MIGRATE]`
- [ ] **LocaleToggle** — EN/DE/ES switcher `[MIGRATE]`

### 3.7 Shared UI Components `[MIGRATE + UPGRADE]`

- [ ] `Spinner` — port brick spinner animation, use `var(--color-primary)` `[MIGRATE]`
- [ ] `Pagination` — page controls, controlled component `[MIGRATE]`
- [ ] `ConfirmDialog` — modal for delete confirmations `[MIGRATE]`
- [ ] `Toast` / `SuccessModal` — success/error notifications `[MIGRATE]`
- [ ] `DatePicker` — custom calendar date selector `[MIGRATE]`
- [ ] `MultiSelect` — multi-option dropdown for status filter `[MIGRATE]`
- [ ] `ErrorMessage` — inline field error display `[MIGRATE]`
- [ ] `Icon` — all icons centralised here, sourced from Heroicons `[NEW]`
- [ ] `EmptyState` — consistent empty list UI `[NEW]`

**Phase 3 exit criteria:**
- App loads at `localhost:5173` with correct fonts and brand colours
- Google sign-in works end-to-end (Firebase → backend verify → user in DB)
- Navigating to a protected route when logged out redirects to `/login`
- Language switcher changes all UI text
- Header shows logged-in user's display name

---

## Phase 4 — Frontend: Page Migration

**Goal:** All pages that exist in the old app are re-implemented to the new stack and design system.

### 4.1 Login Page `[MIGRATE + UPGRADE]`

- [ ] Hero gradient background (lavender-to-mint, preserved from old app)
- [ ] Decorative feature cards (rotated, styled with Inter instead of Comic Sans) `[UPGRADE]`
- [ ] Login box: Google OAuth button (functional) `[MIGRATE]`
- [ ] Login box: Email/password form (was broken in old app) `[UPGRADE]`
  - Fields: email, password
  - Validation: email format, password required
  - Error: show server error above submit button
- [ ] "Forgot password?" link → `/forgot-password` `[UPGRADE]` (was a dead route)
- [ ] "Don't have an account? Sign up" link → `/register` `[NEW]`

### 4.2 Register Page `[NEW]` `[GAP]`

Old app: route existed, rendered a placeholder.

- [ ] Fields: display name, email, password, confirm password
- [ ] Validation: all fields required, email format, passwords match, min 8 chars
- [ ] On submit: `POST /api/auth/register` → auto sign-in → redirect to dashboard
- [ ] Link back to login

### 4.3 Forgot Password Page `[UPGRADE]` `[GAP]`

Old app: route existed, UI was routed but logic was never implemented.

- [ ] Field: email address
- [ ] On submit: Firebase `sendPasswordResetEmail()` — no backend call needed
- [ ] Show success message: "Check your email for a reset link"
- [ ] Error handling: email not found

### 4.4 Home / Dashboard Page `[MIGRATE + UPGRADE]`

Old app: tab-based dashboard with separate sections; data loaded from multiple Firebase endpoints with no aggregation.

- [ ] Welcome section with user display name `[MIGRATE]`
- [ ] Account summary card: balance, total sent, total received `[MIGRATE + UPGRADE]`
  - Old app assembled this client-side; now comes from `GET /api/dashboard/summary`
  - Large balance display: `font-size: var(--text-4xl)`, `font-weight: 300`
- [ ] Payment activity chart (Recharts bar/line) `[MIGRATE + UPGRADE]`
  - Data from `GET /api/dashboard/activity`
  - Chart type dropdown (bar / line) preserved `[MIGRATE]`
- [ ] Activity calendar — custom dashed-grid calendar `[MIGRATE]`
  - Events loaded from `GET /api/payments` filtered by month
  - Preserved: dashed grid, today circle, event hover in secondary pink
  - Popover on event click with payment detail `[MIGRATE]`
- [ ] Recent messages section (latest 5) `[MIGRATE]`
- [ ] Each section loads independently with its own spinner `[UPGRADE]`
- [ ] Tab layout preserved (Account Summary / Messages / Calendar) `[MIGRATE]`

### 4.5 Bank Account Page `[MIGRATE + UPGRADE]`

Old app: fully functional CRUD against Firebase; no server-side ownership or routing validation.

- [ ] Bank account list with `BankItem` cards `[MIGRATE]`
  - Card hover: lift effect per design-system skill `[UPGRADE]`
  - Bank name in `var(--color-info)` (#4b96ac) `[MIGRATE]`
  - Status badge: Verified (teal pill) / Pending verification (amber pill) `[UPGRADE]`
  - Three-dot context menu: Edit / Verify / Delete `[MIGRATE]`
- [ ] Add Bank Account form (modal or side panel) `[MIGRATE]`
  - Routing number field: ABA checksum validation on blur `[MIGRATE]`
  - Auto-resolve bank name from routing number (debounced lookup) `[MIGRATE]`
  - Account number field: 4–17 digits `[MIGRATE]`
  - Confirm account number field: must match `[MIGRATE]`
  - Account type: checking / saving `[MIGRATE]`
  - Form validation with react-hook-form + Yup `[MIGRATE]`
- [ ] Edit account type inline `[MIGRATE]`
- [ ] Delete with ConfirmDialog `[MIGRATE]`
- [ ] Toggle verified status `[MIGRATE]`
- [ ] Success toast on each operation `[MIGRATE]`
- [ ] Routing number + account number displayed in monospace font `[UPGRADE]`

### 4.6 Cases Page `[MIGRATE + UPGRADE]`

Old app: basic CRUD, dynamic child fields using `useFieldArray`, case number validation.

- [ ] Cases table with sortable columns `[MIGRATE]`
  - Thead: 2px solid `var(--color-primary)` border `[MIGRATE]`
  - Tbody: 1px dashed border between rows `[MIGRATE]`
  - Children column: overflow ellipsis `[MIGRATE]`
- [ ] Add Case form `[MIGRATE]`
  - Case number field with format validation `[MIGRATE]`
  - NCP Name field `[MIGRATE]`
  - Dynamic children array (Add / Remove child buttons) `[MIGRATE]`
- [ ] Edit case (all fields) `[MIGRATE]`
- [ ] Delete with ConfirmDialog `[MIGRATE]`
- [ ] Pagination `[UPGRADE]` (old app had no pagination on cases)

### 4.7 Recipients Page `[UPGRADE]` `[GAP]`

Old app: basic structure existed but forms were incomplete and validation was missing.

- [ ] Recipients card list (same card pattern as bank accounts) `[MIGRATE]`
  - Name in `var(--color-info)` `[MIGRATE]`
  - Email + linked case shown as meta `[UPGRADE]`
  - Three-dot context menu: Edit / Delete
- [ ] Add Recipient form `[UPGRADE]`
  - Fields: first name, last name, email, linked case (optional dropdown) `[UPGRADE]`
  - Email format validation `[UPGRADE]`
- [ ] Edit recipient (all fields) `[UPGRADE]`
- [ ] Delete with ConfirmDialog
- [ ] Pagination `[NEW]`

### 4.8 Payment History Page `[MIGRATE + UPGRADE]`

Old app: filtering UI existed and worked; Send Money / Request Money buttons were non-functional stubs.

- [ ] Page header with "Send Money" and "Request Money" buttons `[MIGRATE]`
- [ ] Filter bar:
  - Date range (start date / end date) via DatePicker `[MIGRATE]`
  - Status multi-select (all 10 statuses) `[MIGRATE]`
  - Clear filters button `[MIGRATE]`
- [ ] Payment list — striped rows `[MIGRATE]`
  - Date, name, case number, type, status badge, amount `[MIGRATE]`
  - Amount colour-coded: positive teal, negative red, pending amber `[UPGRADE]`
  - Status badge: pill shape with bg + text colour `[UPGRADE]`
  - Payment type shown as secondary line under name `[MIGRATE]`
- [ ] Pagination (default 20/page) `[UPGRADE]`
- [ ] Send Money modal `[NEW]` `[GAP]` — see Phase 5.1
- [ ] Request Money modal `[NEW]` `[GAP]` — see Phase 5.2

**Phase 4 exit criteria:**
- All 7 pages render correctly with real API data
- CRUD operations work end-to-end (frontend → backend → DB)
- All validation rules fire correctly on both sides
- Filtering on payments returns correct results
- Language switch updates all text on every page

---

## Phase 5 — New Features (Gap Fill)

**Goal:** Build everything that exists in the requirements but was not in the old app.

### 5.1 Send Money Flow `[NEW]` `[GAP]`

- [ ] "Send Money" button on Payments page opens modal
- [ ] Form fields:
  - Amount (numeric, > 0, 2 decimal places)
  - From bank account (dropdown — verified accounts only)
  - To recipient (dropdown — user's recipients)
  - Case number (dropdown or free text)
  - Optional note
- [ ] Validation: Yup schema + server-side Zod
- [ ] On submit: `POST /api/payments/send`
- [ ] Success: close modal, show toast, refresh payment list
- [ ] Error: show server error in modal

### 5.2 Request Money Flow `[NEW]` `[GAP]`

- [ ] "Request Money" button on Payments page opens modal
- [ ] Form fields: amount, from recipient, case number, optional note
- [ ] On submit: `POST /api/payments/request`
- [ ] Success + error handling same as Send Money

### 5.3 Messages Page `[UPGRADE]` `[GAP]`

Old app: messages section existed on dashboard but had no standalone page, no read/unread state.

- [ ] Standalone `/messages` route
- [ ] Message list: sender, subject, date, preview
- [ ] Click to expand full message body
- [ ] Mark as read on open: `PATCH /api/messages/:id/read`
- [ ] Unread count badge on nav link
- [ ] Unread messages shown with bolder text / accent indicator

### 5.4 User Profile Page `[NEW]` `[GAP]`

Not in old app at all.

- [ ] Route `/profile`
- [ ] Display: avatar (initial-based), display name, email
- [ ] Edit display name
- [ ] Change password (Firebase `updatePassword`)
- [ ] Link to account settings

### 5.5 Account Settings Page `[NEW]` `[GAP]`

Not in old app at all.

- [ ] Route `/settings`
- [ ] Language preference (syncs with locale toggle)
- [ ] Notification preferences (placeholder for v2)
- [ ] Delete account (with strong confirmation — type display name)

### 5.6 Complete i18n Coverage `[UPGRADE]` `[GAP]`

Old app: EN translations were mostly complete; DE and ES had gaps; new pages had no translations.

- [ ] Audit all translation keys in `en.json` — confirm every key has a DE and ES equivalent
- [ ] Add all new-feature translation keys (Send Money, Request Money, Profile, Settings, Messages page)
- [ ] Currency formatting via `intl.formatNumber()` per locale
- [ ] Date formatting via `intl.formatDate()` per locale
- [ ] Verify DE and ES render correctly on every page

### 5.7 Responsive / Mobile Polish `[NEW]` `[GAP]`

Old app: Bootstrap grid was used but mobile layouts were never verified.

- [ ] Audit every page at sm (361px), md (711px), lg (921px), xl (1201px)
- [ ] Navigation: collapse to hamburger menu on mobile
- [ ] Calendar: horizontal scroll or simplified monthly view on mobile
- [ ] Payment list: stack columns vertically on mobile
- [ ] Form modals: full-screen on mobile

**Phase 5 exit criteria:**
- Send Money and Request Money flows complete end-to-end
- Messages page shows real data with read/unread state
- Profile and Settings pages functional
- Zero missing translation keys in EN/DE/ES
- All pages pass visual review at all 4 breakpoints

---

## Phase 6 — Testing & QA

**Goal:** Confidence the app works correctly, securely, and is accessible.

### 6.1 Backend Unit Tests

- [ ] `utils/validateRoutingNumber.ts` — test all ABA checksum cases `[MIGRATE]`
- [ ] `utils/encrypt.ts` / `utils/decrypt.ts` — round-trip test
- [ ] `utils/buildWhereClause.ts` — date range + status filter combinations
- [ ] `validators/*.schema.ts` — valid and invalid inputs for each Zod schema
- [ ] Target: 100% line coverage on `utils/` and `validators/`

### 6.2 Backend Integration Tests

- [ ] Auth middleware: valid token → passes; invalid/expired/missing → 401
- [ ] All bank account routes: happy path, wrong user (403), not found (404), bad input (400)
- [ ] All case routes: same matrix
- [ ] All recipient routes: same matrix
- [ ] All payment routes: same matrix + filter combinations
- [ ] Messages: list + mark read
- [ ] Dashboard: summary + activity aggregation
- [ ] **Row-level security test**: User A cannot read/modify User B's data (critical)
- [ ] Target: ≥70% overall line coverage

### 6.3 Frontend Unit Tests

- [ ] `utils/formatMoney.ts` — locale formatting, edge cases (zero, negative, large)
- [ ] `utils/formatDate.ts` — locale formatting
- [ ] `utils/validateRoutingNumber.ts` — ABA checksum `[MIGRATE]`
- [ ] `utils/maskAccountNumber.ts` — last-4-digit masking
- [ ] Zustand auth store — sign-in, sign-out, token refresh

### 6.4 Frontend Component Tests

- [ ] `Spinner` — renders with correct colour
- [ ] `Pagination` — prev/next/page-number interactions
- [ ] `ConfirmDialog` — confirm and cancel callbacks
- [ ] `MultiSelect` — select all, deselect, clear
- [ ] `DatePicker` — date selection
- [ ] `BankItem` — renders verified/unverified badge correctly
- [ ] `PaymentRow` — renders positive/negative/pending amount in correct colours
- [ ] `ActivityCalendar` — today badge, event hover, event click popover

### 6.5 End-to-End Tests (Playwright)

Critical user flows only:

- [ ] `[E2E-01]` Sign in with Google → land on dashboard
- [ ] `[E2E-02]` Sign in with email/password → land on dashboard
- [ ] `[E2E-03]` Add bank account → appears in list with correct routing lookup
- [ ] `[E2E-04]` Add case with 2 children → appears in cases table
- [ ] `[E2E-05]` Add recipient → appears in list
- [ ] `[E2E-06]` Filter payments by date range → list updates
- [ ] `[E2E-07]` Filter payments by status → list updates
- [ ] `[E2E-08]` Send Money → payment appears in list with status In Progress
- [ ] `[E2E-09]` Delete bank account → removed from list (with confirm dialog)
- [ ] `[E2E-10]` Switch language to DE → all UI text changes
- [ ] `[E2E-11]` Sign out → redirect to login; protected routes blocked

### 6.6 Security Review

- [ ] All API endpoints reject requests without a valid Firebase token (401)
- [ ] User A cannot access User B's `/banks`, `/cases`, `/recipients`, `/payments`
- [ ] No raw account numbers returned in any API response (last 4 only)
- [ ] No secrets in git history (run `git log -S "FIREBASE_PRIVATE_KEY"`)
- [ ] `helmet()` middleware headers present on all responses
- [ ] CORS restricted to known origins only
- [ ] Input validation rejects SQL injection attempts, oversized payloads

### 6.7 Accessibility Audit

- [ ] Run `axe-core` on every page — resolve all critical issues
- [ ] Keyboard navigation through all forms and modals
- [ ] All interactive elements have `:focus-visible` styles
- [ ] ARIA labels on icon-only buttons (context menu, calendar nav)
- [ ] Colour contrast ≥ 4.5:1 for all text (verify `var(--color-primary)` on white)
- [ ] Screen reader test on login form and bank account form

### 6.8 Performance

- [ ] Lighthouse score ≥ 85 on dashboard page (LCP, TBT, CLS)
- [ ] React Query cache configured: `staleTime: 60_000` on list endpoints
- [ ] Vite bundle analysis — identify any unexpectedly large chunks
- [ ] Images (login hero assets) served as WebP

**Phase 6 exit criteria:**
- All E2E tests pass
- No critical accessibility issues
- Security review checklist signed off
- Backend coverage ≥70%, frontend utils coverage 100%

---

## Phase 7 — Deployment & DevOps

**Goal:** Production-grade infrastructure on AWS, accessible via HTTPS.

### 7.1 AWS Setup `[NEW]`

- [ ] Provision EC2 `t3.medium` Ubuntu 22.04 in `ap-southeast-1` (Singapore)
- [ ] Allocate and associate Elastic IP
- [ ] Security group: allow 80, 443, 22 (SSH from your IP only)
- [ ] Install Docker + Docker Compose on EC2

### 7.2 Domain & TLS `[NEW]`

- [ ] Derive sslip.io domain from Elastic IP: `<ip-with-hyphens>.sslip.io`
- [ ] Update `Caddyfile` with the live domain
- [ ] Update `backend/.env` `CORS_ORIGIN` to match

### 7.3 Secrets Management `[NEW]`

- [ ] Store `ENCRYPTION_KEY` and `FIREBASE_PRIVATE_KEY` in AWS Secrets Manager (or SSM Parameter Store)
- [ ] EC2 instance role grants read access to those secrets
- [ ] Startup script fetches secrets and writes `backend/.env` at boot
- [ ] `backend/.env` never committed to git

### 7.4 Staging Environment `[NEW]`

- [ ] Second EC2 instance (or same instance, different Docker Compose project) for staging
- [ ] Staging connects to a separate Postgres DB
- [ ] Staging domain: `staging.<ip>.sslip.io`
- [ ] CI pipeline deploys to staging automatically on merge to `main`

### 7.5 Production Deployment `[NEW]`

- [ ] Production deployment is manual (GitHub Actions `workflow_dispatch` trigger)
- [ ] Deploy steps:
  1. SSH to EC2
  2. `git pull`
  3. `docker compose run --rm backend npx prisma migrate deploy`
  4. `docker compose up -d --build`
- [ ] Rollback: `git checkout <previous-tag> && docker compose up -d --build`

### 7.6 Monitoring & Logging `[NEW]`

- [ ] `docker compose logs -f` piped to a log file with rotation
- [ ] Health check endpoint polled by EC2 Auto Recovery or an uptime monitor (UptimeRobot — free)
- [ ] Alert on health check failure

**Phase 7 exit criteria:**
- App accessible at `https://<domain>.sslip.io` with valid TLS
- `GET /api/health` returns 200 from the live domain
- CI deploys to staging automatically
- Production deployment requires manual trigger

---

## Phase 8 — Data Migration

**Goal:** Existing data in Firebase Realtime Database migrated to PostgreSQL. Users can continue without data loss.

### 8.1 Firebase Data Export

- [ ] Export Firebase Realtime DB to JSON:
  ```
  /payments.json
  /banks.json
  /cases.json
  /recepients.json   ← note typo in old endpoint name
  /messages.json (if any)
  ```
- [ ] Review exported data — identify any malformed or inconsistent records

### 8.2 Migration Script `[NEW]`

- [ ] Write `scripts/migrate-firebase.ts`:
  1. Read each Firebase JSON export
  2. Create a placeholder `User` row for the existing user account (Firebase UID)
  3. Insert `BankAccount` rows — mask + encrypt account numbers
  4. Insert `Case` rows — parse children array
  5. Insert `Recipient` rows — fix `recepients` → `recipients` naming
  6. Insert `Payment` rows — map Firebase status integers to new enum values
- [ ] Run migration script against staging DB first
- [ ] Verify row counts match Firebase export counts
- [ ] Verify payment filters return same results as old app

### 8.3 Cutover Plan `[NEW]`

- [ ] Schedule a maintenance window (off-peak hours)
- [ ] Put old Firebase app into read-only mode (remove write rules in Firebase security rules)
- [ ] Run migration script against production DB
- [ ] Smoke test: log in, verify bank accounts, cases, payment history all load
- [ ] Update DNS / communicate new URL to users
- [ ] Keep old Firebase app accessible (read-only) for 2 weeks as fallback
- [ ] After 2 weeks: disable old Firebase app

**Phase 8 exit criteria:**
- All records from Firebase visible in new app
- Zero data loss (row counts verified)
- Old app still accessible in read-only mode as fallback

---

## Phase 9 — Launch & Post-Launch

### 9.1 User Acceptance Testing (UAT)

- [ ] Walk through all E2E test scenarios manually on production
- [ ] Test on real mobile devices (iOS Safari, Android Chrome)
- [ ] Test language switching in DE and ES
- [ ] Verify emails (password reset) are received

### 9.2 Launch Checklist

- [ ] All E2E tests passing on staging
- [ ] Security review signed off
- [ ] Accessibility audit passed
- [ ] Firebase data migration complete and verified
- [ ] Monitoring / uptime alert active
- [ ] Rollback plan documented
- [ ] Old Firebase app in read-only mode

### 9.3 Post-Launch (Week 12+)

- [ ] Monitor error logs daily for first 2 weeks
- [ ] Fix any bugs surfaced by real usage (P1: blocking, P2: degraded, P3: cosmetic)
- [ ] 2 weeks after launch: retire old Firebase app
- [ ] Backlog grooming — prioritise v2 features (see below)

---

## Out of Scope for v1 — v2 Backlog

These items were identified in REQUIREMENTS.md as out-of-scope for the initial release. Log them as future tickets:

| Feature | Notes |
|---|---|
| Real ACH / payment processor integration | Stripe, Plaid, or direct ACH — requires compliance review |
| Real-time notifications | WebSocket or Firebase Cloud Messaging for payment status updates |
| Dark mode | CSS token architecture supports it; just needs a `[data-theme=dark]` override |
| PDF export (payment history) | `react-pdf` or server-side PDF generation |
| Admin / back-office portal | Separate app for support staff |
| Two-factor authentication | Firebase MFA |
| Mobile native app | React Native sharing the same backend API |
| Advanced analytics | Payment trends, export to CSV |

---

## Summary: Gap Coverage

Features that existed in the old app but were broken or incomplete, now fully addressed:

| Gap | Old App Status | New App |
|---|---|---|
| Email/password login | UI existed, no backend | Phase 4.1 — fully functional |
| Register page | Placeholder only | Phase 4.2 — built from scratch |
| Forgot password | Route existed, no logic | Phase 4.3 — Firebase email reset |
| Send Money | Button only, non-functional | Phase 5.1 — full flow |
| Request Money | Button only, non-functional | Phase 5.2 — full flow |
| Recipients forms | Incomplete | Phase 4.7 — complete CRUD |
| Row-level security | None (browser→Firebase direct) | Phase 2 — all routes scoped to userId |
| Account number security | Stored as plain text in Firebase | Phase 2 — encrypted at rest, last 4 only in responses |
| Messages read/unread | Static JSON, no state | Phase 5.3 — PATCH /read endpoint |
| Unread count badge | None | Phase 3.6 — nav badge |
| User profile | None | Phase 5.4 — built from scratch |
| Account settings | None | Phase 5.5 — built from scratch |
| DE/ES translation gaps | Partial | Phase 5.6 — 100% coverage |
| Mobile responsive | Never tested | Phase 5.7 — verified at all breakpoints |
| Pagination on all lists | Cases/recipients had none | All list pages paginated |
| Dashboard data aggregation | Client-side, multiple calls | Phase 2.7 — single `/api/dashboard/*` calls |
| Cases pagination | None | Phase 4.6 — paginated |
| Payment amount colour-coding | All grey | Phase 4.8 — positive/negative/pending |
