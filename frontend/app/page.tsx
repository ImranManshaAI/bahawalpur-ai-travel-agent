"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const routes = [
  {
    number: "01",
    name: "Bahawalpur Heritage Tour",
    shortName: "Heritage Route",
    description:
      "A classic Bahawalpur heritage journey covering important landmarks and Noor Mahal.",
    price: "Rs. 300",
    priceLabel: "Per Seat",
    type: "seat",
    stops: [
      "TDCP Terminal",
      "Farid Gate",
      "DC Chowk",
      "Circular Road",
      "Fawwar Chowk",
      "Noor Mehal",
    ],
  },
  {
    number: "02",
    name: "Bahawalpur City Explorer Tour",
    shortName: "City Explorer Route",
    description:
      "Explore Bahawalpur's museum, library, shopping and entertainment destinations.",
    price: "Rs. 300",
    priceLabel: "Per Seat",
    type: "seat",
    stops: [
      "TDCP",
      "Farid Gate",
      "DC Chowk",
      "BWP Museum & Library",
      "Circular Road",
      "Gulzar Sadiq",
      "SS World",
      "KFC",
    ],
  },
  {
    number: "03",
    name: "DHA & Leisure Tour",
    shortName: "Leisure Route",
    description:
      "Travel through the city towards DHA and enjoy leisure time at the park destination.",
    price: "Rs. 300",
    priceLabel: "Per Seat",
    type: "seat",
    stops: [
      "Terminal (TDCP Office)",
      "Farid Gate",
      "DC Chowk",
      "Islamic Colony Road",
      "DHA Glow / Central Park",
    ],
  },
  {
    number: "04",
    name: "Special School & Family Tour",
    shortName: "Special Full-Day Route",
    description:
      "A private whole-day tour designed for schools, families and groups.",
    price: "Rs. 30,000",
    priceLabel: "Complete Bus",
    type: "bus",
    stops: [
      "Zoo",
      "Farid Gate",
      "Museum",
      "Library",
      "Noor Mehal",
      "Gulzar Sadiq",
      "SS World",
      "DHA Park",
    ],
  },
];

const steps = [
  {
    number: "1",
    title: "Select Route",
    text: "Choose the tour that matches your journey.",
  },
  {
    number: "2",
    title: "Choose Seats",
    text: "Select available seats for regular routes.",
  },
  {
    number: "3",
    title: "Passenger Details",
    text: "Enter your booking information.",
  },
  {
    number: "4",
    title: "Payment",
    text: "Submit your payment details and proof.",
  },
  {
    number: "5",
    title: "Confirmation",
    text: "Track your booking status online.",
  },
];

const benefits = [
  {
    icon: "seat",
    title: "Comfortable",
    text: "Travel",
  },
  {
    icon: "shield",
    title: "Safe & Secure",
    text: "Journey",
  },
  {
    icon: "bus",
    title: "Modern",
    text: "Double-Decker",
  },
  {
    icon: "users",
    title: "Easy",
    text: "Booking",
  },
];

