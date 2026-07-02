import { NextResponse } from "next/server";
import { getSessionUser, unauthorized, forbidden } from "@/lib/api/helpers";
import { getPortfolioSummary } from "@/lib/portfolio";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  if (user.role === "client" || user.role === "technician") {
    return forbidden();
  }

  const summary = await getPortfolioSummary(user.role);
  return NextResponse.json(summary);
}
