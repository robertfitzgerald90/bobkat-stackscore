import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, requireConsultantOrAdmin, unauthorized } from "@/lib/api/helpers";
import { detectVcioCustomerType } from "@/lib/vcio/onboarding";
import { recordOrganizationActivity } from "@/lib/communications/activity/record-activity";
import { initializeVcioClient } from "@/lib/vcio/initialization";

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

  await initializeVcioClient({
    organizationId: clientId,
    source: "MANUAL",
    sendWelcomeEmail: false,
    scenarioOverride: customerType,
    resetExisting: true,
    actorUserId: user.id,
    initializationIdempotencyKey: `vcio-onboarding:${clientId}:manual-reset:${Date.now()}`,
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
