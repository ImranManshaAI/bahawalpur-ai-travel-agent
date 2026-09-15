export interface ScheduleResponse {
  id: string;
  date: string;
  timing_slot: string;
  status: "open" | "closed";
  available_seats: number;
  held_seats: number;
  booked_seats: number;
  reserved_seats: number;
  total_seats: number;
}

export interface SeatResponse {
  id: string;
  seat_number: string;
  deck: "upper" | "lower";
  status: "available" | "held" | "booked" | "reserved";
  hold_expires_at: string | null;
}

export interface ScheduleSeatsResponse {
  schedule_id: string;
  date: string;
  timing_slot: string;
  status: "open" | "closed";
  seats: SeatResponse[];
}

export interface HoldRequest {
  schedule_id: string;
  seat_ids: string[];
}

export interface HoldResponse {
  hold_id: string;
  token: string;
  seat_ids: string[];
  status: "held";
  held_at: string;
  hold_expires_at: string;
  remaining_seconds: number;
}

export interface CreateBookingRequest {
  hold_token: string;
  visitor_name: string;
  phone: string;
  email: string;
  passenger_count: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  account_name: string;
  account_number: string;
}

export interface CreateBookingResponse {
  booking_id: string;
  booking_ref: string;
  date: string;
  timing_slot: string;
  seat_ids: string[];
  seat_numbers: string[];
  passenger_count: number;
  total_price: number;
  booking_type: string;
  booking_status: string;
  payment_status: string;
  hold_expires_at: string;
  payment_methods: PaymentMethod[];
}

export interface BookingStatusResponse {
  booking_id: string;
  booking_ref: string;
  date: string;
  timing_slot: string;
  seat_numbers: string[];
  passenger_count: number;
  total_price: number;
  booking_status: string;
  payment_status: string;
  created_at: string;
}

export interface PaymentProofResponse {
  id: string;
  booking_id: string;
  payment_method_id: string;
  transaction_reference: string;
  amount_claimed: number;
  status: "pending_verification" | "confirmed" | "rejected";
  review_notes?: string | null;
  created_at: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  access_token: string;
  token_type: "bearer";
}

export interface AdminScheduleRequest {
  date: string;
  timing_slot: string;
}

export interface AdminScheduleStatusRequest {
  status: "open" | "closed";
}