# Home Service QA Demo - Implementation Plan

## 1. Project Overview

### Project Name

Home Service QA Demo

### Project Type

QA Automation Portfolio Project / System Under Test

### Project Description

Home Service QA Demo is a fictional home-service management web application designed specifically for QA automation practice and portfolio presentation.

The system simulates a small field-service business workflow, including:

- Authentication and role-based access
- Customer management
- Job booking
- Technician assignment
- Job status transition
- Inventory usage
- Invoice calculation
- Payment status mock
- A deterministic PostgreSQL-backed System Under Test
- Interfaces that support later UI, API, SQL, load, and CI/CD practice

This project is **not** intended to be a production SaaS system. It is intentionally scoped to demonstrate QA skills such as requirement analysis, test design, UI automation, API testing, state transition testing, decision table testing, boundary value analysis, defect reporting, and CI integration.

---

## Approved Portfolio Core Baseline

Approved on 2026-07-29. This section defines the initial delivery boundary and
takes precedence if a later learning-backlog section describes work that the QA
owner has not implemented yet.

### Delivery Objective

Deliver a realistic, deterministic System Under Test (SUT) that a QA learner can
use for manual testing, API testing, SQL validation, UI/API automation, load-test
practice, and CI/CD practice.

The initial application delivery must include the working SUT and developer-level
tests for critical domain rules. It must not include the learner's QA automation
framework, QA test implementations, load-test scripts, or CI/CD workflow.

### Actors

| Actor | Responsibility |
|---|---|
| Admin | Manages customers and jobs, dispatches technicians, adjusts inventory, reviews and pays invoices |
| Technician | Views only assigned jobs, starts work, records used parts, and completes jobs |
| QA learner | Designs test scenarios and test cases, performs UI/API/SQL testing, builds automation, load tests, and CI/CD |

### System Context

```text
Browser
  -> React + TypeScript web application
  -> Express JSON API
  -> PostgreSQL database
```

Business rules must be enforced by the API. The frontend may repeat basic
validation for usability, but bypassing the UI must not bypass a business rule.

### Initial Delivery Scope

The initial SUT includes:

- English-language, desktop-first responsive web UI
- Admin and Technician demo authentication
- Mock bearer-token authorization with `401` and `403` behavior
- Customer create, read, update, list, and search
- Job create, read, list, search, and status filtering
- Technician assignment and schedule-conflict prevention
- Job status lifecycle and terminal-state protection
- Technician used-parts workflow
- Inventory adjustment, insufficient-stock protection, and low-stock indication
- Transactional job completion, stock deduction, and invoice creation
- Invoice calculation, payment mock, and receipt number
- Admin dashboard summary
- PostgreSQL schema, migrations, constraints, seed data, and reset support
- Stable `data-testid` attributes on important UI elements
- Health endpoint and environment-based configuration
- Developer tests for critical pure domain rules and completion transaction
- README with local setup and demo accounts

The initial SUT deliberately excludes:

- Playwright installation or configuration
- QA UI/API test code
- QA Page Objects, fixtures, helpers, and assertions
- Postman/Bruno collections
- SQL test scripts
- k6, JMeter, or Artillery scripts
- GitHub Actions or another CI/CD workflow
- Hosting-provider configuration

These excluded items are learning deliverables owned by the QA learner.

### Functional Requirement Catalogue

| ID | Requirement | Priority |
|---|---|---|
| FR-AUTH-001 | Valid Admin credentials authenticate the user and lead to `/admin/dashboard` | Must |
| FR-AUTH-002 | Valid Technician credentials authenticate the user and lead to `/tech/jobs` | Must |
| FR-AUTH-003 | Invalid or incomplete credentials are rejected without creating a session | Must |
| FR-AUTH-004 | Protected pages and APIs reject unauthenticated access | Must |
| FR-AUTH-005 | Technician users cannot access Admin pages or Admin-only APIs | Must |
| FR-AUTH-006 | Logout clears the local session and returns the user to `/login` | Must |
| FR-CUS-001 | Admin can list and search customers by name or phone | Must |
| FR-CUS-002 | Admin can view a customer and create or update valid customer data | Must |
| FR-CUS-003 | Customer input is rejected when a required field, length, phone, BTU, or AC type rule fails | Must |
| FR-JOB-001 | Admin can create a Pending job without a technician | Must |
| FR-JOB-002 | Admin can create an Assigned job with an available technician | Must |
| FR-JOB-003 | Job creation rejects a past date, invalid unit count, unknown relation, or schedule conflict | Must |
| FR-JOB-004 | Admin can list, filter, search, and view jobs | Must |
| FR-DISP-001 | Admin can assign a Pending job and reassign an Assigned job | Must |
| FR-DISP-002 | A technician cannot hold two Assigned or In Progress jobs in the same date and time slot | Must |
| FR-DISP-003 | In Progress, Completed, and Cancelled jobs cannot be reassigned | Must |
| FR-STAT-001 | Only the transitions in the state-transition matrix are accepted | Must |
| FR-STAT-002 | Completed and Cancelled are terminal states | Must |
| FR-TECH-001 | Technician sees and opens only jobs assigned to that technician | Must |
| FR-TECH-002 | Technician can start an Assigned job and complete only an In Progress job | Must |
| FR-TECH-003 | Technician can record used parts before completion | Must |
| FR-INV-001 | Admin can view inventory and adjust stock in or out by a positive quantity | Must |
| FR-INV-002 | Inventory stock must never become negative | Must |
| FR-INV-003 | An item is low stock when `stock <= safetyStock` | Must |
| FR-INV-004 | Completing a job deducts its used parts exactly once | Must |
| FR-BILL-001 | Completing a job creates one Unpaid invoice | Must |
| FR-BILL-002 | Invoice service fee, surcharge, parts cost, subtotal, VAT, and total follow the pricing rules | Must |
| FR-BILL-003 | Admin can mark an Unpaid invoice Paid exactly once | Must |
| FR-BILL-004 | Paying an invoice creates a receipt number and paid timestamp | Must |
| FR-DASH-001 | Admin dashboard summaries reflect current database state | Should |
| FR-DATA-001 | Reset restores deterministic seed data in development/test only | Must |

Detailed field rules, API contracts, page requirements, state transitions, and
decision tables appear in the later sections of this same document.

### Non-Functional and Testability Requirements

| ID | Requirement |
|---|---|
| NFR-001 | UI labels, validation text, and API errors use English |
| NFR-002 | Application date behavior uses `Asia/Bangkok`; currency is THB |
| NFR-003 | Seed job dates are relative to the reset date and do not expire |
| NFR-004 | Important controls and results expose stable, unique `data-testid` values |
| NFR-005 | API errors use a consistent JSON format with a message and machine-readable code |
| NFR-006 | All mutable API input is validated server-side |
| NFR-007 | Complete Job executes status change, stock deduction, and invoice creation in one database transaction |
| NFR-008 | Database foreign keys, uniqueness, checks, and indexes protect core integrity rules |
| NFR-009 | Server configuration uses environment variables and provides a health endpoint |
| NFR-010 | Lint, type-check, developer tests, and production build have deterministic npm commands |
| NFR-011 | The UI targets current desktop browsers and remains usable at tablet widths |
| NFR-012 | Logs must not expose passwords, bearer tokens, or database credentials |

### Standard API Response Rules

Successful responses use:

```json
{
  "data": {},
  "message": "Optional success message"
}
```

Failed responses use:

```json
{
  "message": "Invalid job status transition",
  "code": "INVALID_STATUS_TRANSITION",
  "fieldErrors": {
    "nextStatus": "Invalid job status transition"
  }
}
```

`fieldErrors` is optional and is returned only when an error maps to one or more
input fields.

### Transactional Completion Contract

Completing an In Progress job must:

1. Lock and re-read the job and referenced inventory rows.
2. Confirm the status transition is still allowed.
3. Confirm every used-part quantity is available.
4. Deduct inventory exactly once.
5. Set the job status to Completed.
6. Calculate and create one Unpaid invoice.
7. Commit all changes together.

Any failure must roll back every change and return an error response.

### Seed and Reset Contract

Seed data must provide:

- Both demo users
- Both technicians
- Multiple customers
- Jobs covering Pending, Assigned, In Progress, Completed, and Cancelled
- Non-conflicting and conflict-ready appointment slots
- Inventory above, equal to, and below safety-stock thresholds
- At least one Unpaid and one Paid invoice

`POST /api/test/reset` must be disabled outside development/test environments.
Reset must run in a transaction and return the database to the documented seed
state. QA automation must not call reset while a load test is running.

### Testable Areas

The SUT supports manual and automated testing of:

- UI workflows and validation
- API contract, status-code, authorization, and negative testing
- SQL queries, joins, aggregates, constraints, and data-consistency checks
- State-transition and decision-table coverage
- Boundary values for customer, job, stock, and invoice rules
- Cross-layer flows such as Complete Job -> stock deduction -> invoice -> dashboard
- Educational load tests of Express/API/PostgreSQL behavior
- A future CI pipeline that starts PostgreSQL, API, and web processes

### Known Limitations and Non-Testable Claims

The project does not support credible claims about:

- Production authentication or penetration-test readiness
- Production capacity, scalability, high availability, or disaster recovery
- Real payment settlement
- Multi-tenant isolation
- Real-time technician tracking
- File upload, PDF, email, SMS, push notification, offline, or mobile-app behavior
- Multi-region, multi-branch, or distributed transaction behavior

Load-test results are educational and environment-specific. They must not be
presented as production capacity results.

### Portfolio Core Delivery Record

Implementation completed and verified locally on 2026-07-30 on branch
`feature/portfolio-core`.

Delivered behavior was checked against the Must requirements through API
walkthroughs, browser walkthroughs, PostgreSQL-backed developer tests, schema
constraints, and production build verification. The final deterministic seed
dashboard baseline is:

```text
Jobs today: 0
Pending jobs: 1
Assigned jobs: 1
Completed jobs: 2
Unpaid invoices: 1
Low-stock items: 2
```

The `Jobs today` value is intentionally `0`: conflict-ready Pending, Assigned,
and In Progress jobs are scheduled for tomorrow so they remain valid immediately
after reset.

Final verification evidence:

```text
npm run db:reset    -> passed
npm run lint        -> passed with no errors or warnings
npm run typecheck   -> passed
npm run test:dev    -> 7 files, 50 tests passed
npm run build       -> passed
```

The browser walkthrough verified Admin and Technician authentication, protected
routes, owned-job access, dispatch success and conflict behavior, start job,
used parts, transactional completion, stock deduction, invoice calculation,
payment, receipt generation, and a 390 px viewport without page-level horizontal
overflow. The database was reset again after the state-changing walkthrough.

The developer suite includes concurrency regressions for used-parts replacement
versus completion and start versus cancellation, plus receipt-sequence reset
determinism. Shared-database test files run serially to keep reset isolation.

Remaining learner-owned work is unchanged: QA test documents, Playwright/API
automation, SQL test scripts, load-test scripts, CI/CD, and optional hosting.

Dependency review note: `npm audit --omit=dev` currently reports the upstream
React Router RSC-mode advisory `GHSA-qwww-vcr4-c8h2`. This SUT uses the
client-only `BrowserRouter` and does not use React Server Components, actions, or
server-side rendering. No released stable React Router version is currently
outside all reported advisory ranges; recheck before any future hosted delivery.

### QA Handoff Package

Before handing the SUT to QA, development must provide:

- This approved requirement and implementation document
- README setup instructions and demo credentials
- Database startup, migration, seed, and reset commands
- Frontend and API startup commands
- Environment-variable example without secrets
- Route list, API contract, field rules, and error catalogue
- Seed-data catalogue with expected statuses and relationships
- Known limitations and out-of-scope list
- A clean lint, type-check, developer-test, and production-build result

The QA learner owns:

- Requirement review questions
- Test strategy and test plan refinement
- Test scenarios, detailed test cases, and exploratory charters
- Defect reports and evidence
- Postman/Bruno assets
- SQL validation queries
- Playwright framework and tests
- Load-test design and scripts
- CI/CD workflow and optional staging deployment

---

## 2. Main Goal

The goal of this project is to demonstrate the full QA workflow:

1. Understand requirements
2. Identify test scenarios
3. Design manual test cases
4. Identify business rules and edge cases
5. Automate UI tests
6. Automate API tests
7. Validate state transitions
8. Validate calculation logic
9. Create bug report samples
10. Run automated tests in CI

This project should answer the interview question:

> Can you design and test a realistic business workflow, not just automate clicking buttons?

---

## 3. Non-Goals

This project must not grow into a full SaaS product.

The following features are explicitly out of scope:

- Real SaaS tenant system
- Subscription billing
- Real payment gateway
- PromptPay QR integration
- PDF invoice generation
- Google Maps
- GPS tracking
- Real photo upload
- Push notifications
- Offline sync
- Mobile app
- Supabase production integration
- RLS or production-level security
- Complex dashboard analytics
- Multi-branch business logic
- Real customer data

If any feature does not help demonstrate QA automation skills, do not implement it.

---

## 4. Documentation Rule

This file is the **single source of truth** for the project.

All requirements, implementation details, QA strategy, test cases, state transition matrix, decision table, risk-based testing, bug report samples, and traceability matrix must stay in this single file:

```text
IMPLEMENTATION_PLAN.md
```

Do not create separate documentation files during the initial implementation unless explicitly requested later.

---

## 5. Recommended Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Plain CSS or lightweight global CSS

### Backend and Database

- Express.js mock API
- PostgreSQL
- Plain SQL migrations and seed scripts
- `pg` database driver and transactions
- Docker Compose for local PostgreSQL
- Seed data
- Test reset endpoint

### Developer Verification

- Vitest developer tests for critical domain rules
- ESLint
- TypeScript type-check
- Production build

Playwright, QA API automation, load-test tools, and CI/CD are intentionally left
for the QA learner to install and design.

### Documentation

- README.md
- IMPLEMENTATION_PLAN.md

---

## 6. Recommended Repository Structure

