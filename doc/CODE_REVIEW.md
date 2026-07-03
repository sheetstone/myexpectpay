# Code Review — `src/` (2026-07-03)

Full review of the `src/` tree (106 files): implementation quality, dead code, security
posture vs. industry standard, and architecture fitness for expansion.

**Overall:** the codebase is in good shape. The layering is clean and consistent, every API
route enforces auth + Zod validation + user-scoping, and the security fundamentals (session
cookies, field-level encryption, server-only Firestore) match industry norms. Findings below
are refinements, not structural problems.

> **Actions taken from this review (2026-07-03):**
> - ✅ Dead code removed: `ErrorMessage`, `getPayment()`, `AuthUser`; test helpers consolidated
>   onto `renderWithProviders` (deleted `renderWithIntl.tsx`). (§2)
> - ✅ Delete-account fixed: `DELETE /api/users/me` now calls `deleteUser(uid)` and clears the
>   session cookie. (§3.1)
> - 📋 Balance stub filed as [#61](https://github.com/sheetstone/myexpectpay/issues/61) for
>   triage (source-of-truth decision needed). (§3.2)
> - ⏳ Not yet actioned: `Payment.caseNumber` type (§3.3), rate limiting + key rotation (§4),
>   `withAuth`/`withValidation` wrappers (§1).

Snapshot at review time: **237/237 tests pass**, `type-check` clean (excluding a stale
dev-server `.next` artifact, see §2), `lint` clean (0 errors, 5 pre-existing warnings).

---

## 1. Architecture assessment — good for expansion ✅

The request flow is a clean, conventional Next.js App Router design:

```
Client Component ─fetch─▶ Route Handler ─▶ getSession() ─▶ firestore/<domain>.ts ─▶ Admin SDK
Server Component ─────────────────────────▶ getSession() ─▶ firestore/<domain>.ts ─▶ Admin SDK
```

**Strengths for scaling:**

- **Clear separation of concerns.** Route handlers are thin (auth → validate → delegate);
  all Firestore access is isolated in `src/lib/firestore/*.ts` (one file per collection).
  Adding a new domain = one firestore module + one schema + one route folder. Very low friction.
- **Consistent user-scoping.** Every data path goes through `users/{uid}/<collection>`, so
  cross-tenant leakage is structurally hard. `firestore.rules` denies all (Admin SDK bypasses),
  which is the correct posture for a server-only access model.
- **Single validation source.** Zod schemas in `src/lib/schemas` are shared between the form
  resolver and the route handler — no drift between client and server validation.
- **Cursor-based pagination** is implemented uniformly (`listBanks`, `listPayments`,
  `listMessages` all use `startAfter` + `limit+1` look-ahead). Scales past offset-pagination limits.
- **Typed enums** (`PAYMENT_STATUS`, `PAYMENT_TYPE`) defined once and imported everywhere.

**Watch items as the app grows:**

- **No service/domain layer between routes and Firestore.** Fine today. Once business rules get
  richer (e.g. payment state machines, multi-step transfers), consider a `src/lib/services/`
  layer so rules don't accumulate inside route handlers.
- **Cross-cutting concerns are copy-pasted.** The `getSession()` + 401 guard and the
  `safeParse → 400` block are repeated in every route. A small `withAuth(handler)` /
  `withValidation(schema, handler)` wrapper would remove ~8 lines of boilerplate per route and
  make it impossible to forget the auth check on a new route.
- **No rate limiting** anywhere (see §4).

---

## 2. Leftover / dead code to clean out

| Item | Location | Status |
|---|---|---|
| `ErrorMessage` component | `src/components/ui/ErrorMessage.tsx` + `index.ts` export | Exported, **never imported** anywhere |
| `getPayment()` | `src/lib/firestore/payments.ts:68` | **Never called** — no `/api/payments/[id]` route exists |
| `AuthUser` interface | `src/types/index.ts:11` | **Never used** — `SessionUser` (session.ts) is the real type |
| Redundant test helpers | `src/test/renderWithIntl.tsx` vs `src/test/testWrapper.tsx` | Two render helpers; both in use but overlapping. Consolidate to one. |
| Stale `.next` type artifact | `.next/dev/types/app/page.ts` | References the deleted `src/app/page.tsx`. Not source — clears on **dev-server restart** / clean build. Harmless to CI (fresh build). |

None of these affect runtime. `ErrorMessage`/`getPayment`/`AuthUser` may be intentional
scaffolding for near-future features (e.g. a payment-detail page) — see open question in §7.

---

## 3. Correctness gaps

### 3.1 "Delete account" does not delete the Firebase Auth user — **High**

`DELETE /api/users/me` deletes all Firestore subcollections + the user doc and calls
`revokeRefreshTokens(uid)`, but **never calls `getAdminAuth().deleteUser(uid)`**. Consequences:

- The auth identity persists. A Google user who "deletes" their account and signs in again
  gets a fresh empty account under the **same uid** — not a deleted account.
- The email address stays claimed, so the user cannot re-register with email/password.

`revokeRefreshTokens` only invalidates existing sessions; it is not account deletion. This
should call `deleteUser(uid)` as the final step (after Firestore cleanup).

### 3.2 Dashboard `balance` is hard-coded to `0` — **Medium**

`src/app/api/dashboard/route.ts:79` returns `balance: 0` unconditionally. The UI renders a
large `$0.00` balance for every user. Either compute a real balance (sum of completed
received − sent) or remove the balance display until the source of truth is defined.
(Note: a real ledger balance likely belongs to the payment processor, not a Firestore sum —
worth clarifying the intended source.)

### 3.3 `Payment.caseNumber` type says non-null, data allows null — **Low**

`types/index.ts:122` types `caseNumber: string`, but the seed writes `null` and
`docToPayment` passes `data.caseNumber` through untouched. The send/request **schemas** require
it (`min(1)`), so real payments always have one — but historical/seed data and the type disagree.
Make the type `string | null` to match reality, or enforce non-null at read time.

---

## 4. Security review — matches industry standard, with gaps

**Solid:**

- Session cookies are `httpOnly`, `secure` (prod), `sameSite: strict`, 5-day expiry — textbook.
- `verifySessionCookie(cookie, true)` uses `checkRevoked: true` on every request.
- Account numbers encrypted with **AES-256-GCM** (authenticated encryption, random IV,
  auth tag) at the application layer before Firestore — correct; only last-4 stored in clear.
- Firestore access is **server-only**; client SDK is auth-only. `firestore.rules` denies all.
- All request bodies + query params validated with Zod before use.
- Payment `send` re-verifies bank ownership + `verified` status + recipient ownership server-side.

**Gaps to close before/soon after launch:**

- **No rate limiting** on `POST /api/auth/session`, `/payments/send`, etc. A payment app should
  throttle auth and money-movement endpoints (e.g. Firebase App Check + per-uid limits, or an
  edge rate limiter).
- **`ACCOUNT_ENCRYPTION_KEY` has no rotation story.** Ciphertext has no key-version prefix, so
  rotating the key would orphan existing data. Consider a `v1:` version tag on ciphertext now
  (cheap to add, expensive to retrofit).
- **Logout revokes *all* refresh tokens** for the uid (`revokeRefreshTokens`), i.e. logs the
  user out of every device, not just the current session. May be intended; worth confirming.
- **`console.error` in the session route** (`session/route.ts:37`) will log to server output.
  Fine for now; route through a structured logger before launch so tokens/PII never leak.

---

## 5. Design vs. industry standard ✅

- **Server Components by default**, `"use client"` only where interactivity is needed — correct
  App Router usage.
- **TanStack Query** for client reads with `staleTime`; **React Hook Form + Zod** for forms.
- **i18n** via `react-intl`, all user-facing strings keyed (EN/DE/ES). No hardcoded English in
  the components reviewed.
- **CSS Modules** per component + design tokens. Consistent.
- **Confirmation dialogs** on destructive actions (delete bank/case/recipient/account).

These are all mainstream, well-supported choices — nothing exotic, nothing deprecated.

---

## 6. Documentation status

The `doc/` tree is unusually complete for a project this size: 7 ADRs, per-phase plans + logs,
`REQUIREMENTS.md`, `MIGRATION_PLAN.md`, `MANUAL_TEST_CASES.md`. This is a strength — keep it up.

**Suggested updates** (not yet applied — pending review decisions):
- Record the delete-account and balance gaps (§3) in the phase-05 or a known-issues section.
- Add an ADR for the field-level encryption scheme (currently only in code) so the key-rotation
  decision (§4) is captured before it's needed.

---

## 7. Open questions / uncertainties

1. **Dead code (§2):** remove `ErrorMessage`, `getPayment`, `AuthUser` now, or keep as
   scaffolding for an upcoming payment-detail / error-surface feature?
2. **Delete-account (§3.1):** confirm intended behaviour — should "Delete Account" fully remove
   the Firebase Auth identity (add `deleteUser`)? (Recommended: yes.)
3. **Balance (§3.2):** what is the source of truth for account balance — a Firestore-derived sum,
   or the external ExpertPay processor? Determines whether we compute it or hide it.
4. **Logout scope (§4):** single-device or all-device logout?
