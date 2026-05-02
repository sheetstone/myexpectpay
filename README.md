# MyExpertPay

Payment management portal for Expertpay account holders.

## Local Setup

### Prerequisites
- Node.js 20+
- Docker & Docker Compose

### Quick start (Docker)

```bash
# Clone the repo
git clone https://github.com/<org>/myexpertpay.git
cd myexpertpay

# Copy env template and fill in values
cp backend/.env.example backend/.env
# Edit backend/.env with your Firebase credentials, encryption key, etc.

# Run migrations then start all services
docker compose run --rm backend npx prisma migrate deploy
docker compose up --build
```

App is at `http://localhost` · API health: `http://localhost/api/health`

### Manual setup (without Docker)

```bash
# Backend
cd backend
npm install
cp .env.example .env        # fill in values
npx prisma migrate dev
npm run dev                 # http://localhost:3001

# Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env.local  # fill in VITE_ values
npm run dev                 # http://localhost:5173
```

## Project structure

```
myexpertpay/
├── frontend/          React 18 + TypeScript + Vite
├── backend/           Node.js + Express + Prisma + PostgreSQL
├── plan/              Phase plan files (read before starting work)
├── log/               Task log files (update when starting/finishing)
├── .github/workflows/ CI/CD pipelines
├── CLAUDE.md          AI coding guidance
└── REQUIREMENTS.md    Full feature requirements
```

## Developer workflow

1. Read `plan/phase-NN-*.md` for your current phase
2. Find your role's tasks — each task has a TASK-ID (e.g. `P02-004`)
3. Open `log/phase-NN-*.md` and fill in your **Started** timestamp before writing code
4. When done, fill in **Finished**, **Duration**, **Status**, and **Notes**

## Docs

- [`REQUIREMENTS.md`](./REQUIREMENTS.md) — full feature spec
- [`MIGRATION_PLAN.md`](./MIGRATION_PLAN.md) — SDLC phases overview
- [`plan/`](./plan/) — detailed task plans per phase
- [`CLAUDE.md`](./CLAUDE.md) — coding standards and tech stack
