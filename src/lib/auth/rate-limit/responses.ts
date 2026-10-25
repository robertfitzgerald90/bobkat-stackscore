import { NextResponse } from "next/server";

export const RATE_LIMITED_CODE = "RATE_LIMITED";
export const RATE_LIMITED_MESSAGE =
  "Too many requests. Please wait a moment and try again.";

export const TEMPORARILY_UNAVAILABLE_MESSAGE =
  "This service is temporarily unavailable. Please try again shortly.";

export function tooManyRequestsResponse(retryAfterSeconds: number, message = RATE_LIMITED_MESSAGE) {
  return NextResponse.json(
    { error: message, code: RATE_LIMITED_CODE },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(1, retryAfterSeconds)),
      },
    },
  );
}

export function temporarilyUnavailableResponse(retryAfterSeconds = 60) {
  return NextResponse.json(
    { error: TEMPORARILY_UNAVAILABLE_MESSAGE, code: "TEMPORARILY_UNAVAILABLE" },
    {
      status: 503,
      headers: {
        "Retry-After": String(Math.max(1, retryAfterSeconds)),
      },
    },
  );
}
