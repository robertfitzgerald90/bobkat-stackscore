import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getGaMeasurementId,
  isBobkatItReferrer,
  isGa4Enabled,
} from "@/lib/analytics/ga4-config";
import { buildAnalyticsTransactionId } from "@/lib/analytics/ga4-transaction-id";

describe("ga4-config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("disables analytics outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_ENABLE_ANALYTICS", "true");
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TEST123");
    expect(isGa4Enabled()).toBe(false);
  });

  it("requires exact enable flag and G- measurement id", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_ENABLE_ANALYTICS", "true");
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TEST123");
    expect(isGa4Enabled()).toBe(true);
    expect(getGaMeasurementId()).toBe("G-TEST123");

    vi.stubEnv("NEXT_PUBLIC_ENABLE_ANALYTICS", "TRUE");
    expect(isGa4Enabled()).toBe(false);

    vi.stubEnv("NEXT_PUBLIC_ENABLE_ANALYTICS", "true");
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "UA-123");
    expect(isGa4Enabled()).toBe(false);
    expect(getGaMeasurementId()).toBeUndefined();
  });
});

describe("verify-assessment-purchase helpers", () => {
  it("prefers internal purchase ids over stripe session hashes", () => {
    expect(
      buildAnalyticsTransactionId({
        purchaseId: "purchase-uuid-1",
        stripeSessionId: "cs_test_abc",
      }),
    ).toBe("purchase-uuid-1");
  });

  it("hashes stripe session ids when no purchase row exists", () => {
    const id = buildAnalyticsTransactionId({
      purchaseId: null,
      stripeSessionId: "cs_test_abc",
    });
    expect(id.startsWith("tma_")).toBe(true);
    expect(id.includes("cs_")).toBe(false);
  });
});

describe("bobkat referral detection", () => {
  it("accepts bobkatit.com hosts only", () => {
    expect(isBobkatItReferrer("https://bobkatit.com/services")).toBe(true);
    expect(isBobkatItReferrer("https://www.bobkatit.com/")).toBe(true);
    expect(isBobkatItReferrer("https://stackscore.tech/")).toBe(false);
    expect(isBobkatItReferrer("")).toBe(false);
  });
});
