import Link from "next/link";

const reasons = [
  {
    number: "01",
    title: "Comfortable Travel",
    description:
      "Plan your journey with clear travel information and a simple reservation experience from start to finish.",
  },
  {
    number: "02",
    title: "Safe & Secure Booking",
    description:
      "Your booking journey is organized into clear steps, helping you review your selected travel details before completing the reservation.",
  },
  {
    number: "03",
    title: "Modern Double-Decker Experience",
    description:
      "Explore available seating options across the bus and select an available seat that fits your travel preference.",
  },
  {
    number: "04",
    title: "Easy Online Booking",
    description:
      "Select your date, departure timing and seats without needing a complicated booking process.",
  },
  {
    number: "05",
    title: "Clear Route & Pricing",
    description:
      "Check available routes, timings and applicable pricing information before continuing with your booking.",
  },
  {
    number: "06",
    title: "Booking Status Access",
    description:
      "After booking, use your booking reference to check the current status of your reservation.",
  },
];

const journey = [
  {
    step: "01",
    title: "Choose Your Date",
    text: "Start by selecting the date you want to travel.",
  },
  {
    step: "02",
    title: "Select Departure",
    text: "View available departure timings and choose the one that suits you.",
  },
  {
    step: "03",
    title: "Pick Your Seat",
    text: "Use the seat map to select from the available seats.",
  },
  {
    step: "04",
    title: "Complete Booking",
    text: "Enter your details, review the booking and follow the payment instructions.",
  },
];

export default function WhyChooseUsPage() {
  return (
    <main className="min-h-screen bg-[#071510] text-[#edf7f2]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,123,94,0.24),transparent_43%)]" />
        <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-[#c9a45c]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 sm:px-8 lg:px-12 lg:pb-28 lg:pt-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#c9a45c]">
              Why Choose Us
            </p>

            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              A simpler way to
              <span className="block text-[#c9a45c]">
                plan your journey.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-[#b9cbc4] sm:text-lg">
              BWP AI Travel Agent brings route information, departure
              timings, seat selection and booking status into one convenient
              travel experience.
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
                View Routes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main reasons */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c9a45c]">
            Our Advantages
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need for a smoother booking journey
          </h2>

          <p className="mt-5 text-sm leading-7 text-[#aebfb8] sm:text-base">
            The platform focuses on making the important parts of your travel
            reservation easy to understand and access.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason) => (
            <article
              key={reason.number}
              className="group rounded-3xl border border-white/10 bg-[#0b1c17] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#c9a45c]/30 hover:bg-[#0e241d]"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#c9a45c]">
                  {reason.number}
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[#8fa39b] transition group-hover:border-[#c9a45c]/30 group-hover:text-[#c9a45c]">
                  →
                </span>
              </div>

              <h3 className="mt-7 text-xl font-bold">{reason.title}</h3>

              <p className="mt-3 text-sm leading-7 text-[#aebfb8]">
                {reason.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-y border-white/10 bg-[#0b1c17]">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="text-3xl font-bold text-[#c9a45c]">01</div>
              <h3 className="mt-3 text-lg font-bold">Simple</h3>
              <p className="mt-2 text-sm leading-6 text-[#9eb1aa]">
                Important travel and booking information stays easy to find.
              </p>
            </div>

            <div>
              <div className="text-3xl font-bold text-[#c9a45c]">02</div>
              <h3 className="mt-3 text-lg font-bold">Transparent</h3>
              <p className="mt-2 text-sm leading-6 text-[#9eb1aa]">
                Review route, timing, seat and booking details throughout the
                reservation process.
              </p>
            </div>

            <div>
              <div className="text-3xl font-bold text-[#c9a45c]">03</div>
              <h3 className="mt-3 text-lg font-bold">Convenient</h3>
              <p className="mt-2 text-sm leading-6 text-[#9eb1aa]">
                Search, reserve and check your booking through one platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c9a45c]">
              Your Journey
            </p>

            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Four clear steps
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-[#aebfb8] sm:text-base">
              We keep the reservation flow focused so you can move from
              choosing a trip to completing your booking without unnecessary
              complexity.
            </p>
          </div>

          <div className="space-y-4">
            {journey.map((item) => (
              <div
                key={item.step}
                className="flex gap-5 rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition hover:bg-white/[0.055]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#007b5e] text-sm font-bold">
                  {item.step}
                </span>

                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#aebfb8]">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20 sm:px-8 lg:px-12 lg:pb-28">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-[#c9a45c]/20 bg-[#0b211a] px-7 py-12 sm:px-10 lg:px-16 lg:py-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c9a45c]">
                Start Your Trip
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Your next journey starts with a simple booking.
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#aebfb8] sm:text-base">
                Explore available routes and continue when you are ready to
                reserve your seat.
              </p>
            </div>

            <Link
              href="/booking"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#c9a45c] px-7 py-3.5 text-sm font-bold text-[#10231f] transition hover:bg-[#d7b873]"
            >
              Book Now
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

            <Link href="/about" className="transition hover:text-white">
              About
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