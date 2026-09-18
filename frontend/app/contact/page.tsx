"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

function Icon({
  name,
  size = 20,
}: {
  name: string;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "phone") {
    return (
      <svg {...common}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z" />
      </svg>
    );
  }

  if (name === "mobile") {
    return (
      <svg {...common}>
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <path d="M11 18h2" />
      </svg>
    );
  }

  if (name === "mail") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    );
  }

  if (name === "clock") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (name === "location") {
    return (
      <svg {...common}>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (name === "arrow") {
    return (
      <svg {...common}>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    );
  }

  if (name === "ticket") {
    return (
      <svg {...common}>
        <path d="M4 5h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4V5z" />
        <path d="M13 5v12" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </svg>
    );
  }

  if (name === "message") {
    return (
      <svg {...common}>
        <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 9.6 9.6 0 0 1-4-.9L3 21l1.9-4.2A8.2 8.2 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z" />
        <path d="M8 12h.01" />
        <path d="M12 12h.01" />
        <path d="M16 12h.01" />
      </svg>
    );
  }

  return null;
}

type ContactItem = {
  icon: string;
  label: string;
  value: string;
  href: string;
  description: string;
};

const contactItems: ContactItem[] = [
  {
    icon: "phone",
    label: "Phone",
    value: "062-2501932",
    href: "tel:0622501932",
    description: "General service enquiries",
  },
  {
    icon: "mobile",
    label: "Mobile",
    value: "0305-7877304",
    href: "tel:03057877304",
    description: "Booking assistance",
  },
  {
    icon: "mail",
    label: "Email",
    value: "Tdcpmultan@gmail.com",
    href: "mailto:Tdcpmultan@gmail.com",
    description: "Send us your questions",
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitted(true);

    window.setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#dcefe6] text-[#10251d]">

      {/* =========================================================
          HEADER
      ========================================================== */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#071a13]/95 shadow-[0_6px_24px_rgba(3,30,20,0.14)] backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-[1380px] items-center justify-between px-5 sm:px-8 lg:px-10">

          <Link
            href="/"
            className="group flex min-w-0 items-center gap-3"
          >
            <div className="relative h-[50px] w-[62px] shrink-0 transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-1">
              <Image
                src="/images/tdcp-logo.png.jpeg.jpeg.png"
                alt="TDCP Logo"
                fill
                sizes="62px"
                className="object-contain"
                priority
              />
            </div>

            <div className="hidden sm:block">
              <p className="text-[17px] font-black leading-none tracking-[-0.04em] text-white">
                BAHAWALPUR
              </p>

              <p className="mt-1 text-[9px] font-extrabold tracking-[0.1em] text-[#55d89e]">
                DOUBLE-DECKER BUS
              </p>

              <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.16em] text-white/40">
                TDCP RESERVATION SYSTEM
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-5 xl:flex">

            <Link
              href="/"
              className="nav-link text-[13px] font-bold text-white/60 transition hover:text-white"
            >
              Home
            </Link>

            <Link
              href="/routes"
              className="nav-link text-[13px] font-bold text-white/60 transition hover:text-white"
            >
              Routes
            </Link>

            <Link
              href="/about"
              className="nav-link text-[13px] font-bold text-white/60 transition hover:text-white"
            >
              About
            </Link>

            <Link
              href="/why-choose-us"
              className="nav-link text-[13px] font-bold text-white/60 transition hover:text-white"
            >
              Why Choose Us
            </Link>

            <Link
              href="/how-it-works"
              className="nav-link text-[13px] font-bold text-white/60 transition hover:text-white"
            >
              How It Works
            </Link>

            <Link
              href="/booking-status"
              className="nav-link text-[13px] font-bold text-white/60 transition hover:text-white"
            >
              Booking Status
            </Link>

            <Link
              href="/contact"
              className="relative text-[13px] font-extrabold text-[#55d89e]"
            >
              Contact

              <span className="absolute -bottom-[9px] left-0 h-[2px] w-full rounded-full bg-[#55d89e] animate-pulse" />
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2">

            <Link
              href="/"
              className="hidden h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 text-xs font-extrabold text-white transition duration-300 hover:-translate-y-0.5 hover:border-[#55d89e]/50 hover:bg-white/[0.08] sm:inline-flex"
            >
              <span className="text-sm transition-transform duration-300 hover:-translate-x-1">
                ←
              </span>

              Back Home
            </Link>

            <Link
              href="/booking"
              className="group inline-flex h-10 items-center gap-2 rounded-xl bg-[#008765] px-4 text-xs font-extrabold text-white shadow-[0_8px_22px_rgba(0,135,101,0.24)] transition duration-300 hover:-translate-y-1 hover:bg-[#009b73] hover:shadow-[0_12px_28px_rgba(0,135,101,0.35)]"
            >
              <span className="transition-transform duration-300 group-hover:rotate-[-8deg]">
                <Icon name="ticket" size={15} />
              </span>

              <span className="hidden sm:inline">
                Book Now
              </span>

              <span className="transition-transform duration-300 group-hover:translate-x-1">
                <Icon name="arrow" size={14} />
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================
          HERO
      ========================================================== */}

      <section className="relative overflow-hidden border-b border-[#c5ded2] bg-[#d4eade]">

        <div className="contact-orbit absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#8fd6b8]/25 blur-3xl" />

        <div className="contact-orbit-reverse absolute -bottom-32 left-[-100px] h-[360px] w-[360px] rounded-full bg-[#b5e1cd]/45 blur-3xl" />

        <div className="contact-floating-dot absolute right-[28%] top-[28%] h-3 w-3 rounded-full bg-[#008765]/30" />

        <div className="contact-floating-dot-delay absolute bottom-[25%] left-[38%] h-2 w-2 rounded-full bg-[#43c98f]/40" />

        <div className="relative mx-auto max-w-[1380px] px-5 py-12 sm:px-8 sm:py-14 lg:px-10 lg:py-16">

          <div className="contact-fade-down mb-10 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.22em]">

            <Link
              href="/"
              className="text-[#008765] transition duration-300 hover:translate-x-1 hover:text-[#006e53]"
            >
              Home
            </Link>

            <span className="text-[#7f9d90]">/</span>

            <span className="text-[#607970]">
              Contact
            </span>
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">

            <div className="contact-fade-left">

              <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#008765]">
                Get In Touch
              </p>

              <h1 className="mt-3 max-w-[760px] text-[46px] font-black leading-[0.98] tracking-[-0.065em] text-[#0c241b] sm:text-[58px] lg:text-[68px]">

                We&apos;re here to

                <span className="block text-[#008765] contact-title-float">
                  help you travel.
                </span>

              </h1>

              <p className="mt-5 max-w-[650px] text-[14px] font-medium leading-7 text-[#60756c] sm:text-[15px]">
                Have a question about routes, schedules, bookings
                or the Bahawalpur Double-Decker Bus? Our reservation
                team is here to help.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">

                <Link
                  href="/booking"
                  className="group inline-flex h-11 items-center gap-2 rounded-xl bg-[#008765] px-5 text-xs font-extrabold text-white shadow-[0_10px_24px_rgba(0,135,101,0.2)] transition duration-300 hover:-translate-y-1 hover:bg-[#009b73] hover:shadow-[0_15px_30px_rgba(0,135,101,0.28)]"
                >
                  Book Your Journey

                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    <Icon name="arrow" size={16} />
                  </span>
                </Link>

                <Link
                  href="/booking-status"
                  className="group inline-flex h-11 items-center gap-2 rounded-xl border border-[#aacdbd] bg-white/70 px-5 text-xs font-extrabold text-[#008765] shadow-[0_8px_20px_rgba(20,70,50,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[#008765] hover:bg-white hover:shadow-[0_12px_26px_rgba(20,70,50,0.10)]"
                >
                  <span className="transition-transform duration-300 group-hover:rotate-[-5deg]">
                    <Icon name="ticket" size={16} />
                  </span>

                  Booking Status
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[10px] font-bold text-[#647b71]">

                <div className="contact-trust-item flex items-center gap-2">

                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#008765] text-white transition duration-300 hover:scale-110 hover:rotate-6">
                    <Icon name="check" size={13} />
                  </span>

                  Route Assistance
                </div>

                <div className="contact-trust-item contact-delay-1 flex items-center gap-2">

                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#008765] text-white transition duration-300 hover:scale-110 hover:rotate-6">
                    <Icon name="check" size={13} />
                  </span>

                  Booking Support
                </div>

                <div className="contact-trust-item contact-delay-2 flex items-center gap-2">

                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#008765] text-white transition duration-300 hover:scale-110 hover:rotate-6">
                    <Icon name="check" size={13} />
                  </span>

                  Schedule Information
                </div>
              </div>
            </div>

            {/* RIGHT CONTACT CARD */}

            <div className="contact-fade-right relative">

              <div className="contact-card rounded-[26px] border border-[#c5ddd2] bg-white/95 p-5 shadow-[0_20px_50px_rgba(24,67,50,0.14)] backdrop-blur-sm sm:p-6">

                <div className="flex items-start justify-between gap-4 border-b border-[#e0ece6] pb-5">

                  <div>

                    <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#008765]">
                      Contact Information
                    </p>

                    <h2 className="mt-2 text-[24px] font-black tracking-[-0.045em] text-[#10251d]">
                      Let&apos;s connect
                    </h2>

                    <p className="mt-1 text-[11px] font-medium text-[#7a8d84]">
                      Choose a contact option below.
                    </p>

                  </div>

                  <div className="contact-icon-float flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#dcefe6] text-[#008765]">
                    <Icon name="message" size={20} />
                  </div>
                </div>

                <div className="mt-5 space-y-3">

                  {contactItems.map((item, index) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className={`contact-item contact-item-${index} group flex items-center gap-3 rounded-2xl border border-[#dceae3] bg-[#f5faf7] p-3.5 transition duration-300 hover:-translate-y-1 hover:border-[#91c5ad] hover:bg-white hover:shadow-[0_10px_24px_rgba(20,70,50,0.08)]`}
                    >

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#dcefe6] text-[#008765] transition duration-300 group-hover:scale-105 group-hover:bg-[#008765] group-hover:text-white">
                        <Icon name={item.icon} size={19} />
                      </div>

                      <div className="min-w-0">

                        <p className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-[#82968c]">
                          {item.label}
                        </p>

                        <p className="mt-1 truncate text-[13px] font-black text-[#163028]">
                          {item.value}
                        </p>

                        <p className="mt-0.5 text-[9px] font-medium text-[#82938b]">
                          {item.description}
                        </p>

                      </div>

                      <span className="ml-auto text-[#94aea2] transition duration-300 group-hover:translate-x-1 group-hover:text-[#008765]">
                        <Icon name="arrow" size={15} />
                      </span>

                    </a>
                  ))}
                </div>

                <div className="contact-help-box mt-4 flex items-center gap-3 rounded-2xl bg-[#e0f1e8] px-4 py-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#008765] text-white transition duration-300 hover:scale-110">
                    <Icon name="clock" size={17} />
                  </div>

                  <div>

                    <p className="text-[10px] font-black text-[#163028]">
                      Need booking help?
                    </p>

                    <p className="mt-0.5 text-[9px] font-medium text-[#71857c]">
                      Call or message our reservation team.
                    </p>

                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CONTACT + FORM
      ========================================================== */}

      <section className="bg-[#e4f2eb] px-5 py-12 sm:px-8 sm:py-14 lg:px-10 lg:py-16">

        <div className="mx-auto max-w-[1380px]">

          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">

            <div className="contact-section-left">

              <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#008765]">
                Need Assistance
              </p>

              <h2 className="mt-3 text-3xl font-black leading-[1.05] tracking-[-0.055em] text-[#10251d] sm:text-[40px]">

                We&apos;re ready to

                <span className="block text-[#008765]">
                  help.
                </span>

              </h2>

              <p className="mt-4 max-w-[430px] text-[13px] font-medium leading-7 text-[#718079]">
                Contact us for route information, reservation
                assistance, schedules or general enquiries.
              </p>

              <div className="mt-7 space-y-3">

                {contactItems.map((item, index) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className={`contact-info-card contact-info-card-${index} group flex items-center gap-4 rounded-[18px] border border-[#cddfd6] bg-white p-4 shadow-[0_7px_22px_rgba(15,40,30,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[#91c5ad] hover:shadow-[0_12px_28px_rgba(15,40,30,0.09)]`}
                  >

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#dcefe6] text-[#008765] transition duration-300 group-hover:scale-110 group-hover:bg-[#008765] group-hover:text-white">
                      <Icon name={item.icon} size={20} />
                    </div>

                    <div className="min-w-0">

                      <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#82958c]">
                        {item.label}
                      </p>

                      <p className="mt-1 break-all text-[13px] font-black text-[#163028]">
                        {item.value}
                      </p>

                    </div>

                    <span className="ml-auto text-[#a7bdb3] transition duration-300 group-hover:translate-x-1 group-hover:text-[#008765]">
                      <Icon name="arrow" size={16} />
                    </span>

                  </a>
                ))}
              </div>

              <div className="contact-location mt-4 flex items-center gap-3 rounded-[18px] border border-[#c4ddd0] bg-[#dcefe6] p-4 transition duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(15,40,30,0.08)]">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#008765] text-white transition duration-300 hover:scale-110">
                  <Icon name="location" size={18} />
                </div>

                <div>

                  <p className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-[#71857c]">
                    Service Area
                  </p>

                  <p className="mt-1 text-[12px] font-black text-[#163028]">
                    Bahawalpur, Punjab, Pakistan
                  </p>

                </div>
              </div>
            </div>

            {/* FORM */}

            <div className="contact-form-card rounded-[24px] border border-[#cedfd7] bg-white p-6 shadow-[0_15px_40px_rgba(15,40,30,0.07)] sm:p-8">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#008765]">
                    Send A Message
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-[-0.045em] text-[#10251d] sm:text-3xl">
                    How can we help?
                  </h2>

                  <p className="mt-2 max-w-[580px] text-xs font-medium leading-6 text-[#718079]">
                    Send us your question and our reservation team can
                    assist you.
                  </p>

                </div>

                <div className="contact-mail-icon hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#dcefe6] text-[#008765] sm:flex">
                  <Icon name="mail" size={19} />
                </div>

              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-7 space-y-4"
              >

                <div className="grid gap-4 sm:grid-cols-2">

                  <label className="block">

                    <span className="text-[10px] font-extrabold text-[#42554c]">
                      Your Name
                    </span>

                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Enter your name"
                      className="mt-2 h-11 w-full rounded-xl border border-[#d4e2db] bg-[#f5faf7] px-4 text-xs font-semibold text-[#10251d] outline-none transition placeholder:text-[#9baaa4] focus:border-[#008765] focus:bg-white focus:ring-4 focus:ring-[#008765]/10"
                    />

                  </label>

                  <label className="block">

                    <span className="text-[10px] font-extrabold text-[#42554c]">
                      Email Address
                    </span>

                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="Enter your email"
                      className="mt-2 h-11 w-full rounded-xl border border-[#d4e2db] bg-[#f5faf7] px-4 text-xs font-semibold text-[#10251d] outline-none transition placeholder:text-[#9baaa4] focus:border-[#008765] focus:bg-white focus:ring-4 focus:ring-[#008765]/10"
                    />

                  </label>

                </div>

                <label className="block">

                  <span className="text-[10px] font-extrabold text-[#42554c]">
                    Phone Number
                  </span>

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    className="mt-2 h-11 w-full rounded-xl border border-[#d4e2db] bg-[#f5faf7] px-4 text-xs font-semibold text-[#10251d] outline-none transition placeholder:text-[#9baaa4] focus:border-[#008765] focus:bg-white focus:ring-4 focus:ring-[#008765]/10"
                  />

                </label>

                <label className="block">

                  <span className="text-[10px] font-extrabold text-[#42554c]">
                    Subject
                  </span>

                  <select
                    name="subject"
                    defaultValue=""
                    className="mt-2 h-11 w-full rounded-xl border border-[#d4e2db] bg-[#f5faf7] px-4 text-xs font-semibold text-[#10251d] outline-none transition focus:border-[#008765] focus:bg-white focus:ring-4 focus:ring-[#008765]/10"
                  >

                    <option value="" disabled>
                      Select an enquiry type
                    </option>

                    <option value="route">
                      Route Information
                    </option>

                    <option value="booking">
                      Booking Assistance
                    </option>

                    <option value="schedule">
                      Schedule Information
                    </option>

                    <option value="general">
                      General Enquiry
                    </option>

                  </select>

                </label>

                <label className="block">

                  <span className="text-[10px] font-extrabold text-[#42554c]">
                    Message
                  </span>

                  <textarea
                    name="message"
                    required
                    rows={4}
                    placeholder="Write your message..."
                    className="mt-2 w-full resize-none rounded-xl border border-[#d4e2db] bg-[#f5faf7] px-4 py-3 text-xs font-semibold leading-6 text-[#10251d] outline-none transition placeholder:text-[#9baaa4] focus:border-[#008765] focus:bg-white focus:ring-4 focus:ring-[#008765]/10"
                  />

                </label>

                <button
                  type="submit"
                  className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#008765] px-6 text-xs font-extrabold text-white shadow-[0_9px_22px_rgba(0,135,101,0.18)] transition duration-300 hover:-translate-y-1 hover:bg-[#009b73] hover:shadow-[0_13px_28px_rgba(0,135,101,0.25)]"
                >

                  {submitted
                    ? "Message Ready ✓"
                    : "Send Message"}

                  {!submitted && (
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      <Icon name="arrow" size={15} />
                    </span>
                  )}

                </button>

                {submitted && (
                  <div className="contact-success flex items-center gap-2 rounded-xl border border-[#b8dfcc] bg-[#e6f5ed] px-4 py-3 text-[10px] font-bold text-[#08704f]">

                    <Icon name="check" size={16} />

                    Thank you. Your message has been prepared
                    successfully.

                  </div>
                )}

              </form>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          QUICK ACTIONS
      ========================================================== */}

      <section className="bg-[#dcefe6] px-5 pb-12 sm:px-8 lg:px-10">

        <div className="mx-auto max-w-[1380px]">

          <div className="contact-quick-actions flex flex-col gap-5 rounded-[22px] border border-[#c2ddd0] bg-[#cfe9dc] px-6 py-6 shadow-[0_8px_25px_rgba(15,40,30,0.05)] sm:flex-row sm:items-center sm:justify-between sm:px-7">

            <div>

              <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#008765]">
                Continue Your Journey
              </p>

              <h2 className="mt-1 text-xl font-black tracking-[-0.04em] text-[#10251d]">
                Ready to book your seat?
              </h2>

              <p className="mt-1 text-[10px] font-medium text-[#718079]">
                Explore routes, make a booking or check your
                reservation.
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              <Link
                href="/routes"
                className="group inline-flex h-10 items-center gap-2 rounded-xl border border-[#aecfbe] bg-white px-4 text-[10px] font-extrabold text-[#008765] transition duration-300 hover:-translate-y-1 hover:border-[#008765] hover:shadow-[0_8px_18px_rgba(15,40,30,0.08)]"
              >
                Explore Routes

                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  <Icon name="arrow" size={13} />
                </span>
              </Link>

              <Link
                href="/booking"
                className="group inline-flex h-10 items-center gap-2 rounded-xl bg-[#008765] px-4 text-[10px] font-extrabold text-white transition duration-300 hover:-translate-y-1 hover:bg-[#009b73] hover:shadow-[0_9px_20px_rgba(0,135,101,0.22)]"
              >
                Book Now

                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  <Icon name="ticket" size={13} />
                </span>
              </Link>

              <Link
                href="/booking-status"
                className="group inline-flex h-10 items-center gap-2 rounded-xl border border-[#aecfbe] bg-white px-4 text-[10px] font-extrabold text-[#008765] transition duration-300 hover:-translate-y-1 hover:border-[#008765] hover:shadow-[0_8px_18px_rgba(15,40,30,0.08)]"
              >
                Booking Status

                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  <Icon name="arrow" size={13} />
                </span>
              </Link>

            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
          DARK GREEN - CLEAR TEXT + LOGO
      ========================================================== */}

      <footer className="relative overflow-hidden border-t border-[#214b3d] bg-[#061b14] text-white">

        {/* Animated footer glow */}

        <div className="footer-glow absolute -right-28 -top-28 h-72 w-72 rounded-full bg-[#008765]/20 blur-3xl" />

        <div className="footer-glow-delay absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-[#43c98f]/10 blur-3xl" />

        <div className="footer-dot absolute right-[20%] top-10 h-2 w-2 rounded-full bg-[#55d89e]/50" />

        <div className="footer-dot-delay absolute bottom-16 left-[15%] h-2 w-2 rounded-full bg-[#55d89e]/30" />

        <div className="relative mx-auto max-w-[1380px] px-5 py-8 sm:px-8 lg:px-10">

          {/* TOP FOOTER */}

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            {/* BRAND */}

            <Link
              href="/"
              className="group flex items-center gap-3"
            >

              <div className="relative h-[58px] w-[68px] shrink-0 rounded-xl border border-white/10 bg-white/[0.06] p-1 shadow-[0_8px_20px_rgba(0,0,0,0.18)] transition duration-500 group-hover:-translate-y-1 group-hover:border-[#55d89e]/40 group-hover:bg-white/[0.09] group-hover:rotate-1">

                <Image
                  src="/images/tdcp-logo.png.jpeg.jpeg.png"
                  alt="TDCP Logo"
                  fill
                  sizes="68px"
                  className="object-contain p-1"
                  priority
                />

              </div>

              <div>

                <p className="text-[15px] font-black leading-tight text-white">
                  Bahawalpur Double-Decker Bus
                </p>

                <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#55d89e]">
                  TDCP Reservation System
                </p>

                <p className="mt-1 text-[8px] font-medium text-white/45">
                  Bahawalpur, Punjab, Pakistan
                </p>

              </div>

            </Link>

            {/* FOOTER NAV */}

            <nav className="flex flex-wrap items-center gap-x-5 gap-y-3 text-[10px] font-bold">

              <Link
                href="/"
                className="footer-link text-white/70 transition duration-300 hover:-translate-y-0.5 hover:text-white"
              >
                Home
              </Link>

              <Link
                href="/routes"
                className="footer-link text-white/70 transition duration-300 hover:-translate-y-0.5 hover:text-white"
              >
                Routes
              </Link>

              <Link
                href="/about"
                className="footer-link text-white/70 transition duration-300 hover:-translate-y-0.5 hover:text-white"
              >
                About
              </Link>

              <Link
                href="/why-choose-us"
                className="footer-link text-white/70 transition duration-300 hover:-translate-y-0.5 hover:text-white"
              >
                Why Choose Us
              </Link>

              <Link
                href="/how-it-works"
                className="footer-link text-white/70 transition duration-300 hover:-translate-y-0.5 hover:text-white"
              >
                How It Works
              </Link>

              <Link
                href="/booking-status"
                className="footer-link text-white/70 transition duration-300 hover:-translate-y-0.5 hover:text-white"
              >
                Booking Status
              </Link>

              <Link
                href="/contact"
                className="font-extrabold text-[#55d89e]"
              >
                Contact
              </Link>

            </nav>

            {/* CONTACT ICONS */}

            <div className="flex items-center gap-2">

              <a
                href="tel:0622501932"
                aria-label="Call phone"
                className="footer-contact-icon flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-white shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition duration-300 hover:-translate-y-1 hover:border-[#55d89e]/60 hover:bg-[#008765] hover:text-white"
              >
                <Icon name="phone" size={16} />
              </a>

              <a
                href="tel:03057877304"
                aria-label="Call mobile"
                className="footer-contact-icon flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-white shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition duration-300 hover:-translate-y-1 hover:border-[#55d89e]/60 hover:bg-[#008765] hover:text-white"
              >
                <Icon name="mobile" size={16} />
              </a>

              <a
                href="mailto:Tdcpmultan@gmail.com"
                aria-label="Send email"
                className="footer-contact-icon flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-white shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition duration-300 hover:-translate-y-1 hover:border-[#55d89e]/60 hover:bg-[#008765] hover:text-white"
              >
                <Icon name="mail" size={16} />
              </a>

            </div>
          </div>

          {/* FOOTER DIVIDER */}

          <div className="mt-7 border-t border-white/10 pt-5">

            <div className="flex flex-col gap-2 text-[9px] font-medium text-white/60 sm:flex-row sm:items-center sm:justify-between">

              <p>
                © 2026 Bahawalpur Double-Decker Bus Reservation
                System
              </p>

              <p>
                TDCP • Bahawalpur, Punjab, Pakistan
              </p>

            </div>

            <p className="mt-3 text-center text-[9px] font-semibold text-white/65">
              Developed by Naina Nayab &amp; Imran Mansha
            </p>

          </div>

        </div>
      </footer>

      {/* =========================================================
          DYNAMIC ANIMATION CSS
      ========================================================== */}

      <style jsx>{`
        .contact-orbit {
          animation: contactOrbit 12s ease-in-out infinite;
        }

        .contact-orbit-reverse {
          animation: contactOrbitReverse 14s ease-in-out infinite;
        }

        .contact-floating-dot {
          animation: floatingDot 5s ease-in-out infinite;
        }

        .contact-floating-dot-delay {
          animation: floatingDot 6s ease-in-out 1s infinite;
        }

        .contact-fade-down {
          animation: fadeDown 0.8s ease-out both;
        }

        .contact-fade-left {
          animation: fadeLeft 0.9s ease-out 0.1s both;
        }

        .contact-fade-right {
          animation: fadeRight 0.9s ease-out 0.2s both;
        }

        .contact-title-float {
          animation: titleFloat 4s ease-in-out 1s infinite;
        }

        .contact-card {
          animation: cardFloat 5s ease-in-out 1s infinite;
        }

        .contact-icon-float {
          animation: iconFloat 3s ease-in-out infinite;
        }

        .contact-item-0 {
          animation: itemReveal 0.7s ease-out 0.35s both;
        }

        .contact-item-1 {
          animation: itemReveal 0.7s ease-out 0.48s both;
        }

        .contact-item-2 {
          animation: itemReveal 0.7s ease-out 0.61s both;
        }

        .contact-help-box {
          animation: itemReveal 0.7s ease-out 0.74s both;
        }

        .contact-trust-item {
          animation: trustPulse 4s ease-in-out infinite;
        }

        .contact-delay-1 {
          animation-delay: 0.7s;
        }

        .contact-delay-2 {
          animation-delay: 1.4s;
        }

        .contact-section-left {
          animation: fadeLeft 0.8s ease-out both;
        }

        .contact-form-card {
          animation: fadeRight 0.8s ease-out 0.15s both;
        }

        .contact-info-card-0 {
          animation: itemReveal 0.7s ease-out 0.15s both;
        }

        .contact-info-card-1 {
          animation: itemReveal 0.7s ease-out 0.28s both;
        }

        .contact-info-card-2 {
          animation: itemReveal 0.7s ease-out 0.41s both;
        }

        .contact-location {
          animation: itemReveal 0.7s ease-out 0.54s both;
        }

        .contact-mail-icon {
          animation: iconFloat 3.5s ease-in-out infinite;
        }

        .contact-success {
          animation: successIn 0.45s ease-out both;
        }

        .contact-quick-actions {
          animation: quickFloat 5s ease-in-out infinite;
        }

        .footer-glow {
          animation: footerGlow 10s ease-in-out infinite;
        }

        .footer-glow-delay {
          animation: footerGlowReverse 12s ease-in-out infinite;
        }

        .footer-dot {
          animation: floatingDot 5s ease-in-out infinite;
        }

        .footer-dot-delay {
          animation: floatingDot 6s ease-in-out 1s infinite;
        }

        @keyframes contactOrbit {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(-35px, 25px, 0) scale(1.08);
          }
        }

        @keyframes contactOrbitReverse {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(40px, -20px, 0) scale(1.06);
          }
        }

        @keyframes floatingDot {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
            opacity: 0.35;
          }

          50% {
            transform: translate3d(0, -18px, 0);
            opacity: 0.8;
          }
        }

        @keyframes fadeDown {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes titleFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-4px);
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
            transform: translateY(-5px) rotate(2deg);
          }
        }

        @keyframes itemReveal {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes trustPulse {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-2px);
          }
        }

        @keyframes successIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes quickFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes footerGlow {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(-25px, 20px, 0) scale(1.08);
          }
        }

        @keyframes footerGlowReverse {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(30px, -15px, 0) scale(1.06);
          }
        }

        .nav-link {
          position: relative;
        }

        .nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -7px;
          width: 0;
          height: 1.5px;
          border-radius: 999px;
          background: #55d89e;
          transition: width 0.3s ease;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .footer-link {
          position: relative;
        }

        .footer-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -4px;
          width: 0;
          height: 1px;
          border-radius: 999px;
          background: #55d89e;
          transition: width 0.3s ease;
        }

        .footer-link:hover::after {
          width: 100%;
        }

        .footer-contact-icon {
          animation: footerIconFloat 4s ease-in-out infinite;
        }

        .footer-contact-icon:nth-child(2) {
          animation-delay: 0.25s;
        }

        .footer-contact-icon:nth-child(3) {
          animation-delay: 0.5s;
        }

        @keyframes footerIconFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-2px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .contact-orbit,
          .contact-orbit-reverse,
          .contact-floating-dot,
          .contact-floating-dot-delay,
          .contact-fade-down,
          .contact-fade-left,
          .contact-fade-right,
          .contact-title-float,
          .contact-card,
          .contact-icon-float,
          .contact-item-0,
          .contact-item-1,
          .contact-item-2,
          .contact-help-box,
          .contact-trust-item,
          .contact-section-left,
          .contact-form-card,
          .contact-info-card-0,
          .contact-info-card-1,
          .contact-info-card-2,
          .contact-location,
          .contact-mail-icon,
          .contact-success,
          .contact-quick-actions,
          .footer-glow,
          .footer-glow-delay,
          .footer-dot,
          .footer-dot-delay,
          .footer-contact-icon {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  );
}