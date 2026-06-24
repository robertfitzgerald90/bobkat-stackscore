import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  badRequest,
  conflict,
  getSessionUser,
  notFound,
  paginatedResponse,
  parsePagination,
  unauthorized,
} from "@/lib/api/helpers";
import { createProjectSchema } from "@/lib/projects/schemas";
import { projectInclude, serializeProject } from "@/lib/projects/serialize";

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
      include: projectInclude,
    }),
    prisma.project.count({ where }),
  ]);

  return paginatedResponse(
    projects.map(serializeProject),
    total,
    page,
    limit,
  );
}

export async function POST(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id: clientId } = await context.params;
  const body = await request.json();
  const parsed = createProjectSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid project data");
  }

  const data = parsed.data;

  const recommendation = await prisma.assessmentRecommendation.findUnique({
    where: { id: data.recommendationId },
    select: { id: true, clientId: true, status: true },
  });

  if (!recommendation) {
    return notFound("Recommendation not found");
  }

  if (recommendation.clientId !== clientId) {
    return badRequest("Recommendation does not belong to this client");
  }

  if (recommendation.status === "completed" || recommendation.status === "declined") {
    return badRequest("Cannot create a project from a completed or declined recommendation");
  }

  const existing = await prisma.project.findUnique({
    where: { recommendationId: data.recommendationId },
  });
  if (existing) {
    return conflict("A project already exists for this recommendation");
  }

  const project = await prisma.$transaction(async (tx) => {
    const created = await tx.project.create({
      data: {
        clientId,
        recommendationId: data.recommendationId,
        title: data.title,
        description: data.description ?? null,
        priority: data.priority,
        categoryId: data.categoryId,
        assignedUserId: data.assignedUserId ?? null,
        estimatedImpactPoints: data.estimatedImpactPoints ?? null,
        estimatedCost: data.estimatedCost ?? null,
        targetCompletionDate: data.targetCompletionDate
          ? new Date(data.targetCompletionDate)
          : null,
        status: "proposed",
      },
      include: projectInclude,
    });

    await tx.assessmentRecommendation.update({
      where: { id: data.recommendationId },
      data: { status: "accepted" },
    });

    return created;
  });

  return NextResponse.json(serializeProject(project), { status: 201 });
}
