import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, requireAdmin, unauthorized } from "@/lib/api/helpers";
import { validateQuestionLibrary } from "@/lib/assessment-library/validate";
import { EXPECTED_V2_QUESTION_COUNT } from "@/lib/assessment-library/v2-catalog";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireAdmin(user);
  if (denied) return denied;

  const includeArchived = request.nextUrl.searchParams.get("includeArchived") === "true";

  const categoryWhere = includeArchived ? {} : { isActive: true };
  const questionWhere = includeArchived ? {} : { isActive: true };

  const [categories, questions, activeTemplates, archivedCategoryCount, archivedQuestionCount] =
    await Promise.all([
      prisma.assessmentCategory.findMany({
        where: categoryWhere,
        orderBy: { displayOrder: "asc" },
        include: {
          questions: {
            where: questionWhere,
            select: { id: true },
          },
        },
      }),
      prisma.assessmentQuestion.findMany({
        where: questionWhere,
        orderBy: [{ category: { displayOrder: "asc" } }, { displayOrder: "asc" }],
        include: {
          category: { select: { code: true, name: true } },
          _count: { select: { answerOptions: true } },
        },
      }),
      prisma.recommendationTemplate.count({ where: { isActive: true } }),
      prisma.assessmentCategory.count({ where: { isActive: false } }),
      prisma.assessmentQuestion.count({ where: { isActive: false } }),
    ]);

  const allQuestionsForValidation = await prisma.assessmentQuestion.findMany({
    where: { isActive: true },
    select: {
      code: true,
      v2QuestionId: true,
      capability: true,
      isActive: true,
      category: { select: { code: true } },
    },
  });

  const validation = validateQuestionLibrary(
    allQuestionsForValidation.map((question) => ({
      code: question.code,
      v2QuestionId: question.v2QuestionId,
      categoryCode: question.category.code,
      capability: question.capability,
      isActive: question.isActive,
    })),
  );

  return NextResponse.json({
    includeArchived,
    categories: categories.map((category) => ({
      id: category.id,
      code: category.code,
      name: category.name,
      description: category.description,
      maxPoints: category.maxPoints,
      displayOrder: category.displayOrder,
      v2CategoryCode: category.v2CategoryCode,
      v2DisplayName: category.v2DisplayName,
      isActive: category.isActive,
      questionCount: category.questions.length,
    })),
    questions: questions.map((question) => ({
      id: question.id,
      code: question.code,
      v2QuestionId: question.v2QuestionId,
      categoryCode: question.category.code,
      categoryName: question.category.name,
      questionText: question.questionText,
      capability: question.capability,
      purpose: question.purpose,
      responseType: question.responseType,
      weight: question.weight,
      riskLevel: question.riskLevel,
      isActive: question.isActive,
      answerOptionCount: question._count.answerOptions,
    })),
    stats: {
      activeCategories: categories.filter((category) => category.isActive).length,
      activeQuestions: allQuestionsForValidation.length,
      expectedActiveQuestions: EXPECTED_V2_QUESTION_COUNT,
      activeTemplates,
      archivedCategories: archivedCategoryCount,
      archivedQuestions: archivedQuestionCount,
    },
    validation,
  });
}
