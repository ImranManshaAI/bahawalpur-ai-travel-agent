"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type Benefit = {
  number: string;
  title: string;
  description: string;
  label: string;
  icon: ReactNode;
  position: string;
  animationDelay: string;
};

function BusIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="3"
        width="16"
        height="16"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M7 7h10M7 11h10M7 15h3M14 15h3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="8" cy="20" r="1.5" fill="currentColor" />
      <circle cx="16" cy="20" r="1.5" fill="currentColor" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 10.8 12 4l8.5 6.8v8.7a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-5v6H5a1.5 1.5 0 0 1-1.5-1.5v-8.7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12h13M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="m10 8.7 5 3.3-5 3.3V8.7Z" fill="currentColor" />
    </svg>
  );
}

function SeatIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 5.5a2 2 0 0 1 2-2h2.2a2 2 0 0 1 2 2v4.2a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5 12v3.2a2.8 2.8 0 0 0 2.8 2.8H17a2 2 0 0 0 2-2v-.5H9.2A4.2 4.2 0 0 1 5 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8 20h9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15.5"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M7 3.5v4M17 3.5v4M3.5 9h17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M7.5 13h2M12 13h2M16.5 13h.1M7.5 16.5h2M12 16.5h2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3.5 19 6v5.2c0 4.5-2.8 7.9-7 9.3-4.2-1.4-7-4.8-7-9.3V6l7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m8.8 12 2.1 2.1 4.4-4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExploreIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m4 18 5.8-7 3.3 3.5 2.7-3.2L20 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 20h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle
        cx="16.7"
        cy="7"
        r="1.6"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 10.5c0 5-8 10-8 10s-8-5-8-10a8 8 0 1 1 16 0Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle
        cx="12"
        cy="10.5"
        r="2.4"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7.2 4.5 9.5 3l2.2 5-2 1.3c.9 1.9 2.1 3.1 4 4l1.3-2 5 2.2-1.5 2.3c-.6.9-1.6 1.4-2.7 1.3-6.1-.6-10.8-5.3-11.4-11.4-.1-1.1.4-2.1 1.3-2.7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="5"
        width="17"
        height="14"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m5 7 7 5 7-5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BenefitCard({
  benefit,
}: {
  benefit: Benefit;
}) {
  return (
    <article
      className={`benefit-card ${benefit.position}`}
      style={{
        animationDelay: benefit.animationDelay,
      }}
    >
      <div className="benefit-top">
        <div className="benefit-icon">{benefit.icon}</div>

        <span className="benefit-number">{benefit.number}</span>
      </div>

      <h3>{benefit.title}</h3>

      <p>{benefit.description}</p>

      <div className="benefit-bottom">
        <span />
        <small>{benefit.label}</small>
      </div>
    </article>
  );
}

const benefits: Benefit[] = [
  {
    number: "01",
    title: "Comfortable Travel",
    description:
      "Enjoy a comfortable sightseeing experience throughout your journey.",
    label: "RELAX & EXPLORE",
    icon: <SeatIcon />,
    position: "card-comfort",
    animationDelay: "0s",
  },
  {
    number: "02",
    title: "Easy Booking",
    description:
      "Select your route, schedule and seat through a simple online process.",
    label: "BOOK IN MINUTES",
    icon: <CalendarIcon />,
    position: "card-easy",
    animationDelay: "0.8s",
  },
  {
    number: "03",
    title: "Safe & Secure",
    description:
      "A reliable reservation experience designed around passenger safety.",
    label: "YOUR SAFETY FIRST",
    icon: <ShieldIcon />,
    position: "card-secure",
    animationDelay: "1.5s",
  },
  {
    number: "04",
    title: "Explore & Enjoy",
    description:
      "Discover Bahawalpur comfortably while enjoying a unique city journey.",
    label: "DISCOVER BAHAWALPUR",
    icon: <ExploreIcon />,
    position: "card-explore",
    animationDelay: "2.2s",
  },
];

