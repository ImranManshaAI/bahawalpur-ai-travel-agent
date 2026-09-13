# AGENTS.md

## Project

Project name: Bahawalpur AI Travel Agent

This repository contains the backend for the TDCP Double-Decker Bus
Booking & Reservation System.

The frontend is handled by another developer/partner.

Your responsibility is backend development only.

---

## Authoritative Project Documents

Before implementing any feature, use these documents as the source of truth:

1. `DDBus_SDD.docx`
2. `database/final_schema.sql`
3. `BACKEND_PLAN.md`
4. `FRONTEND_PLAN.md`

Authority rules:

- `DDBus_SDD.docx` is authoritative for product scope and functional
  requirements.
- `database/final_schema.sql` is authoritative for the actual database
  structure, constraints, indexes, triggers, functions, and transaction
  behavior.
- `BACKEND_PLAN.md` is authoritative for the backend implementation roadmap
  and phase order.
- `FRONTEND_PLAN.md` is integration context only.

Do not invent requirements that conflict with these documents.

Do not silently redesign the database.

If requirements appear contradictory or ambiguous, STOP and report the issue.
Do not guess.

---

## Critical Scope

This project is specifically a:

TDCP Double-Decker Bus Booking & Reservation System.

It is NOT a general tourism marketplace.

Do not introduce unrelated functionality such as:

- hotels
- restaurants
- generic tourism products
- event booking
- loyalty systems
- mobile applications
- unrelated destination discovery
- a large general-purpose AI travel planner

The AI assistant is only a backend-integrated assistant for the
supported booking system.

It must never invent transactional information.

---

## Backend Responsibility

Backend responsibilities include:

- FastAPI application
- PostgreSQL/Supabase integration
- schedule management
- schedule-specific seat inventory
- seat availability
- temporary seat holds
- booking creation
- server-side pricing
- payment proof handling
- admin payment verification
- visitor booking status lookup
- authentication/authorization where required
- concurrency protection
- database transactions
- API contracts
- backend testing
- Gemini or OpenRouter or Groq or OpenAI/function-calling integration
- production/deployment readiness

Do not modify frontend implementation unless explicitly requested.

---

# Development Workflow

## IMPORTANT: Do Not Build the Entire Backend at Once

Development MUST follow `BACKEND_PLAN.md`.

The phase numbering and phase definitions in `BACKEND_PLAN.md` are
authoritative.

Do NOT create a separate competing roadmap in this file.

For each phase:

1. Read the relevant requirements.
2. Inspect only the relevant existing code.
3. Identify dependencies and risks.
4. Create a concise implementation plan.
5. Do not modify files while planning.
6. Wait for approval if planning interactively.
7. Implement only the approved phase.
8. Run appropriate tests.
9. Review the Git diff.
10. Report what changed and what was verified.
11. STOP.

Do not automatically continue into the next phase.

---

# Database Rules

`database/final_schema.sql` is the authoritative schema.

IMPORTANT:

The current `database/final_schema.sql` was exported from the LIVE Supabase
database using `pg_dump --schema-only`.

It is NOT the old incomplete copied SQL file.

Before claiming that a table, function, trigger, constraint, or index does not
exist, inspect `database/final_schema.sql`.

The current schema includes, among other things:

- `booking_holds`
- `bookings`
- `booking_seats`
- `seats`
- `schedule_instances`
- `payment_proofs`

The schema also includes database functions for:

- `create_seat_hold`
- `create_booking_from_hold`
- `confirm_whole_bus_booking`
- `reject_whole_bus_booking`
- `release_seat_hold`
- `expire_stale_holds`
- `generate_seats_for_schedule`

It also includes relevant triggers and indexes.

Do not recreate these functions in application code unless there is an
explicit architectural reason and approval.

Prefer calling the authoritative database functions from FastAPI where
appropriate.

Do not modify the database schema unless explicitly requested.

---

# Database Consistency

Critical business rules must be enforced by the database and backend,
not by the frontend.

In particular:

- Seat uniqueness must be preserved.
- Each schedule instance must have its own seat inventory.
- Two visitors must never successfully reserve the same seat for the same
  schedule instance.
