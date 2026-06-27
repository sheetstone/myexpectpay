# MyExpertPay — Project Requirements Document

**Version:** 2.0  
**Date:** 2026-06-27  
**Stack:** Next.js 14+ (App Router, TypeScript) + Firestore + Firebase Authentication + Firebase App Hosting

> **Architecture updated June 2026.** The original v1.0 plan (React + Express + PostgreSQL + Railway) was superseded. See `adr/` for the decisions behind this change.

---

## 1. Project Overview

MyExpertPay is a web application that allows users to manage their Expertpay accounts. Expertpay is a payroll service that enables employers to pay employees via debit cards. The portal lets users:

- View account balance and transaction history
- Transfer funds to linked bank accounts
- Manage bank accounts (add, edit, verify, remove)
- Manage child-support cases and associated recipients
- Communicate via in-app messages
- View payment activity on a calendar dashboard

The new version rebuilds the existing Firebase-only frontend as a **Next.js 14+ monolith** with server-side Firestore access via the Firebase Admin SDK, Firebase Authentication (Google OAuth + email/password), and deployment on Firebase App Hosting.

---

## 2. Tech Stack

### Full-Stack (Next.js Monolith)
| Layer | Technology |
|---|---|
| Framework | Next.js 14+ — App Router, TypeScript strict mode |
| Rendering | React Server Components (default) + Client Components (`"use client"`) |
| API | Next.js Route Handlers (`src/app/api/`) |
| Server state (client) | TanStack Query |
| Forms | React Hook Form + Zod resolver |
| Validation | Zod (shared schemas — used on both form and Route Handler) |
| UI Components | Shadcn/UI + custom CSS Modules |
| Styling | Tailwind CSS + CSS Modules (`.module.css` per component) |
| Charts | Recharts |
| i18n | react-intl (EN, DE, ES) |
| Testing | Vitest + React Testing Library + Playwright (E2E) |

### Firebase / Infrastructure
| Concern | Tool |
|---|---|
| Auth (client) | Firebase Auth SDK — Google OAuth popup + email/password |
| Auth (server) | Firebase Admin SDK — `verifySessionCookie`, `createSessionCookie` |
| Session management | Firebase session cookies — HttpOnly, 5-day expiry, server-set |
| Database | Firestore via Firebase Admin SDK (server-side only; client SDK never touches Firestore) |
| Hosting | Firebase App Hosting (native Next.js SSR via Cloud Run) |
| Secrets | Firebase App Hosting environment secrets |
| Local dev | Firebase Emulator Suite (Firestore + Auth emulators) |
| CI/CD | GitHub Actions |

---

## 3. User Roles

| Role | Description |
|---|---|
| **Authenticated User** | A logged-in Expertpay account holder with access to all features |
| **Guest** | Unauthenticated visitor — can only access login/register pages |

All routes except `/login`, `/register`, and `/forgot-password` require authentication.

---

## 4. Functional Requirements

### 4.1 Authentication

| ID | Requirement |
|---|---|
| AUTH-01 | Users can sign in with Google OAuth (Firebase Auth) |
| AUTH-02 | Users can sign in with email and password |
| AUTH-03 | Users can register with email, password, and display name |
| AUTH-04 | Users can request a password reset via email |
| AUTH-05 | Auth session persists across browser tabs and page refreshes |
| AUTH-06 | Users can sign out from any page via the header |
| AUTH-07 | Unauthenticated users are redirected to `/login` |
| AUTH-08 | Every Route Handler verifies the session cookie via Firebase Admin `verifySessionCookie` |

---

### 4.2 Dashboard (Home Page)

| ID | Requirement |
|---|---|
| DASH-01 | Display a welcome message with the user's display name |
| DASH-02 | Display an account summary (current balance, total sent, total received) |
| DASH-03 | Display a bar/line chart of payment activity over the past 30 days |
| DASH-04 | Display an activity calendar highlighting dates with payment events |
| DASH-05 | Display a recent messages section (latest 5 messages) |
| DASH-06 | Dashboard loads data in parallel; each section shows a loading spinner independently |

