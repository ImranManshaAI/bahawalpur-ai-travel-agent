"use client";

import { useState } from "react";
import { createBooking } from "@/lib/api";
import type {
  CreateBookingRequest,
  CreateBookingResponse,
} from "@/lib/api-types";
import PaymentProofForm from "@/components/PaymentProofForm";

interface PassengerDetailsFormProps {
  holdToken: string;
  passengerCount: number;
  remainingSeconds: number;
}

export default function PassengerDetailsForm({
  holdToken,
  passengerCount,
  remainingSeconds,
}: PassengerDetailsFormProps) {
  const [visitorName, setVisitorName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [booking, setBooking] = useState<CreateBookingResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isHoldExpired = remainingSeconds <= 0;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isHoldExpired || isSubmitting) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const payload: CreateBookingRequest = {
      hold_token: holdToken,
      visitor_name: visitorName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      passenger_count: passengerCount,
    };

    try {
      const response = await createBooking(payload);
      setBooking(response);
    } catch {
      setErrorMessage(
        "We couldn't create your booking. Please try again while your seat hold is still active.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (booking) {
    const primaryPaymentMethod = booking.payment_methods[0];

    return (
      <div className="space-y-6">
        <section
          aria-labelledby="booking-details-heading"
          className="rounded-xl border border-slate-200 bg-white p-6"
        >
          <div
            className="rounded-lg border border-green-200 bg-green-50 p-5"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-semibold text-green-900">
              Booking created successfully
            </p>

            <p className="mt-1 text-sm text-green-800">
              Your booking reference is {booking.booking_ref}.
            </p>
          </div>

          <div className="mt-6">
            <h2
              id="booking-details-heading"
              className="text-xl font-bold text-slate-950"
            >
              Booking details
            </h2>

            <dl className="mt-4 space-y-3 rounded-lg bg-slate-50 p-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Booking reference
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">
                  {booking.booking_ref}
                </dd>
              </div>

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
                  Booking status
                </dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {booking.booking_status}
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

          {primaryPaymentMethod && (
            <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-950">
                Payment method
              </h3>

              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-slate-500">Method</dt>
                  <dd className="font-medium text-slate-900">
                    {primaryPaymentMethod.name}
                  </dd>
                </div>

                <div>
                  <dt className="text-slate-500">Account name</dt>
                  <dd className="font-medium text-slate-900">
                    {primaryPaymentMethod.account_name}
                  </dd>
                </div>

                <div>
                  <dt className="text-slate-500">Account number</dt>
                  <dd className="font-medium text-slate-900">
                    {primaryPaymentMethod.account_number}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </section>

        <PaymentProofForm
          bookingId={booking.booking_id}
          totalPrice={booking.total_price}
          paymentMethods={booking.payment_methods}
        />
      </div>
    );
  }

  return (
    <section
      aria-labelledby="passenger-details-heading"
      className="rounded-xl border border-slate-200 bg-white p-6"
    >
      <div>
        <h2
          id="passenger-details-heading"
          className="text-2xl font-bold tracking-tight text-slate-950"
        >
          Passenger details
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Enter the visitor information before the seat hold expires.
        </p>
      </div>

      {isHoldExpired && (
        <div
          className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4"
          role="alert"
        >
          <p className="text-sm font-semibold text-red-900">
            Your seat hold has expired.
          </p>

          <p className="mt-1 text-sm text-red-800">
            Please select and hold your seats again before continuing.
          </p>
        </div>
      )}

      {errorMessage && (
        <div
          className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4"
          role="alert"
        >
          <p className="text-sm font-semibold text-red-900">
            Booking submission failed
          </p>

          <p className="mt-1 text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="visitor-name"
            className="block text-sm font-semibold text-slate-900"
          >
            Full name
          </label>

          <input
            id="visitor-name"
            name="visitor_name"
            type="text"
            required
            autoComplete="name"
            value={visitorName}
            onChange={(event) => setVisitorName(event.target.value)}
            disabled={isHoldExpired || isSubmitting}
            className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-semibold text-slate-900"
          >
            Phone
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            disabled={isHoldExpired || isSubmitting}
            className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-slate-900"
          >
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isHoldExpired || isSubmitting}
            className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </div>

        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-950">
            {passengerCount}{" "}
            {passengerCount === 1 ? "passenger" : "passengers"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Passenger count is based on the number of seats currently held.
          </p>
        </div>

        <button
          type="submit"
          disabled={isHoldExpired || isSubmitting}
          className="min-h-11 w-full rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
        >
          {isSubmitting ? "Creating booking..." : "Continue booking"}
        </button>
      </form>
    </section>
  );
}