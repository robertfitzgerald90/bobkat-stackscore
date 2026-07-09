import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, getSessionUser, unauthorized } from "@/lib/api/helpers";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  if (user.role !== "client") {
    return NextResponse.json({ complete: true });
  }

  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      onboardingCompletedAt: true,
      client: {
        select: {
          id: true,
          companyName: true,
          primaryContactName: true,
          primaryContactEmail: true,
        },
      },
    },
  });

  if (!record?.client) {
    return badRequest("Client workspace not found");
  }

  return NextResponse.json({
    complete: Boolean(record.onboardingCompletedAt),
    client: record.client,
  });
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "client") {
    return badRequest("Only client accounts complete onboarding");
  }

  const body = await request.json();
  const companyName = typeof body.companyName === "string" ? body.companyName.trim() : "";
  const primaryContactName =
    typeof body.primaryContactName === "string" ? body.primaryContactName.trim() : "";

  if (!companyName || !primaryContactName) {
    return badRequest("Company name and contact name are required");
  }

  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { clientId: true },
  });

  if (!record?.clientId) {
    return badRequest("Client workspace not found");
  }

  await prisma.$transaction([
    prisma.client.update({
      where: { id: record.clientId },
      data: { companyName, primaryContactName },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        name: primaryContactName,
        onboardingCompletedAt: new Date(),
      },
    }),
  ]);

  return NextResponse.json({ complete: true });
}
