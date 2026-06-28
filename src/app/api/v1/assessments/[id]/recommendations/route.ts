import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getRecommendationsTriggeredByAssessment } from "@/lib/recommendations/queries";
import { getSessionUser, notFound, unauthorized } from "@/lib/api/helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id } = await context.params;

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!assessment) return notFound("Assessment not found");

  const recommendations = await getRecommendationsTriggeredByAssessment(id);

  return NextResponse.json({ data: recommendations });
}
