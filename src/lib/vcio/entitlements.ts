import type { SubscriptionStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { getVcioPaymentGracePeriodDays, VCIO_SERVICE_TYPE } from "@/lib/vcio/constants";

export type VcioAccessState =
  | "FULL_ACCESS"
  | "GRACE_PERIOD"
  | "REQUIRES_PAYMENT_ACTION"
  | "READ_ONLY"
  | "NO_ACCESS";

export type VcioEntitlement = {
  hasSubscription: boolean;
  accessState: VcioAccessState;
  status: SubscriptionStatus | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  gracePeriodEndsAt: Date | null;
  subscriptionId: string | null;
};

type SubscriptionLike = {
  id: string;
  status: SubscriptionStatus;
  paymentFailedAt: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  endedAt: Date | null;
};

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function getGracePeriodEndsAt(subscription: Pick<SubscriptionLike, "paymentFailedAt">) {
  if (!subscription.paymentFailedAt) return null;
  return addDays(subscription.paymentFailedAt, getVcioPaymentGracePeriodDays());
}

export function subscriptionAllowsVcioAccess(subscription: SubscriptionLike | null): VcioAccessState {
  if (!subscription) return "NO_ACCESS";

  if (subscription.status === "active" || subscription.status === "trialing") {
    return "FULL_ACCESS";
  }

  if (subscription.status === "past_due") {
    const graceEndsAt = getGracePeriodEndsAt(subscription);
    if (!graceEndsAt || graceEndsAt.getTime() >= Date.now()) {
      return "GRACE_PERIOD";
    }
    return "READ_ONLY";
  }

  if (subscription.status === "incomplete") {
    return "REQUIRES_PAYMENT_ACTION";
  }

  if (
    subscription.status === "canceled" ||
    subscription.status === "unpaid" ||
    subscription.status === "paused"
  ) {
    return "READ_ONLY";
  }

  return "NO_ACCESS";
}

export function canUseOngoingVcioFeatures(accessState: VcioAccessState): boolean {
  return accessState === "FULL_ACCESS" || accessState === "GRACE_PERIOD";
}

export async function getClientVcioEntitlement(clientId: string): Promise<VcioEntitlement> {
  const subscription = await prisma.subscription.findFirst({
    where: { clientId, serviceType: VCIO_SERVICE_TYPE },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      status: true,
      paymentFailedAt: true,
      currentPeriodEnd: true,
      cancelAtPeriodEnd: true,
      endedAt: true,
    },
  });

  const accessState = subscriptionAllowsVcioAccess(subscription);
  return {
    hasSubscription: Boolean(subscription),
    accessState,
    status: subscription?.status ?? null,
    currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
    gracePeriodEndsAt: subscription ? getGracePeriodEndsAt(subscription) : null,
    subscriptionId: subscription?.id ?? null,
  };
}

export function formatVcioAccessState(state: VcioAccessState): string {
  switch (state) {
    case "FULL_ACCESS":
      return "Current";
    case "GRACE_PERIOD":
      return "Past due - grace period";
    case "REQUIRES_PAYMENT_ACTION":
      return "Payment action required";
    case "READ_ONLY":
      return "Read-only";
    case "NO_ACCESS":
      return "No active access";
  }
}
