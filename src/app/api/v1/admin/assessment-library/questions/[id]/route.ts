import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  badRequest,
  getSessionUser,
  notFound,
  requireAdmin,
  unauthorized,
} from "@/lib/api/helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;

  const question = await prisma.assessmentQuestion.findUnique({
    where: { id },
    include: {
      category: true,
      answerOptions: {
        orderBy: { displayOrder: "asc" },
        include: { recommendationTemplate: { select: { code: true, title: true } } },
      },
    },
  });

  if (!question) return notFound("Question not found");
  return NextResponse.json(question);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;
  const body = await request.json();

  const existing = await prisma.assessmentQuestion.findUnique({ where: { id } });
  if (!existing) return notFound("Question not found");

  const allowedFields = [
    "questionText",
    "helpText",
    "purpose",
    "capability",
    "evidenceRequired",
    "relatedService",
    "relatedPlaybook",
    "adminNotes",
    "isActive",
    "riskLevel",
  ] as const;

  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }

  if (Object.keys(data).length === 0) {
    return badRequest("No valid fields to update");
  }

  const question = await prisma.assessmentQuestion.update({
    where: { id },
    data,
    include: { category: { select: { code: true, name: true } } },
  });

  return NextResponse.json(question);
}
