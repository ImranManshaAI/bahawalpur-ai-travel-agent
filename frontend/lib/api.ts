import { mockGetSchedules } from "@/mocks/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

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

function buildUrl(path: string): string {
  if (!path.startsWith("/")) {
    throw new Error("API path must start with '/'.");
  }

  return `${API_BASE_URL}${path}`;
}

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

export async function getSchedules(date: string) {
  return mockGetSchedules(date);
}

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
