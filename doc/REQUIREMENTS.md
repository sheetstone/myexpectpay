# MyExpertPay — Project Requirements Document

**Version:** 1.0  
**Date:** 2026-05-01  
**Stack:** React (TypeScript) + Node.js (Express) + PostgreSQL / Firebase Auth

---

## 1. Project Overview

MyExpertPay is a web application that allows users to manage their Expertpay accounts. Expertpay is a payroll service that enables employers to pay employees via debit cards. The portal lets users:

- View account balance and transaction history
- Transfer funds to linked bank accounts
- Manage bank accounts (add, edit, verify, remove)
- Manage child-support cases and associated recipients
- Communicate via in-app messages
- View payment activity on a calendar dashboard

The new version rebuilds the existing Firebase-only frontend as a full-stack application with a dedicated **Node.js/Express backend API** and a modern **React + TypeScript** frontend, replacing Firebase Realtime Database with a proper relational database.

---

## 2. Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18+ with TypeScript |
| Routing | React Router v6 |
| State Management | React Query (server state) + Zustand or Context (UI state) |
| Forms | React Hook Form + Yup |
| UI Components | React Bootstrap or Shadcn/UI |
| Styling | Tailwind CSS + SCSS modules |
| Charts | Recharts or React Google Charts |
| Calendar | React Calendar |
| i18n | react-intl (EN, DE, ES) |
| Auth (client) | Firebase Auth SDK (Google OAuth) or JWT-based |
| HTTP Client | Axios |
| Testing | Vitest + React Testing Library |

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | Express.js (TypeScript) |
| Database | PostgreSQL (via Prisma ORM) |
| Auth | Firebase Admin SDK (verify Google ID tokens) or JWT |
| Validation | Zod |
| API Style | REST |
| Testing | Jest + Supertest |
| Environment | dotenv |

### Infrastructure
| Concern | Tool |
|---|---|
| Hosting (frontend) | Firebase Hosting or Vercel |
| Hosting (backend) | Cloud Run, Railway, or Render |
| Database | Supabase (managed Postgres) or self-hosted |
| Auth | Firebase Authentication |
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
| AUTH-08 | The backend verifies every request using a Bearer token (Firebase ID token or JWT) |

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
| NFR-03 | Security | Input validation on both client (Yup) and server (Zod) |
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

### User
```
id           UUID (PK)
email        string (unique)
displayName  string
firebaseUid  string (unique)  -- links to Firebase Auth
createdAt    timestamp
```

### BankAccount
```
id           UUID (PK)
userId       UUID (FK → User)
bankName     string
routingNumber string
accountNumber string (last 4 digits stored for display; full number encrypted)
accountType  enum: checking | saving
verified     boolean (default false)
createdAt    timestamp
updatedAt    timestamp
```

### Case
```
id           UUID (PK)
userId       UUID (FK → User)
caseNumber   string
ncpName      string
children     string[]   (stored as JSON array)
createdAt    timestamp
updatedAt    timestamp
```

### Recipient
```
id           UUID (PK)
userId       UUID (FK → User)
firstName    string
lastName     string
email        string
caseId       UUID (FK → Case, nullable)
createdAt    timestamp
updatedAt    timestamp
```

### Payment
```
id           UUID (PK)
userId       UUID (FK → User)
amount       decimal(10,2)
bankId       UUID (FK → BankAccount)
caseNumber   string
recipientId  UUID (FK → Recipient, nullable)
recipientName string
paymentDate  timestamp
status       enum: accepted | cancelled | completed | expired | in_progress | rejected | returned | reversal_in_progress | reversal_completed | reversal_rejected
type         enum: sent | received | pending_sent | pending_received
createdAt    timestamp
```

### Message
```
id           UUID (PK)
userId       UUID (FK → User)
sender       string
subject      string
body         text
isRead       boolean (default false)
createdAt    timestamp
```

---

## 7. API Endpoints (Backend)

