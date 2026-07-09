import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAssessmentPreview } from "@/lib/assessments";
import {
  badRequest,
  conflict,
  notFound,
  unauthorized,
} from "@/lib/api/helpers";
import {
  getSessionUserWithClient,
  requireAssessmentAccess,
} from "@/lib/api/access";

type RouteContext = { params: Promise<{ id: string; questionId: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();

  const { id, questionId } = await context.params;
  const access = await requireAssessmentAccess(user, id);
  if ("response" in access) return access.response;

  const assessment = access.assessment;
  const body = await request.json();

  if (assessment.status !== "draft") {
    return conflict("Cannot modify a completed assessment");
  }

  const existingResponse = await prisma.assessmentResponse.findUnique({
    where: {
      assessmentId_questionId: {
        assessmentId: id,
        questionId,
      },
    },
  });

  if (!body.selectedAnswerOptionId) {
    if (!existingResponse) {
      return badRequest("Select an answer before saving notes");
    }

    const response = await prisma.assessmentResponse.update({
      where: {
        assessmentId_questionId: {
          assessmentId: id,
          questionId,
        },
      },
      data: {
        ...(body.notes !== undefined ? { notes: body.notes || null } : {}),
        ...(body.evidence !== undefined ? { evidence: body.evidence || null } : {}),
      },
    });

    const preview = await getAssessmentPreview(id);
    return NextResponse.json({ ...response, preview });
  }

  const answerOption = await prisma.answerOption.findUnique({
    where: { id: body.selectedAnswerOptionId },
    include: { question: true },
  });

  if (!answerOption || answerOption.questionId !== questionId) {
    return badRequest("Invalid answer option for question");
  }

  const response = await prisma.assessmentResponse.upsert({
    where: {
      assessmentId_questionId: {
        assessmentId: id,
        questionId,
      },
    },
    update: {
      selectedAnswerOptionId: body.selectedAnswerOptionId,
      scoreEarned: answerOption.scoreValue,
      ...(body.notes !== undefined ? { notes: body.notes || null } : {}),
      ...(body.evidence !== undefined ? { evidence: body.evidence || null } : {}),
    },
    create: {
      assessmentId: id,
      questionId,
      selectedAnswerOptionId: body.selectedAnswerOptionId,
      scoreEarned: answerOption.scoreValue,
      notes: body.notes ?? null,
      evidence: body.evidence ?? null,
    },
  });

  const preview = await getAssessmentPreview(id);

  return NextResponse.json({ ...response, preview });
}
