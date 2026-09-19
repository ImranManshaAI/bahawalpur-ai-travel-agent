"use client";

import { useState } from "react";
import { createBooking } from "@/lib/api";

import type {
  CreateBookingRequest,
  CreateBookingResponse,
  PaymentProofResponse,
} from "@/lib/api-types";

import PaymentProofForm from "@/components/PaymentProofForm";

interface PassengerDetailsFormProps {
  holdToken: string;
  passengerCount: number;
  remainingSeconds: number;
  onBookingCreated?: (booking: CreateBookingResponse) => void;
  onPaymentSubmitted?: (proof: PaymentProofResponse) => void;
  onStepChange?: (step: number) => void;
}

export default function PassengerDetailsForm({
  holdToken,
  passengerCount,
  remainingSeconds,
  onBookingCreated,
  onPaymentSubmitted,
  onStepChange,
}: PassengerDetailsFormProps) {
  const [visitorName, setVisitorName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [booking, setBooking] =
    useState<CreateBookingResponse | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const isHoldExpired = remainingSeconds <= 0;

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isHoldExpired || isSubmitting) {
      return;
    }

    const trimmedName = visitorName.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedPhone) {
      setErrorMessage(
        "Please enter your name and phone number.",
      );
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const payload: CreateBookingRequest = {
      hold_token: holdToken,
      visitor_name: trimmedName,
      visitor_phone: trimmedPhone,
      visitor_email: trimmedEmail || null,
      passenger_count: passengerCount,
    };

    try {
      const response = await createBooking(payload);

      setBooking(response);

      /*
       * Booking successfully created.
       *
       * Move booking progress from:
       * Step 03 — Passenger Details
       * to
       * Step 04 — Payment
       */
      onStepChange?.(4);

      onBookingCreated?.(response);
    } catch (error) {
      console.error("Failed to create booking:", error);

      setErrorMessage(
        "We couldn't create your booking. Please try again while your seat hold is still active.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /*
   * After booking creation, show:
   * 1. Booking details
   * 2. Payment proof form
   */
  if (booking) {
    return (
      <div className="space-y-6">
        {/* BOOKING CREATED */}
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
              Your booking reference is{" "}
              {booking.booking_ref}.
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
                  Booking ID
                </dt>

                <dd className="mt-1 break-all text-sm text-slate-900">
                  {booking.booking_id}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Schedule
                </dt>

                <dd className="mt-1 break-all text-sm text-slate-900">
                  {booking.schedule_id}
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
                  PKR{" "}
                  {booking.total_price.toLocaleString(
                    "en-PK",
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Booking status
                </dt>

                <dd className="mt-1 text-sm capitalize text-slate-900">
                  {booking.status.replace(/_/g, " ")}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Booking type
                </dt>

                <dd className="mt-1 text-sm capitalize text-slate-900">
                  {booking.booking_type.replace(
                    /_/g,
                    " ",
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* PAYMENT */}
        <PaymentProofForm
          bookingId={booking.booking_id}
          totalPrice={booking.total_price}
          paymentMethods={[]}
          onPaymentSubmitted={(proof) => {
            /*
             * Payment proof successfully submitted.
             *
             * Move booking progress to:
             * Step 05 — Confirmation
             */
            onStepChange?.(5);

            onPaymentSubmitted?.(proof);
          }}
        />
      </div>
    );
  }

  return (
    <section
      aria-labelledby="passenger-details-heading"
      className="rounded-xl border border-slate-200 bg-white p-6"
    >
      {/* HEADER */}
      <div>
        <h2
          id="passenger-details-heading"
          className="text-2xl font-bold tracking-tight text-slate-950"
        >
          Passenger details
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Enter the visitor information before the seat hold
          expires.
        </p>
      </div>

      {/* HOLD EXPIRED */}
      {isHoldExpired && (
        <div
          className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4"
          role="alert"
        >
          <p className="text-sm font-semibold text-red-900">
            Your seat hold has expired.
          </p>

          <p className="mt-1 text-sm text-red-800">
            Please select and hold your seats again before
            continuing.
          </p>
        </div>
      )}

      {/* ERROR */}
      {errorMessage && (
        <div
          className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4"
          role="alert"
        >
          <p className="text-sm font-semibold text-red-900">
            Booking submission failed
          </p>

          <p className="mt-1 text-sm text-red-800">
            {errorMessage}
          </p>
        </div>
      )}

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5"
      >
        {/* NAME */}
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
            onChange={(event) =>
              setVisitorName(event.target.value)
            }
            disabled={isHoldExpired || isSubmitting}
            className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </div>

        {/* PHONE */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-semibold text-slate-900"
          >
            Phone
          </label>

          <input
            id="phone"
            name="visitor_phone"
            type="tel"
            required
            autoComplete="tel"
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value)
            }
            disabled={isHoldExpired || isSubmitting}
            className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </div>

        {/* EMAIL */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-slate-900"
          >
            Email
            <span className="ml-1 font-normal text-slate-400">
              (optional)
            </span>
          </label>

          <input
            id="email"
            name="visitor_email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            disabled={isHoldExpired || isSubmitting}
            className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </div>

        {/* PASSENGER SUMMARY */}
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-950">
            {passengerCount}{" "}
            {passengerCount === 1
              ? "passenger"
              : "passengers"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Passenger count is based on the number of seats
            currently held.
          </p>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={isHoldExpired || isSubmitting}
          className="min-h-11 w-full rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
        >
          {isSubmitting
            ? "Creating booking..."
            : "Continue to payment"}
        </button>
      </form>
    </section>
  );
}