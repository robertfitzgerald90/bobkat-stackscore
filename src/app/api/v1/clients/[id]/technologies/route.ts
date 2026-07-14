import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  badRequest,
  forbidden,
  getSessionUser,
  notFound,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import {
  createClientTechnology,
  getClientTechnologies,
} from "@/lib/client-technology";
import { requireVcioFeatureWriteAccess } from "@/lib/vcio/feature-unlocks";

type RouteContext = { params: Promise<{ id: string }> };

async function assertClientAccess(clientId: string, userId: string, role: string) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true },
  });

  if (!client) return null;

  if (role === "client") {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { clientId: true },
    });
    if (user?.clientId !== clientId) return "forbidden";
  }

  return client.id;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id: clientId } = await context.params;
  const access = await assertClientAccess(clientId, user.id, user.role);
  if (!access) return notFound("Client not found");
  if (access === "forbidden") return forbidden();

  const deployments = await getClientTechnologies(clientId);
  return NextResponse.json(deployments);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id: clientId } = await context.params;
  const access = await assertClientAccess(clientId, user.id, user.role);
  if (!access) return notFound("Client not found");
  const vcioDenied = await requireVcioFeatureWriteAccess(clientId, "technology_lifecycle");
  if (vcioDenied) return vcioDenied;

  const body = await request.json().catch(() => null);
  if (!body?.technologyId) return badRequest("technologyId is required");

  try {
    const deployment = await createClientTechnology(clientId, body);
    return NextResponse.json(deployment, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to assign technology";
    return badRequest(message);
  }
}
