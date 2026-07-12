import { describe, expect, it } from "vitest";
import {
  computeInvoiceTotals,
  computeLineAmount,
  deriveInvoiceStatus,
  normalizeToMonthlyCents,
} from "@/lib/billing/calculations";
import {
  canClientViewInvoice,
  canManageBilling,
  stripInternalLineItems,
} from "@/lib/billing/access";

describe("computeInvoiceTotals", () => {
  it("calculates subtotal, discounts, and balance", () => {
    const totals = computeInvoiceTotals({
      lineItems: [{ amountCents: 10000 }, { amountCents: 5000 }],
      discountCents: 1000,
      taxCents: 500,
      depositAppliedCents: 2000,
      amountPaidCents: 3000,
    });
    expect(totals.subtotalCents).toBe(15000);
    expect(totals.totalCents).toBe(12500);
    expect(totals.balanceDueCents).toBe(9500);
  });
});

describe("computeLineAmount", () => {
  it("multiplies quantity by unit price in cents", () => {
    expect(computeLineAmount(2, 2500)).toBe(5000);
    expect(computeLineAmount(1.5, 1000)).toBe(1500);
  });
});

describe("deriveInvoiceStatus", () => {
  it("marks paid when balance is zero", () => {
    expect(
      deriveInvoiceStatus("sent", 0, 10000, 10000, new Date("2026-01-01")),
    ).toBe("paid");
  });

  it("marks partially paid when some amount applied", () => {
    expect(
      deriveInvoiceStatus("sent", 5000, 10000, 5000, new Date("2026-12-01")),
    ).toBe("partially_paid");
  });

  it("marks overdue when past due with balance", () => {
    expect(
      deriveInvoiceStatus(
        "sent",
        10000,
        10000,
        0,
        new Date("2020-01-01"),
        new Date("2026-06-01"),
      ),
    ).toBe("overdue");
  });
});

describe("normalizeToMonthlyCents", () => {
  it("normalizes billing frequencies to MRR", () => {
    expect(normalizeToMonthlyCents(12000, 1, "annual")).toBe(1000);
    expect(normalizeToMonthlyCents(3000, 2, "quarterly")).toBe(2000);
  });
});

describe("billing access", () => {
  it("allows staff to manage billing", () => {
    expect(canManageBilling("admin")).toBe(true);
    expect(canManageBilling("client")).toBe(false);
  });

  it("restricts client invoice visibility", () => {
    expect(canClientViewInvoice("client", { status: "draft" })).toBe(false);
    expect(canClientViewInvoice("client", { status: "sent" })).toBe(true);
    expect(canClientViewInvoice("admin", { status: "draft" })).toBe(true);
  });

  it("strips internal line item costs for clients", () => {
    const items = stripInternalLineItems(
      [{ description: "Labor", internalCostCents: 5000, amountCents: 10000 }],
      false,
    );
    expect(items[0]).not.toHaveProperty("internalCostCents");
  });
});
