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
    <main className="min-h-screen bg-[#071510] text-[#edf7f2]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,123,94,0.22),transparent_42%)]" />
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#c9a45c]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 sm:px-8 lg:px-12 lg:pb-28 lg:pt-24">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.28em] text-[#c9a45c]">
              About Our Service
            </p>

            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Making your Bahawalpur journey
              <span className="block text-[#c9a45c]">simple to plan.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-[#b9cbc4] sm:text-lg">
              The BWP AI Travel Agent provides a straightforward online
              experience for exploring routes, checking travel details,
              selecting seats and managing your booking.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/booking"
                className="inline-flex items-center justify-center rounded-full bg-[#007b5e] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#00916e]"
              >
                Book Your Seat
              </Link>

              <Link
                href="/routes"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Explore Routes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c9a45c]">
              Our Purpose
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              One place for your travel planning
            </h2>
          </div>

          <div className="space-y-5 text-[15px] leading-8 text-[#b9cbc4] sm:text-base">
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
      </section>

      {/* Highlights */}
      <section className="border-y border-white/10 bg-[#0b1c17]">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c9a45c]">
              What You Get
            </p>

            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Designed around a simpler booking experience
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {highlights.map((item) => (
              <article
                key={item.number}
                className="rounded-3xl border border-white/10 bg-white/[0.035] p-7 transition hover:-translate-y-1 hover:border-[#c9a45c]/30 hover:bg-white/[0.055]"
              >
                <span className="text-sm font-bold text-[#c9a45c]">
                  {item.number}
                </span>

                <h3 className="mt-5 text-xl font-bold">{item.title}</h3>

                <p className="mt-3 text-sm leading-7 text-[#aebfb8]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Journey */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c9a45c]">
              How It Works
            </p>

            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              From search to reservation
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-[#aebfb8] sm:text-base">
              The booking journey is organized into clear steps so you can
              understand what happens before completing your reservation.
            </p>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step}
                className="flex gap-5 rounded-2xl border border-white/10 bg-white/[0.035] p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#007b5e] text-sm font-bold">
                  {index + 1}
                </div>

                <p className="pt-1 text-sm leading-7 text-[#c2d0cb] sm:text-base">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20 sm:px-8 lg:px-12 lg:pb-28">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[#c9a45c]/20 bg-[#0b211a] px-7 py-12 sm:px-10 lg:px-16 lg:py-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c9a45c]">
                Ready to Travel?
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Find your route and reserve your seat.
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#aebfb8] sm:text-base">
                Explore the available travel options and continue to booking
                whenever you are ready.
              </p>
            </div>

            <Link
              href="/booking"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#c9a45c] px-7 py-3.5 text-sm font-bold text-[#10231f] transition hover:bg-[#d7b873]"
            >
              Start Booking
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#06110d]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-[#91a59d] sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <p>
            © {new Date().getFullYear()} BWP AI Travel Agent. All rights
            reserved.
          </p>

          <div className="flex gap-5">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <Link href="/routes" className="transition hover:text-white">
              Routes
            </Link>
            <Link href="/booking" className="transition hover:text-white">
              Booking
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}