import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserWithClient, requireClientWorkspaceAccess } from "@/lib/api/access";
import {
  conflict,
  getSessionUser,
  notFound,
  requireAdmin,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { deleteClientPermanently } from "@/lib/records";
import { parseDeleteConfirmation } from "@/lib/records/validate";
import type { UserRole } from "@/generated/prisma/client";

type RouteContext = { params: Promise<{ id: string }> };

type ClientDetail = {
  notes: string | null;
  assessments?: Array<{ internalNotes?: string | null }>;
};

function presentClientDetail<T extends ClientDetail>(client: T, role: UserRole): T {
  if (role !== "client") return client;
  return {
    ...client,
    notes: null,
    assessments: client.assessments?.map((assessment) => ({
      ...assessment,
      internalNotes: null,
    })),
  };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const denied = await requireClientWorkspaceAccess(user, id);
  if (denied) return denied;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      assessments: { orderBy: { createdAt: "desc" } },
      scoreHistory: { orderBy: { recordedDate: "desc" }, take: 12 },
      projects: { orderBy: { updatedAt: "desc" }, take: 10 },
    },
  });

  if (!client) return notFound("Client not found");

  return NextResponse.json(presentClientDetail(client, user.role));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;
  const body = await request.json();

  const client = await prisma.client.update({
    where: { id },
    data: {
      companyName: body.companyName,
      primaryContactName: body.primaryContactName,
      primaryContactEmail: body.primaryContactEmail,
      primaryContactPhone: body.primaryContactPhone,
      industry: body.industry,
      employeeCount: body.employeeCount,
      deviceCount: body.deviceCount,
      locationCity: body.locationCity,
      locationState: body.locationState,
      status: body.status,
      notes: body.notes,
    },
  });

  return NextResponse.json(client);
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

  const existing = await prisma.client.findUnique({ where: { id } });
  if (!existing) return notFound("Client not found");

  try {
    await deleteClientPermanently(id, user.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return conflict(error instanceof Error ? error.message : "Unable to delete client");
  }
}