---

### 4.3 Bank Account Management

| ID | Requirement |
|---|---|
| BANK-01 | List all bank accounts belonging to the authenticated user |
| BANK-02 | Add a new bank account with the following fields: routing number (9 digits), account number (4–17 digits), account type (checking / saving) |
| BANK-03 | Validate routing number using ABA checksum algorithm |
| BANK-04 | Resolve and display bank name from routing number (via third-party lookup or local dataset) |
| BANK-05 | Confirm account number — user must enter it twice; values must match |
| BANK-06 | Edit an existing bank account's account type |
| BANK-07 | Delete a bank account (with confirmation prompt) |
| BANK-08 | Mark a bank account as verified / unverified |
| BANK-09 | Display a success toast/modal after each successful operation |
| BANK-10 | API returns 400 with field-level error messages for invalid input |

---

### 4.4 Case Management

| ID | Requirement |
|---|---|
| CASE-01 | List all child-support cases belonging to the user |
| CASE-02 | Add a new case with: case number, NCP (Non-Custodial Parent) name, and an array of child names |
| CASE-03 | Validate case number format (application-specific rule) |
| CASE-04 | Dynamically add / remove children names from the form |
| CASE-05 | Edit an existing case (all fields) |
| CASE-06 | Delete a case (with confirmation prompt) |
| CASE-07 | Display cases in a sortable, paginated list |

---

### 4.5 Recipients Management

| ID | Requirement |
|---|---|
| REC-01 | List all recipients belonging to the user |
| REC-02 | Add a new recipient with: first name, last name, email, and linked case (optional) |
| REC-03 | Edit an existing recipient |
| REC-04 | Delete a recipient (with confirmation prompt) |
| REC-05 | Validate email format on the form |
| REC-06 | Display recipients in a paginated list |

---

### 4.6 Payment / Transaction History

| ID | Requirement |
|---|---|
| PAY-01 | List all payments for the authenticated user in reverse chronological order |
| PAY-02 | Display per payment: date, amount, bank, case number, recipient name, status, and type |
| PAY-03 | Filter payments by date range (start date / end date) |
| PAY-04 | Filter payments by one or more statuses (multi-select): Accepted, Cancelled, Completed, Expired, In Progress, Rejected, Returned, Reversal In Progress, Reversal Completed, Reversal Rejected |
| PAY-05 | Payment types displayed: Sent, Received, Pending Sent, Pending Received |
| PAY-06 | Clear filters button resets all active filters |
| PAY-07 | Paginate payment list (default: 20 per page) |
| PAY-08 | Send Money — initiate a payment to a recipient from a verified bank account (amount, recipient, case) |
| PAY-09 | Request Money — request a payment from a recipient |
| PAY-10 | Backend validates sufficient balance before processing a payment |

---

### 4.7 Messages

| ID | Requirement |
|---|---|
| MSG-01 | List all messages for the user |
| MSG-02 | Display message sender, subject, date, and body |
| MSG-03 | Mark a message as read |
| MSG-04 | Unread message count shown in navigation badge |

---

### 4.8 Navigation & Layout

| ID | Requirement |
|---|---|
| NAV-01 | Persistent header with: app logo, user display name, language switcher, sign-out button |
| NAV-02 | Side / top navigation links: Home, Bank Accounts, Cases, Recipients, Payments |
| NAV-03 | Active route is highlighted in navigation |
| NAV-04 | Footer with copyright information |
| NAV-05 | Fully responsive layout (mobile, tablet, desktop) |

---

### 4.9 Internationalization (i18n)

| ID | Requirement |
|---|---|
| I18N-01 | Support English (en), German (de), and Spanish (es) |
| I18N-02 | Language toggle in the header persists selection in localStorage |
| I18N-03 | All UI labels, error messages, and placeholders use translation keys |
| I18N-04 | Currency amounts formatted per locale |
| I18N-05 | Dates formatted per locale |

---

