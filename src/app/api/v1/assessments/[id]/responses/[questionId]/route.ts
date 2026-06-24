import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAssessmentPreview } from "@/lib/assessments";
import {
  badRequest,
  conflict,
  getSessionUser,
  notFound,
  unauthorized,
} from "@/lib/api/helpers";

type RouteContext = { params: Promise<{ id: string; questionId: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id, questionId } = await context.params;
  const body = await request.json();

  const assessment = await prisma.assessment.findUnique({ where: { id } });
  if (!assessment) return notFound("Assessment not found");
  if (assessment.status !== "draft") {
    return conflict("Cannot modify a completed assessment");
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
      notes: body.notes ?? null,
      evidence: body.evidence ?? null,
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

  return NextResponse.json({
    ...response,
    preview: preview
      ? {
          overallScore: preview.overallScore,
          overallRating: preview.overallRating,
        }
      : null,
  });
}
