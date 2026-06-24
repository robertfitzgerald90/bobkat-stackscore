import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createReassessment } from "@/lib/assessments/reassessment";
import {
  badRequest,
  getSessionUser,
  notFound,
  paginatedResponse,
  parsePagination,
  unauthorized,
} from "@/lib/api/helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id: clientId } = await context.params;
  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = parsePagination(searchParams);

  const [assessments, total] = await Promise.all([
    prisma.assessment.findMany({
      where: { clientId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        assessor: { select: { id: true, name: true, email: true } },
        sourceAssessment: { select: { id: true, assessmentName: true } },
      },
    }),
    prisma.assessment.count({ where: { clientId } }),
  ]);

  return paginatedResponse(assessments, total, page, limit);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id: clientId } = await context.params;
  const body = await request.json();

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return notFound("Client not found");

  const totalQuestions = await prisma.assessmentQuestion.count({
    where: { isActive: true },
  });

  try {
    if (body.reassessment || body.sourceAssessmentId) {
      const assessment = await createReassessment({
        clientId,
        assessorUserId: user.id,
        assessmentName: body.assessmentName ?? `Reassessment ${new Date().toLocaleDateString()}`,
        assessmentType: body.assessmentType ?? "followup",
        assessmentDate: body.assessmentDate ? new Date(body.assessmentDate) : new Date(),
        sourceAssessmentId: body.sourceAssessmentId,
      });

      const answered = await prisma.assessmentResponse.count({
        where: { assessmentId: assessment.id },
      });

      return NextResponse.json(
        {
          ...assessment,
          progress: { answered, total: totalQuestions },
          reassessment: true,
        },
        { status: 201 },
      );
    }

    const assessment = await prisma.assessment.create({
      data: {
        clientId,
        assessorUserId: user.id,
        assessmentName: body.assessmentName,
        assessmentType: body.assessmentType,
        assessmentDate: new Date(body.assessmentDate ?? new Date()),
        status: "draft",
      },
    });

    return NextResponse.json(
      {
        ...assessment,
        progress: { answered: 0, total: totalQuestions },
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create assessment";
    return badRequest(message);
  }
}
