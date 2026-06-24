import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  badRequest,
  conflict,
  getSessionUser,
  notFound,
  requireAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { deleteRecommendationPermanently } from "@/lib/records";
import { parseDeleteConfirmation } from "@/lib/records/validate";
import type { RecommendationStatus } from "@/generated/prisma/client";

const VALID_STATUSES: RecommendationStatus[] = [
  "open",
  "accepted",
  "in_progress",
  "completed",
  "deferred",
  "declined",
  "archived",
];

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const body = await request.json();

  const recommendation = await prisma.assessmentRecommendation.findUnique({
    where: { id },
  });

  if (!recommendation) return notFound("Recommendation not found");

  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return badRequest("Invalid recommendation status");
  }

  const updated = await prisma.assessmentRecommendation.update({
    where: { id },
    data: {
      ...(body.status ? { status: body.status as RecommendationStatus } : {}),
      ...(body.title ? { title: body.title } : {}),
      ...(body.description ? { description: body.description } : {}),
      ...(body.priority ? { priority: body.priority } : {}),
      completedAt:
        body.status === "completed"
          ? new Date()
          : body.status && body.status !== "completed"
            ? null
            : undefined,
    },
    include: {
      category: true,
      project: { select: { id: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const denied = requireAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const confirmationError = parseDeleteConfirmation(body);
  if (confirmationError) return confirmationError;

  const existing = await prisma.assessmentRecommendation.findUnique({ where: { id } });
  if (!existing) return notFound("Recommendation not found");

  try {
    await deleteRecommendationPermanently(id, user.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return conflict(error instanceof Error ? error.message : "Unable to delete recommendation");
  }
}
