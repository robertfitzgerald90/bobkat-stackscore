import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  enforceHealthIpLimits,
  tooManyRequestsResponse,
} from "@/lib/auth/rate-limit";

/**
 * Public liveness probe (SS-SEC-007 / SEC-001-M01).
 * Returns only aggregate status — never per-check configuration posture.
 */
export async function GET(request: Request) {
  const rate = await enforceHealthIpLimits(request);
  if (!rate.allowed && !rate.backendError) {
    return tooManyRequestsResponse(rate.retryAfterSeconds);
  }

  let databaseOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    databaseOk = true;
  } catch {
    databaseOk = false;
  }

  let authSecretOk = Boolean(process.env.AUTH_SECRET?.trim());
  if (
    process.env.NODE_ENV === "production" &&
    process.env.AUTH_SECRET &&
    process.env.AUTH_SECRET.length < 32
  ) {
    authSecretOk = false;
  }

  let authUrlOk = true;
  if (!process.env.AUTH_URL) {
    authUrlOk = process.env.NODE_ENV !== "production";
  } else if (
    process.env.NODE_ENV === "production" &&
    /localhost|127\.0\.0\.1/i.test(process.env.AUTH_URL)
  ) {
    authUrlOk = false;
  }

  const healthy = databaseOk && authSecretOk && authUrlOk;

  return NextResponse.json(
    { status: healthy ? "ok" : "unhealthy" },
    { status: healthy ? 200 : 503 },
  );
}