### Authentication
```
POST   /api/auth/verify          -- Verify Firebase token, return user profile
POST   /api/auth/register        -- Register new user (email/password flow)
```

### Bank Accounts
```
GET    /api/banks                 -- List user's bank accounts
POST   /api/banks                 -- Add new bank account
PATCH  /api/banks/:id             -- Update bank account
DELETE /api/banks/:id             -- Delete bank account
PATCH  /api/banks/:id/verify      -- Toggle verified status
GET    /api/banks/lookup/:routing  -- Resolve bank name from routing number
```

### Cases
```
GET    /api/cases                 -- List user's cases
POST   /api/cases                 -- Create case
PATCH  /api/cases/:id             -- Update case
DELETE /api/cases/:id             -- Delete case
```

### Recipients
```
GET    /api/recipients            -- List user's recipients
POST   /api/recipients            -- Create recipient
PATCH  /api/recipients/:id        -- Update recipient
DELETE /api/recipients/:id        -- Delete recipient
```

### Payments
```
GET    /api/payments              -- List payments (supports ?startDate, ?endDate, ?status[], ?page, ?limit)
POST   /api/payments/send         -- Initiate a payment (Send Money)
POST   /api/payments/request      -- Request a payment (Request Money)
```

### Messages
```
GET    /api/messages              -- List user's messages
PATCH  /api/messages/:id/read     -- Mark message as read
```

### Dashboard
```
GET    /api/dashboard/summary     -- Account summary (balance, totals)
GET    /api/dashboard/activity    -- Payment activity for charting (past 30 days)
```

---

## 8. Project Structure

```
myexpertpay/
├── frontend/                   # React app
│   ├── src/
│   │   ├── api/                # Axios client + endpoint functions
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Layout/         # Header, Footer, Nav
│   │   │   ├── UI/             # DatePicker, Modal, Spinner, Pagination, etc.
│   │   │   └── Form/           # Form field wrappers
│   │   ├── pages/              # Route-level page components
│   │   │   ├── Home/
│   │   │   ├── Login/
│   │   │   ├── BankAccount/
│   │   │   ├── Cases/
│   │   │   ├── Recipients/
│   │   │   └── Payments/
│   │   ├── hooks/              # Custom React hooks
│   │   ├── store/              # Zustand stores (auth, UI state)
│   │   ├── translations/       # en.json, de.json, es.json
│   │   ├── utils/              # formatMoney, validateRouting, etc.
│   │   ├── types/              # Shared TypeScript interfaces
│   │   └── App.tsx
│   ├── public/
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                    # Node.js/Express app
│   ├── src/
│   │   ├── routes/             # Express routers per resource
│   │   ├── controllers/        # Request handlers
│   │   ├── services/           # Business logic
│   │   ├── middleware/         # Auth, error handling, logging
│   │   ├── prisma/             # Prisma schema + migrations
│   │   ├── validators/         # Zod schemas
│   │   ├── types/              # Shared TypeScript types
│   │   └── app.ts              # Express app setup
│   ├── tests/
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci.yml              # Lint, test, build on PR
│
└── README.md
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

1. **Auth strategy:** Keep Firebase Auth (Google OAuth + email/password) or switch to a fully custom JWT flow in the Node.js backend? Firebase Auth is recommended to keep auth complexity low.
2. **Database hosting:** Supabase (managed Postgres, generous free tier) or self-hosted Postgres on the same cloud provider as the backend?
3. **Routing number lookup:** Use a local JSON dataset of ABA routing numbers or a paid third-party API for real-time lookup?
4. **Account number storage:** Should the full account number be stored (encrypted) or only the last 4 digits for display?
5. **Balance source:** Is account balance fetched from the Expertpay core system via an external API, or is it managed internally in the database?
6. **Send / Request Money:** Does this integrate with a payment processor (e.g., Stripe, Plaid, ACH) or is it a record-only operation?
7. **Multi-language priority:** Is full DE/ES translation coverage required for v1.0 or just EN?
