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

const benefits = [
  {
    type: "comfortable",
    title: "Comfortable",
    subtitle: "Travel",
  },
  {
    type: "safe",
    title: "Safe & Secure",
    subtitle: "Journey",
  },
  {
    type: "modern",
    title: "Modern",
    subtitle: "Double-Decker",
  },
  {
    type: "easy",
    title: "Easy",
    subtitle: "Booking",
  },
];

function Icon({
  type,
  size = 28,
}: {
  type: string;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (type === "comfortable") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M5 17v-4a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4" />
        <path d="M3 17h18" />
        <path d="M5 17v3" />
        <path d="M19 17v3" />
        <path d="M8 10V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" />
      </svg>
    );
  }

  if (type === "safe") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M12 3l7 3v5c0 4.5-3 7.8-7 10-4-2.2-7-5.5-7-10V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    );
  }

  if (type === "modern") {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="5" y="4" width="14" height="15" rx="2" />
        <path d="M5 12h14" />
        <path d="M8 8h2" />
        <path d="M14 8h2" />
        <path d="M8 16h2" />
        <path d="M14 16h2" />
        <path d="M8 19v2" />
        <path d="M16 19v2" />
      </svg>
    );
  }

  return (
    <svg {...common} aria-hidden="true">
      <path d="M3 7h11a4 4 0 0 1 4 4v5H3V7z" />
      <path d="M18 11h2a1 1 0 0 1 1 1v4h-3" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
      <path d="M7 10h4" />
    </svg>
  );
}

