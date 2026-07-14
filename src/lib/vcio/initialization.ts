import type { VcioCustomerType } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { getAppUrl } from "@/lib/stripe/app-url";
import { recordBillingAudit } from "@/lib/billing/audit";
import { recordOrganizationActivity } from "@/lib/communications/activity/record-activity";
import { normalizePurchaserEmail } from "@/lib/stripe/fulfillment/helpers";
import {
  calculateOnboardingPercentage,
  detectVcioCustomerType,
  getClientSuccessDashboardPath,
} from "@/lib/vcio/onboarding";
import { sendVcioWelcomeEmail } from "@/lib/vcio/emails";

export type VcioInitializationSource = "STRIPE" | "ADMIN_TEST" | "MANUAL";

type InitializeVcioClientInput = {
  organizationId: string;
  subscriptionId?: string | null;
  source: VcioInitializationSource;
  sendWelcomeEmail: boolean;
  welcomeRecipientEmail?: string | null;
  scenarioOverride?: VcioCustomerType | null;
  resetExisting?: boolean;
  isTest?: boolean;
  actorUserId?: string | null;
  activationToken?: string;
  welcomeIdempotencyKey?: string;
  initializationIdempotencyKey?: string;
  safeLinkBaseUrl?: string;
};

export type VcioInitializationResult = {
  onboardingUrl: string;
  dashboardUrl: string;
  customerType: VcioCustomerType;
  onboardingStatus: string;
  currentStep: string;
  completionPercentage: number;
  welcomeEmailStatus: string | null;
  welcomeEmailRecipient: string | null;
  welcomeEmailSentAt: string | null;
  welcomeEmailMessageId: string | null;
  idempotencyKey: string;
};

function defaultInitializationKey(clientId: string, subscriptionId: string | null, source: string) {
  return `vcio-onboarding:${clientId}:${subscriptionId ?? source.toLowerCase()}`;
}

function defaultWelcomeKey(clientId: string, subscriptionId: string | null, source: string) {
  return `vcio-welcome:${clientId}:${subscriptionId ?? source.toLowerCase()}:1`;
}

