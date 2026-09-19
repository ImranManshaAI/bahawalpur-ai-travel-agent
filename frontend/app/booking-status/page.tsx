"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Booking = {
  id?: string;
  booking_reference?: string;
  status?: string;
  visitor_name?: string;
  phone?: string;
  email?: string;
  passenger_count?: number;
  total_price?: number;
  created_at?: string;
};

/* =========================================================
   FLOATING DOTS
========================================================= */

const floatingDots = [
  {
    className: "left-[4%] top-[14%] h-2.5 w-2.5 bg-[#087a56]/70",
    delay: "0s",
    duration: "6s",
  },
  {
    className: "left-[9%] top-[32%] h-4 w-4 bg-[#54bd96]/45",
    delay: "1.2s",
    duration: "8s",
  },
  {
    className: "left-[15%] top-[51%] h-2 w-2 bg-[#087a56]/60",
    delay: "0.5s",
    duration: "7s",
  },
  {
    className: "left-[8%] top-[76%] h-5 w-5 bg-[#70caaa]/35",
    delay: "2s",
    duration: "9s",
  },
  {
    className: "left-[22%] top-[20%] h-3 w-3 bg-[#38ad80]/55",
    delay: "1.5s",
    duration: "7.5s",
  },
  {
    className: "left-[27%] top-[42%] h-2 w-2 bg-[#087a56]/55",
    delay: "2.5s",
    duration: "6.5s",
  },
  {
    className: "left-[31%] top-[72%] h-3.5 w-3.5 bg-[#65c6a2]/50",
    delay: "0.8s",
    duration: "8.5s",
  },
  {
    className: "left-[39%] top-[11%] h-2.5 w-2.5 bg-[#8bd7bd]/75",
    delay: "3s",
    duration: "7s",
  },
  {
    className: "left-[43%] top-[84%] h-4 w-4 bg-[#3fb589]/40",
    delay: "1s",
    duration: "9s",
  },
  {
    className: "left-[48%] top-[27%] h-2 w-2 bg-[#087a56]/65",
    delay: "2.2s",
    duration: "6s",
  },
  {
    className: "left-[52%] top-[64%] h-3 w-3 bg-[#64c6a1]/55",
    delay: "0.3s",
    duration: "8s",
  },
  {
    className: "right-[44%] top-[15%] h-2.5 w-2.5 bg-[#79ceb0]/70",
    delay: "1.8s",
    duration: "7.5s",
  },
  {
    className: "right-[38%] top-[38%] h-4 w-4 bg-[#43b88d]/40",
    delay: "2.8s",
    duration: "9s",
  },
  {
    className: "right-[31%] top-[57%] h-2 w-2 bg-[#087a56]/65",
    delay: "0.7s",
    duration: "6.5s",
  },
  {
    className: "right-[25%] top-[80%] h-3.5 w-3.5 bg-[#6bc9a5]/50",
    delay: "1.4s",
    duration: "8.5s",
  },
  {
    className: "right-[18%] top-[18%] h-5 w-5 bg-[#8cdbc0]/35",
    delay: "2.4s",
    duration: "10s",
  },
  {
    className: "right-[13%] top-[41%] h-2.5 w-2.5 bg-[#087a56]/60",
    delay: "0.4s",
    duration: "7s",
  },
  {
    className: "right-[8%] top-[64%] h-3 w-3 bg-[#51bd96]/55",
    delay: "1.7s",
    duration: "8s",
  },
  {
    className: "right-[4%] top-[84%] h-2 w-2 bg-[#087a56]/55",
    delay: "2.7s",
    duration: "6.5s",
  },
  {
    className: "left-[12%] top-[91%] h-3 w-3 bg-[#74cdb0]/45",
    delay: "0.9s",
    duration: "9s",
  },
  {
    className: "left-[35%] top-[92%] h-2 w-2 bg-[#087a56]/55",
    delay: "2.1s",
    duration: "7s",
  },
  {
    className: "right-[36%] top-[91%] h-3 w-3 bg-[#57bf99]/50",
    delay: "1.1s",
    duration: "8s",
  },
  {
    className: "right-[7%] top-[9%] h-2.5 w-2.5 bg-[#087a56]/60",
    delay: "2.9s",
    duration: "7.5s",
  },
  {
    className: "left-[2%] top-[57%] h-3.5 w-3.5 bg-[#5fc39d]/45",
    delay: "1.3s",
    duration: "8.5s",
  },
  {
    className: "right-[48%] top-[49%] h-2 w-2 bg-[#087a56]/50",
    delay: "0.6s",
    duration: "6s",
  },
];

