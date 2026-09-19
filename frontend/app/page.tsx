"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
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
      "Discover Bahawalpur's heritage landmarks and enjoy a comfortable sightseeing journey.",
    price: "Rs. 300",
    priceLabel: "Per Seat",
    type: "seat",
    accent: "green",
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
    shortName: "City Explorer",
    description:
      "Explore the city's museum, library, shopping and entertainment destinations.",
    price: "Rs. 300",
    priceLabel: "Per Seat",
    type: "seat",
    accent: "blue",
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
      "Travel towards DHA and enjoy a relaxed sightseeing experience at the leisure destination.",
    price: "Rs. 300",
    priceLabel: "Per Seat",
    type: "seat",
    accent: "gold",
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
    shortName: "Complete Bus",
    description:
      "Reserve the complete double-decker bus for schools, families, private groups and full-day tours.",
    price: "Rs. 30,000",
    priceLabel: "Complete Bus",
    type: "bus",
    accent: "special",
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
    number: "01",
    title: "Choose Your Route",
    text: "Select the sightseeing route that matches your journey.",
    icon: "route",
  },
  {
    number: "02",
    title: "Select Schedule",
    text: "Choose a convenient travel date and available departure time.",
    icon: "calendar",
  },
  {
    number: "03",
    title: "Pick Your Seat",
    text: "Select an available seat for regular seat-based routes.",
    icon: "seat",
  },
  {
    number: "04",
    title: "Confirm Booking",
    text: "Enter your details, submit payment proof and complete your booking.",
    icon: "check",
  },
];

