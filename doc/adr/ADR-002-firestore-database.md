# ADR-002: Firestore as Database

**Status:** Accepted  
**Date:** 2026-06-27  
**Deciders:** sheetstone

---

## Context

The initial plan used PostgreSQL (Supabase or self-hosted) with Prisma ORM. This required provisioning a separate database server, managing schema migrations, and running a separate connection pool — all of which added operational complexity for a solo or small team.

The project was originally built on Firebase. The data model is entirely user-scoped (no cross-user relationships), which maps naturally to Firestore's document/collection model.

## Decision

Replace PostgreSQL + Prisma with **Cloud Firestore**, accessed server-side only via the Firebase Admin SDK.

Data lives in subcollections under each user document:

```
users/{uid}/bankAccounts/{id}
users/{uid}/cases/{id}
users/{uid}/recipients/{id}
users/{uid}/payments/{id}
users/{uid}/messages/{id}
```

All reads and writes go through `src/lib/firestore/` functions — no raw Firestore calls in route handlers.

## Consequences

### Positive
- No separate database server to provision or maintain — fully managed by Google
- Google encrypts all Firestore data at rest by default
- Subcollection-per-user structure makes user scoping natural and hard to violate accidentally
- No schema migrations — field changes are applied in code
- Firebase Emulator Suite provides a local Firestore instance for development and testing without needing a cloud project
- Simplifies Phase 08 data migration: old Firebase data → new Firestore structure (same platform)

### Negative / Trade-offs
- No relational joins — queries that would be a single SQL JOIN require multiple Firestore reads or denormalisation
- No ad-hoc aggregations (SUM, GROUP BY) — must aggregate in application code
- Cursor-based pagination only (`startAfter`) — no offset-based page numbers
- Firestore is billed per read/write operation — high-traffic queries cost more than a fixed-cost SQL DB
- Account numbers require application-level AES-256 encryption before storage (Firestore's default encryption covers the storage layer but not individual fields)
- Harder to run complex reporting queries (e.g. "all payments across all users in a date range") — acceptable for this portal which is per-user only
