import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildCustomerOverviewFromDetail,
  resolveOverviewRoadmapProgress,
} from "@/lib/customer-portal/overview-dto";
import { presentRecommendationDescription } from "@/lib/customer-portal/recommendation-content";
import type { TechnologyProfileDetail } from "@/lib/technology-profile/types";
import { TECHNOLOGY_PILLARS } from "@/lib/technology-maturity/pillars";

function minimalDetail(
  overrides: Partial<TechnologyProfileDetail> = {},
): TechnologyProfileDetail {
  const base = {
    profile: {
      clientId: "client-1",
      overallStackScore: 39,
      currentAssessmentId: "assessment-1",
      lastAssessedAt: "2026-01-15T00:00:00.000Z",
    },
    client: {
      primaryContactName: "Alex Contact",
      companyName: "ABC LLC",
    },
    journey: {
      progressPercent: 33,
      phaseLabel: "Assess",
      assessmentsCompleted: 1,
    },
    draftAssessmentId: null,
    pillarInsights: TECHNOLOGY_PILLARS.map((pillar) => ({
      pillarCode: pillar.code,
      pillarName: pillar.name,
      businessQuestion: pillar.businessQuestion,
      percentScore: 40,
      maturityTier: null,
      trendDelta: null,
      openRecommendationCount: 0,
      status: "complete" as const,
      questionsAnswered: 10,
      questionsTotal: 10,
    })),
    openRecommendations: [],
  };

  return { ...base, ...overrides } as TechnologyProfileDetail;
}

describe("SS-UX-010 — Roadmap Progress consistency (Phase 1)", () => {
  it("empty: no roadmap record → No roadmap established (not journey %)", () => {
    const resolved = resolveOverviewRoadmapProgress({
      hasRoadmap: false,
      initiativesTotal: 0,
      completionPercent: 0,
      phaseLabel: null,
      journeyProgressPercent: 33,
      journeyPhaseLabel: "Assess",
    });

    expect(resolved.hasInitiatives).toBe(false);
    expect(resolved.progressPercent).toBe(0);
    expect(resolved.emptyStateLabel).toBe("No roadmap established");
    expect(resolved.journeyProgressPercent).toBe(33);

    const overview = buildCustomerOverviewFromDetail({
      detail: minimalDetail(),
      companyName: "ABC LLC",
      hasRoadmap: false,
      hasRoadmapInitiatives: resolved.hasInitiatives,
      roadmapProgressPercent: resolved.progressPercent,
      roadmapEmptyStateLabel: resolved.emptyStateLabel,
      journeyProgressPercent: resolved.journeyProgressPercent,
      journeyPhaseLabel: resolved.journeyPhaseLabel,
    });

    expect(overview.roadmap.progressPercent).toBe(0);
    expect(overview.roadmap.emptyStateLabel).toBe("No roadmap established");
    expect(overview.roadmap.hasInitiatives).toBe(false);
    expect(overview.journey.progressPercent).toBe(33);
    expect(overview.roadmap.progressPercent).not.toBe(overview.journey.progressPercent);
  });

  it("draft: roadmap exists with zero initiatives → Not started", () => {
    const resolved = resolveOverviewRoadmapProgress({
      hasRoadmap: true,
      initiativesTotal: 0,
      completionPercent: 0,
      phaseLabel: "Foundation",
      journeyProgressPercent: 33,
      journeyPhaseLabel: "Assess",
    });

    expect(resolved.hasInitiatives).toBe(false);
    expect(resolved.emptyStateLabel).toBe("Not started");
    expect(resolved.progressPercent).toBe(0);
    expect(resolved.phaseLabel).toBe("Foundation");
  });

  it("active: uses initiative completion percent, not journey", () => {
    const resolved = resolveOverviewRoadmapProgress({
      hasRoadmap: true,
      initiativesTotal: 13,
      completionPercent: 0,
      phaseLabel: "Stabilize",
      journeyProgressPercent: 66,
      journeyPhaseLabel: "Improve",
    });

    expect(resolved.hasInitiatives).toBe(true);
    expect(resolved.emptyStateLabel).toBeNull();
    expect(resolved.progressPercent).toBe(0);
    expect(resolved.progressPercent).not.toBe(66);

    const overview = buildCustomerOverviewFromDetail({
      detail: minimalDetail({
        journey: {
          progressPercent: 66,
          phaseLabel: "Improve",
          assessmentsCompleted: 1,
        },
      } as Partial<TechnologyProfileDetail>),
      companyName: "ABC LLC",
      hasRoadmap: true,
      hasRoadmapInitiatives: true,
      roadmapProgressPercent: 0,
      roadmapPhaseLabel: "Stabilize",
      journeyProgressPercent: 66,
      journeyPhaseLabel: "Improve",
    });

    expect(overview.roadmap.progressPercent).toBe(0);
    expect(overview.roadmap.hasInitiatives).toBe(true);
    expect(overview.journey.progressPercent).toBe(66);
  });

  it("completed: surfaces 100% initiative completion", () => {
    const resolved = resolveOverviewRoadmapProgress({
      hasRoadmap: true,
      initiativesTotal: 4,
      completionPercent: 100,
      phaseLabel: "Optimize",
      journeyProgressPercent: 100,
      journeyPhaseLabel: "Complete",
    });

    expect(resolved.hasInitiatives).toBe(true);
    expect(resolved.progressPercent).toBe(100);
    expect(resolved.emptyStateLabel).toBeNull();
  });

  it("overview service no longer substitutes journey for Roadmap Progress", () => {
    const overviewService = readFileSync(
      join(process.cwd(), "src/lib/customer-portal/overview.ts"),
      "utf8",
    );
    expect(overviewService).toContain("resolveOverviewRoadmapProgress");
    expect(overviewService).not.toMatch(
      /roadmapProgressPercent = hasRoadmapMetrics[\s\S]*journey\.progressPercent/,
    );
  });
});

