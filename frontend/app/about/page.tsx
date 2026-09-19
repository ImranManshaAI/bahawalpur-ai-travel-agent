import Link from "next/link";

const highlights = [
  {
    number: "01",
    title: "Easy Online Booking",
    description:
      "Choose your travel date, departure timing and seats through a simple booking flow.",
  },
  {
    number: "02",
    title: "Clear Route Information",
    description:
      "View available routes, timings and pricing before making your reservation.",
  },
  {
    number: "03",
    title: "Flexible Seat Selection",
    description:
      "Select your preferred available seat from the bus seat map during booking.",
  },
  {
    number: "04",
    title: "Booking Status",
    description:
      "Use your booking reference to check the current status of your reservation.",
  },
];

const steps = [
  "Select your travel date and departure timing.",
  "Choose the available seats you want to reserve.",
  "Enter visitor and passenger details.",
  "Review your booking and follow the payment instructions.",
];

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef9f4] text-[#10231f]">

      {/* =========================================================
          ANIMATION STYLES
      ========================================================= */}
      <style>{`
        @keyframes aboutFloatOne {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          25% {
            transform: translate3d(-18px, 14px, 0);
          }
          50% {
            transform: translate3d(8px, 30px, 0);
          }
          75% {
            transform: translate3d(22px, 8px, 0);
          }
        }

        @keyframes aboutFloatTwo {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          30% {
            transform: translate3d(20px, -18px, 0);
          }
          60% {
            transform: translate3d(-8px, 25px, 0);
          }
          85% {
            transform: translate3d(-22px, 5px, 0);
          }
        }

        @keyframes aboutFloatThree {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(18px, -28px, 0);
          }
        }

        @keyframes aboutGlow {
          0%, 100% {
            opacity: 0.18;
            transform: scale(1);
          }
          50% {
            opacity: 0.32;
            transform: scale(1.12);
          }
        }

        @keyframes aboutLine {
          0% {
            transform: scaleX(0.55);
            opacity: 0.35;
          }
          50% {
            transform: scaleX(1);
            opacity: 0.9;
          }
          100% {
            transform: scaleX(0.55);
            opacity: 0.35;
          }
        }

        @keyframes aboutCardIn {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aboutPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(0, 123, 94, 0.12);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(0, 123, 94, 0);
          }
        }

        .about-dot-one {
          animation: aboutFloatOne 8s ease-in-out infinite;
        }

        .about-dot-two {
          animation: aboutFloatTwo 10s ease-in-out infinite;
        }

        .about-dot-three {
          animation: aboutFloatThree 7s ease-in-out infinite;
        }

        .about-glow {
          animation: aboutGlow 9s ease-in-out infinite;
        }

        .about-line {
          transform-origin: left center;
          animation: aboutLine 5s ease-in-out infinite;
        }

        .about-card {
          animation: aboutCardIn 0.75s ease-out both;
          transition:
            transform 0.35s ease,
            box-shadow 0.35s ease,
            border-color 0.35s ease,
            background-color 0.35s ease;
        }

        .about-card:hover {
          transform: translateY(-9px);
          border-color: #a9d9c5;
          box-shadow: 0 24px 55px rgba(0, 123, 94, 0.13);
        }

        .about-number {
          transition:
            transform 0.35s ease,
            box-shadow 0.35s ease;
        }

        .about-card:hover .about-number {
          transform: translateY(-4px) rotate(-3deg);
          box-shadow: 0 10px 25px rgba(0, 123, 94, 0.18);
        }

        .about-step {
          transition:
            transform 0.3s ease,
            border-color 0.3s ease,
            box-shadow 0.3s ease;
        }

        .about-step:hover {
          transform: translateX(7px);
          border-color: #a9d9c5;
          box-shadow: 0 12px 30px rgba(0, 123, 94, 0.08);
        }

        .about-step-number {
          transition: transform 0.3s ease;
        }

        .about-step:hover .about-step-number {
          transform: scale(1.08);
        }

        .about-button {
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease,
            background-color 0.3s ease;
        }

        .about-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0, 123, 94, 0.2);
        }

        .about-route-line {
          position: relative;
        }

        .about-route-line::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -10px;
          height: 2px;
          width: 80px;
          border-radius: 999px;
          background: #76cbaa;
          animation: aboutLine 4s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .about-dot-one,
          .about-dot-two,
          .about-dot-three,
          .about-glow,
          .about-line,
          .about-card {
            animation: none;
          }

          .about-card,
          .about-step,
          .about-button,
          .about-number,
          .about-step-number {
            transition: none;
          }
        }
      `}</style>

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden border-b border-[#d7e9e0] bg-gradient-to-br from-white via-[#f5fcf8] to-[#d8f2e5]">

        {/* Soft background glow */}
        <div className="about-glow pointer-events-none absolute -right-40 -top-32 h-[500px] w-[500px] rounded-full bg-[#86d5b4]/35 blur-3xl" />

        <div className="about-glow pointer-events-none absolute -bottom-40 left-[-160px] h-[420px] w-[420px] rounded-full bg-[#b4e6d0]/25 blur-3xl" />

        {/* Moving dots */}
        <span className="about-dot-one pointer-events-none absolute right-[16%] top-[110px] h-6 w-6 rounded-full bg-[#4db58f]/35" />

        <span className="about-dot-two pointer-events-none absolute right-[8%] top-[285px] h-4 w-4 rounded-full bg-[#269b76]/40" />

        <span className="about-dot-three pointer-events-none absolute right-[32%] top-[390px] h-3 w-3 rounded-full bg-[#007b5e]/30" />

        <span className="about-dot-one pointer-events-none absolute bottom-[85px] left-[18%] h-3 w-3 rounded-full bg-[#71c9a8]/40" />

        <div className="relative mx-auto max-w-[1150px] px-5 pb-20 pt-16 sm:px-8 lg:px-10 lg:pb-28 lg:pt-24">

          <div className="max-w-[820px]">

            {/* Eyebrow */}
            <div className="flex items-center gap-4">
              <span className="h-[4px] w-12 rounded-full bg-[#007b5e]" />

              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#007b5e]">
                About Our Service
              </p>
            </div>

            {/* Heading */}
            <h1 className="mt-6 text-5xl font-black leading-[1.02] tracking-[-0.05em] text-[#071c15] sm:text-6xl lg:text-7xl">
              Making your Bahawalpur journey
              <span className="block text-[#007b5e]">
                simple to plan.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-7 max-w-[720px] text-base leading-8 text-[#5e7069] sm:text-lg">
              The BWP AI Travel Agent provides a straightforward online
              experience for exploring routes, checking travel details,
              selecting seats and managing your booking.
            </p>

            {/* Animated line */}
            <div className="mt-8 flex items-center gap-3">
              <span className="h-[5px] w-16 rounded-full bg-[#007b5e]" />

              <span className="about-line h-[2px] w-28 rounded-full bg-[#8fd5bd]" />

              <span className="h-2 w-2 rounded-full bg-[#65c19e]" />
            </div>

            {/* =====================================================
                BACK TO HOME
            ====================================================== */}
            <div className="mt-7">
              <Link
                href="/"
                className="about-button inline-flex items-center justify-center rounded-full border border-[#cfe3da] bg-white/90 px-6 py-3 text-sm font-black text-[#087a56] shadow-[0_6px_18px_rgba(0,123,94,0.07)] backdrop-blur transition hover:bg-white"
              >
                <span className="mr-2 text-base">←</span>
                Back to Home
              </Link>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">

              <Link
                href="/booking"
                className="about-button inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#007b5e] to-[#00684f] px-7 py-3.5 text-sm font-black text-white shadow-[0_8px_24px_rgba(0,123,94,0.14)]"
              >
                Book Your Seat
                <span className="ml-2">→</span>
              </Link>

              <Link
                href="/routes"
                className="about-button inline-flex items-center justify-center rounded-full border border-[#cfe3da] bg-white/80 px-7 py-3.5 text-sm font-black text-[#087a56] backdrop-blur transition hover:bg-white"
              >
                Explore Routes
              </Link>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          INTRODUCTION
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#eef9f4]">

        <div className="about-dot-two pointer-events-none absolute right-[5%] top-[20%] h-4 w-4 rounded-full bg-[#66c4a1]/25" />

        <div className="about-dot-three pointer-events-none absolute bottom-[15%] left-[7%] h-3 w-3 rounded-full bg-[#007b5e]/20" />

        <div className="relative mx-auto max-w-[1150px] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">

          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">

            {/* Left */}
            <div>

              <div className="flex items-center gap-3">
                <span className="h-[4px] w-10 rounded-full bg-[#007b5e]" />

                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#007b5e]">
                  Our Purpose
                </p>
              </div>

              <h2 className="mt-5 text-4xl font-black leading-tight tracking-[-0.04em] text-[#10231f] sm:text-5xl">
                One place for your
                <span className="block text-[#007b5e]">
                  travel planning.
                </span>
              </h2>

              <div className="mt-7 flex items-center gap-3">
                <span className="h-[4px] w-12 rounded-full bg-[#007b5e]" />
                <span className="h-px w-24 bg-[#9bd8c1]" />
                <span className="h-2 w-2 rounded-full bg-[#72cbaa]" />
              </div>

            </div>

            {/* Right */}
            <div className="rounded-[28px] border border-[#d5e9df] bg-white/75 p-7 shadow-[0_18px_55px_rgba(15,60,45,0.06)] backdrop-blur sm:p-9">

              <div className="space-y-5 text-[15px] leading-8 text-[#61716b] sm:text-base">

                <p>
                  Planning a trip should not require jumping between different
                  pages or relying on unclear information. Our platform brings
                  important booking information together in one simple experience.
                </p>

                <p>
                  From checking routes and departure timings to selecting seats
                  and reviewing your reservation, the booking journey is designed
                  to keep each step clear and easy to follow.
                </p>

                <p>
                  The service is built around the Bahawalpur travel experience and
                  supports both individual seat reservations and the available
                  booking options presented through the platform.
                </p>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          HIGHLIGHTS
      ========================================================= */}
      <section className="relative overflow-hidden border-y border-[#d5e9df] bg-gradient-to-b from-[#e5f7ee] to-[#f3fbf7]">

        {/* Background glow */}
        <div className="about-glow pointer-events-none absolute -right-32 top-[-100px] h-[380px] w-[380px] rounded-full bg-[#8ad8b8]/25 blur-3xl" />

        <div className="about-glow pointer-events-none absolute bottom-[-150px] left-[-100px] h-[360px] w-[360px] rounded-full bg-[#b5e7d1]/25 blur-3xl" />

        {/* Moving dots */}
        <span className="about-dot-one pointer-events-none absolute right-[12%] top-[22%] h-5 w-5 rounded-full bg-[#4fb68f]/30" />

        <span className="about-dot-two pointer-events-none absolute bottom-[20%] left-[8%] h-3 w-3 rounded-full bg-[#007b5e]/25" />

        <div className="relative mx-auto max-w-[1150px] px-5 py-20 sm:px-8 lg:px-10 lg:py-24">

          {/* Section heading */}
          <div className="max-w-[700px]">

            <div className="flex items-center gap-3">
              <span className="h-[4px] w-10 rounded-full bg-[#007b5e]" />

              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#007b5e]">
                What You Get
              </p>
            </div>

            <h2 className="mt-5 text-4xl font-black leading-tight tracking-[-0.04em] text-[#10231f] sm:text-5xl">
              Designed around a simpler
              <span className="block text-[#007b5e]">
                booking experience.
              </span>
            </h2>

          </div>

          {/* Cards */}
          <div className="mt-12 grid gap-5 sm:grid-cols-2">

            {highlights.map((item, index) => (
              <article
                key={item.number}
                className="about-card rounded-[28px] border border-[#d5e8df] bg-white/85 p-7 shadow-[0_14px_40px_rgba(30,75,58,0.07)] backdrop-blur"
                style={{
                  animationDelay: `${index * 130}ms`,
                }}
              >

                <div className="flex items-start justify-between">

                  <span className="about-number flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#007b5e] to-[#00684f] text-sm font-black text-white">
                    {item.number}
                  </span>

                  <span className="h-2 w-2 rounded-full bg-[#72cbaa]" />

                </div>

                <h3 className="mt-6 text-xl font-black text-[#10231f]">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#65736d]">
                  {item.description}
                </p>

                <div className="mt-6 flex items-center gap-2">
                  <span className="h-[3px] w-10 rounded-full bg-[#007b5e]" />
                  <span className="h-px w-16 bg-[#b2dfcc]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#72cbaa]" />
                </div>

              </article>
            ))}

          </div>
        </div>
      </section>

      {/* =========================================================
          BOOKING JOURNEY
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#eef9f4]">

        <span className="about-dot-one pointer-events-none absolute right-[9%] top-[18%] h-5 w-5 rounded-full bg-[#62c19d]/25" />

        <span className="about-dot-two pointer-events-none absolute bottom-[18%] left-[13%] h-3 w-3 rounded-full bg-[#007b5e]/20" />

        <div className="relative mx-auto max-w-[1150px] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">

          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">

            {/* Left */}
            <div>

              <div className="flex items-center gap-3">
                <span className="h-[4px] w-10 rounded-full bg-[#007b5e]" />

                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#007b5e]">
                  How It Works
                </p>
              </div>

              <h2 className="mt-5 text-4xl font-black leading-tight tracking-[-0.04em] text-[#10231f] sm:text-5xl">
                From search to
                <span className="block text-[#007b5e]">
                  reservation.
                </span>
              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-[#65736d] sm:text-base">
                The booking journey is organized into clear steps so you can
                understand what happens before completing your reservation.
              </p>

              <div className="mt-8 flex items-center gap-3">
                <span className="h-[5px] w-14 rounded-full bg-[#007b5e]" />
                <span className="about-line h-[2px] w-24 rounded-full bg-[#8fd5bd]" />
                <span className="h-2 w-2 rounded-full bg-[#65c19e]" />
              </div>

            </div>

            {/* Steps */}
            <div className="space-y-4">

              {steps.map((step, index) => (
                <div
                  key={step}
                  className="about-step flex gap-5 rounded-2xl border border-[#d6e9e0] bg-white/85 p-5 shadow-[0_8px_25px_rgba(20,70,52,0.04)] backdrop-blur"
                >

                  <div className="about-step-number flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#007b5e] text-sm font-black text-white shadow-[0_7px_18px_rgba(0,123,94,0.15)]">
                    {index + 1}
                  </div>

                  <div className="flex-1">

                    <p className="text-xs font-black uppercase tracking-[0.15em] text-[#007b5e]">
                      Step {String(index + 1).padStart(2, "0")}
                    </p>

                    <p className="mt-1 text-sm leading-7 text-[#50635b] sm:text-base">
                      {step}
                    </p>

                  </div>

                </div>
              ))}

            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CTA
      ========================================================= */}
      <section className="relative overflow-hidden px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28">

        <div className="about-glow pointer-events-none absolute right-[-100px] top-[-80px] h-[350px] w-[350px] rounded-full bg-[#8bd6b6]/20 blur-3xl" />

        <div className="relative mx-auto max-w-[1150px] overflow-hidden rounded-[32px] border border-[#0b7458]/20 bg-gradient-to-br from-[#075d47] via-[#087a5b] to-[#007b5e] px-7 py-12 text-white shadow-[0_24px_65px_rgba(0,90,65,0.16)] sm:px-10 lg:px-16 lg:py-16">

          {/* CTA moving dots */}
          <span className="about-dot-one pointer-events-none absolute right-[15%] top-[25%] h-5 w-5 rounded-full bg-white/15" />

          <span className="about-dot-two pointer-events-none absolute bottom-[20%] right-[7%] h-3 w-3 rounded-full bg-white/20" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

            <div className="max-w-[650px]">

              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#b9ead5]">
                Ready to Travel?
              </p>

              <h2 className="mt-4 text-3xl font-black leading-tight tracking-[-0.03em] sm:text-4xl">
                Find your route and reserve your seat.
              </h2>

              <p className="mt-4 text-sm leading-7 text-white/75 sm:text-base">
                Explore the available travel options and continue to booking
                whenever you are ready.
              </p>

              <div className="mt-6 flex items-center gap-3">
                <span className="h-[4px] w-14 rounded-full bg-white/80" />
                <span className="h-px w-20 bg-white/30" />
                <span className="h-2 w-2 rounded-full bg-[#b9ead5]" />
              </div>

            </div>

            <Link
              href="/booking"
              className="about-button inline-flex shrink-0 items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-black text-[#007b5e] shadow-[0_10px_28px_rgba(0,0,0,0.12)]"
            >
              Start Booking
              <span className="ml-2">→</span>
            </Link>

          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="relative overflow-hidden border-t border-[#0b7458]/20 bg-gradient-to-r from-[#063d2e] via-[#075c46] to-[#007b5e] text-white">

        <div className="about-glow pointer-events-none absolute -right-28 -top-28 h-[300px] w-[300px] rounded-full bg-[#8ad9b8]/15 blur-3xl" />

        <div className="relative mx-auto max-w-[1150px] px-5 py-10 sm:px-8 lg:px-10">

          <div className="grid gap-8 md:grid-cols-3">

            {/* Brand */}
            <div>

              <p className="text-base font-black">
                BWP AI Travel Agent
              </p>

              <p className="mt-2 max-w-sm text-xs leading-6 text-white/55">
                A simple and convenient way to explore Bahawalpur routes,
                choose seats and manage your journey.
              </p>

            </div>

            {/* Quick Links */}
            <div>

              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/80">
                Quick Links
              </p>

              <div className="mt-4 flex flex-col gap-3 text-sm">

                <Link
                  href="/"
                  className="w-fit text-white/65 transition hover:translate-x-1 hover:text-white"
                >
                  → Home
                </Link>

                <Link
                  href="/routes"
                  className="w-fit text-white/65 transition hover:translate-x-1 hover:text-white"
                >
                  → Routes
                </Link>

                <Link
                  href="/booking"
                  className="w-fit text-white/65 transition hover:translate-x-1 hover:text-white"
                >
                  → Booking
                </Link>

                <Link
                  href="/booking-status"
                  className="w-fit text-white/65 transition hover:translate-x-1 hover:text-white"
                >
                  → Booking Status
                </Link>

              </div>

            </div>

            {/* Service */}
            <div>

              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/80">
                Our Service
              </p>

              <p className="mt-4 text-sm leading-7 text-white/60">
                TDCP Bahawalpur Double-Decker Bus reservation experience
                designed to keep your journey simple and clear.
              </p>

            </div>

          </div>

          {/* Divider */}
          <div className="my-8 h-px bg-white/10" />

          {/* Bottom */}
          <div className="flex flex-col gap-5 text-center sm:text-left md:flex-row md:items-center md:justify-between">

            <p className="text-xs text-white/50">
              © {new Date().getFullYear()} BWP AI Travel Agent. All rights reserved.
            </p>

            <div className="text-xs">

              <span className="text-white/45">
                Developed by
              </span>

              <span className="ml-2 font-black text-white">
                Naina Nayab
              </span>

              <span className="mx-2 font-bold text-[#a5e3ca]">
                &
              </span>

              <span className="font-black text-white">
                Imran Mansha
              </span>

            </div>

          </div>

        </div>
      </footer>
    </main>
  );
}