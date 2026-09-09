"use client";

import { useState } from "react";
import { getBookingStatus } from "@/lib/api";
import type { BookingStatusResponse } from "@/lib/api-types";

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
      className="rounded-xl border border-slate-200 bg-white p-6"
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

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Enter your booking reference, phone number, or email to view your
          current booking status.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
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

        {errorMessage && (
          <div
            className="rounded-lg border border-red-200 bg-red-50 p-4"
            role="alert"
          >
            <p className="text-sm font-semibold text-red-900">
              Booking lookup failed
            </p>

            <p className="mt-1 text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="min-h-11 w-full rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
        >
          {isLoading ? "Checking booking..." : "Check status"}
        </button>
      </form>

      {booking && (
        <div
          className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Booking reference
              </p>

              <p className="mt-1 text-lg font-bold text-slate-950">
                {booking.booking_ref}
              </p>
            </div>

            <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
              {booking.booking_status}
            </div>
          </div>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Travel date
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {booking.date}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Departure
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {booking.timing_slot}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Seats
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {booking.seat_numbers.join(", ")}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Passengers
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {booking.passenger_count}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total price
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">
                {booking.total_price}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Payment status
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {booking.payment_status}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  );
}