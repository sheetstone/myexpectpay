# Phase 07 — Deployment & DevOps (Firebase App Hosting)

**Status:** Not Started  
**Target:** Week 10–11  
**Roles involved:** DevOps

> Deploy the Next.js app to Firebase App Hosting (staging, then production). Wire up GitHub Actions for CI/CD. Configure secrets and custom domain.

---

## Prerequisites

- Phase 01 complete (Firebase project created, App Hosting enabled)
- `firebase.json`, `apphosting.yaml`, `.firebaserc` configured locally

---

## Tasks

### P07-001: apphosting.yaml Configuration
**Role:** DevOps  
**Type:** [NEW]  
**Estimate:** 1 hour  

**What to build:**  
`apphosting.yaml` at the repo root. Defines the build command, output directory, and server-side environment variable references (Firebase App Hosting secrets).

```yaml
runConfig:
  minInstances: 0
env:
  - variable: FIREBASE_PROJECT_ID
    secret: firebase-project-id
  - variable: FIREBASE_CLIENT_EMAIL
    secret: firebase-client-email
  - variable: FIREBASE_PRIVATE_KEY
    secret: firebase-private-key
  - variable: ACCOUNT_ENCRYPTION_KEY
    secret: account-encryption-key
  - variable: SESSION_COOKIE_SECRET
    secret: session-cookie-secret
  - variable: NEXT_PUBLIC_FIREBASE_API_KEY
    value: ${{ env.NEXT_PUBLIC_FIREBASE_API_KEY }}
  # ... other NEXT_PUBLIC vars
```

**Acceptance criteria:**
- [ ] `apphosting.yaml` references all required secrets by name
- [ ] `NEXT_PUBLIC_*` vars set as plaintext values (not secrets — they're client-safe)
- [ ] Build command produces a valid Next.js standalone output

---

### P07-002: Firebase App Hosting — Staging Backend
**Role:** DevOps  
**Type:** [NEW]  
**Estimate:** 2 hours  

**What to build:**  
Create the Firebase App Hosting backend (staging) via `firebase apphosting:backends:create`. Connect to the GitHub repo. Configure Firebase secrets via `firebase apphosting:secrets:set`.

**Acceptance criteria:**
- [ ] Firebase App Hosting backend created in Firebase Console
- [ ] All secrets set: `firebase-project-id`, `firebase-client-email`, `firebase-private-key`, `account-encryption-key`, `session-cookie-secret`
- [ ] First deployment succeeds (`firebase deploy` or GitHub push triggers it)
- [ ] App accessible at the Firebase App Hosting staging URL
- [ ] `GET /api/dashboard` returns data (auth required — test with a session)

---

### P07-003: Firebase Auth — Staging Authorized Domains
**Role:** DevOps  
**Type:** [NEW]  
**Estimate:** 30 min  

**What to build:**  
Add the Firebase App Hosting staging URL to Firebase Auth authorized domains so Google OAuth and email/password flows work in staging.

**Acceptance criteria:**
- [ ] Staging URL added to Firebase Console → Authentication → Settings → Authorized domains
- [ ] Google OAuth popup works on the staging deployment
- [ ] Email/password login works on staging

---

### P07-004: Staging Smoke Test
**Role:** DevOps  
**Type:** [NEW]  
**Estimate:** 2 hours  

Run through the manual test cases from `MANUAL_TEST_CASES.md` against the staging deployment.

**Acceptance criteria:**
- [ ] All TC-AUTH-* pass on staging
- [ ] All TC-DASH-* pass on staging
- [ ] At least one successful bank account add → verify → delete cycle
- [ ] Send money end-to-end on staging
- [ ] No console errors on any page

---

### P07-005: Production Environment Setup
**Role:** DevOps  
**Type:** [NEW]  
**Estimate:** 2 hours  

**What to build:**  
Create a separate Firebase App Hosting backend for production. Separate set of secrets. `NODE_ENV=production`.

**Acceptance criteria:**
- [ ] Production backend created in Firebase App Hosting
- [ ] Production secrets set (separate values from staging — different encryption key, etc.)
- [ ] Production Firebase Auth: authorized domains include production URL
- [ ] `firestore.rules` deployed to production Firestore instance (deny all)
- [ ] Firestore indexes deployed

---

### P07-006: CI/CD — GitHub Actions
**Role:** DevOps  
**Type:** [NEW]  
**Estimate:** 2 hours  

**What to build:**  
Two workflows:

1. `.github/workflows/ci.yml` — on every push and PR: lint → type-check → unit tests → build
2. Firebase App Hosting GitHub integration (automatic deploy on push to `main` via Firebase's own GitHub App — configure in Firebase Console)

**Acceptance criteria:**
- [ ] CI workflow passes on every PR
- [ ] Merging to `main` triggers automatic staging redeploy via Firebase GitHub App
- [ ] Production deploy is gated: manual trigger (`workflow_dispatch`) or tag push (`v*`)
- [ ] CI does not require Firebase secrets (unit tests mock Firebase)

---

### P07-007: Custom Domain (Optional)
**Role:** DevOps  
**Type:** [NEW]  
**Estimate:** 1 hour  

**Acceptance criteria:**
- [ ] Custom domain configured in Firebase App Hosting (if domain is available)
- [ ] HTTPS automatic via Firebase
- [ ] Domain added to Firebase Auth authorized domains

---

### P07-008: Uptime Monitoring
**Role:** DevOps  
**Type:** [NEW]  
**Estimate:** 1 hour  

**Acceptance criteria:**
- [ ] Uptime check configured for `GET /api/health` (add a simple health Route Handler if not present)
- [ ] Alert channel configured (email)
- [ ] Monitor URL documented in project README

---

## Phase Exit Criteria

- [ ] App live at staging URL — all pages load, auth works, data reads/writes work
- [ ] App live at production URL (or custom domain)
- [ ] CI passes on every PR; staging auto-deploys on merge to `main`
- [ ] All Firebase secrets set in both staging and production environments
- [ ] Uptime monitoring active on production
- [ ] No service account key or encryption key in git
