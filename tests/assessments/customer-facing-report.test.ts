import { describe, expect, it } from "vitest";
import {
  buildAudienceAssessmentPresentation,
  filterGeneratedRecommendationsForCustomer,
} from "@/lib/assessments/customer-facing-report";
import { buildAssessmentResultsSummary } from "@/lib/assessments/results-summary";
import { calculateProjectionImpacts } from "@/lib/recommendations/engine";
import { calculateProjectedScore } from "@/lib/scoring";

/**
 * ABC LLC staging regression fixtures (SS-REL-012 / SS-REL-013).
 * Values mirror the approved client-deliverable recommendation set — not hardcoded app constants.
 */
const ABC_CURRENT = 39;
const ABC_PROJECTION_IMPACT = 20;
const ABC_PROJECTED = 59;

const identityCategory = { name: "Identity & Access", code: "identity_access" };
const securityCategory = { name: "Security Operations", code: "security_operations" };
const docsCategory = { name: "Documentation & Knowledge", code: "documentation_knowledge" };

function rec(input: {
  id: string;
  title: string;
  priority: "critical" | "high" | "medium" | "low";
  points: number;
  category: { name: string; code: string };
  templateCode: string;
}) {
  return {
    id: input.id,
    title: input.title,
    description: "Desc",
    businessImpact: "Impact",
    suggestedService: null as string | null,
    priority: input.priority,
    status: "open" as const,
    estimatedImpactPoints: input.points,
    consolidationGroupId: null as string | null,
    categoryId: input.category.code,
    category: input.category,
    project: null as { id: string } | null,
    recommendationTemplate: { code: input.templateCode },
    templateCode: input.templateCode,
  };
}

/** Simplified ABC-like mix: two approved pillars + stub documentation rows. */
const mixedRecommendations = [
  rec({
    id: "ia-1",
    title: "Require multi-factor authentication for privileged and business-critical access",
    priority: "critical",
    points: 10,
    category: identityCategory,
    templateCode: "REC-IA-001",
  }),
  rec({
    id: "ia-2",
    title: "Separate privileged administrator accounts from everyday user accounts",
    priority: "high",
    points: 8,
    category: identityCategory,
    templateCode: "REC-IA-002",
  }),
  rec({
    id: "so-1",
    title: "Establish a practical incident response process",
    priority: "critical",
    points: 10,
    category: securityCategory,
    templateCode: "REC-SO-001",
  }),
  rec({
    id: "so-2",
    title: "Implement monitoring for security-relevant system events",
    priority: "critical",
    points: 10,
    category: securityCategory,
    templateCode: "REC-SO-002",
  }),
  rec({
    id: "dk-1",
    title: "Improve Documentation & Knowledge: Are credentials securely managed",
    priority: "critical",
    points: 10,
    category: docsCategory,
    templateCode: "REC-DK-001",
  }),
  rec({
    id: "dk-2",
    title: "Improve Documentation & Knowledge: Are vendors documented",
    priority: "low",
    points: 4,
    category: docsCategory,
    templateCode: "REC-DK-002",
  }),
];

const categoryScores = [
  {
    categoryId: "ia",
    percentScore: 51,
    rating: "at_risk" as const,
    category: identityCategory,
  },
  {
    categoryId: "so",
    percentScore: 35,
    rating: "critical" as const,
    category: securityCategory,
  },
  {
    categoryId: "dk",
    percentScore: 8,
    rating: "critical" as const,
    category: docsCategory,
  },
];

