import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, requireAdmin, unauthorized } from "@/lib/api/helpers";
import { validateQuestionLibrary } from "@/lib/assessment-library/validate";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireAdmin(user);
  if (denied) return denied;

  const [categories, questions, templates] = await Promise.all([
    prisma.assessmentCategory.findMany({
      orderBy: { displayOrder: "asc" },
      include: { _count: { select: { questions: true } } },
    }),
    prisma.assessmentQuestion.findMany({
      orderBy: [{ category: { displayOrder: "asc" } }, { displayOrder: "asc" }],
      include: {
        category: { select: { code: true, name: true } },
        _count: { select: { answerOptions: true } },
      },
    }),
    prisma.recommendationTemplate.count({ where: { isActive: true } }),
  ]);

  const validation = validateQuestionLibrary(
    questions.map((q) => ({
      code: q.code,
      v2QuestionId: q.v2QuestionId,
      capability: q.capability,
      isActive: q.isActive,
    })),
  );

  return NextResponse.json({
    categories: categories.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      description: c.description,
      maxPoints: c.maxPoints,
      displayOrder: c.displayOrder,
      v2CategoryCode: c.v2CategoryCode,
      v2DisplayName: c.v2DisplayName,
      isActive: c.isActive,
      questionCount: c._count.questions,
    })),
    questions: questions.map((q) => ({
      id: q.id,
      code: q.code,
      v2QuestionId: q.v2QuestionId,
      categoryCode: q.category.code,
      categoryName: q.category.name,
      questionText: q.questionText,
      capability: q.capability,
      purpose: q.purpose,
      responseType: q.responseType,
      weight: q.weight,
      riskLevel: q.riskLevel,
      isActive: q.isActive,
      answerOptionCount: q._count.answerOptions,
    })),
    stats: {
      activeCategories: categories.filter((c) => c.isActive).length,
      activeQuestions: questions.filter((q) => q.isActive).length,
      activeTemplates: templates,
    },
    validation,
  });
}
