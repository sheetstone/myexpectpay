# Phase 09 — Launch & Post-Launch

**Status:** Not Started  
**Target:** Week 12+  
**Roles involved:** Full-stack

> UAT, go-live checklist, first two weeks of production monitoring. Phase is not done until the old Firebase app is retired and v2 backlog is groomed.

---

## Prerequisites

- Phases 06–08 complete (all features, all tests passing, migration done)
- Production environment live (Phase 07)

---

## Tasks

### P09-001: User Acceptance Testing (UAT)
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 4 hours  

Internal walkthrough of all core flows with real data on production. Sign-off required before go-live announcement.

**Acceptance criteria:**
- [ ] All 9 Playwright journeys from Phase 06 also pass manually on production
- [ ] Stakeholder sign-off documented

---

### P09-002: Go-Live Checklist
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 2 hours  

**Checklist:**
- [ ] All Phase 05–08 GitHub issues closed
- [ ] Lighthouse ≥ 85 on production
- [ ] Security review passed (Phase 06)
- [ ] Accessibility audit passed (Phase 06)
- [ ] Uptime monitoring active (Phase 07)
- [ ] Error tracking configured (Firebase Crashlytics or Sentry)
- [ ] Firebase Auth: all authorized domains correct for production URL
- [ ] `firestore.rules` deployed (deny all client access)
- [ ] `NEXT_PUBLIC_*` env vars point to production Firebase project
- [ ] No test/seed data in production Firestore
- [ ] Privacy policy and terms of service pages linked in footer
- [ ] README updated with production URL and setup instructions

---

### P09-003: Post-Launch Monitoring (Weeks 1–2)
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** Ongoing  

**Acceptance criteria:**
- [ ] Daily check of Firebase App Hosting logs and uptime monitor
- [ ] Monitor Firebase Console for Firestore read/write errors
- [ ] Error tracking reviewed daily
- [ ] Any user-reported issue addressed within 24 hours

---

### P09-004: Retire Old Firebase App
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 1 hour  

**Acceptance criteria:**
- [ ] Old app Firestore security rules set to deny all writes
- [ ] Old Firebase Hosting deployment disabled
- [ ] Old project retained (not deleted) for 90 days
- [ ] DNS / URLs updated to point to new app

---

### P09-005: v2 Backlog Grooming
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 2 hours  

**Acceptance criteria:**
- [ ] Feedback from first 2 weeks collected
- [ ] v2 GitHub milestone created with prioritised backlog issues
- [ ] Any deferred Phase 05 items (e.g. notification preferences) in backlog

---

## Phase Exit Criteria

- [ ] Old app retired or read-only
- [ ] Production stable for 2 weeks — no P0/P1 incidents
- [ ] v2 backlog groomed and prioritised
