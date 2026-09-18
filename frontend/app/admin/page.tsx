"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

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
  id: string;
  booking_id: string;
  payment_method_id: string;
  status: string;
  review_notes?: string | null;
  created_at: string;
};

type ApiEnvelope<T> = {
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown> | null;
  } | null;
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
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [scheduleError, setScheduleError] = useState("");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const [paymentProofs, setPaymentProofs] = useState<
    PaymentProof[]
  >([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
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
    if (checkingAuth) {
      return;
    }

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

    let body: ApiEnvelope<T> | null = null;

    try {
      body =
        (await response.json()) as ApiEnvelope<T>;
    } catch {
      throw new Error(
        "The server returned an invalid response.",
      );
    }

    if (!response.ok) {
      throw new Error(
        body?.error?.message ??
          `Request failed with status ${response.status}.`,
      );
    }

    if (body?.error) {
      throw new Error(body.error.message);
    }

    if (
      body?.data === null ||
      body?.data === undefined
    ) {
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
      const data = await adminFetch<PaymentProof[]>(
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
    try {
      await Promise.all([
        loadSchedules(scheduleDate),
        loadBookings(),
        loadPaymentProofs(),
      ]);
    } catch {
      // Individual loaders handle their own errors.
    }
  }

  async function handleCreateSchedule(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setCreateError("");
    setCreateSuccess("");
    setCreatingSchedule(true);

    try {
      const result =
        await adminFetch<ScheduleCreateResponse>(
          "/admin/schedules",
          {
            method: "POST",
            body: JSON.stringify({
              bus_id: busId.trim(),
              route_id: routeId.trim(),
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

  async function handlePaymentAction(
    proofId: string,
    action: "confirm" | "reject",
  ) {
    setPaymentError("");
    setPaymentSuccess("");
    setProcessingPaymentId(proofId);

    try {
      await adminFetch(
        `/admin/payment-proofs/${proofId}/${action}`,
        {
          method: "POST",
        },
      );

      setPaymentSuccess(
        action === "confirm"
          ? "Payment proof confirmed successfully."
          : "Payment proof rejected successfully.",
      );

      await loadPaymentProofs();
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
    { id: "overview", label: "Overview" },
    { id: "schedules", label: "Schedules" },
    { id: "bookings", label: "Bookings" },
    { id: "payments", label: "Payment Proofs" },
  ];

  const openSchedules = schedules.filter(
    (schedule) => schedule.status === "open",
  );

  const totalOpenSeats = schedules.reduce(
    (total, schedule) =>
      total + schedule.available_seats,
    0,
  );

  const pendingPayments = paymentProofs.filter(
    (proof) =>
      proof.status === "pending_verification",
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
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
                {item.label}
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

        {/* Main content */}
        <section className="flex-1">
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
            {/* Overview */}
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

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                  <h3 className="text-lg font-semibold">
                    Admin Dashboard
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Use the sections to manage
                    schedules, review bookings and
                    process payment proofs.
                  </p>
                </div>
              </div>
            )}

            {/* Schedules */}
            {section === "schedules" && (
              <div className="space-y-6">
                {/* Create schedule */}
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
                    <div>
                      <label
                        htmlFor="bus-id"
                        className="mb-2 block text-sm font-medium text-slate-200"
                      >
                        Bus ID
                      </label>

                      <input
                        id="bus-id"
                        required
                        value={busId}
                        onChange={(event) =>
                          setBusId(
                            event.target.value,
                          )
                        }
                        placeholder="Bus UUID"
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="route-id"
                        className="mb-2 block text-sm font-medium text-slate-200"
                      >
                        Route ID
                      </label>

                      <input
                        id="route-id"
                        required
                        value={routeId}
                        onChange={(event) =>
                          setRouteId(
                            event.target.value,
                          )
                        }
                        placeholder="Route UUID"
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                      />
                    </div>

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
                        onChange={(event) =>
                          setTravelDate(
                            event.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </div>

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
                        onChange={(event) =>
                          setTimingSlot(
                            event.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="md:col-span-2">
                      {createError && (
                        <div className="mb-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                          {createError}
                        </div>
                      )}

                      {createSuccess && (
                        <div className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
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

                {/* Schedule list */}
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
                    <div className="mb-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
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

                                <p className="mt-2 break-all text-xs text-slate-600">
                                  ID:{" "}
                                  {
                                    schedule.schedule_instance_id
                                  }
                                </p>
                              </div>

                              <div className="flex gap-2">
                                {schedule.status ===
                                "open" ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleScheduleStatus(
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
                                      handleScheduleStatus(
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

            {/* Bookings */}
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

            {/* Payment Proofs */}
            {section === "payments" && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">
                      Payment Proofs
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      Review submitted payment proofs
                      and update their verification
                      status.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void loadPaymentProofs()
                    }
                    disabled={loadingPayments}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/5 disabled:opacity-50"
                  >
                    {loadingPayments
                      ? "Refreshing..."
                      : "Refresh"}
                  </button>
                </div>

                {paymentError && (
                  <div className="mb-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                    {paymentError}
                  </div>
                )}

                {paymentSuccess && (
                  <div className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                    {paymentSuccess}
                  </div>
                )}

                {loadingPayments ? (
                  <LoadingState text="Loading payment proofs..." />
                ) : paymentProofs.length === 0 ? (
                  <EmptyState text="No payment proofs found." />
                ) : (
                  <div className="space-y-3">
                    {paymentProofs.map(
                      (proof) => {
                        const isPending =
                          proof.status ===
                          "pending_verification";

                        const processing =
                          processingPaymentId ===
                          proof.id;

                        return (
                          <div
                            key={proof.id}
                            className="rounded-xl border border-white/10 bg-slate-900/70 p-5"
                          >
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                              <div>
                                <div className="flex flex-wrap items-center gap-3">
                                  <h4 className="font-semibold">
                                    Payment Proof
                                  </h4>

                                  <StatusBadge
                                    status={
                                      proof.status
                                    }
                                  />
                                </div>

                                <div className="mt-3 space-y-1 text-sm text-slate-400">
                                  <p className="break-all">
                                    Proof ID:{" "}
                                    {proof.id}
                                  </p>

                                  <p className="break-all">
                                    Booking ID:{" "}
                                    {
                                      proof.booking_id
                                    }
                                  </p>

                                  <p>
                                    Payment Method ID:{" "}
                                    {
                                      proof.payment_method_id
                                    }
                                  </p>

                                  <p>
                                    Submitted:{" "}
                                    {formatDateTime(
                                      proof.created_at,
                                    )}
                                  </p>

                                  {proof.review_notes && (
                                    <p>
                                      Review Notes:{" "}
                                      {
                                        proof.review_notes
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>

                              {isPending && (
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    disabled={
                                      processing
                                    }
                                    onClick={() =>
                                      void handlePaymentAction(
                                        proof.id,
                                        "confirm",
                                      )
                                    }
                                    className="rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {processing
                                      ? "Processing..."
                                      : "Confirm"}
                                  </button>

                                  <button
                                    type="button"
                                    disabled={
                                      processing
                                    }
                                    onClick={() =>
                                      void handlePaymentAction(
                                        proof.id,
                                        "reject",
                                      )
                                    }
                                    className="rounded-lg border border-red-400/20 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    Reject
                                  </button>
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

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized = status.toLowerCase();

  const isPositive =
    normalized === "open" ||
    normalized === "confirmed" ||
    normalized === "completed";

  const isNegative =
    normalized === "closed" ||
    normalized === "rejected" ||
    normalized === "cancelled";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        isPositive
          ? "bg-emerald-400/10 text-emerald-300"
          : isNegative
            ? "bg-red-400/10 text-red-300"
            : "bg-slate-400/10 text-slate-400"
      }`}
    >
      {status}
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

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}