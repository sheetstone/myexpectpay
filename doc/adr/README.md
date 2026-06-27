# Architecture Decision Records

This directory records the significant architectural decisions made for MyExpertPay. Each ADR captures the context, the decision, and the trade-offs accepted at the time it was made.

## Format

Each ADR is a Markdown file with:
- **Status** — `Accepted`, `Proposed`, `Deprecated`, or `Superseded by ADR-NNN`
- **Date** — when the decision was made
- **Context** — the problem and options considered
- **Decision** — what was chosen
- **Consequences** — positive outcomes and trade-offs accepted

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](ADR-001-nextjs-app-router.md) | Next.js App Router as application framework | Accepted |
| [ADR-002](ADR-002-firestore-database.md) | Firestore as database | Accepted |
| [ADR-003](ADR-003-firebase-auth.md) | Firebase Authentication — Google OAuth + Email/Password | Accepted |
| [ADR-004](ADR-004-session-cookies.md) | Firebase session cookies for session management | Accepted |
| [ADR-005](ADR-005-firebase-app-hosting.md) | Firebase App Hosting for deployment | Accepted |
| [ADR-006](ADR-006-zod-validation.md) | Zod as unified validation library | Accepted |
| [ADR-007](ADR-007-server-side-firestore.md) | Server-side only Firestore access | Accepted |

## Adding a new ADR

Copy the template below, name the file `ADR-NNN-short-title.md`, and add a row to the index above.

```markdown
# ADR-NNN: Title

**Status:** Proposed  
**Date:** YYYY-MM-DD  
**Deciders:** sheetstone

---

## Context

## Decision

## Consequences

### Positive

### Negative / Trade-offs
```
