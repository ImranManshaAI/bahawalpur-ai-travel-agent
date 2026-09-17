"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const heroImages = [
  {
    src: "/images/central-library-bahawalpur-2.jpg",
    alt: "Central Library Bahawalpur",
  },
  {
    src: "/images/hero-bUs.png.png",
    alt: "Bahawalpur Double-Decker Bus",
  },
  {
    src: "/images/dabar-mahal.png.png",
    alt: "Dabar Mahal Bahawalpur",
  },
  {
    src: "/images/ss-world.png.png",
    alt: "SS World Bahawalpur",
  },
  {
    src: "/images/fawara-chowk-bahawalpur-3.jpg",
    alt: "Fawara Chowk Bahawalpur",
  },
  {
    src: "/images/gulzar-e-sadiq-park-1.jpg",
    alt: "Gulzar-e-Sadiq Park",
  },
];

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
  const router = useRouter();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("17:30");
  const [bookingRef, setBookingRef] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [currentHero, setCurrentHero] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentHero(
        (current) => (current + 1) % heroImages.length
      );
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  function nextHero() {
    setCurrentHero(
      (current) => (current + 1) % heroImages.length
    );
  }

  function previousHero() {
    setCurrentHero(
      (current) =>
        (current - 1 + heroImages.length) % heroImages.length
    );
  }

  async function handleStatusSearch(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!bookingRef.trim()) return;

    setStatusLoading(true);

    const ref = encodeURIComponent(bookingRef.trim());

    try {
      await fetch(`${API_URL}/bookings/status?ref=${ref}`);
    } catch {
      // Booking status page performs its own lookup.
    } finally {
      router.push(`/booking-status?ref=${ref}`);
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

    router.push(
      query ? `/booking?${query}` : "/booking"
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#071510] text-[#edf7f2]">
      {/* =========================================================
          HERO
      ========================================================== */}

      <section className="relative h-[100svh] min-h-[680px] max-h-[900px] overflow-hidden bg-[#071510]">
        {/* HERO IMAGE SLIDER */}

        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <div
              key={image.src}
              className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
                index === currentHero
                  ? "z-10 opacity-100"
                  : "z-0 opacity-0"
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>
          ))}
        </div>

        {/* OVERALL IMAGE SHADE */}

        <div className="absolute inset-0 z-20 bg-[#03150f]/30" />

        {/* LEFT TEXT GRADIENT */}

        <div className="absolute inset-0 z-20 bg-gradient-to-r from-[#03150f]/95 via-[#03150f]/78 via-45% to-[#03150f]/15" />

        {/* BOTTOM FADE */}

        <div className="absolute inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-t from-[#071510] via-[#071510]/55 to-transparent" />

        {/* =======================================================
            HEADER
        ========================================================= */}

        <header className="absolute left-0 right-0 top-0 z-50">
          <div className="mx-auto flex h-[82px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-14">
            <Link
              href="/"
              className="group flex items-center gap-3"
            >
              <div className="relative h-[58px] w-[78px] shrink-0">
                <Image
                  src="/images/tdcp-logo.png.jpeg.jpeg.png"
                  alt="TDCP Logo"
                  fill
                  sizes="78px"
                  className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                  priority
                />
              </div>

              <div className="hidden sm:block">
                <h1 className="text-[21px] font-black leading-none tracking-[-0.045em] text-white">
                  BAHAWALPUR
                </h1>

                <p className="mt-1 text-[12px] font-extrabold tracking-[0.04em] text-white">
                  DOUBLE-DECKER BUS
                </p>

                <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.18em] text-white/55">
                  TDCP Reservation System
                </p>
              </div>
            </Link>

            <nav className="hidden items-center gap-8 lg:flex">
              <Link
                href="/"
                className="relative text-sm font-extrabold text-[#55d89e]"
              >
                Home
                <span className="absolute -bottom-2 left-0 h-[2px] w-full rounded-full bg-[#55d89e]" />
              </Link>

              <Link
                href="/routes"
                className="text-sm font-semibold text-white/75 transition-colors hover:text-white"
              >
                Routes
              </Link>

              <Link
                href="/about"
                className="text-sm font-semibold text-white/75 transition-colors hover:text-white"
              >
                About
              </Link>

              <Link
                href="/why-choose-us"
                className="text-sm font-semibold text-white/75 transition-colors hover:text-white"
              >
                Why Choose Us
              </Link>

              <Link
                href="#how-it-works"
                className="text-sm font-semibold text-white/75 transition-colors hover:text-white"
              >
                How It Works
              </Link>
            </nav>

            <Link
              href="/booking"
              className="group inline-flex h-11 items-center gap-2 rounded-2xl bg-[#008765] px-5 text-sm font-extrabold text-white shadow-[0_10px_30px_rgba(0,135,101,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#009b73]"
            >
              <Icon name="ticket" size={18} />

              <span className="hidden sm:inline">
                Book Now
              </span>

              <span className="transition-transform duration-300 group-hover:translate-x-1">
                <Icon name="arrow" size={16} />
              </span>
            </Link>
          </div>
        </header>

        {/* =======================================================
            HERO CONTENT
        ========================================================= */}

        <div className="relative z-30 mx-auto flex min-h-[680px] max-w-[1440px] -translate-y-8 items-center px-5 pb-20 pt-28 sm:min-h-[720px] sm:px-8 sm:pt-32 lg:min-h-[760px] lg:px-14">
          <div className="max-w-[680px]">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-[#55d89e]">
              Bahawalpur • TDCP
            </p>

            <h2 className="mt-5 max-w-[680px] text-[42px] font-black leading-[0.94] tracking-[-0.065em] text-white sm:text-[56px] lg:text-[68px]">
              Your Journey

              <span className="relative mt-2 block w-fit text-[#43c98f]">
                Starts Here

                <span className="absolute -bottom-3 left-0 h-[4px] w-[60%] rounded-full bg-[#d3a15e]" />
              </span>
            </h2>

            <p className="mt-6 max-w-[560px] text-[14px] font-medium leading-6 text-white/75 sm:text-[16px] sm:leading-7">
              Book your seat on the{" "}
              <strong className="font-extrabold text-white">
                Bahawalpur Double-Decker Bus
              </strong>{" "}
              and experience a comfortable journey through
              Bahawalpur.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/booking"
                className="group inline-flex h-[54px] items-center justify-center gap-2 rounded-2xl bg-[#008765] px-7 text-sm font-extrabold text-white shadow-[0_14px_35px_rgba(0,135,101,0.28)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#009b73]"
              >
                <Icon name="ticket" size={20} />

                <span>Book a Seat</span>

                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  <Icon name="arrow" size={18} />
                </span>
              </Link>

              <Link
                href="/booking-status"
                className="group inline-flex h-[54px] items-center justify-center gap-2 rounded-2xl border border-white/20 bg-[#071a13]/55 px-7 text-sm font-extrabold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#55d89e]/60 hover:bg-[#071a13]/75"
              >
                <Icon name="search" size={19} />

                <span>Check Booking</span>
              </Link>
            </div>

            {/* BENEFITS */}

            <div className="mt-7 flex max-w-[650px] divide-x divide-white/15">
              {benefits.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-1 flex-col items-center px-3 text-center first:pl-0"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#071a13]/60 text-[#55d89e] backdrop-blur-md">
                    <Icon name={item.icon} size={20} />
                  </div>

                  <p className="mt-2 text-[10px] font-extrabold text-white">
                    {item.title}
                  </p>

                  <p className="text-[9px] font-semibold text-white/55">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* =======================================================
            SLIDER CONTROLS
        ========================================================= */}

        <button
          type="button"
          onClick={previousHero}
          aria-label="Previous hero image"
          className="absolute left-4 top-1/2 z-40 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md transition hover:bg-black/45 sm:flex"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <button
          type="button"
          onClick={nextHero}
          aria-label="Next hero image"
          className="absolute right-4 top-1/2 z-40 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md transition hover:bg-black/45 sm:flex"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

        {/* DYNAMIC DOTS */}

        <div className="absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/25 px-4 py-2.5 backdrop-blur-md">
          {heroImages.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setCurrentHero(index)}
              aria-label={`Go to hero image ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-500 ${
                index === currentHero
                  ? "w-7 bg-white"
                  : "w-2 bg-white/45 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </section>

      {/* =========================================================
          QUICK SEARCH
      ========================================================== */}

      <section className="relative z-30 -mt-8 px-5 sm:px-8 lg:px-14">
        <div className="mx-auto max-w-[1320px]">
          <div className="rounded-[24px] border border-[#dce8e2] bg-white p-3 shadow-[0_20px_55px_rgba(0,0,0,0.16)]">
            <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
              <div className="rounded-xl border border-[#e2e9e5] bg-[#f8fbf9] px-4 py-3">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#7a8982]">
                  From
                </p>

                <div className="mt-1 flex items-center gap-3">
                  <div className="text-[#008765]">
                    <Icon name="location" size={21} />
                  </div>

                  <div>
                    <p className="text-sm font-extrabold text-[#10251d]">
                      Bahawalpur
                    </p>

                    <p className="text-[11px] font-medium text-[#7a8982]">
                      TDCP Bus Terminal
                    </p>
                  </div>
                </div>
              </div>

              <label className="rounded-xl border border-[#e2e9e5] bg-[#f8fbf9] px-4 py-3">
                <span className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#7a8982]">
                  Travel Date
                </span>

                <div className="mt-1 flex items-center gap-3">
                  <div className="text-[#008765]">
                    <Icon name="calendar" size={20} />
                  </div>

                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent text-sm font-extrabold text-[#10251d] outline-none"
                  />
                </div>
              </label>

              <label className="rounded-xl border border-[#e2e9e5] bg-[#f8fbf9] px-4 py-3">
                <span className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#7a8982]">
                  Departure Time
                </span>

                <div className="mt-1 flex items-center gap-3">
                  <div className="text-[#008765]">
                    <Icon name="clock" size={20} />
                  </div>

                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-transparent text-sm font-extrabold text-[#10251d] outline-none"
                  />
                </div>
              </label>

              <button
                type="button"
                onClick={handleSearchBuses}
                className="group flex min-h-[68px] items-center justify-center gap-2 rounded-2xl bg-[#008765] px-7 text-sm font-extrabold text-white shadow-[0_10px_25px_rgba(0,135,101,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#009b73]"
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

      {/* =========================================================
          ROUTES
      ========================================================== */}

      <section
        id="routes"
        className="scroll-mt-20 bg-[#f7f8f5] px-5 py-20 text-[#10251d] sm:px-8 lg:px-14"
      >
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#008765]">
                Our Routes
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-[-0.055em] sm:text-4xl lg:text-[42px]">
                Choose your journey
              </h2>

              <p className="mt-3 max-w-[620px] text-sm font-medium leading-7 text-[#6e7d76]">
                Select a regular sightseeing route or reserve the complete
                double-decker bus for your school, family or group.
              </p>
            </div>

            <Link
              href="/routes"
              className="group inline-flex h-11 w-fit items-center gap-2 rounded-2xl border border-[#cbdad3] bg-white px-5 text-sm font-extrabold text-[#008765] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#008765]"
            >
              View Routes

              <span className="transition-transform duration-300 group-hover:translate-x-1">
                <Icon name="arrow" size={17} />
              </span>
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {routes.map((route) => (
              <article
                key={route.number}
                className={`group flex flex-col overflow-hidden rounded-[22px] border bg-white shadow-[0_8px_30px_rgba(15,40,30,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,40,30,0.12)] ${
                  route.type === "bus"
                    ? "border-[#83cdb0]"
                    : "border-[#e0e8e3]"
                }`}
              >
                <div
                  className={`flex items-center justify-between px-5 py-4 ${
                    route.type === "bus"
                      ? "bg-[#e4f5ed]"
                      : "bg-[#f5f9f6]"
                  }`}
                >
                  <span className="text-[28px] font-black tracking-[-0.06em] text-[#bfd2c8]">
                    {route.number}
                  </span>

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      route.type === "bus"
                        ? "bg-[#008765] text-white"
                        : "bg-[#e1f2ea] text-[#008765]"
                    }`}
                  >
                    <Icon
                      name={route.type === "bus" ? "bus" : "route"}
                      size={19}
                    />
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.19em] text-[#008765]">
                    {route.shortName}
                  </p>

                  <h3 className="mt-2 text-lg font-black leading-[1.2] tracking-[-0.02em] text-[#10251d]">
                    {route.name}
                  </h3>

                  <p className="mt-3 min-h-[66px] text-[12px] font-medium leading-5 text-[#718079]">
                    {route.description}
                  </p>

                  <div className="mt-5 border-t border-[#e7ede9] pt-4">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#82918a]">
                      {route.priceLabel}
                    </p>

                    <p className="mt-1 text-2xl font-black tracking-[-0.045em] text-[#008765]">
                      {route.price}
                    </p>

                    {route.type === "bus" && (
                      <p className="mt-1 text-[10px] font-bold text-[#789087]">
                        Private full-day bus reservation
                      </p>
                    )}
                  </div>

                  <div className="mt-5">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#82918a]">
                      Main Stops
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {route.stops.slice(0, 4).map((stop) => (
                        <span
                          key={stop}
                          className="rounded-full bg-[#edf5f1] px-2.5 py-1 text-[9px] font-semibold text-[#62736b]"
                        >
                          {stop}
                        </span>
                      ))}

                      {route.stops.length > 4 && (
                        <span className="rounded-full bg-[#e1f3eb] px-2.5 py-1 text-[9px] font-extrabold text-[#008765]">
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
                        ? "bg-[#008765] text-white hover:-translate-y-0.5 hover:bg-[#009b73]"
                        : "border border-[#b9d7ca] bg-[#f2f9f5] text-[#008765] hover:-translate-y-0.5 hover:border-[#008765] hover:bg-[#e7f5ee]"
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

      {/* =========================================================
          BOOKING STATUS
      ========================================================== */}

      <section className="bg-white px-5 py-8 sm:px-8 lg:px-14">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col gap-6 rounded-[22px] border border-[#dce8e2] bg-[#f5faf7] p-6 shadow-[0_10px_30px_rgba(15,40,30,0.06)] lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e0f3ea] text-[#008765]">
                <Icon name="ticket" size={23} />
              </div>

              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#008765]">
                  Existing Booking
                </p>

                <h3 className="mt-1 text-lg font-black text-[#10251d]">
                  Check your booking status
                </h3>

                <p className="mt-1 text-xs font-medium leading-5 text-[#718079]">
                  Enter your booking reference, phone number or email.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleStatusSearch}
              className="flex w-full max-w-[580px] flex-col gap-2.5 sm:flex-row"
            >
              <div className="flex h-[50px] flex-1 items-center gap-3 rounded-xl border border-[#d6e3dd] bg-white px-4 focus-within:border-[#008765]">
                <div className="text-[#008765]">
                  <Icon name="search" size={20} />
                </div>

                <input
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value)}
                  placeholder="Booking reference, phone, or email"
                  className="w-full bg-transparent text-xs font-semibold text-[#10251d] outline-none placeholder:text-[#9aa8a1]"
                />
              </div>

              <button
                type="submit"
                disabled={statusLoading}
                className="h-[50px] rounded-xl bg-[#008765] px-6 text-xs font-extrabold text-white transition-all duration-300 hover:bg-[#009b73] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {statusLoading ? "Checking..." : "Check Status"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* =========================================================
          ABOUT
      ========================================================== */}

      <section
        id="about"
        className="scroll-mt-20 bg-[#f7f8f5] px-5 py-20 sm:px-8 lg:px-14"
      >
        <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#008765]">
              About The Service
            </p>

            <h2 className="mt-4 text-4xl font-black leading-[1.02] tracking-[-0.06em] text-[#10251d] sm:text-5xl">
              A smarter way to
              <span className="block text-[#008765]">
                book your journey.
              </span>
            </h2>

            <p className="mt-5 max-w-[500px] text-sm font-medium leading-7 text-[#718079]">
              Simple online booking designed specifically for the
              Bahawalpur Double-Decker Bus experience.
            </p>
          </div>

          <div className="rounded-[22px] border border-[#dce8e2] bg-white p-7 shadow-[0_10px_30px_rgba(15,40,30,0.06)]">
            <div className="border-l-[3px] border-[#008765] pl-6">
              <p className="text-[15px] font-medium leading-8 text-[#5e7068]">
                The Bahawalpur Double-Decker Bus reservation system
                provides visitors with a convenient way to select a
                route, choose an available schedule, select seats
                where applicable and complete their booking online.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#e6f4ed] px-4 py-2 text-[10px] font-extrabold text-[#008765]">
                  Scheduled Tours
                </span>

                <span className="rounded-full bg-[#e6f4ed] px-4 py-2 text-[10px] font-extrabold text-[#008765]">
                  Upper & Lower Deck
                </span>

                <span className="rounded-full bg-[#e6f4ed] px-4 py-2 text-[10px] font-extrabold text-[#008765]">
                  Online Reservation
                </span>

                <span className="rounded-full bg-[#e6f4ed] px-4 py-2 text-[10px] font-extrabold text-[#008765]">
                  Full Bus Booking
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          WHY CHOOSE US
      ========================================================== */}

      <section
        id="why-us"
        className="scroll-mt-20 bg-[#071510] px-5 py-20 sm:px-8 lg:px-14"
      >
        <div className="mx-auto max-w-[1320px]">
          <div className="max-w-[650px]">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#55d89e]">
              Why Choose Us
            </p>

            <h2 className="mt-3 text-4xl font-black leading-[1.05] tracking-[-0.06em] text-white">
              Designed for a better journey.
            </h2>

            <p className="mt-3 max-w-[620px] text-sm font-medium leading-7 text-[#82958d]">
              Everything is designed to make your booking simple,
              clear and convenient.
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
                className="group rounded-[20px] border border-[#273f35] bg-[#10231c] p-6 shadow-[0_8px_25px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-[#35614f]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#18392d] text-[#55d89e] transition-transform duration-300 group-hover:scale-105">
                  <Icon name={item.icon} size={24} />
                </div>

                <h3 className="mt-5 text-base font-black text-white">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs font-medium leading-6 text-[#82958d]">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================== */}

      <section
        id="how-it-works"
        className="scroll-mt-20 bg-[#f7f8f5] px-5 py-20 text-[#10251d] sm:px-8 lg:px-14"
      >
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#008765]">
                How It Works
              </p>

              <h2 className="mt-3 text-4xl font-black leading-[1.05] tracking-[-0.06em]">
                Five simple steps.
              </h2>

              <p className="mt-3 text-sm font-medium leading-7 text-[#718079]">
                From selecting your route to checking your confirmation.
              </p>
            </div>

            <Link
              href="/booking"
              className="group inline-flex h-11 w-fit items-center gap-2 rounded-2xl bg-[#008765] px-6 text-xs font-extrabold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#009b73]"
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
                className="group rounded-[18px] border border-[#dce8e2] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(15,40,30,0.08)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#008765] text-xs font-extrabold text-white">
                  {step.number}
                </div>

                <h3 className="mt-5 text-sm font-black">
                  {step.title}
                </h3>

                <p className="mt-2 text-xs font-medium leading-6 text-[#718079]">
                  {step.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================== */}

      <section className="bg-[#f7f8f5] px-5 py-14 sm:px-8 lg:px-14">
        <div className="mx-auto max-w-[1320px]">
          <div className="relative overflow-hidden rounded-[26px] bg-[#064f3c] px-7 py-11 shadow-[0_18px_45px_rgba(0,0,0,0.20)] sm:px-10 lg:px-14">
            <div className="relative z-10 max-w-[700px]">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#75e4b0]">
                Plan Your Journey
              </p>

              <h2 className="mt-3 text-3xl font-black leading-[1.05] tracking-[-0.05em] text-white sm:text-4xl">
                Ready to book your journey?
              </h2>

              <p className="mt-4 max-w-[600px] text-sm font-medium leading-7 text-white/65">
                Choose a regular seat-based route or reserve the
                complete bus for your school, family or group.
              </p>

              <Link
                href="/booking"
                className="group mt-6 inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-6 text-xs font-extrabold text-[#064f3c] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#eaf7f0]"
              >
                Book Your Journey

                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  <Icon name="arrow" size={17} />
                </span>
              </Link>
            </div>

            <div className="absolute -right-16 -top-20 h-60 w-60 rounded-full bg-[#168664]/35 blur-3xl" />

            <div className="absolute -bottom-32 right-32 h-64 w-64 rounded-full bg-[#0b7556]/30 blur-3xl" />
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================== */}

      <footer
        id="contact"
        className="scroll-mt-20 bg-[#03100c] px-5 py-11 text-white sm:px-8 lg:px-14"
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
                    className="rounded-lg object-contain"
                  />
                </div>

                <div>
                  <p className="text-sm font-black">
                    Bahawalpur Double-Decker Bus
                  </p>

                  <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#72dca5]">
                    TDCP Reservation System
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-md text-xs font-medium leading-7 text-white/45">
                A convenient online reservation experience for
                Bahawalpur Double-Decker Bus tours and complete bus
                bookings.
              </p>
            </div>

            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.24em] text-white/35">
                Navigation
              </p>

              <div className="mt-4 flex flex-col gap-3 text-xs">
                <Link
                  href="/"
                  className="font-semibold text-white/55 transition-colors hover:text-white"
                >
                  Home
                </Link>

                <Link
                  href="/routes"
                  className="font-semibold text-white/55 transition-colors hover:text-white"
                >
                  Routes
                </Link>

                <Link
                  href="/about"
                  className="font-semibold text-white/55 transition-colors hover:text-white"
                >
                  About
                </Link>

                <Link
                  href="/why-choose-us"
                  className="font-semibold text-white/55 transition-colors hover:text-white"
                >
                  Why Choose Us
                </Link>

                <Link
                  href="#how-it-works"
                  className="font-semibold text-white/55 transition-colors hover:text-white"
                >
                  How It Works
                </Link>
              </div>
            </div>

            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.24em] text-white/35">
                Service
              </p>

              <div className="mt-4 flex flex-col gap-3 text-xs">
                <Link
                  href="/booking"
                  className="font-semibold text-white/55 transition-colors hover:text-white"
                >
                  Reserve a Seat
                </Link>

                <Link
                  href="/booking?route=04&type=complete-bus"
                  className="font-semibold text-white/55 transition-colors hover:text-white"
                >
                  Book Complete Bus
                </Link>

                <Link
                  href="/booking-status"
                  className="font-semibold text-white/55 transition-colors hover:text-white"
                >
                  Booking Status
                </Link>

                <p className="font-semibold text-white/40">
                  Bahawalpur, Punjab
                </p>
              </div>
            </div>
          </div>

          <div className="mt-9 flex flex-col gap-2 border-t border-white/10 pt-5 text-[10px] font-medium text-white/25 sm:flex-row sm:items-center sm:justify-between">
            <p>Bahawalpur Double-Decker Bus Reservation System</p>

            <p>TDCP • Punjab, Pakistan</p>
          </div>
        </div>
      </footer>
    </main>
  );
}