```text
home-service-qa-demo/
  README.md
  IMPLEMENTATION_PLAN.md
  package.json
  docker-compose.yml
  .env.example
  vite.config.ts
  tsconfig.json

  src/
    main.tsx
    App.tsx

    app/
      routes.tsx
      ProtectedRoute.tsx
      RoleGuard.tsx

    shared/
      components/
        AppLayout.tsx
        Navbar.tsx
        Sidebar.tsx
        PageHeader.tsx
        StatusBadge.tsx
        ErrorMessage.tsx
        ConfirmDialog.tsx

      utils/
        dateUtils.ts
        moneyUtils.ts
        validationUtils.ts

      constants/
        routes.ts
        timeSlots.ts
        serviceTypes.ts
        status.ts

    domain/
      jobStatusRules.ts
      pricingRules.ts
      inventoryRules.ts
      validationRules.ts

    features/
      auth/
        LoginPage.tsx
        authService.ts
        authTypes.ts
        AuthContext.tsx

      dashboard/
        AdminDashboardPage.tsx
        dashboardService.ts

      customers/
        CustomerListPage.tsx
        CustomerDetailPage.tsx
        CustomerFormPage.tsx
        customerService.ts
        customerTypes.ts

      jobs/
        JobListPage.tsx
        JobDetailPage.tsx
        JobFormPage.tsx
        jobService.ts
        jobTypes.ts

      dispatch/
        DispatchPage.tsx
        dispatchService.ts

      technician/
        TechnicianJobListPage.tsx
        TechnicianJobDetailPage.tsx
        technicianService.ts

      inventory/
        InventoryPage.tsx
        inventoryService.ts
        inventoryTypes.ts

      invoices/
        InvoiceListPage.tsx
        InvoiceDetailPage.tsx
        invoiceService.ts
        invoiceTypes.ts

  server/
    index.ts

    db/
      pool.ts
      migrate.ts
      seed.ts
      reset.ts
      migrations/
        001_initial_schema.sql

    routes/
      authRoutes.ts
      customerRoutes.ts
      jobRoutes.ts
      inventoryRoutes.ts
      invoiceRoutes.ts
      testRoutes.ts

    domain/
      jobStatusRules.ts
      pricingRules.ts
      inventoryRules.ts
      validationRules.ts

    developer-tests/
      jobStatusRules.test.ts
      pricingRules.test.ts
      inventoryRules.test.ts
      schedulingRules.test.ts
      completeJob.test.ts
```

---

## 7. Package Scripts

Add these scripts to `package.json`.

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:api\" \"npm run dev:web\"",
    "dev:web": "vite",
    "dev:api": "tsx server/index.ts",
    "db:migrate": "tsx server/db/migrate.ts",
    "db:seed": "tsx server/db/seed.ts",
    "db:reset": "tsx server/db/reset.ts",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test:dev": "vitest run",
    "lint": "eslint ."
  }
}
```

Recommended dependencies:

```text
react
react-dom
react-router-dom
express
cors
pg
```

Recommended dev dependencies:

```text
@types/express
@types/cors
@types/node
@types/pg
@types/react
@types/react-dom
concurrently
tsx
typescript
vite
vitest
eslint
```

---

## 8. Core Data Models

### 8.1 User

```ts
export type UserRole = 'admin' | 'technician';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
```

Seed users:

```ts
[
  {
    id: 'user-admin-001',
    name: 'Demo Admin',
    email: 'admin@demo.com',
    password: 'password123',
    role: 'admin'
  },
  {
    id: 'user-tech-001',
    name: 'Demo Technician',
    email: 'tech@demo.com',
    password: 'password123',
    role: 'technician'
  }
]
```

---

### 8.2 Customer

```ts
export type AcType = 'Wall Type' | 'Cassette' | 'Floor Standing' | 'Portable';
export type BtuSize = 9000 | 12000 | 18000 | 24000;

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  acBrand?: string;
  btu: BtuSize;
  acType: AcType;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
```

Validation rules:

```text
name: required, 2-50 characters
phone: required, exactly 10 digits
address: required, 5-200 characters
acBrand: optional
btu: must be 9000, 12000, 18000, or 24000
acType: must be Wall Type, Cassette, Floor Standing, or Portable
note: optional, max 300 characters
```

---

### 8.3 Technician

```ts
export interface Technician {
  id: string;
  name: string;
  phone: string;
  active: boolean;
  skillTags: string[];
}
```

Seed technicians:

```ts
[
  {
    id: 'tech-001',
    name: 'Demo Technician',
    phone: '0811111111',
    active: true,
    skillTags: ['Cleaning', 'Repair']
  },
  {
    id: 'tech-002',
    name: 'Second Technician',
    phone: '0822222222',
    active: true,
    skillTags: ['Cleaning', 'Installation']
  }
]
```

---

### 8.4 Job

```ts
export type ServiceType = 'Cleaning' | 'Repair' | 'Installation';

export type JobPriority = 'Normal' | 'Urgent';

export type JobStatus =
  | 'Pending'
  | 'Assigned'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

export type TimeSlot =
  | '08:00-10:00'
  | '10:00-12:00'
  | '13:00-15:00'
  | '15:00-17:00';

export interface UsedPart {
  inventoryItemId: string;
  quantity: number;
}

export interface Job {
  id: string;
  customerId: string;
  serviceType: ServiceType;
  preferredDate: string;
  timeSlot: TimeSlot;
  technicianId?: string;
  numberOfUnits: number;
  priority: JobPriority;
  problemDescription?: string;
  status: JobStatus;
  usedParts: UsedPart[];
  createdAt: string;
  updatedAt: string;
}
```

Validation rules:

```text
customerId: required
serviceType: required
preferredDate: required, cannot be in the past
timeSlot: required
technicianId: optional
numberOfUnits: required, min 1, max 5
priority: required
problemDescription: optional, max 500 characters
```

---

### 8.5 Inventory Item

```ts
export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  safetyStock: number;
  unitCost: number;
}
```

Seed inventory:

```ts
[
  {
    id: 'inv-001',
    name: 'Air Filter',
    stock: 10,
    safetyStock: 3,
    unitCost: 150
  },
  {
    id: 'inv-002',
    name: 'Drain Pipe',
    stock: 2,
    safetyStock: 2,
    unitCost: 120
  },
  {
    id: 'inv-003',
    name: 'Capacitor',
    stock: 1,
    safetyStock: 2,
    unitCost: 250
  },
  {
    id: 'inv-004',
    name: 'Cleaning Spray',
    stock: 8,
    safetyStock: 3,
    unitCost: 80
  }
]
```

Inventory rules:

```text
stock cannot be negative
low stock is true when stock <= safetyStock
used parts reduce stock
used part cost is added to invoice
```

---

### 8.6 Invoice

```ts
export type InvoiceStatus = 'Unpaid' | 'Paid';

export interface Invoice {
  id: string;
  jobId: string;
  serviceFee: number;
  urgentSurcharge: number;
  partsCost: number;
  subtotal: number;
  vat: number;
  total: number;
  status: InvoiceStatus;
  receiptNo?: string;
  createdAt: string;
  paidAt?: string;
}
```

Invoice rules:

```text
invoice is generated when job becomes Completed
invoice status starts as Unpaid
paid invoice cannot be edited
receiptNo is generated when invoice is marked as Paid
```

---

### 8.7 PostgreSQL Relational Contract

| Table | Primary/Unique Keys | Important Foreign Keys and Checks |
|---|---|---|
| `users` | `id`; unique `email` | role is `admin` or `technician`; email stored case-insensitively |
| `technicians` | `id`; unique `user_id` | `user_id -> users.id`; active flag required |
| `customers` | `id` | valid name/phone/address lengths; valid BTU and AC type |
| `jobs` | `id` | `customer_id -> customers.id`; optional `technician_id -> technicians.id`; valid service, slot, priority, status, and unit count |
| `job_used_parts` | composite `(job_id, inventory_item_id)` | references jobs and inventory; quantity greater than zero |
| `inventory_items` | `id` | stock and safety stock non-negative; unit cost non-negative |
| `invoices` | `id`; unique `job_id`; unique optional `receipt_no` | `job_id -> jobs.id`; non-negative monetary values; valid status |

All timestamps are stored as timezone-aware values. `preferred_date` is stored as
a date without a time component. Money uses fixed-precision numeric columns and
must not use floating-point database types.

Relationships:

```text
users 1 -- 0..1 technicians
customers 1 -- many jobs
technicians 1 -- many jobs
jobs 1 -- many job_used_parts
inventory_items 1 -- many job_used_parts
jobs 1 -- 0..1 invoices
```

Deleting transactional records through the application is out of scope. Foreign
keys must prevent deleting referenced parent data accidentally.

---

### 8.8 Seed Data Catalogue

Relative dates are recalculated on every seed/reset using `Asia/Bangkok`.

| Record | Expected State |
|---|---|
| `cus-001` | Arun Home, phone `0812345678`, Wall Type, 12000 BTU |
| `cus-002` | Mali Residence, phone `0898765432`, Cassette, 18000 BTU |
| `cus-003` | Somchai Office, phone `0861234567`, Floor Standing, 24000 BTU |
| `job-001` | Pending Cleaning, 1 unit, Normal, `cus-001`, tomorrow `10:00-12:00`, no technician; conflict-ready against `job-002` |
| `job-002` | Assigned Cleaning, 2 units, Normal, `cus-002`, tomorrow `10:00-12:00`, `tech-001` |
| `job-003` | In Progress Repair, 1 unit, Urgent, `cus-003`, tomorrow `13:00-15:00`, `tech-001` |
| `job-004` | Completed Installation, 1 unit, Normal, `cus-001`, yesterday, `tech-002`; used 2 Cleaning Spray |
| `job-005` | Cancelled Cleaning, 1 unit, Normal, `cus-002`, two days from today |
| `job-006` | Completed Repair, 1 unit, Urgent, `cus-003`, two days ago, `tech-002`; used 1 Capacitor |
| `inv-001` | Air Filter, stock 10, safety stock 3: not low |
| `inv-002` | Drain Pipe, stock 2, safety stock 2: low at equality boundary |
| `inv-003` | Capacitor, stock 1, safety stock 2: low below boundary |
| `inv-004` | Cleaning Spray, stock 8, safety stock 3: not low |
| `invoice-001` | Unpaid invoice for `job-004`: service 1500, parts 160, subtotal 1660, VAT 116.20, total 1776.20 |
| `invoice-002` | Paid invoice for `job-006`: service 300, urgent 300, parts 250, subtotal 850, VAT 59.50, total 909.50 |

Completed seed jobs represent post-completion state: their documented inventory
stock has already been deducted, and each has one matching invoice.

---

## 9. Business Rules

### 9.1 Authentication Rules

```text
AUTH-RULE-001: Valid admin credentials redirect to /admin/dashboard
AUTH-RULE-002: Valid technician credentials redirect to /tech/jobs
AUTH-RULE-003: Invalid credentials show "Invalid email or password"
AUTH-RULE-004: Unauthenticated users cannot access protected pages
AUTH-RULE-005: Technician users cannot access admin pages
AUTH-RULE-006: Logged-out users are redirected to /login
```

---

### 9.2 Job Status Transition Rules

Allowed transitions:

| Current Status | Allowed Next Status |
|---|---|
| Pending | Assigned, Cancelled |
| Assigned | In Progress, Cancelled |
| In Progress | Completed |
| Completed | None |
| Cancelled | None |

Blocked transitions:

| Current Status | Blocked Next Status |
|---|---|
| Pending | In Progress, Completed |
| Assigned | Completed, Pending |
| In Progress | Pending, Assigned, Cancelled |
| Completed | Pending, Assigned, In Progress, Cancelled |
| Cancelled | Pending, Assigned, In Progress, Completed |

Implementation should use a pure function:

```ts
export function canTransitionJobStatus(
  currentStatus: JobStatus,
  nextStatus: JobStatus
): boolean
```

Error message for invalid transition:

```text
Invalid job status transition
```

---

### 9.3 Technician Assignment Rules

```text
DISP-RULE-001: Pending jobs can be assigned to a technician
DISP-RULE-002: Assigned jobs can be reassigned before they start
DISP-RULE-003: In Progress jobs cannot be reassigned
DISP-RULE-004: Completed jobs cannot be reassigned
DISP-RULE-005: Cancelled jobs cannot be reassigned
DISP-RULE-006: A technician cannot have two jobs on the same date and same time slot
DISP-RULE-007: Once a technician is assigned, job status becomes Assigned
```

Conflict logic:

A scheduling conflict exists when:

```text
same technicianId
same preferredDate
same timeSlot
job status is Assigned or In Progress
```

Error message:

```text
Technician already has a job in this time slot
```

---

### 9.4 Pricing Rules

Service fee:

| Service Type | Price Rule |
|---|---|
| Cleaning | 600 THB × numberOfUnits |
| Repair | 300 THB inspection fee |
| Installation | 1500 THB × numberOfUnits |

Additional fees:

```text
Urgent surcharge = 300 THB
VAT = 7%
Parts cost = sum(inventory.unitCost × usedPart.quantity)
Subtotal = serviceFee + urgentSurcharge + partsCost
VAT = subtotal × 0.07
Total = subtotal + VAT
```

Implementation should use pure functions:

```ts
calculateServiceFee(job: Job): number
calculatePartsCost(job: Job, inventoryItems: InventoryItem[]): number
calculateInvoice(job: Job, inventoryItems: InventoryItem[]): InvoiceCalculation
```

Rounding rule:

```text
VAT and total should be rounded to 2 decimal places.
```

---

### 9.5 Inventory Rules

```text
INV-RULE-001: Stock cannot go below zero
INV-RULE-002: Low stock alert is shown when stock <= safetyStock
INV-RULE-003: Technician can add or replace used parts only while job is In Progress
INV-RULE-004: Used parts reduce inventory stock when job is completed
INV-RULE-005: If stock is insufficient, job completion is blocked
```

Error messages:

```text
Insufficient stock
Stock cannot be negative
```

---

## 10. Application Routes

### Public Routes

```text
/login
```

### Admin Routes

```text
/admin/dashboard
/admin/customers
/admin/customers/new
/admin/customers/:id
/admin/customers/:id/edit

/admin/jobs
/admin/jobs/new
/admin/jobs/:id

/admin/dispatch

/admin/inventory

