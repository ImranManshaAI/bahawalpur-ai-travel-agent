import Link from "next/link";

import ScheduleSelector from "@/components/ScheduleSelector";

const steps = [
  {
    number: "01",
    title: "Select Schedule",
    description: "Choose your travel date and timing.",
  },
  {
    number: "02",
    title: "Choose Seats",
    description: "Select available seats from the bus layout.",
  },
  {
    number: "03",
    title: "Passenger Details",
    description: "Enter the required passenger information.",
  },
  {
    number: "04",
    title: "Payment",
    description: "Submit your payment details and proof.",
  },
  {
    number: "05",
    title: "Confirmation",
    description: "Receive your booking reference and status.",
  },
];

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-[#f7faf8] text-[#10221b]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#e2ebe6] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Back to TDCP Bahawalpur home"
          >
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-white">
              <img
                src="/images/tdcp-logo.png.jpeg.jpeg"
                alt="TDCP"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-black tracking-[0.08em] text-[#087a56]">
                TDCP
              </p>
              <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#65736d]">
                Bahawalpur Double-Decker
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/"
              className="text-sm font-bold text-[#34433d] transition hover:text-[#087a56]"
            >
              Home
            </Link>

            <Link
              href="/booking"
              className="relative py-2 text-sm font-black text-[#087a56]"
            >
              Bus Booking
              <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[#087a56]" />
            </Link>

            <Link
              href="/#about"
              className="text-sm font-bold text-[#34433d] transition hover:text-[#087a56]"
            >
              How It Works
            </Link>

            <Link
              href="/#booking-status"
              className="text-sm font-bold text-[#34433d] transition hover:text-[#087a56]"
            >
              Booking Status
            </Link>
          </nav>

          <Link
            href="/"
            className="rounded-full border border-[#d7e4de] bg-white px-5 py-2.5 text-sm font-black text-[#087a56] transition hover:border-[#087a56]"
          >
            ← Home
          </Link>
        </div>
      </header>

      {/* PAGE INTRO */}
      <section className="border-b border-[#e2ebe6] bg-white">
        <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="h-[3px] w-10 rounded-full bg-[#087a56]" />

              <span className="text-[11px] font-black uppercase tracking-[0.28em] text-[#087a56]">
                TDCP • BAHAWALPUR
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-[-0.045em] text-[#071c15] sm:text-5xl lg:text-6xl">
              Book your Double-Decker
              <span className="block text-[#087a56]">
                Bus seat.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-[#596962] sm:text-lg">
              Select your schedule, choose your preferred seat and complete
              your passenger and payment details through our simple booking
              process.
            </p>
          </div>
        </div>
      </section>

      {/* BOOKING STEPS */}
      <section className="px-4 py-8 sm:px-6 lg:px-12 lg:py-10">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-3 md:grid-cols-5">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`rounded-2xl border p-4 ${
                  index === 0
                    ? "border-[#087a56] bg-[#087a56] text-white shadow-[0_12px_30px_rgba(8,122,86,0.16)]"
                    : "border-[#dfe9e4] bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                      index === 0
                        ? "bg-white text-[#087a56]"
                        : "bg-[#e9f6ef] text-[#087a56]"
                    }`}
                  >
                    {step.number}
                  </span>

                  <div>
                    <p
                      className={`text-sm font-black ${
                        index === 0 ? "text-white" : "text-[#17251f]"
                      }`}
                    >
                      {step.title}
                    </p>

                    <p
                      className={`mt-1 text-xs leading-5 ${
                        index === 0 ? "text-white/75" : "text-[#718079]"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACTUAL BOOKING SYSTEM */}
      <section className="px-4 pb-16 sm:px-6 lg:px-12 lg:pb-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="overflow-hidden rounded-[28px] border border-[#dce8e2] bg-white shadow-[0_20px_60px_rgba(15,60,45,0.08)]">
            <div className="border-b border-[#e7eeea] px-5 py-5 sm:px-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#087a56]">
                Reservation
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-[#10221b]">
                Select your journey
              </h2>
            </div>

            <div className="p-5 sm:p-8 lg:p-10">
              <ScheduleSelector />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#063d2e] px-5 py-8 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black">
              Bahawalpur Double-Decker Bus
            </p>

            <p className="mt-1 text-xs text-white/55">
              TDCP Reservation System
            </p>
          </div>

          <Link
            href="/"
            className="text-xs font-bold text-white/70 transition hover:text-white"
          >
            ← Return to Home
          </Link>
        </div>
      </footer>
    </main>
  );
}