# Phase 03 — Frontend Foundation (Next.js App Router)

**Status:** Not Started  
**Target:** Week 2–4 (parallel with Phase 02)  
**Roles involved:** Full-stack

> Wire up the Next.js App Router layout structure, Firebase Auth flows (login, register, forgot password), and the shared app shell so every page has a stable, authenticated context to build on.

---

## Prerequisites

- Phase 01 complete (Next.js scaffold, session management, UI primitives)
- Firebase Auth emulator running locally

## Read Before Starting

- `CLAUDE.md` — App Router group layout structure and auth flow
- `REQUIREMENTS.md §3` — authentication requirements

---

## Tasks

### P03-001: App Router Layout Groups
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 2 hours  

**What to build:**  
Create the two route group layouts:
- `src/app/(auth)/layout.tsx` — unauthenticated shell (logo, no nav)
- `src/app/(dashboard)/layout.tsx` — authenticated shell with `<AppShell>` nav

`<AppShell>` includes sidebar/top nav with links to all 8 sections. Nav items are Server Components; interactive state (mobile drawer) is a Client Component.

**Acceptance criteria:**
- [ ] `(auth)/layout.tsx` — clean centred layout, no nav
- [ ] `(dashboard)/layout.tsx` — calls `getSession()` server-side; redirects to `/login` if no session
- [ ] `<AppShell>` renders nav links for: Dashboard, Bank Accounts, Cases, Recipients, Payments, Messages, Profile, Settings
- [ ] Active nav link highlighted based on current pathname

---

### P03-002: Login Page
**Role:** Full-stack  
**Type:** [MIGRATE]  
**Estimate:** 2 hours  

**What to build:**  
`src/app/(auth)/login/page.tsx` — port from existing `LoginPage.tsx`. Client Component. Two-column layout with `<BrandPanel>`. Google OAuth button + email/password form. On successful Firebase Auth sign-in, POSTs ID token to `POST /api/auth/session`, then `router.push('/')`.

**Acceptance criteria:**
- [ ] Google sign-in works via `signInWithPopup`
- [ ] Email/password form: email required + valid format, password required
- [ ] Inline errors on blur; server error alert on wrong credentials
- [ ] Submit button disabled while in-flight
- [ ] Show/hide password toggle
- [ ] Remember me checkbox (persists Firebase Auth session)
- [ ] On success: session cookie set → redirected to `/`
- [ ] Already authenticated → redirect to `/`

---

### P03-003: Register Page
**Role:** Full-stack  
**Type:** [MIGRATE]  
**Estimate:** 2 hours  

**What to build:**  
`src/app/(auth)/register/page.tsx` — port from existing `RegisterPage.tsx`. Client Component. On successful Firebase `createUserWithEmailAndPassword`, POSTs ID token to `POST /api/auth/session`.

**Acceptance criteria:**
- [ ] Fields: Full Name, Email, Password (min 8 chars), Confirm Password (must match)
- [ ] All four fields show inline errors on blur
- [ ] Show/hide toggles on both password fields
- [ ] Duplicate email → server error shown
- [ ] On success → session cookie set → redirected to `/`
- [ ] Link to `/login`

---

### P03-004: Forgot Password Page
**Role:** Full-stack  
**Type:** [MIGRATE]  
**Estimate:** 1 hour  

**What to build:**  
`src/app/(auth)/forgot-password/page.tsx` — port from existing `ForgotPasswordPage.tsx`. Two-column layout with `<BrandPanel>`. Firebase `sendPasswordResetEmail` only (no backend call needed).

**Acceptance criteria:**
- [ ] Email field with inline validation
- [ ] On success: success state with check icon + submitted email bolded
- [ ] "Try a different address" resets to form (no page reload)
- [ ] "Back to sign in" button on success state
- [ ] Unknown email → error alert shown

---

### P03-005: Auth Context (Client)
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 2 hours  

**What to build:**  
`src/components/providers/AuthProvider.tsx` (`"use client"`) — wraps the app, listens to `onAuthStateChanged`. On sign-in: POSTs ID token to `/api/auth/session`. On sign-out: POSTs to `/api/auth/logout`, calls `router.push('/login')`.

Exports `useAuth()` hook with: `user: FirebaseUser | null`, `loading: boolean`, `signOut()`.

**Acceptance criteria:**
- [ ] `useAuth()` available in any Client Component
- [ ] Session cookie is created immediately after Firebase Auth resolves
- [ ] `signOut()` clears both Firebase Auth and the session cookie
- [ ] On token expiry, Firebase auto-refreshes and session cookie is updated

---

### P03-006: Logout
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 30 min  

**What to build:**  
Logout button in `<AppShell>` calls `signOut()` from `useAuth()`. After logout, middleware redirects all dashboard routes to `/login`.

**Acceptance criteria:**
- [ ] Clicking logout → session cookie cleared → redirected to `/login`
- [ ] Back-button after logout → middleware redirects to `/login` (not back to dashboard)

---

## Phase Exit Criteria

- [ ] Google sign-in works end-to-end with emulator: login → session cookie → dashboard
- [ ] Email/password sign-in works end-to-end
- [ ] Email/password register works end-to-end
- [ ] Forgot password email sent via Firebase
- [ ] Logout clears session and redirects
- [ ] Unauthenticated access to any `/(dashboard)/` route → redirected to `/login`
- [ ] `<AppShell>` renders with correct nav links; active link highlighted
- [ ] `npm run type-check` — zero errors
