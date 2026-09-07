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
