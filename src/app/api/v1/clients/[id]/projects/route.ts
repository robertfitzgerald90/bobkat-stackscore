import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  conflict,
  getSessionUser,
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
  const status = searchParams.get("status") ?? undefined;

  const where = {
    clientId,
    ...(status ? { status: status as never } : {}),
  };

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        category: true,
        assignedUser: { select: { id: true, name: true, email: true } },
        recommendation: true,
      },
    }),
    prisma.project.count({ where }),
  ]);

  return paginatedResponse(projects, total, page, limit);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id: clientId } = await context.params;
  const body = await request.json();

  if (body.recommendationId) {
    const existing = await prisma.project.findUnique({
      where: { recommendationId: body.recommendationId },
    });
    if (existing) {
      return conflict("A project already exists for this recommendation");
    }
  }

  const project = await prisma.$transaction(async (tx) => {
    const created = await tx.project.create({
      data: {
        clientId,
        recommendationId: body.recommendationId ?? null,
        title: body.title,
        description: body.description ?? null,
        priority: body.priority,
        categoryId: body.categoryId,
        assignedUserId: body.assignedUserId ?? null,
        estimatedImpactPoints: body.estimatedImpactPoints ?? null,
        estimatedCost: body.estimatedCost ?? null,
        targetCompletionDate: body.targetCompletionDate
          ? new Date(body.targetCompletionDate)
          : null,
        status: "proposed",
      },
      include: {
        category: true,
        recommendation: true,
      },
    });

    if (body.recommendationId) {
      await tx.assessmentRecommendation.update({
        where: { id: body.recommendationId },
        data: { status: "accepted" },
      });
    }

    return created;
  });

  return NextResponse.json(project, { status: 201 });
}
