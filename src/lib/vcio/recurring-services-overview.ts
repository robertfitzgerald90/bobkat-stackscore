/**
 * SS-ADMIN-005 — Recurring Services overview composition.
 * Distinct-client counting matches SS-ADMIN-004 Command Center pulse.
 */

import type { RecurringServiceStatus, SubscriptionStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

const ACTIVE_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = ["active", "trialing"];
const ACTIVE_RECURRING_STATUSES: RecurringServiceStatus[] = ["active", "pending_activation"];

export type RecurringServicesPulse = {
  /** Distinct clients with active/trialing vCIO sub OR active/pending recurring service. */
  distinctActiveClients: number;
  vcioActiveSubscriptions: number;
  vcioPastDueSubscriptions: number;
  recurringActive: number;
  recurringPendingActivation: number;
  /** Sum of active/trialing vCIO subscription amountCents — omit in UI for non-admin. */
  vcioMrrCents: number;
};

export type RecurringServiceListRow = {
  id: string;
  clientId: string;
  clientName: string;
  serviceName: string;
  status: RecurringServiceStatus;
  billingFrequency: string;
  nextBillingDate: string | null;
  renewalDate: string | null;
};

export type VcioSubscriptionListRow = {
  id: string;
  clientId: string;
  clientName: string;
  primaryContactName: string | null;
  primaryContactEmail: string | null;
  status: SubscriptionStatus;
  amountCents: number;
  cancelAtPeriodEnd: boolean;
  onboardingStatus: string | null;
  onboardingStep: string | null;
  completionPercentage: number | null;
  nextReviewDate: string | null;
  stackScore: number | null;
  activeProjectCount: number;
};

export type RecurringServicesOverview = {
  pulse: RecurringServicesPulse;
  vcioSubscriptions: VcioSubscriptionListRow[];
  recurringServices: RecurringServiceListRow[];
  generatedAt: string;
};

export type RecurringServicesOverviewOptions = {
  subscriptionStatus?: SubscriptionStatus;
};

export async function countDistinctRecurringServiceClients(): Promise<number> {
  const ids = await loadDistinctRecurringClientIds();
  return ids.size;
}

async function loadDistinctRecurringClientIds(): Promise<Set<string>> {
  const [subscriptions, recurringServices] = await Promise.all([
    prisma.subscription.findMany({
      where: {
        serviceType: "stackscore_vcio",
        status: { in: ACTIVE_SUBSCRIPTION_STATUSES },
        client: { status: { not: "archived" } },
      },
      select: { clientId: true },
    }),
    prisma.recurringService.findMany({
      where: {
        status: { in: ACTIVE_RECURRING_STATUSES },
        client: { status: { not: "archived" } },
      },
      select: { clientId: true },
    }),
  ]);

  const ids = new Set<string>();
  for (const row of subscriptions) ids.add(row.clientId);
  for (const row of recurringServices) ids.add(row.clientId);
  return ids;
}

export async function getRecurringServicesOverview(
  options: RecurringServicesOverviewOptions = {},
): Promise<RecurringServicesOverview> {
  const [subscriptions, recurringServices, distinctIds] = await Promise.all([
    prisma.subscription.findMany({
      where: {
        serviceType: "stackscore_vcio",
        ...(options.subscriptionStatus ? { status: options.subscriptionStatus } : {}),
      },
      orderBy: { updatedAt: "desc" },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            primaryContactName: true,
            primaryContactEmail: true,
            technologyProfile: { select: { overallStackScore: true } },
            projects: {
              where: { status: { in: ["approved", "scheduled", "in_progress"] } },
              select: { id: true },
            },
          },
        },
        vcioOnboarding: {
          select: {
            status: true,
            currentStep: true,
            completionPercentage: true,
          },
        },
        vcioQuarterlyReviews: {
          orderBy: [{ nextReviewDate: "asc" }, { createdAt: "desc" }],
          take: 1,
          select: { nextReviewDate: true },
        },
      },
    }),
    prisma.recurringService.findMany({
      where: {
        status: { notIn: ["canceled", "expired", "draft"] },
        client: { status: { not: "archived" } },
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
      select: {
        id: true,
        clientId: true,
        serviceName: true,
        status: true,
        billingFrequency: true,
        nextBillingDate: true,
        renewalDate: true,
        client: { select: { companyName: true } },
      },
    }),
    loadDistinctRecurringClientIds(),
  ]);

  const activeSubs = subscriptions.filter((row) =>
    ACTIVE_SUBSCRIPTION_STATUSES.includes(row.status),
  );
  const pastDue = subscriptions.filter((row) => row.status === "past_due");

  const pulse: RecurringServicesPulse = {
    distinctActiveClients: distinctIds.size,
    vcioActiveSubscriptions: activeSubs.length,
    vcioPastDueSubscriptions: pastDue.length,
    recurringActive: recurringServices.filter((row) => row.status === "active").length,
    recurringPendingActivation: recurringServices.filter(
      (row) => row.status === "pending_activation",
    ).length,
    vcioMrrCents: activeSubs.reduce((sum, row) => sum + row.amountCents, 0),
  };

  return {
    pulse,
    vcioSubscriptions: subscriptions.map((subscription) => ({
      id: subscription.id,
      clientId: subscription.clientId,
      clientName: subscription.client.companyName,
      primaryContactName: subscription.client.primaryContactName,
      primaryContactEmail: subscription.client.primaryContactEmail,
      status: subscription.status,
      amountCents: subscription.amountCents,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      onboardingStatus: subscription.vcioOnboarding?.status ?? null,
      onboardingStep: subscription.vcioOnboarding?.currentStep ?? null,
      completionPercentage: subscription.vcioOnboarding?.completionPercentage ?? null,
      nextReviewDate:
        subscription.vcioQuarterlyReviews[0]?.nextReviewDate?.toISOString() ?? null,
      stackScore:
        subscription.client.technologyProfile?.overallStackScore != null
          ? Math.round(Number(subscription.client.technologyProfile.overallStackScore))
          : null,
      activeProjectCount: subscription.client.projects.length,
    })),
    recurringServices: recurringServices.map((service) => ({
      id: service.id,
      clientId: service.clientId,
      clientName: service.client.companyName,
      serviceName: service.serviceName,
      status: service.status,
      billingFrequency: service.billingFrequency,
      nextBillingDate: service.nextBillingDate?.toISOString() ?? null,
      renewalDate: service.renewalDate?.toISOString() ?? null,
    })),
    generatedAt: new Date().toISOString(),
  };
}
