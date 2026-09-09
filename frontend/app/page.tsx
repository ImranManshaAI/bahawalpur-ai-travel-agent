import BookingStatusLookup from "@/components/BookingStatusLookup";
import ScheduleSelector from "@/components/ScheduleSelector";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-lg font-bold tracking-tight">
              Double-Decker Bus Booking
            </p>
            <p className="text-xs text-slate-500">
              TDCP Bus Reservation System
            </p>
          </div>

          <nav aria-label="Main navigation">
            <div className="flex items-center gap-2">
              <a
                href="#booking"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
              >
                Book a Seat
              </a>

              <a
                href="#booking-status"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
              >
                Check Booking
              </a>
            </div>
          </nav>
        </div>
      </header>

      <section
        id="booking"
        aria-labelledby="hero-heading"
        className="border-b border-slate-200"
      >
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-600">
              TDCP Bus Reservation System
            </p>

            <h1
              id="hero-heading"
              className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl"
            >
              Book your double-decker bus seat with confidence.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Choose your travel date and timing, view live seat availability,
              and reserve your preferred seat through a clear and reliable
              booking experience.
            </p>

            <div className="mt-8">
              <a
                href="#booking-options"
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
              >
                Start Booking
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        id="booking-options"
        aria-labelledby="booking-options-heading"
        className="bg-slate-50"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2
              id="booking-options-heading"
              className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
            >
              Plan your journey
            </h2>

            <p className="mt-3 text-slate-600">
              Choose your travel date and departure time to continue.
            </p>

            <ScheduleSelector />
          </div>
        </div>
      </section>

      <section
        id="booking-status"
        aria-labelledby="booking-status-section-heading"
        className="border-t border-slate-200 bg-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2
              id="booking-status-section-heading"
              className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
            >
              Manage your booking
            </h2>

            <p className="mt-3 text-slate-600">
              Already submitted a booking? Check its current status using your
              booking reference, phone number, or email.
            </p>

            <div className="mt-8">
              <BookingStatusLookup />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-500 sm:px-6 lg:px-8">
          <p>Double-Decker Bus Booking - TDCP Bus Reservation System</p>
        </div>
      </footer>
    </main>
  );
}