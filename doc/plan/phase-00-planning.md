# Phase 00 — Planning & Architecture

**Status:** ✅ Complete  
**Target:** Week 1  
**Roles involved:** Architect

> Produce all project scaffolding documents so every subsequent phase has a written spec to work from.

---

## Architecture Decisions (updated 2026-06-27)

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14+ App Router | Single monolith for frontend + API; Firebase App Hosting native support |
| Database | Firestore (subcollections under `users/{uid}/`) | Google-managed, no DB server, encrypted at rest |
| Auth | Firebase Auth — Google OAuth + email/password | Both sign-in methods required |
| Session | Firebase session cookies (server-side) | HttpOnly, revocable, verified in `middleware.ts` |
| Deployment | Firebase App Hosting | Native Next.js SSR; GitHub integration; secrets management |
| Validation | Zod everywhere | Single library for form schemas and Route Handler validation |
| Styling | Tailwind CSS + CSS Modules | Utility layout + scoped component styles |
| i18n | react-intl (EN, DE, ES) | Carry forward from prior work |
| Testing | Vitest + RTL + Firebase Emulator + Playwright | Unit → API/emulator → E2E |
| Account encryption | AES-256 at application layer before Firestore write | Field-level encryption for compliance |

---

## Tasks

### P00-001 through P00-005
All planning tasks ✅ complete. See `REQUIREMENTS.md`, `MIGRATION_PLAN.md`, `CLAUDE.md`, skill files, and phase plan/log structure.

---

## Phase Exit Criteria

- [x] `REQUIREMENTS.md` exists
- [x] `CLAUDE.md` reflects new Next.js + Firestore + Firebase App Hosting architecture
- [x] `plan/phase-00` through `plan/phase-09` files exist and are updated
- [x] Architecture decisions recorded above