## 5. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Security | All API endpoints require a valid auth token; reject with 401 otherwise |
| NFR-02 | Security | User A cannot access User B's data (row-level ownership enforced in backend) |
| NFR-03 | Security | Input validation on both client (Zod via React Hook Form resolver) and Route Handler (Zod) |
| NFR-04 | Security | No sensitive credentials committed to git; use `.env` files |
| NFR-05 | Performance | Initial page load (LCP) under 3 seconds on a standard connection |
| NFR-06 | Performance | API responses under 500 ms for list endpoints |
| NFR-07 | Reliability | API returns meaningful error responses (4xx/5xx with JSON body) |
| NFR-08 | Usability | Forms show inline validation errors on blur |
| NFR-09 | Usability | Destructive actions (delete) require a confirmation dialog |
| NFR-10 | Usability | Loading states shown for all async operations |
| NFR-11 | Accessibility | WCAG 2.1 AA compliance — keyboard-navigable, ARIA labels on interactive elements |
| NFR-12 | Testing | Backend: ≥70% line coverage with integration tests against a test database |
| NFR-13 | Testing | Frontend: unit tests for all utility functions and key components |
| NFR-14 | Maintainability | TypeScript strict mode enabled on both frontend and backend |
| NFR-15 | Maintainability | ESLint + Prettier enforced via pre-commit hooks |

---

## 6. Data Models

All user data lives in Firestore subcollections under `users/{uid}/`. User scoping is implicit — every read and write must use the `users/{uid}/` prefix with the verified session UID.

### users/{uid}/bankAccounts/{bankId}
```
bankName          string
nickname          string
routingNumber     string (encrypted AES-256-GCM)
accountNumber     string (encrypted AES-256-GCM)
accountNumberLast4 string
accountType       "checking" | "saving"
verified          boolean
isPrimary         boolean
receivePayments   boolean
sendPayments      boolean
createdAt         Timestamp
updatedAt         Timestamp
```

### users/{uid}/cases/{caseId}
```
caseNumber   string
ncpName      string
children     string[]
createdAt    Timestamp
updatedAt    Timestamp
```

### users/{uid}/recipients/{recipientId}
```
firstName    string
lastName     string
email        string
caseId       string | null
createdAt    Timestamp
updatedAt    Timestamp
```

### users/{uid}/payments/{paymentId}
```
amount        number
bankId        string
caseNumber    string
recipientId   string | null
recipientName string
paymentDate   Timestamp
status        "accepted" | "cancelled" | "completed" | "expired" | "in_progress" | "rejected" | "returned" | "reversal_in_progress" | "reversal_completed" | "reversal_rejected"
type          "sent" | "received" | "pending_sent" | "pending_received"
note          string | null
createdAt     Timestamp
```

### users/{uid}/messages/{messageId}
```
sender     string
subject    string
body       string
isRead     boolean
createdAt  Timestamp
```

---

## 7. API Endpoints (Next.js Route Handlers)

All Route Handlers live under `src/app/api/`. Every handler reads the session cookie and rejects with 401 if missing or invalid.

### Authentication
```
POST   /api/auth/session         -- Receive Firebase ID token → create session cookie (5-day)
POST   /api/auth/logout          -- Clear session cookie + revoke Firebase refresh tokens
```

### Bank Accounts
```
GET    /api/banks                 -- List user's bank accounts
POST   /api/banks                 -- Add new bank account
GET    /api/banks/[id]            -- Get single bank account
PATCH  /api/banks/[id]            -- Update bank account
DELETE /api/banks/[id]            -- Delete bank account
```

### Cases
```
GET    /api/cases                 -- List user's cases
POST   /api/cases                 -- Create case
PATCH  /api/cases/[id]            -- Update case
DELETE /api/cases/[id]            -- Delete case
```

### Recipients
```
GET    /api/recipients            -- List user's recipients
POST   /api/recipients            -- Create recipient
PATCH  /api/recipients/[id]       -- Update recipient
DELETE /api/recipients/[id]       -- Delete recipient
```

### Payments
```
GET    /api/payments              -- List payments (?startDate, ?endDate, ?status[], ?cursor, ?limit)
POST   /api/payments/send         -- Initiate a payment (Send Money)
POST   /api/payments/request      -- Request a payment (Request Money)
```

