import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAssessmentPreview } from "@/lib/assessments";
import { getSessionUser, notFound, unauthorized } from "@/lib/api/helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id } = await context.params;

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    select: {
      id: true,
      sourceAssessmentId: true,
      sourceAssessment: { select: { id: true, assessmentName: true, completedAt: true } },
    },
  });
  if (!assessment) return notFound("Assessment not found");

  const categories = await prisma.assessmentCategory.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    include: {
      questions: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        include: {
          answerOptions: { orderBy: { displayOrder: "asc" } },
        },
      },
    },
  });

  const responses = await prisma.assessmentResponse.findMany({
    where: { assessmentId: id },
  });

  const previousResponses = assessment.sourceAssessmentId
    ? await prisma.assessmentResponse.findMany({
        where: { assessmentId: assessment.sourceAssessmentId },
        include: { selectedAnswerOption: { select: { answerText: true } } },
      })
    : [];

  const responseByQuestion = new Map(
    responses.map((response) => [response.questionId, response]),
  );

  const previousByQuestion = new Map(
    previousResponses.map((response) => [response.questionId, response]),
  );

  const preview = await getAssessmentPreview(id);

  return NextResponse.json({
    preview,
    reassessment: assessment.sourceAssessmentId
      ? {
          sourceAssessmentId: assessment.sourceAssessmentId,
          sourceAssessmentName: assessment.sourceAssessment?.assessmentName ?? null,
          sourceCompletedAt: assessment.sourceAssessment?.completedAt?.toISOString() ?? null,
        }
      : null,
    categories: categories.map((category) => ({
      id: category.id,
      code: category.code,
      name: category.name,
      maxPoints: category.maxPoints,
      questions: category.questions.map((question) => {
        const previous = previousByQuestion.get(question.id);
        return {
          id: question.id,
          code: question.code,
          questionText: question.questionText,
          helpText: question.helpText,
          weight: question.weight,
          answerOptions: question.answerOptions,
          response: responseByQuestion.get(question.id) ?? null,
          previousResponse: previous
            ? {
                selectedAnswerOptionId: previous.selectedAnswerOptionId,
                answerText: previous.selectedAnswerOption.answerText,
                scoreEarned: previous.scoreEarned,
                notes: previous.notes,
              }
            : null,
        };
      }),
    })),
  });
}
