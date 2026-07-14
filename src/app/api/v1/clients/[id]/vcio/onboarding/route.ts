import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { getSessionUserWithClient, requireClientWorkspaceAccess } from "@/lib/api/access";
import { unauthorized } from "@/lib/api/helpers";
import { prisma } from "@/lib/db";
import { getClientVcioEntitlement } from "@/lib/vcio/entitlements";
import {
  calculateOnboardingPercentage,
  detectVcioCustomerType,
  nextOnboardingStep,
} from "@/lib/vcio/onboarding";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function requireAccess(clientId: string) {
  const user = await getSessionUserWithClient();
  if (!user) return { error: unauthorized() } as const;
  const denied = await requireClientWorkspaceAccess(user, clientId);
  if (denied) return { error: denied } as const;
  return { user } as const;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id: clientId } = await context.params;
  const access = await requireAccess(clientId);
  if ("error" in access) return access.error;

  const entitlement = await getClientVcioEntitlement(clientId);
  if (!entitlement.hasSubscription) {
    return NextResponse.json({ error: "StackScore vCIO is not active for this workspace." }, { status: 404 });
  }

  const onboarding = await prisma.vcioOnboarding.findUnique({
    where: { clientId },
  });

  return NextResponse.json({ onboarding, entitlement });
}

export async function PUT(request: Request, context: RouteContext) {
  const { id: clientId } = await context.params;
  const access = await requireAccess(clientId);
  if ("error" in access) return access.error;

  const entitlement = await getClientVcioEntitlement(clientId);
  if (!entitlement.hasSubscription) {
    return NextResponse.json({ error: "StackScore vCIO is not active for this workspace." }, { status: 404 });
  }

  const body = (await request.json()) as {
    businessInfo?: unknown;
    leadership?: unknown;
    environment?: unknown;
    planning?: unknown;
    assessmentStatus?: string;
    strategySessionScheduledAt?: string | null;
    currentStep?: string;
    complete?: boolean;
  };
  const customerType = await detectVcioCustomerType(clientId);
  const currentStep = body.complete
    ? "complete"
    : nextOnboardingStep(customerType, body.currentStep ?? "welcome");
  const completionPercentage = calculateOnboardingPercentage(
    customerType,
    currentStep,
    Boolean(body.complete),
  );

  const onboarding = await prisma.vcioOnboarding.upsert({
    where: { clientId },
    create: {
      clientId,
      subscriptionId: entitlement.subscriptionId,
      status: body.complete ? "completed" : "in_progress",
      customerType,
      currentStep,
      completionPercentage,
      baselineRequired: body.assessmentStatus !== "completed",
      businessInfoJson: (body.businessInfo ?? {}) as Prisma.InputJsonValue,
      leadershipJson: (body.leadership ?? {}) as Prisma.InputJsonValue,
      environmentJson: (body.environment ?? {}) as Prisma.InputJsonValue,
      planningJson: (body.planning ?? {}) as Prisma.InputJsonValue,
      assessmentStatus: body.assessmentStatus ?? null,
      strategySessionScheduledAt: body.strategySessionScheduledAt
        ? new Date(body.strategySessionScheduledAt)
        : null,
      completedAt: body.complete ? new Date() : null,
    },
    update: {
      subscriptionId: entitlement.subscriptionId,
      status: body.complete ? "completed" : "in_progress",
      customerType,
      currentStep,
      completionPercentage,
      baselineRequired: body.assessmentStatus !== "completed",
      businessInfoJson: (body.businessInfo ?? {}) as Prisma.InputJsonValue,
      leadershipJson: (body.leadership ?? {}) as Prisma.InputJsonValue,
      environmentJson: (body.environment ?? {}) as Prisma.InputJsonValue,
      planningJson: (body.planning ?? {}) as Prisma.InputJsonValue,
      assessmentStatus: body.assessmentStatus ?? null,
      strategySessionScheduledAt: body.strategySessionScheduledAt
        ? new Date(body.strategySessionScheduledAt)
        : null,
      completedAt: body.complete ? new Date() : undefined,
    },
  });

  return NextResponse.json({ onboarding });
}
