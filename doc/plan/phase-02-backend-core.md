# Phase 02 — Data Layer & API Routes

**Status:** Complete  
**Completed:** 2026-06-27  
**Roles involved:** Full-stack

> Build the complete Firestore data access layer and all Next.js Route Handlers. Every CRUD operation for all six collections must be working and validated before frontend pages are built.

---

## Prerequisites

- Phase 01 complete (Firebase Admin SDK working, session management working, emulator running)

## Read Before Starting

- `CLAUDE.md` — Firestore data model and Route Handler structure
- `REQUIREMENTS.md §4` — endpoint contracts

---

## Tasks

### P02-001: Firestore Data Access Layer
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 4 hours  

**What to build:**  
`src/lib/firestore/` — one file per collection, each exporting typed async functions. No raw Firestore calls outside this layer. All functions take `uid: string` as the first arg and operate on `db.collection('users').doc(uid).collection('...')`.

Files: `banks.ts`, `cases.ts`, `recipients.ts`, `payments.ts`, `messages.ts`

**Acceptance criteria:**
- [x] Each file exports: `list(uid, options)`, `get(uid, id)`, `create(uid, data)`, `update(uid, id, data)`, `del(uid, id)`
- [x] `list()` uses cursor-based pagination (`startAfter` + `limit`; default 20)
- [x] All return types fully typed — no `any`
- [x] Account number encrypted before write, decrypted after read (via `src/lib/crypto.ts`)
- [x] `list()` returns only `accountNumberLast4`, not the full account number

---

### P02-002: Zod Schemas (shared)
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 2 hours  

**What to build:**  
`src/lib/schemas/` — one Zod schema file per domain. Imported by both Route Handlers (server validation) and React Hook Form resolvers (client validation).

Files: `bankSchema.ts`, `caseSchema.ts`, `recipientSchema.ts`, `paymentSchema.ts`

**Acceptance criteria:**
- [x] Bank create schema validates: `routingNumber` (9-digit ABA checksum via `.refine`), `accountNumber`, `confirmAccountNumber` (match), `accountType` (`checking | saving`), optional `nickname` (max 60)
- [x] Case create schema validates: `caseNumber` (via `validateCaseNumber`), `ncpName`, `children` (string[])
- [x] Recipient create schema validates: `firstName`, `lastName`, `email`, optional `caseId`
- [x] Payment schemas (send + request) validate: `amount` (positive, max 6 digits), required fields per type
- [x] Edit schemas are separate and only include mutable fields

---

### P02-003: Route Handlers — Bank Accounts
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 3 hours  

Files:
- `src/app/api/banks/route.ts` — `GET` list, `POST` create
- `src/app/api/banks/[id]/route.ts` — `GET`, `PATCH`, `DELETE`
- `src/app/api/banks/[id]/verify/route.ts` — `POST`
- `src/app/api/banks/[id]/primary/route.ts` — `POST`

**Acceptance criteria:**
- [x] All routes call `getSession()` — return 401 if missing
- [x] `POST` validates with Zod bank schema; returns 400 with error detail on invalid
- [x] `DELETE` returns 404 if bank ID not found under session user
- [x] Account number never exposed in list response (only `accountNumberLast4`)
- [x] `POST .../verify` sets `verified: true`; `POST .../primary` sets `isPrimary: true` and clears other accounts' `isPrimary`

---

### P02-004: Route Handlers — Cases
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 2 hours  

Files:
- `src/app/api/cases/route.ts` — `GET`, `POST`
- `src/app/api/cases/[id]/route.ts` — `PATCH`, `DELETE`

**Acceptance criteria:**
- [x] All routes auth-gated
- [x] Case number validated with `validateCaseNumber` via Zod `.refine`
- [x] `DELETE` returns 204 on success

---

### P02-005: Route Handlers — Recipients
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 2 hours  

Files:
- `src/app/api/recipients/route.ts` — `GET`, `POST`
- `src/app/api/recipients/[id]/route.ts` — `PATCH`, `DELETE`

**Acceptance criteria:**
- [x] All routes auth-gated
- [x] `caseId` optional; if provided, must reference a case owned by the session user
- [x] Email validated by Zod

---

### P02-006: Route Handlers — Payments
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 3 hours  

Files:
- `src/app/api/payments/route.ts` — `GET` (list with filters)
- `src/app/api/payments/send/route.ts` — `POST`
- `src/app/api/payments/request/route.ts` — `POST`

**Acceptance criteria:**
- [x] `GET` accepts query params: `startDate`, `endDate`, `status[]`, `cursor`, `limit`
- [x] `POST /send` validates: `bankId` (must be verified + owned by user), `recipientId` (owned by user), `amount` > 0, `caseNumber`, optional `note`
- [x] `POST /request` validates: `recipientId`, `amount`, `caseNumber`, optional `note`
- [x] Initial payment status on create is `in_progress`

---

### P02-007: Route Handlers — Messages
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 1 hour  

Files:
- `src/app/api/messages/route.ts` — `GET` list
- `src/app/api/messages/[id]/read/route.ts` — `PATCH`

**Acceptance criteria:**
- [x] `GET` returns paginated list sorted by `createdAt` desc, with `unreadCount` in response
- [x] `PATCH .../read` sets `isRead: true`; returns 404 if message not owned by user

---

### P02-008: Route Handler — Dashboard
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 2 hours  

File: `src/app/api/dashboard/route.ts` — `GET`

Aggregates: balance summary, total sent/received this month, recent 5 messages + unread count, 12-month payment chart data, current-month calendar activity.

**Acceptance criteria:**
- [x] Single `GET` returns all dashboard data
- [x] Chart data: `{ month: string, sent: number, received: number }[]` for last 12 months
- [x] Calendar data: ISO date strings of days with payment activity in current month

---

### P02-009: Route Handler — Delete User
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 1 hour  

File: `src/app/api/users/me/route.ts` — `DELETE`

Deletes all subcollections (bankAccounts, cases, recipients, payments, messages) then the user document in a Firestore batched write.

**Acceptance criteria:**
- [x] All 5 subcollections deleted
- [x] Returns 204 on success; 401 without session

---

## Phase Exit Criteria

- [x] All Route Handlers return correct status codes (200/201/204/400/401/404)
- [x] Invalid body always returns 400 with Zod error details
- [x] Row-level security confirmed: session user X cannot access user Y's data
- [x] `npm run test` passes — 35 tests, 0 failures
- [x] `npm run type-check` — zero errors
