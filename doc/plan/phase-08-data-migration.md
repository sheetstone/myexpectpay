# Phase 08 — Data Migration

**Status:** Not Started  
**Target:** Week 11  
**Roles involved:** Full-stack

> Move all existing user data from the old Firebase app into the new app's Firestore structure. Because both the old and new apps use Firebase/Firestore, this is significantly simpler than a full database migration — it is primarily a data structure transformation.

---

## Prerequisites

- Phase 07 complete (production environment live)
- Access to the old Firebase project

---

## Context

The old app stored data in Firebase (Realtime Database or Firestore). The new app uses Firestore with a subcollection-per-user structure (`users/{uid}/bankAccounts/`, etc.). The Firebase UID is shared between old and new apps if they use the same Firebase Auth project.

If the old and new apps share the **same Firebase project**: migration is a structural transform within the same Firestore instance.  
If they use **different Firebase projects**: migration requires exporting from old and importing into new.

---

## Tasks

### P08-001: Audit Old Data Structure
**Role:** Full-stack  
**Type:** [MIGRATE]  
**Estimate:** 2 hours  

**What to do:**  
Document the exact Firestore/RTDB structure of the old app. Map every collection/field to the new schema.

**Acceptance criteria:**
- [ ] Field mapping table documented: `old field → new field (collection path)`
- [ ] Identify any fields in the old app that don't exist in the new schema (drop or map)
- [ ] Confirm whether UIDs are shared (same Firebase project) or different

---

### P08-002: Migration Script
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 4 hours  

**What to build:**  
`scripts/migrate.ts` — Node.js script using Firebase Admin SDK.

Steps:
1. Read all user documents from old structure
2. Transform to new schema (subcollections under `users/{uid}/`)
3. Encrypt bank account numbers with `ACCOUNT_ENCRYPTION_KEY` before writing
4. Write to new Firestore structure
5. Log counts per collection; log any transform errors

**Acceptance criteria:**
- [ ] Script is idempotent — safe to re-run (upserts, not plain inserts)
- [ ] Account numbers encrypted before write
- [ ] Logs: total records processed, records written, errors
- [ ] Dry-run mode: `--dry-run` flag logs what would be written without writing

---

### P08-003: Migration Dry Run (Staging)
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 2 hours  

**Acceptance criteria:**
- [ ] Run `npm run migrate -- --dry-run` against staging Firestore
- [ ] Review logs — all expected record counts match old app data
- [ ] Run full migration against staging
- [ ] Log into staging app as a migrated user — data visible and correct

---

### P08-004: Production Cutover
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** 3 hours  

**Acceptance criteria:**
- [ ] Schedule maintenance window (low-traffic period)
- [ ] Run migration against production Firestore
- [ ] Verify record counts and spot-check 5–10 records per collection
- [ ] Test login with a migrated user on production
- [ ] Old app URL redirected to new app (or DNS updated)

---

### P08-005: Post-Migration Verification (2-week window)
**Role:** Full-stack  
**Type:** [NEW]  
**Estimate:** Ongoing  

**Acceptance criteria:**
- [ ] Monitor error logs for missing-data issues during first 2 weeks
- [ ] Old Firebase project set to read-only (security rules: deny writes) after cutover
- [ ] Old project retained for 30 days as backup before any deletion

---

## Phase Exit Criteria

- [ ] All user data migrated to new Firestore structure
- [ ] Migration verified on staging (record counts match)
- [ ] Production cutover complete — migrated users can log in and see their data
- [ ] Old app set to read-only
- [ ] Migration script and logs retained for audit purposes
