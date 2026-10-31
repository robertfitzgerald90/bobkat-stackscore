import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PDF_LOGO_FILE_NAME, getPdfLogoPath } from "@/lib/pdf/shared/constants";
import { REPORT_COLORS } from "@/lib/pdf/shared/tokens";
import { generateAssessmentReportPdf } from "@/lib/pdf/generate";
import type { AssessmentReportData } from "@/lib/pdf/types";

describe("SS-REL-017-R3 assessment PDF remediation", () => {
  it("uses black-plate logo asset and purple brand accent tokens", () => {
    expect(PDF_LOGO_FILE_NAME).toBe("new-bobkat-it-logo.png");
    expect(getPdfLogoPath()).toContain("new-bobkat-it-logo.png");
    expect(REPORT_COLORS.accent.toLowerCase()).toBe("#6d28d9");
    expect(REPORT_COLORS.forest.toLowerCase()).not.toBe("#0b5a46");
  });

  it("renders a customer-facing ABC LLC fixture PDF without projected score KPIs", async () => {
    const sample: AssessmentReportData = {
      clientName: "ABC LLC",
      assessmentName: "Technology Maturity Assessment",
      assessmentType: "full",
      assessmentDate: "October 15, 2026",
      completedAt: "2026-10-15T14:00:00.000Z",
      suppressCatalogProjectedMaturity: true,
      executiveSummary:
        "ABC LLC completed a full technology maturity assessment with clear follow-through opportunities.",
      summary: {
        overallScore: 62,
        overallRating: "stable",
        overallRatingLabel: "Stable",
        overallMaturityLabel: "Developing",
        projectionImpact: 0,
        rawImpactSum: 24,
        projectedScore: 62,
        hasCriticalExposure: true,
        criticalFindingsCount: 2,
        openRecommendationsCount: 3,
        activeImprovementOpportunityCount: 3,
        recommendationCounts: {
          identified: 3,
          open: 3,
          accepted: 0,
          inProgress: 0,
          completed: 0,
          activeOpportunities: 3,
          deferred: 0,
          declined: 0,
        },
        categoryScores: [
          {
            categoryId: "c1",
            categoryCode: "identity_access",
            categoryName: "Identity & Access",
            percentScore: 52,
            rating: "at_risk",
          },
          {
            categoryId: "c2",
            categoryCode: "endpoint_management",
            categoryName: "Endpoint Management",
            percentScore: 78,
            rating: "strong",
          },
        ],
        topStrengths: [
          {
            categoryId: "c2",
            categoryCode: "endpoint_management",
            categoryName: "Endpoint Management",
            percentScore: 78,
            rating: "strong",
          },
        ],
        topRisks: [
          {
            categoryId: "c1",
            categoryCode: "identity_access",
            categoryName: "Identity & Access",
            percentScore: 52,
            rating: "at_risk",
          },
        ],
        immediateActions: [],
        recommendations: [
          {
            id: "r1",
            title: "Enforce MFA for privileged Microsoft 365 roles",
            description:
              "Privileged roles can still authenticate without multi-factor controls in some scenarios.",
            businessImpact: "Reduces privileged account takeover risk.",
            suggestedService: "Security Hardening",
            priority: "critical",
            status: "open",
            estimatedImpactPoints: 8,
            categoryId: "c1",
            categoryCode: "identity_access",
            categoryName: "Identity & Access",
            consolidationGroupId: null,
            hasProject: false,
            projectId: null,
          },
          {
            id: "r2",
            title:
              "Establish a quarterly executive technology review cadence with documented decisions and owners for follow-through across security, continuity, and platform investments",
            description:
              "A recurring executive review with owners, decisions, and next actions keeps priorities visible. This longer recommendation text validates wrapping in PDF detail pages.",
            businessImpact: "Keeps leadership aligned on risk tradeoffs.",
            suggestedService: "Strategic IT Consulting",
            priority: "low",
            status: "open",
            estimatedImpactPoints: 3,
            categoryId: "c2",
            categoryCode: "endpoint_management",
            categoryName: "Endpoint Management",
            consolidationGroupId: null,
            hasProject: false,
            projectId: null,
          },
        ],
      },
    };

    const buffer = await generateAssessmentReportPdf(sample);
    expect(buffer.byteLength).toBeGreaterThan(5_000);
    expect(buffer.subarray(0, 4).toString()).toBe("%PDF");

    // Content streams are compressed; assert via uncompressed object strings where present.
    const asLatin1 = buffer.toString("latin1");
    expect(asLatin1).not.toMatch(/Estimated Improvement/);
    expect(REPORT_COLORS.accent.toLowerCase()).toBe("#6d28d9");

    const outDir = path.join(process.cwd(), "docs/releases/assets/ss-rel-017-r3");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(path.join(outDir, "abc-llc-fixture-smoke.pdf"), buffer);
  }, 60_000);
});