const experienceItems = [
  {
    title: "Comfortable Travel",
    text: "Enjoy a comfortable sightseeing experience throughout your journey.",
    icon: <SeatIcon />,
  },
  {
    title: "Easy Booking",
    text: "Choose your route, schedule and seat through a simple online process.",
    icon: <CalendarIcon />,
  },
  {
    title: "Safe & Secure",
    text: "A reliable reservation experience designed around passenger safety.",
    icon: <ShieldIcon />,
  },
  {
    title: "Explore & Enjoy",
    text: "Discover Bahawalpur comfortably while enjoying a unique city journey.",
    icon: <ExploreIcon />,
  },
];

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Routes", href: "/routes" },
  { label: "Booking", href: "/booking" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Contact", href: "/contact" },
];

export default function WhyChooseUsPage() {
  const currentYear = new Date().getFullYear();

  return (
    <main className="why-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        .why-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 50% 18%,
              rgba(16, 185, 129, 0.09),
              transparent 32%
            ),
            linear-gradient(
              180deg,
              #f8fffb 0%,
              #eefaf5 48%,
              #f9fffc 100%
            );
          color: #123f32;
          overflow-x: hidden;
        }

        .site-shell {
          width: min(1180px, calc(100% - 48px));
          margin: 0 auto;
        }

        /* =========================
           NAVBAR
        ========================= */

        .top-nav {
          position: relative;
          z-index: 20;
          margin-top: 22px;
          min-height: 76px;
          padding: 11px 15px 11px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(19, 100, 75, 0.13);
          border-radius: 19px;
          box-shadow:
            0 10px 28px rgba(17, 83, 62, 0.055),
            0 2px 7px rgba(17, 83, 62, 0.025);
          backdrop-filter: blur(14px);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
          color: inherit;
          text-decoration: none;
        }

        .brand-mark {
          width: 48px;
          height: 48px;
          flex: 0 0 48px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: #078b4f;
          color: #ffffff;
          box-shadow: 0 7px 17px rgba(7, 139, 79, 0.18);
        }

        .brand-copy {
          display: flex;
          flex-direction: column;
          line-height: 1;
        }

        .brand-name {
          color: #123f32;
          font-size: 17px;
          font-weight: 850;
          letter-spacing: -0.035em;
        }

        .brand-subtitle {
          margin-top: 6px;
          color: #649486;
          font-size: 8px;
          font-weight: 850;
          letter-spacing: 0.22em;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-link {
          min-height: 40px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px;
          border: 1px solid transparent;
          border-radius: 10px;
          color: #567d70;
          font-size: 12px;
          font-weight: 750;
          text-decoration: none;
          transition: 180ms ease;
        }

        .nav-link:hover {
          color: #078f4e;
          background: #f2fbf6;
          border-color: rgba(7, 143, 78, 0.12);
        }

        .home-link {
          min-height: 40px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px 0 7px;
          border: 1px solid rgba(7, 139, 79, 0.17);
          border-radius: 11px;
          background: #f7fcf9;
          color: #174d3b;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
          transition: 180ms ease;
        }

        .home-link:hover {
          background: #078b4f;
          border-color: #078b4f;
          color: #ffffff;
          transform: translateY(-1px);
        }

        .home-icon {
          width: 29px;
          height: 29px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: #078b4f;
          color: #ffffff;
          transition: 180ms ease;
        }

        .home-link:hover .home-icon {
          background: rgba(255, 255, 255, 0.17);
        }

        /* =========================
           HERO
        ========================= */

        .hero {
          text-align: center;
          padding: 58px 0 25px;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          color: #078f4e;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.25em;
          text-transform: uppercase;
        }

        .eyebrow::before,
        .eyebrow::after {
          content: "";
          width: 42px;
          height: 1.5px;
          border-radius: 999px;
          background: #078f4e;
        }

        /*
          The large "Designed for a better journey"
          heading has intentionally been removed.
        */

        .hero-description {
          max-width: 670px;
          margin: 18px auto 0;
          color: #6d9185;
          font-size: 14px;
          line-height: 1.65;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          margin-top: 21px;
        }

        .primary-action,
        .secondary-action {
          min-height: 43px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 10px;
          padding: 0 15px;
          font-size: 11px;
          font-weight: 850;
          text-decoration: none;
          transition: 180ms ease;
        }

        .primary-action {
          background: #078f4e;
          color: #ffffff;
          box-shadow: 0 8px 19px rgba(7, 143, 78, 0.17);
        }

        .primary-action:hover {
          background: #057a42;
          transform: translateY(-2px);
          box-shadow: 0 11px 24px rgba(7, 143, 78, 0.22);
        }

        .secondary-action {
          border: 1px solid rgba(16, 86, 65, 0.13);
          background: #ffffff;
          color: #174d3b;
        }

        .secondary-action:hover {
          border-color: rgba(7, 143, 78, 0.3);
          background: #f2fbf6;
          transform: translateY(-2px);
        }

        /* =========================
           JOURNEY
        ========================= */

        .journey-section {
          position: relative;
          min-height: 510px;
          margin-top: 0;
        }

        .journey-label {
          position: absolute;
          top: 6px;
          left: 50%;
          z-index: 8;
          transform: translateX(-50%);
          padding: 6px 11px;
          border: 1px solid rgba(7, 143, 78, 0.13);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.84);
          color: #6a9485;
          font-size: 8px;
          font-weight: 850;
          letter-spacing: 0.17em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .journey-stage {
          position: absolute;
          left: 50%;
          top: 55px;
          width: 440px;
          height: 370px;
          transform: translateX(-50%);
        }

        .circle-one,
        .circle-two,
        .circle-three {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
        }

        .circle-one {
          width: 332px;
          height: 332px;
          border: 1px solid rgba(7, 143, 78, 0.1);
          animation: circlePulse 5s ease-in-out infinite;
        }

        .circle-two {
          width: 270px;
          height: 270px;
          border: 1px dashed rgba(7, 143, 78, 0.17);
          animation: circleRotate 18s linear infinite;
        }

        .circle-three {
          width: 210px;
          height: 210px;
          border: 1px solid rgba(7, 143, 78, 0.07);
          background: rgba(7, 143, 78, 0.025);
          animation: circlePulseSmall 4s ease-in-out infinite;
        }

        /* =========================
           CENTRAL BUS CARD
        ========================= */

        .bus-card {
          position: absolute;
          z-index: 4;
          left: 50%;
          top: 50%;
          width: 338px;
          height: 202px;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(7, 143, 78, 0.16);
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.95);
          box-shadow:
            0 20px 42px rgba(20, 84, 62, 0.095),
            0 4px 11px rgba(20, 84, 62, 0.04);
          animation: busFloat 4.5s ease-in-out infinite;
        }

        .bus-roof-line {
          width: 175px;
          height: 2px;
          margin-bottom: 12px;
          border-radius: 999px;
          background: #bcebd4;
          animation: roofLinePulse 3s ease-in-out infinite;
        }

        .bus {
          position: relative;
          width: 200px;
          height: 88px;
          border-radius: 17px 19px 12px 12px;
          background: linear-gradient(
            180deg,
            #19ad61 0%,
            #058d4c 100%
          );
          box-shadow: 0 12px 21px rgba(4, 120, 65, 0.17);
          animation: busBodyFloat 3.8s ease-in-out infinite;
        }

        .bus::before {
          content: "";
          position: absolute;
          left: 10px;
          right: 10px;
          top: 10px;
          height: 31px;
          border-radius: 7px;
          background:
            linear-gradient(
              90deg,
              #d9f5e8 0 18%,
              transparent 18% 20%,
              #d9f5e8 20% 38%,
              transparent 38% 40%,
              #d9f5e8 40% 58%,
              transparent 58% 60%,
              #d9f5e8 60% 78%,
              transparent 78% 80%,
              #d9f5e8 80% 100%
            );
        }

        .bus::after {
          content: "";
          position: absolute;
          left: 10px;
          right: 10px;
          bottom: 11px;
          height: 25px;
          border-radius: 6px;
          background:
            linear-gradient(
              90deg,
              #d9f5e8 0 24%,
              transparent 24% 26%,
              #d9f5e8 26% 49%,
              transparent 49% 51%,
              #d9f5e8 51% 74%,
              transparent 74% 76%,
              #d9f5e8 76% 100%
            );
        }

        .bus-front {
          position: absolute;
          right: -3px;
          top: 21px;
          width: 19px;
          height: 47px;
          border-radius: 4px 12px 9px 4px;
          background: #087c46;
        }

        .bus-wheel {
          position: absolute;
          z-index: 5;
          bottom: -10px;
          width: 27px;
          height: 27px;
          border-radius: 50%;
          background: #173e34;
          border: 5px solid #ffffff;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
          animation: wheelPulse 2.2s ease-in-out infinite;
        }

        .bus-wheel-left {
          left: 27px;
        }

        .bus-wheel-right {
          right: 27px;
          animation-delay: 0.5s;
        }

        .bus-name {
          margin-top: 13px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 11px;
          border: 1px solid rgba(7, 143, 78, 0.13);
          border-radius: 999px;
          background: #f6fcf9;
          color: #087a47;
          font-size: 8px;
          font-weight: 850;
          letter-spacing: 0.1em;
        }

        .bus-name-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #079f52;
          animation: nameDotPulse 1.5s ease-in-out infinite;
        }

        /* =========================
           MOVING DOTTED LINES
        ========================= */

        .connector {
          position: absolute;
          z-index: 1;
          height: 2px;
          border: 0;
          background:
            repeating-linear-gradient(
              90deg,
              rgba(7, 143, 78, 0.55) 0 5px,
              transparent 5px 11px
            );
          transform-origin: left center;
          animation: lineFlow 1.7s linear infinite;
        }

        .connector-left-top {
          left: calc(50% - 425px);
          top: 157px;
          width: 205px;
          transform: rotate(18deg);
        }

        .connector-right-top {
          left: calc(50% + 220px);
          top: 157px;
          width: 205px;
          transform: rotate(-18deg);
          animation-delay: 0.35s;
        }

        .connector-left-bottom {
          left: calc(50% - 425px);
          top: 355px;
          width: 205px;
          transform: rotate(-18deg);
          animation-delay: 0.7s;
        }

        .connector-right-bottom {
          left: calc(50% + 220px);
          top: 355px;
          width: 205px;
          transform: rotate(18deg);
          animation-delay: 1.05s;
        }

        .connector-dot {
          position: absolute;
          z-index: 2;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #74d5a7;
          box-shadow:
            0 0 0 4px rgba(116, 213, 167, 0.1),
            0 0 12px rgba(116, 213, 167, 0.35);
          animation: dotMove 2.8s ease-in-out infinite;
        }

        .dot-left-top {
          left: calc(50% - 225px);
          top: 128px;
        }

        .dot-right-top {
          left: calc(50% + 218px);
          top: 128px;
          animation-delay: 0.5s;
        }

        .dot-left-bottom {
          left: calc(50% - 225px);
          top: 341px;
          animation-delay: 1s;
        }

        .dot-right-bottom {
          left: calc(50% + 218px);
          top: 341px;
          animation-delay: 1.5s;
        }

        /* =========================
           BENEFIT CARDS
        ========================= */

        .benefit-card {
          position: absolute;
          z-index: 7;
          width: 220px;
          min-height: 143px;
          padding: 15px 16px 13px;
          border: 1px solid rgba(7, 143, 78, 0.15);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.95);
          box-shadow:
            0 12px 28px rgba(20, 84, 62, 0.075),
            0 2px 8px rgba(20, 84, 62, 0.03);
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease;
          animation: cardFloat 4.8s ease-in-out infinite;
          will-change: transform;
        }

        .benefit-card:hover {
          transform: translateY(-7px) scale(1.015);
          border-color: rgba(7, 143, 78, 0.27);
          box-shadow:
            0 17px 34px rgba(20, 84, 62, 0.105),
            0 4px 10px rgba(20, 84, 62, 0.045);
        }

        .card-comfort {
          left: 0;
          top: 83px;
        }

        .card-explore {
          right: 0;
          top: 83px;
        }

        .card-easy {
          left: 48px;
          top: 326px;
        }

        .card-secure {
          right: 48px;
          top: 326px;
        }

        .benefit-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .benefit-icon {
          width: 37px;
          height: 37px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #e4f8ee;
          color: #078f4e;
          transition:
            transform 220ms ease,
            background 220ms ease;
        }

        .benefit-card:hover .benefit-icon {
          transform: translateY(-2px) rotate(-3deg);
          background: #d7f5e6;
        }

        .benefit-number {
          color: #8ba99f;
          font-size: 8px;
          font-weight: 850;
          letter-spacing: 0.1em;
        }

        .benefit-card h3 {
          margin: 11px 0 5px;
          color: #123f32;
          font-size: 13px;
          font-weight: 850;
          letter-spacing: -0.02em;
        }

        .benefit-card p {
          margin: 0;
          color: #78958b;
          font-size: 9px;
          line-height: 1.55;
        }

        .benefit-bottom {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 12px;
        }

        .benefit-bottom span {
          width: 17px;
          height: 1px;
          background: #0a9a54;
          transition: width 220ms ease;
        }

        .benefit-card:hover .benefit-bottom span {
          width: 27px;
        }

        .benefit-bottom small {
          color: #079653;
          font-size: 6.5px;
          font-weight: 900;
          letter-spacing: 0.075em;
        }

        /* =========================
           EXPERIENCE
        ========================= */

        .experience-section {
          padding: 0 0 58px;
        }

        .section-rule {
          width: 100%;
          height: 1px;
          margin-bottom: 29px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(7, 143, 78, 0.18),
            transparent
          );
        }

        .experience-heading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 17px;
        }

        .experience-eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 7px;
          color: #079653;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .experience-eyebrow::before {
          content: "";
          width: 25px;
          height: 2px;
          border-radius: 999px;
          background: #079653;
        }

        .experience-title {
          max-width: 500px;
          margin: 0;
          color: #123f32;
          font-size: clamp(29px, 4vw, 43px);
          line-height: 1;
          letter-spacing: -0.055em;
          font-weight: 900;
        }

        .experience-title span {
          color: #079f52;
        }

        .experience-copy {
          max-width: 420px;
          margin: 0;
          color: #719187;
          font-size: 11px;
          line-height: 1.65;
        }

        .experience-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .experience-card {
          min-height: 145px;
          padding: 14px;
          border: 1px solid rgba(7, 143, 78, 0.13);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.78);
          transition:
            transform 180ms ease,
            border-color 180ms ease,
            box-shadow 180ms ease;
        }

        .experience-card:hover {
          transform: translateY(-3px);
          border-color: rgba(7, 143, 78, 0.22);
          box-shadow: 0 12px 25px rgba(20, 84, 62, 0.06);
        }

        .experience-card-icon {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          margin-bottom: 18px;
          border-radius: 8px;
          background: #e4f8ee;
          color: #078f4e;
        }

        .experience-card h3 {
          margin: 0 0 5px;
          color: #173f33;
          font-size: 11px;
          font-weight: 850;
        }

        .experience-card p {
          margin: 0;
          color: #7a958c;
          font-size: 8.5px;
          line-height: 1.55;
        }

        /* =========================
           FOOTER
        ========================= */

        .site-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          background:
            linear-gradient(
              135deg,
              #075c3c 0%,
              #078b4f 52%,
              #079653 100%
            );
          color: #ffffff;
        }

        .footer-inner {
          width: min(1180px, calc(100% - 48px));
          margin: 0 auto;
          padding: 35px 0 22px;
        }

        .footer-main {
          display: grid;
          grid-template-columns: 1.35fr 1fr 1fr;
          gap: 45px;
          padding-bottom: 27px;
        }

        .footer-brand {
          max-width: 340px;
        }

        .footer-brand-head {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .footer-brand-mark {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.16);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .footer-brand-name {
          color: #ffffff;
          font-size: 14px;
          font-weight: 850;
        }

        .footer-description {
          margin: 0;
          color: rgba(255, 255, 255, 0.76);
          font-size: 10px;
          line-height: 1.65;
        }

        .footer-column h3 {
          margin: 2px 0 12px;
          color: #ffffff;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .footer-links {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 7px;
        }

        .footer-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: rgba(255, 255, 255, 0.76);
          font-size: 10px;
          text-decoration: none;
          transition: 160ms ease;
        }

        .footer-link:hover {
          color: #ffffff;
          transform: translateX(3px);
        }

        .footer-contact {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .footer-contact-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          color: rgba(255, 255, 255, 0.76);
          font-size: 9px;
          line-height: 1.45;
        }

        .footer-contact-icon {
          flex: 0 0 18px;
          color: #ffffff;
        }

        .footer-contact a {
          color: rgba(255, 255, 255, 0.76);
          text-decoration: none;
        }

        .footer-contact a:hover {
          color: #ffffff;
        }

        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding-top: 17px;
          border-top: 1px solid rgba(255, 255, 255, 0.16);
        }

        .footer-bottom p {
          margin: 0;
          color: rgba(255, 255, 255, 0.7);
          font-size: 8.5px;
        }

        .footer-developer {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 8.5px;
          font-weight: 750;
          text-align: right;
        }

        .footer-tag-dot {
          width: 6px;
          height: 6px;
          flex: 0 0 6px;
          border-radius: 50%;
          background: #b7f3d3;
          box-shadow: 0 0 8px rgba(183, 243, 211, 0.6);
          animation: developerDot 1.8s ease-in-out infinite;
        }

        /* =========================
           ANIMATIONS
        ========================= */

        @keyframes cardFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-7px);
          }
        }

        @keyframes busFloat {
          0%,
          100% {
            transform: translate(-50%, -50%);
          }

          50% {
            transform: translate(-50%, calc(-50% - 5px));
          }
        }

        @keyframes busBodyFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes lineFlow {
          0% {
            background-position: 0 0;
          }

          100% {
            background-position: 22px 0;
          }
        }

        @keyframes dotMove {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.75;
          }

          25% {
            transform: translate(4px, -3px) scale(1.18);
            opacity: 1;
          }

          50% {
            transform: translate(8px, 0) scale(1);
            opacity: 0.82;
          }

          75% {
            transform: translate(4px, 3px) scale(1.18);
            opacity: 1;
          }
        }

        @keyframes circleRotate {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }

          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes circlePulse {
          0%,
          100% {
            opacity: 0.7;
            transform: translate(-50%, -50%) scale(1);
          }

          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.025);
          }
        }

        @keyframes circlePulseSmall {
          0%,
          100% {
            opacity: 0.45;
          }

          50% {
            opacity: 0.9;
          }
        }

        @keyframes roofLinePulse {
          0%,
          100% {
            opacity: 0.55;
            transform: scaleX(0.9);
          }

          50% {
            opacity: 1;
            transform: scaleX(1);
          }
        }

        @keyframes wheelPulse {
          0%,
          100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.05);
          }
        }

        @keyframes nameDotPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.75;
          }

          50% {
            transform: scale(1.5);
            opacity: 1;
          }
        }

        @keyframes developerDot {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.7;
          }

          50% {
            transform: scale(1.35);
            opacity: 1;
          }
        }

        /* =========================
           TABLET
        ========================= */

        @media (max-width: 900px) {
          .site-shell {
            width: min(100% - 30px, 680px);
          }

          .hero {
            padding-top: 50px;
          }

          .journey-section {
            min-height: 670px;
          }

          .journey-stage {
            top: 185px;
          }

          .benefit-card {
            width: 200px;
          }

          .card-comfort {
            left: 0;
          }

          .card-explore {
            right: 0;
          }

          .card-easy {
            left: 0;
            top: 490px;
          }

          .card-secure {
            right: 0;
            top: 490px;
          }

          .connector-left-bottom,
          .connector-right-bottom,
          .dot-left-bottom,
          .dot-right-bottom {
            display: none;
          }

          .experience-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .footer-main {
            grid-template-columns: 1fr 1fr;
          }

          .footer-brand {
            grid-column: 1 / -1;
            max-width: 520px;
          }
        }

        /* =========================
           MOBILE
        ========================= */

        @media (max-width: 620px) {
          .site-shell {
            width: min(100% - 22px, 480px);
          }

          .top-nav {
            margin-top: 11px;
            min-height: 67px;
            padding: 9px 10px;
            border-radius: 16px;
          }

          .brand-mark {
            width: 41px;
            height: 41px;
            flex-basis: 41px;
            border-radius: 11px;
          }

          .brand-name {
            font-size: 14px;
          }

          .brand-subtitle {
            margin-top: 5px;
            font-size: 6.5px;
          }

          .nav-link {
            display: none;
          }

          .home-link {
            min-height: 37px;
            padding: 0 7px;
            gap: 0;
            font-size: 0;
          }

          .home-icon {
            width: 29px;
            height: 29px;
          }

          .hero {
            padding: 42px 0 17px;
          }

          .eyebrow {
            font-size: 8px;
            letter-spacing: 0.19em;
          }

          .eyebrow::before,
          .eyebrow::after {
            width: 25px;
          }

          .hero-description {
            margin-top: 16px;
            font-size: 12px;
            line-height: 1.6;
          }

          .hero-actions {
            margin-top: 18px;
            gap: 7px;
          }

          .primary-action,
          .secondary-action {
            min-height: 40px;
            padding: 0 11px;
            font-size: 10px;
          }

          .journey-section {
            min-height: 805px;
          }

          .journey-label {
            top: 175px;
            font-size: 7px;
          }

          .journey-stage {
            top: 235px;
            width: 325px;
            height: 325px;
          }

          .circle-one {
            width: 280px;
            height: 280px;
          }

          .circle-two {
            width: 230px;
            height: 230px;
          }

          .circle-three {
            width: 175px;
            height: 175px;
          }

          .bus-card {
            width: 280px;
            height: 180px;
          }

          .bus {
            transform: scale(0.86);
          }

          .bus-name {
            margin-top: 2px;
          }

          .benefit-card {
            width: calc(50% - 5px);
            min-height: 143px;
            padding: 12px;
          }

          .card-comfort {
            left: 0;
            top: 14px;
          }

          .card-explore {
            right: 0;
            top: 14px;
          }

          .card-easy {
            left: 0;
            top: 575px;
          }

          .card-secure {
            right: 0;
            top: 575px;
          }

          .connector,
          .connector-dot {
            display: none;
          }

          .experience-section {
            padding-bottom: 43px;
          }

          .experience-heading {
            display: block;
          }

          .experience-copy {
            margin-top: 13px;
          }

          .experience-grid {
            grid-template-columns: 1fr;
          }

          .footer-inner {
            width: min(100% - 22px, 480px);
            padding-top: 28px;
          }

          .footer-main {
            grid-template-columns: 1fr;
            gap: 27px;
          }

          .footer-brand {
            grid-column: auto;
          }

          .footer-bottom {
            align-items: flex-start;
            flex-direction: column;
            gap: 10px;
          }

          .footer-developer {
            text-align: left;
          }
        }

        /* =========================
           REDUCED MOTION
        ========================= */

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="site-shell">
        {/* =========================
            NAVBAR
        ========================= */}

        <nav className="top-nav">
          <Link href="/" className="brand" aria-label="BWP Travel home">
            <div className="brand-mark">
              <BusIcon />
            </div>

            <div className="brand-copy">
              <span className="brand-name">BWP Travel</span>
              <span className="brand-subtitle">
                AI TRAVEL AGENT
              </span>
            </div>
          </Link>

          <div className="nav-actions">
            <Link href="/routes" className="nav-link">
              Routes
            </Link>

            <Link href="/booking" className="nav-link">
              Booking
            </Link>

            <Link href="/" className="home-link">
              <span className="home-icon">
                <HomeIcon />
              </span>

              <span>Back to Home</span>
            </Link>
          </div>
        </nav>

        {/* =========================
            HERO
        ========================= */}

        <section className="hero">
          <div className="eyebrow">Why Choose Us</div>

          <p className="hero-description">
            BWP AI Travel Agent makes your journey simple, comfortable
            and convenient — from discovering your route to booking
            your seat.
          </p>

          <div className="hero-actions">
            <Link href="/booking" className="primary-action">
              <SeatIcon />

              <span>Start Booking</span>

              <ArrowRightIcon />
            </Link>

            <Link
              href="/how-it-works"
              className="secondary-action"
            >
              <PlayIcon />

              <span>How It Works</span>
            </Link>
          </div>
        </section>

        {/* =========================
            BUS + BENEFITS
        ========================= */}

        <section className="journey-section">
          <div className="journey-label">
            BWP DOUBLE-DECKER EXPERIENCE
          </div>

          {/* animated dotted connector lines */}

          <div className="connector connector-left-top" />
          <div className="connector connector-right-top" />
          <div className="connector connector-left-bottom" />
          <div className="connector connector-right-bottom" />

          {/* animated dots */}

          <div className="connector-dot dot-left-top" />
          <div className="connector-dot dot-right-top" />
          <div className="connector-dot dot-left-bottom" />
          <div className="connector-dot dot-right-bottom" />

          {/* central bus */}

          <div className="journey-stage">
            <div className="circle-one" />
            <div className="circle-two" />
            <div className="circle-three" />

            <div className="bus-card">
              <div className="bus-roof-line" />

              <div className="bus">
                <div className="bus-front" />

                <div className="bus-wheel bus-wheel-left" />

                <div className="bus-wheel bus-wheel-right" />
              </div>

              <div className="bus-name">
                <span className="bus-name-dot" />

                BWP DOUBLE-DECKER
              </div>
            </div>
          </div>

          {/* dynamic benefit cards */}

          {benefits.map((benefit) => (
            <BenefitCard
              key={benefit.number}
              benefit={benefit}
            />
          ))}
        </section>

        {/* =========================
            EXPERIENCE SECTION
        ========================= */}

        <section className="experience-section">
          <div className="section-rule" />

          <div className="experience-heading">
            <div>
              <div className="experience-eyebrow">
                The BWP Experience
              </div>

              <h2 className="experience-title">
                Everything you need for a{" "}
                <span>better journey.</span>
              </h2>
            </div>

            <p className="experience-copy">
              From comfortable travel to easy online booking, every
              detail is designed around a smoother passenger
              experience.
            </p>
          </div>

          <div className="experience-grid">
            {experienceItems.map((item) => (
              <article
                className="experience-card"
                key={item.title}
              >
                <div className="experience-card-icon">
                  {item.icon}
                </div>

                <h3>{item.title}</h3>

                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* =========================
          GREEN FOOTER
      ========================= */}

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-main">
            <div className="footer-brand">
              <div className="footer-brand-head">
                <div className="footer-brand-mark">
                  <BusIcon />
                </div>

                <span className="footer-brand-name">
                  BWP Travel
                </span>
              </div>

              <p className="footer-description">
                BWP AI Travel Agent provides a simple and convenient way
                to explore Bahawalpur, discover routes and reserve your
                journey online.
              </p>
            </div>

            <div className="footer-column">
              <h3>Quick Links</h3>

              <div className="footer-links">
                {footerLinks.map((link) => (
                  <Link
                    href={link.href}
                    className="footer-link"
                    key={link.label}
                  >
                    <ArrowRightIcon />

                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="footer-column">
              <h3>Contact</h3>

              <div className="footer-contact">
                <div className="footer-contact-item">
                  <span className="footer-contact-icon">
                    <MapPinIcon />
                  </span>

                  <span>
                    Bahawalpur, Punjab, Pakistan
                  </span>
                </div>

                <div className="footer-contact-item">
                  <span className="footer-contact-icon">
                    <PhoneIcon />
                  </span>

                  <a href="tel:0622501932">
                    062-2501932
                  </a>
                </div>

                <div className="footer-contact-item">
                  <span className="footer-contact-icon">
                    <PhoneIcon />
                  </span>

                  <a href="tel:03057877304">
                    0305-7877304
                  </a>
                </div>

                <div className="footer-contact-item">
                  <span className="footer-contact-icon">
                    <MailIcon />
                  </span>

                  <a href="mailto:Tdcpmultan@gmail.com">
                    Tdcpmultan@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>
              © {currentYear} BWP AI Travel Agent. All rights
              reserved.
            </p>

            <div className="footer-developer">
              <span className="footer-tag-dot" />

              <span>
                Developed by Naina Nayab &amp; Imran Mansha
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}