import { NextResponse } from "next/server";
import { confirmPasswordReset, requestPasswordReset } from "@/lib/auth/password-reset";
import { badRequest } from "@/lib/api/helpers";
import {
  enforcePasswordResetConfirmLimits,
  enforcePasswordResetRequestLimits,
  temporarilyUnavailableResponse,
  tooManyRequestsResponse,
} from "@/lib/auth/rate-limit";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };
  if (!body.email?.trim()) return badRequest("Email is required");

  const rate = await enforcePasswordResetRequestLimits({
    request,
    email: body.email.trim(),
  });
  if (!rate.allowed) {
    if (rate.backendError) {
      return temporarilyUnavailableResponse(rate.retryAfterSeconds);
    }
    return tooManyRequestsResponse(rate.retryAfterSeconds);
  }

  await requestPasswordReset(body.email.trim());
  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as { token?: string; password?: string };
  if (!body.token?.trim()) return badRequest("Token and password are required");
  if (body.password === undefined || body.password === null) {
    return badRequest("Token and password are required");
  }

  const rate = await enforcePasswordResetConfirmLimits({
    request,
    token: body.token,
  });
  if (!rate.allowed && !rate.backendError) {
    return tooManyRequestsResponse(rate.retryAfterSeconds);
  }
  // fail-open on backendError — proceed without consuming token unless reset succeeds

  try {
    await confirmPasswordReset({ token: body.token, password: body.password });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reset password";
    return badRequest(message);
  }
}