export default function WhyChooseUsPage() {
  return (
    <main className="min-h-screen bg-[#06130f] text-[#edf7f2]">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(0,123,94,0.20),transparent_35%)]" />

        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-[#c9a45c]/[0.06] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-8 sm:px-8 lg:px-12 lg:pb-28 lg:pt-12">
          {/* Back Home */}
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-[#b9cbc4] backdrop-blur-sm transition-all duration-300 hover:border-[#c9a45c]/40 hover:bg-[#c9a45c]/10 hover:text-[#c9a45c]"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
            Back to Home
          </Link>

          <div className="mt-16 max-w-3xl lg:mt-20">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#c9a45c]" />

              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#c9a45c]">
                Why Choose Us
              </p>
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-7xl">
              A better way to
              <span className="block text-[#c9a45c]">
                plan your journey.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-[#aebfb8] sm:text-lg">
              BWP AI Travel Agent brings route information, departure
              timings, seat selection and booking status into one convenient
              travel experience.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/booking"
                className="inline-flex items-center justify-center rounded-full bg-[#007b5e] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#007b5e]/10 transition-all duration-300 hover:bg-[#00916e] hover:shadow-[#007b5e]/20"
              >
                Book Your Seat
              </Link>

              <Link
                href="/routes"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:border-[#c9a45c]/30 hover:bg-white/[0.07]"
              >
                Explore Routes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOUR KEY BENEFITS ================= */}
      <section className="relative border-b border-white/[0.08] bg-[#081913]">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className="group relative bg-[#0a1c16] p-6 transition-all duration-300 hover:bg-[#0d241c] lg:p-7"
              >
                {index > 0 && (
                  <div className="absolute left-0 top-8 hidden h-20 w-px bg-white/[0.06] lg:block" />
                )}

                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#c9a45c]/15 bg-[#c9a45c]/[0.07] text-[#c9a45c] transition-all duration-300 group-hover:border-[#c9a45c]/30 group-hover:bg-[#c9a45c]/[0.12]">
                    <Icon type={benefit.type} />
                  </div>

                  <span className="text-xs font-semibold text-white/20">
                    0{index + 1}
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-bold text-white">
                  {benefit.title}
                </h3>

                <p className="mt-1 text-sm font-medium text-[#849990]">
                  {benefit.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MAIN REASONS ================= */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#c9a45c]" />

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#c9a45c]">
              Our Advantages
            </p>
          </div>

          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Everything you need for a smoother booking journey
          </h2>

          <p className="mt-5 text-sm leading-7 text-[#9eb1aa] sm:text-base">
            The platform focuses on making the important parts of your travel
            reservation easy to understand and access.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason) => (
            <article
              key={reason.number}
              className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0a1b15] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#c9a45c]/25 hover:bg-[#0d211a]"
            >
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#007b5e]/[0.06] blur-3xl transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative flex items-center justify-between">
                <span className="text-xs font-bold tracking-widest text-[#c9a45c]">
                  {reason.number}
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] text-[#72867e] transition-all duration-300 group-hover:border-[#c9a45c]/30 group-hover:text-[#c9a45c]">
                  →
                </span>
              </div>

              <div className="relative">
                <h3 className="mt-8 text-xl font-bold text-white">
                  {reason.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#9eb1aa]">
                  {reason.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ================= FEATURE STRIP ================= */}
      <section className="border-y border-white/[0.08] bg-[#081913]">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="grid gap-10 md:grid-cols-3 md:gap-0">
            <div className="md:border-r md:border-white/[0.08] md:pr-10">
              <span className="text-xs font-bold tracking-[0.25em] text-[#c9a45c]">
                01
              </span>

              <h3 className="mt-4 text-xl font-bold">Simple</h3>

              <p className="mt-3 max-w-sm text-sm leading-7 text-[#8fa39b]">
                Important travel and booking information stays easy to find.
              </p>
            </div>

            <div className="md:px-10">
              <span className="text-xs font-bold tracking-[0.25em] text-[#c9a45c]">
                02
              </span>

              <h3 className="mt-4 text-xl font-bold">Transparent</h3>

              <p className="mt-3 max-w-sm text-sm leading-7 text-[#8fa39b]">
                Review route, timing, seat and booking details throughout the
                reservation process.
              </p>
            </div>

            <div className="md:border-l md:border-white/[0.08] md:pl-10">
              <span className="text-xs font-bold tracking-[0.25em] text-[#c9a45c]">
                03
              </span>

              <h3 className="mt-4 text-xl font-bold">Convenient</h3>

              <p className="mt-3 max-w-sm text-sm leading-7 text-[#8fa39b]">
                Search, reserve and check your booking through one platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= JOURNEY ================= */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#c9a45c]" />

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#c9a45c]">
                Your Journey
              </p>
            </div>

            <h2 className="mt-5 text-3xl font-bold sm:text-4xl lg:text-5xl">
              Four clear steps
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-[#9eb1aa] sm:text-base">
              We keep the reservation flow focused so you can move from
              choosing a trip to completing your booking without unnecessary
              complexity.
            </p>

            <Link
              href="/booking"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#c9a45c] transition hover:text-[#e0c37f]"
            >
              Start booking
              <span>→</span>
            </Link>
          </div>

          <div className="space-y-4">
            {journey.map((item) => (
              <div
                key={item.step}
                className="group flex gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition-all duration-300 hover:border-[#c9a45c]/20 hover:bg-white/[0.045]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#007b5e]/40 bg-[#007b5e]/10 text-xs font-bold text-[#c9a45c]">
                  {item.step}
                </span>

                <div>
                  <h3 className="font-bold text-white">{item.title}</h3>

                  <p className="mt-2 text-sm leading-6 text-[#9eb1aa]">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="px-6 pb-20 sm:px-8 lg:px-12 lg:pb-28">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[#c9a45c]/15 bg-[#0a2119] px-7 py-12 sm:px-10 lg:px-16 lg:py-16">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#007b5e]/15 blur-3xl" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#c9a45c]">
                Start Your Trip
              </p>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Your next journey starts with a simple booking.
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#9eb1aa] sm:text-base">
                Explore available routes and continue when you are ready to
                reserve your seat.
              </p>
            </div>

            <Link
              href="/booking"
              className="relative inline-flex shrink-0 items-center justify-center rounded-full bg-[#c9a45c] px-8 py-3.5 text-sm font-bold text-[#10231f] shadow-lg shadow-[#c9a45c]/10 transition-all duration-300 hover:bg-[#d7b873] hover:shadow-[#c9a45c]/20"
            >
              Book Now
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/[0.08] bg-[#050e0b]">
        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-5 text-sm text-[#71847c] sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} BWP AI Travel Agent. All rights
              reserved.
            </p>

            <div className="flex flex-wrap gap-5">
              <Link href="/" className="transition hover:text-white">
                Home
              </Link>

              <Link href="/routes" className="transition hover:text-white">
                Routes
              </Link>

              <Link href="/about" className="transition hover:text-white">
                About
              </Link>

              <Link href="/contact" className="transition hover:text-white">
                Contact
              </Link>

              <Link href="/booking" className="transition hover:text-white">
                Booking
              </Link>
            </div>
          </div>

          <div className="mt-6 border-t border-white/[0.05] pt-5 text-center text-xs text-[#5f716a]">
            Developed by Naina Nayab &amp; Imran Mansha
          </div>
        </div>
      </footer>
    </main>
  );
}