/admin/invoices
/admin/invoices/:id
```

### Technician Routes

```text
/tech/jobs
/tech/jobs/:id
```

### Redirect Rules

```text
/ -> /login
unknown route -> /login or 404 page
admin after login -> /admin/dashboard
technician after login -> /tech/jobs
```

---

## 11. API Contract

The mock API should run on:

```text
http://localhost:4000
```

The frontend should call API through:

```text
VITE_API_BASE_URL=http://localhost:4000/api
```

---

### 11.0 Common API Rules

- `/api/health`, `/api/auth/login`, and development/test `/api/test/reset` are public.
- All other business endpoints require `Authorization: Bearer <token>`.
- Missing or invalid authentication returns `401`.
- Authenticated users without the required role receive `403`.
- Admin owns customer, dispatch, inventory, invoice, and dashboard mutations.
- Technician can read only assigned jobs and perform technician workflow actions.
- Success and failure bodies follow the Standard API Response Rules in the
  approved baseline.
- Unknown resources return `404`; malformed or rule-breaking requests return
  `400`.

Common error catalogue:

| HTTP | Code | Meaning |
|---:|---|---|
| 400 | `VALIDATION_ERROR` | One or more request fields are invalid |
| 400 | `TECHNICIAN_SCHEDULE_CONFLICT` | Technician already has an active job in the slot |
| 400 | `INVALID_STATUS_TRANSITION` | Requested job transition is not allowed |
| 400 | `INSUFFICIENT_STOCK` | Completion or stock-out requires more stock than available |
| 400 | `STOCK_CANNOT_BE_NEGATIVE` | Requested adjustment would make stock negative |
| 400 | `INVOICE_ALREADY_PAID` | Payment was requested for a Paid invoice |
| 400 | `JOB_NOT_COMPLETED` | Invoice generation was requested before completion |
| 401 | `INVALID_CREDENTIALS` | Login credentials are invalid |
| 401 | `UNAUTHENTICATED` | Bearer token is missing or invalid |
| 403 | `FORBIDDEN` | Authenticated role cannot perform the operation |
| 403 | `RESET_DISABLED` | Test reset is unavailable in the current environment |
| 404 | `NOT_FOUND` | Requested resource does not exist |

---

### 11.1 Auth API

#### POST /api/auth/login

Request:

```json
{
  "email": "admin@demo.com",
  "password": "password123"
}
```

Success response:

```json
{
  "data": {
    "token": "mock-token-admin",
    "user": {
      "id": "user-admin-001",
      "name": "Demo Admin",
      "email": "admin@demo.com",
      "role": "admin"
    }
  }
}
```

Error response:

```json
{
  "message": "Invalid email or password",
  "code": "INVALID_CREDENTIALS"
}
```

Status codes:

```text
200 success
401 invalid credentials
400 missing required fields
```

---

### 11.1A Reference and Dashboard APIs

#### GET /api/technicians

Admin-only. Returns active technicians used by job and dispatch forms.

Status codes:

```text
200 found
401 unauthenticated
403 forbidden
```

#### GET /api/dashboard/summary

Admin-only. Returns:

```json
{
  "data": {
    "totalJobsToday": 0,
    "pendingJobs": 1,
    "assignedJobs": 1,
    "completedJobs": 2,
    "unpaidInvoices": 1,
    "lowStockItems": 2
  }
}
```

Counts are calculated from current database state when the endpoint is called.

---

### 11.2 Customer API

#### GET /api/customers

Query params:

```text
search optional
```

#### GET /api/customers/:id

Status codes:

```text
200 found
404 not found
```

#### POST /api/customers

Validation:

```text
name required
phone exactly 10 digits
address required
btu must be valid
acType must be valid
```

Status codes:

```text
201 created
400 validation error
```

#### PATCH /api/customers/:id

Status codes:

```text
200 updated
400 validation error
404 not found
```

---

### 11.3 Job API

#### GET /api/jobs

Query params:

```text
status optional
search optional
date optional
technicianId optional
```

Admin may use every filter. A Technician request is always scoped to the
authenticated technician; a supplied `technicianId` cannot expand that scope.

#### GET /api/jobs/:id

Admin can read any job. Technician can read the job only when it is assigned to
that technician.

Status codes:

```text
200 found
403 technician does not own job
404 not found
```

#### POST /api/jobs

Request:

```json
{
  "customerId": "cus-001",
  "serviceType": "Cleaning",
  "preferredDate": "2026-08-01",
  "timeSlot": "10:00-12:00",
  "technicianId": "tech-001",
  "numberOfUnits": 2,
  "priority": "Normal",
  "problemDescription": "Regular cleaning"
}
```

Expected behavior:

```text
If technicianId is empty, status = Pending
If technicianId exists, status = Assigned
```

Status codes:

```text
201 created
400 validation error
400 scheduling conflict
404 customer not found
404 technician not found
```

#### PATCH /api/jobs/:id/assign

Request:

```json
{
  "technicianId": "tech-001"
}
```

Status codes:

```text
200 assigned
400 scheduling conflict
400 cannot assign completed job
400 cannot assign cancelled job
404 job not found
404 technician not found
```

#### PATCH /api/jobs/:id/status

Request:

```json
{
  "nextStatus": "In Progress"
}
```

Status codes:

```text
200 updated
400 invalid status transition
403 technician or admin role cannot perform this transition
404 job not found
```

Role rules:

```text
Admin can request Pending -> Cancelled or Assigned -> Cancelled.
Technician can request Assigned -> In Progress for an owned job.
Technician can request In Progress -> Completed for an owned job.
Pending -> Assigned occurs through assignment, not this endpoint.
```

When `nextStatus` is `Completed`, this endpoint performs the Transactional
Completion Contract and returns the updated job plus generated invoice.

#### PUT /api/jobs/:id/used-parts

Technician-only. Replaces the complete used-parts draft for an owned In Progress
job. Sending the complete collection makes retries deterministic and prevents
duplicate quantities.

Request:

```json
{
  "usedParts": [
    {
      "inventoryItemId": "inv-001",
      "quantity": 2
    }
  ]
}
```

Expected behavior:

```text
Only an In Progress job can be edited.
Every inventory item must exist.
Each quantity must be a positive integer.
Duplicate inventoryItemId values are rejected.
Stock is checked but not deducted until job completion.
```

Status codes:

```text
200 draft replaced
400 invalid job status or used-parts input
403 technician does not own job
404 job or inventory item not found
```

---

### 11.4 Inventory API

#### GET /api/inventory

Response should include lowStock flag:

```json
{
  "data": [
    {
      "id": "inv-001",
      "name": "Air Filter",
      "stock": 10,
      "safetyStock": 3,
      "unitCost": 150,
      "lowStock": false
    }
  ]
}
```

#### PATCH /api/inventory/:id/adjust

Request:

```json
{
  "type": "in",
  "quantity": 5
}
```

or

```json
{
  "type": "out",
  "quantity": 2
}
```

Status codes:

```text
200 adjusted
400 stock cannot be negative
400 quantity must be greater than 0
404 item not found
```

---

### 11.5 Invoice API

#### GET /api/invoices

Query params:

```text
status optional
```

#### GET /api/invoices/:id

Status codes:

```text
200 found
404 not found
```

#### POST /api/invoices/generate

Request:

```json
{
  "jobId": "job-001"
}
```

Expected behavior:

```text
Invoice can be generated only for Completed job
If invoice already exists for job, return existing invoice
```

Status codes:

```text
201 generated
200 existing invoice returned
400 job is not completed
404 job not found
```

#### PATCH /api/invoices/:id/pay

Expected behavior:

```text
Invoice status becomes Paid
receiptNo is generated
paidAt is set
```

Status codes:

```text
200 paid
400 invoice already paid
404 invoice not found
```

---

### 11.6 Test API

Only available in development/test.

#### POST /api/test/reset

Purpose:

Reset PostgreSQL to deterministic seed data for manual or automated testing.

Status codes:

```text
200 reset success
403 reset disabled outside development/test
```

This endpoint is important for stable UI, API, and SQL testing. It is disabled
outside development/test environments.

---

## 12. Page Requirements

### 12.1 Login Page

Route:

```text
/login
```

Fields:

```text
email
password
login button
error message area
```

Test IDs:

```text
login-email-input
login-password-input
login-submit-button
login-error-message
```

Requirements:

```text
User can enter email and password
Valid admin login redirects to /admin/dashboard
Valid technician login redirects to /tech/jobs
Invalid login shows error
Empty fields show validation message
```

---

### 12.2 Admin Dashboard Page

Route:

```text
/admin/dashboard
```

Dashboard cards:

```text
Total Jobs Today
Pending Jobs
Assigned Jobs
Completed Jobs
Unpaid Invoices
Low Stock Items
```

Test IDs:

```text
dashboard-total-jobs
dashboard-pending-jobs
dashboard-assigned-jobs
dashboard-completed-jobs
dashboard-unpaid-invoices
dashboard-low-stock
```

Requirements:

```text
Only admin can access
Shows summary from current mock data
Numbers update after job, invoice, or inventory changes
```

---

### 12.3 Customer List Page

Route:

```text
/admin/customers
```

Elements:

```text
customer search input
customer table
add customer button
view detail button
edit button
```

Test IDs:

```text
customer-search-input
customer-add-button
customer-table
customer-row-{customerId}
```

Requirements:

```text
Admin can view customer list
Admin can search by name or phone
Admin can navigate to customer detail
Admin can navigate to create customer page
```

---

### 12.4 Customer Form Page

Routes:

```text
/admin/customers/new
/admin/customers/:id/edit
```

Fields:

```text
name
phone
address
acBrand
btu
acType
note
save button
cancel button
```

Test IDs:

```text
customer-name-input
customer-phone-input
customer-address-input
customer-ac-brand-input
customer-btu-select
customer-ac-type-select
customer-note-input
customer-save-button
```

Requirements:

```text
Admin can create customer
Admin can edit customer
Invalid phone shows validation error
Missing required fields show validation errors
After save, user returns to customer list or detail
```

---

### 12.5 Job List Page

Route:

```text
/admin/jobs
```

Elements:

```text
status filter
search input
job table
create job button
```

Test IDs:

```text
job-status-filter
job-search-input
job-create-button
job-table
job-row-{jobId}
```

Requirements:

```text
Admin can view jobs
Admin can filter by status
Admin can search by customer name or phone
Admin can open job detail
Admin can create job
```

---

### 12.6 Job Form Page

Route:

```text
/admin/jobs/new
```

Fields:

```text
customer select
service type select
preferred date input
time slot select
technician select
number of units input
priority select
problem description textarea
save button
```

Test IDs:

```text
job-customer-select
job-service-type-select
job-date-input
job-time-slot-select
job-technician-select
job-units-input
job-priority-select
job-description-input
job-save-button
```

Requirements:

```text
Admin can create pending job without technician
Admin can create assigned job with technician
Past date is blocked
Number of units must be 1-5
Technician conflict is blocked
```

---

### 12.7 Job Detail Page

Route:

```text
/admin/jobs/:id
```

Elements:

```text
job information
customer information
technician information
status badge
assign technician section
cancel job button
invoice link if completed
```

Test IDs:

```text
job-detail-status
job-detail-customer
job-detail-technician
job-assign-button
job-cancel-button
job-invoice-link
```

Requirements:

```text
Admin can view job detail
Admin can assign technician to pending job
Admin can cancel pending or assigned job
Admin cannot cancel completed job
Admin can see invoice link after completion
```

---

### 12.8 Dispatch Page

Route:

```text
/admin/dispatch
```

Elements:

```text
date selector
technician selector
time slot selector
pending job selector
assign button
assignment table
```

Test IDs:

```text
dispatch-date-input
dispatch-technician-select
dispatch-time-slot-select
dispatch-job-select
dispatch-assign-button
dispatch-assignment-table
```

Requirements:

```text
Admin can assign pending job to technician
Admin can reassign assigned job before it starts
System blocks time slot conflict
Completed job cannot be reassigned
Cancelled job cannot be reassigned
Assigned job appears in technician job list
```

---

### 12.9 Technician Job List Page

Route:

```text
/tech/jobs
```

Elements:

```text
assigned job cards
status badge
view detail button
```

Test IDs:

```text
tech-job-list
tech-job-card-{jobId}
tech-job-status-{jobId}
```

Requirements:

```text
Technician can see only assigned jobs
Technician cannot see jobs assigned to others
Technician can open job detail
```

---

### 12.10 Technician Job Detail Page

Route:

```text
/tech/jobs/:id
```

Elements:

```text
job detail
customer detail
start job button
used parts section
complete job button
invoice summary after completion
```

Test IDs:

```text
tech-job-detail-status
tech-start-job-button
tech-used-part-select
tech-used-part-quantity-input
tech-add-used-part-button
tech-complete-job-button
tech-invoice-summary
```

Requirements:

```text
Technician can start assigned job
Technician can add used parts before completion
Technician can complete in-progress job
Completing job generates invoice
Completing job reduces stock
Technician cannot complete job without starting it
Technician cannot start cancelled job
```

---

### 12.11 Inventory Page

Route:

```text
/admin/inventory
```

Elements:

```text
inventory table
stock in/out form
low stock badge
```

Test IDs:

```text
inventory-table
inventory-row-{inventoryItemId}
inventory-adjust-type-select
inventory-adjust-quantity-input
inventory-adjust-button
low-stock-badge-{inventoryItemId}
```

Requirements:

```text
Admin can view inventory
Admin can adjust stock in
Admin can adjust stock out
Stock cannot go below zero
Low stock badge appears when stock <= safetyStock
```

---

### 12.12 Invoice List Page

Route:

```text
/admin/invoices
```

Elements:

```text
invoice table
status filter
view detail button
```

Test IDs:

```text
invoice-table
invoice-status-filter
invoice-row-{invoiceId}
```

Requirements:

```text
Admin can view invoices
Admin can filter unpaid invoices
Admin can open invoice detail
```

---

### 12.13 Invoice Detail Page

Route:

```text
/admin/invoices/:id
```

Elements:

```text
service fee
urgent surcharge
parts cost
subtotal
VAT
total
status
mark as paid button
receipt number
```

Test IDs:

```text
invoice-service-fee
invoice-urgent-surcharge
invoice-parts-cost
invoice-subtotal
invoice-vat
invoice-total
invoice-status
invoice-mark-paid-button
invoice-receipt-number
```

Requirements:

```text
Admin can verify invoice calculation
Admin can mark unpaid invoice as paid
Paid invoice shows receipt number
Paid invoice cannot be marked as paid again
```

---

## 13. Implementation Phases

These phases describe initial SUT implementation. Every `Tests To Add` subsection
is a suggested future QA backlog owned by the QA learner, except for the
developer domain/transaction tests explicitly listed in the approved baseline.

### Phase 0: Project Setup

Objective:

Set up the project foundation.

Tasks:

- [ ] Create Vite React TypeScript project
- [ ] Install React Router
- [ ] Install Express, cors, tsx
- [ ] Add PostgreSQL and Docker Compose
- [ ] Add developer-level Vitest support
- [ ] Add package scripts
- [ ] Add folder structure
- [ ] Add global CSS
- [ ] Add basic App layout
- [ ] Add API base URL config
- [ ] Add initial README content
- [ ] Add IMPLEMENTATION_PLAN.md

Acceptance Criteria:

- [ ] `npm run dev:web` starts frontend
- [ ] `npm run dev:api` starts mock API
- [ ] `npm run dev` starts both
- [ ] `npm run build` passes
- [ ] `/login` page renders

---

### Phase 1: PostgreSQL and API Foundation

Objective:

Create deterministic PostgreSQL-backed API with migrations, seed data, and reset support.

Tasks:

- [ ] Create Express server
- [ ] Create PostgreSQL schema and migration runner
- [ ] Add database constraints and indexes
- [ ] Create seed data
- [ ] Add `/api/health`
- [ ] Add `/api/test/reset`
- [ ] Add error response helper
- [ ] Add validation helper
- [ ] Add CORS
- [ ] Add JSON body parser
- [ ] Add basic API logging in dev mode
- [ ] Read ports, origins, and database connection from environment variables

Acceptance Criteria:

- [ ] `GET /api/health` returns success
- [ ] `POST /api/test/reset` resets store to seed data
- [ ] API responses are JSON
- [ ] API errors follow consistent format

Standard error format:

```json
{
  "message": "Error message"
}
```

---

### Phase 2: Auth & Routing

Objective:

Implement login, logout, protected routes, and role-based access.

Tasks:

- [ ] Create auth API route
- [ ] Create login page
- [ ] Create AuthContext
- [ ] Store token and user in localStorage
- [ ] Add logout function
- [ ] Add ProtectedRoute
- [ ] Add RoleGuard
- [ ] Add admin layout
- [ ] Add technician layout
- [ ] Add redirects by role

Acceptance Criteria:

- [ ] Admin login redirects to `/admin/dashboard`
- [ ] Technician login redirects to `/tech/jobs`
- [ ] Invalid login shows error
- [ ] Logout clears session
- [ ] Unauthenticated user cannot access protected routes
- [ ] Technician cannot access admin routes

Tests To Add:

UI:

- [ ] Login success as admin
- [ ] Login success as technician
- [ ] Invalid login shows error
- [ ] Unauthenticated user redirects to login
- [ ] Technician cannot access admin page

API:

- [ ] Login success returns token and user
- [ ] Invalid login returns 401
- [ ] Missing email/password returns 400

---

### Phase 3: Admin Dashboard

Objective:

Create a simple dashboard with business summary cards.

Tasks:

- [ ] Create dashboard API service
- [ ] Calculate total jobs today
- [ ] Calculate pending jobs
- [ ] Calculate assigned jobs
- [ ] Calculate completed jobs
- [ ] Calculate unpaid invoices
- [ ] Calculate low stock items
- [ ] Render dashboard cards

Acceptance Criteria:

- [ ] Dashboard cards display correct seed data
- [ ] Dashboard is admin-only
- [ ] Dashboard updates after invoice is paid
- [ ] Dashboard updates after inventory changes

Tests To Add:

UI:

- [ ] Admin can view dashboard summary
- [ ] Unpaid invoice count updates after payment
- [ ] Low stock count updates when stock changes

---

### Phase 4: Customer Management

Objective:

Implement customer CRUD and validation.

Tasks:

API:

- [ ] `GET /api/customers`
- [ ] `GET /api/customers/:id`
- [ ] `POST /api/customers`
- [ ] `PATCH /api/customers/:id`
- [ ] Customer validation rules

Frontend:

- [ ] Customer list page
- [ ] Customer search
- [ ] Customer detail page
- [ ] Customer create form
- [ ] Customer edit form
- [ ] Validation error rendering
- [ ] Navigation between pages

Acceptance Criteria:

- [ ] Admin can view customer list
- [ ] Admin can search customer by name
- [ ] Admin can search customer by phone
- [ ] Admin can create customer
- [ ] Admin can edit customer
- [ ] Invalid phone is blocked
- [ ] Missing required fields are blocked
- [ ] Invalid BTU is blocked

Tests To Add:

UI:

- [ ] Create customer with valid data
- [ ] Required fields show validation errors
- [ ] Phone less than 10 digits shows error
- [ ] Search customer by phone
- [ ] Edit customer successfully

API:

- [ ] Create customer success
- [ ] Invalid phone returns 400
- [ ] Missing name returns 400
- [ ] Get customer by ID returns 200
- [ ] Get unknown customer returns 404

---

### Phase 5: Job Booking

Objective:

Implement job creation, job list, job detail, validation, and search/filter.

Tasks:

API:

- [ ] `GET /api/jobs`
- [ ] `GET /api/jobs/:id`
- [ ] `POST /api/jobs`
- [ ] Job validation rules
- [ ] Technician conflict check
- [ ] Status assignment logic

Frontend:

- [ ] Job list page
- [ ] Job status filter
- [ ] Job search
- [ ] Job create form
- [ ] Job detail page
- [ ] Customer select
- [ ] Service type select
- [ ] Date input
- [ ] Time slot select
- [ ] Technician select
- [ ] Priority select
- [ ] Number of units input

Acceptance Criteria:

- [ ] Job without technician becomes Pending
- [ ] Job with technician becomes Assigned
- [ ] Past date is blocked
- [ ] Units less than 1 are blocked
- [ ] Units more than 5 are blocked
- [ ] Technician conflict is blocked
- [ ] Admin can filter by status
- [ ] Admin can search job by customer name or phone

Tests To Add:

UI:

- [ ] Create pending job without technician
- [ ] Create assigned job with technician
- [ ] Cannot create job with past date
- [ ] Units must be between 1 and 5
- [ ] Job list filter by status works

API:

- [ ] Create pending job success
- [ ] Create assigned job success
- [ ] Past date returns 400
- [ ] Units 0 returns 400
- [ ] Units 6 returns 400
- [ ] Unknown customer returns 404

---

### Phase 6: Dispatch & Technician Assignment

Objective:

Implement assignment and scheduling conflict rules.

Tasks:

API:

- [ ] `PATCH /api/jobs/:id/assign`
- [ ] Validate job exists
- [ ] Validate technician exists
- [ ] Validate job status allows assignment
- [ ] Validate no time slot conflict
- [ ] Update job technicianId
- [ ] Update job status to Assigned

Frontend:

- [ ] Dispatch page
- [ ] Date selector
- [ ] Pending/assigned job selector
- [ ] Technician selector
- [ ] Time slot display
- [ ] Assignment table
- [ ] Error message for conflict
- [ ] Success message after assignment

Acceptance Criteria:

- [ ] Admin can assign pending job
- [ ] Admin can reassign assigned job
- [ ] Same technician cannot be assigned to overlapping slot
- [ ] Completed job cannot be reassigned
- [ ] Cancelled job cannot be reassigned
- [ ] Assigned job appears in technician job list

Tests To Add:

UI:

- [ ] Assign technician to pending job
- [ ] Prevent overlapping technician time slot
- [ ] Completed job cannot be reassigned
- [ ] Assigned job appears in technician job list

API:

- [ ] Assign technician success
- [ ] Assign unknown job returns 404
- [ ] Assign unknown technician returns 404
- [ ] Assignment conflict returns 400
- [ ] Assign completed job returns 400

---

### Phase 7: Job Status Flow

Objective:

Implement state transition rules for jobs.

Tasks:

Domain:

- [ ] Create `canTransitionJobStatus`
- [ ] Create `getAllowedNextStatuses`
- [ ] Add unit-like helper tests if desired

API:

- [ ] `PATCH /api/jobs/:id/status`
- [ ] Validate transition
- [ ] Block invalid transitions
- [ ] Update job status
- [ ] If status becomes Completed, prepare invoice generation path

Frontend:

- [ ] Show status badge
- [ ] Admin cancel button
- [ ] Technician start job button
- [ ] Technician complete job button
- [ ] Hide or disable invalid actions
- [ ] Show invalid transition error if API rejects

Acceptance Criteria:

- [ ] Pending can become Assigned
- [ ] Pending can become Cancelled
- [ ] Assigned can become In Progress
- [ ] Assigned can become Cancelled
- [ ] In Progress can become Completed
- [ ] Completed cannot change status
- [ ] Cancelled cannot change status
- [ ] Invalid transition returns error

Tests To Add:

UI:

- [ ] Technician starts assigned job
- [ ] Technician completes in-progress job
- [ ] Pending cannot be completed directly
- [ ] Completed job cannot be cancelled
- [ ] Cancelled job cannot be started

API:

- [ ] Assigned to In Progress returns 200
- [ ] In Progress to Completed returns 200
- [ ] Pending to Completed returns 400
- [ ] Completed to Cancelled returns 400
- [ ] Cancelled to Assigned returns 400

---

### Phase 8: Technician Job View

Objective:

Implement technician workflow.

Tasks:

API:

- [ ] `GET /api/jobs?technicianId=...`
- [ ] Return only matching jobs
- [ ] Add used parts to job
- [ ] Complete job with used parts

Frontend:

- [ ] Technician job list page
- [ ] Technician job detail page
- [ ] Start job button
- [ ] Used parts section
- [ ] Add used part button
- [ ] Complete job button
- [ ] Invoice summary after completion

Acceptance Criteria:

- [ ] Technician sees only assigned jobs
- [ ] Technician can start assigned job
- [ ] Technician can add used parts
- [ ] Technician can complete in-progress job
- [ ] Technician cannot complete job before starting
- [ ] Technician cannot start cancelled job
- [ ] Completed job generates invoice

Tests To Add:

UI:

- [ ] Technician sees assigned jobs only
- [ ] Technician starts job
- [ ] Technician adds used part
- [ ] Technician completes job
- [ ] Completion shows invoice summary

---

### Phase 9: Inventory

Objective:

Implement stock management and stock side effects.

Tasks:

API:

- [ ] `GET /api/inventory`
- [ ] `PATCH /api/inventory/:id/adjust`
- [ ] Validate item exists
- [ ] Validate quantity > 0
- [ ] Prevent negative stock
- [ ] Add lowStock flag

Frontend:

- [ ] Inventory page
- [ ] Inventory table
- [ ] Low stock badge
- [ ] Stock adjustment form
- [ ] Error message for negative stock

Integration:

- [ ] Used parts reduce stock when job is completed
- [ ] Completion blocked if stock is insufficient

Acceptance Criteria:

- [ ] Admin can view inventory
- [ ] Admin can stock in
- [ ] Admin can stock out
- [ ] Stock cannot go below zero
- [ ] Low stock badge appears when stock <= safetyStock
- [ ] Used parts reduce inventory after job completion

Tests To Add:

UI:

- [ ] Stock in increases quantity
- [ ] Stock out decreases quantity
- [ ] Cannot stock out more than available
- [ ] Low stock badge appears
- [ ] Used part reduces stock after job completion

API:

- [ ] Get inventory returns lowStock flag
- [ ] Stock in success
- [ ] Stock out success
- [ ] Stock below zero returns 400
- [ ] Unknown item returns 404

---

### Phase 10: Invoice & Payment

Objective:

Implement invoice generation and payment mock.

Tasks:

Domain:

- [ ] `calculateServiceFee`
- [ ] `calculatePartsCost`
- [ ] `calculateInvoice`
- [ ] VAT calculation
- [ ] Rounding helper

API:

- [ ] `GET /api/invoices`
- [ ] `GET /api/invoices/:id`
- [ ] `POST /api/invoices/generate`
- [ ] `PATCH /api/invoices/:id/pay`
- [ ] Auto-generate invoice when job is completed
- [ ] Prevent paying invoice twice

Frontend:

- [ ] Invoice list page
- [ ] Invoice detail page
- [ ] Mark as paid button
- [ ] Receipt number display
- [ ] Invoice link from job detail
- [ ] Dashboard unpaid invoice count update

Acceptance Criteria:

- [ ] Completed job generates invoice
- [ ] Invoice includes service fee
- [ ] Invoice includes urgent surcharge
- [ ] Invoice includes parts cost
- [ ] Invoice calculates VAT 7%
- [ ] Invoice calculates total correctly
- [ ] Admin can mark invoice as paid
- [ ] Paid invoice shows receipt number
- [ ] Paid invoice cannot be paid again
- [ ] Dashboard unpaid invoice count updates

Tests To Add:

UI:

- [ ] Completed job generates invoice
- [ ] Invoice VAT is calculated correctly
- [ ] Mark invoice as paid
- [ ] Paid invoice shows receipt number
- [ ] Unpaid invoice count decreases after payment

API:

- [ ] Generate invoice for completed job
- [ ] Generate invoice for non-completed job returns 400
- [ ] Invoice total includes VAT
- [ ] Pay invoice success
- [ ] Pay already paid invoice returns 400

---

## 14. QA Documentation Content To Keep In This File

This project should not create separate documentation files during initial implementation.

Keep the following documentation sections inside this file:

1. Requirements
2. Test Plan
3. Test Scenarios
4. Test Cases
5. State Transition Matrix
6. Decision Table - Pricing
7. Risk-Based Testing
8. Bug Report Samples
9. Traceability Matrix

---

## 15. Test Plan

### 15.1 Test Objectives

The objectives of testing are:

- Verify that core business workflows work correctly
- Verify that users can only access pages allowed by their role
- Verify that customer and job forms validate data correctly
- Verify that job status transitions follow defined business rules
- Verify that technician assignment prevents schedule conflicts
- Verify that inventory stock cannot become negative
- Verify that invoices calculate service fee, parts cost, VAT, and total correctly
- Verify that automated UI and API tests can run locally and in CI

---

### 15.2 Test Scope

In scope:

- Authentication
- Role-based access
- Customer management
- Job booking
- Dispatch assignment
- Job status transition
- Technician job workflow
- Inventory
- Invoice and payment mock
- Dashboard summary

Out of scope:

- Real payment
- Real GPS
- Real map
- Real file upload
- Real PDF
- Real SaaS tenant isolation
- Real production security testing

---

### 15.3 Test Types

- Functional Testing
- UI Testing
- API Testing
- Regression Testing
- Negative Testing
- Boundary Value Testing
- Equivalence Partitioning
- Decision Table Testing
- State Transition Testing
- Role-Based Access Testing
- Data Consistency Testing

---

### 15.4 Test Environment

Local development:

```text
Frontend: http://localhost:5173
Mock API: http://localhost:4000/api
Browser: Current desktop browser chosen by the QA learner
Data: PostgreSQL deterministic seed data
Reset endpoint: POST /api/test/reset
```

Future CI environment (owned by the QA learner):

```text
GitHub Actions
Node.js 20
Playwright browsers
Mock API + frontend started during test run
```

---

### 15.5 Entry Criteria

Testing can start when:

- Frontend runs locally
- Mock API runs locally
- `/api/test/reset` works
- Demo accounts are available
- Core pages render
- Test IDs are added to key elements

---

### 15.6 Exit Criteria

The initial SUT is ready for QA handoff when:

- Critical developer domain tests pass
- Lint, type-check, and production build pass
- PostgreSQL migrate, seed, and reset commands work
- Core workflow passes a development walkthrough
- README explains how to run the app

QA completion criteria are defined by the QA learner after requirement review.

---

## 16. Test Scenarios

### Authentication

| Scenario ID | Scenario |
|---|---|
| SC-AUTH-001 | Admin logs in successfully |
| SC-AUTH-002 | Technician logs in successfully |
| SC-AUTH-003 | User enters invalid credentials |
| SC-AUTH-004 | Unauthenticated user tries to open protected page |
| SC-AUTH-005 | Technician tries to access admin page |
| SC-AUTH-006 | User logs out |

### Customer Management

| Scenario ID | Scenario |
|---|---|
| SC-CUS-001 | Admin creates customer with valid data |
| SC-CUS-002 | Admin submits customer form with missing required fields |
| SC-CUS-003 | Admin enters invalid phone number |
| SC-CUS-004 | Admin searches customer by name |
| SC-CUS-005 | Admin searches customer by phone |
| SC-CUS-006 | Admin edits customer information |

### Job Booking

| Scenario ID | Scenario |
|---|---|
| SC-JOB-001 | Admin creates pending job without technician |
| SC-JOB-002 | Admin creates assigned job with technician |
| SC-JOB-003 | Admin creates job with past date |
| SC-JOB-004 | Admin creates job with invalid number of units |
| SC-JOB-005 | Admin filters jobs by status |
| SC-JOB-006 | Admin searches job by customer name or phone |

### Dispatch

| Scenario ID | Scenario |
|---|---|
| SC-DISP-001 | Admin assigns technician to pending job |
| SC-DISP-002 | Admin reassigns technician before job starts |
| SC-DISP-003 | System blocks technician schedule conflict |
| SC-DISP-004 | System blocks reassignment of completed job |
| SC-DISP-005 | Assigned job appears in technician job list |

### Technician Workflow

| Scenario ID | Scenario |
|---|---|
| SC-TECH-001 | Technician views assigned jobs |
| SC-TECH-002 | Technician starts assigned job |
| SC-TECH-003 | Technician adds used parts |
| SC-TECH-004 | Technician completes in-progress job |
| SC-TECH-005 | System blocks completing job before starting it |
| SC-TECH-006 | System blocks starting cancelled job |

### Inventory

| Scenario ID | Scenario |
|---|---|
| SC-INV-001 | Admin views inventory |
| SC-INV-002 | Admin stocks in item |
| SC-INV-003 | Admin stocks out item |
| SC-INV-004 | System blocks stock below zero |
| SC-INV-005 | Low stock badge appears |
| SC-INV-006 | Used parts reduce stock after job completion |

### Invoice

| Scenario ID | Scenario |
|---|---|
| SC-BILL-001 | Completed job generates invoice |
| SC-BILL-002 | Invoice includes service fee |
| SC-BILL-003 | Invoice includes urgent surcharge |
| SC-BILL-004 | Invoice includes used parts cost |
| SC-BILL-005 | Invoice calculates VAT correctly |
| SC-BILL-006 | Admin marks invoice as paid |
| SC-BILL-007 | Paid invoice shows receipt number |
| SC-BILL-008 | System blocks paying invoice twice |

---

## 17. Manual Test Cases

### TC-AUTH-001: Login successfully as Admin

Precondition:

- Admin account exists

Test Data:

```text
email: admin@demo.com
password: password123
```

Steps:

1. Open `/login`
2. Enter admin email
3. Enter admin password
4. Click Login

Expected Result:

- User is redirected to `/admin/dashboard`
- Admin dashboard is displayed

Priority:

High

Automation Candidate:

Yes

---

### TC-AUTH-002: Login successfully as Technician

Precondition:

- Technician account exists

Test Data:

```text
email: tech@demo.com
password: password123
```

Steps:

1. Open `/login`
2. Enter technician email
3. Enter technician password
4. Click Login

Expected Result:

- User is redirected to `/tech/jobs`
- Technician job list is displayed

Priority:

High

Automation Candidate:

Yes

---

### TC-AUTH-003: Login with invalid password

Precondition:

- Login page is available

Test Data:

```text
email: admin@demo.com
password: wrongpassword
```

Steps:

1. Open `/login`
2. Enter valid admin email
3. Enter wrong password
4. Click Login

Expected Result:

- System displays `Invalid email or password`
- User stays on login page

Priority:

High

Automation Candidate:

Yes

---

### TC-CUS-001: Create customer with valid data

Precondition:

- User is logged in as Admin

Test Data:

```text
name: Somchai Test
phone: 0812345678
address: Rayong, Thailand
acBrand: Daikin
btu: 12000
acType: Wall Type
```

Steps:

1. Open Customer List page
2. Click Add Customer
3. Fill all required fields
4. Click Save

Expected Result:

- Customer is created successfully
- Customer appears in customer list

Priority:

High

Automation Candidate:

Yes

---

### TC-CUS-002: Customer phone must be exactly 10 digits

Precondition:

- User is logged in as Admin

Test Data:

```text
phone: 081234567
```

Steps:

1. Open Add Customer page
2. Fill required fields
3. Enter phone with 9 digits
4. Click Save

Expected Result:

- System displays `Phone number must be 10 digits`
- Customer is not created

Priority:

High

Automation Candidate:

Yes

---

### TC-JOB-001: Create pending job without technician

Precondition:

- User is logged in as Admin
- Customer exists

Test Data:

```text
serviceType: Cleaning
preferredDate: tomorrow
timeSlot: 10:00-12:00
technicianId: empty
numberOfUnits: 2
priority: Normal
```

Steps:

1. Open Job Create page
2. Select customer
3. Select service type
4. Select future date
5. Select time slot
6. Leave technician empty
7. Enter number of units
8. Click Save

Expected Result:

- Job is created successfully
- Job status is `Pending`

Priority:

High

Automation Candidate:

Yes

---

### TC-JOB-002: Create assigned job with technician

Precondition:

- User is logged in as Admin
- Customer exists
- Technician exists

Test Data:

```text
serviceType: Cleaning
preferredDate: tomorrow
timeSlot: 13:00-15:00
technicianId: tech-001
numberOfUnits: 1
priority: Normal
```

Steps:

1. Open Job Create page
2. Fill job form with technician selected
3. Click Save

Expected Result:

- Job is created successfully
- Job status is `Assigned`
- Technician is shown in job detail

Priority:

High

Automation Candidate:

Yes

---

### TC-JOB-003: Preferred date cannot be in the past

Precondition:

- User is logged in as Admin

Test Data:

```text
preferredDate: yesterday
```

Steps:

1. Open Job Create page
2. Fill required fields
3. Select yesterday as preferred date
4. Click Save

Expected Result:

- System displays `Preferred date cannot be in the past`
- Job is not created

Priority:

High

Automation Candidate:

Yes

---

### TC-JOB-004: Number of units must be between 1 and 5

Precondition:

- User is logged in as Admin

Test Data:

```text
numberOfUnits: 0
numberOfUnits: 6
```

Steps:

1. Open Job Create page
2. Fill required fields
3. Enter invalid number of units
4. Click Save

Expected Result:

- System displays `Number of units must be between 1 and 5`
- Job is not created

Priority:

High

Automation Candidate:

Yes

---

### TC-DISP-001: Assign technician to pending job

Precondition:

- User is logged in as Admin
- Pending job exists
- Technician exists

Steps:

1. Open Dispatch page
2. Select date
3. Select pending job
4. Select technician
5. Click Assign

Expected Result:

- Job status becomes `Assigned`
- Technician is assigned to job
- Job appears in technician job list

Priority:

High

Automation Candidate:

Yes

---

### TC-DISP-002: Prevent overlapping technician time slot

Precondition:

- User is logged in as Admin
- Technician already has one assigned job at a specific date and time slot
- Another pending job exists with the same date and time slot

Steps:

1. Open Dispatch page
2. Select pending job
3. Select same technician
4. Click Assign

Expected Result:

- System displays `Technician already has a job in this time slot`
- Job is not assigned

Priority:

High

Automation Candidate:

Yes

---

### TC-STATUS-001: Technician starts assigned job

Precondition:

- User is logged in as Technician
- Assigned job exists

Steps:

1. Open Technician Job List
2. Open assigned job detail
3. Click Start Job

Expected Result:

- Job status becomes `In Progress`

Priority:

High

Automation Candidate:

Yes

---

### TC-STATUS-002: Technician completes in-progress job

Precondition:

- User is logged in as Technician
- Job status is `In Progress`

Steps:

1. Open job detail
2. Click Complete Job

Expected Result:

- Job status becomes `Completed`
- Invoice is generated

Priority:

High

Automation Candidate:

Yes

---

### TC-STATUS-003: Completed job cannot be cancelled

Precondition:

- User is logged in as Admin
- Job status is `Completed`

Steps:

1. Open completed job detail
2. Attempt to cancel job

Expected Result:

- System displays `Invalid job status transition`
- Job remains `Completed`

Priority:

High

Automation Candidate:

Yes

---

### TC-INV-001: Used part reduces inventory stock

Precondition:

- Technician is logged in
- Job status is `In Progress`
- Inventory item has enough stock

Test Data:

```text
item: Air Filter
quantity: 2
```

Steps:

1. Open technician job detail
2. Add used part
3. Complete job
4. Login as Admin
5. Open Inventory page

Expected Result:

- Air Filter stock decreases by 2

Priority:

High

Automation Candidate:

Yes

---

### TC-BILL-001: Completed job generates invoice

Precondition:

- Technician is logged in
- Job status is `In Progress`

Steps:

1. Complete job
2. Open invoice detail

Expected Result:

- Invoice is generated
- Invoice status is `Unpaid`
- Invoice contains service fee, VAT, and total

Priority:

High

Automation Candidate:

Yes

---

### TC-BILL-002: Invoice VAT is calculated correctly

Precondition:

- Completed job exists
- Invoice exists

Example:

```text
subtotal: 1200
VAT 7%: 84
total: 1284
```

Steps:

1. Open invoice detail
2. Check subtotal
3. Check VAT
4. Check total

Expected Result:

- VAT equals subtotal × 0.07
- Total equals subtotal + VAT

Priority:

High

Automation Candidate:

Yes

---

### TC-BILL-003: Mark invoice as paid

Precondition:

- User is logged in as Admin
- Unpaid invoice exists

Steps:

1. Open invoice detail
2. Click Mark as Paid

Expected Result:

- Invoice status becomes `Paid`
- Receipt number is generated
- Paid invoice cannot be marked as paid again

Priority:

High

Automation Candidate:

Yes

---

## 18. State Transition Matrix

| Current Status | Pending | Assigned | In Progress | Completed | Cancelled |
|---|---:|---:|---:|---:|---:|
| Pending | No | Yes | No | No | Yes |
| Assigned | No | No | Yes | No | Yes |
| In Progress | No | No | No | Yes | No |
| Completed | No | No | No | No | No |
| Cancelled | No | No | No | No | No |

Notes:

- `Pending → Assigned` happens when admin assigns a technician.
- `Pending → Cancelled` happens when admin cancels before assignment.
- `Assigned → In Progress` happens when technician starts the job.
- `Assigned → Cancelled` happens when admin cancels before job starts.
- `In Progress → Completed` happens when technician completes the job.
- `Completed` and `Cancelled` are terminal states.

---

## 19. Decision Table - Pricing

| Case | Service Type | Units | Priority | Parts Cost | Service Fee | Urgent Surcharge | Subtotal | VAT 7% | Total |
|---|---|---:|---|---:|---:|---:|---:|---:|---:|
| DT-PRICE-001 | Cleaning | 1 | Normal | 0 | 600 | 0 | 600 | 42 | 642 |
| DT-PRICE-002 | Cleaning | 2 | Urgent | 0 | 1200 | 300 | 1500 | 105 | 1605 |
| DT-PRICE-003 | Repair | 1 | Normal | 250 | 300 | 0 | 550 | 38.5 | 588.5 |
| DT-PRICE-004 | Installation | 2 | Urgent | 270 | 3000 | 300 | 3570 | 249.9 | 3819.9 |

Rules:

- Cleaning = 600 THB × units
- Repair = 300 THB inspection fee
- Installation = 1500 THB × units
- Urgent surcharge = 300 THB
- VAT = subtotal × 0.07
- Total = subtotal + VAT

---

## 20. Decision Table - Dispatch Assignment

| Case | Job Status | Technician Available | Same Slot Conflict | Can Assign | Expected Result |
|---|---|---|---|---|---|
| DT-DISP-001 | Pending | Yes | No | Yes | Job becomes Assigned |
| DT-DISP-002 | Pending | Yes | Yes | No | Show conflict error |
| DT-DISP-003 | Assigned | Yes | No | Yes | Job is reassigned |
| DT-DISP-004 | Assigned | Yes | Yes | No | Show conflict error |
| DT-DISP-005 | In Progress | Yes | No | No | Block reassignment |
| DT-DISP-006 | Completed | Yes | No | No | Block reassignment |
| DT-DISP-007 | Cancelled | Yes | No | No | Block reassignment |

---

## 21. Boundary Value Analysis

### Customer Phone Number

| Case | Value | Expected |
|---|---|---|
| BVA-PHONE-001 | 9 digits | Invalid |
| BVA-PHONE-002 | 10 digits | Valid |
| BVA-PHONE-003 | 11 digits | Invalid |

### Customer Name Length

| Case | Value | Expected |
|---|---|---|
| BVA-NAME-001 | 1 character | Invalid |
| BVA-NAME-002 | 2 characters | Valid |
| BVA-NAME-003 | 50 characters | Valid |
| BVA-NAME-004 | 51 characters | Invalid |

### Number of Units

| Case | Value | Expected |
|---|---:|---|
| BVA-UNIT-001 | 0 | Invalid |
| BVA-UNIT-002 | 1 | Valid |
| BVA-UNIT-003 | 5 | Valid |
| BVA-UNIT-004 | 6 | Invalid |

### Stock Adjustment

| Case | Value | Expected |
|---|---:|---|
| BVA-STOCK-001 | -1 | Invalid |
| BVA-STOCK-002 | 0 | Invalid |
| BVA-STOCK-003 | 1 | Valid |
| BVA-STOCK-004 | More than available stock out | Invalid |

---

## 22. Risk-Based Testing

| Risk Area | Risk Level | Reason | Priority |
|---|---|---|---|
| Job status transition | High | Wrong status can break the whole workflow | P1 |
| Technician assignment conflict | High | Double booking causes real operation failure | P1 |
| Invoice calculation | High | Wrong money calculation affects business trust | P1 |
| Inventory stock deduction | High | Wrong stock affects operation and cost | P1 |
| Role-based access | High | Unauthorized access can expose data | P1 |
| Customer data validation | Medium | Invalid customer data affects job operation | P2 |
| Dashboard summary | Medium | Wrong metrics can mislead admin | P2 |
| Search/filter | Low | Helpful but not critical to core workflow | P3 |
| UI layout | Low | Cosmetic issue unless it blocks usability | P3 |

Testing priority:

1. Auth and role access
2. Customer and job creation
3. Technician assignment
4. Job status transition
5. Invoice calculation
6. Inventory stock deduction
7. Dashboard summary
8. Search/filter

---

## 23. Bug Report Samples

### BUG-001: Technician can complete job without starting it

Environment:

```text
Local development
Browser: Chromium
Frontend: http://localhost:5173
API: http://localhost:4000/api
```

Precondition:

- Technician is logged in
- Job status is `Assigned`

Steps to Reproduce:

1. Open technician job detail page
2. Observe the Complete Job button
3. Click Complete Job

Expected Result:

- Complete Job button should be hidden or disabled
- API should reject the action
- Job must remain `Assigned`

Actual Result:

- System allows technician to complete job directly from `Assigned`

Severity:

High

Priority:

P1

Reason:

This breaks the required job lifecycle and skips the `In Progress` state.

---

### BUG-002: Invoice VAT excludes used parts cost

Environment:

```text
Local development
Browser: Chromium
```

Precondition:

- Completed job exists
- Job has used parts

Steps to Reproduce:

1. Open invoice detail page
2. Check service fee
3. Check parts cost
4. Check subtotal
5. Check VAT

Expected Result:

- VAT should be calculated from service fee + urgent surcharge + parts cost

Actual Result:

- VAT is calculated from service fee only

Severity:

High

Priority:

P1

Reason:

This causes incorrect invoice total.

---

### BUG-003: Admin can assign same technician to overlapping time slot

Environment:

```text
Local development
Browser: Chromium
```

Precondition:

- Technician already has an assigned job on selected date and time slot
- Another pending job exists on the same date and time slot

Steps to Reproduce:

1. Open Dispatch page
2. Select pending job
3. Select same technician
4. Select same date and time slot
5. Click Assign

Expected Result:

- System should show `Technician already has a job in this time slot`
- Job should not be assigned

Actual Result:

- System assigns technician to both jobs

Severity:

High

Priority:

P1

Reason:

This causes technician double booking.

---

### BUG-004: Low stock badge does not appear when stock equals safety stock

Environment:

```text
Local development
Browser: Chromium
```

Precondition:

- Inventory item stock equals safety stock

Steps to Reproduce:

1. Open Inventory page
2. Find item where stock equals safety stock

Expected Result:

- Low Stock badge should appear when stock <= safetyStock

Actual Result:

- Low Stock badge appears only when stock < safetyStock

Severity:

Medium

Priority:

P2

Reason:

System misses low stock alert at the defined threshold.

---

### BUG-005: Technician can access admin customer page by direct URL

Environment:

```text
Local development
Browser: Chromium
```

Precondition:

- Technician is logged in

Steps to Reproduce:

1. Login as technician
2. Open `/admin/customers` directly in browser

Expected Result:

- System should block access and redirect technician to `/tech/jobs`

Actual Result:

- Technician can view admin customer page

Severity:

High

Priority:

P1

Reason:

This violates role-based access control.

---

## 24. Traceability Matrix

| Requirement ID | Requirement | Test Case ID | Automation |
|---|---|---|---|
| FR-AUTH-001 | Valid admin credentials redirect to admin dashboard | TC-AUTH-001 | Candidate |
| FR-AUTH-002 | Valid technician credentials redirect to technician job list | TC-AUTH-002 | Candidate |
| FR-AUTH-003 | Invalid credentials are rejected | TC-AUTH-003 | Candidate |
| FR-AUTH-005 | Technician cannot access admin pages | SC-AUTH-005 | Candidate |
| FR-CUS-002 | Admin can create or update valid customer data | TC-CUS-001 | Candidate |
| FR-CUS-003 | Customer phone and required fields are validated | TC-CUS-002 | Candidate |
| FR-JOB-001 | Job without technician becomes Pending | TC-JOB-001 | Candidate |
| FR-JOB-002 | Job with technician becomes Assigned | TC-JOB-002 | Candidate |
| FR-JOB-003 | Past date and invalid unit count are rejected | TC-JOB-003, TC-JOB-004 | Candidate |
| FR-DISP-001 | Admin can assign a pending job | TC-DISP-001 | Candidate |
| FR-DISP-002 | Technician cannot have two jobs in the same slot | TC-DISP-002 | Candidate |
| FR-TECH-002 | Technician starts and completes jobs through valid states | TC-STATUS-001, TC-STATUS-002 | Candidate |
| FR-STAT-002 | Completed job is terminal | TC-STATUS-003 | Candidate |
| FR-INV-004 | Used parts reduce inventory stock exactly once | TC-INV-001 | Candidate |
| FR-BILL-001 | Completed job generates one invoice | TC-BILL-001 | Candidate |
| FR-BILL-002 | Invoice VAT and total follow pricing rules | TC-BILL-002 | Candidate |
| FR-BILL-003 | Admin can pay an invoice exactly once | TC-BILL-003 | Candidate |

This matrix is a starting point for requirement analysis. The QA learner should
add coverage for untraced requirements, assign test levels, and replace
`Candidate` with the implemented automation status.

---

## 25. Suggested Future Playwright Architecture (QA Learner Owned)

This section is guidance for the QA learning phase. The initial SUT delivery does
not install Playwright or create any of the files described below.

### 25.1 UI Test Structure

Use Page Object Model.

Page objects should contain:

```text
locators
actions
assertions
```

Example:

```ts
export class LoginPage {
  constructor(private page: Page) {}