### Messages
```
GET    /api/messages              -- List user's messages
PATCH  /api/messages/[id]/read    -- Mark message as read
```

### Dashboard
```
GET    /api/dashboard             -- Account summary + payment activity (combined)
```

### Users
```
DELETE /api/users/me              -- Delete account (revokes session + deletes Firestore data)
```

---

## 8. Project Structure

```
myexpectpay/
├── src/
│   ├── app/
│   │   ├── (auth)/                  # Unauthenticated layout group
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (dashboard)/             # Authenticated layout group (auth guard)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx             # Dashboard
│   │   │   ├── bank-accounts/
│   │   │   ├── cases/
│   │   │   ├── recipients/
│   │   │   ├── payments/
│   │   │   ├── messages/
│   │   │   ├── profile/
│   │   │   └── settings/
│   │   └── api/                     # Route Handlers
│   │       ├── auth/session/route.ts
│   │       ├── auth/logout/route.ts
│   │       ├── banks/route.ts
│   │       ├── banks/[id]/route.ts
│   │       ├── cases/route.ts
│   │       ├── cases/[id]/route.ts
│   │       ├── recipients/route.ts
│   │       ├── recipients/[id]/route.ts
│   │       ├── payments/route.ts
│   │       ├── payments/send/route.ts
│   │       ├── payments/request/route.ts
│   │       ├── messages/route.ts
│   │       ├── messages/[id]/read/route.ts
│   │       ├── dashboard/route.ts
│   │       └── users/me/route.ts
│   ├── components/
│   │   ├── layout/              # AppShell, Header, Nav, Footer
│   │   └── ui/                  # Modal, Spinner, Pagination, Toast, EmptyState
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── admin.ts         # Firebase Admin SDK singleton (server-only)
│   │   │   └── client.ts        # Firebase client SDK (auth only, "use client")
│   │   ├── firestore/           # Data access layer (one file per collection)
│   │   │   ├── banks.ts
│   │   │   ├── cases.ts
│   │   │   ├── recipients.ts
│   │   │   ├── payments.ts
│   │   │   └── messages.ts
│   │   ├── schemas/             # Shared Zod schemas (forms + Route Handlers)
│   │   └── session.ts           # getSession() — reads cookie, returns uid
│   ├── middleware.ts            # Route protection (verify session cookie)
│   ├── hooks/                   # Client-side hooks only
│   ├── translations/            # en.json, de.json, es.json
│   ├── types/                   # Shared TypeScript interfaces
│   ├── constants.ts             # PAGE_SIZE, ABA regex, limits
│   └── utils/                   # formatMoney, validateRouting, formatDate
├── adr/                         # Architecture Decision Records
├── doc/                         # Project documentation
├── .github/workflows/ci.yml     # Lint → type-check → test → build
├── firebase.json
├── apphosting.yaml              # Firebase App Hosting config
├── firestore.rules              # deny all (Admin SDK bypasses rules)
└── firestore.indexes.json
```

---

## 9. Out of Scope (v1.0)

The following features are explicitly **not** in scope for the initial release:

- Native mobile app (iOS / Android)
- Advanced reporting or PDF export
- Real-time notifications (WebSocket / push)
- Admin portal / back-office tooling
- Two-factor authentication (2FA)
- Dark mode
- Automated payment scheduling

---

## 10. Open Questions

| # | Question | Decision |
|---|---|---|
| 1 | Auth strategy | ✅ Firebase Auth — Google OAuth + email/password (see ADR-003) |
| 2 | Database | ✅ Firestore — no separate DB server (see ADR-002) |
| 3 | Routing number lookup | Local ABA JSON dataset — no API key needed |
| 4 | Account number storage | ✅ Full number stored AES-256-GCM encrypted; last 4 only in API responses |
| 5 | Balance source | Record-only for v1 — balance derived from payments in Firestore |
| 6 | Send / Request Money | Record-only operation for v1 — no ACH or payment processor |
| 7 | Multi-language priority | Full EN required for v1; DE/ES best-effort |
