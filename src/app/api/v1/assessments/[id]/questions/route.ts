import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAssessmentPreview } from "@/lib/assessments";
import {
  getSessionUserWithClient,
  isStaffRole,
  requireAssessmentAccess,
} from "@/lib/api/access";
import { sanitizeAssessmentQuestionCategories } from "@/lib/assessments/response-view";
import { notFound, unauthorized } from "@/lib/api/helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const access = await requireAssessmentAccess(user, id);
  if ("response" in access) return access.response;

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    select: {
      id: true,
      sourceAssessmentId: true,
      sourceAssessment: { select: { id: true, assessmentName: true, completedAt: true } },
      assessor: { select: { role: true } },
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

  const isStaff = isStaffRole(user.role);
  const customerSelfAssessment = assessment.assessor.role === "client";

  const mappedCategories = categories.map((category) => ({
    id: category.id,
    code: category.code,
    name: category.name,
    businessQuestion: category.description,
    maxPoints: category.maxPoints,
    questions: category.questions.map((question) => {
      const previous = previousByQuestion.get(question.id);
      const response = responseByQuestion.get(question.id);
      return {
        id: question.id,
        code: question.code,
        v2QuestionId: question.v2QuestionId,
        capability: isStaff ? question.capability : undefined,
        questionText: question.questionText,
        helpText: question.helpText,
        purpose: isStaff ? question.purpose : undefined,
        evidenceRequired: question.evidenceRequired,
        responseType: question.responseType,
        weight: isStaff ? question.weight : undefined,
        answerOptions: question.answerOptions.map((option) => ({
          id: option.id,
          answerText: option.answerText,
          triggersCriticalFlag: option.triggersCriticalFlag,
          triggersRecommendation: isStaff ? option.triggersRecommendation : undefined,
        })),
        response: response
          ? {
              selectedAnswerOptionId: response.selectedAnswerOptionId,
              notes: response.notes,
              evidence: isStaff ? response.evidence : null,
              updatedAt: response.updatedAt.toISOString(),
              scoreEarned: isStaff ? response.scoreEarned : undefined,
            }
          : null,
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
  }));

  const sanitizedCategories = sanitizeAssessmentQuestionCategories(mappedCategories, {
    isStaff,
    customerSelfAssessment,
  });

  return NextResponse.json({
    preview,
    reassessment: assessment.sourceAssessmentId
      ? {
          sourceAssessmentId: assessment.sourceAssessmentId,
          sourceAssessmentName: assessment.sourceAssessment?.assessmentName ?? null,
          sourceCompletedAt: assessment.sourceAssessment?.completedAt?.toISOString() ?? null,
        }
      : null,
    categories: sanitizedCategories,
  });
}
