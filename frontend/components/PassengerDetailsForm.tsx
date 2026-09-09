"use client";

import { useState } from "react";

interface PassengerDetailsFormProps {
  holdToken: string;
  passengerCount: number;
  remainingSeconds: number;
}

interface BookingPayload {
  hold_token: string;
  visitor_name: string;
  phone: string;
  email: string;
  passenger_count: number;
}

export default function PassengerDetailsForm({
  holdToken,
  passengerCount,
  remainingSeconds,
}: PassengerDetailsFormProps) {
  const [visitorName, setVisitorName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedPayload, setSubmittedPayload] =
    useState<BookingPayload | null>(null);

  const isHoldExpired = remainingSeconds <= 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isHoldExpired) {
      return;
    }

    const payload: BookingPayload = {
      hold_token: holdToken,
      visitor_name: visitorName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      passenger_count: passengerCount,
    };

    setSubmittedPayload(payload);
    setIsSubmitted(true);
  }

  if (isSubmitted && submittedPayload) {
    return (
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
            Passenger details saved
          </p>

          <p className="mt-1 text-sm text-green-800">
            Your details are ready for the booking submission.
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
                Passenger
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {submittedPayload.visitor_name}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Phone
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {submittedPayload.phone}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {submittedPayload.email}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Passengers
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {submittedPayload.passenger_count}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-950">
            Next step
          </p>

          <p className="mt-1 text-sm text-slate-600">
            The real booking submission will be connected here when the
            backend booking endpoint is ready.
          </p>
        </div>
      </section>
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
            disabled={isHoldExpired}
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
            disabled={isHoldExpired}
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
            disabled={isHoldExpired}
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
          disabled={isHoldExpired}
          className="min-h-11 w-full rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
        >
          Continue booking
        </button>
      </form>
    </section>
  );
}