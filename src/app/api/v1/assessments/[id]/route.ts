import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, notFound, unauthorized } from "@/lib/api/helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id } = await context.params;

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      client: true,
      assessor: { select: { id: true, name: true, email: true } },
      responses: {
        include: {
          question: true,
          selectedAnswerOption: true,
        },
      },
      categoryScores: { include: { category: true } },
      recommendations: {
        orderBy: [{ priority: "asc" }, { estimatedImpactPoints: "desc" }],
        include: { category: true },
      },
    },
  });

  if (!assessment) return notFound("Assessment not found");

  const totalQuestions = await prisma.assessmentQuestion.count({
    where: { isActive: true },
  });

  return NextResponse.json({
    ...assessment,
    progress: {
      answered: assessment.responses.length,
      total: totalQuestions,
    },
  });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const body = await request.json();

  const assessment = await prisma.assessment.findUnique({ where: { id } });
  if (!assessment) return notFound("Assessment not found");

  const updated = await prisma.assessment.update({
    where: { id },
    data: {
      executiveSummary: body.executiveSummary,
      internalNotes: body.internalNotes,
      assessmentName: body.assessmentName,
      assessmentDate: body.assessmentDate
        ? new Date(body.assessmentDate)
        : undefined,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const assessment = await prisma.assessment.findUnique({ where: { id } });

  if (!assessment) return notFound("Assessment not found");
  if (assessment.status !== "draft") {
    return NextResponse.json(
      { error: "Only draft assessments can be deleted", code: "CONFLICT" },
      { status: 409 },
    );
  }

  if (user.role === "technician" && assessment.assessorUserId !== user.id) {
    return NextResponse.json(
      { error: "Insufficient permissions", code: "FORBIDDEN" },
      { status: 403 },
    );
  }

  await prisma.assessment.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