  emailInput = this.page.getByTestId('login-email-input');
  passwordInput = this.page.getByTestId('login-password-input');
  submitButton = this.page.getByTestId('login-submit-button');

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

---

### 25.2 API Test Structure

Use Playwright request context.

Create helper:

```text
tests/helpers/apiClient.ts
```

Functions:

```text
resetTestData()
loginAsAdmin()
loginAsTechnician()
createCustomer()
createJob()
assignTechnician()
updateJobStatus()
getInventory()
generateInvoice()
payInvoice()
```

---

### 25.3 Test Stability Rules

Use these rules:

```text
Use data-testid for important elements
Reset API data before each test
Avoid depending on test order
Avoid hardcoded current dates
Use helper to generate tomorrow/yesterday dates
Avoid testing too many things in one test
Keep assertions clear
```

---

## 26. Suggested UI Automation Backlog

These scenarios are candidates, not development-delivery acceptance criteria.
The QA learner decides the final coverage and implements the framework and tests.

Suggested portfolio target after learning the framework: 20 UI tests.

### Auth

- [ ] AUTH_UI_001 login success as admin
- [ ] AUTH_UI_002 login success as technician
- [ ] AUTH_UI_003 invalid login shows error
- [ ] AUTH_UI_004 unauthenticated user redirects to login
- [ ] AUTH_UI_005 technician cannot access admin page

### Customer

- [ ] CUS_UI_001 create customer with valid data
- [ ] CUS_UI_002 required fields show validation errors
- [ ] CUS_UI_003 phone less than 10 digits shows error
- [ ] CUS_UI_004 search customer by phone

### Job

- [ ] JOB_UI_001 create pending job without technician
- [ ] JOB_UI_002 create assigned job with technician
- [ ] JOB_UI_003 cannot create job with past date
- [ ] JOB_UI_004 number of units must be between 1 and 5

### Dispatch

- [ ] DISP_UI_001 assign technician to pending job
- [ ] DISP_UI_002 prevent overlapping technician time slot
- [ ] DISP_UI_003 completed job cannot be reassigned

### Technician

- [ ] TECH_UI_001 technician sees assigned job
- [ ] TECH_UI_002 technician starts assigned job
- [ ] TECH_UI_003 technician completes in-progress job

### Invoice / Inventory

- [ ] BILL_UI_001 completed job generates invoice
- [ ] BILL_UI_002 invoice VAT is calculated correctly
- [ ] BILL_UI_003 mark invoice as paid
- [ ] INV_UI_001 used part reduces stock
- [ ] INV_UI_002 low stock alert appears

---

## 27. Suggested API Automation Backlog

These scenarios are candidates, not development-delivery acceptance criteria.

Suggested portfolio target after learning the framework: 15 API tests.

### Auth

- [ ] AUTH_API_001 login success returns token and user
- [ ] AUTH_API_002 invalid login returns 401

### Customer

- [ ] CUS_API_001 create customer success
- [ ] CUS_API_002 create customer with invalid phone returns 400
- [ ] CUS_API_003 get customer by ID returns 200
- [ ] CUS_API_004 get unknown customer returns 404

### Job

- [ ] JOB_API_001 create pending job success
- [ ] JOB_API_002 create assigned job success
- [ ] JOB_API_003 create job with past date returns 400
- [ ] JOB_API_004 assign technician success
- [ ] JOB_API_005 assign technician with schedule conflict returns 400
- [ ] JOB_API_006 invalid status transition returns 400

### Inventory

- [ ] INV_API_001 stock out success
- [ ] INV_API_002 stock cannot go below zero
- [ ] INV_API_003 low stock flag is true when stock <= safetyStock

### Invoice

- [ ] BILL_API_001 generate invoice for completed job
- [ ] BILL_API_002 invoice total includes VAT
- [ ] BILL_API_003 paid invoice cannot be paid again

---

## 28. Suggested Future GitHub Actions CI (QA Learner Owned)

The initial SUT delivery does not create this workflow. The following is a future
learning target after the QA learner has implemented stable automated tests.

Create:

```text
.github/workflows/playwright.yml
```

Workflow requirements:

```text
Run on push
Run on pull_request
Install dependencies
Install Playwright browsers
Build project
Start mock API and frontend
Run Playwright tests
Upload Playwright report
```

Example workflow:

```yaml
name: Playwright Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Build
        run: npm run build

      - name: Run Playwright tests
        run: npm run test

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## 29. README Requirements

README must include:

```text
Project overview
Why this project exists
Features
Tech stack
QA skills demonstrated
How to run locally
How to run developer tests
Demo accounts
Important disclaimer
Screenshots or GIF if available
CI badge only after the QA learner creates CI
```

README disclaimer:

```text
This project is a fictional QA Automation Portfolio project.
It is not a production SaaS system and does not contain real customer data, payment integration, GPS tracking, or production credentials.
The main purpose of this project is to demonstrate QA practices, UI automation, API testing, business rule testing, and CI integration.
```

---

## 30. Final Definition of Done

The project is portfolio-ready when all of these are true.

### Application

- [ ] App runs locally
- [ ] Mock API runs locally
- [ ] Login works
- [ ] Admin role works
- [ ] Technician role works
- [ ] Customer management works
- [ ] Job booking works
- [ ] Dispatch assignment works
- [ ] Job status flow works
- [ ] Inventory works
- [ ] Invoice/payment mock works

### Business Rules

- [ ] Past date is blocked
- [ ] AC unit boundary 1-5 works
- [ ] Technician time slot conflict is blocked
- [ ] Invalid status transitions are blocked
- [ ] Inventory cannot go below zero
- [ ] Low stock alert works
- [ ] VAT 7% calculation works
- [ ] Paid invoice cannot be paid again

### Initial SUT Verification

- [ ] Developer domain tests pass
- [ ] PostgreSQL migration, seed, and reset work
- [ ] Lint passes
- [ ] Type-check passes
- [ ] Production build passes
- [ ] No Playwright, QA API automation, load scripts, or CI/CD workflow is prebuilt

### Future QA Portfolio Milestones

- [ ] QA learner creates the test strategy and detailed test cases
- [ ] QA learner builds UI and API automation
- [ ] QA learner creates SQL validation queries
- [ ] QA learner designs an educational load test
- [ ] QA learner creates CI and optional CD

### Documentation

- [ ] README completed
- [ ] IMPLEMENTATION_PLAN.md completed
- [ ] Requirements included in this file
- [ ] Test plan included in this file
- [ ] Test scenarios included in this file
- [ ] Test cases included in this file
- [ ] State transition matrix included in this file
- [ ] Pricing decision table included in this file
- [ ] Risk-based testing included in this file
- [ ] Bug report samples included in this file
- [ ] Traceability matrix included in this file

### Code Quality

- [ ] TypeScript build passes
- [ ] No critical lint errors
- [ ] No exposed secrets
- [ ] No real customer data
- [ ] No production credentials
- [ ] Consistent naming
- [ ] Stable test selectors

---

## 31. Recommended Implementation Order

Build in this exact order:

```text
1. Project setup
2. Mock API seed/reset
3. Auth and role routing
4. Admin dashboard
5. Customer management
6. Job booking
7. Dispatch assignment
8. Job status flow
9. Technician job view
10. Inventory
11. Invoice/payment
12. Developer domain and transaction verification
13. README and QA handoff polish
```

Playwright, QA API automation, load testing, and CI/CD follow later as
QA-learner-owned portfolio milestones.

Do not start invoice, inventory, or dispatch before auth/customer/job foundation is stable.

---

## 32. Portfolio Positioning

When explaining this project in an interview, use this framing:

> I used an AI-assisted Home Service QA Demo as the System Under Test for my QA
> portfolio. I personally reviewed the requirements, designed the QA strategy and
> test cases, implemented and debugged the automation, validated API and database
> behavior, analyzed results, and built the CI/CD workflow.

Thai explanation:

> ผมใช้ Home Service QA Demo ที่พัฒนาร่วมกับ AI เป็น System Under Test สำหรับ
> QA Portfolio โดยผมเป็นผู้ review requirement, ออกแบบ QA strategy และ test case,
> เขียนและแก้ไข automation, ตรวจสอบ API/SQL, วิเคราะห์ผล และสร้าง CI/CD ด้วยตัวเอง

---

## 33. Important Scope Reminder

Do not turn this project into a full business.

The project is successful when it proves QA skill clearly.

The goal is not:

```text
Build a perfect SaaS.
```

The goal is:

```text
Build a realistic, testable, well-documented QA demo.
```

---

# Portfolio Core SUT Implementation Execution Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:subagent-driven-development` (recommended) or
> `superpowers:executing-plans` to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved PostgreSQL-backed Home Service System Under Test
without prebuilding the QA learner's automation, load-test, or CI/CD assets.

**Architecture:** A Vite React frontend calls an Express JSON API. The API owns
authorization and business rules and persists data in PostgreSQL. Critical
domain rules are pure functions; completing a job is a database transaction.

**Tech Stack:** Node.js 20+, npm, React, TypeScript, Vite, React Router, Express,
PostgreSQL, `pg`, Docker Compose, Vitest, ESLint, and plain CSS.

## Global Constraints

- UI labels, validation text, and API errors are English.
- Application date behavior uses `Asia/Bangkok`; money is THB.
- API success and error bodies follow the approved response envelopes.
- All mutable input is validated by the API.
- Every protected API enforces mock bearer authentication and role ownership.
- PostgreSQL owns relational integrity; transactional completion is atomic.
- Important UI controls and results have stable `data-testid` values.
- QA automation, SQL test scripts, load scripts, and CI/CD remain learner-owned.
- Committed developer tests cover domain rules and the completion transaction
  only; CRUD/UI verification remains manual to preserve the learning boundary.
- Keep documentation in this `IMPLEMENTATION_PLAN.md` and `README.md` only.
- Work on a feature branch or isolated worktree, never directly on `main`.

## File Responsibility Map

| Path | Responsibility |
|---|---|
| `shared/domain.ts` | Shared domain unions and API-safe entity types |
| `shared/api.ts` | Success/error envelope types |
| `server/config.ts` | Validated environment configuration |
| `server/app.ts` | Express composition without binding a port |
| `server/index.ts` | Process startup and graceful shutdown |
| `server/db/*` | Pool, migration, seed, reset, and transaction helpers |
| `server/middleware/*` | Authentication, authorization, errors, logging |
| `server/domain/*` | Pure transition, schedule, inventory, and pricing rules |
| `server/features/*` | Feature repositories, services, and thin routes |
| `src/api/client.ts` | Fetch wrapper, envelope parsing, and bearer token |
| `src/auth/*` | Session state and role-aware route guards |
| `src/components/*` | Reusable layout, feedback, badge, and dialog components |
| `src/features/*` | Focused route pages and feature API adapters |
| `src/styles/*` | Tokens, base rules, components, and page layouts |
| `server/developer-tests/*` | Approved developer rule/transaction tests only |

## Task 1: Tooling, Shared Contracts, and Pure Domain Rules

**Files:**

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `eslint.config.js`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `index.html`
- Create: `shared/domain.ts`
- Create: `shared/api.ts`
- Create: `server/domain/jobStatusRules.ts`
- Create: `server/domain/pricingRules.ts`
- Create: `server/domain/inventoryRules.ts`
- Create: `server/domain/schedulingRules.ts`
- Create: `server/developer-tests/jobStatusRules.test.ts`
- Create: `server/developer-tests/pricingRules.test.ts`
- Create: `server/developer-tests/inventoryRules.test.ts`
- Create: `server/developer-tests/schedulingRules.test.ts`

**Interfaces:**

- Produces:

```ts
export type UserRole = 'admin' | 'technician';
export type JobStatus =
  | 'Pending'
  | 'Assigned'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  technicianId?: string;
}

export interface CustomerInput {
  name: string;
  phone: string;
  address: string;
  acBrand?: string;
  btu: 9000 | 12000 | 18000 | 24000;
  acType: AcType;
  note?: string;
}

export interface CreateJobInput {
  customerId: string;
  serviceType: ServiceType;
  preferredDate: string;
  timeSlot: TimeSlot;
  technicianId?: string;
  numberOfUnits: number;
  priority: JobPriority;
  problemDescription?: string;
}

export interface JobFilters {
  status?: JobStatus;
  search?: string;
  date?: string;
  technicianId?: string;
}

export function canTransitionJobStatus(
  currentStatus: JobStatus,
  nextStatus: JobStatus,
): boolean;

export function getAllowedNextStatuses(status: JobStatus): JobStatus[];

export interface InvoiceCalculation {
  serviceFee: number;
  urgentSurcharge: number;
  partsCost: number;
  subtotal: number;
  vat: number;
  total: number;
}

export function calculateInvoice(
  job: Pick<Job, 'serviceType' | 'numberOfUnits' | 'priority' | 'usedParts'>,
  inventoryItems: InventoryItem[],
): InvoiceCalculation;

export function assertAvailableStock(
  usedParts: UsedPart[],
  inventoryItems: InventoryItem[],
): void;

export function hasScheduleConflict(
  candidate: Pick<Job, 'id' | 'technicianId' | 'preferredDate' | 'timeSlot'>,
  jobs: Job[],
): boolean;
```

- [ ] **Step 1: Create the npm and TypeScript configuration**

Use scripts:

```json
{
  "dev": "concurrently \"npm run dev:api\" \"npm run dev:web\"",
  "dev:web": "vite",
  "dev:api": "tsx watch server/index.ts",
  "db:migrate": "tsx server/db/migrate.ts",
  "db:seed": "tsx server/db/seed.ts",
  "db:reset": "tsx server/db/reset.ts",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "test:dev": "vitest run",
  "build": "npm run typecheck && vite build"
}
```

Install application dependencies `react`, `react-dom`, `react-router-dom`,
`express`, `cors`, `pg`, and `zod`. Install development dependencies for
TypeScript, Vite React, TSX, ESLint, Vitest, React/Express/CORS/PG types, and
`concurrently`.

- [ ] **Step 2: Define shared domain and envelope types**

`shared/api.ts` must export:

```ts
export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

export interface ApiFailure {
  message: string;
  code: string;
  fieldErrors?: Record<string, string>;
}
```

`shared/domain.ts` must contain every model and union from Section 8 without
database-only password fields in API-safe user objects. It also exports
`AuthenticatedUser`, `CustomerInput`, `CreateJobInput`, and `JobFilters` with the
exact shapes in the Interfaces block above.

- [ ] **Step 3: Write failing status-transition and schedule tests**

Cover every cell of the state matrix and these schedule cases:

```ts
it('conflicts only for same technician, date, slot, and active status');
it('does not conflict with the candidate job itself during reassignment');
it('does not conflict with Completed or Cancelled jobs');
```

Run:

```bash
npm run test:dev -- server/developer-tests/jobStatusRules.test.ts server/developer-tests/schedulingRules.test.ts
```

Expected: fail because rule modules do not yet export the required functions.

- [ ] **Step 4: Implement minimal transition and scheduling rules**

Use a readonly transition map and treat only Assigned/In Progress jobs as
conflict-producing. Re-run the two test files and expect all cases to pass.

- [ ] **Step 5: Write failing pricing and inventory tests**

Cover every pricing decision-table row, two-decimal rounding, low-stock equality,
missing inventory items, duplicate used parts, non-positive quantity, and
insufficient stock.

Run:

```bash
npm run test:dev -- server/developer-tests/pricingRules.test.ts server/developer-tests/inventoryRules.test.ts
```

Expected: fail because pricing/inventory functions do not exist.

- [ ] **Step 6: Implement minimal pricing and inventory rules**

Use integer-safe two-decimal rounding:

```ts
export const roundMoney = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;
```

Re-run all developer tests and expect them to pass.

- [ ] **Step 7: Verify and commit**

Run:

```bash
npm run lint
npm run typecheck
npm run test:dev
```

Commit:

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts vitest.config.ts eslint.config.js .gitignore .env.example index.html shared server/domain server/developer-tests
git commit -m "feat: establish domain rules and project tooling"
```

## Task 2: PostgreSQL Schema, Migration, Seed, and Reset

**Files:**

- Create: `docker-compose.yml`
- Create: `server/db/pool.ts`
- Create: `server/db/migrate.ts`
- Create: `server/db/seed.ts`
- Create: `server/db/reset.ts`
- Create: `server/db/transaction.ts`
- Create: `server/db/migrations/001_initial_schema.sql`
- Create: `server/config.ts`

**Interfaces:**

```ts
export const pool: Pool;
export async function withTransaction<T>(
  work: (client: PoolClient) => Promise<T>,
): Promise<T>;
export async function migrateDatabase(): Promise<void>;
export async function resetDatabase(): Promise<void>;
export function bangkokDate(offsetDays: number): string;
```

- [ ] **Step 1: Add local PostgreSQL and validated configuration**

Compose service name is `db`, host port is `5432`, database is
`home_service_qa`, and credentials come from `.env`. `.env.example` contains only
safe demo defaults. `server/config.ts` validates `DATABASE_URL`, `PORT`,
`WEB_ORIGIN`, and `NODE_ENV`.

- [ ] **Step 2: Write the complete initial schema migration**

Create the seven tables in Section 8.7. Include:

```sql
CREATE UNIQUE INDEX jobs_active_technician_slot_unique
ON jobs (technician_id, preferred_date, time_slot)
WHERE technician_id IS NOT NULL
  AND status IN ('Assigned', 'In Progress');

ALTER TABLE invoices
  ADD CONSTRAINT invoices_job_unique UNIQUE (job_id);
```

Use check constraints for enums, unit count `BETWEEN 1 AND 5`, non-negative
stock/money, positive used-part quantity, and customer field lengths.

- [ ] **Step 3: Implement migration and transaction helpers**

`migrateDatabase` maintains a `schema_migrations` table and applies each migration
once. `withTransaction` begins, commits, rolls back on error, and always releases
the client.

- [ ] **Step 4: Implement deterministic seed/reset**

Insert every Section 8.8 record using relative Bangkok dates. Reset truncates
application tables and inserts all seed records in one transaction. Seed
passwords match the documented demo accounts.

- [ ] **Step 5: Verify schema and seed manually**

Run:

```bash
docker compose up -d db
npm run db:migrate
npm run db:reset
docker compose exec -T db psql -U home_service -d home_service_qa -c "SELECT status, count(*) FROM jobs GROUP BY status ORDER BY status;"
docker compose exec -T db psql -U home_service -d home_service_qa -c "SELECT id, stock <= safety_stock AS low_stock FROM inventory_items ORDER BY id;"
```

Expected job counts: Pending 1, Assigned 1, In Progress 1, Completed 2,
Cancelled 1. Expected low-stock values: false, true, true, false.

- [ ] **Step 6: Commit**

```bash
git add docker-compose.yml .env.example server/config.ts server/db
git commit -m "feat: add deterministic PostgreSQL data lifecycle"
```

## Task 3: Express Foundation, Mock Authentication, and Authorization

**Files:**

- Create: `server/app.ts`
- Create: `server/index.ts`
- Create: `server/errors/AppError.ts`
- Create: `server/middleware/errorHandler.ts`
- Create: `server/middleware/authenticate.ts`
- Create: `server/middleware/requireRole.ts`
- Create: `server/middleware/requestLogger.ts`
- Create: `server/features/auth/authService.ts`
- Create: `server/features/auth/authRoutes.ts`
- Create: `server/features/health/healthRoutes.ts`
- Create: `server/features/test/testRoutes.ts`

**Interfaces:**

```ts
export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  technicianId?: string;
}

