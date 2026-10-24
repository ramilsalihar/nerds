# Technical Specification — Student Project Marketplace Platform

**Version:** 0.1 (MVP)
**Status:** Draft for build kickoff

---

## 1. Product Summary

A three-sided marketplace connecting **students** with **clients** (companies/employers) who post real-world projects with a budget. Platform revenue funds a **donation pool** supporting free tooling, hosting, and hackathons for students. An **admin** role moderates projects and users.

---

## 2. User Roles & Permissions

| Role | Can do |
|---|---|
| **Student** | Register, build profile, browse open projects, apply/bid, submit work, receive payment, leave reviews |
| **Client** | Register (with verification), post projects, set budget, review applicants, select a student, approve/reject submissions, release payment |
| **Admin** | Approve/reject projects before publishing, verify/ban users, view all transactions, manage donation pool ledger, resolve disputes |

Use **role-based access control (RBAC)** at the API layer — every endpoint checks role + ownership, not just authentication.

---

## 3. Core Data Model

```
User
 - id, email, password_hash, role [student|client|admin]
 - name, avatar_url, bio
 - verification_status [unverified|pending|verified]
 - created_at

StudentProfile (1:1 with User)
 - skills[], portfolio_links[], rating_avg, completed_projects_count

ClientProfile (1:1 with User)
 - company_name, company_website, verification_docs_url

Project
 - id, client_id (FK)
 - title, description, technical_spec (text/file attachments)
 - budget_type [fixed_tier|custom]
 - budget_amount
 - status [pending_review|open|in_progress|submitted|completed|disputed|rejected]
 - assigned_student_id (FK, nullable)
 - created_at, deadline

Application
 - id, project_id (FK), student_id (FK)
 - proposed_price (nullable, for custom budget projects)
 - message
 - status [pending|accepted|rejected]

Submission
 - id, project_id (FK), student_id (FK)
 - files[], notes, submitted_at
 - status [pending_review|approved|changes_requested]

Transaction
 - id, project_id (FK)
 - amount_total, amount_to_student, amount_to_donation_pool
 - status [held|released|refunded]
 - stripe_payment_intent_id

DonationPoolLedger
 - id, transaction_id (FK, nullable if manual entry)
 - amount, type [inflow|outflow]
 - description (e.g. "server hosting", "hackathon grant")
 - created_at

Review
 - id, project_id (FK), reviewer_id, reviewee_id
 - rating (1–5), comment
```

---

## 4. Key Workflows

**A. Project posting & approval**
1. Client submits project → status `pending_review`
2. Admin reviews → approve (`open`) or reject (with reason)

**B. Application → assignment**
1. Students view open projects, submit `Application`
2. Client reviews applicants, accepts one → project → `in_progress`, all other applications auto-rejected

**C. Submission → payment**
1. Student submits work → `Submission` created
2. Client approves → triggers payment release: split into `amount_to_student` and `amount_to_donation_pool` → project → `completed`
3. Client requests changes → status stays `in_progress`, student resubmits

**D. Disputes**
- Either party can flag a project → status `disputed` → admin manually resolves (release, refund, or partial split)

---

## 5. Suggested Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + TypeScript, Tailwind CSS | Fast to build, easy to scale UI complexity |
| Backend | Node.js + NestJS (or Express if you want less structure early) | NestJS gives you built-in module/RBAC patterns that scale well with 3 roles |
| Database | PostgreSQL | Relational data (users/projects/transactions) fits well; strong consistency for payments |
| ORM | Prisma | Type-safe queries, easy migrations |
| Auth | JWT + refresh tokens, or Auth0/Clerk to move faster | RBAC middleware checks role on every route |
| File storage | S3 (or Cloudflare R2 — cheaper) | Project specs, submissions, portfolio files |
| Payments | Stripe Connect (Standard or Express accounts for students) | Needed for holding funds and split payouts |
| Hosting | Vercel (frontend) + Railway/Render (backend) initially | Cheap to start; migrate to AWS/GCP once donation-funded infra kicks in |
| Email | Resend or Postmark | Notifications: application accepted, payment released, etc. |

---

## 6. API Structure (REST, high-level)

```
POST   /auth/register
POST   /auth/login

GET    /projects              (filters: status, skills, budget)
POST   /projects              (client only)
GET    /projects/:id
PATCH  /projects/:id/approve  (admin only)
PATCH  /projects/:id/reject   (admin only)

POST   /projects/:id/applications        (student)
GET    /projects/:id/applications        (client, admin)
PATCH  /applications/:id/accept          (client)

POST   /projects/:id/submissions         (student)
PATCH  /submissions/:id/approve          (client) -> triggers payment
PATCH  /submissions/:id/request-changes  (client)

GET    /users/:id
PATCH  /users/:id/verify      (admin only)

GET    /donation-pool/ledger  (public, transparency page)

POST   /webhooks/stripe       (payment confirmations)
```

---

## 7. MVP Build Order (recommended)

**Phase 1 — Foundation (Weeks 1–2)**
- Auth + roles, basic profile pages
- Database schema + migrations

**Phase 2 — Core marketplace loop (Weeks 3–5)**
- Project posting + admin approval queue
- Browse/apply flow (skip real bidding — just "apply with a note" first)
- Client selects student

**Phase 3 — Submission & payment (Weeks 6–8)**
- Submission flow + approval
- Stripe Connect integration (or manual payment logging for a true MVP — ship faster, add Stripe once you have real users)

**Phase 4 — Trust layer (Weeks 9–10)**
- Reviews/ratings
- Donation pool public ledger page (important for credibility/fundraising story)

**Deferred to v2:** real bidding/auction logic, reputation-based auto-matching, dispute automation, hackathon module.

---

## 8. Non-Functional Requirements

- **Security**: escrow logic must live server-side only; never trust client-submitted price/status changes
- **Audit trail**: every payment and status change should be logged immutably (important once real money moves)
- **Scalability**: stateless backend (any instance can serve any request) so you can horizontally scale as usage grows
- **Compliance**: research whether Stripe Connect + your donation model has any tax/1099 implications for student payouts in your target country

---

## 9. Open Decisions Before You Start Coding

1. Fixed price tiers vs. open bidding for MVP — recommend starting with fixed tiers only, it's much simpler
2. Manual payment tracking vs. Stripe Connect from day one — recommend manual for true MVP speed
3. What % goes to the donation pool, and is that disclosed publicly (recommend yes, for trust)

---

## 10. Repo Layout

```
nerds/
├── frontend/     React + TS + Tailwind, Apple HIG design system (built)
├── backend/      NestJS + Prisma + PostgreSQL (scaffolded)
└── commands/     Step-by-step build docs (this file + phase runbooks)
```
