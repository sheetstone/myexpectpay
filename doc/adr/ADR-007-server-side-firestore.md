# ADR-007: Server-Side Only Firestore Access

**Status:** Accepted  
**Date:** 2026-06-27  
**Deciders:** sheetstone

---

## Context

Firestore can be accessed in two ways:
1. **Client SDK** — directly from the browser, with Firestore Security Rules enforcing access control
2. **Admin SDK** — from a server process, which bypasses Security Rules and has full access

In a Next.js App Router app, most data access can happen server-side (Server Components, Route Handlers). Client-side Firestore access would enable real-time listeners (live updates without polling), but adds complexity: Security Rules must be maintained, the client SDK bundle adds ~50KB to the JS payload, and the security boundary splits between rules and application code.

## Decision

Access Firestore **server-side only**, exclusively via the Firebase Admin SDK in Server Components and Route Handlers.

- `firestore.rules` is set to **deny all** — no client-side access permitted
- The Firebase client SDK (`firebase/app`) is initialised only for Firebase Auth (browser sign-in flows), never for Firestore
- `src/lib/firebase/admin.ts` exports the `adminDb` Firestore instance — imported only in server files
- All Firestore reads/writes are wrapped in `src/lib/firestore/` functions

## Consequences

### Positive
- Single security boundary — user scoping enforced entirely in application code (`users/{uid}/...`) rather than split across Security Rules + application code
- `firestore.rules = deny all` means a misconfigured rule cannot accidentally expose data
- Smaller client-side JS bundle (no Firestore client SDK)
- Simpler mental model: data flows only through Route Handlers and Server Components

### Negative / Trade-offs
- **No real-time updates** — the unread message count badge, for example, cannot update live without polling or a page refresh. All data updates require a client fetch to a Route Handler.
- If real-time features are required in the future, the architecture must be partially revisited (add Firestore client SDK + Security Rules for specific collections)
- Slightly higher latency for data-heavy pages compared to a client that can subscribe directly to Firestore