const benefits = [
  {
    icon: "seat",
    title: "Comfortable Travel",
    text: "Enjoy a relaxed sightseeing experience throughout your journey.",
  },
  {
    icon: "shield",
    title: "Safe & Secure",
    text: "A clear reservation process designed around your travel needs.",
  },
  {
    icon: "bus",
    title: "Modern Double-Decker",
    text: "Experience Bahawalpur from a unique double-decker perspective.",
  },
  {
    icon: "users",
    title: "Easy Booking",
    text: "Choose your route, schedule and seat through a simple online process.",
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

  if (name === "check") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </svg>
    );
  }

  if (name === "phone") {
    return (
      <svg {...common}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.08 5.18 2 2 0 0 1 5.05 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L9 10.73a16 16 0 0 0 4.27 4.27l1.27-1.22a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z" />
      </svg>
    );
  }

  if (name === "mail") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    );
  }

  if (name === "home") {
    return (
      <svg {...common}>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9" />
        <path d="M9 20v-6h6v6" />
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
        (current) => (current + 1) % heroImages.length,
      );
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  function nextHero() {
    setCurrentHero(
      (current) => (current + 1) % heroImages.length,
    );
  }

  function previousHero() {
    setCurrentHero(
      (current) =>
        (current - 1 + heroImages.length) % heroImages.length,
    );
  }

  async function handleStatusSearch(
    e: FormEvent<HTMLFormElement>,
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
      query ? `/booking?${query}` : "/booking",
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6faf7] text-[#10251d]">

      {/* =========================================================
          HERO
      ========================================================== */}

      <section className="relative h-[100svh] min-h-[680px] max-h-[900px] overflow-hidden bg-[#071510]">

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

        {/* HOME HERO ANIMATED DOTS + LINES */}
        <div className="pointer-events-none absolute inset-0 z-[15] overflow-hidden">
          <span className="home-dot home-dot-01" />
          <span className="home-dot home-dot-02" />
          <span className="home-dot home-dot-03" />
          <span className="home-dot home-dot-04" />
          <span className="home-dot home-dot-05" />
          <span className="home-dot home-dot-06" />
          <span className="home-dot home-dot-07" />
          <span className="home-dot home-dot-08" />
          <span className="home-dot home-dot-09" />
          <span className="home-dot home-dot-10" />
          <span className="home-dot home-dot-11" />
          <span className="home-dot home-dot-12" />
          <span className="home-dot home-dot-13" />
          <span className="home-dot home-dot-14" />
          <span className="home-dot home-dot-15" />
          <span className="home-dot home-dot-16" />

          <span className="home-dot home-dot-17" />
          <span className="home-dot home-dot-18" />
          <span className="home-dot home-dot-19" />
          <span className="home-dot home-dot-20" />
          <span className="home-dot home-dot-21" />
          <span className="home-dot home-dot-22" />
          <span className="home-dot home-dot-23" />
          <span className="home-dot home-dot-24" />

          <span className="home-tiny-dot home-tiny-01" />
          <span className="home-tiny-dot home-tiny-02" />
          <span className="home-tiny-dot home-tiny-03" />
          <span className="home-tiny-dot home-tiny-04" />
          <span className="home-tiny-dot home-tiny-05" />
          <span className="home-tiny-dot home-tiny-06" />
          <span className="home-tiny-dot home-tiny-07" />
          <span className="home-tiny-dot home-tiny-08" />

          <span className="home-line home-line-01" />
          <span className="home-line home-line-02" />
          <span className="home-line home-line-03" />
        </div>

        <div className="absolute inset-0 z-20 bg-[#03150f]/30" />

        <div className="absolute inset-0 z-20 bg-gradient-to-r from-[#03150f]/95 via-[#03150f]/78 via-45% to-[#03150f]/15" />

        <div className="absolute inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-t from-[#071510] via-[#071510]/55 to-transparent" />

        {/* HEADER */}

        <header className="absolute left-0 right-0 top-0 z-50">
          <div className="mx-auto flex min-h-[82px] max-w-[1440px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">

            <Link
              href="/"
              className="group flex shrink-0 items-center gap-3"
            >
              <div className="relative flex h-[58px] w-[78px] items-center justify-center rounded-2xl border border-white/25 bg-white/95 p-1 shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
                <Image
                  src="/images/tdcp-logo.png.jpeg.jpeg.png"
                  alt="TDCP Logo"
                  fill
                  sizes="74px"
                  className="object-contain drop-shadow-sm"
                  priority
                />
              </div>

              <div className="hidden sm:block">
                <p className="text-[19px] font-black leading-none tracking-[-0.04em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
                  BAHAWALPUR
                </p>

                <p className="mt-1 text-[11px] font-extrabold tracking-[0.04em] text-[#8ff0c2] drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
                  DOUBLE-DECKER BUS
                </p>

                <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.17em] text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
                  TDCP Reservation System
                </p>
              </div>
            </Link>

            <nav className="hidden items-center gap-5 xl:flex">
              <Link
                href="/"
                className="text-[13px] font-extrabold text-[#55d89e]"
              >
                Home
              </Link>

              <Link
                href="/routes"
                className="text-[13px] font-semibold text-white/75 transition hover:text-white"
              >
                Routes
              </Link>

              <Link
                href="/why-choose-us"
                className="text-[13px] font-semibold text-white/75 transition hover:text-white"
              >
                Why Choose Us
              </Link>

              <Link
                href="/how-it-works"
                className="text-[13px] font-semibold text-white/75 transition hover:text-white"
              >
                How It Works
              </Link>

              <Link
                href="/about"
                className="text-[13px] font-semibold text-white/75 transition hover:text-white"
              >
                About
              </Link>

              <Link
                href="/booking-status"
                className="text-[13px] font-semibold text-white/75 transition hover:text-white"
              >
                Booking Status
              </Link>

              <Link
                href="/contact"
                className="text-[13px] font-semibold text-white/75 transition hover:text-white"
              >
                Contact
              </Link>
            </nav>

            <Link
              href="/booking"
              className="group inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl bg-[#008765] px-4 sm:px-5 text-xs sm:text-sm font-extrabold text-white shadow-[0_10px_30px_rgba(0,135,101,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#009b73]"
            >
              <Icon name="ticket" size={17} />

              <span className="hidden sm:inline">
                Book Now
              </span>

              <span className="transition-transform duration-300 group-hover:translate-x-1">
                <Icon name="arrow" size={15} />
              </span>
            </Link>
          </div>
        </header>

        {/* HERO CONTENT */}

        <div className="relative z-30 mx-auto flex min-h-[680px] max-w-[1440px] items-center px-5 pb-16 pt-28 sm:px-8 lg:px-12">
          <div className="max-w-[690px]">

            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#55d89e]" />
              <span className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-white/75">
                Bahawalpur • TDCP
              </span>
            </div>

            <h2 className="mt-5 text-[43px] font-black leading-[0.94] tracking-[-0.065em] text-white sm:text-[58px] lg:text-[70px]">
              Your Journey
              <span className="relative mt-2 block w-fit text-[#43c98f]">
                Starts Here.
                <span className="absolute -bottom-3 left-0 h-[4px] w-[60%] rounded-full bg-[#d3a15e]" />
              </span>
            </h2>

            <p className="mt-6 max-w-[580px] text-[14px] font-medium leading-6 text-white/75 sm:text-[16px] sm:leading-7">
              Book your seat on the{" "}
              <strong className="font-extrabold text-white">
                Bahawalpur Double-Decker Bus
              </strong>{" "}
              and experience a comfortable journey through Bahawalpur.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/booking"
                className="group inline-flex h-[54px] items-center justify-center gap-2 rounded-2xl bg-[#008765] px-7 text-sm font-extrabold text-white shadow-[0_14px_35px_rgba(0,135,101,0.28)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#009b73]"
              >
                <Icon name="ticket" size={19} />
                Book a Seat
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  <Icon name="arrow" size={17} />
                </span>
              </Link>

              <Link
                href="/booking-status"
                className="group inline-flex h-[54px] items-center justify-center gap-2 rounded-2xl border border-white/20 bg-black/20 px-7 text-sm font-extrabold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#55d89e]/60 hover:bg-black/35"
              >
                <Icon name="search" size={18} />
                Check Booking
              </Link>
            </div>

            <div className="mt-7 flex max-w-[650px] divide-x divide-white/15">
              {[
                ["Comfortable", "Travel", "seat"],
                ["Safe & Secure", "Journey", "shield"],
                ["Modern", "Double-Decker", "bus"],
                ["Easy", "Booking", "users"],
              ].map(([title, subtitle, icon]) => (
                <div
                  key={title}
                  className="flex flex-1 flex-col items-center px-3 text-center first:pl-0"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/25 text-[#55d89e] backdrop-blur-md">
                    <Icon name={icon} size={18} />
                  </div>

                  <p className="mt-2 text-[9px] font-extrabold text-white">
                    {title}
                  </p>

                  <p className="text-[8px] font-semibold text-white/50">
                    {subtitle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SLIDER */}

        <button
          type="button"
          onClick={previousHero}
          aria-label="Previous hero image"
          className="absolute left-4 top-1/2 z-40 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-md transition hover:bg-black/40 sm:flex"
        >
          <svg
            width="19"
            height="19"
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
          className="absolute right-4 top-1/2 z-40 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-md transition hover:bg-black/40 sm:flex"
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

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

      <section className="relative z-30 -mt-7 overflow-hidden px-5 sm:px-8 lg:px-12">
        <div className="section-particles pointer-events-none absolute inset-0 overflow-hidden"><span className="section-dot sd-01" /><span className="section-dot sd-02" /><span className="section-dot sd-03" /><span className="section-dot sd-04" /><span className="section-dot sd-05" /><span className="section-dot sd-06" /></div>
        <div className="mx-auto max-w-[1320px]">
          <div className="rounded-[24px] border border-[#dbe8e1] bg-white p-3 shadow-[0_18px_50px_rgba(15,40,30,0.13)]">
            <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">

              <div className="rounded-xl border border-[#e1eae5] bg-[#f8fbf9] px-4 py-3">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#7a8982]">
                  From
                </p>

                <div className="mt-1 flex items-center gap-3">
                  <div className="text-[#008765]">
                    <Icon name="location" size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-extrabold text-[#10251d]">
                      Bahawalpur
                    </p>

                    <p className="text-[10px] font-medium text-[#7a8982]">
                      TDCP Bus Terminal
                    </p>
                  </div>
                </div>
              </div>

              <label className="rounded-xl border border-[#e1eae5] bg-[#f8fbf9] px-4 py-3">
                <span className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#7a8982]">
                  Travel Date
                </span>

                <div className="mt-1 flex items-center gap-3">
                  <div className="text-[#008765]">
                    <Icon name="calendar" size={19} />
                  </div>

                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent text-sm font-extrabold text-[#10251d] outline-none"
                  />
                </div>
              </label>

              <label className="rounded-xl border border-[#e1eae5] bg-[#f8fbf9] px-4 py-3">
                <span className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#7a8982]">
                  Departure Time
                </span>

                <div className="mt-1 flex items-center gap-3">
                  <div className="text-[#008765]">
                    <Icon name="clock" size={19} />
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
                className="group flex min-h-[68px] items-center justify-center gap-2 rounded-2xl bg-[#008765] px-7 text-sm font-extrabold text-white shadow-[0_10px_25px_rgba(0,135,101,0.20)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#009b73]"
              >
                Search Buses
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  <Icon name="arrow" size={18} />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          ROUTES
      ========================================================== */}

      <section className="bg-[#f6faf7] px-5 pb-14 pt-16 sm:px-8 sm:pt-18 lg:px-12 lg:pt-20">
        <div className="mx-auto max-w-[1320px]">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-[3px] w-9 rounded-full bg-[#008765]" />
                <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#008765]">
                  Explore Our Routes
                </p>
              </div>

              <h2 className="mt-3 text-3xl font-black tracking-[-0.055em] text-[#10251d] sm:text-4xl lg:text-[43px]">
                Choose your journey
              </h2>

              <p className="mt-3 max-w-[650px] text-sm font-medium leading-6 text-[#718079]">
                Select a regular sightseeing route or reserve the complete
                double-decker bus for your school, family or group.
              </p>
            </div>

            <Link
              href="/routes"
              className="group inline-flex h-11 w-fit shrink-0 items-center gap-2 rounded-xl border border-[#cbded4] bg-white px-5 text-xs font-extrabold text-[#008765] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#008765] hover:shadow-md"
            >
              View All Routes
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                <Icon name="arrow" size={16} />
              </span>
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {routes.map((route) => (
              <article
                key={route.number}
                className={`group relative flex min-h-[430px] flex-col overflow-hidden rounded-[24px] border bg-white shadow-[0_8px_28px_rgba(15,40,30,0.07)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_22px_45px_rgba(15,40,30,0.13)] ${
                  route.type === "bus"
                    ? "border-[#8acfb1]"
                    : "border-[#dce8e2]"
                }`}
              >
                {/* Card top visual */}

                <div
                  className={`relative h-[108px] overflow-hidden ${
                    route.type === "bus"
                      ? "bg-[#e1f5eb]"
                      : "bg-[#f0f8f4]"
                  }`}
                >
                  <div className="absolute -right-8 -top-12 h-32 w-32 rounded-full bg-[#008765]/10 transition-transform duration-500 group-hover:scale-125" />

                  <div className="absolute -bottom-16 left-12 h-28 w-28 rounded-full bg-[#55d89e]/10" />

                  <div className="relative z-10 flex items-start justify-between p-5">
                    <div>
                      <span className="text-[34px] font-black leading-none tracking-[-0.07em] text-[#b8cec3]">
                        {route.number}
                      </span>

                      <p className="mt-2 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#008765]">
                        {route.shortName}
                      </p>
                    </div>

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm transition-all duration-500 group-hover:rotate-3 group-hover:scale-110 ${
                        route.type === "bus"
                          ? "bg-[#008765] text-white"
                          : "bg-white text-[#008765]"
                      }`}
                    >
                      <Icon
                        name={route.type === "bus" ? "bus" : "route"}
                        size={21}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">

                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[18px] font-black leading-[1.18] tracking-[-0.025em] text-[#10251d]">
                      {route.name}
                    </h3>

                    {route.type === "bus" && (
                      <span className="shrink-0 rounded-full bg-[#dff4e9] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-[#008765]">
                        Private
                      </span>
                    )}
                  </div>

                  <p className="mt-3 min-h-[65px] text-[11px] font-medium leading-5 text-[#718079]">
                    {route.description}
                  </p>

                  <div className="mt-4 flex items-end justify-between border-t border-[#e8efeb] pt-4">
                    <div>
                      <p className="text-[8px] font-extrabold uppercase tracking-[0.15em] text-[#899790]">
                        {route.priceLabel}
                      </p>

                      <p className="mt-1 text-[25px] font-black tracking-[-0.05em] text-[#008765]">
                        {route.price}
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf7f2] text-[#008765]">
                      <Icon
                        name={route.type === "bus" ? "bus" : "ticket"}
                        size={17}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-[#899790]">
                      Main Stops
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {route.stops.slice(0, 4).map((stop) => (
                        <span
                          key={stop}
                          className="rounded-full border border-[#e1ece6] bg-[#f7faf8] px-2.5 py-1 text-[8px] font-semibold text-[#62736b]"
                        >
                          {stop}
                        </span>
                      ))}

                      {route.stops.length > 4 && (
                        <span className="rounded-full bg-[#e2f4eb] px-2.5 py-1 text-[8px] font-extrabold text-[#008765]">
                          +{route.stops.length - 4}
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
                    className={`group mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl text-xs font-extrabold transition-all duration-300 ${
                      route.type === "bus"
                        ? "bg-[#008765] text-white shadow-[0_8px_20px_rgba(0,135,101,0.18)] hover:bg-[#009b73]"
                        : "border border-[#b9d8ca] bg-[#f4faf7] text-[#008765] hover:border-[#008765] hover:bg-[#e7f5ee]"
                    }`}
                  >
                    {route.type === "bus"
                      ? "Book Complete Bus"
                      : "Select Seats"}

                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      <Icon name="arrow" size={15} />
                    </span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          WHY CHOOSE US — LIGHT THEME
      ========================================================== */}

      <section className="border-y border-[#e0ebe5] bg-white px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-[1320px]">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-[700px]">
              <div className="flex items-center gap-3">
                <span className="h-[3px] w-9 rounded-full bg-[#008765]" />

                <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#008765]">
                  Why Choose Us
                </p>
              </div>

              <h2 className="mt-3 text-3xl font-black tracking-[-0.055em] text-[#10251d] sm:text-4xl">
                Designed around your journey.
              </h2>

              <p className="mt-3 max-w-[620px] text-sm font-medium leading-6 text-[#718079]">
                A simple reservation experience with the essentials you
                need before, during and after your journey.
              </p>
            </div>

            <Link
              href="/why-choose-us"
              className="group inline-flex h-10 w-fit items-center gap-2 rounded-xl border border-[#cbded4] px-5 text-xs font-extrabold text-[#008765] transition-all hover:bg-[#f1f8f4]"
            >
              Explore More
              <span className="transition-transform group-hover:translate-x-1">
                <Icon name="arrow" size={15} />
              </span>
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((item, index) => (
              <article
                key={item.title}
                className="group relative overflow-hidden rounded-[20px] border border-[#dce8e2] bg-[#f8fbf9] p-5 shadow-[0_7px_24px_rgba(15,40,30,0.05)] transition-all duration-400 hover:-translate-y-1 hover:border-[#a9d8c3] hover:bg-white hover:shadow-[0_15px_35px_rgba(15,40,30,0.09)]"
              >
                <span className="absolute right-4 top-3 text-[32px] font-black tracking-[-0.08em] text-[#e1eee8]">
                  0{index + 1}
                </span>

                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#e2f4eb] text-[#008765] transition-all duration-300 group-hover:scale-105 group-hover:bg-[#008765] group-hover:text-white">
                  <Icon name={item.icon} size={21} />
                </div>

                <h3 className="relative mt-5 text-[15px] font-black text-[#10251d]">
                  {item.title}
                </h3>

                <p className="relative mt-2 text-[11px] font-medium leading-5 text-[#718079]">
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

      <section className="relative overflow-hidden bg-[#f3f8f5] px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
        <div className="section-particles pointer-events-none absolute inset-0 overflow-hidden"><span className="section-dot sd-07" /><span className="section-dot sd-08" /><span className="section-dot sd-09" /><span className="section-dot sd-10" /><span className="section-dot sd-11" /><span className="section-dot sd-12" /></div>
        <div className="mx-auto max-w-[1320px]">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-[3px] w-9 rounded-full bg-[#008765]" />

                <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#008765]">
                  How It Works
                </p>
              </div>

              <h2 className="mt-3 text-3xl font-black tracking-[-0.055em] text-[#10251d] sm:text-4xl">
                Four simple steps.
              </h2>

              <p className="mt-3 text-sm font-medium leading-6 text-[#718079]">
                From choosing your route to completing your booking.
              </p>
            </div>

            <Link
              href="/how-it-works"
              className="group inline-flex h-10 w-fit items-center gap-2 rounded-xl border border-[#b9d8ca] bg-white px-5 text-xs font-extrabold text-[#008765] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#008765]"
            >
              View Full Guide
              <span className="transition-transform group-hover:translate-x-1">
                <Icon name="arrow" size={15} />
              </span>
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <article
                key={step.number}
                className="group relative rounded-[20px] border border-[#d7e5de] bg-white p-5 shadow-[0_6px_22px_rgba(15,40,30,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(15,40,30,0.08)]"
              >
                {index < steps.length - 1 && (
                  <div className="absolute right-[-18px] top-[48px] z-20 hidden h-8 w-8 items-center justify-center rounded-full border border-[#d7e5de] bg-[#f3f8f5] text-[#9ab4a7] lg:flex">
                    <Icon name="arrow" size={13} />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#008765] text-[10px] font-black text-white shadow-[0_7px_18px_rgba(0,135,101,0.18)]">
                    {step.number}
                  </div>

                  <div className="text-[#008765]">
                    <Icon name={step.icon} size={20} />
                  </div>
                </div>

                <h3 className="mt-5 text-[14px] font-black text-[#10251d]">
                  {step.title}
                </h3>

                <p className="mt-2 text-[11px] font-medium leading-5 text-[#718079]">
                  {step.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          ABOUT — AFTER HOW IT WORKS
      ========================================================== */}

      <section className="relative overflow-hidden bg-white px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
        <div className="section-particles pointer-events-none absolute inset-0 overflow-hidden"><span className="section-dot sd-13" /><span className="section-dot sd-14" /><span className="section-dot sd-15" /><span className="section-dot sd-16" /><span className="section-dot sd-17" /><span className="section-dot sd-18" /></div>
        <div className="mx-auto grid max-w-[1320px] items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">

          <div>
            <div className="flex items-center gap-3">
              <span className="h-[3px] w-9 rounded-full bg-[#008765]" />

              <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#008765]">
                About The Service
              </p>
            </div>

            <h2 className="mt-4 text-3xl font-black leading-[1.02] tracking-[-0.06em] text-[#10251d] sm:text-4xl lg:text-[45px]">
              A smarter way to
              <span className="block text-[#008765]">
                book your journey.
              </span>
            </h2>

            <p className="mt-4 max-w-[540px] text-sm font-medium leading-6 text-[#718079]">
              The Bahawalpur Double-Decker Bus reservation system gives
              visitors a convenient way to choose their route, schedule,
              available seat and booking details online.
            </p>

            <Link
              href="/about"
              className="group mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-[#008765] px-5 text-xs font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-[#009b73]"
            >
              Learn More About Us
              <span className="transition-transform group-hover:translate-x-1">
                <Icon name="arrow" size={15} />
              </span>
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-[25px] border border-[#dce8e2] bg-[#f4faf7] p-6 shadow-[0_12px_35px_rgba(15,40,30,0.07)] sm:p-8">

            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#55d89e]/10" />

            <div className="relative">
              <div className="flex items-start gap-4 border-b border-[#dce8e2] pb-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#dff3e9] text-[#008765]">
                  <Icon name="bus" size={22} />
                </div>

                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.17em] text-[#008765]">
                    Bahawalpur Double-Decker
                  </p>

                  <h3 className="mt-1 text-lg font-black text-[#10251d]">
                    Simple. Clear. Convenient.
                  </h3>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  ["Scheduled Tours", "calendar"],
                  ["Upper & Lower Deck", "seat"],
                  ["Online Reservation", "ticket"],
                  ["Complete Bus Booking", "bus"],
                ].map(([text, icon]) => (
                  <div
                    key={text}
                    className="flex items-center gap-3 rounded-xl border border-[#dce8e2] bg-white px-4 py-3"
                  >
                    <span className="text-[#008765]">
                      <Icon name={icon} size={17} />
                    </span>

                    <span className="text-[10px] font-extrabold text-[#3f554b]">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          BOOKING STATUS
      ========================================================== */}

      <section className="bg-[#f3f8f5] px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1320px]">

          <div className="relative overflow-hidden rounded-[24px] border border-[#cfe1d8] bg-white px-5 py-6 shadow-[0_10px_30px_rgba(15,40,30,0.06)] sm:px-7 lg:px-9">

            <div className="absolute -right-10 -top-20 h-48 w-48 rounded-full bg-[#55d89e]/10" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e0f3ea] text-[#008765]">
                  <Icon name="search" size={21} />
                </div>

                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#008765]">
                    Booking Status
                  </p>

                  <h3 className="mt-1 text-lg font-black text-[#10251d]">
                    Already have a booking?
                  </h3>

                  <p className="mt-1 text-xs font-medium leading-5 text-[#718079]">
                    Check your booking using your reference, phone number or email.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleStatusSearch}
                className="flex w-full max-w-[600px] flex-col gap-2 sm:flex-row"
              >
                <div className="flex h-[48px] flex-1 items-center gap-3 rounded-xl border border-[#d7e4dd] bg-[#f8fbf9] px-4 focus-within:border-[#008765]">
                  <div className="text-[#008765]">
                    <Icon name="search" size={18} />
                  </div>

                  <input
                    value={bookingRef}
                    onChange={(e) => setBookingRef(e.target.value)}
                    placeholder="Reference, phone, or email"
                    className="w-full bg-transparent text-xs font-semibold text-[#10251d] outline-none placeholder:text-[#9aa8a1]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={statusLoading}
                  className="h-[48px] rounded-xl bg-[#008765] px-6 text-xs font-extrabold text-white transition-all hover:bg-[#009b73] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {statusLoading ? "Checking..." : "Check Status"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================== */}

      <section className="relative overflow-hidden bg-[#f6faf7] px-5 py-12 sm:px-8 lg:px-12">
        <div className="section-particles pointer-events-none absolute inset-0 overflow-hidden"><span className="section-dot sd-25" /><span className="section-dot sd-26" /><span className="section-dot sd-27" /><span className="section-dot sd-28" /><span className="section-dot sd-29" /><span className="section-dot sd-30" /></div>
        <div className="mx-auto max-w-[1320px]">
          <div className="relative overflow-hidden rounded-[26px] bg-[#075c46] px-7 py-9 shadow-[0_18px_45px_rgba(0,75,55,0.17)] sm:px-10 lg:px-12">

            <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#43c98f]/15 blur-2xl" />

            <div className="absolute -bottom-28 right-48 h-56 w-56 rounded-full bg-[#55d89e]/10 blur-2xl" />

            <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              <div className="max-w-[720px]">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.28em] text-[#75e4b0]">
                  Ready To Travel?
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">
                  Your journey starts here.
                </h2>

                <p className="mt-2 max-w-[620px] text-xs font-medium leading-6 text-white/65">
                  Choose a regular seat-based route or reserve the complete
                  bus for your school, family or group.
                </p>
              </div>

              <Link
                href="/booking"
                className="group inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 text-xs font-extrabold text-[#075c46] transition-all hover:-translate-y-0.5 hover:bg-[#edf8f2]"
              >
                Book Your Journey
                <span className="transition-transform group-hover:translate-x-1">
                  <Icon name="arrow" size={15} />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          LIGHT FOOTER
      ========================================================== */}

      <footer className="relative overflow-hidden border-t border-[#2bd58b]/30 bg-[#087653] px-5 py-10 text-white sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="footer-dot footer-dot-01" />
          <span className="footer-dot footer-dot-02" />
          <span className="footer-dot footer-dot-03" />
          <span className="footer-dot footer-dot-04" />
          <span className="footer-dot footer-dot-05" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1320px]">

          <div className="grid gap-9 md:grid-cols-[1.5fr_0.8fr_0.9fr_1fr]">

            {/* BRAND */}

            <div>
              <div className="flex items-center gap-3">
                <div className="relative flex h-[58px] w-[76px] shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white p-1 shadow-[0_8px_22px_rgba(0,0,0,0.18)]">
                  <Image
                    src="/images/tdcp-logo.png.jpeg.jpeg.png"
                    alt="TDCP Logo"
                    fill
                    sizes="68px"
                    className="object-contain"
                  />
                </div>

                <div>
                  <p className="text-sm font-black text-white">
                    Bahawalpur Double-Decker Bus
                  </p>

                  <p className="mt-1 text-[8px] font-extrabold uppercase tracking-[0.18em] text-[#b8f5d8]">
                    TDCP Reservation System
                  </p>
                </div>
              </div>

              <p className="mt-4 max-w-sm text-[11px] font-medium leading-6 text-white/75">
                A convenient online reservation experience for Bahawalpur
                Double-Decker Bus tours and complete bus bookings.
              </p>
            </div>

            {/* NAVIGATION */}

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#d7fae8]">
                Navigation
              </p>

              <div className="mt-4 flex flex-col gap-2.5 text-[11px]">
                <Link
                  href="/"
                  className="font-bold text-white/85 transition hover:text-[#b8f5d8]"
                >
                  Home
                </Link>

                <Link
                  href="/routes"
                  className="font-bold text-white/85 transition hover:text-[#b8f5d8]"
                >
                  Routes
                </Link>

                <Link
                  href="/why-choose-us"
                  className="font-bold text-white/85 transition hover:text-[#b8f5d8]"
                >
                  Why Choose Us
                </Link>

                <Link
                  href="/how-it-works"
                  className="font-bold text-white/85 transition hover:text-[#b8f5d8]"
                >
                  How It Works
                </Link>

                <Link
                  href="/about"
                  className="font-bold text-white/85 transition hover:text-[#b8f5d8]"
                >
                  About
                </Link>
              </div>
            </div>

            {/* BOOKING */}

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#d7fae8]">
                Booking
              </p>

              <div className="mt-4 flex flex-col gap-2.5 text-[11px]">
                <Link
                  href="/booking"
                  className="font-bold text-white/85 transition hover:text-[#b8f5d8]"
                >
                  Reserve a Seat
                </Link>

                <Link
                  href="/booking?route=04&type=complete-bus"
                  className="font-bold text-white/85 transition hover:text-[#b8f5d8]"
                >
                  Book Complete Bus
                </Link>

                <Link
                  href="/booking-status"
                  className="font-bold text-white/85 transition hover:text-[#b8f5d8]"
                >
                  Booking Status
                </Link>

                <Link
                  href="/contact"
                  className="font-bold text-white/85 transition hover:text-[#b8f5d8]"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* CONTACT */}

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#d7fae8]">
                Contact
              </p>

              <div className="mt-4 space-y-3">

                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-[#07563d] text-[#8ff0c2]">
                    <Icon name="phone" size={15} />
                  </div>

                  <div>
                    <p className="text-[8px] font-extrabold uppercase tracking-[0.08em] text-white/55">
                      Phone
                    </p>

                    <p className="text-[10px] font-bold text-white">
                      062-2501932
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-[#07563d] text-[#8ff0c2]">
                    <Icon name="phone" size={15} />
                  </div>

                  <div>
                    <p className="text-[8px] font-extrabold uppercase tracking-[0.08em] text-white/55">
                      Mobile
                    </p>

                    <p className="text-[10px] font-bold text-white">
                      0305-7877304
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-[#07563d] text-[#8ff0c2]">
                    <Icon name="mail" size={15} />
                  </div>

                  <div>
                    <p className="text-[8px] font-extrabold uppercase tracking-[0.08em] text-white/55">
                      Email
                    </p>

                    <p className="break-all text-[10px] font-bold text-white">
                      Tdcpmultan@gmail.com
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2 border-t border-white/20 pt-5 text-[9px] font-semibold text-white/60 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © 2026 Bahawalpur Double-Decker Bus Reservation System
            </p>

            <p>
              TDCP • Bahawalpur, Punjab, Pakistan
            </p>
          </div>

          <div className="mt-3 text-center text-[10px] font-black tracking-[0.03em] text-white">
            Developed by Naina Nayab & Imran Mansha
          </div>
        </div>
      </footer>
    
      <style jsx>{`
        @keyframes sectionFloat {
          0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.18; }
          50% { transform: translate3d(34px, -24px, 0); opacity: 0.58; }
        }

        @keyframes homeFloatOne {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.45; }
          50% { transform: translate3d(70px, -45px, 0) scale(1.22); opacity: 0.95; }
        }

        @keyframes homeFloatTwo {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.35; }
          50% { transform: translate3d(-80px, 35px, 0) scale(1.18); opacity: 0.9; }
        }

        @keyframes homeFloatThree {
          0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.3; }
          50% { transform: translate3d(110px, 70px, 0); opacity: 0.8; }
        }

        @keyframes homeLineMove {
          0% { transform: translate3d(-35%, 0, 0); opacity: 0; }
          15% { opacity: 0.5; }
          50% { opacity: 0.85; }
          100% { transform: translate3d(135%, 0, 0); opacity: 0; }
        }

        @keyframes homeLinePulse {
          0%, 100% { opacity: 0.12; transform: scaleX(0.92); }
          50% { opacity: 0.32; transform: scaleX(1); }
        }

        @keyframes footerFloat {
          0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.18; }
          50% { transform: translate3d(35px, -22px, 0); opacity: 0.55; }
        }

        .home-dot {
          position: absolute;
          width: 9px;
          height: 9px;
          border-radius: 9999px;
          background: rgba(67, 201, 143, 0.72);
          box-shadow: 0 0 18px rgba(67, 201, 143, 0.28);
        }

        .home-dot-01 { left: 7%; top: 19%; animation: homeFloatOne 8s ease-in-out infinite; }
        .home-dot-02 { left: 16%; top: 46%; animation: homeFloatTwo 11s ease-in-out infinite -2s; }
        .home-dot-03 { left: 27%; top: 13%; animation: homeFloatThree 10s ease-in-out infinite -3s; }
        .home-dot-04 { left: 39%; top: 31%; animation: homeFloatTwo 12s ease-in-out infinite -5s; }
        .home-dot-05 { left: 51%; top: 18%; animation: homeFloatOne 9s ease-in-out infinite -4s; }
        .home-dot-06 { left: 63%; top: 42%; animation: homeFloatThree 13s ease-in-out infinite -1s; }
        .home-dot-07 { left: 76%; top: 17%; animation: homeFloatTwo 10s ease-in-out infinite -6s; }
        .home-dot-08 { left: 89%; top: 35%; animation: homeFloatOne 12s ease-in-out infinite -3s; }
        .home-dot-09 { left: 11%; top: 72%; width: 7px; height: 7px; animation: homeFloatThree 11s ease-in-out infinite -2s; }
        .home-dot-10 { left: 31%; top: 66%; width: 7px; height: 7px; animation: homeFloatOne 13s ease-in-out infinite -7s; }
        .home-dot-11 { left: 48%; top: 78%; width: 7px; height: 7px; animation: homeFloatTwo 10s ease-in-out infinite -4s; }
        .home-dot-12 { left: 66%; top: 68%; width: 7px; height: 7px; animation: homeFloatThree 12s ease-in-out infinite -5s; }
        .home-dot-13 { left: 81%; top: 73%; width: 7px; height: 7px; animation: homeFloatOne 11s ease-in-out infinite -1s; }
        .home-dot-14 { left: 94%; top: 63%; width: 7px; height: 7px; animation: homeFloatTwo 14s ease-in-out infinite -8s; }
        .home-dot-15 { left: 23%; top: 88%; width: 6px; height: 6px; animation: homeFloatThree 12s ease-in-out infinite -6s; }
        .home-dot-16 { left: 72%; top: 90%; width: 6px; height: 6px; animation: homeFloatOne 14s ease-in-out infinite -2s; }

        .home-dot-17 { left: 4%; top: 42%; width: 6px; height: 6px; animation: homeFloatTwo 9s ease-in-out infinite -2s; }
        .home-dot-18 { left: 22%; top: 30%; width: 6px; height: 6px; animation: homeFloatOne 12s ease-in-out infinite -5s; }
        .home-dot-19 { left: 43%; top: 14%; width: 6px; height: 6px; animation: homeFloatThree 10s ease-in-out infinite -4s; }
        .home-dot-20 { left: 58%; top: 53%; width: 6px; height: 6px; animation: homeFloatTwo 11s ease-in-out infinite -6s; }
        .home-dot-21 { left: 73%; top: 31%; width: 6px; height: 6px; animation: homeFloatOne 13s ease-in-out infinite -3s; }
        .home-dot-22 { left: 86%; top: 56%; width: 6px; height: 6px; animation: homeFloatThree 12s ease-in-out infinite -7s; }
        .home-dot-23 { left: 36%; top: 84%; width: 5px; height: 5px; animation: homeFloatOne 10s ease-in-out infinite -1s; }
        .home-dot-24 { left: 62%; top: 88%; width: 5px; height: 5px; animation: homeFloatTwo 14s ease-in-out infinite -4s; }

        .section-dot {
          position: absolute;
          width: 7px;
          height: 7px;
          border-radius: 9999px;
          background: rgba(0, 135, 101, 0.30);
          box-shadow: 0 0 14px rgba(67, 201, 143, 0.12);
          animation: sectionFloat 8s ease-in-out infinite;
        }
        .sd-01 { left: 5%; top: 18%; animation-delay: -1s; } .sd-02 { left: 22%; top: 62%; animation-delay: -4s; }
        .sd-03 { left: 44%; top: 24%; animation-delay: -2s; } .sd-04 { left: 68%; top: 70%; animation-delay: -6s; }
        .sd-05 { left: 84%; top: 34%; animation-delay: -3s; } .sd-06 { left: 94%; top: 78%; animation-delay: -5s; }
        .sd-07 { left: 8%; top: 26%; animation-delay: -2s; } .sd-08 { left: 28%; top: 72%; animation-delay: -5s; }
        .sd-09 { left: 49%; top: 18%; animation-delay: -3s; } .sd-10 { left: 67%; top: 58%; animation-delay: -7s; }
        .sd-11 { left: 82%; top: 30%; animation-delay: -4s; } .sd-12 { left: 93%; top: 82%; animation-delay: -6s; }
        .sd-13 { left: 6%; top: 68%; animation-delay: -3s; } .sd-14 { left: 24%; top: 22%; animation-delay: -1s; }
        .sd-15 { left: 42%; top: 78%; animation-delay: -5s; } .sd-16 { left: 61%; top: 30%; animation-delay: -2s; }
        .sd-17 { left: 78%; top: 72%; animation-delay: -6s; } .sd-18 { left: 92%; top: 18%; animation-delay: -4s; }
        .sd-19 { left: 7%; top: 35%; animation-delay: -2s; } .sd-20 { left: 31%; top: 72%; animation-delay: -5s; }
        .sd-21 { left: 53%; top: 20%; animation-delay: -3s; } .sd-22 { left: 70%; top: 66%; animation-delay: -7s; }
        .sd-23 { left: 86%; top: 38%; animation-delay: -4s; } .sd-24 { left: 96%; top: 76%; animation-delay: -6s; }
        .sd-25 { left: 5%; top: 22%; animation-delay: -1s; } .sd-26 { left: 26%; top: 70%; animation-delay: -4s; }
        .sd-27 { left: 47%; top: 34%; animation-delay: -2s; } .sd-28 { left: 65%; top: 78%; animation-delay: -6s; }
        .sd-29 { left: 82%; top: 24%; animation-delay: -3s; } .sd-30 { left: 94%; top: 68%; animation-delay: -5s; }

        .home-tiny-dot {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 9999px;
          background: rgba(184, 245, 216, 0.8);
          animation: homeFloatThree 7s ease-in-out infinite alternate;
        }

        .home-tiny-01 { left: 5%; top: 31%; animation-delay: -1s; }
        .home-tiny-02 { left: 19%; top: 22%; animation-delay: -3s; }
        .home-tiny-03 { left: 34%; top: 48%; animation-delay: -5s; }
        .home-tiny-04 { left: 45%; top: 10%; animation-delay: -2s; }
        .home-tiny-05 { left: 58%; top: 57%; animation-delay: -6s; }
        .home-tiny-06 { left: 70%; top: 29%; animation-delay: -4s; }
        .home-tiny-07 { left: 84%; top: 52%; animation-delay: -7s; }
        .home-tiny-08 { left: 96%; top: 20%; animation-delay: -2s; }

        .home-line {
          position: absolute;
          height: 1px;
          width: 38%;
          border-radius: 9999px;
          background: linear-gradient(90deg, transparent, rgba(85, 216, 158, 0.65), transparent);
          box-shadow: 0 0 14px rgba(67, 201, 143, 0.16);
        }

        .home-line-01 { left: 4%; top: 34%; transform: rotate(-7deg); animation: homeLineMove 7s linear infinite; }
        .home-line-02 { left: 45%; top: 57%; width: 30%; transform: rotate(8deg); animation: homeLineMove 9s linear infinite -3s; }
        .home-line-03 { left: 66%; top: 78%; width: 26%; transform: rotate(-5deg); animation: homeLineMove 8s linear infinite -5s; }

        .footer-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: rgba(216, 255, 235, 0.42);
          animation: footerFloat 8s ease-in-out infinite;
        }

        .footer-dot-01 { left: 8%; top: 22%; animation-delay: -1s; }
        .footer-dot-02 { left: 31%; top: 68%; animation-delay: -4s; }
        .footer-dot-03 { left: 57%; top: 28%; animation-delay: -2s; }
        .footer-dot-04 { left: 76%; top: 70%; animation-delay: -6s; }
        .footer-dot-05 { left: 92%; top: 35%; animation-delay: -3s; }

        @media (prefers-reduced-motion: reduce) {
          .home-dot,
          .home-tiny-dot,
          .section-dot,
          .home-line,
          .footer-dot {
            animation: none !important;
          }
        }
      `}</style>
</main>
  );
}