function Icon({
  name,
  size = 24,
}: {
  name: string;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "seat") {
    return (
      <svg {...common}>
        <path d="M6 18v-5a4 4 0 0 1 8 0v5" />
        <path d="M6 13h8" />
        <path d="M5 18h13" />
        <path d="M5 18v2" />
        <path d="M18 18v2" />
        <path d="M10 5a3 3 0 0 1 3 3v2" />
      </svg>
    );
  }

  if (name === "shield") {
    return (
      <svg {...common}>
        <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }

  if (name === "bus") {
    return (
      <svg {...common}>
        <rect x="4" y="3" width="16" height="15" rx="2" />
        <path d="M4 12h16" />
        <path d="M7 7h3" />
        <path d="M14 7h3" />
        <circle cx="8" cy="20" r="1.5" />
        <circle cx="16" cy="20" r="1.5" />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  if (name === "ticket") {
    return (
      <svg {...common}>
        <path d="M3 7a2 2 0 0 0 0 4v2a2 2 0 0 0 0 4h18v-4a2 2 0 0 0-2-2V7H3z" />
        <path d="M13 7v10" />
      </svg>
    );
  }

  if (name === "search") {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    );
  }

  if (name === "clock") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (name === "location") {
    return (
      <svg {...common}>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (name === "arrow") {
    return (
      <svg {...common}>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    );
  }

  if (name === "route") {
    return (
      <svg {...common}>
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="6" r="2" />
        <path d="M8 18c5 0 3-8 8-8" />
      </svg>
    );
  }

  return null;
}

export default function HomePage() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("17:30");
  const [bookingRef, setBookingRef] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);

  async function handleStatusSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!bookingRef.trim()) return;

    setStatusLoading(true);

    const ref = encodeURIComponent(bookingRef.trim());

    try {
      await fetch(`${API_URL}/bookings/status?ref=${ref}`);
    } catch {
      // Status page will perform its own lookup.
    } finally {
      window.location.href = `/booking-status?ref=${ref}`;
    }
  }

  function handleSearchBuses() {
    const params = new URLSearchParams();

    if (date) {
      params.set("date", date);
    }

    if (time) {
      params.set("time", time);
    }

    const query = params.toString();

    window.location.href = query ? `/booking?${query}` : "/booking";
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#13231d]">

      {/* ================= HEADER ================= */}

      <header className="absolute left-0 right-0 top-0 z-50">
        <div className="mx-auto flex h-[88px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-14">

          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            <div className="relative h-[62px] w-[82px] shrink-0">
              <Image
                src="/images/tdcp-logo.png.jpeg.jpeg.png"
                alt="TDCP Logo"
                fill
                priority
                sizes="82px"
                className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>

            <div className="hidden sm:block">
              <h1 className="text-[21px] font-black leading-none tracking-[-0.045em] text-[#10221b]">
                BAHAWALPUR
              </h1>

              <p className="mt-1 text-[12px] font-extrabold tracking-[0.04em] text-[#10221b]">
                DOUBLE-DECKER BUS
              </p>

              <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.18em] text-[#758079]">
                TDCP Reservation System
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            <Link
              href="/"
              className="relative text-sm font-extrabold text-[#007456]"
            >
              Home
              <span className="absolute -bottom-2 left-0 h-[2px] w-full rounded-full bg-[#007456]" />
            </Link>

            <Link
              href="#routes"
              className="text-sm font-semibold text-[#31413a] transition-colors duration-200 hover:text-[#007456]"
            >
              Routes
            </Link>

            <Link
              href="#about"
              className="text-sm font-semibold text-[#31413a] transition-colors duration-200 hover:text-[#007456]"
            >
              About
            </Link>

            <Link
              href="#why-us"
              className="text-sm font-semibold text-[#31413a] transition-colors duration-200 hover:text-[#007456]"
            >
              Why Choose Us
            </Link>

            <Link
              href="#how-it-works"
              className="text-sm font-semibold text-[#31413a] transition-colors duration-200 hover:text-[#007456]"
            >
              How It Works
            </Link>
          </nav>

          <Link
            href="/booking"
            className="group inline-flex h-11 items-center gap-2 rounded-2xl bg-[#007456] px-5 text-sm font-extrabold tracking-[0.01em] text-white shadow-[0_9px_24px_rgba(0,116,86,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#005d46] hover:shadow-[0_13px_28px_rgba(0,116,86,0.24)]"
          >
            <Icon name="ticket" size={18} />
            <span className="hidden sm:inline">Book Now</span>
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">
              <Icon name="arrow" size={16} />
            </span>
          </Link>
        </div>
      </header>

      {/* ================= HERO ================= */}

      <section className="relative min-h-[650px] overflow-hidden rounded-b-[36px] bg-white">

        <div className="pointer-events-none absolute -left-20 -top-20 z-20 h-64 w-64 rounded-full bg-[#f6f0e5]/60 blur-[75px]" />

        <div className="absolute inset-0">
          <Image
            src="/images/hero-bUs.png.png"
            alt="Bahawalpur Double-Decker Bus"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[62%_center]"
          />

          {/* Soft transition only on left side */}
          <div className="absolute inset-y-0 left-0 w-[58%] bg-gradient-to-r from-white via-white/90 to-transparent" />

          <div className="absolute inset-y-0 left-0 w-[42%] bg-[#f7f1e6]/25 blur-2xl" />

          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/75 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/90 to-transparent" />
        </div>

        <div className="relative z-30 mx-auto flex min-h-[650px] max-w-[1440px] items-center px-6 pb-12 pt-24 lg:px-14">

          <div className="max-w-[620px]">

            <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-[#007456]">
              Bahawalpur • TDCP
            </p>

            <h2 className="mt-5 max-w-[650px] text-[48px] font-black leading-[0.98] tracking-[-0.06em] text-[#10221b] sm:text-[60px] lg:text-[68px]">
              Your Journey
              <span className="relative mt-2 block w-fit text-[#007456]">
                Starts Here
                <span className="absolute -bottom-2 left-0 h-[3px] w-[62%] rounded-full bg-[#c8944e]/70" />
              </span>
            </h2>

            <p className="mt-6 max-w-[535px] text-[15px] font-medium leading-7 tracking-[0.005em] text-[#52615b] sm:text-[16px]">
              Book your seat on the{" "}
              <strong className="font-extrabold text-[#17352a]">
                Bahawalpur Double-Decker Bus
              </strong>{" "}
              and experience a comfortable journey through Bahawalpur.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">

              <Link
                href="/booking"
                className="group inline-flex h-[54px] items-center justify-center gap-2 rounded-2xl bg-[#007456] px-7 text-sm font-extrabold tracking-[0.01em] text-white shadow-[0_12px_28px_rgba(0,116,86,0.22)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#005d46] hover:shadow-[0_16px_32px_rgba(0,116,86,0.28)]"
              >
                <Icon name="ticket" size={20} />

                <span>Book a Seat</span>

                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  <Icon name="arrow" size={18} />
                </span>
              </Link>

              <Link
                href="/booking-status"
                className="group inline-flex h-[54px] items-center justify-center gap-2 rounded-2xl border border-[#d5ded8] bg-white/90 px-7 text-sm font-extrabold tracking-[0.01em] text-[#20312a] shadow-[0_8px_22px_rgba(20,50,38,0.06)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#007456] hover:text-[#007456] hover:shadow-[0_12px_28px_rgba(20,50,38,0.10)]"
              >
                <Icon name="search" size={19} />
                <span>Check Booking</span>
              </Link>

            </div>

            <div className="mt-8 flex max-w-[560px] divide-x divide-[#cbd5cf]">

              {benefits.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-1 flex-col items-center px-3 text-center first:pl-0"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/90 bg-white/90 text-[#007456] shadow-[0_5px_15px_rgba(20,50,38,0.08)] backdrop-blur-md">
                    <Icon name={item.icon} size={20} />
                  </div>

                  <p className="mt-2 text-[10px] font-extrabold tracking-[0.01em] text-[#1c2c25]">
                    {item.title}
                  </p>

                  <p className="text-[9px] font-semibold text-[#69756f]">
                    {item.text}
                  </p>
                </div>
              ))}

            </div>
          </div>
        </div>
      </section>

      {/* ================= QUICK SEARCH ================= */}

      <section className="relative z-30 -mt-9 px-5 sm:px-8 lg:px-14">

        <div className="mx-auto max-w-[1320px]">

          <div className="rounded-[22px] border border-[#e2e5df] bg-white p-3 shadow-[0_18px_45px_rgba(25,55,42,0.11)]">

            <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">

              <div className="rounded-xl border border-[#e0e5e0] bg-[#fafbf8] px-4 py-3 transition-colors hover:border-[#c9d8cf]">

                <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#8a948f]">
                  From
                </p>

                <div className="mt-1 flex items-center gap-3">
                  <div className="text-[#007456]">
                    <Icon name="location" size={21} />
                  </div>

                  <div>
                    <p className="text-sm font-extrabold text-[#172720]">
                      Bahawalpur
                    </p>

                    <p className="text-[11px] font-medium text-[#7b8781]">
                      TDCP Bus Terminal
                    </p>
                  </div>
                </div>
              </div>

              <label className="rounded-xl border border-[#e0e5e0] bg-[#fafbf8] px-4 py-3 transition-colors hover:border-[#c9d8cf]">

                <span className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#8a948f]">
                  Travel Date
                </span>

                <div className="mt-1 flex items-center gap-3">
                  <div className="text-[#007456]">
                    <Icon name="calendar" size={20} />
                  </div>

                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent text-sm font-extrabold text-[#172720] outline-none"
                  />
                </div>
              </label>

              <label className="rounded-xl border border-[#e0e5e0] bg-[#fafbf8] px-4 py-3 transition-colors hover:border-[#c9d8cf]">

                <span className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#8a948f]">
                  Departure Time
                </span>

                <div className="mt-1 flex items-center gap-3">
                  <div className="text-[#007456]">
                    <Icon name="clock" size={20} />
                  </div>

                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-transparent text-sm font-extrabold text-[#172720] outline-none"
                  />
                </div>
              </label>

              <button
                type="button"
                onClick={handleSearchBuses}
                className="group flex min-h-[68px] items-center justify-center gap-2 rounded-2xl bg-[#007456] px-7 text-sm font-extrabold tracking-[0.01em] text-white shadow-[0_10px_24px_rgba(0,116,86,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#005d46] hover:shadow-[0_14px_30px_rgba(0,116,86,0.23)]"
              >
                <span>Search Buses</span>

                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  <Icon name="arrow" size={19} />
                </span>
              </button>

            </div>
          </div>
        </div>
      </section>

      {/* ================= ROUTES ================= */}

      <section
        id="routes"
        className="scroll-mt-20 px-5 py-20 sm:px-8 lg:px-14"
      >

        <div className="mx-auto max-w-[1320px]">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#007456]">
                Our Routes
              </p>

              <h2 className="mt-3 text-3xl font-black leading-[1.05] tracking-[-0.055em] text-[#12231c] sm:text-4xl lg:text-[42px]">
                Choose your journey
              </h2>

              <p className="mt-3 max-w-[620px] text-sm font-medium leading-7 text-[#69766f]">
                Select a regular sightseeing route or reserve the complete
                double-decker bus for your school, family or group.
              </p>
            </div>

            <Link
              href="/booking"
              className="group inline-flex h-11 w-fit items-center gap-2 rounded-2xl border border-[#d5dfd8] bg-white px-5 text-sm font-extrabold text-[#007456] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#007456] hover:bg-[#f2f8f4]"
            >
              View Booking
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                <Icon name="arrow" size={17} />
              </span>
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            {routes.map((route) => (
              <article
                key={route.number}
                className={`group flex flex-col overflow-hidden rounded-[20px] border bg-white shadow-[0_10px_30px_rgba(20,55,40,0.055)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(20,55,40,0.10)] ${
                  route.type === "bus"
                    ? "border-[#b8d8c5]"
                    : "border-[#e0e5df]"
                }`}
              >

                <div
                  className={`flex items-center justify-between px-5 py-4 ${
                    route.type === "bus"
                      ? "bg-[#edf8f1]"
                      : "bg-[#f6f8f5]"
                  }`}
                >

                  <span className="text-[28px] font-black tracking-[-0.06em] text-[#d3dcd6]">
                    {route.number}
                  </span>

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      route.type === "bus"
                        ? "bg-[#007456] text-white"
                        : "bg-white text-[#007456]"
                    }`}
                  >
                    <Icon
                      name={route.type === "bus" ? "bus" : "route"}
                      size={19}
                    />
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">

                  <p className="text-[9px] font-extrabold uppercase tracking-[0.19em] text-[#007456]">
                    {route.shortName}
                  </p>

                  <h3 className="mt-2 text-lg font-black leading-[1.2] tracking-[-0.02em] text-[#14251e]">
                    {route.name}
                  </h3>

                  <p className="mt-3 min-h-[66px] text-[12px] font-medium leading-5 text-[#6c7972]">
                    {route.description}
                  </p>

                  <div className="mt-5 border-t border-[#edf0ec] pt-4">

                    <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#8a958f]">
                      {route.priceLabel}
                    </p>

                    <p className="mt-1 text-2xl font-black tracking-[-0.045em] text-[#007456]">
                      {route.price}
                    </p>

                    {route.type === "bus" && (
                      <p className="mt-1 text-[10px] font-bold text-[#65736c]">
                        Private full-day bus reservation
                      </p>
                    )}
                  </div>

                  <div className="mt-5">

                    <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#8b9690]">
                      Main Stops
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {route.stops.slice(0, 4).map((stop) => (
                        <span
                          key={stop}
                          className="rounded-full bg-[#f2f5f1] px-2.5 py-1 text-[9px] font-semibold text-[#52615a]"
                        >
                          {stop}
                        </span>
                      ))}

                      {route.stops.length > 4 && (
                        <span className="rounded-full bg-[#f2f5f1] px-2.5 py-1 text-[9px] font-extrabold text-[#007456]">
                          +{route.stops.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    href={
                      route.type === "bus"
                        ? "/booking?route=04&type=complete-bus"
                        : `/booking?route=${route.number}`
                    }
                    className={`group mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl text-xs font-extrabold transition-all duration-300 ${
                      route.type === "bus"
                        ? "bg-[#007456] text-white shadow-[0_8px_20px_rgba(0,116,86,0.16)] hover:-translate-y-0.5 hover:bg-[#005d46] hover:shadow-[0_12px_25px_rgba(0,116,86,0.22)]"
                        : "border border-[#cfe0d5] bg-[#f4faf6] text-[#007456] hover:-translate-y-0.5 hover:border-[#007456] hover:bg-[#e9f5ed]"
                    }`}
                  >
                    {route.type === "bus"
                      ? "Book Complete Bus"
                      : "Select Seats"}

                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      <Icon name="arrow" size={16} />
                    </span>
                  </Link>

                </div>
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* ================= BOOKING STATUS ================= */}

      <section className="px-5 pb-20 sm:px-8 lg:px-14">

        <div className="mx-auto max-w-[1320px]">

          <div className="flex flex-col gap-6 rounded-[22px] border border-[#d7e4db] bg-[#edf7ef] p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between lg:px-8">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#007456] shadow-sm">
                <Icon name="ticket" size={23} />
              </div>

              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#007456]">
                  Existing Booking
                </p>

                <h3 className="mt-1 text-lg font-black tracking-[-0.02em] text-[#172720]">
                  Check your booking status
                </h3>

                <p className="mt-1 text-xs font-medium leading-5 text-[#617069]">
                  Enter your booking reference, phone number or email.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleStatusSearch}
              className="flex w-full max-w-[580px] flex-col gap-2.5 sm:flex-row"
            >

              <div className="flex h-[50px] flex-1 items-center gap-3 rounded-xl border border-[#d5e1d8] bg-white px-4 transition-colors focus-within:border-[#007456]">

                <div className="text-[#007456]">
                  <Icon name="search" size={20} />
                </div>

                <input
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value)}
                  placeholder="Booking reference, phone, or email"
                  className="w-full bg-transparent text-xs font-semibold outline-none placeholder:text-[#929c97]"
                />
              </div>

              <button
                type="submit"
                disabled={statusLoading}
                className="h-[50px] rounded-xl bg-[#007456] px-6 text-xs font-extrabold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#005d46] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {statusLoading ? "Checking..." : "Check Status"}
              </button>

            </form>
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}

      <section
        id="about"
        className="scroll-mt-20 border-y border-[#eceee9] bg-white px-5 py-20 sm:px-8 lg:px-14"
      >

        <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">

          <div>

            <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#007456]">
              About The Service
            </p>

            <h2 className="mt-4 text-4xl font-black leading-[1.02] tracking-[-0.06em] text-[#10221b] sm:text-5xl">
              A smarter way to
              <span className="block text-[#007456]">
                book your journey.
              </span>
            </h2>

            <p className="mt-5 max-w-[500px] text-sm font-medium leading-7 text-[#69766f]">
              Simple online booking designed specifically for the Bahawalpur
              Double-Decker Bus experience.
            </p>
          </div>

          <div className="rounded-[20px] border border-[#e2e6e1] bg-[#fafbf8] p-7 shadow-[0_8px_25px_rgba(20,55,40,0.035)]">

            <div className="border-l-[3px] border-[#007456] pl-6">

              <p className="text-[15px] font-medium leading-8 text-[#5e6d66]">
                The Bahawalpur Double-Decker Bus reservation system provides
                visitors with a convenient way to select a route, choose an
                available schedule, select seats where applicable and complete
                their booking online.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">

                <span className="rounded-full bg-[#eaf5ef] px-4 py-2 text-[10px] font-extrabold text-[#007456]">
                  Scheduled Tours
                </span>

                <span className="rounded-full bg-[#eaf5ef] px-4 py-2 text-[10px] font-extrabold text-[#007456]">
                  Upper & Lower Deck
                </span>

                <span className="rounded-full bg-[#eaf5ef] px-4 py-2 text-[10px] font-extrabold text-[#007456]">
                  Online Reservation
                </span>

                <span className="rounded-full bg-[#eaf5ef] px-4 py-2 text-[10px] font-extrabold text-[#007456]">
                  Full Bus Booking
                </span>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}

      <section
        id="why-us"
        className="scroll-mt-20 bg-[#f7f8f5] px-5 py-20 sm:px-8 lg:px-14"
      >

        <div className="mx-auto max-w-[1320px]">

          <div className="max-w-[650px]">

            <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#007456]">
              Why Choose Us
            </p>

            <h2 className="mt-3 text-4xl font-black leading-[1.05] tracking-[-0.06em] text-[#10221b]">
              Designed for a better journey.
            </h2>

            <p className="mt-3 max-w-[620px] text-sm font-medium leading-7 text-[#69766f]">
              Everything is designed to make your booking simple, clear and
              convenient.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            {[
              {
                icon: "seat",
                title: "Comfortable Travel",
                text: "Enjoy a comfortable sightseeing experience throughout your journey.",
              },
              {
                icon: "shield",
                title: "Safe & Secure",
                text: "A reliable reservation process designed around passenger safety.",
              },
              {
                icon: "bus",
                title: "Modern Double-Decker",
                text: "Experience Bahawalpur from a unique double-decker perspective.",
              },
              {
                icon: "users",
                title: "Easy Booking",
                text: "Select a route, schedule and seat through a simple online process.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="group rounded-[20px] border border-[#e0e5df] bg-white p-6 shadow-[0_8px_25px_rgba(20,55,40,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-[#cfe0d5] hover:shadow-[0_16px_35px_rgba(20,55,40,0.08)]"
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f5ed] text-[#007456] transition-transform duration-300 group-hover:scale-105">
                  <Icon name={item.icon} size={24} />
                </div>

                <h3 className="mt-5 text-base font-black tracking-[-0.01em] text-[#172720]">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs font-medium leading-6 text-[#69766f]">
                  {item.text}
                </p>

              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}

      <section
        id="how-it-works"
        className="scroll-mt-20 bg-white px-5 py-20 sm:px-8 lg:px-14"
      >

        <div className="mx-auto max-w-[1320px]">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#007456]">
                How It Works
              </p>

              <h2 className="mt-3 text-4xl font-black leading-[1.05] tracking-[-0.06em] text-[#10221b]">
                Five simple steps.
              </h2>

              <p className="mt-3 text-sm font-medium leading-7 text-[#69766f]">
                From selecting your route to checking your confirmation.
              </p>
            </div>

            <Link
              href="/booking"
              className="group inline-flex h-11 w-fit items-center gap-2 rounded-2xl bg-[#007456] px-6 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(0,116,86,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#005d46] hover:shadow-[0_12px_25px_rgba(0,116,86,0.22)]"
            >
              Start Booking

              <span className="transition-transform duration-300 group-hover:translate-x-1">
                <Icon name="arrow" size={17} />
              </span>
            </Link>

          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-5">

            {steps.map((step) => (
              <article
                key={step.number}
                className="group rounded-[18px] border border-[#e1e5e0] bg-[#fafbf8] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#cfe0d5] hover:bg-white hover:shadow-[0_12px_30px_rgba(20,55,40,0.07)]"
              >

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#007456] text-xs font-extrabold text-white shadow-sm">
                  {step.number}
                </div>

                <h3 className="mt-5 text-sm font-black tracking-[-0.01em] text-[#172720]">
                  {step.title}
                </h3>

                <p className="mt-2 text-xs font-medium leading-6 text-[#707c76]">
                  {step.text}
                </p>

              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}

      <section className="bg-[#f7f8f5] px-5 py-14 sm:px-8 lg:px-14">

        <div className="mx-auto max-w-[1320px]">

          <div className="relative overflow-hidden rounded-[26px] bg-[#00543f] px-7 py-11 shadow-[0_18px_45px_rgba(0,70,50,0.16)] sm:px-10 lg:px-14">

            <div className="relative z-10 max-w-[700px]">

              <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#75dca7]">
                Plan Your Journey
              </p>

              <h2 className="mt-3 text-3xl font-black leading-[1.05] tracking-[-0.05em] text-white sm:text-4xl">
                Ready to book your journey?
              </h2>

              <p className="mt-4 max-w-[600px] text-sm font-medium leading-7 text-white/65">
                Choose a regular seat-based route or reserve the complete bus
                for your school, family or group.
              </p>

              <Link
                href="/booking"
                className="group mt-6 inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-6 text-xs font-extrabold text-[#00543f] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#edf7f1]"
              >
                Book Your Journey

                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  <Icon name="arrow" size={17} />
                </span>
              </Link>

            </div>

            <div className="absolute -right-16 -top-20 h-60 w-60 rounded-full bg-[#168664]/45 blur-3xl" />

            <div className="absolute -bottom-32 right-32 h-64 w-64 rounded-full bg-[#0b7556]/35 blur-3xl" />

          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}

      <footer
        id="contact"
        className="scroll-mt-20 bg-[#003f30] px-5 py-11 text-white sm:px-8 lg:px-14"
      >

        <div className="mx-auto max-w-[1320px]">

          <div className="grid gap-10 md:grid-cols-[1.4fr_0.8fr_0.8fr]">

            <div>

              <div className="flex items-center gap-4">

                <div className="relative h-[58px] w-[75px] shrink-0 rounded-xl bg-white p-1">

                  <Image
                    src="/images/tdcp-logo.png.jpeg.jpeg.png"
                    alt="TDCP Logo"
                    fill
                    sizes="75px"
                    className="object-contain"
                  />

                </div>

                <div>
                  <p className="text-sm font-black tracking-[-0.01em]">
                    Bahawalpur Double-Decker Bus
                  </p>

                  <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#72dca5]">
                    TDCP Reservation System
                  </p>
                </div>

              </div>

              <p className="mt-5 max-w-md text-xs font-medium leading-7 text-white/55">
                A convenient online reservation experience for Bahawalpur
                Double-Decker Bus tours and complete bus bookings.
              </p>

            </div>

            <div>

              <p className="text-[9px] font-extrabold uppercase tracking-[0.24em] text-white/40">
                Navigation
              </p>

              <div className="mt-4 flex flex-col gap-3 text-xs">

                <Link
                  href="/"
                  className="font-semibold text-white/65 transition-colors hover:text-white"
                >
                  Home
                </Link>

                <Link
                  href="#routes"
                  className="font-semibold text-white/65 transition-colors hover:text-white"
                >
                  Routes
                </Link>

                <Link
                  href="#about"
                  className="font-semibold text-white/65 transition-colors hover:text-white"
                >
                  About
                </Link>

                <Link
                  href="#why-us"
                  className="font-semibold text-white/65 transition-colors hover:text-white"
                >
                  Why Choose Us
                </Link>

                <Link
                  href="#how-it-works"
                  className="font-semibold text-white/65 transition-colors hover:text-white"
                >
                  How It Works
                </Link>

              </div>
            </div>

            <div>

              <p className="text-[9px] font-extrabold uppercase tracking-[0.24em] text-white/40">
                Service
              </p>

              <div className="mt-4 flex flex-col gap-3 text-xs">

                <Link
                  href="/booking"
                  className="font-semibold text-white/65 transition-colors hover:text-white"
                >
                  Reserve a Seat
                </Link>

                <Link
                  href="/booking?route=04&type=complete-bus"
                  className="font-semibold text-white/65 transition-colors hover:text-white"
                >
                  Book Complete Bus
                </Link>

                <Link
                  href="/booking-status"
                  className="font-semibold text-white/65 transition-colors hover:text-white"
                >
                  Booking Status
                </Link>

                <p className="font-semibold text-white/45">
                  Bahawalpur, Punjab
                </p>

              </div>
            </div>

          </div>

          <div className="mt-9 flex flex-col gap-2 border-t border-white/10 pt-5 text-[10px] font-medium text-white/35 sm:flex-row sm:items-center sm:justify-between">

            <p>
              Bahawalpur Double-Decker Bus Reservation System
            </p>

            <p>
              TDCP • Punjab, Pakistan
            </p>

          </div>
        </div>
      </footer>

    </main>
  );
}