export interface AuthenticatedRequest extends Request {
  authUser?: AuthenticatedUser;
}

export function authenticate(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
): void;

export function requireRole(...roles: UserRole[]): RequestHandler;
```

- [ ] **Step 1: Compose the Express application**

Enable CORS for `WEB_ORIGIN`, JSON parsing, redacted request logging, `/api/health`,
feature routers, not-found handling, and the final error handler. `server/app.ts`
must not listen on a port so later transaction tests can import it safely.

- [ ] **Step 2: Implement mock login and bearer identity**

Login validates required fields, compares seeded credentials, and returns stable
role tokens from the approved login contract. `authenticate` resolves only those
stable tokens to current seeded users; no JWT or production-security claim is
added.

- [ ] **Step 3: Implement role middleware and normalized errors**

`AppError` carries `status`, `code`, `message`, and optional `fieldErrors`.
Unknown errors return `500` with code `INTERNAL_ERROR` without leaking a stack
outside development.

- [ ] **Step 4: Implement health and reset endpoints**

Health checks a database `SELECT 1`. Reset calls `resetDatabase()` only when
`NODE_ENV` is `development` or `test`; otherwise it throws `RESET_DISABLED`.

- [ ] **Step 5: Verify endpoints manually**

Run API and use:

```bash
curl -i http://localhost:4000/api/health
curl -i -X POST http://localhost:4000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@demo.com","password":"password123"}'
curl -i -X POST http://localhost:4000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@demo.com","password":"wrong"}'
curl -i -X POST http://localhost:4000/api/test/reset
```

Expected: `200`, `200`, `401 INVALID_CREDENTIALS`, and `200`.

- [ ] **Step 6: Verify and commit**

```bash
npm run lint
npm run typecheck
npm run test:dev
git add server
git commit -m "feat: add API foundation and mock authorization"
```

## Task 4: Customer and Dashboard APIs

**Files:**

- Create: `server/features/customers/customerSchemas.ts`
- Create: `server/features/customers/customerRepository.ts`
- Create: `server/features/customers/customerService.ts`
- Create: `server/features/customers/customerRoutes.ts`
- Create: `server/features/technicians/technicianRoutes.ts`
- Create: `server/features/dashboard/dashboardRepository.ts`
- Create: `server/features/dashboard/dashboardRoutes.ts`
- Modify: `server/app.ts`

**Interfaces:**

```ts
export interface CustomerInput {
  name: string;
  phone: string;
  address: string;
  acBrand?: string;
  btu: 9000 | 12000 | 18000 | 24000;
  acType: AcType;
  note?: string;
}