export default function BookingStatusPage() {
  const [reference, setReference] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setBooking(null);

    if (!reference.trim() && !phone.trim() && !email.trim()) {
      setError(
        "Please enter a booking reference, phone number, or email.",
      );
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams();

      if (reference.trim()) {
        params.set("ref", reference.trim());
      } else if (phone.trim()) {
        params.set("phone", phone.trim());
      } else if (email.trim()) {
        params.set("email", email.trim());
      }

      const response = await fetch(
        `${API_URL}/bookings/status?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error?.message ||
            "Booking could not be found.",
        );
      }

      const data = result?.data;

      if (!data) {
        throw new Error("No booking was found.");
      }

      setBooking(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to check booking status.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#eaf7f1] text-[#10231b]">
      {/* =====================================================
          ANIMATIONS
      ====================================================== */}

      <style jsx>{`
        @keyframes floatDot {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
            opacity: 0.35;
          }

          25% {
            transform: translate3d(16px, -20px, 0);
            opacity: 0.85;
          }

          50% {
            transform: translate3d(-10px, -38px, 0);
            opacity: 0.55;
          }

          75% {
            transform: translate3d(-22px, -12px, 0);
            opacity: 0.8;
          }
        }

        @keyframes floatDotReverse {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          25% {
            transform: translate3d(-18px, 18px, 0);
          }

          50% {
            transform: translate3d(12px, 35px, 0);
          }

          75% {
            transform: translate3d(24px, 10px, 0);
          }
        }

        @keyframes pulseLine {
          0%,
          100% {
            opacity: 0.25;
            transform: scaleX(0.72);
          }

          50% {
            opacity: 0.9;
            transform: scaleX(1);
          }
        }

        @keyframes lineMove {
          0%,
          100% {
            transform: translateX(0);
            opacity: 0.25;
          }

          50% {
            transform: translateX(12px);
            opacity: 0.75;
          }
        }

        @keyframes softFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-7px);
          }
        }

        @keyframes cardGlow {
          0%,
          100% {
            box-shadow: 0 20px 55px rgba(14, 82, 61, 0.08);
          }

          50% {
            box-shadow: 0 28px 70px rgba(14, 82, 61, 0.16);
          }
        }

        @keyframes bubblePulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.25;
          }

          50% {
            transform: scale(1.12);
            opacity: 0.45;
          }
        }

        @keyframes orbit {
          from {
            transform: rotate(0deg) translateX(55px) rotate(0deg);
          }

          to {
            transform: rotate(360deg) translateX(55px)
              rotate(-360deg);
          }
        }

        .floating-dot {
          animation-name: floatDot;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        .floating-dot:nth-child(even) {
          animation-name: floatDotReverse;
        }

        .pulse-line {
          animation: pulseLine 4s ease-in-out infinite;
          transform-origin: center;
        }

        .line-move {
          animation: lineMove 5s ease-in-out infinite;
        }

        .soft-float {
          animation: softFloat 5s ease-in-out infinite;
        }

        .card-glow {
          animation: cardGlow 5s ease-in-out infinite;
        }

        .bubble-pulse {
          animation: bubblePulse 6s ease-in-out infinite;
        }

        .orbit-dot {
          animation: orbit 8s linear infinite;
          transform-origin: center;
        }

        @media (prefers-reduced-motion: reduce) {
          .floating-dot,
          .pulse-line,
          .line-move,
          .soft-float,
          .card-glow,
          .bubble-pulse,
          .orbit-dot {
            animation: none !important;
          }
        }
      `}</style>

      {/* =====================================================
          MOVING BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* 25 moving dots */}

        {floatingDots.map((dot, index) => (
          <span
            key={index}
            className={`floating-dot absolute rounded-full blur-[0.2px] ${dot.className}`}
            style={{
              animationDelay: dot.delay,
              animationDuration: dot.duration,
            }}
          />
        ))}

        {/* LARGE SOFT GREEN BUBBLES */}

        <div className="bubble-pulse absolute -right-40 top-0 h-[520px] w-[520px] rounded-full bg-[#83d7b7]/25 blur-3xl" />

        <div
          className="bubble-pulse absolute -left-48 top-[34%] h-[460px] w-[460px] rounded-full bg-[#bcebd7]/55 blur-3xl"
          style={{ animationDelay: "1.5s" }}
        />

        <div
          className="bubble-pulse absolute right-[20%] top-[48%] h-[260px] w-[260px] rounded-full bg-[#79cdae]/15 blur-3xl"
          style={{ animationDelay: "2.5s" }}
        />

        {/* ORBITING DOT */}

        <div className="absolute right-[8%] top-[26%] hidden h-32 w-32 rounded-full border border-[#55bd96]/20 lg:block">
          <span className="orbit-dot absolute left-1/2 top-1/2 h-3 w-3 rounded-full bg-[#087a56]/60 shadow-[0_0_0_7px_rgba(8,122,86,0.08)]" />
        </div>

        {/* SHORT FLOATING LINES */}

        <div className="line-move absolute left-[5%] top-[27%] hidden items-center gap-2 lg:flex">
          <span className="h-[2px] w-12 rounded-full bg-[#087a56]/40" />
          <span className="h-2 w-2 rounded-full bg-[#087a56]/60" />
          <span className="h-[2px] w-7 rounded-full bg-[#087a56]/25" />
        </div>

        <div
          className="line-move absolute right-[5%] top-[53%] hidden items-center gap-2 lg:flex"
          style={{ animationDelay: "1.4s" }}
        >
          <span className="h-2 w-2 rounded-full bg-[#087a56]/55" />
          <span className="h-[2px] w-8 rounded-full bg-[#087a56]/30" />
          <span className="h-[2px] w-14 rounded-full bg-[#087a56]/45" />
        </div>

        <div
          className="line-move absolute left-[19%] top-[86%] hidden items-center gap-2 lg:flex"
          style={{ animationDelay: "2s" }}
        >
          <span className="h-2 w-2 rounded-full bg-[#087a56]/50" />
          <span className="h-[2px] w-10 rounded-full bg-[#087a56]/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#087a56]/55" />
        </div>

        <div
          className="line-move absolute right-[22%] top-[12%] hidden items-center gap-2 lg:flex"
          style={{ animationDelay: "0.8s" }}
        >
          <span className="h-[2px] w-9 rounded-full bg-[#087a56]/30" />
          <span className="h-2 w-2 rounded-full bg-[#087a56]/60" />
          <span className="h-[2px] w-12 rounded-full bg-[#087a56]/35" />
        </div>
      </div>

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#cfe5da] bg-white/95 shadow-[0_4px_25px_rgba(12,72,53,0.07)] backdrop-blur-xl">
        <div className="mx-auto flex h-[82px] max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            {/* LOGO ICON */}

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#bfe3d3] bg-[#e4f6ee] text-[#075c46] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_20px_rgba(0,123,94,0.18)]">
              <svg
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5 17h14M6 17V7.5A2.5 2.5 0 0 1 8.5 5h7A2.5 2.5 0 0 1 18 7.5V17M4 10h16M8 20h2M14 20h2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                <circle
                  cx="8"
                  cy="14"
                  r="1"
                  fill="currentColor"
                />

                <circle
                  cx="16"
                  cy="14"
                  r="1"
                  fill="currentColor"
                />
              </svg>
            </div>

            {/* BRAND TEXT */}

            <div className="hidden sm:block">
              <p className="text-sm font-black tracking-[0.08em] text-[#075c46]">
                TDCP
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#40524a]">
                Bahawalpur Double-Decker
              </p>
            </div>
          </Link>

          {/* NAVIGATION */}

          <nav className="hidden items-center gap-7 md:flex">
            <Link
              href="/"
              className="font-bold text-[#243a31] transition hover:text-[#075c46]"
            >
              Home
            </Link>

            <Link
              href="/routes"
              className="font-bold text-[#243a31] transition hover:text-[#075c46]"
            >
              Routes
            </Link>

            <Link
              href="/booking"
              className="font-bold text-[#243a31] transition hover:text-[#075c46]"
            >
              Bus Booking
            </Link>

            <Link
              href="/how-it-works"
              className="font-bold text-[#243a31] transition hover:text-[#075c46]"
            >
              How It Works
            </Link>

            <Link
              href="/booking-status"
              className="relative py-2 font-black text-[#075c46]"
            >
              Booking Status

              <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[#075c46]" />
            </Link>
          </nav>

          {/* BOOK BUTTON */}

          <Link
            href="/booking"
            className="rounded-full bg-[#075c46] px-5 py-3 text-sm font-black text-white shadow-[0_10px_25px_rgba(8,92,70,0.20)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#064936] hover:shadow-[0_14px_30px_rgba(8,92,70,0.28)]"
          >
            Book a Seat
          </Link>
        </div>
      </header>

      {/* =====================================================
          HERO / SEARCH
      ====================================================== */}

      <section className="relative z-10 overflow-hidden border-b border-[#cfe5da]">
        {/* HERO BACKGROUND */}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(76,190,145,0.25),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(126,211,177,0.20),transparent_35%),linear-gradient(135deg,#ffffff_0%,#f0faf5_45%,#dcefe6_100%)]" />

        {/* TOP SHORT LINE */}

        <div className="pointer-events-none absolute right-[8%] top-[25%] hidden items-center gap-3 lg:flex">
          <span className="pulse-line h-[2px] w-28 rounded-full bg-[#43b58a]" />

          <span className="h-3 w-3 rounded-full bg-[#4dbd94] shadow-[0_0_0_8px_rgba(77,189,148,0.10)]" />

          <span className="h-[2px] w-8 rounded-full bg-[#43b58a]/30" />
        </div>

        {/* SECOND SHORT LINE */}

        <div className="pointer-events-none absolute bottom-[20%] right-[28%] hidden items-center gap-3 lg:flex">
          <span className="h-2.5 w-2.5 rounded-full bg-[#58c39d]" />

          <span
            className="pulse-line h-[2px] w-20 rounded-full bg-[#83d2b5]"
            style={{ animationDelay: "1s" }}
          />

          <span className="h-2 w-2 rounded-full bg-[#087a56]/50" />
        </div>

        {/* LEFT SHORT LINE */}

        <div className="pointer-events-none absolute bottom-[27%] left-[8%] hidden items-center gap-2 lg:flex">
          <span className="h-2 w-2 rounded-full bg-[#087a56]/60" />

          <span
            className="pulse-line h-[2px] w-16 rounded-full bg-[#62c5a0]"
            style={{ animationDelay: "1.8s" }}
          />

          <span className="h-2.5 w-2.5 rounded-full bg-[#71cdb0]/70" />
        </div>

        <div className="relative mx-auto max-w-[1320px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            {/* LABEL */}

            <div className="flex items-center justify-center gap-3">
              <span className="h-[3px] w-10 rounded-full bg-[#075c46]" />

              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#075c46]">
                TDCP • BAHAWALPUR
              </p>

              <span className="h-[3px] w-10 rounded-full bg-[#075c46]" />
            </div>

            {/* HEADING */}

            <h1 className="mt-5 text-4xl font-black tracking-[-0.05em] text-[#061b13] sm:text-5xl lg:text-6xl">
              Check Your
              <span className="block text-[#075c46]">
                Booking Status
              </span>
            </h1>

            {/* DESCRIPTION */}

            <p className="mx-auto mt-5 max-w-[650px] text-base leading-7 text-[#4f6259] sm:text-lg">
              Enter your booking reference, phone number, or email
              to quickly find your reservation and view its current
              status.
            </p>

            {/* CENTER DOT LINE */}

            <div className="mt-7 flex items-center justify-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#075c46]" />

              <span className="pulse-line h-[2px] w-20 rounded-full bg-[#54bd96]" />

              <span className="h-3 w-3 rounded-full bg-[#61c5a0]" />

              <span
                className="pulse-line h-[2px] w-20 rounded-full bg-[#54bd96]"
                style={{ animationDelay: "0.7s" }}
              />

              <span className="h-2 w-2 rounded-full bg-[#075c46]" />
            </div>
          </div>

          {/* =================================================
              SEARCH CARD
          ================================================== */}

          <div className="card-glow mx-auto mt-12 max-w-[1000px] rounded-[28px] border border-[#c8e2d6] bg-white/95 p-6 backdrop-blur sm:p-8 lg:p-10">
            <form
              onSubmit={handleSearch}
              className="grid gap-5"
            >
              {/* REFERENCE */}

              <div>
                <label
                  htmlFor="reference"
                  className="text-xs font-black uppercase tracking-[0.12em] text-[#3f5149]"
                >
                  Booking Reference
                </label>

                <input
                  id="reference"
                  type="text"
                  value={reference}
                  onChange={(event) =>
                    setReference(event.target.value)
                  }
                  placeholder="e.g. BWP-123456"
                  className="mt-2 h-14 w-full rounded-xl border border-[#d0e2d9] bg-[#f7fcfa] px-4 text-sm font-semibold text-[#10231b] outline-none transition duration-300 placeholder:text-[#8b9992] focus:border-[#075c46] focus:bg-white focus:ring-4 focus:ring-[#075c46]/10"
                />
              </div>

              {/* OR */}

              <div className="flex items-center gap-4">
                <span className="h-px flex-1 bg-[#d8e8e0]" />

                <span className="rounded-full bg-[#e4f5ed] px-3 py-1 text-[10px] font-black tracking-[0.15em] text-[#075c46]">
                  OR
                </span>

                <span className="h-px flex-1 bg-[#d8e8e0]" />
              </div>

              {/* PHONE + EMAIL */}

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="phone"
                    className="text-xs font-black uppercase tracking-[0.12em] text-[#3f5149]"
                  >
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                    placeholder="03XX XXXXXXX"
                    className="mt-2 h-14 w-full rounded-xl border border-[#d0e2d9] bg-[#f7fcfa] px-4 text-sm font-semibold text-[#10231b] outline-none transition duration-300 placeholder:text-[#8b9992] focus:border-[#075c46] focus:bg-white focus:ring-4 focus:ring-[#075c46]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="text-xs font-black uppercase tracking-[0.12em] text-[#3f5149]"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="your@email.com"
                    className="mt-2 h-14 w-full rounded-xl border border-[#d0e2d9] bg-[#f7fcfa] px-4 text-sm font-semibold text-[#10231b] outline-none transition duration-300 placeholder:text-[#8b9992] focus:border-[#075c46] focus:bg-white focus:ring-4 focus:ring-[#075c46]/10"
                  />
                </div>
              </div>

              {/* ERROR */}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              {/* BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 h-14 rounded-xl bg-[#075c46] text-sm font-black text-white shadow-[0_12px_28px_rgba(8,92,70,0.20)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#064936] hover:shadow-[0_16px_35px_rgba(8,92,70,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Checking Booking..."
                  : "Check Booking Status →"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* =====================================================
          RESULT
      ====================================================== */}

      {booking && (
        <section className="relative z-10 px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
          <div className="mx-auto max-w-[1000px]">
            <div className="soft-float rounded-[28px] border border-[#c9e4d7] bg-white p-6 shadow-[0_20px_55px_rgba(14,82,61,0.10)] sm:p-8">
              <div className="flex flex-col gap-4 border-b border-[#dce9e3] pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#075c46] shadow-[0_0_0_6px_rgba(8,92,70,0.08)]" />

                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#075c46]">
                      Booking Found
                    </p>
                  </div>

                  <h2 className="mt-3 text-2xl font-black text-[#10231b] sm:text-3xl">
                    {booking.booking_reference ||
                      booking.id ||
                      "Booking"}
                  </h2>
                </div>

                <span className="w-fit rounded-full bg-[#e3f5ed] px-4 py-2 text-xs font-black uppercase tracking-wide text-[#075c46] shadow-sm">
                  {booking.status || "Unknown"}
                </span>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* PASSENGER */}

                <div className="rounded-2xl border border-[#d8e9e1] bg-[#f5fbf8] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#91d0b5] hover:shadow-[0_12px_25px_rgba(14,82,61,0.08)]">
                  <p className="text-xs font-bold text-[#66766e]">
                    Passenger
                  </p>

                  <p className="mt-2 font-black text-[#10231b]">
                    {booking.visitor_name || "—"}
                  </p>
                </div>

                {/* PHONE */}

                <div className="rounded-2xl border border-[#d8e9e1] bg-[#f5fbf8] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#91d0b5] hover:shadow-[0_12px_25px_rgba(14,82,61,0.08)]">
                  <p className="text-xs font-bold text-[#66766e]">
                    Phone
                  </p>

                  <p className="mt-2 font-black text-[#10231b]">
                    {booking.phone || "—"}
                  </p>
                </div>

                {/* EMAIL */}

                <div className="rounded-2xl border border-[#d8e9e1] bg-[#f5fbf8] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#91d0b5] hover:shadow-[0_12px_25px_rgba(14,82,61,0.08)]">
                  <p className="text-xs font-bold text-[#66766e]">
                    Email
                  </p>

                  <p className="mt-2 break-words font-black text-[#10231b]">
                    {booking.email || "—"}
                  </p>
                </div>

                {/* PASSENGERS */}

                <div className="rounded-2xl border border-[#d8e9e1] bg-[#f5fbf8] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#91d0b5] hover:shadow-[0_12px_25px_rgba(14,82,61,0.08)]">
                  <p className="text-xs font-bold text-[#66766e]">
                    Passengers
                  </p>

                  <p className="mt-2 font-black text-[#10231b]">
                    {booking.passenger_count ?? "—"}
                  </p>
                </div>

                {/* TOTAL */}

                <div className="rounded-2xl border border-[#d8e9e1] bg-[#f5fbf8] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#91d0b5] hover:shadow-[0_12px_25px_rgba(14,82,61,0.08)]">
                  <p className="text-xs font-bold text-[#66766e]">
                    Total Amount
                  </p>

                  <p className="mt-2 font-black text-[#075c46]">
                    {booking.total_price !== undefined
                      ? `PKR ${booking.total_price}`
                      : "—"}
                  </p>
                </div>

                {/* DATE */}

                <div className="rounded-2xl border border-[#d8e9e1] bg-[#f5fbf8] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#91d0b5] hover:shadow-[0_12px_25px_rgba(14,82,61,0.08)]">
                  <p className="text-xs font-bold text-[#66766e]">
                    Booking Date
                  </p>

                  <p className="mt-2 font-black text-[#10231b]">
                    {booking.created_at
                      ? new Date(
                          booking.created_at,
                        ).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          HELP
      ====================================================== */}

      <section className="relative z-10 px-5 pb-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1000px] rounded-[24px] border border-[#c9e4d7] bg-[#e3f5ed] p-7 text-center shadow-[0_12px_35px_rgba(14,82,61,0.06)]">
          <p className="text-sm font-semibold text-[#52635b]">
            Don&apos;t have a booking reference?
          </p>

          <Link
            href="/booking"
            className="mt-2 inline-flex font-black text-[#075c46] transition hover:-translate-y-0.5 hover:text-[#064936]"
          >
            Make a new reservation →
          </Link>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="relative z-10 overflow-hidden border-t border-[#064936] bg-[#064936] px-5 py-10 text-white sm:px-8 lg:px-12">
        {/* FOOTER GLOW */}

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(126,221,183,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(41,154,111,0.18),transparent_35%)]" />

        {/* FOOTER DOTS */}

        <span
          className="floating-dot absolute left-[8%] top-[25%] h-2.5 w-2.5 rounded-full bg-[#9de3c9]/60"
          style={{
            animationDuration: "7s",
            animationDelay: "0.5s",
          }}
        />

        <span
          className="floating-dot absolute left-[42%] top-[70%] h-2 w-2 rounded-full bg-[#8edcc1]/50"
          style={{
            animationDuration: "8s",
            animationDelay: "1.5s",
          }}
        />

        <span
          className="floating-dot absolute right-[12%] top-[28%] h-3 w-3 rounded-full bg-[#a4e5ce]/55"
          style={{
            animationDuration: "9s",
            animationDelay: "2s",
          }}
        />

        <div className="relative mx-auto max-w-[1320px]">
          <div className="grid gap-8 md:grid-cols-3 md:items-center">
            {/* BRAND */}

            <div>
              <p className="text-lg font-black tracking-tight text-white">
                Bahawalpur Double-Decker Bus
              </p>

              <p className="mt-2 text-sm font-medium text-white/85">
                TDCP Reservation System
              </p>
            </div>

            {/* QUICK LINKS */}

            <div className="flex flex-wrap gap-x-6 gap-y-3 md:justify-center">
              <Link
                href="/"
                className="text-sm font-bold text-white/85 transition hover:text-white"
              >
                Home
              </Link>

              <Link
                href="/routes"
                className="text-sm font-bold text-white/85 transition hover:text-white"
              >
                Routes
              </Link>

              <Link
                href="/booking"
                className="text-sm font-bold text-white/85 transition hover:text-white"
              >
                Booking
              </Link>

              <Link
                href="/how-it-works"
                className="text-sm font-bold text-white/85 transition hover:text-white"
              >
                How It Works
              </Link>
            </div>

            {/* STATUS */}

            <div className="md:text-right">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#a7e8d0]" />

                <span className="text-xs font-bold text-white">
                  Booking Status
                </span>
              </div>
            </div>
          </div>

          {/* FOOTER LINE */}

          <div className="mt-8 flex items-center gap-3">
            <span className="h-[2px] w-16 rounded-full bg-[#a8e6d0]/80" />

            <span className="h-2 w-2 rounded-full bg-[#a8e6d0]" />

            <span className="pulse-line h-[1px] flex-1 bg-white/35" />

            <span className="h-2 w-2 rounded-full bg-[#a8e6d0]/80" />

            <span className="h-[2px] w-10 rounded-full bg-[#a8e6d0]/50" />
          </div>

          {/* COPYRIGHT */}

          <div className="mt-6 flex flex-col gap-3 text-xs text-white/75 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} BWP AI Travel Agent. All
              rights reserved.
            </p>

            <p className="font-bold tracking-wide text-white">
              Developed by Naina Nayab &amp; Imran Munsha
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}