import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  let database: "connected" | "disconnected" = "disconnected";

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "connected";
  } catch {
    database = "disconnected";
  }

  return NextResponse.json({
    status: database === "connected" ? "ok" : "degraded",
    database,
    version: "1.0.0",
  });
}
