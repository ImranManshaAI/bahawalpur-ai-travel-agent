import type {
  BookingStatusResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  HoldRequest,
  HoldResponse,
  ScheduleResponse,
  ScheduleSeatsResponse,
} from "@/lib/api-types";
import { MOCK_SCHEDULE_SEATS } from "@/mocks/seats";

const MOCK_SCHEDULES: ScheduleResponse[] = [
  {
    schedule_instance_id: "schedule-001",
    route_id: "route-bwp-lhr-001",
    route_name: "Bahawalpur → Lahore",
    travel_date: "2026-09-15",
    timing_slot: "09:00",
    status: "open",
    available_seats: 28,
    total_seats: 42,
  },
  {
    schedule_instance_id: "schedule-002",
    route_id: "route-bwp-lhr-001",
    route_name: "Bahawalpur → Lahore",
    travel_date: "2026-09-15",
    timing_slot: "15:00",
    status: "open",
    available_seats: 19,
    total_seats: 42,
  },
];

export function mockGetSchedules(date: string): ScheduleResponse[] {
  return MOCK_SCHEDULES.filter(
    (schedule) => schedule.travel_date === date,
  );
}

export function mockGetScheduleSeats(
  scheduleId: string,
): ScheduleSeatsResponse {
  if (
    scheduleId !== MOCK_SCHEDULE_SEATS.schedule_instance_id
  ) {
    throw new Error("Schedule not found.");
  }

  return MOCK_SCHEDULE_SEATS;
}

export function mockHoldSeats(request: HoldRequest): HoldResponse {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

  return {
    hold_id: `mock-hold-${Date.now()}`,
    token: `mock-token-${Date.now()}`,
    seat_ids: request.seat_ids,
    status: "held",
    held_at: now.toISOString(),
    hold_expires_at: expiresAt.toISOString(),
    remaining_seconds: 10 * 60,
  };
}

export function mockCreateBooking(
  request: CreateBookingRequest,
): CreateBookingResponse {
  const bookingId = `mock-booking-${Date.now()}`;
  const bookingRef = `BWP-${Date.now().toString().slice(-6)}`;

  return {
    booking_id: bookingId,
    booking_ref: bookingRef,
    status: "pending_payment",
    booking_type: "visitor",
    schedule_id: MOCK_SCHEDULE_SEATS.schedule_instance_id,
    passenger_count: request.passenger_count,
    total_price: request.passenger_count * 500,
  };
}

export function mockGetBookingStatus(
  query: string,
): BookingStatusResponse {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    throw new Error("Booking reference, phone, or email is required.");
  }

  return {
    booking_id: "mock-booking-status-001",
    booking_ref: "BWP-123456",
    travel_date: MOCK_SCHEDULE_SEATS.travel_date,
    timing_slot: MOCK_SCHEDULE_SEATS.timing_slot,
    seats: [
      {
        seat_number: 1,
        deck: "lower",
      },
      {
        seat_number: 2,
        deck: "lower",
      },
    ],
    passenger_count: 2,
    total_price: 1000,
    booking_status: "pending_payment",
    payment_status: "unpaid",
    status_message: "Payment is pending.",
  };
}