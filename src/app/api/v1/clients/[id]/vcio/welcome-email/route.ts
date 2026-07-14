import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  getSessionUser,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { prisma } from "@/lib/db";
import {
  activationTokenExpiresAt,
  generateActivationToken,
  normalizePurchaserEmail,
} from "@/lib/stripe/fulfillment/helpers";
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
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      companyName: true,
      primaryContactName: true,
      primaryContactEmail: true,
      users: {
        where: { role: "client" },
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { id: true, email: true, isActive: true },
      },
      technologyProfile: { select: { overallStackScore: true } },
      vcioOnboarding: { select: { customerType: true } },
    },
  });

  if (!client?.primaryContactEmail) {
    return badRequest("Client primary contact email is required");
  }

  const recipientEmail = normalizePurchaserEmail(client.primaryContactEmail);
  const clientUser = client.users[0] ?? null;
  let activationToken: string | undefined;

  if (clientUser && !clientUser.isActive) {
    const token = generateActivationToken();
    activationToken = token.rawToken;
    await prisma.accountActivationToken.create({
      data: {
        userId: clientUser.id,
        tokenHash: token.tokenHash,
        expiresAt: activationTokenExpiresAt(),
      },
    });
  }

  const customerType = client.vcioOnboarding?.customerType ?? (await detectVcioCustomerType(clientId));
  await initializeVcioClient({
    organizationId: clientId,
    source: "MANUAL",
    sendWelcomeEmail: true,
    welcomeRecipientEmail: recipientEmail,
    scenarioOverride: customerType,
    actorUserId: user.id,
    activationToken,
    welcomeIdempotencyKey: `vcio-welcome:${clientId}:manual:${Date.now()}`,
    initializationIdempotencyKey: `vcio-onboarding:${clientId}:manual`,
  });

  await recordOrganizationActivity({
    clientId,
    userId: user.id,
    category: "COMMUNICATIONS",
    eventType: "vcio_welcome_email_manual_resend",
    title: "StackScore vCIO welcome email resent",
    description: `StackScore vCIO welcome email was manually resent to ${recipientEmail}.`,
    visibility: "INTERNAL",
    metadata: {
      templateKey: "EMAIL-010",
      customerType,
      recipientEmail,
    },
  });

  return NextResponse.json({ ok: true });
}
