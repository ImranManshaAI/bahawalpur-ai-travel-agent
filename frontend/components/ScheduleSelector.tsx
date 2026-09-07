"use client";

import { useMemo, useState } from "react";
import { getMockSchedules } from "@/lib/schedules";

export default function ScheduleSelector() {
  const schedules = getMockSchedules();

  const [selectedDate, setSelectedDate] = useState(
    schedules[0]?.date ?? "",
  );
  const [selectedTimingId, setSelectedTimingId] = useState("");

  const selectedSchedule = useMemo(
    () => schedules.find((schedule) => schedule.date === selectedDate),
    [schedules, selectedDate],
  );

  const timings = selectedSchedule?.timings ?? [];

  return (
    <div className="mt-8 space-y-8">
      <div>
        <label
          htmlFor="travel-date"
          className="block text-sm font-semibold text-slate-900"
        >
          Travel date
        </label>

        <select
          id="travel-date"
          value={selectedDate}
          onChange={(event) => {
            setSelectedDate(event.target.value);
            setSelectedTimingId("");
          }}
          className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 sm:max-w-md"
        >
          {schedules.map((schedule) => (
            <option key={schedule.id} value={schedule.date}>
              {schedule.date}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-slate-900">
          Choose a departure time
        </legend>

        {timings.length > 0 ? (
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {timings.map((timing) => {
              const isSelected = selectedTimingId === timing.id;

              return (
                <label
                  key={timing.id}
                  className={`cursor-pointer rounded-xl border p-4 transition ${
                    isSelected
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-900 hover:border-slate-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="departure-time"
                    value={timing.id}
                    checked={isSelected}
                    onChange={() => setSelectedTimingId(timing.id)}
                    className="sr-only"
                  />

                  <span className="block text-lg font-semibold">
                    {timing.departure_time}
                  </span>

                  <span
                    className={`mt-1 block text-sm ${
                      isSelected ? "text-slate-200" : "text-slate-500"
                    }`}
                  >
                    {timing.available_seats} seats available
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
            No departures are available for this date.
          </p>
        )}
      </fieldset>
    </div>
  );
}