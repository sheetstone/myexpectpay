# Phase 06 — Testing & QA

**Status:** Not Started  
**Target:** Week 8–10  
**Roles involved:** Full-stack

> Verify the app works correctly, securely, and accessibly. Unit tests and integration tests should be written alongside features (Phases 02–05), not all at once at the end.

---

## Prerequisites

- Phases 02–05 complete (all features built)
- Firebase Emulator Suite configured (Phase 01)

---

## Tasks

### P06-001: Unit Tests — Utils & Zod Schemas
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 3 hours  

**What to test:**
- `validateRouting` — valid and invalid ABA numbers (checksum pass/fail)
- `validateCaseNumber` — format pass/fail
- `formatMoney`, `formatDate` — edge cases
- All Zod schemas — happy path + each required field missing + invalid format

**Acceptance criteria:**
- [ ] Coverage ≥ 80% on `src/utils/` and `src/lib/schemas/`
- [ ] `npm run test` passes

---

### P06-002: Integration Tests — Route Handlers (Firebase Emulator)
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 5 hours  

**What to test:**  
All Route Handlers tested with the Firestore + Auth emulators running. Use `fetch` or a thin test client to call the actual Next.js API routes (or test the handler functions directly with a mocked `Request` object).

**Acceptance criteria:**
- [ ] Each Route Handler has: happy-path test, auth-missing 401, invalid-input 400
- [ ] Row-level security: test that user A cannot read user B's documents
- [ ] `DELETE /api/users/me` deletes all subcollections
- [ ] Payment send validates `bankId` must be verified and owned by session user

---

### P06-003: Component Tests — Key Client Components
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 4 hours  

**Priority components:**  
`SendMoneyModal`, `RequestMoneyModal`, `BankAccountForm`, `CaseForm`, `RecipientForm`, `LoginPage`, `RegisterPage`

**Acceptance criteria:**
- [ ] Each form: renders without crash, validation errors shown on submit, success state handled
- [ ] Modals: Escape closes, focus trap works
- [ ] All tests use `msw` for mocking Route Handlers (no real network calls)
- [ ] `npm run test` passes

---

### P06-004: End-to-End Tests — Core Journeys (Playwright)
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 5 hours  

**Journeys to cover:**
1. Register → Login → Dashboard
2. Add bank account → verify → set as primary
3. Add case → add recipient
4. Send money → payment appears in list
5. Request money → payment appears in list
6. Read a message → unread count decrements
7. Change display name on Profile page
8. Switch locale to DE → app in German
9. Delete account → redirected to login

**Acceptance criteria:**
- [ ] All 9 journeys pass against local dev stack with emulator
- [ ] Screenshot on failure
- [ ] Runs in CI (Firebase Emulator started in CI workflow)

---

### P06-005: Security Review
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 3 hours  

**Checklist:**
- [ ] Every Route Handler calls `getSession()` before any Firestore access — no unprotected endpoints
- [ ] All Firestore reads use `users/{uid}/...` — no cross-user data access possible
- [ ] Account numbers encrypted before Firestore write; never returned raw in list responses
- [ ] ABA routing number validated on both client (Zod form schema) and server (Zod Route Handler schema)
- [ ] `firestore.rules` denies all client SDK access (Admin SDK only)
- [ ] Session cookie: `HttpOnly`, `Secure`, `SameSite=Strict`, 5-day expiry
- [ ] CORS headers not overly permissive in Next.js config
- [ ] No Firebase service account key or `ACCOUNT_ENCRYPTION_KEY` in git history
- [ ] `NEXT_PUBLIC_*` vars contain only client-safe values (no secrets)

---

### P06-006: Accessibility Audit (WCAG 2.1 AA)
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 3 hours  

**Checklist:**
- [ ] All form fields have `<label>` elements
- [ ] Error messages linked via `aria-describedby`
- [ ] All interactive elements reachable by keyboard (logical Tab order)
- [ ] Focus indicators visible on all interactive elements
- [ ] Modals trap focus; restore focus on close
- [ ] Color contrast ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- [ ] No content conveyed by colour alone
- [ ] All interactive elements min 44×44px on mobile
- [ ] Screen reader test with VoiceOver on Login, Dashboard, and Payments pages

---

### P06-007: Performance Baseline (Lighthouse)
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 2 hours  

**Acceptance criteria:**
- [ ] Run Lighthouse on Dashboard, Payments, Bank Accounts pages (staging URL)
- [ ] Performance score ≥ 85 on all three
- [ ] LCP < 2.5s, CLS < 0.1
- [ ] Bundle analysis run with `@next/bundle-analyzer`; any chunk > 200KB flagged and justified
- [ ] Results documented in `log/phase-06-testing.md`

---

## Phase Exit Criteria

- [ ] `npm run test` — all unit and component tests pass
- [ ] `npm run test:e2e` — all 9 Playwright journeys pass
- [ ] Security review checklist fully checked off
- [ ] Accessibility audit passed (no WCAG AA failures)
- [ ] Lighthouse score ≥ 85 on 3 key pages