export async function initializeVcioClient(
  input: InitializeVcioClientInput,
): Promise<VcioInitializationResult> {
  const client = await prisma.client.findUnique({
    where: { id: input.organizationId },
    select: {
      id: true,
      companyName: true,
      primaryContactName: true,
      primaryContactEmail: true,
      technologyProfile: { select: { overallStackScore: true } },
      users: { where: { role: "client" }, orderBy: { createdAt: "asc" }, take: 1, select: { id: true } },
      vcioOnboarding: {
        select: {
          id: true,
          welcomeEmailIdempotencyKey: true,
          welcomeEmailStatus: true,
          welcomeEmailRecipient: true,
          welcomeEmailSentAt: true,
          welcomeEmailMessageId: true,
        },
      },
    },
  });
  if (!client) throw new Error("Organization not found");

  const customerType = input.scenarioOverride ?? (await detectVcioCustomerType(client.id));
  const initializationIdempotencyKey =
    input.initializationIdempotencyKey ??
    defaultInitializationKey(client.id, input.subscriptionId ?? null, input.source);
  const welcomeEmailIdempotencyKey =
    input.welcomeIdempotencyKey ??
    defaultWelcomeKey(client.id, input.subscriptionId ?? null, input.source);
  const appUrl = input.safeLinkBaseUrl ?? getAppUrl();
  const onboardingUrl = `${appUrl}/portal/vcio/onboarding`;
  const dashboardUrl = `${appUrl}${getClientSuccessDashboardPath(client.id)}`;
  const baselineRequired = customerType === "brand_new";
  const currentStep = "welcome";
  const completionPercentage = calculateOnboardingPercentage(customerType, currentStep, false);

  const onboarding = await prisma.vcioOnboarding.upsert({
    where: { clientId: client.id },
    create: {
      clientId: client.id,
      subscriptionId: input.subscriptionId ?? null,
      status: "not_started",
      customerType,
      currentStep,
      completionPercentage,
      baselineRequired,
      assessmentStatus: customerType === "assessment_customer" ? "completed" : "baseline_required",
      initializationSource: input.source,
      initializationIdempotencyKey,
      initializedAt: new Date(),
      initializationError: null,
      testInitiated: input.isTest ?? false,
    },
    update: {
      ...(input.resetExisting
        ? {
            status: "not_started" as const,
            currentStep,
            completionPercentage,
            completedAt: null,
            businessInfoJson: {},
            leadershipJson: {},
            environmentJson: {},
            planningJson: {},
            resetAt: new Date(),
            resetByUserId: input.actorUserId ?? null,
          }
        : {}),
      subscriptionId: input.subscriptionId ?? undefined,
      customerType,
      baselineRequired,
      assessmentStatus: customerType === "assessment_customer" ? "completed" : "baseline_required",
      initializationSource: input.source,
      initializationIdempotencyKey,
      initializedAt: new Date(),
      initializationError: null,
      testInitiated: input.isTest ?? false,
    },
  });

  let welcomeEmailStatus = onboarding.welcomeEmailStatus;
  let welcomeEmailRecipient = onboarding.welcomeEmailRecipient;
  let welcomeEmailSentAt = onboarding.welcomeEmailSentAt;
  let welcomeEmailMessageId = onboarding.welcomeEmailMessageId;

  const shouldSendWelcome =
    input.sendWelcomeEmail &&
    (input.isTest ||
      !client.vcioOnboarding?.welcomeEmailIdempotencyKey ||
      client.vcioOnboarding.welcomeEmailIdempotencyKey !== welcomeEmailIdempotencyKey);

  if (shouldSendWelcome) {
    const recipient = input.isTest
      ? input.welcomeRecipientEmail
      : input.welcomeRecipientEmail ?? client.primaryContactEmail;
    if (!recipient) throw new Error("Welcome email recipient is required");

    const result = await sendVcioWelcomeEmail({
      clientId: client.id,
      userId: client.users[0]?.id ?? null,
      to: normalizePurchaserEmail(recipient),
      clientName: client.primaryContactName,
      organizationName: client.companyName,
      customerType,
      technologyScore: client.technologyProfile?.overallStackScore?.toString() ?? null,
      activationToken: input.activationToken,
      onboardingUrl,
      dashboardUrl,
      roadmapUrl: `${appUrl}/clients/${client.id}/roadmap`,
      strategySessionUrl: input.isTest ? `${appUrl}/admin/communications/testing` : undefined,
      isTest: input.isTest ?? false,
      createdByUserId: input.actorUserId ?? null,
      idempotencyKey: welcomeEmailIdempotencyKey,
    });
    welcomeEmailStatus = result.status;
    welcomeEmailRecipient = normalizePurchaserEmail(recipient);
    welcomeEmailSentAt = new Date();
    welcomeEmailMessageId = result.messageId !== "untracked" ? result.messageId : null;
    await prisma.vcioOnboarding.update({
      where: { clientId: client.id },
      data: {
        welcomeEmailStatus,
        welcomeEmailRecipient,
        welcomeEmailSentAt,
        welcomeEmailMessageId,
        welcomeEmailIdempotencyKey,
      },
    });
  }

  await recordOrganizationActivity({
    clientId: client.id,
    userId: input.actorUserId ?? null,
    category: "ACCOUNT",
    eventType: "vcio_onboarding_initialized",
    title: "StackScore vCIO onboarding initialized",
    description: `vCIO onboarding initialized from ${input.source}.`,
    visibility: "INTERNAL",
    metadata: {
      source: input.source,
      customerType,
      isTest: input.isTest ?? false,
      initializationIdempotencyKey,
      welcomeEmailIdempotencyKey,
      welcomeEmailSent: shouldSendWelcome,
    },
  });

  if (input.subscriptionId && !input.isTest) {
    await recordBillingAudit({
      clientId: client.id,
      action: "recurring_service_activated",
      actorUserId: input.actorUserId ?? undefined,
      metadata: {
        source: input.source,
        subscriptionId: input.subscriptionId,
        initializationIdempotencyKey,
      },
    });
  }

  return {
    onboardingUrl,
    dashboardUrl,
    customerType,
    onboardingStatus: onboarding.status,
    currentStep,
    completionPercentage,
    welcomeEmailStatus,
    welcomeEmailRecipient,
    welcomeEmailSentAt: welcomeEmailSentAt?.toISOString() ?? null,
    welcomeEmailMessageId,
    idempotencyKey: initializationIdempotencyKey,
  };
}
