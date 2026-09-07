import schedules from "@/mocks/schedules.json";

export interface ScheduleTiming {
  id: string;
  departure_time: string;
  available_seats: number;
}

export interface Schedule {
  id: string;
  date: string;
  timings: ScheduleTiming[];
}

export function getMockSchedules(): Schedule[] {
  return schedules as Schedule[];
}
