# ADR-003: Firebase Authentication — Google OAuth + Email/Password

**Status:** Accepted  
**Date:** 2026-06-27  
**Deciders:** sheetstone

---

## Context

The project uses Firebase Authentication (already in use in the old app). The question was whether to support only Google OAuth (simpler) or keep both Google OAuth and email/password sign-in.

Google-only was considered to eliminate the register, forgot-password, and password-change flows entirely. However, some users may not have or prefer not to use a Google account for a financial portal.

## Decision

Support **both** Firebase Auth sign-in methods:
- **Google OAuth** — `signInWithPopup(GoogleAuthProvider)` in the browser
- **Email/password** — `createUserWithEmailAndPassword` and `signInWithEmailAndPassword`

Both methods produce a Firebase ID token which is exchanged for a server-side session cookie via `POST /api/auth/session`.

## Consequences

### Positive
- Covers users who prefer not to link a Google account to a financial service
- Both providers are natively supported by Firebase Auth with no additional infrastructure
- Firebase handles password hashing, email verification, and rate limiting

### Negative / Trade-offs
- Must build and maintain: Register page, Forgot Password page, and Change Password flow (Profile page)
- Two separate sign-in code paths to test and maintain
- Email/password accounts require the user to remember another password; Google OAuth delegates credential management to Google
