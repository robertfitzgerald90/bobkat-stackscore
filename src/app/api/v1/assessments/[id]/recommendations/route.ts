import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, notFound, unauthorized } from "@/lib/api/helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id } = await context.params;

  const assessment = await prisma.assessment.findUnique({ where: { id } });
  if (!assessment) return notFound("Assessment not found");

  const recommendations = await prisma.assessmentRecommendation.findMany({
    where: { assessmentId: id },
    orderBy: [{ priority: "asc" }, { estimatedImpactPoints: "desc" }],
    include: { category: true },
  });

  return NextResponse.json({ data: recommendations });
}
