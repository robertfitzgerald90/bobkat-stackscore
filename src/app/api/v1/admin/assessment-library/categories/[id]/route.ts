import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  badRequest,
  getSessionUser,
  notFound,
  requireAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import {
  isLegacyModeRequest,
  LEGACY_MODE_REQUIRED_MESSAGE,
  requiresLegacyModeForCategoryActivation,
} from "@/lib/assessment-library/legacy-guards";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;
  const body = await request.json();

  const existing = await prisma.assessmentCategory.findUnique({ where: { id } });
  if (!existing) return notFound("Category not found");

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

  if (Object.keys(data).length === 0) {
    return badRequest("No valid fields to update");
  }

  if (
    body.isActive !== undefined &&
    requiresLegacyModeForCategoryActivation(existing.code, Boolean(body.isActive)) &&
    !isLegacyModeRequest(body)
  ) {
    return badRequest(LEGACY_MODE_REQUIRED_MESSAGE, "LEGACY_MODE_REQUIRED");
  }

  const category = await prisma.assessmentCategory.update({
    where: { id },
    data,
  });

  return NextResponse.json(category);
}
