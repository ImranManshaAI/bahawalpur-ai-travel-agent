"use client";

import { useState } from "react";
import { getBookingStatus } from "@/lib/api";
import type { BookingStatusResponse } from "@/lib/api-types";

function formatBookingStatus(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatCurrency(amount: number): string {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

function getStatusBadgeClass(status: string): string {
  const normalizedStatus = status.toLowerCase();

  if (
    normalizedStatus.includes("confirmed") ||
    normalizedStatus.includes("paid")
  ) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (
    normalizedStatus.includes("pending") ||
    normalizedStatus.includes("unpaid")
  ) {
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }

  if (
    normalizedStatus.includes("rejected") ||
    normalizedStatus.includes("cancelled") ||
    normalizedStatus.includes("failed")
  ) {
    return "bg-red-50 text-red-700 ring-red-200";
  }

  return "bg-slate-100 text-slate-700 ring-slate-200";
}

export default function BookingStatusLookup() {
  const [query, setQuery] = useState("");
  const [booking, setBooking] = useState<BookingStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedQuery = query.trim();

    if (!normalizedQuery || isLoading) {
      return;
    }

    setErrorMessage(null);
    setBooking(null);
    setIsLoading(true);

    try {
      const response = await getBookingStatus(normalizedQuery);
      setBooking(response);
    } catch {
      setErrorMessage(
        "We couldn't find a booking with those details. Please check your booking reference, phone, or email.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section
      aria-labelledby="booking-status-heading"
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Existing booking
        </p>

        <h2
          id="booking-status-heading"
          className="mt-2 text-2xl font-bold tracking-tight text-slate-950"
        >
          Check booking status
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
          Enter your booking reference, phone number, or email to view your
          current booking status.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label
              htmlFor="booking-status-query"
              className="block text-sm font-semibold text-slate-900"
            >
              Booking reference, phone, or email
            </label>

            <input
              id="booking-status-query"
              name="booking_status_query"
              type="text"
              required
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              disabled={isLoading}
              placeholder="e.g. BWP-123456"
              className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="min-h-11 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isLoading ? "Checking..." : "Check status"}
          </button>
        </div>
      </form>

      {errorMessage && (
        <div
          className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4"
          role="alert"
        >
          <p className="text-sm font-semibold text-red-900">
            Booking lookup failed
          </p>

          <p className="mt-1 text-sm leading-6 text-red-800">
            {errorMessage}
          </p>
        </div>
      )}

      {booking && (
        <div
          className="mt-6 overflow-hidden rounded-xl border border-slate-200"
          role="status"
          aria-live="polite"
        >
          <div className="border-b border-slate-200 bg-slate-50 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Booking reference
                </p>

                <p className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                  {booking.booking_ref}
                </p>
              </div>

              <span
                className={`inline-flex w-fit rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ${getStatusBadgeClass(
                  booking.booking_status,
                )}`}
              >
                {formatBookingStatus(booking.booking_status)}
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Travel date
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {booking.date}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Departure
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {booking.timing_slot}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Seats
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {booking.seat_numbers.length > 0
                    ? booking.seat_numbers.join(", ")
                    : "Not assigned"}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Passengers
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {booking.passenger_count}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total price
                </dt>
                <dd className="mt-1 text-base font-bold text-slate-950">
                  {formatCurrency(booking.total_price)}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Payment status
                </dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getStatusBadgeClass(
                      booking.payment_status,
                    )}`}
                  >
                    {formatBookingStatus(booking.payment_status)}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </section>
  );
}