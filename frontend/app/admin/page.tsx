"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:8001";

type DashboardSection =
  | "overview"
  | "schedules"
  | "bookings"
  | "payments";

type Schedule = {
  schedule_instance_id: string;
  route_id: string;
  route_name: string;
  travel_date: string;
  timing_slot: string;
  status: string;
  total_seats: number;
  available_seats: number;
};

type ScheduleCreateResponse = {
  id: string;
  bus_id: string;
  route_id: string;
  travel_date: string;
  timing_slot: string;
  status: string;
  created_at: string;
  seats_generated: number;
};

type Booking = {
  booking_id: string;
  booking_ref: string;
  schedule_id: string;
  visitor_name: string;
  visitor_phone: string;
  visitor_email?: string | null;
  passenger_count: number;
  total_price: number;
  booking_status: string;
  payment_status?: string | null;
  created_at?: string;
};

type PaymentProof = {
  id?: string;
  payment_proof_id?: string;
  booking_id: string;
  payment_method_id?: string | null;
  status?: string | null;
  review_notes?: string | null;
  created_at?: string | null;
  transaction_reference?: string | null;
  amount_claimed?: number | null;
};

type ApiEnvelope<T> = {
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown> | null;
  } | null;
  detail?: unknown;
};

type AdminFetchOptions = {
  allowEmpty?: boolean;
};

