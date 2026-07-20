import { describe, expect, it } from "vitest";
import {
  buildCategoryFindings,
  buildExecutiveReportFields,
  buildStrategicInitiatives,
  buildTopBusinessRisks,
  buildTopOpportunities,
  priorityToExecutiveLevel,
} from "@/lib/reports/tip-executive-report";
import { areTipTextsIdentical } from "@/lib/reports/tip-text-normalize";
import { resolveInitiativeFields } from "@/lib/reports/tip-initiative-content";
import { assignExecutivePriorityTiers, computeInitiativeRiskLevel } from "@/lib/reports/tip-priority-scoring";
import { buildTipInvestmentSummary } from "@/lib/reports/tip-investment-summary";
import { finalizeTipReportData, validateTipReportContent } from "@/lib/technology-improvement-plan/report-validation";
import type { TipRecommendationView } from "@/lib/technology-improvement-plan/types";
import type { TechnologyRoadmap } from "@/lib/technology-improvement-plan/roadmap-engine";
import type { TipReportData } from "@/lib/pdf/types";
import { createTestInvestmentSummary } from "./tip-test-helpers";

function makeRec(overrides: Partial<TipRecommendationView> = {}): TipRecommendationView {
  return {
    id: "rec-default",
    title: "Default Initiative",
    description: "Internal technical detail.",
    businessImpact: "Current gaps increase operational disruption risk.",
    priority: "medium",
    suggestedService: "Managed IT Services",
    estimatedImpactPoints: 4,
    categoryName: "Infrastructure",
    consultantNote: "",
    executiveNote: "Establish a stronger operational foundation for leadership visibility.",
    sortOrder: 0,
    ...overrides,
  };
}

function makeRoadmap(initiatives: TechnologyRoadmap["phases"][number]["initiatives"]): TechnologyRoadmap {
  return {
    phases: [
      {
        id: "phase-1",
        name: "Foundation Improvements",
        subtitle: "Phase 1",
        timeline: "0–90 days",
        sortOrder: 0,
        executiveSummary: "Establish foundational controls.",
        stackScoreImprovement: 8,
        projectedScore: 63,
        oneTimeInvestment: 7500,
        monthlyRecurringInvestment: 400,
        annualRecurringInvestment: 4800,
        initiatives,
        businessOutcomes: [
          {
            title: "Improved recovery readiness",
            description: "Validated backups reduce business disruption risk.",
          },
        ],
        recommendationIds: initiatives.map((item) => item.recommendationId),
      },
    ],
    totals: {
      totalOneTimeInvestment: 7500,
      totalMonthlyRecurring: 400,
      totalAnnualRecurring: 4800,
      projectedFinalStackScore: 72,
      legacyCombinedTotal: 7900,
    },
    phaseAssignments: [],
  };
}

