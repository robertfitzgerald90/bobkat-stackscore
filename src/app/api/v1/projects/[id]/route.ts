import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, unauthorized } from "@/lib/api/helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const body = await request.json();

  const project = await prisma.project.update({
    where: { id },
    data: {
      status: body.status,
      assignedUserId: body.assignedUserId,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      targetCompletionDate: body.targetCompletionDate
        ? new Date(body.targetCompletionDate)
        : undefined,
      actualImpactPoints: body.actualImpactPoints,
      completedAt:
        body.status === "completed" ? new Date() : undefined,
    },
    include: { recommendation: true },
  });

  if (body.status === "completed" && project.recommendationId) {
    await prisma.assessmentRecommendation.update({
      where: { id: project.recommendationId },
      data: { status: "completed", completedAt: new Date() },
    });
  }

  return NextResponse.json(project);
}
