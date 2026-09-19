export interface ScheduleResponse {
  schedule_instance_id: string;
  route_id: string;
  route_name: string;
  travel_date: string;
  timing_slot: string;
  status: string;
  total_seats: number;
  available_seats: number;
}

export interface SeatResponse {
  seat_id: string;
  seat_number: number;
  deck: string;
  status: string;
}

export interface ScheduleSeatsResponse {
  schedule_instance_id: string;
  travel_date: string;
  timing_slot: string;
  status: string;
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
  status: string;
  held_at: string;
  hold_expires_at: string;
  remaining_seconds: number;
}

export interface CreateBookingRequest {
  hold_token: string;
  visitor_name: string;
  visitor_phone: string;
  visitor_email: string | null;
  passenger_count: number;
}

export interface CreateBookingResponse {
  booking_id: string;
  booking_ref: string;
  status: string;
  booking_type: string;
  schedule_id: string;
  passenger_count: number;
  total_price: number;
}

export interface BookingStatusSeat {
  seat_number: number;
  deck: string;
}

export interface BookingStatusData {
  booking_id: string;
  booking_ref: string;
  travel_date: string;
  timing_slot: string;
  seats: BookingStatusSeat[];
  passenger_count: number;
  total_price: number;
  booking_status: string;
  payment_status?: string | null;
  status_message: string;
}

export interface BookingStatusResponse {
  booking_id: string;
  booking_ref: string;
  travel_date: string;
  timing_slot: string;
  seats: BookingStatusSeat[];
  passenger_count: number;
  total_price: number;
  booking_status: string;
  payment_status?: string | null;
  status_message: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  account_name: string;
  account_number: string;
}

export interface PaymentProofResponse {
  payment_proof_id: string;
  booking_id: string;
  screenshot_url: string;
  status: "pending_verification" | "confirmed" | "rejected";
  payment_method_id: string | null;
  transaction_reference: string | null;
  amount_claimed: number | null;
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