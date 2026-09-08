import type {
  ScheduleResponse,
  ScheduleSeatsResponse,
} from "@/lib/api-types";
import { MOCK_SCHEDULE_SEATS } from "@/mocks/seats";

const MOCK_SCHEDULES: ScheduleResponse[] = [
  {
    id: "schedule-001",
    date: "2026-09-15",
    timing_slot: "09:00",
    status: "open",
    available_seats: 28,
    held_seats: 2,
    booked_seats: 10,
    reserved_seats: 2,
    total_seats: 42,
  },
  {
    id: "schedule-002",
    date: "2026-09-15",
    timing_slot: "15:00",
    status: "open",
    available_seats: 19,
    held_seats: 3,
    booked_seats: 17,
    reserved_seats: 3,
    total_seats: 42,
  },
];

export function mockGetSchedules(date: string): ScheduleResponse[] {
  return MOCK_SCHEDULES.filter((schedule) => schedule.date === date);
}

export function mockGetScheduleSeats(
  scheduleId: string,
): ScheduleSeatsResponse {
  if (scheduleId !== MOCK_SCHEDULE_SEATS.schedule_id) {
    throw new Error("Schedule not found.");
  }

  return MOCK_SCHEDULE_SEATS;
}