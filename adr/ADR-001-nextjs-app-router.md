# ADR-001: Next.js App Router as Application Framework

**Status:** Accepted  
**Date:** 2026-06-27  
**Deciders:** sheetstone

---

## Context

The project started as a separate React 18 + Vite SPA (frontend) and Node.js + Express API (backend), each in their own subdirectory. This required maintaining two separate runtimes, two package.json files, two CI jobs, two deployment targets, and an explicit HTTP boundary between them.

The team wanted to simplify to a single deployable unit and take advantage of Firebase App Hosting's native Next.js support.

## Decision

Replace the React + Express two-repo structure with **Next.js 14+ App Router** as a single monolith.

- Frontend pages become `src/app/(dashboard)/` route groups (Server Components by default)
- The Express API is replaced by **Next.js Route Handlers** (`src/app/api/`)
- Server Actions are available for form mutations where appropriate
- A single `package.json`, single dev command, single deployment

## Consequences

### Positive
- One runtime, one deploy — eliminates the frontend/backend split
- React Server Components allow data fetching at the component level without client-side loading states for initial renders
- Firebase App Hosting natively supports Next.js SSR/SSG/ISR — no custom Docker setup needed
- Shared TypeScript types, Zod schemas, and utilities across "frontend" and "backend" without a separate package
- Single CI job instead of two

### Negative / Trade-offs
- Next.js App Router has a steeper learning curve than React Router + Express (Server vs Client Component distinction)
- Existing React + Express code (Phases 01–05 work) must be rewritten — cannot be directly migrated
- Harder to split into microservices later if the project grows significantly
- SSR adds cold-start latency on Firebase App Hosting (Cloud Run) vs a pure static SPA