export interface DashboardSummary {
  totalJobsToday: number;
  pendingJobs: number;
  assignedJobs: number;
  completedJobs: number;
  unpaidInvoices: number;
  lowStockItems: number;
}
```

- [ ] **Step 1: Implement customer validation and repository queries**

Use parameterized SQL only. Search is case-insensitive over name and partial over
phone. Map snake_case rows to API camelCase at the repository boundary.

- [ ] **Step 2: Implement customer routes**

Add `GET /api/customers`, `GET /api/customers/:id`,
`POST /api/customers`, and `PATCH /api/customers/:id`. Apply authentication and
Admin role middleware before handlers.

- [ ] **Step 3: Implement technician reference and dashboard routes**

`GET /api/technicians` returns active technicians. Dashboard uses one
parameterized aggregate query or one transactionally consistent set of queries
and the low-stock `<=` boundary.

- [ ] **Step 4: Verify with curl and SQL**

Verify valid create returns `201`; a nine-digit phone returns
`400 VALIDATION_ERROR`; unknown ID returns `404`; Technician token receives
`403` for customer create; dashboard seed values match Section 11.1A.

- [ ] **Step 5: Verify and commit**

```bash
npm run lint
npm run typecheck
npm run test:dev
git add server/features server/app.ts
git commit -m "feat: add customer and dashboard APIs"
```

## Task 5: Job Booking, Dispatch, Ownership, and Status APIs

**Files:**

- Create: `server/features/jobs/jobSchemas.ts`
- Create: `server/features/jobs/jobRepository.ts`
- Create: `server/features/jobs/jobService.ts`
- Create: `server/features/jobs/jobRoutes.ts`
- Modify: `server/app.ts`

**Interfaces:**

```ts
export interface CreateJobInput {
  customerId: string;
  serviceType: ServiceType;
  preferredDate: string;
  timeSlot: TimeSlot;
  technicianId?: string;
  numberOfUnits: number;
  priority: JobPriority;
  problemDescription?: string;
}