describe("category-max projection vs raw impact sum", () => {
  it("keeps projected impact below raw sum when multiple recs share a pillar", () => {
    const deliverable = filterGeneratedRecommendationsForCustomer(
      mixedRecommendations.map((row) => ({
        title: row.title,
        templateCode: row.templateCode,
        priority: row.priority,
        estimatedImpactPoints: row.estimatedImpactPoints,
        categoryName: row.category.name,
        description: row.description,
        businessImpact: row.businessImpact,
        suggestedService: "",
        consolidationGroupId: null,
        isConsolidated: false,
      })),
    );

    const projectionImpact = calculateProjectionImpacts(
      deliverable.map((row) => ({
        templateCode: row.templateCode,
        consolidationGroupId: null,
        title: row.title,
        description: "d",
        businessImpact: "b",
        suggestedService: "",
        priority: row.priority,
        estimatedImpactPoints: row.estimatedImpactPoints,
        categoryName: row.categoryName,
        isConsolidated: false,
      })),
    );
    const rawSum = deliverable.reduce((sum, row) => sum + row.estimatedImpactPoints, 0);

    expect(rawSum).toBeGreaterThan(projectionImpact);
    expect(projectionImpact).toBe(20); // max(10,8) IA + max(10,10) SO
    expect(calculateProjectedScore(ABC_CURRENT, [projectionImpact])).toBe(ABC_PROJECTED);
  });

  it("exposes both projectionImpact and rawImpactSum on results summary", () => {
    const summary = buildAssessmentResultsSummary(
      ABC_CURRENT,
      true,
      2,
      categoryScores,
      mixedRecommendations.filter((row) => !row.title.startsWith("Improve ")),
    );

    expect(summary.projectionImpact).toBe(ABC_PROJECTION_IMPACT);
    expect(summary.rawImpactSum).toBeGreaterThan(summary.projectionImpact);
    expect(summary.projectedScore).toBe(ABC_PROJECTED);
  });
});

describe("client vs staff recommendation visibility for projections", () => {
  it("hides stubs from client presentation and regenerates narrative", () => {
    const client = buildAudienceAssessmentPresentation({
      role: "client",
      clientName: "ABC LLC",
      overallScore: ABC_CURRENT,
      hasCriticalExposure: true,
      criticalFindingsCount: 2,
      categoryScores,
      recommendations: mixedRecommendations,
      storedExecutiveSummary:
        "ABC LLC's organization ... improve from 39 to 100, a gain of 61 points. Improve Documentation & Knowledge: Are credentials securely managed",
    });

    expect(client.recommendations.every((row) => !row.title.startsWith("Improve "))).toBe(true);
    expect(client.summary.projectedScore).toBe(ABC_PROJECTED);
    expect(client.summary.projectionImpact).toBe(ABC_PROJECTION_IMPACT);
    expect(client.executiveSummary).toContain("improve from 39 to 59");
    expect(client.executiveSummary).not.toContain("to 100");
    expect(client.executiveSummary).not.toContain("credentials securely managed");
    expect(client.usedCustomerSafeNarrative).toBe(true);
  });

  it("lets staff retain stubs and stored historical narrative", () => {
    const stored =
      "Historical staff narrative mentioning Improve Documentation & Knowledge: Are vendors documented";
    const staff = buildAudienceAssessmentPresentation({
      role: "admin",
      clientName: "ABC LLC",
      overallScore: ABC_CURRENT,
      hasCriticalExposure: true,
      criticalFindingsCount: 2,
      categoryScores,
      recommendations: mixedRecommendations,
      storedExecutiveSummary: stored,
    });

    expect(staff.recommendations.some((row) => row.title.startsWith("Improve "))).toBe(true);
    expect(staff.executiveSummary).toBe(stored);
    expect(staff.usedCustomerSafeNarrative).toBe(false);
    // Staff projection includes Documentation max (10) + IA (10) + SO (10) = 30 → 69
    expect(staff.summary.projectionImpact).toBe(30);
    expect(staff.summary.projectedScore).toBe(69);
  });
});

describe("stub exclusion helpers", () => {
  it("filters generated recommendations for customer-safe completion narratives", () => {
    const filtered = filterGeneratedRecommendationsForCustomer(
      mixedRecommendations.map((row) => ({
        title: row.title,
        templateCode: row.templateCode,
        priority: row.priority,
        estimatedImpactPoints: row.estimatedImpactPoints,
        categoryName: row.category.name,
        description: row.description,
        businessImpact: row.businessImpact,
        suggestedService: "",
        consolidationGroupId: null,
        isConsolidated: false,
      })),
    );

    expect(filtered).toHaveLength(4);
    expect(filtered.every((row) => !row.title.startsWith("Improve "))).toBe(true);
  });
});
