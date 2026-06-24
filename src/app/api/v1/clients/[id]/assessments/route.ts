import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
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

  const totalQuestions = await prisma.assessmentQuestion.count({
    where: { isActive: true },
  });

  return NextResponse.json(
    {
      ...assessment,
      progress: { answered: 0, total: totalQuestions },
    },
    { status: 201 },
  );
}
