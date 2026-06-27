# Phase 04 — Page Migration (Next.js App Router)

**Status:** Not Started  
**Target:** Week 4–7  
**Roles involved:** Full-stack

> Re-implement every page from the old React + Vite app inside Next.js App Router. Each page connects to a real Route Handler. Server Components fetch data; Client Components handle interactivity.

> **Carry-over:** Form validation logic, Zod schemas, CSS Modules, and UI component markup can be ported from the old `frontend/src/pages/` directory. The wiring (routing, data fetching, auth context) must be rewritten for Next.js.

---

## Prerequisites

- Phase 02 complete (all Route Handlers working)
- Phase 03 complete (auth + layout + shell)

---

## Tasks

### P04-001: Dashboard Page
**Role:** Full-stack  
**Type:** [MIGRATE]  
**Estimate:** 3 hours  

File: `src/app/(dashboard)/page.tsx`

Server Component fetches from `GET /api/dashboard`. Tabs (Account Summary, Activity Calendar, Recent Messages) are a Client Component island for interactivity.

**Acceptance criteria:**
- [ ] `AccountSummary` widget renders balance and totals
- [ ] `PaymentChart` (Recharts) renders 12-month data
- [ ] `ActivityCalendar` renders current-month activity
- [ ] `RecentMessages` renders up to 5 messages
- [ ] Tab switching is client-side — no full page reload
- [ ] Welcome greeting shows user display name from session

---

### P04-002: Bank Accounts Page
**Role:** Full-stack  
**Type:** [MIGRATE]  
**Estimate:** 4 hours  

File: `src/app/(dashboard)/bank-accounts/page.tsx`

Server Component for initial list fetch. Client Components for sidebar selection, detail panel, and modal interactions.

**Acceptance criteria:**
- [ ] Two-column layout: account list sidebar + detail panel
- [ ] Add Account modal with full form validation (routing checksum, account match, type)
- [ ] Edit modal (account type + nickname only)
- [ ] Verify, Set Primary, Toggle send/receive actions work
- [ ] Delete with confirmation dialog
- [ ] Account number: only last 4 digits displayed everywhere
- [ ] Pagination works (cursor-based)
- [ ] Empty state shown when no accounts

---

### P04-003: Cases Page
**Role:** Full-stack  
**Type:** [MIGRATE]  
**Estimate:** 3 hours  

File: `src/app/(dashboard)/cases/page.tsx`

**Acceptance criteria:**
- [ ] Cases listed with NCP name, case number, and children count
- [ ] Add / Edit modal with case number validation + dynamic children field array
- [ ] Delete with confirmation dialog
- [ ] Pagination works
- [ ] Empty state shown when no cases

---

### P04-004: Recipients Page
**Role:** Full-stack  
**Type:** [MIGRATE]  
**Estimate:** 3 hours  

File: `src/app/(dashboard)/recipients/page.tsx`

**Acceptance criteria:**
- [ ] Recipient cards show name, email, linked case
- [ ] Add / Edit modal with name, email, case dropdown (populated from user's cases)
- [ ] Delete with confirmation dialog
- [ ] Pagination works
- [ ] Empty state shown when no recipients

---

### P04-005: Payments Page
**Role:** Full-stack  
**Type:** [MIGRATE]  
**Estimate:** 3 hours  

File: `src/app/(dashboard)/payments/page.tsx`

**Acceptance criteria:**
- [ ] Payment table with columns: Date, Recipient, Case Number, Status, Amount
- [ ] Filter bar: date range picker + multi-select status filter
- [ ] All 10 payment status values display as colour-coded badges
- [ ] Filters persist in URL search params; page resets to 1 on filter change
- [ ] Pagination works
- [ ] Empty state; error state; loading state
- [ ] "Send Money" and "Request Money" buttons present but disabled (tooltip: "Coming soon") — enabled in Phase 05

---

## Phase Exit Criteria

- [ ] All 5 pages load and display real data from the Route Handlers
- [ ] All CRUD operations work end-to-end (add → list updates → edit → delete)
- [ ] Confirmation dialogs shown for all destructive actions
- [ ] All pages have loading, empty, and error states
- [ ] `npm run type-check` — zero errors
- [ ] `npm run lint` — zero errors
