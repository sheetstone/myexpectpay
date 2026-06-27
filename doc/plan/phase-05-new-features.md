# Phase 05 — New Features & Gap Fill

**Status:** Not Started  
**Target:** Week 6–9  
**Roles involved:** Full-stack

> Build everything that was missing or stubbed out. Send/Request money modals, full Messages page, Profile, Settings, i18n gap fill, and mobile responsive audit.

---

## Prerequisites

- Phase 04 complete (all pages migrated)
- Route Handlers for payments/send and payments/request complete (Phase 02)

---

## Tasks

### P05-001: Send Money Modal
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 4 hours  

File: `src/app/(dashboard)/payments/_components/SendMoneyModal.tsx` (Client Component)

**Acceptance criteria:**
- [ ] Only **verified** bank accounts appear in "From" dropdown
- [ ] Amount: numeric, min 0.01, max 6 digits before decimal
- [ ] All required fields show inline error on blur (Zod + React Hook Form)
- [ ] Submit disabled while in-flight
- [ ] On success: modal closes, toast shown, payments list refreshes
- [ ] On server error: error message shown inside modal
- [ ] Keyboard accessible: focus trapped, Escape closes, focus returns to trigger
- [ ] "Send Money" button on Payments page enabled (remove disabled + tooltip)

---

### P05-002: Request Money Modal
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 3 hours  

File: `src/app/(dashboard)/payments/_components/RequestMoneyModal.tsx` (Client Component)

**Acceptance criteria:**
- [ ] Same validation rules as Send Money (minus bank account field)
- [ ] On success: modal closes, toast, payments list refreshes
- [ ] On server error: shown inside modal
- [ ] Keyboard accessible
- [ ] "Request Money" button on Payments page enabled

---

### P05-003: Messages Page — Full Implementation
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 3 hours  

File: `src/app/(dashboard)/messages/page.tsx`

**Acceptance criteria:**
- [ ] Full paginated message list
- [ ] Unread: `font-weight: medium` + `var(--color-primary)` left border accent
- [ ] Clicking a message expands body inline (accordion)
- [ ] Opening a message calls `PATCH /api/messages/:id/read`
- [ ] Unread count in nav badge updates via TanStack Query cache update (not full refetch)
- [ ] Empty state when inbox is empty

---

### P05-004: User Profile Page
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 3 hours  

File: `src/app/(dashboard)/profile/page.tsx`

**Acceptance criteria:**
- [ ] Avatar: initial-based circle (first letter of display name) in `var(--color-primary)`
- [ ] Display name editable inline — calls Firebase `updateProfile`
- [ ] Change password form: current password, new password (min 8 chars), confirm
- [ ] Change password: Firebase `reauthenticateWithCredential` → `updatePassword`
- [ ] `auth/wrong-password` shown as inline form error
- [ ] Toast on successful name update and password change
- [ ] Link to `/settings`

---

### P05-005: Account Settings Page
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 3 hours  

File: `src/app/(dashboard)/settings/page.tsx`

**Acceptance criteria:**
- [ ] Language selector (EN / DE / ES): changes `localStorage` locale + updates `<IntlProvider>` immediately
- [ ] Delete account: user must type their exact display name to enable the button
- [ ] Delete account: Firebase `deleteUser` → `DELETE /api/users/me` → sign out → `/login`
- [ ] Notification preferences section: placeholder ("Coming in a future update")

---

### P05-006: Complete i18n — DE and ES Gap Fill
**Role:** Full-stack  
**Type:** [UPGRADE]  
**Estimate:** 4 hours  

**Acceptance criteria:**
- [ ] `en.json`, `de.json`, `es.json` have identical key sets (zero missing)
- [ ] All 36+ `bankAccount.*` keys missing from DE and ES are added
- [ ] New feature keys added: `sendMoney.*`, `requestMoney.*`, `messages.*`, `profile.*`, `settings.*`
- [ ] Currency: `intl.formatNumber(amount, { style: 'currency', currency: 'USD' })` on every page
- [ ] Dates: `intl.formatDate()` on every page
- [ ] Manual walkthrough: switch to DE → full German; switch to ES → full Spanish

---

### P05-007: Mobile Responsive Audit & Fixes
**Role:** Full-stack  
**Type:** [UPGRADE]  
**Estimate:** 5 hours  

**Acceptance criteria:**
- [ ] Nav collapses to hamburger at 361px; drawer opens/closes
- [ ] All modals go full-screen at 361px breakpoint
- [ ] Activity calendar scrolls horizontally at 361px and 711px
- [ ] Payment table columns stack vertically at 361px
- [ ] Bank account and recipient cards full-width at 361px
- [ ] Login hero decorative cards hidden at 361px and 711px
- [ ] All interactive elements min 44×44px tap target (WCAG)
- [ ] No horizontal scroll at any breakpoint

---

## Phase Exit Criteria

- [ ] Send Money: end-to-end (modal → `POST /api/payments/send` → payment in list)
- [ ] Request Money: end-to-end
- [ ] Messages page: read/unread state, accordion, unread badge
- [ ] Profile: display name editable, password change works
- [ ] Settings: language switcher live, delete account works
- [ ] Zero missing i18n keys across EN / DE / ES
- [ ] All pages correct at 361px, 711px, 921px, 1201px
