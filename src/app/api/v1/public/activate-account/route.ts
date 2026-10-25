import { NextRequest, NextResponse } from "next/server";
import { activateAccount } from "@/lib/auth/activation";
import { badRequest } from "@/lib/api/helpers";
import {
  enforceActivationLimits,
  tooManyRequestsResponse,
} from "@/lib/auth/rate-limit";

export async function POST(request: Request) {
  let body: { token?: string; password?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const token = typeof body.token === "string" ? body.token : "";
  if (token) {
    const rate = await enforceActivationLimits({ request, token });
    if (!rate.allowed && !rate.backendError) {
      return tooManyRequestsResponse(rate.retryAfterSeconds);
    }
  }

  try {
    const result = await activateAccount({
      token,
      password: typeof body.password === "string" ? body.password : "",
      name: typeof body.name === "string" ? body.name : undefined,
    });

    if (!result.ok) {
      return badRequest(result.error, "ACTIVATION_FAILED");
    }

    return NextResponse.json({ email: result.email });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Activation failed";
    return badRequest(message, "ACTIVATION_FAILED");
  }
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const rate = await enforceActivationLimits({ request, token });
  if (!rate.allowed && !rate.backendError) {
    return tooManyRequestsResponse(rate.retryAfterSeconds);
  }

  const { validateActivationToken } = await import("@/lib/auth/activation");
  const result = await validateActivationToken(token);
  return NextResponse.json(result);
}