export default function AdminDashboardPage() {
  const router = useRouter();

  const [section, setSection] =
    useState<DashboardSection>("overview");

  const [checkingAuth, setCheckingAuth] = useState(true);

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [scheduleDate, setScheduleDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [loadingSchedules, setLoadingSchedules] =
    useState(false);
  const [scheduleError, setScheduleError] = useState("");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] =
    useState(false);
  const [bookingError, setBookingError] = useState("");

  const [paymentProofs, setPaymentProofs] = useState<
    PaymentProof[]
  >([]);
  const [loadingPayments, setLoadingPayments] =
    useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");
  const [processingPaymentId, setProcessingPaymentId] =
    useState<string | null>(null);

  const [busId, setBusId] = useState("");
  const [routeId, setRouteId] = useState("");
  const [travelDate, setTravelDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [timingSlot, setTimingSlot] = useState("");

  const [creatingSchedule, setCreatingSchedule] =
    useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem(
      "admin_access_token",
    );

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    setCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    if (checkingAuth) return;

    if (section === "schedules") {
      void loadSchedules(scheduleDate);
    }

    if (section === "bookings") {
      void loadBookings();
    }

    if (section === "payments") {
      void loadPaymentProofs();
    }

    if (section === "overview") {
      void loadOverviewData();
    }
  }, [checkingAuth, section, scheduleDate]);

  async function adminFetch<T>(
    path: string,
    options: RequestInit = {},
    fetchOptions: AdminFetchOptions = {},
  ): Promise<T> {
    const token = localStorage.getItem(
      "admin_access_token",
    );

    if (!token) {
      router.replace("/admin/login");
      throw new Error("Admin session expired.");
    }

    const response = await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(options.headers ?? {}),
        },
      },
    );

    const raw = await response.text();

    if (!raw.trim()) {
      if (
        response.ok &&
        fetchOptions.allowEmpty
      ) {
        return undefined as T;
      }

      if (!response.ok) {
        throw new Error(
          `Request failed with status ${response.status}.`,
        );
      }

      throw new Error(
        "The server returned no response data.",
      );
    }

    let body: ApiEnvelope<T>;

    try {
      body = JSON.parse(raw) as ApiEnvelope<T>;
    } catch {
      if (!response.ok) {
        throw new Error(
          raw ||
            `Request failed with status ${response.status}.`,
        );
      }

      throw new Error(
        "The server returned an invalid response.",
      );
    }

    if (!response.ok) {
      throw new Error(
        getApiErrorMessage(
          body,
          response.status,
        ),
      );
    }

    if (body?.error) {
      throw new Error(body.error.message);
    }

    if (
      body?.data === null ||
      body?.data === undefined
    ) {
      if (fetchOptions.allowEmpty) {
        return undefined as T;
      }

      throw new Error(
        "The server returned no data.",
      );
    }

    return body.data;
  }

  async function loadSchedules(date: string) {
    setLoadingSchedules(true);
    setScheduleError("");

    try {
      const data = await adminFetch<Schedule[]>(
        `/schedules?date=${encodeURIComponent(date)}`,
      );

      setSchedules(data);
    } catch (error) {
      setSchedules([]);

      setScheduleError(
        error instanceof Error
          ? error.message
          : "Unable to load schedules.",
      );
    } finally {
      setLoadingSchedules(false);
    }
  }

  async function loadBookings() {
    setLoadingBookings(true);
    setBookingError("");

    try {
      const data = await adminFetch<Booking[]>(
        "/admin/bookings",
      );

      setBookings(data);
    } catch (error) {
      setBookings([]);

      setBookingError(
        error instanceof Error
          ? error.message
          : "Unable to load bookings.",
      );
    } finally {
      setLoadingBookings(false);
    }
  }

  async function loadPaymentProofs() {
    setLoadingPayments(true);
    setPaymentError("");

    try {
      const data =
        await adminFetch<PaymentProof[]>(
          "/admin/payment-proofs",
        );

      setPaymentProofs(data);
    } catch (error) {
      setPaymentProofs([]);

      setPaymentError(
        error instanceof Error
          ? error.message
          : "Unable to load payment proofs.",
      );
    } finally {
      setLoadingPayments(false);
    }
  }

  async function loadOverviewData() {
    await Promise.all([
      loadSchedules(scheduleDate),
      loadBookings(),
      loadPaymentProofs(),
    ]);
  }

  async function handleCreateSchedule(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setCreateError("");
    setCreateSuccess("");

    const cleanBusId = busId.trim();
    const cleanRouteId = routeId.trim();

    if (!isValidUUID(cleanBusId)) {
      setCreateError(
        "Invalid Bus UUID. Please enter the complete Bus UUID, not a numeric ID such as 2.",
      );
      return;
    }

    if (!isValidUUID(cleanRouteId)) {
      setCreateError(
        "Invalid Route UUID. Please enter the complete Route UUID, not a numeric ID such as 2.",
      );
      return;
    }

    if (!travelDate) {
      setCreateError(
        "Please select a travel date.",
      );
      return;
    }

    if (!timingSlot) {
      setCreateError(
        "Please select a departure time.",
      );
      return;
    }

    setCreatingSchedule(true);

    try {
      const result =
        await adminFetch<ScheduleCreateResponse>(
          "/admin/schedules",
          {
            method: "POST",
            body: JSON.stringify({
              bus_id: cleanBusId,
              route_id: cleanRouteId,
              travel_date: travelDate,
              timing_slot: timingSlot,
            }),
          },
        );

      setCreateSuccess(
        `Schedule created successfully. ${result.seats_generated} seats generated.`,
      );

      setBusId("");
      setRouteId("");
      setTimingSlot("");

      setScheduleDate(travelDate);

      await loadSchedules(travelDate);
    } catch (error) {
      setCreateError(
        error instanceof Error
          ? error.message
          : "Unable to create schedule.",
      );
    } finally {
      setCreatingSchedule(false);
    }
  }

  async function handleScheduleStatus(
    scheduleId: string,
    status: "open" | "closed",
  ) {
    setScheduleError("");

    try {
      await adminFetch(
        `/admin/schedules/${scheduleId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
        { allowEmpty: true },
      );

      await loadSchedules(scheduleDate);
    } catch (error) {
      setScheduleError(
        error instanceof Error
          ? error.message
          : "Unable to update schedule.",
      );
    }
  }

  function getProofId(
    proof: PaymentProof,
  ): string {
    return (
      proof.id ??
      proof.payment_proof_id ??
      ""
    );
  }

  function getPaymentStatus(
    proof: PaymentProof,
  ): string {
    return (
      proof.status?.trim().toLowerCase() ??
      "unknown"
    );
  }

  function isPaymentPending(
    proof: PaymentProof,
  ): boolean {
    const status = getPaymentStatus(proof);

    const finalStatuses = [
      "confirmed",
      "verified",
      "approved",
      "paid",
      "rejected",
      "cancelled",
      "canceled",
      "failed",
    ];

    return !finalStatuses.includes(status);
  }

  async function handlePaymentAction(
    proof: PaymentProof,
    action: "confirm" | "reject",
  ) {
    const proofId = getProofId(proof);

    if (!proofId) {
      setPaymentError(
        "Payment proof ID is missing. The proof cannot be verified.",
      );
      return;
    }

    const message =
      action === "confirm"
        ? "Are you sure you want to verify this payment?"
        : "Are you sure you want to reject this payment?";

    if (!window.confirm(message)) {
      return;
    }

    setPaymentError("");
    setPaymentSuccess("");
    setProcessingPaymentId(proofId);

    try {
      await adminFetch(
        `/admin/payment-proofs/${proofId}/${action}`,
        {
          method: "POST",
        },
        {
          allowEmpty: true,
        },
      );

      setPaymentSuccess(
        action === "confirm"
          ? "Payment verified successfully. The booking payment status has been updated."
          : "Payment proof rejected successfully.",
      );

      await loadPaymentProofs();
      await loadBookings();
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Unable to update payment proof.",
      );
    } finally {
      setProcessingPaymentId(null);
    }
  }

  function handleLogout() {
    localStorage.removeItem(
      "admin_access_token",
    );
    localStorage.removeItem("admin_name");
    localStorage.removeItem("admin_email");

    router.replace("/admin/login");
  }

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">
          Loading admin panel...
        </p>
      </main>
    );
  }

  const navigation: {
    id: DashboardSection;
    label: string;
  }[] = [
    {
      id: "overview",
      label: "Overview",
    },
    {
      id: "schedules",
      label: "Schedules",
    },
    {
      id: "bookings",
      label: "Bookings",
    },
    {
      id: "payments",
      label: "Payment Proofs",
    },
  ];

  const openSchedules = schedules.filter(
    (schedule) =>
      schedule.status?.toLowerCase() === "open",
  );

  const totalOpenSeats = schedules.reduce(
    (total, schedule) =>
      total + Number(schedule.available_seats || 0),
    0,
  );

  const pendingPayments =
    paymentProofs.filter(isPaymentPending);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}

        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-slate-900 p-5 md:block">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              BWP AI Travel Agent
            </p>

            <h1 className="mt-2 text-xl font-bold">
              Admin Panel
            </h1>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setSection(item.id)
                }
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  section === item.id
                    ? "bg-cyan-400 text-slate-950"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span>{item.label}</span>

                  {item.id === "payments" &&
                    pendingPayments.length > 0 && (
                      <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">
                        {pendingPayments.length}
                      </span>
                    )}
                </span>
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-10 w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            Logout
          </button>
        </aside>

        {/* MAIN */}

        <section className="flex-1">

          {/* HEADER */}

          <header className="border-b border-white/10 bg-slate-950/90 px-6 py-5 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Administration
                </p>

                <h2 className="text-2xl font-bold">
                  {
                    navigation.find(
                      (item) =>
                        item.id === section,
                    )?.label
                  }
                </h2>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 md:hidden"
              >
                Logout
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-7xl p-6">

            {/* OVERVIEW */}

            {section === "overview" && (
              <div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    label="Schedules"
                    value={String(
                      schedules.length,
                    )}
                  />

                  <StatCard
                    label="Open Schedules"
                    value={String(
                      openSchedules.length,
                    )}
                  />

                  <StatCard
                    label="Open Seats"
                    value={String(
                      totalOpenSeats,
                    )}
                  />

                  <StatCard
                    label="Pending Payments"
                    value={String(
                      pendingPayments.length,
                    )}
                    highlight={
                      pendingPayments.length > 0
                    }
                  />
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <StatCard
                    label="Total Bookings"
                    value={String(
                      bookings.length,
                    )}
                  />

                  <StatCard
                    label="Payment Proofs"
                    value={String(
                      paymentProofs.length,
                    )}
                  />
                </div>

                {pendingPayments.length > 0 && (
                  <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.15em] text-amber-300">
                          Action Required
                        </p>

                        <h3 className="mt-1 text-xl font-bold text-white">
                          {pendingPayments.length} payment{" "}
                          {pendingPayments.length === 1
                            ? "proof needs"
                            : "proofs need"}{" "}
                          verification
                        </h3>

                        <p className="mt-1 text-sm text-amber-100/70">
                          Review the submitted payment
                          proof before confirming the
                          customer booking.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSection("payments")
                        }
                        className="rounded-xl bg-amber-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-200"
                      >
                        Review Payments
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                  <h3 className="text-lg font-semibold">
                    Admin Dashboard
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Manage schedules, review
                    customer bookings and verify
                    submitted payment proofs.
                  </p>
                </div>
              </div>
            )}

            {/* SCHEDULES */}

            {section === "schedules" && (
              <div className="space-y-6">

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold">
                      Create Schedule
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      Add a bus schedule for a
                      selected route, date and
                      departure time.
                    </p>
                  </div>

                  <form
                    onSubmit={
                      handleCreateSchedule
                    }
                    className="grid gap-4 md:grid-cols-2"
                  >
                    {/* BUS UUID */}

                    <div>
                      <label
                        htmlFor="bus-id"
                        className="mb-2 block text-sm font-medium text-slate-200"
                      >
                        Bus UUID
                      </label>

                      <input
                        id="bus-id"
                        type="text"
                        required
                        value={busId}
                        onChange={(event) => {
                          setBusId(
                            event.target.value,
                          );
                          setCreateError("");
                          setCreateSuccess("");
                        }}
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        autoComplete="off"
                        spellCheck={false}
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
                      />

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Enter the complete Bus UUID.
                        Numeric IDs such as 2 are not
                        accepted by the API.
                      </p>
                    </div>

                    {/* ROUTE UUID */}

                    <div>
                      <label
                        htmlFor="route-id"
                        className="mb-2 block text-sm font-medium text-slate-200"
                      >
                        Route UUID
                      </label>

                      <input
                        id="route-id"
                        type="text"
                        required
                        value={routeId}
                        onChange={(event) => {
                          setRouteId(
                            event.target.value,
                          );
                          setCreateError("");
                          setCreateSuccess("");
                        }}
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        autoComplete="off"
                        spellCheck={false}
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
                      />

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Enter the complete Route UUID.
                        Numeric IDs such as 2 are not
                        accepted by the API.
                      </p>
                    </div>

                    {/* TRAVEL DATE */}

                    <div>
                      <label
                        htmlFor="travel-date"
                        className="mb-2 block text-sm font-medium text-slate-200"
                      >
                        Travel Date
                      </label>

                      <input
                        id="travel-date"
                        type="date"
                        required
                        value={travelDate}
                        onChange={(event) => {
                          setTravelDate(
                            event.target.value,
                          );
                          setCreateError("");
                          setCreateSuccess("");
                        }}
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </div>

                    {/* DEPARTURE TIME */}

                    <div>
                      <label
                        htmlFor="timing-slot"
                        className="mb-2 block text-sm font-medium text-slate-200"
                      >
                        Departure Time
                      </label>

                      <input
                        id="timing-slot"
                        type="time"
                        required
                        value={timingSlot}
                        onChange={(event) => {
                          setTimingSlot(
                            event.target.value,
                          );
                          setCreateError("");
                          setCreateSuccess("");
                        }}
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </div>

                    {/* CREATE RESULT */}

                    <div className="md:col-span-2">
                      {createError && (
                        <div
                          className="mb-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-200"
                          role="alert"
                        >
                          <p className="font-semibold">
                            Schedule could not be created
                          </p>

                          <p className="mt-1">
                            {createError}
                          </p>
                        </div>
                      )}

                      {createSuccess && (
                        <div
                          className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm leading-6 text-emerald-200"
                          role="status"
                        >
                          {createSuccess}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={
                          creatingSchedule
                        }
                        className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {creatingSchedule
                          ? "Creating..."
                          : "Create Schedule"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* SCHEDULE MANAGEMENT */}

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">
                        Schedule Management
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        View and manage schedules
                        for a travel date.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="schedule-filter-date"
                        className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400"
                      >
                        Travel Date
                      </label>

                      <input
                        id="schedule-filter-date"
                        type="date"
                        value={scheduleDate}
                        onChange={(event) =>
                          setScheduleDate(
                            event.target.value,
                          )
                        }
                        className="rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  {scheduleError && (
                    <div
                      className="mb-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
                      role="alert"
                    >
                      {scheduleError}
                    </div>
                  )}

                  {loadingSchedules ? (
                    <LoadingState text="Loading schedules..." />
                  ) : schedules.length === 0 ? (
                    <EmptyState text="No schedules found for this date." />
                  ) : (
                    <div className="space-y-3">
                      {schedules.map(
                        (schedule) => (
                          <div
                            key={
                              schedule.schedule_instance_id
                            }
                            className="rounded-xl border border-white/10 bg-slate-900/70 p-5"
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                              <div>
                                <div className="flex flex-wrap items-center gap-3">
                                  <h4 className="font-semibold">
                                    {
                                      schedule.route_name
                                    }
                                  </h4>

                                  <StatusBadge
                                    status={
                                      schedule.status
                                    }
                                  />
                                </div>

                                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-400">
                                  <span>
                                    Date:{" "}
                                    {
                                      schedule.travel_date
                                    }
                                  </span>

                                  <span>
                                    Departure:{" "}
                                    {
                                      schedule.timing_slot
                                    }
                                  </span>

                                  <span>
                                    Seats:{" "}
                                    {
                                      schedule.available_seats
                                    }
                                    /
                                    {
                                      schedule.total_seats
                                    }
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                {schedule.status?.toLowerCase() ===
                                "open" ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void handleScheduleStatus(
                                        schedule.schedule_instance_id,
                                        "closed",
                                      )
                                    }
                                    className="rounded-lg border border-red-400/20 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-400/10"
                                  >
                                    Close
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void handleScheduleStatus(
                                        schedule.schedule_instance_id,
                                        "open",
                                      )
                                    }
                                    className="rounded-lg border border-emerald-400/20 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-400/10"
                                  >
                                    Open
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BOOKINGS */}

            {section === "bookings" && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">
                      Customer Bookings
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      View customer booking records
                      and their current status.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void loadBookings()
                    }
                    disabled={loadingBookings}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/5 disabled:opacity-50"
                  >
                    {loadingBookings
                      ? "Refreshing..."
                      : "Refresh"}
                  </button>
                </div>

                {bookingError && (
                  <div className="mb-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                    {bookingError}
                  </div>
                )}

                {loadingBookings ? (
                  <LoadingState text="Loading bookings..." />
                ) : bookings.length === 0 ? (
                  <EmptyState text="No bookings found." />
                ) : (
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <div
                        key={booking.booking_id}
                        className="rounded-xl border border-white/10 bg-slate-900/70 p-5"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h4 className="font-semibold">
                                {
                                  booking.booking_ref
                                }
                              </h4>

                              <StatusBadge
                                status={
                                  booking.booking_status
                                }
                              />
                            </div>

                            <div className="mt-3 grid gap-2 text-sm text-slate-400 sm:grid-cols-2">
                              <span>
                                Passenger:{" "}
                                {
                                  booking.visitor_name
                                }
                              </span>

                              <span>
                                Phone:{" "}
                                {
                                  booking.visitor_phone
                                }
                              </span>

                              <span>
                                Passengers:{" "}
                                {
                                  booking.passenger_count
                                }
                              </span>

                              <span>
                                Total: PKR{" "}
                                {Number(
                                  booking.total_price,
                                ).toLocaleString()}
                              </span>

                              <span>
                                Payment:{" "}
                                {
                                  booking.payment_status ??
                                  "Not available"
                                }
                              </span>

                              {booking.created_at && (
                                <span>
                                  Created:{" "}
                                  {formatDateTime(
                                    booking.created_at,
                                  )}
                                </span>
                              )}
                            </div>

                            <p className="mt-3 break-all text-xs text-slate-600">
                              Booking ID:{" "}
                              {booking.booking_id}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PAYMENT PROOFS */}

            {section === "payments" && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold">
                        Payment Proofs
                      </h3>

                      {pendingPayments.length > 0 && (
                        <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white">
                          {pendingPayments.length} Pending
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-slate-400">
                      Review submitted payment proofs
                      and verify or reject them.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentSuccess("");
                      void loadPaymentProofs();
                    }}
                    disabled={loadingPayments}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/5 disabled:opacity-50"
                  >
                    {loadingPayments
                      ? "Refreshing..."
                      : "Refresh"}
                  </button>
                </div>

                {paymentError && (
                  <div
                    className="mb-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
                    role="alert"
                  >
                    <p className="font-semibold">
                      Payment proof error
                    </p>

                    <p className="mt-1">
                      {paymentError}
                    </p>
                  </div>
                )}

                {paymentSuccess && (
                  <div
                    className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200"
                    role="status"
                  >
                    {paymentSuccess}
                  </div>
                )}

                {loadingPayments ? (
                  <LoadingState text="Loading payment proofs..." />
                ) : paymentProofs.length === 0 ? (
                  <EmptyState text="No payment proofs found." />
                ) : (
                  <div className="space-y-4">

                    {paymentProofs.map(
                      (proof) => {
                        const proofId =
                          getProofId(proof);

                        const pending =
                          isPaymentPending(
                            proof,
                          );

                        const status =
                          getPaymentStatus(
                            proof,
                          );

                        const processing =
                          processingPaymentId ===
                          proofId;

                        return (
                          <div
                            key={
                              proofId ||
                              proof.booking_id
                            }
                            className={`rounded-2xl border p-5 ${
                              pending
                                ? "border-amber-400/30 bg-amber-400/[0.06]"
                                : "border-white/10 bg-slate-900/70"
                            }`}
                          >
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                              {/* PAYMENT INFORMATION */}

                              <div className="min-w-0 flex-1">

                                <div className="flex flex-wrap items-center gap-3">
                                  <h4 className="text-lg font-bold">
                                    Payment Proof
                                  </h4>

                                  <StatusBadge
                                    status={
                                      status
                                    }
                                  />

                                  {pending && (
                                    <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-bold text-amber-300">
                                      Action Required
                                    </span>
                                  )}
                                </div>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2">

                                  <InfoItem
                                    label="Booking ID"
                                    value={
                                      proof.booking_id
                                    }
                                  />

                                  <InfoItem
                                    label="Proof ID"
                                    value={
                                      proofId ||
                                      "Not available"
                                    }
                                  />

                                  <InfoItem
                                    label="Payment Method ID"
                                    value={
                                      proof.payment_method_id ??
                                      "Not available"
                                    }
                                  />

                                  <InfoItem
                                    label="Submitted"
                                    value={
                                      proof.created_at
                                        ? formatDateTime(
                                            proof.created_at,
                                          )
                                        : "Not available"
                                    }
                                  />

                                  <InfoItem
                                    label="Transaction Reference"
                                    value={
                                      proof.transaction_reference ??
                                      "Not available"
                                    }
                                  />

                                  <InfoItem
                                    label="Amount Claimed"
                                    value={
                                      proof.amount_claimed !==
                                        null &&
                                      proof.amount_claimed !==
                                        undefined
                                        ? `PKR ${Number(
                                            proof.amount_claimed,
                                          ).toLocaleString()}`
                                        : "Not available"
                                    }
                                  />

                                </div>

                                {proof.review_notes && (
                                  <div className="mt-4 rounded-xl border border-white/10 bg-black/10 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                      Review Notes
                                    </p>

                                    <p className="mt-1 text-sm text-slate-300">
                                      {
                                        proof.review_notes
                                      }
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* VERIFICATION PANEL */}

                              {pending ? (
                                <div className="w-full shrink-0 rounded-2xl border border-amber-400/20 bg-slate-950/80 p-5 lg:w-72">

                                  <div className="flex items-center gap-2">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400/15 text-lg">
                                      !
                                    </span>

                                    <div>
                                      <p className="text-xs font-black uppercase tracking-[0.15em] text-amber-300">
                                        Verification
                                      </p>

                                      <p className="text-sm font-bold text-white">
                                        Payment needs review
                                      </p>
                                    </div>
                                  </div>

                                  <p className="mt-3 text-sm leading-5 text-slate-400">
                                    Check the transaction
                                    reference and amount
                                    before verifying this
                                    payment.
                                  </p>

                                  <div className="mt-5 space-y-2">

                                    <button
                                      type="button"
                                      disabled={
                                        processing ||
                                        !proofId
                                      }
                                      onClick={() =>
                                        void handlePaymentAction(
                                          proof,
                                          "confirm",
                                        )
                                      }
                                      className="w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {processing
                                        ? "Processing..."
                                        : "✓ Verify Payment"}
                                    </button>

                                    <button
                                      type="button"
                                      disabled={
                                        processing ||
                                        !proofId
                                      }
                                      onClick={() =>
                                        void handlePaymentAction(
                                          proof,
                                          "reject",
                                        )
                                      }
                                      className="w-full rounded-xl border border-red-400/30 px-4 py-3 text-sm font-bold text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {processing
                                        ? "Processing..."
                                        : "Reject Payment"}
                                    </button>

                                  </div>
                                </div>
                              ) : (
                                <div className="w-full shrink-0 rounded-2xl border border-white/10 bg-slate-950/70 p-5 lg:w-64">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Verification
                                  </p>

                                  <div className="mt-3">
                                    <StatusBadge
                                      status={
                                        status
                                      }
                                    />
                                  </div>

                                  <p className="mt-3 text-sm text-slate-400">
                                    This payment proof has
                                    already been processed.
                                  </p>
                                </div>
                              )}

                            </div>
                          </div>
                        );
                      },
                    )}

                  </div>
                )}
              </div>
            )}

          </div>
        </section>
      </div>
    </main>
  );
}

/* ---------- HELPERS ---------- */

function isValidUUID(
  value: string,
): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return uuidRegex.test(value);
}

function getApiErrorMessage(
  body: ApiEnvelope<unknown>,
  status: number,
): string {
  if (
    body?.error?.message
  ) {
    return body.error.message;
  }

  if (Array.isArray(body?.detail)) {
    const messages = body.detail
      .map((item) => {
        if (
          typeof item === "object" &&
          item !== null &&
          "msg" in item
        ) {
          const message =
            (item as { msg?: unknown }).msg;

          return typeof message === "string"
            ? message
            : null;
        }

        return null;
      })
      .filter(
        (message): message is string =>
          Boolean(message),
      );

    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  if (
    typeof body?.detail === "string"
  ) {
    return body.detail;
  }

  return `Request failed with status ${status}.`;
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        highlight
          ? "border-amber-400/30 bg-amber-400/10"
          : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <p
        className={`text-sm ${
          highlight
            ? "text-amber-200"
            : "text-slate-400"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-3 text-3xl font-bold ${
          highlight
            ? "text-amber-300"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-all text-sm font-semibold text-slate-200">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status?: string | null;
}) {
  const normalized =
    status?.trim().toLowerCase() ||
    "unknown";

  const isPositive =
    normalized === "open" ||
    normalized === "confirmed" ||
    normalized === "verified" ||
    normalized === "approved" ||
    normalized === "paid" ||
    normalized === "completed";

  const isNegative =
    normalized === "closed" ||
    normalized === "rejected" ||
    normalized === "cancelled" ||
    normalized === "canceled" ||
    normalized === "failed";

  const label = normalized.replace(
    /_/g,
    " ",
  );

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
        isPositive
          ? "bg-emerald-400/10 text-emerald-300"
          : isNegative
            ? "bg-red-400/10 text-red-300"
            : "bg-amber-400/10 text-amber-300"
      }`}
    >
      {label}
    </span>
  );
}

function LoadingState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 p-8 text-center">
      <p className="text-sm text-slate-400">
        {text}
      </p>
    </div>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
      <p className="text-sm text-slate-400">
        {text}
      </p>
    </div>
  );
}

function formatDateTime(
  value: string,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}