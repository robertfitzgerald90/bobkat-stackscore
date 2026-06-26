import { describe, expect, it } from "vitest";
import { computeInvestmentView, formatCurrency } from "@/lib/technology-improvement-plan/pricing";

describe("TIP pricing", () => {
  it("computes client total with margin", () => {
    const view = computeInvestmentView({
      laborCents: 100_000,
      hardwareCents: 25_000,
      servicesCents: 40_000,
      marginPercent: 35,
    });

    expect(view.subtotal).toBe(1650);
    expect(view.marginAmount).toBe(577.5);
    expect(view.clientTotal).toBe(2227.5);
  });

  it("formats currency without cents", () => {
    expect(formatCurrency(2227.5)).toBe("$2,228");
  });
});