describe("SS-UX-010 — Assessment recommendation sections (Phase 3)", () => {
  it("renders structured Finding / Action / Outcome / Considerations without dropping text", () => {
    const source = [
      "Finding: Backup coverage is incomplete for critical systems.",
      "Recommended action: Expand immutable backups to all production workloads.",
      "Expected outcome: Recoverability improves for ransomware and outage scenarios.",
      "Implementation considerations: Validate retention with compliance stakeholders.",
    ].join("\n\n");

    const presented = presentRecommendationDescription(source);
    expect(presented.sections.hasStructuredSections).toBe(true);
    expect(presented.sections.finding).toContain("Backup coverage");
    expect(presented.sections.recommendedAction).toContain("immutable backups");
    expect(presented.sections.expectedOutcome).toContain("Recoverability");
    expect(presented.sections.implementationConsiderations).toContain("compliance");
  });

  it("assessment report wires structured recommendation body", () => {
    const preview = readFileSync(
      join(process.cwd(), "src/components/assessments/assessment-report-preview.tsx"),
      "utf8",
    );
    expect(preview).toContain("presentRecommendationDescription");
    expect(preview).toContain("Finding");
    expect(preview).toContain("Recommended Action");
    expect(preview).toContain("Expected Outcome");
    expect(preview).toContain("Implementation Considerations");
    expect(preview).toContain("Business Benefit");
    expect(preview).not.toMatch(
      /description=\{recommendation\.description \|\| recommendation\.businessImpact\}/,
    );
  });
});

describe("SS-UX-010 — Explore a11y + Progress Report wiring", () => {
  it("Explore uses a single full-width intelligence stack (SS-UX-016-R1)", () => {
    const experience = readFileSync(
      join(process.cwd(), "src/components/customer-portal/explore/customer-explore-experience.tsx"),
      "utf8",
    );
    expect(experience).toContain("PillarSelector");
    expect(experience).toContain("PillarOverview");
    expect(experience).toContain("PillarStrengthsAttention");
    expect(experience).toContain("PillarIntelligenceTabs");
    expect(experience).not.toContain("lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]");
    expect(experience).not.toContain("showDesktopDetail");
    expect(experience).not.toContain("showMobileDetail");
  });

  it("customer progress report uses charcoal customer presentation flag", () => {
    const page = readFileSync(
      join(process.cwd(), "src/app/(dashboard)/clients/[id]/progress-report/page.tsx"),
      "utf8",
    );
    const preview = readFileSync(
      join(process.cwd(), "src/components/reports/progress-report-preview.tsx"),
      "utf8",
    );
    const theme = readFileSync(
      join(process.cwd(), "src/styles/customer-portal-theme.css"),
      "utf8",
    );

    expect(page).toContain("isCustomerView");
    expect(page).toContain("isCustomerMode");
    expect(preview).toContain("customer-progress-report");
    expect(preview).toContain("CustomerProgressCover");
    expect(theme).toContain("customer-progress-report-document");
  });
});
