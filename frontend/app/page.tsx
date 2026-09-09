import BookingStatusLookup from "@/components/BookingStatusLookup";
import ScheduleSelector from "@/components/ScheduleSelector";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a
            href="#top"
            className="flex items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
              TD
            </div>

            <div>
              <p className="text-base font-bold tracking-tight text-slate-950">
                TDCP Bus
              </p>
              <p className="text-xs text-slate-500">
                Double-Decker Reservation
              </p>
            </div>
          </a>

          <nav aria-label="Main navigation">
            <div className="flex items-center gap-1 sm:gap-2">
              <a
                href="#booking"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 sm:px-4"
              >
                Book a Seat
              </a>

              <a
                href="#booking-status"
                className="hidden rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 sm:inline-flex"
              >
                Check Booking
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        id="top"
        aria-labelledby="hero-heading"
        className="overflow-hidden border-b border-slate-200 bg-white"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
              <span className="h-2 w-2 rounded-full bg-slate-900" />
              TDCP Bus Reservation System
            </div>

            <h1
              id="hero-heading"
              className="text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl"
            >
              Your journey starts with the right seat.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Choose your travel date and departure time, explore the available
              seats on our double-decker bus, and reserve your preferred seat
              through a simple booking experience.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#booking-options"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
              >
                Start Booking
              </a>

              <a
                href="#booking-status"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
              >
                Check Existing Booking
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              <span>✓ Visual seat selection</span>
              <span>✓ Temporary seat hold</span>
              <span>✓ Payment proof submission</span>
            </div>
          </div>

          {/* Animated bus visual */}
          <div
            className="relative flex min-h-80 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:min-h-96"
            aria-label="Animated double-decker bus illustration"
          >
            <div className="absolute inset-x-0 bottom-10 h-px bg-slate-300" />

            <div className="relative w-full max-w-md animate-[busFloat_4s_ease-in-out_infinite]">
              {/* Bus body */}
              <div className="relative rounded-[2rem] border-4 border-slate-950 bg-white p-3 shadow-2xl">
                {/* Upper deck */}
                <div className="rounded-[1.5rem] border-2 border-slate-900 bg-slate-100 p-3">
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 10 }).map((_, index) => (
                      <div
                        key={`upper-${index}`}
                        className="h-7 rounded-md border border-slate-300 bg-white"
                      />
                    ))}
                  </div>
                </div>

                {/* Lower deck */}
                <div className="mt-3 rounded-[1.5rem] border-2 border-slate-900 bg-slate-950 p-3">
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 10 }).map((_, index) => (
                      <div
                        key={`lower-${index}`}
                        className="h-7 rounded-md border border-slate-700 bg-slate-800"
                      />
                    ))}
                  </div>
                </div>

                {/* Bus details */}
                <div className="mt-3 flex items-center justify-between px-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    TDCP
                  </span>

                  <span className="text-xs font-semibold text-slate-500">
                    DOUBLE-DECKER
                  </span>
                </div>

                {/* Wheels */}
                <div className="absolute -bottom-7 left-12 h-14 w-14 rounded-full border-4 border-slate-950 bg-slate-700" />
                <div className="absolute -bottom-7 right-12 h-14 w-14 rounded-full border-4 border-slate-950 bg-slate-700" />
              </div>

              {/* Motion lines */}
              <div className="absolute -left-8 top-1/3 h-1 w-14 animate-[motionLine_1.5s_ease-in-out_infinite] rounded-full bg-slate-300" />
              <div className="absolute -left-14 top-1/2 h-1 w-20 animate-[motionLine_1.8s_ease-in-out_infinite] rounded-full bg-slate-200" />
            </div>
          </div>
        </div>
      </section>

      {/* Booking features */}
      <section
        aria-labelledby="features-heading"
        className="border-b border-slate-200 bg-slate-50"
      >
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
                01
              </div>
              <h2
                id="features-heading"
                className="mt-5 text-lg font-bold text-slate-950"
              >
                Choose your schedule
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Select the travel date and available departure timing that
                works for you.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
                02
              </div>
              <h2 className="mt-5 text-lg font-bold text-slate-950">
                Select your seat
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                View upper and lower deck availability and select the seats you
                prefer.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
                03
              </div>
              <h2 className="mt-5 text-lg font-bold text-slate-950">
                Complete your booking
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Provide passenger details and submit payment proof for
                verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking */}
      <section
        id="booking"
        aria-labelledby="booking-heading"
        className="bg-white"
      >
        <div
          id="booking-options"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Reservation
            </p>

            <h2
              id="booking-heading"
              className="mt-2 text-3xl font-bold tracking-tight text-slate-950"
            >
              Plan your journey
            </h2>

            <p className="mt-3 text-slate-600">
              Choose your travel date and departure time to see the available
              seats.
            </p>
          </div>

          <div className="mt-8">
            <ScheduleSelector />
          </div>
        </div>
      </section>

      {/* Booking process */}
      <section
        aria-labelledby="process-heading"
        className="border-y border-slate-200 bg-slate-50"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              How it works
            </p>

            <h2
              id="process-heading"
              className="mt-2 text-3xl font-bold tracking-tight text-slate-950"
            >
              A simple reservation process
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["01", "Select date", "Choose your travel date."],
              ["02", "Choose timing", "Select an available departure."],
              ["03", "Pick seats", "Choose available seats on the bus."],
              ["04", "Add details", "Enter passenger information."],
              ["05", "Submit proof", "Upload payment proof for review."],
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <p className="text-xs font-bold tracking-widest text-slate-400">
                  {number}
                </p>
                <h3 className="mt-3 text-base font-bold text-slate-950">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking status */}
      <section
        id="booking-status"
        aria-labelledby="booking-status-section-heading"
        className="bg-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Existing reservation
            </p>

            <h2
              id="booking-status-section-heading"
              className="mt-2 text-3xl font-bold tracking-tight text-slate-950"
            >
              Manage your booking
            </h2>

            <p className="mt-3 text-slate-600">
              Check the current status of your booking using your booking
              reference, phone number, or email.
            </p>
          </div>

          <div className="mt-8 max-w-3xl">
            <BookingStatusLookup />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="font-bold">TDCP Double-Decker Bus</p>
            <p className="mt-1 text-sm text-slate-400">
              Bus booking and reservation system
            </p>
          </div>

          <p className="text-sm text-slate-400">
            TDCP Bus Reservation System
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes busFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes motionLine {
          0% {
            opacity: 0;
            transform: translateX(10px);
          }

          50% {
            opacity: 1;
          }

          100% {
            opacity: 0;
            transform: translateX(-12px);
          }
        }
      `}</style>
    </main>
  );
}