"use client";

import { useState } from "react";
import type { SeatResponse } from "@/lib/api-types";

interface SeatMapProps {
  seats: SeatResponse[];
}

const STATUS_LABELS: Record<SeatResponse["status"], string> = {
  available: "Available",
  held: "Temporarily held",
  booked: "Booked",
  reserved: "Reserved",
};

const STATUS_STYLES: Record<SeatResponse["status"], string> = {
  available:
    "border-slate-300 bg-white text-slate-900 hover:border-slate-500",
  held: "border-amber-300 bg-amber-50 text-amber-900",
  booked: "border-slate-500 bg-slate-200 text-slate-600",
  reserved: "border-blue-300 bg-blue-50 text-blue-900",
};

function Seat({
  seat,
  isSelected,
  onSelect,
}: {
  seat: SeatResponse;
  isSelected: boolean;
  onSelect: (seatId: string) => void;
}) {
  const isAvailable = seat.status === "available";

  if (!isAvailable) {
    return (
      <div
        className={`flex min-h-16 items-center justify-center rounded-xl border-2 px-2 text-center transition ${STATUS_STYLES[seat.status]} cursor-not-allowed`}
        aria-label={`${seat.seat_number}, ${STATUS_LABELS[seat.status]}`}
        title={`${seat.seat_number} — ${STATUS_LABELS[seat.status]}`}
      >
        <div>
          <span className="block text-sm font-bold">{seat.seat_number}</span>
          <span className="mt-1 block text-[11px] font-medium">
            {STATUS_LABELS[seat.status]}
          </span>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(seat.id)}
      aria-pressed={isSelected}
      aria-label={`${seat.seat_number}, ${
        isSelected ? "Selected" : STATUS_LABELS[seat.status]
      }`}
      className={`flex min-h-16 items-center justify-center rounded-xl border-2 px-2 text-center transition focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 ${
        isSelected
          ? "border-slate-950 bg-slate-950 text-white"
          : STATUS_STYLES.available
      }`}
    >
      <div>
        <span className="block text-sm font-bold">{seat.seat_number}</span>
        <span className="mt-1 block text-[11px] font-medium">
          {isSelected ? "Selected" : STATUS_LABELS.available}
        </span>
      </div>
    </button>
  );
}

function Deck({
  name,
  seats,
  selectedSeatIds,
  onSelect,
}: {
  name: string;
  seats: SeatResponse[];
  selectedSeatIds: Set<string>;
  onSelect: (seatId: string) => void;
}) {
  return (
    <section
      aria-labelledby={`${name.toLowerCase()}-deck-heading`}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-5 flex items-center justify-between">
        <h3
          id={`${name.toLowerCase()}-deck-heading`}
          className="text-lg font-bold text-slate-950"
        >
          {name} Deck
        </h3>

        <span className="text-sm text-slate-500">
          {seats.length} seats
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {seats.map((seat) => (
          <Seat
            key={seat.id}
            seat={seat}
            isSelected={selectedSeatIds.has(seat.id)}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

export default function SeatMap({ seats }: SeatMapProps) {
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(
    new Set(),
  );

  function handleSeatSelect(seatId: string) {
    setSelectedSeatIds((current) => {
      const next = new Set(current);

      if (next.has(seatId)) {
        next.delete(seatId);
      } else {
        next.add(seatId);
      }

      return next;
    });
  }

  const upperDeckSeats = seats.filter((seat) => seat.deck === "upper");
  const lowerDeckSeats = seats.filter((seat) => seat.deck === "lower");

  const selectedSeatNumbers = seats
    .filter((seat) => selectedSeatIds.has(seat.id))
    .map((seat) => seat.seat_number);

  return (
    <div className="mt-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">
          Choose your seats
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Select available seats. Seats marked as held, booked, or reserved
          cannot be selected.
        </p>
      </div>

      <div
        aria-label="Seat status legend"
        className="flex flex-wrap gap-3 text-sm"
      >
        {(Object.keys(STATUS_LABELS) as SeatResponse["status"][]).map(
          (status) => (
            <div
              key={status}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <span
                aria-hidden="true"
                className={`h-3 w-3 rounded-sm border ${STATUS_STYLES[status]}`}
              />

              <span className="text-slate-700">
                {STATUS_LABELS[status]}
              </span>
            </div>
          ),
        )}
      </div>

      {seats.length === 0 ? (
        <p
          className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600"
          role="status"
        >
          No seat information is available for this departure.
        </p>
      ) : (
        <>
          <Deck
            name="Upper"
            seats={upperDeckSeats}
            selectedSeatIds={selectedSeatIds}
            onSelect={handleSeatSelect}
          />

          <Deck
            name="Lower"
            seats={lowerDeckSeats}
            selectedSeatIds={selectedSeatIds}
            onSelect={handleSeatSelect}
          />

          <div
            className="rounded-xl border border-slate-200 bg-white p-5"
            aria-live="polite"
          >
            <p className="text-sm font-semibold text-slate-900">
              Selected seats: {selectedSeatNumbers.length}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {selectedSeatNumbers.length > 0
                ? selectedSeatNumbers.join(", ")
                : "No seats selected yet."}
            </p>
          </div>
        </>
      )}
    </div>
  );
}