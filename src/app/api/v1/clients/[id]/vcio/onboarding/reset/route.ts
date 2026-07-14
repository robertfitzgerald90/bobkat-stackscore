import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, requireConsultantOrAdmin, unauthorized } from "@/lib/api/helpers";
import { prisma } from "@/lib/db";
import { detectVcioCustomerType } from "@/lib/vcio/onboarding";
import { recordOrganizationActivity } from "@/lib/communications/activity/record-activity";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, { params }: RouteProps) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id: clientId } = await params;
  const customerType = await detectVcioCustomerType(clientId);

  await prisma.vcioOnboarding.upsert({
    where: { clientId },
    create: {
      clientId,
      status: "not_started",
      customerType,
      currentStep: "welcome",
      completionPercentage: 0,
      resetAt: new Date(),
      resetByUserId: user.id,
    },
    update: {
      status: "not_started",
      customerType,
      currentStep: "welcome",
      completionPercentage: 0,
      completedAt: null,
      resetAt: new Date(),
      resetByUserId: user.id,
    },
  });

  await recordOrganizationActivity({
    clientId,
    userId: user.id,
    category: "COMMUNICATIONS",
    eventType: "vcio_onboarding_reset",
    title: "StackScore vCIO onboarding reset",
    description: "StackScore vCIO onboarding progress was reset by an administrator.",
    visibility: "INTERNAL",
    metadata: { customerType },
  });

  return NextResponse.json({ ok: true });
}
