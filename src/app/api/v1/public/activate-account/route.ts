import { NextRequest, NextResponse } from "next/server";
import { activateAccount } from "@/lib/auth/activation";
import { badRequest } from "@/lib/api/helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await activateAccount(body);

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

  const { validateActivationToken } = await import("@/lib/auth/activation");
  const result = await validateActivationToken(token);
  return NextResponse.json(result);
}
