"use client";

import { useEffect, useMemo, useState } from "react";
import { getSchedules } from "@/lib/api";

type ScheduleResponse = {
  schedule_instance_id: string;
  route_id: string;
  route_name: string;
  travel_date: string;
  timing_slot: string;
  status: string;
  total_seats: number;
  available_seats: number;
};

export default function ScheduleSelector() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * Format backend time such as:
   * 09:00 -> 09:00 am
   * 17:30 -> 05:30 pm
   */
  function formatTime(value: string) {
    if (!value) return "";

    const [hoursString, minutesString] = value.split(":");

    const hours = Number(hoursString);
    const minutes = minutesString ?? "00";

    if (Number.isNaN(hours)) {
      return value;
    }

    const period = hours >= 12 ? "pm" : "am";
    const displayHours = hours % 12 || 12;

    return `${String(displayHours).padStart(2, "0")}:${minutes} ${period}`;
  }

  /*
   * Convert selected time back to a normalized HH:MM value.
   * This allows the component to work whether the input gives:
   * 09:00
   * 09:00 am
   * 9:00 am
   */
  function normalizeTime(value: string) {
    if (!value) return "";

    const cleaned = value.trim().toLowerCase();

    const amPmMatch = cleaned.match(
      /^(\d{1,2}):(\d{2})\s*(am|pm)$/
    );

    if (amPmMatch) {
      let hours = Number(amPmMatch[1]);
      const minutes = amPmMatch[2];
      const period = amPmMatch[3];

      if (period === "pm" && hours !== 12) {
        hours += 12;
      }

      if (period === "am" && hours === 12) {
        hours = 0;
      }

      return `${String(hours).padStart(2, "0")}:${minutes}`;
    }

    const twentyFourHourMatch = cleaned.match(
      /^(\d{1,2}):(\d{2})$/
    );

    if (twentyFourHourMatch) {
      return `${String(Number(twentyFourHourMatch[1])).padStart(
        2,
        "0"
      )}:${twentyFourHourMatch[2]}`;
    }

    return value;
  }

  /*
   * Keep unique departure times.
   */
  const availableTimes = useMemo(() => {
    const unique = Array.from(
      new Set(
        schedules
          .map((schedule) => schedule.timing_slot)
          .filter(Boolean)
      )
    );

    return unique;
  }, [schedules]);

  /*
   * Load today's date as default.
   */
  useEffect(() => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    setDate(`${year}-${month}-${day}`);
  }, []);

  /*
   * Search schedules from backend.
   */
  async function loadSchedules(selectedDate: string) {
    if (!selectedDate) {
      setSchedules([]);
      setTime("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const scheduleData = await getSchedules(selectedDate);

      if (!scheduleData || scheduleData.length === 0) {
        setSchedules([]);
        setTime("");
        setError("No schedules are available for this date.");
        return;
      }

      setSchedules(scheduleData);

      /*
       * Keep currently selected time if it exists.
       * Otherwise select the first available schedule.
       */
      const currentNormalized = normalizeTime(time);

      const matchingSchedule = scheduleData.find(
        (schedule) =>
          normalizeTime(schedule.timing_slot) === currentNormalized
      );

      if (matchingSchedule) {
        setTime(matchingSchedule.timing_slot);
      } else {
        setTime(scheduleData[0].timing_slot);
      }
    } catch (requestError) {
      console.error("Failed to load schedules:", requestError);

      setSchedules([]);
      setTime("");
      setError(
        "Unable to load schedules. Please check the backend and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * When date changes, search schedules for that date.
   */
  useEffect(() => {
    if (!date) return;

    loadSchedules(date);

    // We intentionally only react to date changes here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  /*
   * Select a departure time.
   */
  function handleTimeChange(selectedTime: string) {
    setTime(selectedTime);
    setError("");
  }

  /*
   * Search Buses / continue to booking.
   *
   * IMPORTANT:
   * We do NOT use Next.js router here.
   * We use browser navigation so the URL is guaranteed to change.
   */
  async function handleSearch() {
    setError("");

    /*
     * No date selected.
     */
    if (!date) {
      setError("Please select your travel date.");
      return;
    }

    /*
     * If schedules are already loaded, navigate immediately.
     */
    if (schedules.length > 0) {
      const selectedNormalized = normalizeTime(time);

      const scheduleToUse =
        schedules.find(
          (schedule) =>
            normalizeTime(schedule.timing_slot) ===
            selectedNormalized
        ) ?? schedules[0];

      if (!scheduleToUse) {
        setError("Please select an available schedule.");
        return;
      }

      if (!scheduleToUse.schedule_instance_id) {
        console.error(
          "Schedule is missing schedule_instance_id:",
          scheduleToUse
        );

        setError(
          "This schedule is missing its booking ID. Please try again."
        );

        return;
      }

      const selectedTime = scheduleToUse.timing_slot;

      const bookingUrl =
        `/booking?date=${encodeURIComponent(date)}` +
        `&time=${encodeURIComponent(selectedTime)}` +
        `&schedule=${encodeURIComponent(
          scheduleToUse.schedule_instance_id
        )}`;

      console.log("Opening booking URL:", bookingUrl);
      console.log("Selected schedule:", scheduleToUse);

      /*
       * Hard browser navigation.
       */
      window.location.assign(bookingUrl);

      return;
    }

    /*
     * If schedules haven't loaded yet, load them first.
     */
    setLoading(true);

    try {
      const scheduleData = await getSchedules(date);

      console.log("Schedules returned from backend:", scheduleData);

      if (!scheduleData || scheduleData.length === 0) {
        setSchedules([]);
        setTime("");
        setError("No schedules are available for this date.");
        return;
      }

      setSchedules(scheduleData);

      const selectedNormalized = normalizeTime(time);

      const scheduleToUse =
        scheduleData.find(
          (schedule) =>
            normalizeTime(schedule.timing_slot) ===
            selectedNormalized
        ) ?? scheduleData[0];

      if (!scheduleToUse?.schedule_instance_id) {
        setError(
          "The selected schedule is missing its booking ID."
        );
        return;
      }

      setTime(scheduleToUse.timing_slot);

      const bookingUrl =
        `/booking?date=${encodeURIComponent(date)}` +
        `&time=${encodeURIComponent(scheduleToUse.timing_slot)}` +
        `&schedule=${encodeURIComponent(
          scheduleToUse.schedule_instance_id
        )}`;

      console.log("Opening booking URL:", bookingUrl);

      window.location.assign(bookingUrl);
    } catch (requestError) {
      console.error("Failed to search buses:", requestError);

      setError(
        "Unable to search buses. Please check the backend and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1.1fr_1.1fr_0.85fr]">
        {/* FROM */}
        <div className="rounded-[28px] border border-[#dfe7e2] bg-white p-7 shadow-sm">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-[#80918d]">
            From
          </p>

          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e8f5ef]">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#007b5e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-[#10231f]">
                Bahawalpur
              </h3>

              <p className="mt-1 text-sm text-[#73817d]">
                TDCP Bus Terminal
              </p>
            </div>
          </div>
        </div>

        {/* TRAVEL DATE */}
        <div className="rounded-[28px] border border-[#dfe7e2] bg-white p-7 shadow-sm">
          <label
            htmlFor="travel-date"
            className="mb-4 block text-sm font-bold uppercase tracking-[0.22em] text-[#80918d]"
          >
            Travel Date
          </label>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e8f5ef]">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#007b5e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="18"
                  rx="2"
                />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>

            <input
              id="travel-date"
              type="date"
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setError("");
              }}
              className="min-w-0 flex-1 bg-transparent text-lg font-extrabold text-[#10231f] outline-none"
            />
          </div>
        </div>

        {/* DEPARTURE TIME */}
        <div className="rounded-[28px] border border-[#dfe7e2] bg-white p-7 shadow-sm">
          <label
            htmlFor="departure-time"
            className="mb-4 block text-sm font-bold uppercase tracking-[0.22em] text-[#80918d]"
          >
            Departure Time
          </label>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e8f5ef]">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#007b5e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 7 12 12 15 14" />
              </svg>
            </div>

            <select
              id="departure-time"
              value={time}
              onChange={(event) =>
                handleTimeChange(event.target.value)
              }
              className="min-w-0 flex-1 appearance-none bg-transparent text-lg font-extrabold text-[#10231f] outline-none"
              disabled={loading || availableTimes.length === 0}
            >
              {availableTimes.length === 0 ? (
                <option value="">
                  {loading
                    ? "Loading..."
                    : "No time available"}
                </option>
              ) : (
                availableTimes.map((availableTime) => (
                  <option
                    key={availableTime}
                    value={availableTime}
                  >
                    {formatTime(availableTime)}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* SEARCH BUTTON */}
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className="group min-h-[160px] rounded-[28px] bg-[#007b5e] px-8 py-6 text-left text-white shadow-[0_18px_35px_rgba(0,123,94,0.18)] transition hover:bg-[#00684f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="flex h-full items-center justify-between gap-4">
            <span className="text-xl font-extrabold leading-8">
              {loading ? (
                "Loading..."
              ) : (
                <>
                  Search
                  <br />
                  Buses
                </>
              )}
            </span>

            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-2xl transition group-hover:translate-x-1">
              →
            </span>
          </div>
        </button>
      </div>

      {/* AVAILABLE TIMES */}
      {availableTimes.length > 0 && (
        <div className="mt-7">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-[#80918d]">
            Available Departure Times
          </p>

          <div className="flex flex-wrap gap-3">
            {availableTimes.map((availableTime) => {
              const isSelected =
                normalizeTime(time) ===
                normalizeTime(availableTime);

              return (
                <button
                  key={availableTime}
                  type="button"
                  onClick={() =>
                    handleTimeChange(availableTime)
                  }
                  className={`rounded-full px-6 py-3 text-sm font-extrabold transition ${
                    isSelected
                      ? "bg-[#007b5e] text-white shadow-sm"
                      : "border border-[#dfe7e2] bg-white text-[#38504a] hover:border-[#007b5e] hover:text-[#007b5e]"
                  }`}
                >
                  {formatTime(availableTime)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STATUS */}
      {schedules.length > 0 && time && (
        <div className="mt-6 rounded-2xl border border-[#cfe5d9] bg-[#f0faf5] px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#007b5e] text-xl text-white">
              ✓
            </div>

            <p className="text-base font-semibold text-[#52635e]">
              Schedule available for{" "}
              <span className="font-extrabold text-[#007b5e]">
                {formatTime(time)}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}
    </section>
  );
}