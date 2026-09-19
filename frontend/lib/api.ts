import type {
  BookingStatusResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  HoldRequest,
  HoldResponse,
  PaymentProofResponse,
  ScheduleResponse,
  ScheduleSeatsResponse,
} from "@/lib/api-types";

/* =========================
   Admin Authentication
========================= */

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  admin_id: string;
  name: string;
  email: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

/* =========================
   Generic API Types
========================= */

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiErrorPayload | null;
}

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    message: string,
    status: number,
    code = "API_REQUEST_FAILED",
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/* =========================
   URL Helper
========================= */

function buildUrl(path: string): string {
  if (!path.startsWith("/")) {
    throw new Error("API path must start with '/'.");
  }

  return `${API_BASE_URL}${path}`;
}

/* =========================
   Response Parser
========================= */

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    if (!response.ok) {
      throw new ApiRequestError(
        "The server returned an unexpected response.",
        response.status,
      );
    }

    throw new ApiRequestError(
      "The server returned an invalid response format.",
      response.status,
      "INVALID_RESPONSE_FORMAT",
    );
  }

  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok || body.error) {
    throw new ApiRequestError(
      body.error?.message ?? "The API request failed.",
      response.status,
      body.error?.code ?? "API_REQUEST_FAILED",
      body.error?.details,
    );
  }

  if (body.data === null) {
    throw new ApiRequestError(
      "The API returned no data.",
      response.status,
      "EMPTY_RESPONSE",
    );
  }

  return body.data;
}

/* =========================
   Admin Login
========================= */

/**
 * POST /admin/login
 */
export async function adminLogin(
  request: AdminLoginRequest,
): Promise<AdminLoginResponse> {
  return apiFetch<AdminLoginResponse>("/admin/login", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

/* =========================
   Public Schedules
========================= */

/**
 * GET /schedules?date=YYYY-MM-DD
 */
export async function getSchedules(
  date: string,
): Promise<ScheduleResponse[]> {
  const params = new URLSearchParams({
    date,
  });

  return apiFetch<ScheduleResponse[]>(
    `/schedules?${params.toString()}`,
  );
}

/**
 * GET /schedules/{schedule_id}/seats
 */
export async function getScheduleSeats(
  scheduleId: string,
): Promise<ScheduleSeatsResponse> {
  return apiFetch<ScheduleSeatsResponse>(
    `/schedules/${encodeURIComponent(scheduleId)}/seats`,
  );
}

/* =========================
   Booking
========================= */

/**
 * POST /bookings/hold
 */
export async function holdSeats(
  request: HoldRequest,
): Promise<HoldResponse> {
  return apiFetch<HoldResponse>("/bookings/hold", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

/**
 * POST /bookings
 */
export async function createBooking(
  request: CreateBookingRequest,
): Promise<CreateBookingResponse> {
  return apiFetch<CreateBookingResponse>("/bookings", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

/**
 * GET /bookings/status?ref=...
 */
export async function getBookingStatus(
  query: string,
): Promise<BookingStatusResponse> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    throw new ApiRequestError(
      "Booking reference, phone, or email is required.",
      400,
      "INVALID_BOOKING_QUERY",
    );
  }

  const params = new URLSearchParams({
    ref: normalizedQuery,
  });

  return apiFetch<BookingStatusResponse>(
    `/bookings/status?${params.toString()}`,
  );
}

/* =========================
   Payment Proof
========================= */

/**
 * POST /bookings/{booking_id}/payment-proof
 *
 * Backend expects multipart/form-data:
 * - file: required
 * - payment_method_id: optional
 * - transaction_reference: optional
 * - amount_claimed: optional
 */
export async function uploadPaymentProof(
  bookingId: string,
  file: File,
  paymentMethodId?: string,
  transactionReference?: string,
  amountClaimed?: number,
): Promise<PaymentProofResponse> {
  if (!bookingId) {
    throw new ApiRequestError(
      "Booking ID is required.",
      400,
      "INVALID_BOOKING_ID",
    );
  }

  if (!file) {
    throw new ApiRequestError(
      "Payment proof file is required.",
      400,
      "INVALID_PAYMENT_PROOF_FILE",
    );
  }

  const formData = new FormData();

  formData.append("file", file);

  if (paymentMethodId) {
    formData.append("payment_method_id", paymentMethodId);
  }

  if (transactionReference?.trim()) {
    formData.append(
      "transaction_reference",
      transactionReference.trim(),
    );
  }

  if (amountClaimed !== undefined) {
    formData.append("amount_claimed", String(amountClaimed));
  }

  return apiUpload<PaymentProofResponse>(
    `/bookings/${encodeURIComponent(bookingId)}/payment-proof`,
    formData,
  );
}

/* =========================
   Generic API Request
========================= */

/**
 * Real backend API request helper.
 */
export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  return parseResponse<T>(response);
}

/* =========================
   Multipart Upload
========================= */

/**
 * Multipart upload helper.
 *
 * Important:
 * Do not set Content-Type manually here.
 * The browser automatically adds the multipart boundary.
 */
export async function apiUpload<T>(
  path: string,
  formData: FormData,
  options?: Omit<RequestInit, "body" | "headers"> & {
    headers?: HeadersInit;
  },
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...options,
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
      ...options?.headers,
    },
  });

  return parseResponse<T>(response);
}