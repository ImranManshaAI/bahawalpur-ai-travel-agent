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
    <main className="min-h-screen bg-[#f7f3e9] text-[#10231f]">
      <header className="border-b border-black/[0.06] bg-[#fffdf8]/95">
        <div className="mx-auto flex min-h-[88px] max-w-[1280px] items-center gap-6 px-5 sm:px-8 lg:px-12">
          <Link href="/" className="shrink-0">
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
          </Link>

          <nav className="ml-auto flex items-center gap-5 sm:gap-8">
            <Link
              href="/"
              className="font-semibold text-[#17211f] hover:text-[#007b5e]"
            >
              Home
            </Link>

            <Link
              href="/routes"
              className="font-bold text-[#007b5e]"
            >
              Routes
            </Link>

            <Link
              href="/booking"
              className="rounded-full bg-[#007b5e] px-5 py-2.5 font-bold text-white"
            >
              Book Now
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8 lg:px-12">
        <div className="max-w-[780px]">
          <p className="text-xs font-extrabold tracking-[0.3em] text-[#007b5e]">
            TDCP BUS ROUTES
          </p>

          <h1 className="mt-3 text-5xl font-black tracking-[-0.045em] sm:text-6xl">
            Explore Our{" "}
            <span className="text-[#007b5e]">Routes</span>
          </h1>

          <p className="mt-5 text-lg leading-8 text-[#66716d]">
            Choose from four TDCP Double-Decker Bus experiences available in
            Bahawalpur. Standard routes are priced per seat, while Route 04 is
            a special whole-day tour for schools and groups.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {routes.map((route) => (
            <article
              key={route.number}
              className="rounded-[28px] border border-[#dfe6e1] bg-white p-7 shadow-[0_12px_40px_rgba(30,55,45,0.07)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#007b5e] text-lg font-black text-white">
                    {route.number}
                  </span>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#007b5e]">
                      {route.shortName}
                    </p>

                    <h2 className="mt-1 text-2xl font-black">
                      {route.name}
                    </h2>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#eef7f1] px-4 py-3 text-right">
                  <p className="text-xs font-bold text-[#738079]">
                    {route.priceLabel}
                  </p>

                  <p className="text-xl font-black text-[#007b5e]">
                    {route.price}
                  </p>
                </div>
              </div>

              <p className="mt-6 leading-7 text-[#65716d]">
                {route.description}
              </p>

              <div className="mt-6">
                <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[#78817d]">
                  Route Stops
                </p>

                <div className="space-y-3">
                  {route.stops.map((stop, index) => (
                    <div
                      key={`${route.number}-${stop}`}
                      className="flex items-center gap-3"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#007b5e]/10 text-xs font-black text-[#007b5e]">
                        {index + 1}
                      </span>

                      <span className="text-sm font-semibold text-[#35433e]">
                        {stop}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/booking"
                className="mt-7 flex items-center justify-center gap-3 rounded-xl bg-[#007b5e] px-5 py-3.5 font-bold text-white transition hover:bg-[#00684f]"
              >
                Book This Route
                <ArrowIcon />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-black/[0.06] bg-[#fffdf8]">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-5 py-8 text-sm text-[#68736f] sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <p>© {new Date().getFullYear()} Bahawalpur Double-Decker Bus</p>

          <Link
            href="/"
            className="font-bold text-[#007b5e] hover:text-[#00684f]"
          >
            Back to Home
          </Link>
        </div>
      </footer>
    </main>
  );
}