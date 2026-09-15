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
        "Please enter a booking reference, phone number, or email."
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
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error?.message ||
            "Booking could not be found."
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
          : "Unable to check booking status."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f8f6] text-[#10231b]">

      {/* HEADER */}
      <header className="border-b border-[#dce6e1] bg-white">
        <div className="mx-auto flex h-[82px] max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-12">

          <Link
            href="/"
            className="text-sm font-black text-[#006b4c]"
          >
            ← Back to Home
          </Link>

          <Link
            href="/booking"
            className="rounded-xl bg-[#006b4c] px-6 py-3 text-sm font-black text-white hover:bg-[#00583f]"
          >
            Book a Seat
          </Link>

        </div>
      </header>

      {/* PAGE */}
      <section className="px-5 py-14 sm:px-8 lg:px-12 lg:py-20">

        <div className="mx-auto max-w-[1000px]">

          {/* TITLE */}
          <div className="text-center">

            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#006b4c]">
              TDCP Reservation
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] text-[#10231b] sm:text-5xl">
              Check Booking Status
            </h1>

            <p className="mx-auto mt-4 max-w-[600px] text-sm leading-7 text-[#68766f]">
              Enter your booking reference, phone number, or email
              to find your reservation.
            </p>

          </div>

          {/* SEARCH CARD */}
          <div className="mt-10 rounded-[24px] border border-[#dce6e1] bg-white p-6 shadow-[0_20px_55px_rgba(14,52,39,0.10)] sm:p-8">

            <form
              onSubmit={handleSearch}
              className="grid gap-5"
            >

              {/* REFERENCE */}
              <div>

                <label
                  htmlFor="reference"
                  className="text-xs font-black uppercase tracking-[0.12em] text-[#56655e]"
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
                  className="mt-2 h-14 w-full rounded-xl border border-[#d7e2dc] bg-[#fbfcfb] px-4 text-sm font-semibold outline-none transition focus:border-[#006b4c] focus:ring-4 focus:ring-[#006b4c]/10"
                />

              </div>

              <div className="flex items-center gap-4">
                <span className="h-px flex-1 bg-[#e1e8e4]" />
                <span className="text-xs font-bold text-[#9aa49f]">
                  OR
                </span>
                <span className="h-px flex-1 bg-[#e1e8e4]" />
              </div>

              {/* PHONE + EMAIL */}
              <div className="grid gap-5 md:grid-cols-2">

                <div>

                  <label
                    htmlFor="phone"
                    className="text-xs font-black uppercase tracking-[0.12em] text-[#56655e]"
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
                    className="mt-2 h-14 w-full rounded-xl border border-[#d7e2dc] bg-[#fbfcfb] px-4 text-sm font-semibold outline-none transition focus:border-[#006b4c] focus:ring-4 focus:ring-[#006b4c]/10"
                  />

                </div>

                <div>

                  <label
                    htmlFor="email"
                    className="text-xs font-black uppercase tracking-[0.12em] text-[#56655e]"
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
                    className="mt-2 h-14 w-full rounded-xl border border-[#d7e2dc] bg-[#fbfcfb] px-4 text-sm font-semibold outline-none transition focus:border-[#006b4c] focus:ring-4 focus:ring-[#006b4c]/10"
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
                className="mt-2 h-14 rounded-xl bg-[#006b4c] text-sm font-black text-white shadow-[0_10px_25px_rgba(0,107,76,0.18)] transition hover:bg-[#00583f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Checking Booking..."
                  : "Check Booking Status →"}
              </button>

            </form>

          </div>

          {/* RESULT */}
          {booking && (
            <div className="mt-8 rounded-[24px] border border-[#d7e5dc] bg-white p-6 shadow-[0_15px_40px_rgba(14,52,39,0.08)] sm:p-8">

              <div className="flex flex-col gap-4 border-b border-[#e1e8e4] pb-6 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#006b4c]">
                    Booking Found
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-[#10231b]">
                    {booking.booking_reference ||
                      booking.id ||
                      "Booking"}
                  </h2>

                </div>

                <span className="w-fit rounded-full bg-[#e7f5ec] px-4 py-2 text-xs font-black uppercase text-[#006b4c]">
                  {booking.status || "Unknown"}
                </span>

              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">

                <div>
                  <p className="text-xs font-bold text-[#8a9690]">
                    Passenger
                  </p>

                  <p className="mt-1 font-black">
                    {booking.visitor_name || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-[#8a9690]">
                    Phone
                  </p>

                  <p className="mt-1 font-black">
                    {booking.phone || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-[#8a9690]">
                    Email
                  </p>

                  <p className="mt-1 font-black">
                    {booking.email || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-[#8a9690]">
                    Passengers
                  </p>

                  <p className="mt-1 font-black">
                    {booking.passenger_count ?? "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-[#8a9690]">
                    Total Amount
                  </p>

                  <p className="mt-1 font-black">
                    {booking.total_price !== undefined
                      ? `PKR ${booking.total_price}`
                      : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-[#8a9690]">
                    Booking Date
                  </p>

                  <p className="mt-1 font-black">
                    {booking.created_at
                      ? new Date(
                          booking.created_at
                        ).toLocaleDateString()
                      : "—"}
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* HELP */}
          <div className="mt-8 text-center">

            <p className="text-sm text-[#748079]">
              Don&apos;t have a booking reference?
            </p>

            <Link
              href="/booking"
              className="mt-2 inline-flex font-black text-[#006b4c] hover:text-[#00583f]"
            >
              Make a new reservation →
            </Link>

          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#dce6e1] bg-white px-5 py-8 text-center">

        <p className="text-xs font-bold text-[#7a8680]">
          Bahawalpur Double-Decker Bus Reservation System
        </p>

        <p className="mt-1 text-[10px] text-[#9aa49f]">
          TDCP • Punjab, Pakistan
        </p>

      </footer>

    </main>
  );
}