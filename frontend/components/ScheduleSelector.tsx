"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSchedules } from "@/lib/api";
import type { ScheduleResponse } from "@/lib/api-types";

function Icon({
  name,
  size = 22,
}: {
  name: "calendar" | "clock" | "location" | "arrow" | "check";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "calendar") {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
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

  if (name === "check") {
    return (
      <svg {...common}>
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

const STEPS = [
  "Select Schedule",
  "Choose Seats",
  "Passenger Details",
  "Payment",
  "Confirmation",
];

export default function ScheduleSelector() {
  const router = useRouter();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("17:30");
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [error, setError] = useState("");

  const selectedSchedule = useMemo(() => {
    if (!date || !time) return null;

    return (
      schedules.find(
        (schedule) =>
          schedule.travel_date === date &&
          schedule.timing_slot === time
      ) || null
    );
  }, [date, time, schedules]);

  async function handleSearch() {
    setError("");

    if (!date) {
      setError("Please select your travel date.");
      return;
    }

    setLoading(true);

    try {
      const scheduleData = await getSchedules(date);

      if (!scheduleData || scheduleData.length === 0) {
        setError("No schedules are available for this date.");
        return;
      }

      setSchedules(scheduleData);

      const matchingSchedule = scheduleData.find(
        (schedule) => schedule.timing_slot === time
      );

      if (!matchingSchedule) {
        setError("No schedule is available for this time.");
        return;
      }

      router.push(
        `/booking?date=${encodeURIComponent(
          date
        )}&time=${encodeURIComponent(
          time
        )}&schedule=${encodeURIComponent(
          matchingSchedule.schedule_instance_id
        )}`
      );
    } catch {
      setError("Unable to load schedules. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative z-40 px-4 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1320px]">
        <div
          className="
            overflow-hidden
            rounded-[26px]
            border border-[#e3e8e4]
            bg-white
            shadow-[0_18px_50px_rgba(15,55,40,0.10)]
          "
        >
          {/* STEPS */}
          <div className="border-b border-[#edf1ee] bg-white px-3 py-3 sm:px-5 lg:px-7">
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5 lg:gap-3">
              {STEPS.map((step, index) => {
                const active = index === 0;

                return (
                  <div
                    key={step}
                    className={`
                      flex min-w-0 items-center gap-2
                      rounded-[15px]
                      px-2 py-2
                      sm:px-3 sm:py-2.5
                      transition-all duration-200
                      ${
                        active
                          ? "bg-[#007456] text-white shadow-[0_7px_18px_rgba(0,116,86,0.16)]"
                          : "bg-transparent text-[#69756f]"
                      }
                    `}
                  >
                    <div
                      className={`
                        flex h-8 w-8 shrink-0 items-center justify-center
                        rounded-full
                        text-[12px] font-extrabold
                        sm:h-9 sm:w-9 sm:text-[13px]
                        ${
                          active
                            ? "bg-white text-[#007456]"
                            : "bg-[#edf1ee] text-[#68756f]"
                        }
                      `}
                    >
                      {index + 1}
                    </div>

                    <div className="hidden min-w-0 sm:block">
                      <p
                        className={`
                          truncate text-[11px] font-extrabold
                          lg:text-[12px]
                          ${
                            active
                              ? "text-white"
                              : "text-[#53615b]"
                          }
                        `}
                      >
                        {step}
                      </p>

                      <p
                        className={`
                          mt-0.5 truncate text-[9px] font-medium
                          lg:text-[10px]
                          ${
                            active
                              ? "text-white/70"
                              : "text-[#9aa49f]"
                          }
                        `}
                      >
                        {index === 0
                          ? "Find your schedule"
                          : index === 1
                          ? "Pick your seat"
                          : index === 2
                          ? "Your information"
                          : index === 3
                          ? "Payment proof"
                          : "Booking complete"}
                      </p>
                    </div>

                    <span
                      className={`
                        text-[9px] font-extrabold sm:hidden
                        ${
                          active
                            ? "text-white"
                            : "text-[#69766f]"
                        }
                      `}
                    >
                      {index === 0 ? "Schedule" : step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SEARCH AREA */}
          <div className="p-4 sm:p-5 lg:p-6">
            <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_190px]">
              {/* FROM */}
              <div
                className="
                  group
                  rounded-[18px]
                  border border-[#e1e7e2]
                  bg-[#fbfcfa]
                  px-5 py-4
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:border-[#b5d5c4]
                  hover:bg-white
                  hover:shadow-[0_8px_20px_rgba(20,70,48,0.05)]
                "
              >
                <p
                  className="
                    text-[10px]
                    font-extrabold
                    uppercase
                    tracking-[0.18em]
                    text-[#8a9690]
                  "
                >
                  From
                </p>

                <div className="mt-2.5 flex items-center gap-3">
                  <div
                    className="
                      flex h-10 w-10 shrink-0
                      items-center justify-center
                      rounded-xl
                      bg-[#e8f5ee]
                      text-[#007456]
                      transition-all duration-200
                      group-hover:bg-[#007456]
                      group-hover:text-white
                    "
                  >
                    <Icon name="location" size={20} />
                  </div>

                  <div className="min-w-0">
                    <p
                      className="
                        text-[16px]
                        font-extrabold
                        tracking-[-0.025em]
                        text-[#172720]
                      "
                    >
                      Bahawalpur
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-[11px]
                        font-medium
                        tracking-[0.01em]
                        text-[#7d8983]
                      "
                    >
                      TDCP Bus Terminal
                    </p>
                  </div>
                </div>
              </div>

              {/* DATE */}
              <label
                className="
                  group
                  cursor-pointer
                  rounded-[18px]
                  border border-[#e1e7e2]
                  bg-[#fbfcfa]
                  px-5 py-4
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:border-[#b5d5c4]
                  hover:bg-white
                  hover:shadow-[0_8px_20px_rgba(20,70,48,0.05)]
                  focus-within:border-[#86bda0]
                  focus-within:bg-white
                  focus-within:shadow-[0_8px_20px_rgba(20,70,48,0.06)]
                "
              >
                <span
                  className="
                    text-[10px]
                    font-extrabold
                    uppercase
                    tracking-[0.18em]
                    text-[#8a9690]
                  "
                >
                  Travel Date
                </span>

                <div className="mt-2.5 flex items-center gap-3">
                  <div
                    className="
                      flex h-10 w-10 shrink-0
                      items-center justify-center
                      rounded-xl
                      bg-[#e8f5ee]
                      text-[#007456]
                      transition-all duration-200
                      group-focus-within:bg-[#007456]
                      group-focus-within:text-white
                    "
                  >
                    <Icon name="calendar" size={20} />
                  </div>

                  <input
                    type="date"
                    value={date}
                    onChange={(event) =>
                      setDate(event.target.value)
                    }
                    className="
                      min-w-0
                      w-full
                      cursor-pointer
                      bg-transparent
                      text-[15px]
                      font-extrabold
                      tracking-[-0.01em]
                      text-[#172720]
                      outline-none
                    "
                  />
                </div>
              </label>

              {/* TIME */}
              <label
                className="
                  group
                  cursor-pointer
                  rounded-[18px]
                  border border-[#e1e7e2]
                  bg-[#fbfcfa]
                  px-5 py-4
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:border-[#b5d5c4]
                  hover:bg-white
                  hover:shadow-[0_8px_20px_rgba(20,70,48,0.05)]
                  focus-within:border-[#86bda0]
                  focus-within:bg-white
                  focus-within:shadow-[0_8px_20px_rgba(20,70,48,0.06)]
                "
              >
                <span
                  className="
                    text-[10px]
                    font-extrabold
                    uppercase
                    tracking-[0.18em]
                    text-[#8a9690]
                  "
                >
                  Departure Time
                </span>

                <div className="mt-2.5 flex items-center gap-3">
                  <div
                    className="
                      flex h-10 w-10 shrink-0
                      items-center justify-center
                      rounded-xl
                      bg-[#e8f5ee]
                      text-[#007456]
                      transition-all duration-200
                      group-focus-within:bg-[#007456]
                      group-focus-within:text-white
                    "
                  >
                    <Icon name="clock" size={20} />
                  </div>

                  <input
                    type="time"
                    value={time}
                    onChange={(event) =>
                      setTime(event.target.value)
                    }
                    className="
                      min-w-0
                      w-full
                      cursor-pointer
                      bg-transparent
                      text-[15px]
                      font-extrabold
                      tracking-[-0.01em]
                      text-[#172720]
                      outline-none
                    "
                  />
                </div>
              </label>

              {/* SEARCH BUTTON */}
              <button
                type="button"
                onClick={handleSearch}
                disabled={loading}
                className="
                  group
                  relative
                  min-h-[88px]
                  overflow-hidden
                  rounded-[18px]
                  bg-[#007456]
                  px-6
                  text-white
                  shadow-[0_12px_28px_rgba(0,116,86,0.20)]
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:bg-[#00694e]
                  hover:shadow-[0_17px_34px_rgba(0,116,86,0.25)]
                  active:translate-y-0
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                <span
                  className="
                    pointer-events-none
                    absolute
                    -right-8
                    -top-10
                    h-24
                    w-24
                    rounded-full
                    bg-white/10
                    blur-2xl
                    transition-transform
                    duration-500
                    group-hover:scale-150
                  "
                />

                <span className="relative flex items-center justify-center gap-3">
                  <span
                    className="
                      text-[14px]
                      font-extrabold
                      tracking-[-0.01em]
                    "
                  >
                    {loading ? "Searching..." : "Search Buses"}
                  </span>

                  {!loading && (
                    <span
                      className="
                        flex h-8 w-8
                        items-center justify-center
                        rounded-full
                        border border-white/15
                        bg-white/10
                        transition-all duration-200
                        group-hover:translate-x-1
                        group-hover:bg-white/20
                      "
                    >
                      <Icon name="arrow" size={17} />
                    </span>
                  )}
                </span>
              </button>
            </div>

            {/* ERROR */}
            {error && (
              <div
                className="
                  mt-4
                  rounded-[14px]
                  border border-red-100
                  bg-red-50
                  px-4 py-3
                  text-xs
                  font-semibold
                  text-red-600
                "
              >
                {error}
              </div>
            )}

            {/* SELECTED SCHEDULE */}
            {selectedSchedule && !error && (
              <div
                className="
                  mt-4
                  flex items-center gap-3
                  rounded-[14px]
                  border border-[#d7e9dd]
                  bg-[#f1faf5]
                  px-4 py-3
                "
              >
                <div
                  className="
                    flex h-8 w-8 shrink-0
                    items-center justify-center
                    rounded-full
                    bg-[#007456]
                    text-white
                    shadow-sm
                  "
                >
                  <Icon name="check" size={16} />
                </div>

                <p className="text-xs font-semibold text-[#52625a]">
                  Schedule available for{" "}
                  <span className="font-extrabold text-[#007456]">
                    {selectedSchedule.timing_slot}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}