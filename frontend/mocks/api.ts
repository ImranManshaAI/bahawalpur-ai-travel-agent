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
    date: MOCK_SCHEDULE_SEATS.date,
    timing_slot: MOCK_SCHEDULE_SEATS.timing_slot,
    seat_ids: [],
    seat_numbers: [],
    passenger_count: request.passenger_count,
    total_price: request.passenger_count * 500,
    booking_type: "visitor",
    booking_status: "pending_payment",
    payment_status: "unpaid",
    hold_expires_at: new Date(
      Date.now() + 10 * 60 * 1000,
    ).toISOString(),
    payment_methods: [
      {
        id: "mock-bank-transfer",
        name: "Bank Transfer",
        account_name: "TDCP Bahawalpur",
        account_number: "PK00-MOCK-ACCOUNT",
      },
    ],
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
    date: MOCK_SCHEDULE_SEATS.date,
    timing_slot: MOCK_SCHEDULE_SEATS.timing_slot,
    seat_numbers: ["L1", "L2"],
    passenger_count: 2,
    total_price: 1000,
    booking_status: "pending_payment",
    payment_status: "unpaid",
    created_at: new Date().toISOString(),
  };
}