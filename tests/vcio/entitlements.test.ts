import { describe, expect, it, vi } from "vitest";
import type { SubscriptionStatus } from "@/generated/prisma/client";

vi.mock("@/lib/db", () => ({ prisma: {} }));

import {
  getGracePeriodEndsAt,
  subscriptionAllowsVcioAccess,
} from "@/lib/vcio/entitlements";
import { normalizeStripeSubscriptionStatus } from "@/lib/vcio/subscriptions";

function subscription(status: SubscriptionStatus, paymentFailedAt: Date | null = null) {
  return {
    id: "sub_local",
    status,
    paymentFailedAt,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    endedAt: null,
  };
}

describe("vCIO entitlements", () => {
  it("maps active and trialing subscriptions to full access", () => {
    expect(subscriptionAllowsVcioAccess(subscription("active"))).toBe("FULL_ACCESS");
    expect(subscriptionAllowsVcioAccess(subscription("trialing"))).toBe("FULL_ACCESS");
  });

  it("allows past due subscriptions during the grace period", () => {
    vi.setSystemTime(new Date("2026-07-14T12:00:00Z"));
    expect(subscriptionAllowsVcioAccess(subscription("past_due", new Date("2026-07-13T12:00:00Z")))).toBe(
      "GRACE_PERIOD",
    );
    vi.useRealTimers();
  });

  it("moves past due subscriptions to read-only after grace expires", () => {
    vi.setSystemTime(new Date("2026-07-30T12:00:00Z"));
    expect(subscriptionAllowsVcioAccess(subscription("past_due", new Date("2026-07-13T12:00:00Z")))).toBe(
      "READ_ONLY",
    );
    vi.useRealTimers();
  });

  it("maps actionable and ended states consistently", () => {
    expect(subscriptionAllowsVcioAccess(subscription("incomplete"))).toBe("REQUIRES_PAYMENT_ACTION");
    expect(subscriptionAllowsVcioAccess(subscription("canceled"))).toBe("READ_ONLY");
    expect(subscriptionAllowsVcioAccess(subscription("paused"))).toBe("READ_ONLY");
    expect(subscriptionAllowsVcioAccess(subscription("incomplete_expired"))).toBe("NO_ACCESS");
  });

  it("normalizes unknown Stripe statuses safely", () => {
    expect(normalizeStripeSubscriptionStatus("active")).toBe("active");
    expect(normalizeStripeSubscriptionStatus("new_status_from_stripe")).toBe("unknown");
  });

  it("computes grace period end from payment failure date", () => {
    expect(getGracePeriodEndsAt({ paymentFailedAt: new Date("2026-07-13T00:00:00Z") })?.toISOString()).toBe(
      "2026-07-20T00:00:00.000Z",
    );
  });
});
