# Getting Started

Repo layout:

```
nerds/
├── frontend/   React + TS + Tailwind, Apple HIG design system
├── backend/    NestJS + Prisma + PostgreSQL
└── commands/   This runbook + commands/spec.md
```

## 1. Prerequisites

- Node 22+
- A local PostgreSQL instance (or `npx prisma dev` inside `backend/` to run one in your terminal)

## 2. Backend setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` and point `DATABASE_URL` at your Postgres instance. Then:

```bash
npx prisma migrate dev --name init
npm run start:dev
```

This applies the schema in [backend/prisma/schema.prisma](../backend/prisma/schema.prisma) (the section 3 data model from `spec.md`) and starts the API on `http://localhost:3000`.

Smoke test:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"client@example.com","password":"password123","name":"Acme Co","role":"client"}'
```

## 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Opens the design system showcase on `http://localhost:5173`. Components live in `frontend/src/components` — this is the shared UI kit the marketplace screens get built from.

## 4. What's already scaffolded (Phase 1, partial)

- Auth: `POST /auth/register`, `POST /auth/login` (JWT, bcrypt-hashed passwords)
- RBAC: `@Roles()` decorator + `RolesGuard`, checked per-endpoint against `student|client|admin`
- Full Prisma schema for all entities in spec §3
- Projects: create, browse open, admin approve/reject (§4A)
- Applications: apply, list, client accept → auto-rejects rest, project → `in_progress` (§4B)
- Submissions: submit, client approve (splits payment into a `Transaction` + donation pool `DonationPoolLedger` entry, project → `completed`), request changes (§4C)
- Donation pool: public `GET /donation-pool/ledger`
- User verification: `PATCH /users/:id/verify` (admin only)

## 5. Still open (see spec.md §9)

- `DONATION_POOL_PERCENT` defaults to 10% in `backend/.env` — unresolved product decision, change it there
- No Stripe integration yet — `Transaction.status` is set straight to `released` on submission approval (manual/logged payment, per the Phase 3 "ship faster" recommendation)
- No frontend screens wired to the API yet — `frontend/` is only the component library so far
- StudentProfile / ClientProfile creation isn't exposed via an endpoint yet — profiles exist in the schema but need a route once you decide the onboarding flow
- Disputes (§4D) have no service/controller yet — admin resolution is manual via direct DB access for now
