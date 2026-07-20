import { describe, expect, it } from "vitest";
import {
  canKeepCardIntact,
  cardStartPresence,
  estimateBusinessValueFirstRowHeight,
  estimateBusinessValueMetricCardHeight,
  estimateInitiativeCardHeight,
  estimateSectionChromeHeight,
  estimateSectionIntroHeight,
} from "@/lib/pdf/tip/pagination";
import { TIP_PAGINATION, TIP_PDF_PAGE } from "@/lib/pdf/tip/tokens";
import type { TipStrategicInitiative } from "@/lib/pdf/types";

function makeInitiative(overrides: Partial<TipStrategicInitiative> = {}): TipStrategicInitiative {
  return {
    id: "init-1",
    name: "Multi-Factor Authentication",
    businessObjective:
      "Protect executive and staff accounts with modern identity controls aligned to business risk.",
    whyItMatters:
      "Credential compromise remains a leading cause of business disruption and data exposure.",
    expectedBenefits: [
      "Reduced account-takeover risk",
      "Stronger compliance posture",
      "Clearer identity reporting for leadership",
    ],
    recommendedPhase: "Phase 1",
    estimatedInvestment: "$3,500",
    priority: "High",
    riskLevel: "High",
    ...overrides,
  };
}

describe("TIP PDF pagination helpers", () => {
  it("estimates a normal initiative card well under one printable page", () => {
    const height = estimateInitiativeCardHeight(makeInitiative());
    expect(height).toBeGreaterThan(100);
    expect(height).toBeLessThan(TIP_PDF_PAGE.printableContentHeight * 0.75);
    expect(canKeepCardIntact(height)).toBe(true);
  });

  it("marks intentionally oversized cards as split-capable", () => {
    const oversized = makeInitiative({
      name: "Enterprise-Wide Technology Resilience and Continuity Program",
      businessObjective: "A".repeat(900),
      whyItMatters: "B".repeat(900),
      expectedBenefits: Array.from({ length: 12 }, (_, index) => `Benefit outcome ${index + 1}: ${"C".repeat(120)}`),
    });
    const height = estimateInitiativeCardHeight(oversized);
    expect(canKeepCardIntact(height)).toBe(false);
  });

  it("groups section chrome with the first content block height budget", () => {
    const chrome = estimateSectionChromeHeight(true);
    const metric = estimateBusinessValueMetricCardHeight();
    const intro = estimateSectionIntroHeight(true, metric);
    expect(intro).toBe(chrome + metric);
    expect(intro).toBeGreaterThan(TIP_PAGINATION.sectionWithSubtitle);
  });

  it("uses the first metric row height for Business Value Snapshot intro grouping", () => {
    expect(estimateBusinessValueFirstRowHeight(0)).toBe(0);
    expect(estimateBusinessValueFirstRowHeight(1)).toBe(estimateBusinessValueMetricCardHeight());
    expect(estimateBusinessValueFirstRowHeight(2)).toBe(estimateBusinessValueMetricCardHeight());
  });

  it("requests enough start presence for intact cards", () => {
    const height = estimateInitiativeCardHeight(makeInitiative());
    const presence = cardStartPresence(height, 72);
    expect(presence).toBeGreaterThanOrEqual(height);
    expect(presence).toBeLessThanOrEqual(TIP_PDF_PAGE.printableContentHeight);
  });
});
