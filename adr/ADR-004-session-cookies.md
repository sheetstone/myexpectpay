# ADR-004: Firebase Session Cookies for Session Management

**Status:** Accepted  
**Date:** 2026-06-27  
**Deciders:** sheetstone

---

## Context

Firebase Auth issues short-lived ID tokens (1-hour expiry) that auto-refresh on the client. For a Next.js App Router app with Server Components and Route Handlers, every server-side request needs an authenticated identity. The options considered were:

1. **Pass the Firebase ID token as a Bearer header** on every request — requires client-side JS on every fetch, doesn't work in Server Components without extra plumbing
2. **Custom JWT** — re-implements what Firebase already provides
3. **Firebase session cookies** — Firebase Admin SDK creates a long-lived, HttpOnly, server-verified cookie

## Decision

Use **Firebase session cookies** via `adminAuth.createSessionCookie(idToken, { expiresIn })`.

Flow:
1. Client signs in with Firebase Auth → receives ID token
2. Client POSTs ID token to `POST /api/auth/session`
3. Server verifies ID token, creates a 5-day session cookie, sets it as `HttpOnly; Secure; SameSite=Strict`
4. `src/middleware.ts` verifies the session cookie on every protected route using `adminAuth.verifySessionCookie()`
5. On logout: `POST /api/auth/logout` clears the cookie and calls `adminAuth.revokeRefreshTokens(uid)`

## Consequences

### Positive
- `HttpOnly` prevents JavaScript from reading the cookie — XSS resistant
- `Secure` ensures the cookie is only sent over HTTPS in production
- Server Components can read the session without any client-side fetch
- Session is revocable server-side (e.g. on password change, account deletion)
- 5-day expiry balances security and UX (user doesn't get logged out every hour)
- Firebase Admin SDK handles the cryptographic verification

### Negative / Trade-offs
- Initial login requires a round-trip to `/api/auth/session` to exchange ID token for cookie
- Session refresh must be handled: if the 5-day cookie is near expiry, it must be renewed (client-side listener on `onIdTokenChanged` triggers a refresh)
- `SameSite=Strict` means the session cookie won't be sent on cross-origin redirects — acceptable for a single-domain app
