"use client";

import { useEffect, useState } from "react";
import type {
  ScheduleResponse,
  ScheduleSeatsResponse,
} from "@/lib/api-types";
import { getScheduleSeats, getSchedules } from "@/lib/api";
import SeatMap from "@/components/SeatMap";

const DEFAULT_DATE = "2026-09-15";

export default function ScheduleSelector() {
  const [selectedDate, setSelectedDate] = useState(DEFAULT_DATE);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    null,
  );
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [scheduleSeats, setScheduleSeats] =
    useState<ScheduleSeatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [seatErrorMessage, setSeatErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadSchedules() {
      setIsLoading(true);
      setErrorMessage(null);
      setSelectedScheduleId(null);
      setScheduleSeats(null);
      setSeatErrorMessage(null);

      try {
        const data = await getSchedules(selectedDate);

        if (isActive) {
          setSchedules(data);
        }
      } catch {
        if (isActive) {
          setSchedules([]);
          setErrorMessage(
            "We couldn't load the available departures. Please try again.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadSchedules();

    return () => {
      isActive = false;
    };
  }, [selectedDate]);

  async function handleScheduleSelect(scheduleId: string) {
    setSelectedScheduleId(scheduleId);
    setScheduleSeats(null);
    setSeatErrorMessage(null);
    setIsLoadingSeats(true);

    try {
      const data = await getScheduleSeats(scheduleId);
      setScheduleSeats(data);
    } catch {
      setSeatErrorMessage(
        "We couldn't load the seat map. Please try selecting the departure again.",
      );
    } finally {
      setIsLoadingSeats(false);
    }
  }

  return (
    <div className="mt-8 space-y-8">
      <div>
        <label
          htmlFor="travel-date"
          className="block text-sm font-semibold text-slate-900"
        >
          Travel date
        </label>

        <input
          id="travel-date"
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 sm:max-w-md"
        />
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-slate-900">
          Choose a departure time
        </legend>

        {isLoading ? (
          <div
            className="mt-3 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600"
            aria-live="polite"
          >
            Loading departures...
          </div>
        ) : errorMessage ? (
          <div
            className="mt-3 rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800"
            role="alert"
          >
            {errorMessage}
          </div>
        ) : schedules.length > 0 ? (
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {schedules.map((schedule) => (
              <label
                key={schedule.id}
                className={`cursor-pointer rounded-xl border bg-white p-5 transition hover:border-slate-400 hover:shadow-sm focus-within:ring-2 focus-within:ring-slate-950 focus-within:ring-offset-2 ${
                  selectedScheduleId === schedule.id
                    ? "border-slate-950 ring-2 ring-slate-950 ring-offset-2"
                    : "border-slate-200"
                }`}
              >
                <input
                  type="radio"
                  name="departure-time"
                  value={schedule.id}
                  checked={selectedScheduleId === schedule.id}
                  onChange={() => void handleScheduleSelect(schedule.id)}
                  className="sr-only"
                />

                <span className="block text-xl font-semibold text-slate-950">
                  {schedule.timing_slot}
                </span>

                <span className="mt-2 block text-sm text-slate-600">
                  {schedule.available_seats} seats available
                </span>

                <span className="mt-4 block text-xs text-slate-500">
                  Schedule status: {schedule.status}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p
            className="mt-3 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600"
            role="status"
          >
            No departures are available for this date.
          </p>
        )}
      </fieldset>

      {selectedScheduleId && (
        <section aria-labelledby="seat-selection-heading">
          {isLoadingSeats ? (
            <div
              className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600"
              aria-live="polite"
            >
              Loading seat map...
            </div>
          ) : seatErrorMessage ? (
            <div
              className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800"
              role="alert"
            >
              {seatErrorMessage}
            </div>
          ) : scheduleSeats ? (
            <div id="seat-selection-heading">
              <SeatMap
                scheduleId={scheduleSeats.schedule_id}
                seats={scheduleSeats.seats}
              />
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}