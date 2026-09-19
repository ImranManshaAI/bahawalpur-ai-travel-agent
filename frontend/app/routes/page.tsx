import Image from "next/image";
import Link from "next/link";
import { routes } from "@/lib/routes";

function ArrowIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12h13M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function RoutesPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eaf7f1] text-[#10231f]">

      {/* ANIMATION CSS */}
      <style>{`
        @keyframes floatDot {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          25% {
            transform: translate3d(-20px, 18px, 0);
          }
          50% {
            transform: translate3d(10px, 38px, 0);
          }
          75% {
            transform: translate3d(25px, 12px, 0);
          }
        }

        @keyframes floatDotReverse {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          30% {
            transform: translate3d(25px, -15px, 0);
          }
          60% {
            transform: translate3d(10px, 30px, 0);
          }
          85% {
            transform: translate3d(-20px, 10px, 0);
          }
        }

        @keyframes floatDotWide {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          20% {
            transform: translate3d(30px, -20px, 0) scale(1.08);
          }
          45% {
            transform: translate3d(-15px, 35px, 0) scale(0.92);
          }
          70% {
            transform: translate3d(-38px, -5px, 0) scale(1.06);
          }
        }

        @keyframes floatDotSlow {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          30% {
            transform: translate3d(-35px, 25px, 0) scale(1.1);
          }
          60% {
            transform: translate3d(25px, -30px, 0) scale(0.9);
          }
          85% {
            transform: translate3d(40px, 15px, 0) scale(1.05);
          }
        }

        @keyframes orbitDot {
          0% {
            transform: rotate(0deg) translateX(150px) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateX(150px) rotate(-360deg);
          }
        }

        @keyframes softGlow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.20;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.36;
          }
        }

        @keyframes cardShow {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes smallFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-7px);
          }
        }

        .routes-dot-one {
          animation: floatDot 7s ease-in-out infinite;
        }

        .routes-dot-two {
          animation: floatDotReverse 9s ease-in-out infinite;
        }

        .routes-dot-three {
          animation: floatDot 8s ease-in-out infinite;
        }

        .routes-dot-four {
          animation: floatDotWide 10s ease-in-out infinite;
        }

        .routes-dot-five {
          animation: floatDotSlow 12s ease-in-out infinite;
        }

        .routes-dot-six {
          animation: floatDotReverse 11s ease-in-out infinite;
        }

        .routes-dot-seven {
          animation: floatDotWide 13s ease-in-out infinite reverse;
        }

        .routes-dot-eight {
          animation: floatDotSlow 9s ease-in-out infinite reverse;
        }

        .routes-dot-nine {
          animation: floatDot 14s ease-in-out infinite;
        }

        .routes-dot-ten {
          animation: floatDotReverse 15s ease-in-out infinite;
        }

        .routes-orbit-dot {
          animation: orbitDot 22s linear infinite;
          transform-origin: center;
        }

        .routes-glow {
          animation: softGlow 8s ease-in-out infinite;
        }

        .routes-card {
          animation: cardShow 0.7s ease-out both;
          transition:
            transform 0.35s ease,
            box-shadow 0.35s ease,
            border-color 0.35s ease;
        }

        .routes-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 24px 55px rgba(0, 123, 94, 0.14);
          border-color: #b7ddce;
        }

        .routes-button {
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease,
            background-color 0.3s ease;
        }

        .routes-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(0, 123, 94, 0.2);
        }

        .routes-button svg {
          transition: transform 0.3s ease;
        }

        .routes-button:hover svg {
          transform: translateX(5px);
        }

        .routes-stop {
          transition: transform 0.25s ease;
        }

        .routes-stop:hover {
          transform: translateX(6px);
        }

        .routes-stop-dot {
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .routes-stop:hover .routes-stop-dot {
          transform: scale(1.12);
          box-shadow: 0 0 0 6px rgba(0, 123, 94, 0.08);
        }

        .routes-logo {
          transition: transform 0.3s ease;
        }

        .routes-logo:hover {
          transform: translateY(-4px);
        }

        .routes-number {
          animation: smallFloat 4s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .routes-dot-one,
          .routes-dot-two,
          .routes-dot-three,
          .routes-dot-four,
          .routes-dot-five,
          .routes-dot-six,
          .routes-dot-seven,
          .routes-dot-eight,
          .routes-dot-nine,
          .routes-dot-ten,
          .routes-orbit-dot,
          .routes-glow,
          .routes-card,
          .routes-number {
            animation: none;
          }

          .routes-card,
          .routes-button,
          .routes-stop,
          .routes-stop-dot,
          .routes-logo {
            transition: none;
          }
        }
      `}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#d9e9e1] bg-white/95 shadow-[0_4px_24px_rgba(0,70,50,0.05)] backdrop-blur-xl">
        <div className="mx-auto flex min-h-[88px] max-w-[1150px] items-center gap-6 px-5 sm:px-8 lg:px-10">

          {/* LOGO + BRANDING */}
          <Link href="/" className="routes-logo shrink-0">
            <div className="flex items-center gap-3">

              <div className="relative h-[72px] w-[82px] shrink-0">
                <Image
                  src="/images/tdcp-logo.png.jpeg.jpeg.png"
                  alt="TDCP Bahawalpur Double-Decker Bus"
                  fill
                  sizes="82px"
                  className="object-contain"
                  priority
                />
              </div>

              <div className="hidden leading-tight sm:block">
                <p className="text-[15px] font-black tracking-[0.08em] text-[#10231f]">
                  BWP AI TRAVEL AGENT
                </p>

                <p className="mt-1 text-[10px] font-bold tracking-[0.16em] text-[#007b5e]">
                  BAHAWALPUR DOUBLE-DECKER BUS
                </p>
              </div>

            </div>
          </Link>

          <nav className="ml-auto flex items-center gap-5 sm:gap-8">

            <Link
              href="/"
              className="font-semibold text-[#17211f] transition hover:text-[#007b5e]"
            >
              Home
            </Link>

            <Link
              href="/routes"
              className="relative font-bold text-[#007b5e]"
            >
              Routes

              <span className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full bg-[#007b5e]" />
            </Link>

            <Link
              href="/booking"
              className="rounded-full bg-[#007b5e] px-5 py-2.5 font-bold text-white shadow-[0_7px_18px_rgba(0,123,94,0.16)] transition hover:-translate-y-1 hover:bg-[#00684f]"
            >
              Book Now
            </Link>

          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#cfe6da] bg-gradient-to-br from-white via-[#f3fbf7] to-[#dff4e9]">

        {/* GREEN GLOWS */}
        <div className="routes-glow pointer-events-none absolute -right-32 -top-32 h-[430px] w-[430px] rounded-full bg-[#78cdaa]/35 blur-3xl" />

        <div className="routes-glow pointer-events-none absolute -bottom-32 right-[25%] h-[300px] w-[300px] rounded-full bg-[#9fe0c2]/35 blur-3xl" />

        <div className="routes-glow pointer-events-none absolute -left-40 top-[25%] h-[280px] w-[280px] rounded-full bg-[#b9ead2]/25 blur-3xl" />

        {/* MOVING DOTS */}
        <span className="routes-dot-one pointer-events-none absolute right-[18%] top-[100px] h-6 w-6 rounded-full bg-[#57b994]/35" />

        <span className="routes-dot-two pointer-events-none absolute right-[10%] top-[245px] h-4 w-4 rounded-full bg-[#39a47d]/45" />

        <span className="routes-dot-three pointer-events-none absolute right-[30%] top-[315px] h-3 w-3 rounded-full bg-[#007b5e]/35" />

        <span className="routes-dot-four pointer-events-none absolute left-[12%] top-[90px] h-3 w-3 rounded-full bg-[#43c98f]/35" />

        <span className="routes-dot-five pointer-events-none absolute left-[28%] top-[185px] h-5 w-5 rounded-full bg-[#57b994]/25" />

        <span className="routes-dot-six pointer-events-none absolute left-[42%] top-[85px] h-2 w-2 rounded-full bg-[#007b5e]/40" />

        <span className="routes-dot-seven pointer-events-none absolute right-[40%] top-[210px] h-3 w-3 rounded-full bg-[#43c98f]/40" />

        <span className="routes-dot-eight pointer-events-none absolute right-[22%] bottom-[80px] h-5 w-5 rounded-full bg-[#39a47d]/25" />

        <span className="routes-dot-nine pointer-events-none absolute left-[18%] bottom-[70px] h-3 w-3 rounded-full bg-[#72cbaa]/35" />

        <span className="routes-dot-ten pointer-events-none absolute right-[6%] top-[135px] h-2 w-2 rounded-full bg-[#007b5e]/45" />

        {/* SUBTLE ORBIT */}
        <div className="pointer-events-none absolute right-[3%] top-[8%] hidden h-[300px] w-[300px] rounded-full border border-[#43c98f]/10 lg:block">
          <div className="routes-orbit-dot absolute left-1/2 top-1/2 h-3 w-3 -ml-1.5 -mt-1.5 rounded-full bg-[#43c98f]/45" />
        </div>

        <div className="relative mx-auto max-w-[1150px] px-5 py-16 sm:px-8 lg:px-10 lg:py-20">

          <div className="max-w-[760px]">

            <div className="flex items-center gap-4">

              <span className="h-[4px] w-12 rounded-full bg-[#007b5e]" />

              <p className="text-xs font-extrabold tracking-[0.3em] text-[#007b5e]">
                TDCP BUS ROUTES
              </p>

            </div>

            <h1 className="mt-5 text-5xl font-black leading-[1] tracking-[-0.045em] text-[#10231f] sm:text-6xl lg:text-7xl">
              Explore Our{" "}
              <span className="text-[#007b5e]">
                Routes
              </span>
            </h1>

            <p className="mt-6 max-w-[760px] text-lg leading-8 text-[#5e7069]">
              Choose from four TDCP Double-Decker Bus experiences available in
              Bahawalpur. Standard routes are priced per seat, while Route 04 is
              a special whole-day tour for schools and groups.
            </p>

            <div className="mt-8 flex items-center gap-3">

              <span className="h-[5px] w-16 rounded-full bg-[#007b5e]" />

              <span className="h-px w-28 bg-[#9bd5c0]" />

              <span className="h-2 w-2 rounded-full bg-[#72cbaa]" />

            </div>

          </div>
        </div>
      </section>

      {/* ROUTES SECTION */}
      <section className="relative overflow-hidden bg-[#eaf7f1] px-5 py-16 sm:px-8 lg:px-10 lg:py-20">

        {/* BACKGROUND GREEN GLOWS */}
        <div className="routes-glow pointer-events-none absolute left-[-120px] top-[20%] h-[300px] w-[300px] rounded-full bg-[#9fe0c2]/25 blur-3xl" />

        <div className="routes-glow pointer-events-none absolute bottom-[-120px] right-[-80px] h-[320px] w-[320px] rounded-full bg-[#8bd5b5]/25 blur-3xl" />

        <div className="routes-glow pointer-events-none absolute right-[35%] top-[45%] h-[240px] w-[240px] rounded-full bg-[#b5e8d1]/20 blur-3xl" />

        {/* EXTRA MOVING DOTS THROUGH ROUTES AREA */}
        <span className="routes-dot-four pointer-events-none absolute left-[5%] top-[8%] h-3 w-3 rounded-full bg-[#39a47d]/30" />

        <span className="routes-dot-five pointer-events-none absolute left-[18%] top-[30%] h-4 w-4 rounded-full bg-[#57b994]/25" />

        <span className="routes-dot-six pointer-events-none absolute left-[43%] top-[18%] h-2 w-2 rounded-full bg-[#007b5e]/30" />

        <span className="routes-dot-seven pointer-events-none absolute right-[14%] top-[25%] h-5 w-5 rounded-full bg-[#43c98f]/25" />

        <span className="routes-dot-eight pointer-events-none absolute right-[5%] top-[55%] h-3 w-3 rounded-full bg-[#39a47d]/35" />

        <span className="routes-dot-nine pointer-events-none absolute left-[8%] bottom-[20%] h-4 w-4 rounded-full bg-[#72cbaa]/30" />

        <span className="routes-dot-ten pointer-events-none absolute right-[25%] bottom-[12%] h-2 w-2 rounded-full bg-[#007b5e]/35" />

        <div className="relative mx-auto max-w-[1150px]">

          <div className="grid gap-6 lg:grid-cols-2">

            {routes.map((route, routeIndex) => (
              <article
                key={route.number}
                className="routes-card rounded-[28px] border border-[#d4e8df] bg-white p-7 shadow-[0_12px_40px_rgba(30,55,45,0.07)]"
                style={{
                  animationDelay: `${routeIndex * 140}ms`,
                }}
              >

                {/* ROUTE HEADER */}
                <div className="flex flex-wrap items-start justify-between gap-4">

                  <div className="flex items-center gap-4">

                    <span className="routes-number flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#007b5e] to-[#00684f] text-lg font-black text-white">
                      {route.number}
                    </span>

                    <div>

                      <p className="text-xs font-bold uppercase tracking-wider text-[#007b5e]">
                        {route.shortName}
                      </p>

                      <h2 className="mt-1 text-2xl font-black text-[#10231f]">
                        {route.name}
                      </h2>

                    </div>

                  </div>

                  {/* PRICE */}
                  <div className="rounded-2xl border border-[#d7ece1] bg-gradient-to-br from-[#edf9f3] to-[#e1f5eb] px-4 py-3 text-right">

                    <p className="text-xs font-bold text-[#738079]">
                      {route.priceLabel}
                    </p>

                    <p className="text-xl font-black text-[#007b5e]">
                      {route.price}
                    </p>

                  </div>

                </div>

                {/* DESCRIPTION */}
                <p className="mt-6 leading-7 text-[#65716d]">
                  {route.description}
                </p>

                {/* STOPS */}
                <div className="mt-6">

                  <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[#78817d]">
                    Route Stops
                  </p>

                  <div className="space-y-3">

                    {route.stops.map((stop, index) => (
                      <div
                        key={`${route.number}-${stop}`}
                        className="routes-stop flex items-center gap-3 rounded-xl px-2 py-1"
                      >

                        <span className="routes-stop-dot flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#007b5e]/10 text-xs font-black text-[#007b5e]">
                          {index + 1}
                        </span>

                        <span className="text-sm font-semibold text-[#35433e]">
                          {stop}
                        </span>

                      </div>
                    ))}

                  </div>
                </div>

                {/* BOOK BUTTON */}
                <Link
                  href="/booking"
                  className="routes-button mt-7 flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#007b5e] to-[#00684f] px-5 py-3.5 font-bold text-white"
                >
                  Book This Route
                  <ArrowIcon />
                </Link>

              </article>
            ))}

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative overflow-hidden border-t border-[#0a6e53]/20 bg-gradient-to-r from-[#063d2e] via-[#075c46] to-[#007b5e] text-white">

        <div className="routes-glow pointer-events-none absolute -right-24 -top-24 h-[300px] w-[300px] rounded-full bg-[#80ddb6]/15 blur-3xl" />

        <div className="relative mx-auto max-w-[1150px] px-5 py-10 sm:px-8 lg:px-10">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-base font-black">
                Bahawalpur Double-Decker Bus
              </p>

              <p className="mt-1 text-xs text-white/60">
                TDCP Reservation System
              </p>

            </div>

            <div className="flex flex-wrap items-center gap-5">

              <Link
                href="/"
                className="font-bold text-white/75 transition hover:-translate-y-1 hover:text-white"
              >
                Home
              </Link>

              <Link
                href="/booking"
                className="font-bold text-white/75 transition hover:-translate-y-1 hover:text-white"
              >
                Booking
              </Link>

              <Link
                href="/how-it-works"
                className="font-bold text-white/75 transition hover:-translate-y-1 hover:text-white"
              >
                How It Works
              </Link>

              <Link
                href="/booking-status"
                className="font-bold text-white/75 transition hover:-translate-y-1 hover:text-white"
              >
                Booking Status
              </Link>

            </div>
          </div>

          <div className="my-7 h-px bg-white/10" />

          {/* DEVELOPED BY */}
          <div className="text-center">

            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/45">
              Developed by
            </p>

            <p className="mt-2 text-sm font-black tracking-wide text-white">
              Naina Nayab
              <span className="mx-2 text-[#82ddb7]">
                &
              </span>
              Imran Mansha
            </p>

            <p className="mt-2 text-[9px] font-medium text-white/40">
              © {new Date().getFullYear()} Bahawalpur Double-Decker Bus. All
              rights reserved.
            </p>

          </div>

        </div>
      </footer>

    </main>
  );
}