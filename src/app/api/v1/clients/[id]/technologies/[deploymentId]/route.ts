import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getSessionUser,
  notFound,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { deleteClientTechnology } from "@/lib/client-technology";
import { requireVcioFeatureWriteAccess } from "@/lib/vcio/feature-unlocks";

type RouteContext = { params: Promise<{ id: string; deploymentId: string }> };

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id: clientId, deploymentId } = await context.params;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true },
  });
  if (!client) return notFound("Client not found");
  const vcioDenied = await requireVcioFeatureWriteAccess(clientId, "technology_lifecycle");
  if (vcioDenied) return vcioDenied;

  const removed = await deleteClientTechnology(clientId, deploymentId);
  if (!removed) return notFound("Deployment not found");

  return new NextResponse(null, { status: 204 });
}
