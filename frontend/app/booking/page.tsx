"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import ScheduleSelector from "@/components/ScheduleSelector";
import SeatMap from "@/components/SeatMap";

import { getScheduleSeats } from "@/lib/api";
import type {
  CreateBookingResponse,
  PaymentProofResponse,
  SeatResponse,
} from "@/lib/api-types";

const steps = [
  {
    number: "01",
    title: "Select Schedule",
    description: "Choose your travel date and timing.",
  },
  {
    number: "02",
    title: "Choose Seats",
    description: "Select available seats from the bus layout.",
  },
  {
    number: "03",
    title: "Passenger Details",
    description: "Enter the required passenger information.",
  },
  {
    number: "04",
    title: "Payment",
    description: "Submit your payment details and proof.",
  },
  {
    number: "05",
    title: "Confirmation",
    description: "Receive your booking reference and status.",
  },
];

function BookingContent() {
  const searchParams = useSearchParams();

  const scheduleId = searchParams.get("schedule") ?? "";
  const selectedDate = searchParams.get("date") ?? "";
  const selectedTime = searchParams.get("time") ?? "";

  const [seats, setSeats] = useState<SeatResponse[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [seatError, setSeatError] = useState("");

  /*
   * Booking progress:
   *
   * 1 = Select Schedule
   * 2 = Choose Seats
   * 3 = Passenger Details
   * 4 = Payment
   * 5 = Confirmation
   */
  const [currentStep, setCurrentStep] = useState(
    scheduleId ? 2 : 1,
  );

  const [booking, setBooking] =
    useState<CreateBookingResponse | null>(null);

  const [paymentProof, setPaymentProof] =
    useState<PaymentProofResponse | null>(null);

  /*
   * Whenever the schedule changes:
   * - no schedule = step 1
   * - schedule selected = step 2
   *
   * Reset later booking states because a new schedule means
   * a new booking flow.
   */
  useEffect(() => {
    setCurrentStep(scheduleId ? 2 : 1);
    setBooking(null);
    setPaymentProof(null);
  }, [scheduleId]);

  /*
   * Load seats whenever a valid schedule is selected.
   */
  useEffect(() => {
    if (!scheduleId) {
      setSeats([]);
      setSeatError("");
      setLoadingSeats(false);
      return;
    }

    let cancelled = false;

    async function loadSeats() {
      setLoadingSeats(true);
      setSeatError("");

      try {
        const response = await getScheduleSeats(scheduleId);

        if (cancelled) {
          return;
        }

        setSeats(response.seats ?? []);
      } catch (error) {
        console.error("Failed to load seats:", error);

        if (!cancelled) {
          setSeats([]);
          setSeatError(
            "Unable to load the bus seats. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingSeats(false);
        }
      }
    }

    void loadSeats();

    return () => {
      cancelled = true;
    };
  }, [scheduleId]);

  function handleSeatStepChange(step: number) {
    setCurrentStep(step);
  }

  function handleBookingCreated(
    createdBooking: CreateBookingResponse,
  ) {
    setBooking(createdBooking);

    /*
     * Passenger details successfully submitted.
     * Move to Payment.
     */
    setCurrentStep(4);
  }

  function handlePaymentSubmitted(
    submittedPaymentProof: PaymentProofResponse,
  ) {
    setPaymentProof(submittedPaymentProof);

    /*
     * Payment proof successfully submitted.
     * Move to Confirmation.
     */
    setCurrentStep(5);
  }

  const scheduleSelected = Boolean(scheduleId);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f2faf6] text-[#10221b]">

      {/* =====================================================
          ANIMATIONS + LIGHT GREEN THEME
      ====================================================== */}
      <style jsx global>{`
        @keyframes bookingFadeUp {
          from {
            opacity: 0;
            transform: translateY(22px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bookingGlowMove {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.28;
          }

          50% {
            transform: translate3d(-35px, 20px, 0) scale(1.12);
            opacity: 0.42;
          }

          100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.28;
          }
        }

        @keyframes bookingDotOne {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          25% {
            transform: translate3d(-25px, 18px, 0);
          }

          50% {
            transform: translate3d(-8px, 45px, 0);
          }

          75% {
            transform: translate3d(24px, 20px, 0);
          }
        }

        @keyframes bookingDotTwo {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          30% {
            transform: translate3d(30px, -15px, 0);
          }

          60% {
            transform: translate3d(15px, 35px, 0);
          }

          80% {
            transform: translate3d(-20px, 15px, 0);
          }
        }

        @keyframes bookingDotThree {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          25% {
            transform: translate3d(20px, 25px, 0);
          }

          50% {
            transform: translate3d(-12px, 50px, 0);
          }

          75% {
            transform: translate3d(-30px, 10px, 0);
          }
        }

        @keyframes bookingFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes bookingPulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(8, 122, 86, 0.16);
          }

          50% {
            box-shadow: 0 0 0 10px rgba(8, 122, 86, 0);
          }
        }

        .booking-fade-up {
          animation: bookingFadeUp 0.7s ease-out both;
        }

        .booking-glow-move {
          animation: bookingGlowMove 7s ease-in-out infinite;
        }

        .booking-dot-one {
          animation: bookingDotOne 7s ease-in-out infinite;
        }

        .booking-dot-two {
          animation: bookingDotTwo 9s ease-in-out infinite;
        }

        .booking-dot-three {
          animation: bookingDotThree 8s ease-in-out infinite;
        }

        .booking-float {
          animation: bookingFloat 4s ease-in-out infinite;
        }

        .booking-pulse {
          animation: bookingPulse 2.5s ease-in-out infinite;
        }

        .booking-step-card {
          transition:
            transform 0.35s ease,
            box-shadow 0.35s ease,
            border-color 0.35s ease;
        }

        .booking-step-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 38px rgba(8, 122, 86, 0.13);
        }

        .booking-panel {
          transition:
            transform 0.35s ease,
            box-shadow 0.35s ease;
        }

        .booking-panel:hover {
          transform: translateY(-2px);
          box-shadow: 0 25px 70px rgba(15, 60, 45, 0.11);
        }

        @media (prefers-reduced-motion: reduce) {
          .booking-fade-up,
          .booking-glow-move,
          .booking-dot-one,
          .booking-dot-two,
          .booking-dot-three,
          .booking-float,
          .booking-pulse {
            animation: none !important;
          }

          .booking-step-card,
          .booking-panel {
            transition: none !important;
          }
        }
      `}</style>

      {/* =====================================================
          HEADER
      ====================================================== */}
      <header className="sticky top-0 z-50 border-b border-[#dceae3] bg-white/95 shadow-[0_4px_25px_rgba(8,80,55,0.05)] backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">

          <Link
            href="/"
            className="group flex items-center gap-3"
            aria-label="Back to TDCP Bahawalpur home"
          >
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_8px_20px_rgba(8,122,86,0.10)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_12px_28px_rgba(8,122,86,0.18)]">
              <Image
                src="/images/tdcp-logo.png.jpeg.jpeg"
                alt="TDCP logo"
                width={48}
                height={48}
                className="h-full w-full object-contain"
                priority
              />
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-black tracking-[0.08em] text-[#087a56]">
                TDCP
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#65736d]">
                Bahawalpur Double-Decker
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">

            <Link
              href="/"
              className="relative py-2 text-sm font-bold text-[#34433d] transition duration-300 hover:text-[#087a56]"
            >
              Home
            </Link>

            <Link
              href="/booking"
              className="relative py-2 text-sm font-black text-[#087a56]"
            >
              Bus Booking

              <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[#087a56]" />
            </Link>

            <Link
              href="/how-it-works"
              className="relative py-2 text-sm font-bold text-[#34433d] transition duration-300 hover:text-[#087a56]"
            >
              How It Works
            </Link>

            <Link
              href="/booking-status"
              className="relative py-2 text-sm font-bold text-[#34433d] transition duration-300 hover:text-[#087a56]"
            >
              Booking Status
            </Link>

          </nav>

          <Link
            href="/"
            className="rounded-full border border-[#cfe1d9] bg-white px-5 py-2.5 text-sm font-black text-[#087a56] shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#087a56] hover:bg-[#087a56] hover:text-white hover:shadow-[0_10px_25px_rgba(8,122,86,0.18)]"
          >
            ← Home
          </Link>

        </div>
      </header>

      {/* =====================================================
          PAGE INTRO
      ====================================================== */}
      <section className="relative min-h-[540px] overflow-hidden border-b border-[#d9ebe2] bg-gradient-to-br from-white via-[#f2fbf6] to-[#dff5e9]">

        {/* Large moving green glow */}
        <div className="booking-glow-move pointer-events-none absolute -right-24 -top-24 h-[430px] w-[430px] rounded-full bg-[#9ee4c4]/45 blur-3xl" />

        {/* Second soft glow */}
        <div
          className="booking-glow-move pointer-events-none absolute -bottom-32 right-[18%] h-[280px] w-[280px] rounded-full bg-[#b9ecd2]/35 blur-3xl"
          style={{ animationDelay: "2s" }}
        />

        {/* =================================================
            MOVING DOTS
        ================================================== */}

        <div className="pointer-events-none absolute right-[20%] top-[135px]">

          <span className="booking-dot-one block h-6 w-6 rounded-full bg-[#76cdae]/35 shadow-[0_5px_20px_rgba(8,122,86,0.10)]" />

        </div>

        <div className="pointer-events-none absolute right-[13%] top-[270px]">

          <span
            className="booking-dot-two block h-4 w-4 rounded-full bg-[#62bd9e]/45"
          />

        </div>

        <div className="pointer-events-none absolute right-[28%] top-[350px]">

          <span
            className="booking-dot-three block h-3 w-3 rounded-full bg-[#087a56]/20"
          />

        </div>

        <div className="booking-float pointer-events-none absolute right-[8%] top-[165px] h-2.5 w-2.5 rounded-full bg-[#087a56]/25" />

        <div className="booking-float pointer-events-none absolute right-[34%] top-[115px] h-2 w-2 rounded-full bg-[#087a56]/20" />

        <div className="relative mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">

          <div className="booking-fade-up max-w-4xl">

            <div className="flex items-center gap-4">
              <span className="h-[4px] w-12 rounded-full bg-[#087a56]" />

              <span className="text-[11px] font-black uppercase tracking-[0.28em] text-[#087a56]">
                TDCP • BAHAWALPUR
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-black leading-[0.98] tracking-[-0.055em] text-[#071c15] sm:text-5xl lg:text-7xl">
              Book your Double-Decker
              <span className="block text-[#087a56]">
                Bus seat.
              </span>
            </h1>

            <p className="mt-7 max-w-3xl text-base leading-8 text-[#596962] sm:text-lg lg:text-xl">
              Select your schedule, choose your preferred seat and
              complete your passenger and payment details through our
              simple booking process.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <span className="booking-pulse rounded-full border border-[#c7e5d6] bg-white/90 px-5 py-2.5 text-xs font-black text-[#087a56] shadow-[0_8px_20px_rgba(8,122,86,0.08)] backdrop-blur">
                Easy Booking
              </span>

              <span className="rounded-full border border-[#c7e5d6] bg-white/90 px-5 py-2.5 text-xs font-black text-[#087a56] shadow-[0_8px_20px_rgba(8,122,86,0.08)] backdrop-blur transition duration-300 hover:-translate-y-1">
                Secure Payment
              </span>

              <span className="rounded-full border border-[#c7e5d6] bg-white/90 px-5 py-2.5 text-xs font-black text-[#087a56] shadow-[0_8px_20px_rgba(8,122,86,0.08)] backdrop-blur transition duration-300 hover:-translate-y-1">
                Quick Confirmation
              </span>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          BOOKING STEPS
      ====================================================== */}
      <section className="bg-[#eef9f4] px-4 py-8 sm:px-6 lg:px-12 lg:py-10">
        <div className="mx-auto max-w-[1400px]">

          <div className="grid gap-3 md:grid-cols-5">

            {steps.map((step, index) => {
              const stepNumber = index + 1;

              const active = currentStep === stepNumber;
              const completed = currentStep > stepNumber;

              return (
                <div
                  key={step.number}
                  className={`booking-step-card booking-fade-up rounded-2xl border p-4 ${
                    active || completed
                      ? "border-[#087a56] bg-gradient-to-br from-[#087a56] to-[#066746] text-white shadow-[0_12px_30px_rgba(8,122,86,0.16)]"
                      : "border-[#d5e8df] bg-white"
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="flex items-start gap-3">

                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                        active || completed
                          ? "bg-white text-[#087a56]"
                          : "bg-[#e4f5ec] text-[#087a56]"
                      }`}
                    >
                      {step.number}
                    </span>

                    <div>
                      <p
                        className={`text-sm font-black ${
                          active || completed
                            ? "text-white"
                            : "text-[#17251f]"
                        }`}
                      >
                        {step.title}
                      </p>

                      <p
                        className={`mt-1 text-xs leading-5 ${
                          active || completed
                            ? "text-white/75"
                            : "text-[#718079]"
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>

                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* =====================================================
          STEP 01 — SCHEDULE
      ====================================================== */}
      {!scheduleSelected && (
        <section className="bg-[#f2faf6] px-4 pb-16 sm:px-6 lg:px-12 lg:pb-24">
          <div className="mx-auto max-w-[1400px]">

            <div className="booking-panel overflow-hidden rounded-[28px] border border-[#d4e8de] bg-white shadow-[0_20px_60px_rgba(15,60,45,0.08)]">

              <div className="relative overflow-hidden border-b border-[#e1eee8] bg-gradient-to-r from-[#f8fdfb] to-[#e8f7ef] px-5 py-5 sm:px-8">

                <div className="pointer-events-none absolute right-0 top-0 h-full w-40 bg-[#8dd9b4]/15 blur-3xl" />

                <p className="relative text-xs font-black uppercase tracking-[0.2em] text-[#087a56]">
                  Reservation
                </p>

                <h2 className="relative mt-1 text-2xl font-black tracking-[-0.03em] text-[#10221b]">
                  Select your journey
                </h2>

              </div>

              <div className="p-5 sm:p-8 lg:p-10">
                <ScheduleSelector />
              </div>

            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          STEPS 02–05
      ====================================================== */}
      {scheduleSelected && (
        <section className="bg-[#f2faf6] px-4 pb-16 sm:px-6 lg:px-12 lg:pb-24">
          <div className="mx-auto max-w-[1400px] space-y-6">

            {/* JOURNEY SUMMARY */}
            <div className="booking-panel rounded-[28px] border border-[#d4e8de] bg-white p-6 shadow-[0_20px_60px_rgba(15,60,45,0.08)] sm:p-8">

              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#087a56]">
                    Selected Journey
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-[#10221b]">
                    Bahawalpur Double-Decker
                  </h2>

                  <div className="mt-3 flex flex-wrap gap-3">

                    {selectedDate && (
                      <span className="rounded-full bg-[#e4f5ec] px-4 py-2 text-sm font-bold text-[#087a56]">
                        📅 {selectedDate}
                      </span>
                    )}

                    {selectedTime && (
                      <span className="rounded-full bg-[#e4f5ec] px-4 py-2 text-sm font-bold text-[#087a56]">
                        🕐 {selectedTime}
                      </span>
                    )}

                  </div>
                </div>

                <Link
                  href="/booking"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#cfded7] px-5 py-3 text-sm font-black text-[#087a56] transition duration-300 hover:-translate-y-1 hover:border-[#087a56] hover:bg-[#f4faf7] hover:shadow-md"
                >
                  ← Change Schedule
                </Link>

              </div>
            </div>

            {/* STEP 02 — SEAT MAP */}
            {!booking && (
              <div className="booking-panel overflow-hidden rounded-[28px] border border-[#d4e8de] bg-white shadow-[0_20px_60px_rgba(15,60,45,0.08)]">

                <div className="border-b border-[#e1eee8] bg-gradient-to-r from-[#f8fdfb] to-[#e8f7ef] px-5 py-5 sm:px-8">

                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#087a56]">
                    Step 02
                  </p>

                  <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-[#10221b]">
                    Choose your seats
                  </h2>

                </div>

                <div className="p-5 sm:p-8 lg:p-10">

                  {loadingSeats && (
                    <div className="rounded-2xl border border-[#dce8e2] bg-[#eef9f4] p-10 text-center">

                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#d9e8e1] border-t-[#087a56]" />

                      <p className="mt-4 text-sm font-bold text-[#596962]">
                        Loading available seats...
                      </p>

                    </div>
                  )}

                  {!loadingSeats && seatError && (
                    <div
                      className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700"
                      role="alert"
                    >
                      {seatError}
                    </div>
                  )}

                  {!loadingSeats &&
                    !seatError &&
                    seats.length > 0 && (
                      <SeatMap
                        scheduleId={scheduleId}
                        seats={seats}
                        onStepChange={handleSeatStepChange}
                      />
                    )}

                  {!loadingSeats &&
                    !seatError &&
                    seats.length === 0 && (
                      <div className="rounded-2xl border border-[#dce8e2] bg-[#eef9f4] p-8 text-center">

                        <p className="text-base font-black text-[#10221b]">
                          No seats are available for this schedule.
                        </p>

                        <p className="mt-2 text-sm text-[#718079]">
                          Please choose another schedule.
                        </p>

                      </div>
                    )}

                </div>
              </div>
            )}

            {/* =================================================
                BOOKING / PAYMENT / CONFIRMATION
            ================================================== */}
            {booking && (
              <div className="space-y-6">

                <div className="booking-panel rounded-[28px] border border-green-200 bg-gradient-to-br from-green-50 to-[#e5f7ed] p-6 sm:p-8">

                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#087a56]">
                    Step 03
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-[#10221b]">
                    Passenger details completed
                  </h2>

                  <p className="mt-2 text-sm text-[#596962]">
                    Booking{" "}
                    <span className="font-bold text-[#10221b]">
                      {booking.booking_ref}
                    </span>{" "}
                    has been created. Continue with payment below.
                  </p>

                </div>

                {!paymentProof && (
                  <div className="booking-panel rounded-[28px] border border-[#dce8e2] bg-white p-6 shadow-[0_20px_60px_rgba(15,60,45,0.08)] sm:p-8">

                    <div className="rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-[#e8f8ef] p-5">

                      <p className="text-sm font-black text-green-900">
                        Step 04 — Payment
                      </p>

                      <p className="mt-1 text-sm text-green-800">
                        Complete your payment and submit the payment
                        proof below.
                      </p>

                    </div>

                    {/* PaymentProofForm is rendered by PassengerDetailsForm
                        inside SeatMap. */}

                  </div>
                )}

                {paymentProof && (
                  <div className="booking-panel rounded-[28px] border border-green-200 bg-gradient-to-br from-green-50 to-[#e5f7ed] p-6 shadow-[0_20px_60px_rgba(15,60,45,0.08)] sm:p-8">

                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#087a56]">
                      Step 05
                    </p>

                    <h2 className="mt-2 text-3xl font-black text-[#10221b]">
                      Booking confirmed
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-[#596962]">
                      Your payment proof has been received successfully
                      and is now waiting for administrator verification.
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">

                      <div className="booking-panel rounded-xl border border-green-200 bg-white p-5">

                        <p className="text-xs font-black uppercase tracking-wide text-[#718079]">
                          Booking reference
                        </p>

                        <p className="mt-2 text-xl font-black text-[#087a56]">
                          {booking.booking_ref}
                        </p>

                      </div>

                      <div className="booking-panel rounded-xl border border-green-200 bg-white p-5">

                        <p className="text-xs font-black uppercase tracking-wide text-[#718079]">
                          Payment status
                        </p>

                        <p className="mt-2 text-sm font-black capitalize text-[#10221b]">
                          {paymentProof.status.replace(
                            /_/g,
                            " ",
                          )}
                        </p>

                      </div>

                    </div>

                    <div className="mt-6 rounded-xl border border-green-200 bg-white p-5">

                      <p className="text-sm font-black text-[#10221b]">
                        What happens next?
                      </p>

                      <p className="mt-2 text-sm leading-6 text-[#596962]">
                        Our administrator will review your payment proof.
                        Your final booking status will be updated after
                        verification.
                      </p>

                    </div>

                    <Link
                      href={`/booking-status?booking=${encodeURIComponent(
                        booking.booking_ref,
                      )}`}
                      className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#087a56] to-[#066746] px-6 py-3 text-sm font-black text-white shadow-[0_10px_25px_rgba(8,122,86,0.18)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(8,122,86,0.25)]"
                    >
                      Check Booking Status →
                    </Link>

                  </div>
                )}

              </div>
            )}

          </div>
        </section>
      )}

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="relative overflow-hidden border-t border-white/10 bg-gradient-to-r from-[#063d2e] via-[#075c46] to-[#087a56] px-5 py-9 text-white sm:px-8 lg:px-12">

        <div className="booking-glow-move pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#7de2b5]/10 blur-3xl" />

        <div className="relative mx-auto max-w-[1400px]">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-base font-black">
                Bahawalpur Double-Decker Bus
              </p>

              <p className="mt-1 text-xs text-white/60">
                TDCP Reservation System
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex w-fit items-center rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-xs font-bold text-white/80 backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white/15 hover:text-white"
            >
              ← Return to Home
            </Link>

          </div>

          <div className="my-6 h-px bg-white/10" />

          <div className="text-center">

            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">
              Developed by
            </p>

            <p className="mt-2 text-sm font-black tracking-wide text-white">
              Naina Nayab
              <span className="mx-2 text-[#7de2b5]">
                &
              </span>
              Imran Mansha
            </p>

            <p className="mt-2 text-[9px] font-medium text-white/40">
              © 2026 BWP AI Travel Agent. All rights reserved.
            </p>

          </div>

        </div>
      </footer>

    </main>
  );
}

function BookingPageFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f2faf6]">
      <div className="text-center">

        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#d9e8e1] border-t-[#087a56]" />

        <p className="mt-4 text-sm font-bold text-[#596962]">
          Loading booking...
        </p>

      </div>
    </main>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<BookingPageFallback />}>
      <BookingContent />
    </Suspense>
  );
}