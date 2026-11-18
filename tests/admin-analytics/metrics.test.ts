import { describe, expect, it } from "vitest";
import { canViewAdminAnalytics } from "@/lib/admin-analytics/access";
import { ga4Number, readGa4Rows } from "@/lib/admin-analytics/ga4";
import { isInternalOrTestEmail, isStripeTestSession } from "@/lib/admin-analytics/internal-activity";
import { periodComparison } from "@/lib/admin-analytics/format";
import { inclusiveDayCount, parseAdminAnalyticsFilters } from "@/lib/admin-analytics/range";
import { supportedRate } from "@/lib/admin-analytics/rates";
import { summarizePurchases, type PurchaseFact } from "@/lib/admin-analytics/revenue";
import { aggregateBreakdown, readVisitorCount } from "@/lib/admin-analytics/vercel";
import { getConsultantSidebarNav } from "@/lib/navigation/sidebar-nav";

const staff = new Set(["admin@bobkatit.com"]);

function purchase(overrides: Partial<PurchaseFact> = {}): PurchaseFact {
  return {
    occurredAt: "2026-11-01T15:00:00.000Z",
    status: "fulfilled",
    paymentStatus: "paid",
    amountTotal: 150000,
    currency: "usd",
    purchaserEmail: "buyer@customer.test",
    stripeSessionId: "cs_live_123",
    billingPaymentStatus: null,
    assessmentStatus: "draft",
    ...overrides,
  };
}

describe("admin analytics access and filters", () => {
  it("allows only admins", () => {
    expect(canViewAdminAnalytics("admin")).toBe(true);
    expect(canViewAdminAnalytics("technician")).toBe(false);
    expect(canViewAdminAnalytics("client")).toBe(false);
    expect(canViewAdminAnalytics(undefined)).toBe(false);
  });

  it("hides Analytics from technicians", () => {
    const operations = getConsultantSidebarNav("technician", null).find((item) => item.id === "operations");
    expect(operations?.children?.some((child) => child.href === "/admin/analytics")).toBe(false);
  });

  it("uses a 28-day UTC window and an equal prior period", () => {
    const filters = parseAdminAnalyticsFilters({}, new Date("2026-11-06T18:00:00.000Z"));
    expect(filters).toMatchObject({
      site: "all",
      section: "overview",
      preset: "28d",
      from: "2026-10-10",
      to: "2026-11-06",
      previousFrom: "2026-09-12",
      previousTo: "2026-10-09",
      dayCount: 28,
    });
    expect(inclusiveDayCount(filters.previousFrom, filters.previousTo)).toBe(28);
  });

  it("rejects an inverted custom range instead of querying it", () => {
    const filters = parseAdminAnalyticsFilters(
      { range: "custom", from: "2026-11-06", to: "2026-11-01" },
      new Date("2026-11-06T00:00:00.000Z"),
    );
    expect(filters.preset).toBe("28d");
    expect(filters.warning).toMatch(/invalid/i);
  });
});

describe("admin analytics records", () => {
  it("excludes staff, demo-seed, and stripe test purchases", () => {
    expect(isInternalOrTestEmail("admin@bobkatit.com", staff)).toBe(true);
    expect(isInternalOrTestEmail("pinnacle.engineering.demo@bobkatit.com", staff)).toBe(true);
    expect(isInternalOrTestEmail("bobbytest3@bobkatit.com", staff)).toBe(true);
    expect(isInternalOrTestEmail("person@example.com", staff)).toBe(true);
    expect(isInternalOrTestEmail("latest@bobkatit.com", staff)).toBe(false);
    expect(isInternalOrTestEmail("owner@customer.com", staff)).toBe(false);
    expect(isStripeTestSession("cs_test_abc")).toBe(true);
  });

  it("nets full refunds and refuses to invent a partial-refund balance", () => {
    const summary = summarizePurchases(
      [
        purchase(),
        purchase({
          stripeSessionId: "cs_live_refunded",
          status: "refunded",
          amountTotal: 150000,
        }),
        purchase({
          stripeSessionId: "cs_live_partial",
          billingPaymentStatus: "partially_refunded",
          amountTotal: 150000,
        }),
        purchase({ stripeSessionId: "cs_test_hidden", purchaserEmail: "admin@bobkatit.com" }),
      ],
      staff,
    );

    expect(summary.paidCount).toBe(2);
    expect(summary.revenueCents).toBe(150000);
    expect(summary.revenueAvailability).toBe("available");
    expect(summary.notes.join(" ")).toMatch(/partially refunded/i);
    expect(summary.notes.join(" ")).toMatch(/fully refunded/i);
  });

  it("does not report zero revenue when every paid row lacks a known retained amount", () => {
    const summary = summarizePurchases(
      [purchase({ billingPaymentStatus: "partially_refunded" })],
      staff,
    );
    expect(summary.paidCount).toBe(1);
    expect(summary.revenueCents).toBeNull();
    expect(summary.revenueAvailability).toBe("unavailable");
  });

  it("reports a real zero only when no confirmed purchases remain", () => {
    const summary = summarizePurchases([], staff);
    expect(summary.paidCount).toBe(0);
    expect(summary.revenueCents).toBe(0);
    expect(summary.revenueAvailability).toBe("available");
  });

  it("shows a cohort rate only with a supported denominator", () => {
    expect(supportedRate(2, 4)).toBe(0.5);
    expect(supportedRate(1, 0)).toBeNull();
    expect(supportedRate(5, 4)).toBeNull();
    const summary = summarizePurchases(
      [purchase({ assessmentStatus: "completed" }), purchase({ stripeSessionId: "cs_live_open" })],
      staff,
    );
    expect(summary.cohortCompleted).toBe(1);
    expect(summary.cohortDenominator).toBe(2);
    expect(supportedRate(summary.cohortCompleted, summary.cohortDenominator)).toBe(0.5);
  });

  it("does not invent a percent change from a zero baseline", () => {
    expect(periodComparison(3, 0).label).toBe("Up from 0 in the prior period");
    expect(periodComparison(3, 0).label).not.toMatch(/%/);
  });
});

describe("admin analytics provider parsers", () => {
  it("reads GA4 metric rows without turning a missing metric into a number", () => {
    const rows = readGa4Rows({
      dimensionHeaders: [{ name: "sessionSourceMedium" }],
      metricHeaders: [{ name: "sessions" }],
      rows: [{ dimensionValues: [{ value: "google / organic" }], metricValues: [{ value: "12" }] }],
    });
    expect(rows).toEqual([{ sessionSourceMedium: "google / organic", sessions: "12" }]);
    expect(ga4Number(undefined)).toBeNull();
    expect(ga4Number("4")).toBe(4);
  });

  it("rejects a Vercel visitor total that does not confirm the date window", () => {
    expect(readVisitorCount({ query: { since: "2026-10-01" }, data: { visitors: 8 } })).toEqual({
      visitors: 8,
      windowConfirmed: true,
    });
    expect(readVisitorCount({ data: { visitors: 80 } }).windowConfirmed).toBe(false);
  });

  it("rejects Vercel rows that omit the requested metric", () => {
    expect(() => aggregateBreakdown([{ referrerHostname: "google.com" }], "referrerHostname", "pageviews")).toThrow(
      /metric/i,
    );
  });
});
