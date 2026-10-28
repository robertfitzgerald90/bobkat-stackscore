import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildCustomerOpportunityFollowThroughParagraph,
  exposeCatalogProjectedMaturity,
  MEANINGFUL_STRENGTH_MIN_PERCENT,
  resolveAudienceProjectedMaturityKpi,
  selectDemonstratedAssessmentStrengths,
} from "@/lib/assessments/customer-trust";
import { buildAssessmentExecutiveSummary } from "@/lib/assessments/executive-summary";
import { buildAudienceAssessmentPresentation } from "@/lib/assessments/customer-facing-report";

describe("SS-REL-015 customer trust helpers", () => {
  it("selects strengths only from high-performing pillars", () => {
    const strengths = selectDemonstratedAssessmentStrengths([
      { categoryName: "Identity & Access", percentScore: 72 },
      { categoryName: "Endpoint Management", percentScore: 40 },
      { categoryName: "Data Protection", percentScore: 55 },
      { categoryName: "Network", percentScore: 54 },
    ]);

    expect(strengths).toEqual(["Identity & Access", "Data Protection"]);
    expect(MEANINGFUL_STRENGTH_MIN_PERCENT).toBe(55);
  });

  it("omits strengths when no pillar meets the evidence threshold", () => {
    expect(
      selectDemonstratedAssessmentStrengths([
        { categoryName: "Identity & Access", percentScore: 39 },
        { categoryName: "Endpoint Management", percentScore: 22 },
      ]),
    ).toEqual([]);
  });

  it("never derives strengths from recommendation titles", () => {
    const source = readFileSync(
      join(process.cwd(), "src/lib/communications/workflows/triggers.ts"),
      "utf8",
    );
    expect(source).toContain("selectDemonstratedAssessmentStrengths");
    expect(source).not.toMatch(
      /const strengths = clientSafeRecommendations[\s\S]{0,200}priority === "low"/,
    );
  });

  it("exposes catalog projected maturity for staff only", () => {
    expect(exposeCatalogProjectedMaturity("admin")).toBe(true);
    expect(exposeCatalogProjectedMaturity("consultant")).toBe(true);
    expect(exposeCatalogProjectedMaturity("client")).toBe(false);
  });

  it("nulls client projected KPIs even when TIP and catalog fallback exist (H2/C1)", () => {
    expect(
      resolveAudienceProjectedMaturityKpi({
        isClientAudience: true,
        tipProjectedScore: 100,
        catalogFallbackProjectedScore: 100,
      }),
    ).toBeNull();

    expect(
      resolveAudienceProjectedMaturityKpi({
        isClientAudience: false,
        tipProjectedScore: 88,
        catalogFallbackProjectedScore: 72,
      }),
    ).toBe(88);

    expect(
      resolveAudienceProjectedMaturityKpi({
        isClientAudience: false,
        tipProjectedScore: null,
        catalogFallbackProjectedScore: 72,
      }),
    ).toBe(72);
  });

  it("keeps customer narrative free of catalog projected StackScore figures", () => {
    const paragraph = buildCustomerOpportunityFollowThroughParagraph();
    expect(paragraph).toContain("reassessment");
    expect(paragraph).not.toMatch(/\bto \d{2,3}\b/);

    const summary = buildAssessmentExecutiveSummary({
      clientName: "ABC LLC",
      overallScore: 39,
      overallRatingLabel: "Critical",
      hasCriticalExposure: true,
      strengths: [],
      risks: ["Endpoint Management"],
      topRecommendations: [
        { title: "Require multi-factor authentication", priority: "critical" },
      ],
      projectedScore: 100,
      includeCatalogProjectedMaturity: false,
    });

    expect(summary).not.toContain("improve from 39 to 100");
    expect(summary).not.toContain("potential gain of 61");
    expect(summary).toContain("confirmed through reassessment");
  });

  it("builds client presentation that suppresses projected maturity language", () => {
    const presentation = buildAudienceAssessmentPresentation({
      role: "client",
      clientName: "ABC LLC",
      overallScore: 39,
      hasCriticalExposure: true,
      criticalFindingsCount: 1,
      categoryScores: [
        {
          categoryId: "ia",
          percentScore: 72,
          rating: "stable",
          category: { name: "Identity & Access", code: "identity_access" },
        },
        {
          categoryId: "ep",
          percentScore: 22,
          rating: "critical",
          category: { name: "Endpoint Management", code: "endpoint_management" },
        },
      ],
      recommendations: [
        {
          id: "r1",
          title: "Require multi-factor authentication for privileged and business-critical access",
          description: "d",
          businessImpact: "b",
          suggestedService: null,
          priority: "critical",
          status: "open",
          estimatedImpactPoints: 10,
          consolidationGroupId: null,
          categoryId: "ia",
          category: { name: "Identity & Access", code: "identity_access" },
          project: null,
          recommendationTemplate: { code: "REC-IA-002" },
        },
      ],
    });

    expect(presentation.executiveSummary).toContain("Identity & Access");
    expect(presentation.executiveSummary).not.toMatch(/improve from 39 to \d+/);
    expect(presentation.summary.projectedScore).toBeGreaterThanOrEqual(39);
  });

  it("wires technology profile detail through TIP isolation helper", () => {
    const source = readFileSync(
      join(process.cwd(), "src/lib/technology-profile/detail.ts"),
      "utf8",
    );
    expect(source).toContain("resolveAudienceProjectedMaturityKpi");
    expect(source).toContain('audience === "client" ? null : activeTipRecord');
  });
});
