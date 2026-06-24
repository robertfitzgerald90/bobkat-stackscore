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

  const responseByQuestion = new Map(
    responses.map((response) => [response.questionId, response]),
  );

  return NextResponse.json({
    categories: categories.map((category) => ({
      id: category.id,
      code: category.code,
      name: category.name,
      maxPoints: category.maxPoints,
      questions: category.questions.map((question) => ({
        id: question.id,
        code: question.code,
        questionText: question.questionText,
        helpText: question.helpText,
        weight: question.weight,
        answerOptions: question.answerOptions,
        response: responseByQuestion.get(question.id) ?? null,
      })),
    })),
  });
}
