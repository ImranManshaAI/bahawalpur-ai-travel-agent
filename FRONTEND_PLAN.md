# Double-Decker Bus Booking System — Frontend Plan
### Owner: Developer B (Visitor Booking Flow, Admin Panel, UI)
### Companion to `DDBus_SDD.docx`

Your complete responsibility map, step 0 to final handover. Anything not listed here belongs to `BACKEND_PLAN.md`. **🔗 = integration checkpoint** — build against a mock matching the agreed contract until each one is hit, so you're never blocked waiting.

---

## Phase 0 — Foundation

### Joint session (with your partner, not solo)
- [ ] Agree on the API contract for every endpoint before writing code.
- [ ] Agree on error response shape.
- [ ] Agree on git workflow: feature branches, PR review before merge.

### Your solo setup
- [ ] `npx create-next-app` with Tailwind. Folder structure: `/app`, `/components`, `/lib` (API client), `/mocks`.
- [ ] Build a small API client wrapper (`lib/api.ts`) — one place all backend calls go through, so swapping mocks for the real backend later is a one-file change.
- [ ] Once your partner shares the backend URL, confirm `/health` works from the app.

**✅ Done when:** App runs locally, successfully calls `/health`.

---

## Phase 1 — Bus Info, Date & Timing Selection

- [ ] Create `/mocks/schedules.json` matching the agreed contract (date, timing slots, live seat counts per slot).
- [ ] Landing page: route info, timings, pricing, tour details.
- [ ] Date picker component.
- [ ] Timing slot selection UI — showing each slot's live seat availability once wired to real data.

**🔗 Checkpoint:** `/schedules` endpoints go live — swap mocks for real calls in `lib/api.ts`.

---

## Phase 2 — Seat Map (the most involved UI in the project)

- [ ] Build the visual upper-deck / lower-deck seat map component. Each seat renders its real state: available, held, booked, reserved — use distinct, unambiguous colors/styles for each (this is the visitor's primary decision-making UI, clarity matters more than polish here).
- [ ] Selecting seats should feel immediate in the UI, but the actual hold only becomes real once your partner's `POST /bookings/hold` confirms it — **handle the case where the hold request fails** (someone else took the seat a moment earlier) by clearly telling the visitor and refreshing the seat map, not silently failing.
- [ ] Show a visible countdown/expiry indicator once a hold is active, so visitors understand they have limited time to complete the booking.

**🔗 Checkpoint:** `/bookings/hold` live and concurrency-tested by your partner — wire real seat selection to it. Test this yourself too: open two browser tabs, try to select the same seat in both, confirm the second one gets a clear "no longer available" message, not a silent success.

---

## Phase 3 — Booking Form, Payment Instructions, Proof Upload

- [ ] Visitor details form: name, phone, email (if needed), passenger count — nothing beyond what SDD Section 4.3 lists.
- [ ] Review screen: date, timing, seats, price breakdown, total — calculated value displayed as returned by the backend, never computed independently in the frontend.
- [ ] Payment instructions screen: TDCP's account details (bank/JazzCash/Easypaisa) clearly displayed once `POST /bookings` succeeds.
- [ ] Screenshot upload UI wired to `POST /bookings/{id}/payment-proof`.
- [ ] Status display after upload: "Payment proof submitted — awaiting verification" (SDD Section 4.6 wording).

**🔗 Checkpoint:** Booking + proof-upload endpoints live — wire this phase's UI to them.

---

## Phase 4 — Admin Panel

- [ ] Admin login (basic auth to start — align with whatever your partner implements server-side).
- [ ] Pending payment-proofs queue: visitor details, booking reference, date, timing, seats, amount, and the uploaded screenshot shown clearly (this is what admin staff will actually be staring at all day — make the screenshot large and legible).
- [ ] **Confirm** / **Reject** buttons wired to the admin endpoints — after clicking Confirm, show clear success feedback (don't leave admin staff wondering if it worked).
- [ ] Bookings list with filters by date and status.
- [ ] Schedule management: create schedule instances, open/close a timing slot.

**🔗 Checkpoint:** Admin confirm/reject endpoints live — wire this phase to them, then walk through the full flow yourself: hold a seat as a "visitor," upload a fake proof, then confirm it as "admin," and check the seat map correctly shows the seat as booked afterward.

---

## Phase 5 — Booking Status Lookup

- [ ] Simple public page: visitor enters a booking reference, phone, or email, sees date, timing, seats, amount, payment status, booking status — matching the two states from SDD Section 4.6.

**🔗 Checkpoint:** Lookup endpoint live — wire this page to it.

---

## Phase 6 — AI Assistant Widget (Optional)

- [ ] Simple chat UI: message list, input, send button.
- [ ] Wire to `/agent/chat` once your partner ships it.
- [ ] This is explicitly secondary (SDD Section 4.8) — don't let polish here come at the expense of the seat map or admin panel being solid first.

---

## Phase 7 — End-to-End Testing & Polish

- [ ] Run the full flow yourself, multiple times: book seats, let a hold expire on purpose and confirm the seats free up correctly, submit proof, get it confirmed, check status.
- [ ] Test the admin side: reject a payment and confirm seats correctly return to available.
- [ ] Handle and test error states throughout — failed hold, failed upload, network errors — not just the happy path.
- [ ] Walk a non-technical person through the admin panel once, live, as a real usability check.

**✅ Phase 7 Definition of Done:** You've personally broken it on purpose (expired holds, rejected payments, two-tabs-same-seat) and watched it recover correctly every time.

---

## Final Handover Checklist
- [ ] Confirm every price shown in the UI came from a backend response, never a frontend calculation.
- [ ] Confirm the seat map never shows a seat as available when the backend says otherwise (no stale local state).
- [ ] Hand over frontend hosting access to a TDCP-owned account, not a personal one.
