# ADR-006: Zod as Unified Validation Library

**Status:** Accepted  
**Date:** 2026-06-27  
**Deciders:** sheetstone

---

## Context

The original plan used two validation libraries:
- **Yup** on the frontend (React Hook Form resolver)
- **Zod** on the backend (Express route validation)

This meant writing the same validation rules twice in different syntaxes, and maintaining two separate dependency trees. With the move to Next.js, the "frontend" and "backend" live in the same codebase.

## Decision

Use **Zod** everywhere — both for React Hook Form resolvers (via `@hookform/resolvers/zod`) and for Route Handler request validation.

Schema files live in `src/lib/schemas/` and are imported by both the form component (client-side) and the Route Handler (server-side):

```
src/lib/schemas/bankSchema.ts  ←  imported by BankAccountForm.tsx (client)
                                   AND by /api/banks/route.ts (server)
```

## Consequences

### Positive
- Single schema definition — validation rules cannot drift between client and server
- One dependency, one API to learn
- Zod's TypeScript inference generates the form field types automatically (`z.infer<typeof schema>`)
- Custom refinements (ABA routing checksum, case number format) written once, used in both contexts
- `@hookform/resolvers/zod` is the most popular React Hook Form resolver

### Negative / Trade-offs
- Schema files imported by Client Components must not contain Node.js-only imports — requires care when schemas reference server utilities
- Migrating existing Yup schemas from the old frontend requires rewriting them in Zod syntax (one-time cost)
