import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getRecommendationsTriggeredByAssessment } from "@/lib/recommendations/queries";
import {
  conflict,
  forbidden,
  notFound,
  requireAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import {
  getSessionUserWithClient,
  isStaffRole,
  requireAssessmentAccess,
} from "@/lib/api/access";
import { deleteAssessmentPermanently } from "@/lib/records";
import { parseDeleteConfirmation } from "@/lib/records/validate";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const access = await requireAssessmentAccess(user, id);
  if ("response" in access) return access.response;

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
    },
  });

  if (!assessment) return notFound("Assessment not found");

  const recommendations =
    assessment.status === "completed"
      ? await getRecommendationsTriggeredByAssessment(id)
      : await prisma.assessmentRecommendation.findMany({
          where: { assessmentId: id },
          orderBy: [{ priority: "asc" }, { estimatedImpactPoints: "desc" }],
          include: { category: true },
        });

  const totalQuestions = await prisma.assessmentQuestion.count({
    where: { isActive: true },
  });

  return NextResponse.json({
    ...assessment,
    recommendations,
    progress: {
      answered: assessment.responses.length,
      total: totalQuestions,
    },
  });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();
  if (!isStaffRole(user.role)) {
    return forbidden();
  }

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

export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();

  const denied = requireAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const confirmationError = parseDeleteConfirmation(body);
  if (confirmationError) return confirmationError;

  const assessment = await prisma.assessment.findUnique({ where: { id } });
  if (!assessment) return notFound("Assessment not found");

  try {
    await deleteAssessmentPermanently(id, user.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return conflict(error instanceof Error ? error.message : "Unable to delete assessment");
  }
}