export async function assignTechnician(
  jobId: string,
  technicianId: string,
): Promise<Job>;

export async function updateJobStatus(
  jobId: string,
  nextStatus: JobStatus,
  actor: AuthenticatedUser,
): Promise<{ job: Job; invoice?: Invoice }>;
```

- [ ] **Step 1: Implement job validation and list/detail queries**

Reject invalid enums, a past Bangkok date, unit count outside 1–5, unknown
customer/technician, and description over 500 characters. Admin list supports
status, search, date, and technician filters. Technician list/detail is always
scoped to the authenticated technician.

- [ ] **Step 2: Implement create and assignment services**

Creating without technician yields Pending; with technician yields Assigned.
Assignment uses a transaction and database unique-index protection. Translate
PostgreSQL unique violation to `TECHNICIAN_SCHEDULE_CONFLICT`.

- [ ] **Step 3: Implement role-aware status updates**

Admin may cancel Pending/Assigned. Technician may start or complete only an owned
job. Reuse `canTransitionJobStatus`; reject every other transition.

- [ ] **Step 4: Implement deterministic used-parts draft replacement**

`PUT /api/jobs/:id/used-parts` validates the complete collection, job ownership,
In Progress status, positive integer quantities, unique item IDs, known items,
and current availability. Replace rows in one transaction without deducting
stock.

- [ ] **Step 5: Verify high-risk cases manually**

Use curl plus SQL to verify Pending creation, Assigned creation, past date,
units 0/6, conflict on assigning `job-001` to `tech-001`, technician ownership,
Pending-to-Completed rejection, and Completed/Cancelled terminal behavior.

- [ ] **Step 6: Verify and commit**

```bash
npm run lint
npm run typecheck
npm run test:dev
git add server/features/jobs server/app.ts
git commit -m "feat: add job dispatch and status APIs"
```

## Task 6: Inventory, Invoice, and Atomic Completion APIs

**Files:**

- Create: `server/features/inventory/inventorySchemas.ts`
- Create: `server/features/inventory/inventoryRepository.ts`
- Create: `server/features/inventory/inventoryRoutes.ts`
- Create: `server/features/invoices/invoiceRepository.ts`
- Create: `server/features/invoices/invoiceService.ts`
- Create: `server/features/invoices/invoiceRoutes.ts`
- Create: `server/developer-tests/completeJob.test.ts`
- Modify: `server/features/jobs/jobService.ts`
- Modify: `server/app.ts`

**Interfaces:**

```ts
export async function completeJob(
  client: PoolClient,
  jobId: string,
  technicianId: string,
): Promise<{ job: Job; invoice: Invoice }>;

