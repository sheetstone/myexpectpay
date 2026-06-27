# ADR-005: Firebase App Hosting for Deployment

**Status:** Accepted  
**Date:** 2026-06-27  
**Deciders:** sheetstone

---

## Context

The original deployment target was Railway (managed PostgreSQL + Docker containers for frontend and backend). With the shift to Next.js + Firestore, Railway's main value proposition (managed Postgres) is no longer needed. The project is already in the Firebase ecosystem (Auth, Firestore).

Alternatives considered:
- **Vercel** — excellent Next.js support, but adds a second cloud vendor alongside Firebase
- **Railway** — original choice, good Docker support, but requires writing and maintaining Dockerfiles
- **Firebase App Hosting** — launched 2024, built specifically for web frameworks including Next.js; keeps everything in one Firebase project

## Decision

Deploy using **Firebase App Hosting**.

Configuration lives in `apphosting.yaml` at the repo root. GitHub integration triggers automatic deploys on push to `main`. Secrets (Firebase service account credentials, encryption keys) are managed via Firebase App Hosting secrets — never in `.env` files.

## Consequences

### Positive
- Native Next.js support — SSR, SSG, ISR, Server Actions, and Route Handlers all work without custom configuration
- Everything in one Firebase project: Auth + Firestore + Hosting — single console, single billing account
- GitHub integration is built-in — no separate GitHub Actions deploy step needed for App Hosting
- Secrets management via Firebase App Hosting secrets — no `.env` files in the repo
- Automatic HTTPS with Firebase-managed certificates
- Cloud Run powers the server-side rendering — scales to zero when idle

### Negative / Trade-offs
- Firebase App Hosting is newer than Vercel/Railway — less community documentation and fewer escape hatches
- Cold starts on Cloud Run can add latency on the first request after a period of inactivity (mitigated with `minInstances: 1` in `apphosting.yaml` for production)
- Vendor lock-in within the Google / Firebase ecosystem
- Custom domain setup requires DNS configuration in Firebase Console (minor, one-time effort)
