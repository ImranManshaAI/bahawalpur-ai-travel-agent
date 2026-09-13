# Double-Decker Bus Booking System — Backend Plan
### Owner: Developer A (Backend, Database, Concurrency, AI Assistant)
### Companion to `DDBus_SDD.docx`

Your complete responsibility map, step 0 to final handover. Anything not listed here belongs to `FRONTEND_PLAN.md`. **🔗 = integration checkpoint** — your partner's work depends on this being done and stable.

The single most important thing in this whole plan is Section 3 (seat holds) and Section 5 (atomic confirmation). Everything else is standard CRUD; those two are where this project actually succeeds or fails.

---

## Phase 0 — Foundation

### Joint session (with your partner, not solo)
- [ ] Agree on the API contract for every endpoint below — request/response shapes — before writing implementation code.
- [ ] Agree on error response shape (e.g. always `{data, error}`).
- [ ] Agree on git workflow: feature branches, PR review before merge.

### Your solo setup
- [ ] Create a Supabase project. Build the schema from SDD Section 8: `schedule_instances`, `seats`, `bookings`, `payment_proofs`.
- [ ] Add a **unique constraint** on `seats (schedule_instance_id, seat_number)` — this is your first real defense against duplicate seat rows, not just an app-level assumption.
- [ ] FastAPI skeleton: `/routers`, `/models`, `/schemas`, `/services`, `/core`.
- [ ] Connect FastAPI to Supabase Postgres via SQLAlchemy (or your preferred ORM/driver), confirm a test query works.
- [ ] Set up Supabase Storage bucket for payment-proof screenshots.
- [ ] `.env.example` listing every variable: `DATABASE_URL`, `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`, `JWT_SECRET`.
- [ ] `GET /health` endpoint.

**✅ Done when:** `/health` runs and returns success; schema exists in Supabase with the unique seat constraint in place.

**🔗 Checkpoint:** Share the backend URL with your partner.

---

## Phase 1 — Schedules & Seat Inventory

- [ ] `POST /admin/schedules` — create a schedule instance (date + timing slot).
- [ ] On schedule creation, auto-generate the full seat inventory for that instance (upper + lower deck, all seats `status = available`) — seats are real rows, never a count.
- [ ] `GET /schedules?date=` — list available timing slots for a date, with live seat counts per slot.
- [ ] `GET /schedules/{id}/seats` — full seat map for one schedule instance (seat number, deck, status).
- [ ] `PATCH /admin/schedules/{id}` — open/close a schedule instance.

**🔗 Checkpoint:** Schedule/seat endpoints live — partner starts building the date/timing selection UI and seat map UI against real data.

---

## Phase 2 — Seat Holds (the critical section — SDD Section 7)

- [ ] `POST /bookings/hold` — attempt to place a temporary hold on a set of requested seats for a schedule instance.
- [ ] Implement this as **one database transaction** that either locks the rows (`SELECT ... FOR UPDATE`) or performs a conditional `UPDATE ... WHERE status = 'available'` and verifies the affected row count matches the number of seats requested.
- [ ] If any requested seat can't be secured, the **entire hold attempt fails** — no partial holds left behind.
- [ ] On success, set `status = 'held'` and `hold_expires_at = now() + N minutes` on each secured seat.
- [ ] Implement expiry: check and release expired holds lazily (whenever a seat is read) and/or via a periodic job — either is fine, but an expired hold must never be treated as valid.
- [ ] **Write a concurrency test now, before moving on:** fire two simultaneous hold requests for the same seat (e.g. a small script using `asyncio`/threads, or even two terminal `curl` calls fired at once) and confirm exactly one succeeds. Do not consider this phase done without having actually run this test.

**✅ Phase 2 Definition of Done:** Concurrent hold requests for the same seat are provably safe — you've tested it, not just reasoned about it.

**🔗 Checkpoint:** Hold endpoint live and concurrency-tested — partner wires the seat map's selection interaction to it.

---

## Phase 3 — Booking Creation & Payment Proof

- [ ] `POST /bookings` — creates a booking record (`status = pending_payment`) referencing the held seats, calculates `total_price` server-side (seats × price-per-seat — **never** accept a price from the request body).
- [ ] `POST /bookings/{id}/payment-proof` — accepts a screenshot upload, stores it in Supabase Storage, creates a `payment_proofs` row (`status = pending_verification`).
- [ ] `GET /bookings/status?ref=` or `?phone=` or `?email=` — public lookup returning date, timing, seats, amount, payment status, booking status.

**🔗 Checkpoint:** Booking + proof-upload endpoints live — partner builds the booking form and screenshot upload UI.

---

## Phase 4 — Admin Verification (Atomic Confirmation — SDD Section 4.5 & 7)

- [ ] `GET /admin/payment-proofs?status=pending_verification` — queue for admin review, with full booking context joined in (visitor details, reference, date, timing, seats, amount, screenshot URL).
- [ ] `POST /admin/payment-proofs/{id}/confirm` — **this is the most important endpoint in the system.** As a single database transaction:
  - Mark the payment proof `confirmed`
  - Mark the booking `confirmed`
  - Mark all its seats `booked` (permanent, no longer just held)
  - If any part fails, the whole transaction rolls back — never leave the system in a state where payment is confirmed but seats aren't booked, or vice versa.
- [ ] `POST /admin/payment-proofs/{id}/reject` — marks proof `rejected`, booking stays unconfirmed, releases its seats back to `available`.
- [ ] `GET /admin/bookings?date=&status=` — filterable list for the admin panel.

**🔗 Checkpoint:** Confirm/reject endpoints live — partner builds the admin payment-review UI.

---

## Phase 5 — AI Assistant (Optional)

- [ ] Define tools for Gemini function calling, each mapping directly to an existing endpoint above — never a separate code path with its own data logic: `check_availability`, `get_seat_map`, `create_booking_hold`, `submit_booking`, `get_booking_status`.
- [ ] `POST /agent/chat` — receives a message, runs the Gemini function-calling loop, executes whichever tool is requested against the real backend logic, returns the reply.
- [ ] Test explicitly that the assistant cannot answer availability/pricing/status questions without actually calling a tool — if it ever states a transactional fact without a tool call in the trace, that's a bug per SDD Section 4.8.

**🔗 Checkpoint:** `/agent/chat` live — partner wires the optional chat widget to it.

---

## Phase 6 — Hardening

- [ ] Re-run the Phase 2 concurrency test at higher load (e.g. 10+ simultaneous requests for a small pool of seats) — confirm exactly the right number succeed and no seat is double-booked.
- [ ] Edge cases: booking the last seat, expired-hold cleanup actually releasing seats correctly, rejecting a payment correctly freeing seats.
- [ ] Admin auth: confirm all `/admin/*` endpoints are properly protected.
- [ ] Review and fix any bugs surfaced by your partner's end-to-end testing.

**✅ Phase 6 Definition of Done:** The concurrency guarantee in SDD Section 5 holds under real simulated load, not just single-request testing.

---

## Final Handover Checklist
- [ ] All endpoints documented (even a simple table in a README is enough).
- [ ] Production credentials handed to a TDCP-owned account, not personal ones.
- [ ] Confirm with your partner that every transactional value the AI assistant can state is traced to a real tool call, per SDD Section 4.8.