export async function payInvoice(
  invoiceId: string,
): Promise<Invoice>;
```

- [ ] **Step 1: Implement inventory list and adjustment**

Return computed `lowStock`. Accept only `type: 'in' | 'out'` and a positive
integer quantity. Perform adjustment in one SQL statement guarded against a
negative result; translate zero updated rows to the correct business error.

- [ ] **Step 2: Write the failing completion transaction tests**

Against a reset test database, prove:

```ts
it('completes job, deducts each part once, and creates one invoice atomically');
it('rolls back job, stock, and invoice when any part has insufficient stock');
it('rejects a second completion without duplicating stock deduction or invoice');
```

Run:

```bash
npm run test:dev -- server/developer-tests/completeJob.test.ts
```

Expected: fail because `completeJob` is not implemented.

- [ ] **Step 3: Implement transactional completion**

Use `SELECT ... FOR UPDATE` for job and inventory rows, verify ownership/status,
calculate invoice through the pure domain function, deduct stock, update job,
and insert invoice before commit. A retry of an already Completed job returns
`INVALID_STATUS_TRANSITION`; its existing stock and invoice remain unchanged.

- [ ] **Step 4: Re-run completion tests**

Expected: all atomicity, rollback, and idempotency cases pass.

- [ ] **Step 5: Implement invoice list/detail/generate/pay routes**

Admin list supports status filtering. Generate returns `201` for a new invoice
and `200` for an existing invoice. Pay uses a row lock, rejects a second payment,
sets `paid_at`, and creates a unique `RCP-YYYYMMDD-NNNN` receipt.

- [ ] **Step 6: Verify and commit**

Run full developer tests, lint, type-check, and manual curl/SQL checks for stock
boundary, VAT, payment, and duplicate payment.

```bash
git add server/features server/developer-tests server/app.ts
git commit -m "feat: add transactional inventory and invoicing"
```

## Task 7: Frontend Foundation, Authentication, and Role-Aware Layout

**Files:**

- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/api/client.ts`
- Create: `src/auth/AuthContext.tsx`
- Create: `src/auth/ProtectedRoute.tsx`
- Create: `src/auth/RoleGuard.tsx`
- Create: `src/components/AppLayout.tsx`
- Create: `src/components/Sidebar.tsx`
- Create: `src/components/PageHeader.tsx`
- Create: `src/components/StatusBadge.tsx`
- Create: `src/components/FeedbackBanner.tsx`
- Create: `src/components/ConfirmDialog.tsx`
- Create: `src/features/auth/LoginPage.tsx`
- Create: `src/features/system/NotFoundPage.tsx`
- Create: `src/styles/tokens.css`
- Create: `src/styles/base.css`
- Create: `src/styles/components.css`
- Create: `src/styles/pages.css`

**Interfaces:**

```ts
export interface AuthContextValue {
  user: AuthenticatedUser | null;
  token: string | null;
  login(email: string, password: string): Promise<AuthenticatedUser>;
  logout(): void;
}

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T>;
```

- [ ] **Step 1: Build the API client and session context**

The client reads `VITE_API_BASE_URL`, injects the bearer token, unwraps success
envelopes, and throws a typed `ApiClientError`. Auth stores token/user in
`localStorage` under versioned keys and clears invalid sessions.

- [ ] **Step 2: Build login and guards**

Add every Section 12.1 test ID. Empty fields show field-level validation. Role
guards redirect Admin to `/admin/dashboard`, Technician to `/tech/jobs`, and
unauthenticated users to `/login`.

- [ ] **Step 3: Build the desktop-first layout**

Use a restrained blue/teal field-service palette, persistent desktop sidebar,
tablet-collapsible navigation, visible current user/role, logout, accessible
focus styles, status badges, feedback banners, and confirmation dialog.

- [ ] **Step 4: Add route stubs using real layout components**

Register every route in Section 10. Each route stub states its page name only;
it must not simulate completed behavior.

- [ ] **Step 5: Verify manually**

Run web/API, verify Admin and Technician redirects, invalid login error, logout,
direct URL role protection, keyboard focus, and 1024px layout.

- [ ] **Step 6: Verify and commit**

```bash
npm run lint
npm run typecheck
npm run build
git add src index.html
git commit -m "feat: add authenticated role-aware application shell"
```

## Task 8: Admin Dashboard and Customer UI

**Files:**

- Create: `src/features/dashboard/dashboardApi.ts`
- Create: `src/features/dashboard/AdminDashboardPage.tsx`
- Create: `src/features/customers/customerApi.ts`
- Create: `src/features/customers/CustomerListPage.tsx`
- Create: `src/features/customers/CustomerDetailPage.tsx`
- Create: `src/features/customers/CustomerFormPage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/pages.css`

**Interfaces:**

```ts
export const customerApi: {
  list(search?: string): Promise<Customer[]>;
  get(id: string): Promise<Customer>;
  create(input: CustomerInput): Promise<Customer>;
  update(id: string, input: CustomerInput): Promise<Customer>;
};
```

- [ ] **Step 1: Implement dashboard cards**

Render all six required cards and test IDs. Provide loading, empty-safe,
unauthorized, and retryable error states.

- [ ] **Step 2: Implement customer list/detail**

Search submits on debounce or explicit submit without racing stale responses.
Rows link to details; detail links to edit. Render all documented test IDs.

- [ ] **Step 3: Implement shared create/edit customer form**

Client validation mirrors field rules for usability, sends canonical values,
maps `fieldErrors` back to controls, focuses the first error, and navigates to
detail after success.

- [ ] **Step 4: Verify manually**

Walk through valid create/edit, required fields, 9/10/11-digit phone boundaries,
name boundaries, BTU/type choices, search by name/phone, and API failure banner.

- [ ] **Step 5: Verify and commit**

```bash
npm run lint
npm run typecheck
npm run build
git add src/features/dashboard src/features/customers src/App.tsx src/styles/pages.css
git commit -m "feat: add dashboard and customer management UI"
```

## Task 9: Admin Job Booking, Detail, and Dispatch UI

**Files:**

- Create: `src/features/jobs/jobApi.ts`
- Create: `src/features/jobs/JobListPage.tsx`
- Create: `src/features/jobs/JobFormPage.tsx`
- Create: `src/features/jobs/JobDetailPage.tsx`
- Create: `src/features/dispatch/DispatchPage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/pages.css`

**Interfaces:**

```ts
export const jobApi: {
  list(filters: JobFilters): Promise<Job[]>;
  get(id: string): Promise<Job>;
  create(input: CreateJobInput): Promise<Job>;
  assign(jobId: string, technicianId: string): Promise<Job>;
  updateStatus(jobId: string, nextStatus: JobStatus): Promise<Job>;
};
```

- [ ] **Step 1: Implement job list and form**

Render status/search filters and all required test IDs. Date input minimum is
today in Bangkok. Technician is optional. Client validation covers required
fields, date, units 1–5, and description length.

- [ ] **Step 2: Implement job detail and cancellation**

Display customer, technician, status, appointment, problem, and invoice link.
Only Pending/Assigned show Cancel with confirmation. Pending shows assignment.

- [ ] **Step 3: Implement dispatch**

Date filters eligible Pending/Assigned jobs; selecting a job supplies its fixed
time slot. The UI chooses technician and submits assignment/reassignment. Show
conflict messages from the API and refresh the assignment table.

- [ ] **Step 4: Verify manually**

Walk through Pending and Assigned creation, past date, 0/6 units, search/filter,
job detail, assignment, conflict using seed jobs, reassignment, and cancellation.

- [ ] **Step 5: Verify and commit**

```bash
npm run lint
npm run typecheck
npm run build
git add src/features/jobs src/features/dispatch src/App.tsx src/styles/pages.css
git commit -m "feat: add job booking and dispatch UI"
```

## Task 10: Technician Workflow UI

**Files:**

- Create: `src/features/technician/technicianApi.ts`
- Create: `src/features/technician/TechnicianJobListPage.tsx`
- Create: `src/features/technician/TechnicianJobDetailPage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/pages.css`

**Interfaces:**

```ts
export const technicianApi: {
  listJobs(): Promise<Job[]>;
  getJob(id: string): Promise<Job>;
  startJob(id: string): Promise<Job>;
  replaceUsedParts(id: string, usedParts: UsedPart[]): Promise<Job>;
  completeJob(id: string): Promise<{ job: Job; invoice: Invoice }>;
};
```

- [ ] **Step 1: Implement owned job list/detail**

Render the Section 12.9/12.10 test IDs, customer/contact details, appointment,
status, used-parts draft, and only actions valid for the current state.

- [ ] **Step 2: Implement start and used-parts editing**

Starting requires confirmation. Used-parts controls support adding, changing,
and removing unique items locally before replacing the server draft. Show stock
availability without deducting it.

- [ ] **Step 3: Implement completion**

Completion requires confirmation, disables during request, renders insufficient
stock without losing the draft, and displays returned invoice summary on success.

- [ ] **Step 4: Verify manually**

Verify owned-only visibility, direct URL denial for another technician's job,
start, used-part validation, completion, insufficient-stock rollback, and no
actions on Cancelled/Completed jobs.

- [ ] **Step 5: Verify and commit**

```bash
npm run lint
npm run typecheck
npm run build
git add src/features/technician src/App.tsx src/styles/pages.css
git commit -m "feat: add technician service workflow UI"
```

## Task 11: Inventory and Invoice UI

**Files:**

- Create: `src/features/inventory/inventoryApi.ts`
- Create: `src/features/inventory/InventoryPage.tsx`
- Create: `src/features/invoices/invoiceApi.ts`
- Create: `src/features/invoices/InvoiceListPage.tsx`
- Create: `src/features/invoices/InvoiceDetailPage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/features/jobs/JobDetailPage.tsx`
- Modify: `src/styles/pages.css`

- [ ] **Step 1: Implement inventory table and adjustment form**

Render every required test ID, low-stock at equality, item selection, in/out,
positive integer quantity, success feedback, and negative-stock errors.

- [ ] **Step 2: Implement invoice list/detail/payment**

List supports status filtering. Detail renders each price component with
two-decimal THB formatting. Unpaid shows a confirmed Mark as Paid action; Paid
shows receipt and paid timestamp without an active payment button.

- [ ] **Step 3: Connect invoice links and dashboard refresh behavior**

Completed job detail links to its invoice. Navigating back to dashboard fetches
fresh values rather than relying on cached counts.

- [ ] **Step 4: Verify manually**

Verify stock in/out, zero/negative/overdraw input, both low-stock boundaries,
invoice calculations against decision table, payment, duplicate payment through
API, receipt, filters, job link, and dashboard counts.

- [ ] **Step 5: Verify and commit**

```bash
npm run lint
npm run typecheck
npm run build
git add src/features/inventory src/features/invoices src/features/jobs/JobDetailPage.tsx src/App.tsx src/styles/pages.css
git commit -m "feat: add inventory and invoice administration UI"
```

## Task 12: QA Handoff, Full Verification, and Documentation

**Files:**

- Create: `README.md`
- Modify: `IMPLEMENTATION_PLAN.md`
- Modify: `.env.example`

- [ ] **Step 1: Write exact local setup instructions**

README covers prerequisites, environment copy, Docker database start, install,
migrate/reset, dev start, demo accounts, developer verification commands,
architecture, feature list, limitations, and the approved AI-assistance
disclosure. It does not provide QA automation setup instructions.

- [ ] **Step 2: Verify a clean setup path**

From the documented commands, confirm PostgreSQL starts, migration/reset works,
API health is ready, and web login renders. Do not rely on uncommitted local
environment values.

- [ ] **Step 3: Run the full verification gate**

```bash
npm run db:reset
npm run lint
npm run typecheck
npm run test:dev
npm run build
```

Expected: every command exits `0`, with no failed tests or TypeScript/ESLint
errors.

- [ ] **Step 4: Perform the core workflow walkthrough**

Verify:

```text
Admin login
-> create customer
-> create Pending job
-> assign technician
-> Technician login
-> start job
-> add used part
-> complete job
-> Admin login
-> verify stock and invoice
-> mark invoice Paid
-> verify receipt and dashboard
```

Also verify invalid credentials, role denial, conflict, invalid status,
insufficient stock rollback, low-stock equality, duplicate invoice, and duplicate
payment.

- [ ] **Step 5: Reconcile documentation with delivered behavior**

Check every Must requirement in the Functional Requirement Catalogue against a
route, API, schema constraint, developer test, or walkthrough result. Update only
actual delivered commands/behavior and record any remaining gap explicitly.

- [ ] **Step 6: Commit**

```bash
git add README.md IMPLEMENTATION_PLAN.md .env.example
git commit -m "docs: complete SUT setup and QA handoff"
```