- Temporary holds must expire correctly.
- Booking creation must respect the hold lifecycle.
- Pricing must be calculated according to the authoritative database logic.
- Payment confirmation must be atomic.
- Payment rejection must release the appropriate seats.
- Failed transactions must not leave partial booking state.

Never rely on frontend validation for these rules.

---

# Concurrency

Seat reservation is a critical concurrency requirement.

Do NOT implement reservation using an unsafe:

1. SELECT
2. check availability
3. UPDATE

pattern without transactional protection.

Use the locking/transaction mechanisms already provided by the authoritative
database functions and schema.

Seat-hold operations must be all-or-nothing.

Concurrent/conflicting requests must be tested before considering the
seat-hold implementation complete.

---

# Pricing

Pricing is server-side.

Never trust a client-provided total price.

Do not invent pricing rules.

Use the authoritative pricing behavior defined by the database schema and
project documents.

If pricing requirements are ambiguous, STOP and report the ambiguity.

---

# Existing Backend

Existing code is implementation context, NOT the source of truth.

Before changing existing code:

1. Inspect it.
2. Determine what is reusable.
3. Preserve working behavior where possible.
4. Change only what is necessary for the current approved phase.

Do not rewrite the backend unnecessarily.

Current backend is under:

`backend/`

---

# API Rules

The backend is the source of truth.

Do not trust frontend input for:

- seat availability
- seat state
- price
- booking state
- payment state

Validate all request data on the backend.

Use consistent API response structures.

Do not break an existing API contract without an explicit reason.

When changing an API contract, clearly identify:

- old behavior
- new behavior
- reason
- affected frontend integration

---

# Security

Never expose or commit:

- `.env`
- API keys
- Supabase secret/service credentials
- JWT secrets
- database passwords
- private credentials

Never print secrets in logs.

Use `.env.example` for variable names only.

Payment proof files must remain private.

Do not trust uploaded filenames or MIME types blindly.

Validate uploaded files appropriately.

---

# Dependencies

Use the existing Python/`uv` environment.

Do not replace `uv` with Conda or another environment manager.

Before adding a dependency:

1. Check whether the existing project already provides the capability.
2. Add a dependency only when actually required.
3. Prefer established, maintained libraries.
4. Explain why the dependency is needed.

Do not add speculative dependencies.

---

# Testing

Every implemented phase must be verified.

Use appropriate testing for the feature, including where applicable:

- unit tests
- integration tests
- API tests
- database verification
- transaction tests
- concurrency tests

Do not claim something works without verification.

Do not remove tests simply to make a test suite pass.

---

# File Changes

Keep changes focused.

Do not create unnecessary:

- backup files
- temporary files
- duplicate implementations
- unused utilities
- speculative abstractions

Do not modify unrelated files.

Before finishing a phase, review:

```bash
git diff

# Git

Never perform destructive Git operations.

Never:

force push
reset unrelated work
delete branches
overwrite uncommitted user changes

Keep commits logically grouped by completed phase when requested.

# Web Research

Use web research only when it materially improves implementation.

Prefer official documentation for:

FastAPI
PostgreSQL
Supabase
Gemini API
deployment platforms

Do not perform broad unnecessary research.

Important Existing Database Fact

A previous analysis incorrectly concluded that the booking-hold infrastructure
was missing.

That conclusion was incorrect.

The live Supabase schema has already been verified and exported to:

database/final_schema.sql

Therefore, do NOT report the following as missing without first inspecting
the current schema:

booking_holds
bookings.hold_id
bookings.booking_type
seats.hold_id
seats.hold_expires_at
booking_seats
create_seat_hold
create_booking_from_hold
confirm_whole_bus_booking
reject_whole_bus_booking
generate_seats_for_schedule

Treat the current SQL export as authoritative evidence.

Communication

When working interactively, use:

Result Summary

What was completed.

Confirmed

What was verified.

Changes

Which files/functions changed and why.

Testing

What was tested and the result.

Remaining

What remains for the current approved phase.

Then STOP.

Do not start another phase automatically.

# Most Important Rule

The objective is NOT to generate the largest amount of code.

The objective is to build a correct, maintainable, production-ready backend
that strictly follows:

DDBus_SDD.docx
database/final_schema.sql
BACKEND_PLAN.md
approved implementation decisions

Do not guess.

Do not silently redesign.

Do not over-engineer.

Do not build ahead of the approved phase.