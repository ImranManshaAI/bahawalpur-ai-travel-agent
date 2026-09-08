"use client";

import { useEffect, useState } from "react";
import type { ScheduleResponse } from "@/lib/api-types";
import { getSchedules } from "@/lib/api";

const DEFAULT_DATE = "2026-09-15";

export default function ScheduleSelector() {
  const [selectedDate, setSelectedDate] = useState(DEFAULT_DATE);
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadSchedules() {
      setIsLoading(true);
      setErrorMessage(null);

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
                className="cursor-pointer rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-400 hover:shadow-sm focus-within:ring-2 focus-within:ring-slate-950 focus-within:ring-offset-2"
              >
                <input
                  type="radio"
                  name="departure-time"
                  value={schedule.id}
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
    </div>
  );
}