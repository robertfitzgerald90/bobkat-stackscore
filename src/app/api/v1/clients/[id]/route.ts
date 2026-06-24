import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, notFound, unauthorized } from "@/lib/api/helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id } = await context.params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      assessments: { orderBy: { createdAt: "desc" } },
      scoreHistory: { orderBy: { recordedDate: "desc" }, take: 12 },
      projects: { orderBy: { updatedAt: "desc" }, take: 10 },
    },
  });

  if (!client) return notFound("Client not found");

  return NextResponse.json(client);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

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
