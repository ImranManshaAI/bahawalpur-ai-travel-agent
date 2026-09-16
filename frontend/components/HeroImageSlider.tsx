"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const images = [
  {
    src: "/images/hero-bUs.png.png",
    alt: "TDCP Double Decker Bus",
  },

  {
    src: "/images/dabar-mahal.png.png",
    alt: "Dabar Mahal Bahawalpur",
  },
  {
    src: "/images/ss-world.png.png",
    alt: "SS World Bahawalpur",
  },
  {
    src: "/images/central-library-bahawalpur-2.jpg",
    alt: "Central Library Bahawalpur",
  },
  {
    src: "/images/dha-bahawalpur-1.jpg",
    alt: "DHA Bahawalpur",
  },
  {
    src: "/images/fawara-chowk-bahawalpur-3.jpg",
    alt: "Fawara Chowk Bahawalpur",
  },
  {
    src: "/images/gulzar-e-sadiq-park-1.jpg",
    alt: "Gulzar-e-Sadiq Park",
  },
  {
    src: "/images/gulzar-mahal-2.jpg",
    alt: "Gulzar Mahal Bahawalpur",
  },
];

function ArrowIcon({
  direction,
}: {
  direction: "left" | "right";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "left" ? (
        <path d="m15 18-6-6 6-6" />
      ) : (
        <path d="m9 18 6-6-6-6" />
      )}
    </svg>
  );
}

export default function HeroImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((current) => (current + 1) % images.length);
  };

  const previousSlide = () => {
    setCurrentIndex(
      (current) => (current - 1 + images.length) % images.length
    );
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentIndex((current) => (current + 1) % images.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden bg-[#071510]">
      {/* Slides */}
      {images.map((image, index) => (
        <div
          key={image.src}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === currentIndex
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-contain object-center"
          />
        </div>
      ))}

      {/* Dark overlay for readability */}
      <div className="pointer-events-none absolute inset-0 bg-[#03150f]/35" />

      {/* Left gradient */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-[#03150f]/85 via-[#03150f]/45 to-transparent" />

      {/* Bottom gradient */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#071510]/70 to-transparent" />

      {/* Previous */}
      <button
        type="button"
        onClick={previousSlide}
        aria-label="Previous image"
        className="absolute left-3 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50 sm:left-5"
      >
        <ArrowIcon direction="left" />
      </button>

      {/* Next */}
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next image"
        className="absolute right-3 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50 sm:right-5"
      >
        <ArrowIcon direction="right" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 px-4 py-2 backdrop-blur-md">
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to image ${index + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-6 bg-white"
                : "w-2 bg-white/55 hover:bg-white/90"
            }`}
          />
        ))}
      </div>
    </div>
  );
}