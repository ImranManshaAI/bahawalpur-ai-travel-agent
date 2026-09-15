"use client";

import { useEffect, useMemo, useState } from "react";
import type { HoldResponse, SeatResponse } from "@/lib/api-types";
import { holdSeats } from "@/lib/api";
import PassengerDetailsForm from "@/components/PassengerDetailsForm";

interface SeatMapProps {
  scheduleId: string;
  seats: SeatResponse[];
}

function formatRemainingTime(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function SeatButton({
  seat,
  isSelected,
  onSelect,
}: {
  seat: SeatResponse;
  isSelected: boolean;
  onSelect: (seat: SeatResponse) => void;
}) {
  const isAvailable = seat.status === "available";

  return (
    <button
      type="button"
      disabled={!isAvailable}
      onClick={() => onSelect(seat)}
      aria-pressed={isSelected}
      aria-label={`Seat ${seat.seat_number}, ${seat.status}`}
      className={`min-h-12 min-w-12 rounded-lg border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 ${
        isSelected
          ? "border-slate-950 bg-slate-950 text-white"
          : isAvailable
            ? "border-slate-300 bg-white text-slate-900 hover:border-slate-500 hover:bg-slate-50"
            : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
      }`}
    >
      {seat.seat_number}
    </button>
  );
}

function Deck({
  title,
  seats,
  selectedSeatIds,
  onSelect,
}: {
  title: string;
  seats: SeatResponse[];
  selectedSeatIds: string[];
  onSelect: (seat: SeatResponse) => void;
}) {
  return (
    <section
      aria-labelledby={`${title.toLowerCase()}-deck-heading`}
      className="rounded-xl border border-slate-200 bg-slate-50 p-5"
    >
      <h3
        id={`${title.toLowerCase()}-deck-heading`}
        className="text-lg font-semibold text-slate-950"
      >
        {title} Deck
      </h3>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {seats.map((seat) => (
          <SeatButton
            key={seat.id}
            seat={seat}
            isSelected={selectedSeatIds.includes(seat.id)}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

export default function SeatMap({
  scheduleId,
  seats,
}: SeatMapProps) {
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [hold, setHold] = useState<HoldResponse | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(600);
  const [isHolding, setIsHolding] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const upperDeckSeats = useMemo(
    () => seats.filter((seat) => seat.deck === "upper"),
    [seats],
  );

  const lowerDeckSeats = useMemo(
    () => seats.filter((seat) => seat.deck === "lower"),
    [seats],
  );

  useEffect(() => {
    if (!hold) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          setHold(null);
          setSelectedSeatIds([]);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [hold]);

  function handleSeatSelect(seat: SeatResponse) {
    if (hold || seat.status !== "available") {
      return;
    }

    setErrorMessage(null);

    setSelectedSeatIds((current) =>
      current.includes(seat.id)
        ? current.filter((id) => id !== seat.id)
        : [...current, seat.id],
    );
  }

  async function handleHoldSeats() {
    if (selectedSeatIds.length === 0 || isHolding) {
      return;
    }

    setIsHolding(true);
    setErrorMessage(null);

    try {
      const response = await holdSeats({
        schedule_id: scheduleId,
        seat_ids: selectedSeatIds,
      });

      setHold(response);
      setRemainingSeconds(response.remaining_seconds);
    } catch {
      setErrorMessage(
        "We couldn't hold the selected seats. Please refresh the seat map and try again.",
      );
    } finally {
      setIsHolding(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2
          id="seat-selection-heading"
          className="text-2xl font-bold tracking-tight text-slate-950"
        >
          Choose your seats
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Select one or more available seats.
        </p>
      </div>

      {hold && remainingSeconds > 0 && (
        <div
          className="rounded-xl border border-slate-300 bg-white p-5"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-semibold text-slate-950">
            Seats temporarily held
          </p>

          <p className="mt-1 text-sm text-slate-600">
            Your selected seats are held for:
          </p>

          <p className="mt-2 text-2xl font-bold tabular-nums text-slate-950">
            {formatRemainingTime(remainingSeconds)}
          </p>
        </div>
      )}

      {errorMessage && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      <div className="space-y-5">
        <Deck
          title="Upper"
          seats={upperDeckSeats}
          selectedSeatIds={selectedSeatIds}
          onSelect={handleSeatSelect}
        />

        <Deck
          title="Lower"
          seats={lowerDeckSeats}
          selectedSeatIds={selectedSeatIds}
          onSelect={handleSeatSelect}
        />
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">
            {selectedSeatIds.length}{" "}
            {selectedSeatIds.length === 1 ? "seat" : "seats"} selected
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Available seats can be selected. Held, booked, and reserved seats
            cannot be selected.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleHoldSeats()}
          disabled={
            selectedSeatIds.length === 0 || isHolding || Boolean(hold)
          }
          className="min-h-11 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isHolding
            ? "Holding seats..."
            : hold
              ? "Seats held"
              : "Hold selected seats"}
        </button>
      </div>

      {hold && remainingSeconds > 0 && (
        <PassengerDetailsForm
          holdToken={hold.token}
          passengerCount={hold.seat_ids.length}
          remainingSeconds={remainingSeconds}
        />
      )}
    </div>
  );
}