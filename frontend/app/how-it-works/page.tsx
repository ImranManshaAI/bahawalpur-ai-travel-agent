"use client";

import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Choose Your Route",
    description:
      "Explore available routes and choose the destination that fits your journey.",
    href: "/routes",
    icon: "route",
  },
  {
    number: "02",
    title: "Select Your Schedule",
    description:
      "Find a suitable travel date and timing slot for your BWP journey.",
    href: "/booking",
    icon: "calendar",
  },
  {
    number: "03",
    title: "Pick Your Seat",
    description:
      "Choose your preferred available seat and continue with your booking.",
    href: "/booking",
    icon: "seat",
  },
  {
    number: "04",
    title: "Confirm Your Booking",
    description:
      "Review your journey details and confirm your booking with ease.",
    href: "/booking",
    icon: "check",
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
    xmlns: "http://www.w3.org/2000/svg",
  };

  if (name === "route") {
    return (
      <svg {...common}>
        <path
          d="M5 19C7.2 19 8.4 17.7 9.3 16.1L14.7 6.9C15.6 5.3 16.8 4 19 4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle
          cx="5"
          cy="19"
          r="2.2"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle
          cx="19"
          cy="4"
          r="2.2"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M10 12H15"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg {...common}>
        <rect
          x="3.5"
          y="5"
          width="17"
          height="16"
          rx="2.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M7.5 3V7M16.5 3V7M3.5 10H20.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M8 14H8.01M12 14H12.01M16 14H16.01M8 17.5H8.01M12 17.5H12.01"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (name === "seat") {
    return (
      <svg {...common}>
        <path
          d="M7 4.5C7 3.67 7.67 3 8.5 3H10C11.1 3 12 3.9 12 5V11H8.5C7.67 11 7 10.33 7 9.5V4.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M12 11H15.5C17.43 11 19 12.57 19 14.5V17H8.5C6.57 17 5 15.43 5 13.5V12.5C5 11.67 5.67 11 6.5 11H12Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M5 20H19"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg {...common}>
        <circle
          cx="12"
          cy="12"
          r="8.8"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M8 12.2L10.7 15L16.3 9.4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "arrow") {
    return (
      <svg {...common}>
        <path
          d="M5 12H19"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M13 6L19 12L13 18"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "home") {
    return (
      <svg {...common}>
        <path
          d="M3.5 11.2L12 4L20.5 11.2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.5 10V19.5H18.5V10"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 19.5V14H14.5V19.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "bus") {
    return (
      <svg {...common}>
        <rect
          x="4"
          y="4"
          width="16"
          height="14"
          rx="2.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M4 10H20"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M7 18V20M17 18V20"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="8" cy="14.5" r="1.2" fill="currentColor" />
        <circle cx="16" cy="14.5" r="1.2" fill="currentColor" />
        <path
          d="M7 7H17"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return null;
}

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f5faf7] text-[#10251d]">
      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative min-h-[780px] overflow-hidden bg-[#071510]">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />
          <div className="hero-glow hero-glow-three" />
        </div>

        {/* =====================================================
            MANY MOVING DOTS
        ====================================================== */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Top / upper dots */}
          <span className="moving-dot dot-01" />
          <span className="moving-dot dot-02" />
          <span className="moving-dot dot-03" />
          <span className="moving-dot dot-04" />
          <span className="moving-dot dot-05" />
          <span className="moving-dot dot-06" />
          <span className="moving-dot dot-07" />
          <span className="moving-dot dot-08" />
          <span className="moving-dot dot-09" />
          <span className="moving-dot dot-10" />

          {/* Middle dots */}
          <span className="moving-dot dot-11" />
          <span className="moving-dot dot-12" />
          <span className="moving-dot dot-13" />
          <span className="moving-dot dot-14" />
          <span className="moving-dot dot-15" />
          <span className="moving-dot dot-16" />
          <span className="moving-dot dot-17" />
          <span className="moving-dot dot-18" />
          <span className="moving-dot dot-19" />
          <span className="moving-dot dot-20" />

          {/* Lower dots */}
          <span className="moving-dot dot-21" />
          <span className="moving-dot dot-22" />
          <span className="moving-dot dot-23" />
          <span className="moving-dot dot-24" />
          <span className="moving-dot dot-25" />
          <span className="moving-dot dot-26" />
          <span className="moving-dot dot-27" />
          <span className="moving-dot dot-28" />
          <span className="moving-dot dot-29" />
          <span className="moving-dot dot-30" />

          {/* Tiny particles */}
          <span className="tiny-dot tiny-01" />
          <span className="tiny-dot tiny-02" />
          <span className="tiny-dot tiny-03" />
          <span className="tiny-dot tiny-04" />
          <span className="tiny-dot tiny-05" />
          <span className="tiny-dot tiny-06" />
          <span className="tiny-dot tiny-07" />
          <span className="tiny-dot tiny-08" />
          <span className="tiny-dot tiny-09" />
          <span className="tiny-dot tiny-10" />
          <span className="tiny-dot tiny-11" />
          <span className="tiny-dot tiny-12" />
          <span className="tiny-dot tiny-13" />
          <span className="tiny-dot tiny-14" />
          <span className="tiny-dot tiny-15" />
          <span className="tiny-dot tiny-16" />
          <span className="tiny-dot tiny-17" />
          <span className="tiny-dot tiny-18" />
          <span className="tiny-dot tiny-19" />
          <span className="tiny-dot tiny-20" />
        </div>

        {/* =====================================================
            HEADER
        ====================================================== */}
        <header className="relative z-30 border-b border-white/10 bg-[#071510]/80 backdrop-blur-md">
          <div className="mx-auto flex h-[78px] max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
            <Link
              href="/"
              className="flex items-center gap-3 transition-opacity duration-300 hover:opacity-80"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#43c98f]/30 bg-[#43c98f]/10 text-[#55d89e]">
                <Icon name="bus" size={22} />
              </div>

              <div>
                <div className="text-sm font-black tracking-[0.12em] text-white">
                  BWP TRAVEL
                </div>
                <div className="text-[9px] font-bold tracking-[0.24em] text-[#55d89e]">
                  TRAVEL AGENT
                </div>
              </div>
            </Link>

            <nav className="hidden items-center gap-7 lg:flex">
              <Link
                href="/"
                className="text-sm font-semibold text-white/65 transition-colors hover:text-white"
              >
                Home
              </Link>

              <Link
                href="/routes"
                className="text-sm font-semibold text-white/65 transition-colors hover:text-white"
              >
                Routes
              </Link>

              <Link
                href="/about"
                className="text-sm font-semibold text-white/65 transition-colors hover:text-white"
              >
                About
              </Link>

              <Link
                href="/why-choose-us"
                className="text-sm font-semibold text-white/65 transition-colors hover:text-white"
              >
                Why Choose Us
              </Link>

              <Link
                href="/how-it-works"
                className="text-sm font-semibold text-[#55d89e]"
              >
                How It Works
              </Link>

              <Link
                href="/booking-status"
                className="text-sm font-semibold text-white/65 transition-colors hover:text-white"
              >
                Booking Status
              </Link>

              <Link
                href="/contact"
                className="text-sm font-semibold text-white/65 transition-colors hover:text-white"
              >
                Contact
              </Link>

              <Link
                href="/booking"
                className="rounded-xl bg-[#008765] px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_10px_30px_rgba(0,135,101,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#009b74]"
              >
                Book Now
              </Link>
            </nav>

            <Link
              href="/booking"
              className="rounded-xl bg-[#008765] px-4 py-2.5 text-xs font-extrabold text-white lg:hidden"
            >
              Book Now
            </Link>
          </div>
        </header>

        {/* =====================================================
            HERO CONTENT
        ====================================================== */}
        <div className="relative z-20 mx-auto flex min-h-[700px] max-w-[1400px] items-center px-5 pb-20 pt-20 sm:px-8 lg:px-12">
          <div className="w-full max-w-[760px]">
            <div className="mb-7 flex items-center gap-4">
              <span className="h-[5px] w-[72px] rounded-full bg-[#43c98f]" />

              <span className="text-[13px] font-black tracking-[0.28em] text-[#55d89e]">
                HOW IT WORKS
              </span>
            </div>

            <h1 className="max-w-[720px] text-[58px] font-black leading-[0.96] tracking-[-0.055em] text-white sm:text-[76px] lg:text-[92px]">
              Your journey,
              <br />
              <span className="text-[#43c98f]">made simple.</span>
            </h1>

            <p className="mt-9 max-w-[760px] text-[20px] font-medium leading-[1.7] tracking-[-0.01em] text-white/65 sm:text-[22px]">
              Book your BWP Travel journey in a few clear steps. Choose your
              route, find a suitable schedule, select your seat and confirm
              your booking.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/booking"
                className="group inline-flex h-[72px] items-center justify-center gap-4 rounded-2xl bg-[#008765] px-8 text-base font-extrabold text-white shadow-[0_18px_45px_rgba(0,135,101,0.25)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#009b74]"
              >
                Start Booking

                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  <Icon name="arrow" size={23} />
                </span>
              </Link>

              <Link
                href="/routes"
                className="group inline-flex h-[72px] items-center justify-center gap-4 rounded-2xl border border-white/15 bg-white/[0.04] px-8 text-base font-extrabold text-white transition-all duration-300 hover:-translate-y-1 hover:border-[#43c98f]/40 hover:bg-white/[0.07]"
              >
                Explore Routes

                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  <Icon name="arrow" size={23} />
                </span>
              </Link>
            </div>

            {/* Moving line */}
            <div className="mt-16 flex items-center gap-4">
              <div className="relative h-[3px] w-[84px] overflow-hidden rounded-full bg-[#008765]">
                <span className="absolute inset-y-0 left-[-100%] w-full bg-[#55d89e] line-shimmer" />
              </div>

              <div className="relative h-[2px] w-[440px] overflow-hidden rounded-full bg-white/15">
                <span className="hero-travel-dot" />
              </div>

              <span className="relative flex h-3 w-3 items-center justify-center">
                <span className="absolute h-3 w-3 rounded-full bg-[#43c98f]/30 animate-ping" />
                <span className="h-2 w-2 rounded-full bg-[#43c98f]" />
              </span>
            </div>
          </div>

          {/* Decorative right side */}
          <div className="pointer-events-none absolute right-[4%] top-[18%] hidden h-[470px] w-[470px] xl:block">
            <div className="absolute inset-0 rounded-full border border-[#43c98f]/10" />
            <div className="absolute inset-[55px] rounded-full border border-[#43c98f]/10" />
            <div className="absolute inset-[115px] rounded-full border border-[#43c98f]/10" />

            <div className="absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#43c98f]/5 blur-2xl" />

            <div className="absolute left-[50%] top-[8%] h-3 w-3 rounded-full bg-[#43c98f] shadow-[0_0_20px_rgba(67,201,143,0.55)] animate-pulse" />
            <div className="absolute bottom-[15%] right-[4%] h-4 w-4 rounded-full bg-[#55d89e]/80 shadow-[0_0_25px_rgba(85,216,158,0.4)] animate-pulse" />
          </div>
        </div>
      </section>

      {/* =========================================================
          STEPS
      ========================================================== */}
      <section className="relative overflow-hidden px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
        <div className="pointer-events-none absolute left-[-100px] top-[25%] h-[300px] w-[300px] rounded-full bg-[#43c98f]/5 blur-3xl" />
        <div className="pointer-events-none absolute right-[-100px] bottom-[10%] h-[320px] w-[320px] rounded-full bg-[#008765]/5 blur-3xl" />

        <div className="relative mx-auto max-w-[1280px]">
          <div className="mx-auto max-w-[760px] text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="h-[4px] w-12 rounded-full bg-[#43c98f]" />
              <span className="text-[11px] font-black tracking-[0.24em] text-[#008765]">
                SIMPLE PROCESS
              </span>
              <span className="h-[4px] w-12 rounded-full bg-[#43c98f]" />
            </div>

            <h2 className="text-4xl font-black tracking-[-0.04em] text-[#10251d] sm:text-5xl lg:text-6xl">
              Four steps.
              <br />
              <span className="text-[#008765]">One easy journey.</span>
            </h2>

            <p className="mt-5 text-base leading-7 text-[#718079] sm:text-lg">
              Everything you need to plan and confirm your BWP Travel journey
              is organized into a simple booking flow.
            </p>
          </div>

          {/* Cards */}
          <div className="relative mt-16">
            {/* Desktop connector */}
            <div className="pointer-events-none absolute left-[12%] right-[12%] top-[108px] hidden h-[2px] overflow-hidden bg-[#d7e9e0] lg:block">
              <span className="absolute left-0 top-0 h-full w-[120px] bg-gradient-to-r from-transparent via-[#43c98f] to-transparent route-connector" />
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <Link
                  href={step.href}
                  key={step.number}
                  className="process-card group relative z-10 block rounded-[24px] border border-[#dce9e2] bg-white p-7 shadow-[0_12px_35px_rgba(16,37,29,0.05)] transition-all duration-500 hover:-translate-y-2 hover:border-[#83cdb0] hover:shadow-[0_22px_50px_rgba(16,37,29,0.10)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="process-icon flex h-[68px] w-[68px] items-center justify-center rounded-2xl bg-[#e9f7f0] text-[#008765] transition-all duration-500 group-hover:bg-[#008765] group-hover:text-white">
                      <Icon name={step.icon} size={30} />
                    </div>

                    <span className="text-sm font-black tracking-[0.12em] text-[#b6c9c1] transition-colors duration-300 group-hover:text-[#43c98f]">
                      {step.number}
                    </span>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-xl font-black tracking-[-0.025em] text-[#10251d]">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-[#718079]">
                      {step.description}
                    </p>
                  </div>

                  <div className="mt-7 flex items-center gap-2 text-xs font-extrabold text-[#008765]">
                    Learn more
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      <Icon name="arrow" size={17} />
                    </span>
                  </div>

                  {/* Animated bottom line */}
                  <span className="absolute bottom-0 left-7 right-7 h-[2px] origin-left scale-x-0 rounded-full bg-[#43c98f] transition-transform duration-500 group-hover:scale-x-100" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          JOURNEY VISUAL
      ========================================================== */}
      <section className="px-5 pb-20 sm:px-8 sm:pb-24 lg:px-10">
        <div className="mx-auto max-w-[1280px]">
          <div className="relative overflow-hidden rounded-[28px] border border-[#83cdb0] bg-[#e9f7f0] px-7 py-12 sm:px-10 lg:px-14">
            {/* Moving background dots */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <span className="light-dot light-01" />
              <span className="light-dot light-02" />
              <span className="light-dot light-03" />
              <span className="light-dot light-04" />
              <span className="light-dot light-05" />
              <span className="light-dot light-06" />
              <span className="light-dot light-07" />
              <span className="light-dot light-08" />
              <span className="light-dot light-09" />
              <span className="light-dot light-10" />
              <span className="light-dot light-11" />
              <span className="light-dot light-12" />
            </div>

            <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-[620px]">
                <div className="mb-4 text-xs font-black tracking-[0.24em] text-[#008765]">
                  FROM START TO FINISH
                </div>

                <h2 className="text-3xl font-black tracking-[-0.04em] text-[#10251d] sm:text-4xl lg:text-5xl">
                  Your booking,
                  <br />
                  <span className="text-[#008765]">without the confusion.</span>
                </h2>

                <p className="mt-5 max-w-[590px] text-base leading-7 text-[#718079]">
                  Follow the steps, choose what works for you, and keep your
                  travel details organized from route selection to booking
                  confirmation.
                </p>
              </div>

              <div className="relative flex h-[190px] w-full max-w-[480px] items-center justify-center lg:w-[480px]">
                {/* Route line */}
                <div className="absolute left-[12%] right-[12%] top-1/2 h-[4px] -translate-y-1/2 rounded-full bg-[#b9ddcc]" />

                <div className="journey-line absolute left-[12%] right-[12%] top-1/2 h-[4px] -translate-y-1/2 rounded-full bg-[#008765]" />

                {[0, 1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#e9f7f0] bg-[#008765] text-sm font-black text-white shadow-[0_8px_25px_rgba(0,135,101,0.22)]"
                  >
                    {item + 1}
                  </div>
                ))}

                {/* Moving travelling dot */}
                <span className="journey-travel-dot absolute top-1/2 z-20 h-3 w-3 -translate-y-1/2 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.9)]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CTA
      ========================================================== */}
      <section className="px-5 pb-12 sm:px-8 sm:pb-14 lg:px-10">
        <div className="mx-auto max-w-[1280px]">
          <div className="relative overflow-hidden rounded-[24px] bg-[#0b6b50] px-6 py-9 shadow-[0_18px_45px_rgba(0,0,0,0.15)] sm:px-8">
            {/* CTA animated dots */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <span className="cta-dot cta-01" />
              <span className="cta-dot cta-02" />
              <span className="cta-dot cta-03" />
              <span className="cta-dot cta-04" />
              <span className="cta-dot cta-05" />
              <span className="cta-dot cta-06" />
              <span className="cta-dot cta-07" />
              <span className="cta-dot cta-08" />
              <span className="cta-dot cta-09" />
              <span className="cta-dot cta-10" />
            </div>

            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-[11px] font-black tracking-[0.24em] text-[#8be4bb]">
                  READY WHEN YOU ARE
                </div>

                <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">
                  Start your BWP Travel journey today.
                </h2>
              </div>

              <Link
                href="/booking"
                className="group inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 text-xs font-extrabold text-[#0b6b50] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#eaf7f0]"
              >
                Start Booking

                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  <Icon name="arrow" size={17} />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================== */}
      <footer className="bg-[#03100c] px-5 py-10 text-white sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#43c98f]/30 bg-[#43c98f]/10 text-[#55d89e]">
              <Icon name="bus" size={21} />
            </div>

            <div>
              <div className="text-sm font-black tracking-[0.12em]">
                BWP TRAVEL
              </div>
              <div className="text-[9px] font-bold tracking-[0.22em] text-[#55d89e]">
                TRAVEL AGENT
              </div>
            </div>
          </Link>

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-white/50">
            <Link
              href="/"
              className="transition-colors hover:text-[#72dca5]"
            >
              Home
            </Link>

            <Link
              href="/routes"
              className="transition-colors hover:text-[#72dca5]"
            >
              Routes
            </Link>

            <Link
              href="/about"
              className="transition-colors hover:text-[#72dca5]"
            >
              About
            </Link>

            <Link
              href="/why-choose-us"
              className="transition-colors hover:text-[#72dca5]"
            >
              Why Choose Us
            </Link>

            <Link
              href="/how-it-works"
              className="text-[#72dca5]"
            >
              How It Works
            </Link>

            <Link
              href="/booking-status"
              className="transition-colors hover:text-[#72dca5]"
            >
              Booking Status
            </Link>

            <Link
              href="/contact"
              className="transition-colors hover:text-[#72dca5]"
            >
              Contact
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-[1280px] border-t border-white/10 pt-6 text-xs text-white/35">
          © {new Date().getFullYear()} BWP Travel Agent. All rights reserved.
        </div>
      </footer>

      {/* =========================================================
          ANIMATIONS
      ========================================================== */}
      <style jsx>{`
        @keyframes floatSlow {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(18px, -22px, 0);
          }
        }

        @keyframes floatSide {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(-28px, 14px, 0);
          }
        }

        @keyframes floatReverse {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(25px, 18px, 0);
          }
        }

        @keyframes pulseSoft {
          0%,
          100% {
            opacity: 0.35;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.25);
          }
        }

        @keyframes lineMove {
          0% {
            transform: translateX(-150%);
          }
          100% {
            transform: translateX(520%);
          }
        }

        @keyframes dotTravel {
          0% {
            left: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            left: 100%;
            opacity: 0;
          }
        }

        @keyframes cardFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes iconFloat {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-4px) rotate(1deg);
          }
        }

        @keyframes glowPulse {
          0%,
          100% {
            opacity: 0.25;
          }
          50% {
            opacity: 0.55;
          }
        }

        @keyframes shimmerLine {
          0% {
            transform: translateX(-130%);
          }
          100% {
            transform: translateX(250%);
          }
        }

        @keyframes dotOrbitOne {
          0% {
            transform: translate3d(0, 0, 0);
          }
          25% {
            transform: translate3d(80px, -25px, 0);
          }
          50% {
            transform: translate3d(145px, 35px, 0);
          }
          75% {
            transform: translate3d(55px, 70px, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes dotOrbitTwo {
          0% {
            transform: translate3d(0, 0, 0);
          }
          25% {
            transform: translate3d(-70px, 45px, 0);
          }
          50% {
            transform: translate3d(-130px, -10px, 0);
          }
          75% {
            transform: translate3d(-40px, -75px, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes dotDiagonal {
          0% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(130px, 90px, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes dotDiagonalReverse {
          0% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(-120px, -80px, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes tinyTravel {
          0% {
            transform: translate3d(0, 0, 0);
            opacity: 0.15;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: translate3d(90px, -55px, 0);
            opacity: 0.15;
          }
        }

        @keyframes journeyLine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes journeyDot {
          0% {
            left: 12%;
          }
          50% {
            left: 88%;
          }
          100% {
            left: 12%;
          }
        }

        /* Hero glows */
        .hero-glow {
          position: absolute;
          border-radius: 9999px;
          filter: blur(80px);
          pointer-events: none;
        }

        .hero-glow-one {
          width: 360px;
          height: 360px;
          right: -80px;
          top: -100px;
          background: rgba(0, 135, 101, 0.14);
          animation: glowPulse 7s ease-in-out infinite;
        }

        .hero-glow-two {
          width: 300px;
          height: 300px;
          left: 30%;
          bottom: -130px;
          background: rgba(67, 201, 143, 0.08);
          animation: glowPulse 9s ease-in-out infinite reverse;
        }

        .hero-glow-three {
          width: 220px;
          height: 220px;
          right: 25%;
          bottom: 15%;
          background: rgba(0, 135, 101, 0.06);
          animation: glowPulse 6s ease-in-out infinite;
        }

        /* Main moving dots */
        .moving-dot {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 9999px;
          background: rgba(67, 201, 143, 0.65);
          box-shadow: 0 0 18px rgba(67, 201, 143, 0.2);
        }

        .dot-01 {
          left: 7%;
          top: 18%;
          animation: dotOrbitOne 9s ease-in-out infinite;
        }

        .dot-02 {
          left: 17%;
          top: 38%;
          animation: dotOrbitTwo 12s ease-in-out infinite;
        }

        .dot-03 {
          left: 30%;
          top: 15%;
          animation: dotDiagonal 11s ease-in-out infinite;
        }

        .dot-04 {
          left: 44%;
          top: 28%;
          animation: dotDiagonalReverse 13s ease-in-out infinite;
        }

        .dot-05 {
          left: 56%;
          top: 14%;
          animation: dotOrbitOne 10s ease-in-out infinite reverse;
        }

        .dot-06 {
          left: 68%;
          top: 34%;
          animation: dotOrbitTwo 14s ease-in-out infinite;
        }

        .dot-07 {
          left: 81%;
          top: 20%;
          animation: dotDiagonalReverse 10s ease-in-out infinite;
        }

        .dot-08 {
          left: 91%;
          top: 46%;
          animation: dotOrbitOne 13s ease-in-out infinite;
        }

        .dot-09 {
          left: 12%;
          top: 58%;
          animation: dotDiagonal 14s ease-in-out infinite;
        }

        .dot-10 {
          left: 26%;
          top: 70%;
          animation: dotOrbitTwo 11s ease-in-out infinite reverse;
        }

        .dot-11 {
          left: 39%;
          top: 55%;
          animation: dotOrbitOne 12s ease-in-out infinite;
        }

        .dot-12 {
          left: 52%;
          top: 68%;
          animation: dotDiagonalReverse 15s ease-in-out infinite;
        }

        .dot-13 {
          left: 63%;
          top: 54%;
          animation: dotOrbitTwo 10s ease-in-out infinite;
        }

        .dot-14 {
          left: 74%;
          top: 67%;
          animation: dotDiagonal 13s ease-in-out infinite;
        }

        .dot-15 {
          left: 87%;
          top: 60%;
          animation: dotOrbitOne 15s ease-in-out infinite reverse;
        }

        .dot-16 {
          left: 5%;
          top: 76%;
          animation: dotDiagonal 12s ease-in-out infinite;
        }

        .dot-17 {
          left: 20%;
          top: 84%;
          animation: dotOrbitTwo 14s ease-in-out infinite;
        }

        .dot-18 {
          left: 35%;
          top: 82%;
          animation: dotDiagonalReverse 11s ease-in-out infinite;
        }

        .dot-19 {
          left: 50%;
          top: 90%;
          animation: dotOrbitOne 13s ease-in-out infinite;
        }

        .dot-20 {
          left: 65%;
          top: 82%;
          animation: dotDiagonal 15s ease-in-out infinite;
        }

        .dot-21 {
          left: 78%;
          top: 88%;
          animation: dotOrbitTwo 12s ease-in-out infinite reverse;
        }

        .dot-22 {
          left: 94%;
          top: 78%;
          animation: dotDiagonalReverse 14s ease-in-out infinite;
        }

        .dot-23 {
          left: 10%;
          top: 27%;
          width: 7px;
          height: 7px;
          animation: dotOrbitOne 16s ease-in-out infinite;
        }

        .dot-24 {
          left: 22%;
          top: 12%;
          width: 7px;
          height: 7px;
          animation: dotOrbitTwo 13s ease-in-out infinite;
        }

        .dot-25 {
          left: 47%;
          top: 44%;
          width: 7px;
          height: 7px;
          animation: dotDiagonal 12s ease-in-out infinite;
        }

        .dot-26 {
          left: 60%;
          top: 40%;
          width: 7px;
          height: 7px;
          animation: dotDiagonalReverse 13s ease-in-out infinite;
        }

        .dot-27 {
          left: 83%;
          top: 12%;
          width: 7px;
          height: 7px;
          animation: dotOrbitOne 11s ease-in-out infinite;
        }

        .dot-28 {
          left: 88%;
          top: 72%;
          width: 7px;
          height: 7px;
          animation: dotOrbitTwo 15s ease-in-out infinite;
        }

        .dot-29 {
          left: 32%;
          top: 91%;
          width: 7px;
          height: 7px;
          animation: dotDiagonalReverse 12s ease-in-out infinite;
        }

        .dot-30 {
          left: 72%;
          top: 91%;
          width: 7px;
          height: 7px;
          animation: dotDiagonal 14s ease-in-out infinite;
        }

        /* Tiny particles */
        .tiny-dot {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 9999px;
          background: rgba(139, 228, 187, 0.7);
          animation: tinyTravel 8s ease-in-out infinite alternate;
        }

        .tiny-01 {
          left: 4%;
          top: 11%;
          animation-delay: -1s;
        }

        .tiny-02 {
          left: 13%;
          top: 26%;
          animation-delay: -4s;
        }

        .tiny-03 {
          left: 24%;
          top: 52%;
          animation-delay: -2s;
        }

        .tiny-04 {
          left: 31%;
          top: 34%;
          animation-delay: -6s;
        }

        .tiny-05 {
          left: 41%;
          top: 12%;
          animation-delay: -3s;
        }

        .tiny-06 {
          left: 53%;
          top: 31%;
          animation-delay: -7s;
        }

        .tiny-07 {
          left: 61%;
          top: 63%;
          animation-delay: -5s;
        }

        .tiny-08 {
          left: 70%;
          top: 26%;
          animation-delay: -2s;
        }

        .tiny-09 {
          left: 77%;
          top: 52%;
          animation-delay: -8s;
        }

        .tiny-10 {
          left: 85%;
          top: 31%;
          animation-delay: -3s;
        }

        .tiny-11 {
          left: 92%;
          top: 22%;
          animation-delay: -6s;
        }

        .tiny-12 {
          left: 96%;
          top: 57%;
          animation-delay: -4s;
        }

        .tiny-13 {
          left: 8%;
          top: 69%;
          animation-delay: -7s;
        }

        .tiny-14 {
          left: 19%;
          top: 78%;
          animation-delay: -1s;
        }

        .tiny-15 {
          left: 29%;
          top: 88%;
          animation-delay: -5s;
        }

        .tiny-16 {
          left: 43%;
          top: 76%;
          animation-delay: -8s;
        }

        .tiny-17 {
          left: 56%;
          top: 85%;
          animation-delay: -3s;
        }

        .tiny-18 {
          left: 69%;
          top: 76%;
          animation-delay: -6s;
        }

        .tiny-19 {
          left: 80%;
          top: 87%;
          animation-delay: -2s;
        }

        .tiny-20 {
          left: 91%;
          top: 83%;
          animation-delay: -5s;
        }

        .line-shimmer {
          animation: shimmerLine 3s linear infinite;
        }

        .hero-travel-dot {
          position: absolute;
          top: 50%;
          left: 0;
          width: 8px;
          height: 8px;
          transform: translateY(-50%);
          border-radius: 9999px;
          background: #55d89e;
          box-shadow: 0 0 16px rgba(85, 216, 158, 0.7);
          animation: dotTravel 4.5s linear infinite;
        }

        .process-card:nth-child(1) {
          animation: cardFloat 5.5s ease-in-out infinite;
        }

        .process-card:nth-child(2) {
          animation: cardFloat 6s ease-in-out infinite -1.5s;
        }

        .process-card:nth-child(3) {
          animation: cardFloat 5.8s ease-in-out infinite -2.5s;
        }

        .process-card:nth-child(4) {
          animation: cardFloat 6.2s ease-in-out infinite -3.5s;
        }

        .process-icon {
          animation: iconFloat 4s ease-in-out infinite;
        }

        .route-connector {
          animation: lineMove 4s linear infinite;
        }

        /* Light section dots */
        .light-dot {
          position: absolute;
          width: 9px;
          height: 9px;
          border-radius: 9999px;
          background: rgba(0, 135, 101, 0.22);
        }

        .light-01 {
          left: 4%;
          top: 20%;
          animation: dotOrbitOne 10s ease-in-out infinite;
        }

        .light-02 {
          left: 15%;
          top: 75%;
          animation: dotOrbitTwo 13s ease-in-out infinite;
        }

        .light-03 {
          left: 28%;
          top: 25%;
          animation: dotDiagonal 11s ease-in-out infinite;
        }

        .light-04 {
          left: 40%;
          top: 80%;
          animation: dotDiagonalReverse 12s ease-in-out infinite;
        }

        .light-05 {
          left: 52%;
          top: 15%;
          animation: dotOrbitOne 14s ease-in-out infinite;
        }

        .light-06 {
          left: 64%;
          top: 72%;
          animation: dotOrbitTwo 10s ease-in-out infinite;
        }

        .light-07 {
          left: 74%;
          top: 23%;
          animation: dotDiagonal 13s ease-in-out infinite;
        }

        .light-08 {
          left: 86%;
          top: 65%;
          animation: dotDiagonalReverse 11s ease-in-out infinite;
        }

        .light-09 {
          left: 94%;
          top: 30%;
          animation: dotOrbitOne 15s ease-in-out infinite;
        }

        .light-10 {
          left: 21%;
          top: 48%;
          width: 6px;
          height: 6px;
          animation: dotOrbitTwo 12s ease-in-out infinite;
        }

        .light-11 {
          left: 57%;
          top: 48%;
          width: 6px;
          height: 6px;
          animation: dotDiagonalReverse 10s ease-in-out infinite;
        }

        .light-12 {
          left: 80%;
          top: 46%;
          width: 6px;
          height: 6px;
          animation: dotDiagonal 12s ease-in-out infinite;
        }

        .journey-line {
          overflow: hidden;
          transform-origin: left center;
          animation: journeyLine 4s linear infinite;
        }

        .journey-travel-dot {
          animation: journeyDot 5s ease-in-out infinite;
          box-shadow: 0 0 16px rgba(255, 255, 255, 0.9);
        }

        /* CTA dots */
        .cta-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: rgba(139, 228, 187, 0.32);
        }

        .cta-01 {
          left: 5%;
          top: 25%;
          animation: dotOrbitOne 9s ease-in-out infinite;
        }

        .cta-02 {
          left: 17%;
          top: 65%;
          animation: dotDiagonal 11s ease-in-out infinite;
        }

        .cta-03 {
          left: 29%;
          top: 20%;
          animation: dotOrbitTwo 12s ease-in-out infinite;
        }

        .cta-04 {
          left: 42%;
          top: 72%;
          animation: dotDiagonalReverse 10s ease-in-out infinite;
        }

        .cta-05 {
          left: 54%;
          top: 28%;
          animation: dotOrbitOne 13s ease-in-out infinite;
        }

        .cta-06 {
          left: 66%;
          top: 65%;
          animation: dotDiagonal 12s ease-in-out infinite;
        }

        .cta-07 {
          left: 77%;
          top: 20%;
          animation: dotOrbitTwo 11s ease-in-out infinite;
        }

        .cta-08 {
          left: 87%;
          top: 72%;
          animation: dotDiagonalReverse 14s ease-in-out infinite;
        }

        .cta-09 {
          left: 94%;
          top: 40%;
          width: 5px;
          height: 5px;
          animation: dotOrbitOne 10s ease-in-out infinite;
        }

        .cta-10 {
          left: 35%;
          top: 48%;
          width: 5px;
          height: 5px;
          animation: dotDiagonal 9s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-glow,
          .moving-dot,
          .tiny-dot,
          .line-shimmer,
          .hero-travel-dot,
          .process-card,
          .process-icon,
          .route-connector,
          .light-dot,
          .journey-line,
          .journey-travel-dot,
          .cta-dot {
            animation: none !important;
          }
        }

        @media (max-width: 1023px) {
          .process-card:nth-child(1),
          .process-card:nth-child(2),
          .process-card:nth-child(3),
          .process-card:nth-child(4) {
            animation: cardFloat 6s ease-in-out infinite;
          }
        }
      `}</style>
    </main>
  );
}