describe("TIP content quality scenarios", () => {
  it("Test A — risks and opportunities are distinct and semantically separated", () => {
    const recommendations = [
      makeRec({
        id: "rec-backup",
        title: "Backup Modernization",
        categoryName: "Backup and Disaster Recovery",
        businessImpact: "Unvalidated backups increase the likelihood of extended downtime during a disruption.",
        executiveNote: "Leadership gains confidence that recovery objectives can be met consistently.",
        priority: "critical",
      }),
      makeRec({
        id: "rec-mfa",
        title: "Multi-Factor Authentication",
        categoryName: "Identity and Access",
        businessImpact: "Weak identity controls increase unauthorized access and account takeover risk.",
        executiveNote: "Workforce access becomes more reliable while reducing credential compromise exposure.",
        priority: "high",
      }),
      makeRec({
        id: "rec-docs",
        title: "Operational Documentation",
        categoryName: "Documentation and Knowledge",
        businessImpact: "Knowledge concentrated in individuals slows troubleshooting and extends recovery time.",
        executiveNote: "Teams can resolve incidents faster with shared operational documentation.",
        priority: "medium",
      }),
    ];

    const roadmap = makeRoadmap(
      recommendations.map((rec, index) => ({
        recommendationId: rec.id,
        title: rec.title,
        priority: rec.priority,
        sortOrder: index,
        costProfile: {
          recommendationId: rec.id,
          costType: "mixed" as const,
          oneTimeInvestment: 2500,
          monthlyRecurringInvestment: 150,
          annualRecurringInvestment: 1800,
        },
      })),
    );

    const risks = buildTopBusinessRisks(recommendations);
    const opportunities = buildTopOpportunities(recommendations, roadmap, [
      { name: "Backup and Disaster Recovery", score: 45, ratingLabel: "At Risk", hasRecommendations: true },
      { name: "Identity and Access", score: 52, ratingLabel: "At Risk", hasRecommendations: true },
      { name: "Documentation and Knowledge", score: 58, ratingLabel: "At Risk", hasRecommendations: true },
    ]);

    expect(risks.length).toBeGreaterThanOrEqual(3);
    expect(opportunities.length).toBeGreaterThanOrEqual(3);
    for (const risk of risks) {
      expect(/risk|exposure|disrupt|loss|without|increase|weak|unauthor|delay|fail/i.test(risk)).toBe(true);
    }
    for (const opportunity of opportunities) {
      expect(/improve|strengthen|enable|confidence|visibility|reliability|reduce support|productivity|foundation|resolve|faster|leadership|preparedness|operations/i.test(opportunity)).toBe(true);
    }
    for (const risk of risks) {
      for (const opportunity of opportunities) {
        expect(areTipTextsIdentical(risk, opportunity)).toBe(false);
      }
    }
  });

  it("Test B — roadmap fields remain distinct for initiatives", () => {
    const recommendations = Array.from({ length: 5 }, (_, index) =>
      makeRec({
        id: `rec-${index + 1}`,
        title: `Initiative ${index + 1}`,
        categoryName: index % 2 === 0 ? "Security" : "Endpoint Management",
        businessImpact: `Current ${index + 1} exposure creates preventable business disruption if left unresolved.`,
        executiveNote: `Establish improved ${index + 1} capability that leadership can rely on for daily operations.`,
        priority: index === 0 ? "critical" : index === 1 ? "high" : "medium",
      }),
    );

    const roadmap = makeRoadmap(
      recommendations.map((rec, index) => ({
        recommendationId: rec.id,
        title: rec.title,
        priority: rec.priority,
        sortOrder: index,
        costProfile: {
          recommendationId: rec.id,
          costType: "mixed" as const,
          oneTimeInvestment: 1000 + index * 500,
          monthlyRecurringInvestment: 100,
          annualRecurringInvestment: 1200,
        },
      })),
    );

    const initiatives = buildStrategicInitiatives(roadmap, recommendations, [
      { name: "Security", score: 50 },
      { name: "Endpoint Management", score: 55 },
    ]);

    expect(initiatives.length).toBe(5);
    for (const initiative of initiatives) {
      expect(initiative.businessObjective.length).toBeGreaterThan(20);
      expect(initiative.whyItMatters.length).toBeGreaterThan(20);
      expect(areTipTextsIdentical(initiative.businessObjective, initiative.whyItMatters)).toBe(false);
      expect(initiative.expectedBenefits.length).toBeGreaterThan(0);
      expect(/establish|achieve|create|deliver|improve|enable|strengthen/i.test(initiative.businessObjective)).toBe(true);
      expect(/current|without|increase|expose|remain|risk|gap|limit|weak|unresolved/i.test(initiative.whyItMatters)).toBe(true);
    }
  });

  it("Test C — category findings use category-specific business impacts", () => {
    const categories = [
      { name: "Backup and Disaster Recovery", score: 44, ratingLabel: "At Risk", hasRecommendations: true },
      { name: "Documentation and Knowledge", score: 51, ratingLabel: "At Risk", hasRecommendations: true },
      { name: "Network and Connectivity", score: 57, ratingLabel: "At Risk", hasRecommendations: true },
      { name: "Identity and Access", score: 49, ratingLabel: "At Risk", hasRecommendations: true },
    ];

    const recommendations = categories.map((category, index) =>
      makeRec({
        id: `rec-cat-${index}`,
        title: `${category.name} Improvement`,
        categoryName: category.name,
        priority: "high",
      }),
    );

    const findings = buildCategoryFindings(categories, null, recommendations);
    const impacts = findings.map((finding) => finding.businessImpact);
    const uniqueImpacts = new Set(impacts);

    expect(findings).toHaveLength(4);
    expect(uniqueImpacts.size).toBe(4);
    expect(findings.find((row) => row.categoryName.includes("Backup"))?.businessImpact).toMatch(/recover|backup|downtime|data loss/i);
    expect(findings.find((row) => row.categoryName.includes("Documentation"))?.businessImpact).toMatch(/knowledge|documentation|troubleshoot|recovery time|individual/i);
    expect(findings.find((row) => row.categoryName.includes("Network"))?.businessImpact).toMatch(/connectivity|network|performance|access/i);
    expect(findings.find((row) => row.categoryName.includes("Identity"))?.businessImpact).toMatch(/access|identity|credential|offboarding/i);
  });

  it("Test D — phase initiatives receive differentiated priorities", () => {
    const recommendations = Array.from({ length: 6 }, (_, index) =>
      makeRec({
        id: `rec-priority-${index}`,
        title: `Priority Initiative ${index + 1}`,
        priority: index === 0 ? "critical" : index <= 2 ? "high" : index <= 4 ? "medium" : "low",
        estimatedImpactPoints: 6 - index,
        categoryName: "Security",
      }),
    );

    const roadmap = makeRoadmap(
      recommendations.map((rec, index) => ({
        recommendationId: rec.id,
        title: rec.title,
        priority: rec.priority,
        sortOrder: index,
        costProfile: {
          recommendationId: rec.id,
          costType: "one_time" as const,
          oneTimeInvestment: 1000,
          monthlyRecurringInvestment: 0,
          annualRecurringInvestment: 0,
        },
      })),
    );

    const initiatives = buildStrategicInitiatives(roadmap, recommendations, [{ name: "Security", score: 45 }]);
    const priorities = initiatives.map((item) => item.priority);
    const uniquePriorities = new Set(priorities);

    expect(initiatives.length).toBe(6);
    expect(uniquePriorities.size).toBeGreaterThan(1);
    expect(priorities[0]).toBe("Immediate");
    expect(priorities.filter((value) => value === "High").length).toBeGreaterThan(0);
    expect(priorities.every((value) => value === "High")).toBe(false);

    const secondPass = buildStrategicInitiatives(roadmap, recommendations, [{ name: "Security", score: 45 }]);
    expect(secondPass.map((item) => item.priority)).toEqual(priorities);
  });

  it("Test E — critical risk with lower priority includes rationale", () => {
    const criticalRec = makeRec({
      id: "rec-critical-planned",
      title: "Advanced Monitoring",
      categoryName: "Infrastructure",
      priority: "critical",
      estimatedImpactPoints: 1,
      businessImpact: "Limited infrastructure visibility increases outage duration and troubleshooting delays.",
      executiveNote: "Establish proactive infrastructure visibility for leadership reporting.",
    });

    const fillerRecommendations = Array.from({ length: 5 }, (_, index) =>
      makeRec({
        id: `rec-fill-${index}`,
        title: `Stabilization Initiative ${index + 1}`,
        priority: index < 2 ? "critical" : "high",
        estimatedImpactPoints: 6 - index,
        categoryName: "Security",
        businessImpact: `Current security gap ${index + 1} increases exposure to preventable incidents.`,
        executiveNote: `Establish stronger security capability ${index + 1} for leadership oversight.`,
      }),
    );

    const recommendations = [...fillerRecommendations, criticalRec];
    const initiatives = recommendations.map((rec, index) => ({
      recommendationId: rec.id,
      title: rec.title,
      priority: rec.priority,
      sortOrder: index,
      costProfile: {
        recommendationId: rec.id,
        costType: "one_time" as const,
        oneTimeInvestment: 1000 + index * 250,
        monthlyRecurringInvestment: 0,
        annualRecurringInvestment: 0,
      },
    }));

    const built = buildStrategicInitiatives(
      makeRoadmap(initiatives),
      recommendations,
      [
        { name: "Infrastructure", score: 42 },
        { name: "Security", score: 40 },
      ],
    );

    const initiative = built.find((item) => item.id === criticalRec.id);
    expect(initiative?.riskLevel).toBe("Critical");
    expect(["Moderate", "Planned"].includes(initiative?.priority ?? "")).toBe(true);
    expect(initiative?.priorityRationale?.length ?? 0).toBeGreaterThan(20);
  });

  it("Test F — investment summary separates managed services and Strategic IT Consulting", () => {
    const recommendations = [
      makeRec({
        id: "rec-managed",
        title: "Managed Endpoint Services",
        suggestedService: "Managed IT Services",
      }),
      makeRec({
        id: "rec-vcio",
        title: "Strategic IT Consulting Partnership",
        suggestedService: "vCIO Consulting",
        businessImpact: "Without executive technology governance, roadmap execution loses accountability.",
        executiveNote: "Leadership receives ongoing roadmap management and executive review cadence.",
      }),
    ];

    const roadmap = makeRoadmap([
      {
        recommendationId: "rec-managed",
        title: "Managed Endpoint Services",
        priority: "high",
        sortOrder: 0,
        costProfile: {
          recommendationId: "rec-managed",
          costType: "recurring" as const,
          oneTimeInvestment: 0,
          monthlyRecurringInvestment: 2616,
          annualRecurringInvestment: 31392,
        },
      },
      {
        recommendationId: "rec-vcio",
        title: "Strategic IT Consulting Partnership",
        priority: "medium",
        sortOrder: 1,
        costProfile: {
          recommendationId: "rec-vcio",
          costType: "recurring" as const,
          oneTimeInvestment: 0,
          monthlyRecurringInvestment: 300,
          annualRecurringInvestment: 3600,
        },
      },
    ]);

    const summary = buildTipInvestmentSummary(roadmap, recommendations);
    expect(summary.managedTechnologyServices.monthlyAmount).toBe(2616);
    expect(summary.strategicItConsulting.monthlyAmount).toBe(300);
    expect(summary.strategicItConsulting.includedInRoadmap).toBe(true);
    expect(summary.combinedMonthlyTotal).toBe(2916);
    expect(summary.combinedMonthlyLabel).toBe("Combined Monthly Investment");
  });

  it("Test G — missing optional fields use category-specific fallbacks via validation", () => {
    const rec = makeRec({
      id: "rec-minimal",
      title: "Patch Management Standardization",
      categoryName: "Endpoint Management",
      businessImpact: "",
      executiveNote: "",
      description: "",
    });

    const fields = resolveInitiativeFields(rec, computeInitiativeRiskLevel(rec, 48));
    expect(fields.businessObjective.length).toBeGreaterThan(20);
    expect(fields.whyItMatters.length).toBeGreaterThan(20);
    expect(areTipTextsIdentical(fields.businessObjective, fields.whyItMatters)).toBe(false);

    const report = finalizeTipReportData({
      clientName: "Fixture Client",
      title: "Technology Improvement Plan",
      version: 1,
      generatedDate: "July 19, 2026",
      assessmentName: null,
      executiveSummary: "Summary",
      currentScore: 55,
      projectedScore: 72,
      scoreImprovement: 17,
      maturityTier: null,
      maturityTierLabel: null,
      recommendations: [rec],
      roadmapPhases: [],
      technologyRoadmap: makeRoadmap([
        {
          recommendationId: rec.id,
          title: rec.title,
          priority: "high",
          sortOrder: 0,
          costProfile: {
            recommendationId: rec.id,
            costType: "mixed" as const,
            oneTimeInvestment: 1000,
            monthlyRecurringInvestment: 100,
            annualRecurringInvestment: 1200,
          },
        },
      ]),
      clientInvestmentTotal: 1000,
      oneTimeInvestmentTotal: 1000,
      monthlyRecurringTotal: 100,
      annualRecurringTotal: 1200,
      investmentLineItems: [],
      categorySummaries: [{ name: "Endpoint Management", score: 48, ratingLabel: "At Risk", hasRecommendations: true }],
      businessOutcomes: [],
      journeyPhaseLabel: "Improve",
      journeyProgressPercent: 0,
      includeInternalDetails: false,
      assessmentDate: null,
      overallBusinessRisk: "High",
      topBusinessRisks: buildTopBusinessRisks([rec]),
      topOpportunities: buildTopOpportunities([rec], makeRoadmap([]), [{ name: "Endpoint Management", score: 48, ratingLabel: "At Risk", hasRecommendations: true }]),
      categoryFindings: buildCategoryFindings(
        [{ name: "Endpoint Management", score: 48, ratingLabel: "At Risk", hasRecommendations: true }],
        null,
        [rec],
      ),
      strategicInitiatives: buildStrategicInitiatives(
        makeRoadmap([
          {
            recommendationId: rec.id,
            title: rec.title,
            priority: "high",
            sortOrder: 0,
            costProfile: {
              recommendationId: rec.id,
              costType: "mixed" as const,
              oneTimeInvestment: 1000,
              monthlyRecurringInvestment: 100,
              annualRecurringInvestment: 1200,
            },
          },
        ]),
        [rec],
        [{ name: "Endpoint Management", score: 48 }],
      ),
      phaseInvestmentRows: [],
      businessValueSnapshot: [],
      investmentSummary: createTestInvestmentSummary(
        makeRoadmap([
          {
            recommendationId: rec.id,
            title: rec.title,
            priority: "high",
            sortOrder: 0,
            costProfile: {
              recommendationId: rec.id,
              costType: "mixed" as const,
              oneTimeInvestment: 1000,
              monthlyRecurringInvestment: 100,
              annualRecurringInvestment: 1200,
            },
          },
        ]),
        [rec],
      ),
    } satisfies TipReportData);

    expect(report.strategicInitiatives[0]?.businessObjective.length).toBeGreaterThan(0);
    expect(report.strategicInitiatives[0]?.whyItMatters.length).toBeGreaterThan(0);
    expect(validateTipReportContent(report).some((issue) => issue.level === "error")).toBe(false);
  });
});

describe("priority mapping updates", () => {
  it("maps database priorities to executive tiers", () => {
    expect(priorityToExecutiveLevel("critical")).toBe("Immediate");
    expect(priorityToExecutiveLevel("high")).toBe("High");
    expect(priorityToExecutiveLevel("medium")).toBe("Moderate");
    expect(priorityToExecutiveLevel("low")).toBe("Planned");
  });

  it("assigns deterministic relative tiers within a phase", () => {
    const tiers = assignExecutivePriorityTiers([
      { id: "a", score: 10, riskLevel: "Critical", sortKey: "a" },
      { id: "b", score: 9, riskLevel: "High", sortKey: "b" },
      { id: "c", score: 8, riskLevel: "High", sortKey: "c" },
      { id: "d", score: 7, riskLevel: "Moderate", sortKey: "d" },
      { id: "e", score: 6, riskLevel: "Moderate", sortKey: "e" },
      { id: "f", score: 5, riskLevel: "Low", sortKey: "f" },
    ]);

    expect(tiers.get("a")).toBe("Immediate");
    expect(new Set(tiers.values()).size).toBeGreaterThan(1);
  });
});
