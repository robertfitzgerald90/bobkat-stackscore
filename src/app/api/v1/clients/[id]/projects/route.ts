import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
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

  const project = await prisma.project.create({
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
  });

  return NextResponse.json(project, { status: 201 });
}
