# Home Service QA Demo

A realistic, deterministic System Under Test (SUT) for learning manual testing,
UI/API automation, SQL validation, load testing, and CI/CD.

The application models a small home-service operation with Admin and Technician
roles. It is intentionally built as a portfolio-sized system rather than a
production SaaS product.

## What is included

- React + TypeScript + Vite web application
- Express JSON API with mock bearer authentication and role authorization
- PostgreSQL schema, constraints, migrations, deterministic seed data, and reset
- Customer, job booking, dispatch, technician, inventory, invoice, and payment
  workflows
- Transactional job completion: status update, stock deduction, and invoice
  creation commit or roll back together
- Stable `data-testid` attributes on important controls and results
- Developer tests for critical business rules and the completion transaction
- Detailed requirements, API contracts, test-design inputs, and QA handoff in
  [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)

Playwright, QA API tests, SQL test scripts, load-test scripts, and CI/CD
workflows are deliberately not included. They are intended to be created by the
QA learner.

## Prerequisites

- Docker Desktop
- Node.js 20 or later
- npm

Confirm that Docker Desktop is running before starting PostgreSQL.

## Local setup

From the repository root:

```bash
cp .env.example .env
npm install
docker compose up -d db
npm run db:migrate
npm run db:reset
npm run dev
```

Open:

- Web application: <http://localhost:5173>
- API health check: <http://localhost:4000/api/health>
- PostgreSQL: `localhost:5432`

The `npm run dev` command starts the web application and API together. Stop both
with `Ctrl+C`. Stop PostgreSQL when you are finished:

```bash
docker compose down
```

`docker compose down` keeps the database volume. Use `npm run db:reset` whenever
you want the documented seed state again.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@demo.com` | `password123` |
| Technician | `tech@demo.com` | `password123` |

These credentials and tokens are intentionally fictional and insecure. They are
for local QA practice only.

## Useful commands

```bash
npm run dev          # start API and web
npm run dev:web      # start web only
npm run dev:api      # start API only
npm run db:migrate   # apply pending migrations
npm run db:seed      # insert the seed data
npm run db:reset     # restore deterministic seed data
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm run test:dev     # developer-level business-rule tests
npm run build        # production web build
```

The test reset endpoint is `POST /api/test/reset`. It is enabled only when
`NODE_ENV` is `development` or `test`. Do not call reset while a load test is
running.

## Core workflow

```text
Admin login
-> create or select a customer
-> create a Pending job
-> assign a technician
-> Technician login
-> start the assigned job
-> record used parts
-> complete the job
-> inventory is deducted and an Unpaid invoice is created
-> Admin login
-> verify the invoice
-> mark it Paid
-> verify the receipt and dashboard
```

Useful negative paths include invalid login, role denial, technician scheduling
conflicts, invalid status transitions, insufficient stock, stock-out below zero,
duplicate completion, and duplicate payment.

## Database access

The default local connection values are:

```text
Host: localhost
Port: 5432
Database: home_service_qa
Username: home_service
Password: home_service
```

You can connect with a database client or `psql` and design your own SQL checks
against tables such as `users`, `customers`, `technicians`, `jobs`,
`inventory_items`, `job_used_parts`, and `invoices`.

## Architecture

```text
Browser
  -> React + TypeScript web application (port 5173)
  -> Express JSON API (port 4000)
  -> PostgreSQL (port 5432)
```

Business rules are enforced by the API and protected by database constraints
where appropriate. Dates use the `Asia/Bangkok` business context and money is
shown in THB.

## Verification before QA work

Run this gate after setup or after changing the SUT:

```bash
npm run db:reset
npm run lint
npm run typecheck
npm run test:dev
npm run build
```

All commands should exit successfully before treating the environment as a
stable test baseline.

## Known limitations

- Authentication and payment are mocks, not production integrations.
- No file upload, PDF generation, email, SMS, GPS, offline mode, or native mobile
  application is included.
- The system does not claim production security, capacity, high availability,
  disaster recovery, or multi-tenant isolation.
- Load testing is supported as an educational local exercise; local results do
  not represent production capacity.
- No hosted environment or deployment workflow is provided in the initial
  portfolio core.

## Portfolio disclosure

> I used an AI-assisted Home Service QA Demo as the System Under Test for my QA
> portfolio. I personally reviewed the requirements, designed the QA strategy and
> test cases, implemented and debugged the automation, validated API and database
> behavior, analyzed results, and built the CI/CD workflow.

> ผมใช้ Home Service QA Demo ที่พัฒนาร่วมกับ AI เป็น System Under Test สำหรับ
> QA Portfolio โดยผมเป็นผู้ review requirement, ออกแบบ QA strategy และ test case,
> เขียนและแก้ไข automation, ตรวจสอบ API/SQL, วิเคราะห์ผล และสร้าง CI/CD ด้วยตัวเอง

The disclosure describes the intended completed portfolio. At this initial SUT
stage, the QA automation, SQL checks, load tests, and CI/CD remain learner-owned
work.
