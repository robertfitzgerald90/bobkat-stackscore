import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type CheckStatus = "ok" | "error" | "warn";

export async function GET() {
  const checks: Record<string, CheckStatus> = {
    database: "error",
    authSecret: process.env.AUTH_SECRET ? "ok" : "error",
    authUrl: "ok",
  };

  if (!process.env.AUTH_URL) {
    checks.authUrl = "warn";
  } else if (
    process.env.NODE_ENV === "production" &&
    /localhost|127\.0\.0\.1/i.test(process.env.AUTH_URL)
  ) {
    checks.authUrl = "error";
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  if (
    process.env.NODE_ENV === "production" &&
    process.env.AUTH_SECRET &&
    process.env.AUTH_SECRET.length < 32
  ) {
    checks.authSecret = "error";
  }

  const hasError = Object.values(checks).includes("error");

  return NextResponse.json(
    {
      status: hasError ? "unhealthy" : "ok",
      checks,
      version: "1.0.0",
      environment: process.env.NODE_ENV ?? "development",
    },
    { status: hasError ? 503 : 200 },
  );
}
