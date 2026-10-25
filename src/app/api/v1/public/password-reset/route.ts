import { NextResponse } from "next/server";
import { confirmPasswordReset, requestPasswordReset } from "@/lib/auth/password-reset";
import { badRequest } from "@/lib/api/helpers";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };
  if (!body.email?.trim()) return badRequest("Email is required");
  await requestPasswordReset(body.email.trim());
  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as { token?: string; password?: string };
  if (!body.token?.trim()) return badRequest("Token and password are required");
  // Allow empty string through to shared policy so clients get a clear length/required error.
  if (body.password === undefined || body.password === null) {
    return badRequest("Token and password are required");
  }
  try {
    await confirmPasswordReset({ token: body.token, password: body.password });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reset password";
    // Never echo submitted password material — messages are policy/token status only.
    return badRequest(message);
  }
}
