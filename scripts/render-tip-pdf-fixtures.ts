/**
 * Renders Technology Improvement Plan PDF fixtures for visual inspection.
 * Usage: npx tsx scripts/render-tip-pdf-fixtures.ts
 */
import React from "react";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";

(globalThis as typeof globalThis & { React: typeof React }).React = React;
import type { Priority } from "../src/generated/prisma/client";
import { generateTipReportPdf } from "../src/lib/pdf/generate";
import type { TipReportData } from "../src/lib/pdf/types";
import { buildExecutiveReportFields } from "../src/lib/reports/tip-executive-report";
import type {
  RoadmapPhaseResult,
  TechnologyRoadmap,
} from "../src/lib/technology-improvement-plan/roadmap-engine";

const OUTPUT_DIR = path.join(process.cwd(), "tmp", "tip-pdf-fixtures");

function initiative(
  id: string,
  title: string,
  priority: Priority,
  oneTime: number,
  monthly = 0,
): RoadmapPhaseResult["initiatives"][number] {
  return {
    recommendationId: id,
    title,
    priority,
    sortOrder: 0,
    costProfile: {
      recommendationId: id,
      costType: monthly > 0 ? "mixed" : "one_time",
      oneTimeInvestment: oneTime,
      monthlyRecurringInvestment: monthly,
      annualRecurringInvestment: monthly * 12,
    },
  };
}

function phase(
  id: string,
  name: string,
  subtitle: string,
  initiatives: RoadmapPhaseResult["initiatives"],
  stackScoreImprovement: number,
  projectedScore: number,
): RoadmapPhaseResult {
  const oneTimeInvestment = initiatives.reduce(
    (sum, item) => sum + item.costProfile.oneTimeInvestment,
    0,
  );
  const monthlyRecurringInvestment = initiatives.reduce(
    (sum, item) => sum + item.costProfile.monthlyRecurringInvestment,
    0,
  );

  return {
    id,
    name,
    subtitle,
    timeline: "0–90 days",
    sortOrder: 0,
    executiveSummary: `${name} establishes the foundation for measurable improvement across identity, recovery, and operational visibility.`,
    stackScoreImprovement,
    projectedScore,
    oneTimeInvestment,
    monthlyRecurringInvestment,
    annualRecurringInvestment: monthlyRecurringInvestment * 12,
    initiatives,
    businessOutcomes: initiatives.map((item) => ({
      title: item.title,
      description: `Completing ${item.title.toLowerCase()} reduces operational risk and improves executive visibility into technology performance, compliance posture, and day-to-day reliability for the organization.`,
    })),
    recommendationIds: initiatives.map((item) => item.recommendationId),
  };
}

function buildRoadmap(phases: RoadmapPhaseResult[]): TechnologyRoadmap {
  const totals = phases.reduce(
    (acc, item) => ({
      totalOneTimeInvestment: acc.totalOneTimeInvestment + item.oneTimeInvestment,
      totalMonthlyRecurring: acc.totalMonthlyRecurring + item.monthlyRecurringInvestment,
      totalAnnualRecurring: acc.totalAnnualRecurring + item.annualRecurringInvestment,
      projectedFinalStackScore: item.projectedScore,
      legacyCombinedTotal:
        acc.legacyCombinedTotal +
        item.oneTimeInvestment +
        item.monthlyRecurringInvestment,
    }),
    {
      totalOneTimeInvestment: 0,
      totalMonthlyRecurring: 0,
      totalAnnualRecurring: 0,
      projectedFinalStackScore: 0,
      legacyCombinedTotal: 0,
    },
  );

  return {
    phases,
    totals,
    phaseAssignments: [],
  };
}

function buildFixture(name: string, phases: RoadmapPhaseResult[]): TipReportData {
  const roadmap = buildRoadmap(phases);
  const recommendations = phases.flatMap((item) =>
    item.initiatives.map((initiative) => ({
      id: initiative.recommendationId,
      title: initiative.title,
      description: `Implement ${initiative.title.toLowerCase()} using industry-standard controls, documented procedures, and consultant-led delivery to improve reliability, security, and operational visibility across the environment.`,
      businessImpact: `${initiative.title} strengthens business continuity, reduces support burden, and improves leadership confidence in technology operations.`,
      priority: initiative.priority,
      suggestedService: "Strategic IT Consulting",
      estimatedImpactPoints: 4,
      categoryName: "Security & Compliance",
      consultantNote: "",
      executiveNote: `Executive teams gain clearer reporting and reduced risk exposure after ${initiative.title.toLowerCase()} is complete.`,
      sortOrder: 0,
    })),
  );

  return {
    clientName: "Acme Manufacturing, Inc.",
    title: "Technology Improvement Plan",
    version: 2,
    generatedDate: "July 19, 2026",
    assessmentName: "Technology Maturity Assessment — June 2026",
    executiveSummary:
      "This Technology Improvement Plan presents a phased roadmap for Acme Manufacturing to strengthen technology resilience, reduce operational risk, and advance measurable business outcomes. Each phase may be approved independently as priorities and budget allow.",
    currentScore: 58,
    projectedScore: roadmap.totals.projectedFinalStackScore,
    scoreImprovement: roadmap.totals.projectedFinalStackScore - 58,
    maturityTier: null,
    maturityTierLabel: "Developing",
    recommendations,
    roadmapPhases: [],
    technologyRoadmap: roadmap,
    clientInvestmentTotal: roadmap.totals.totalOneTimeInvestment,
    oneTimeInvestmentTotal: roadmap.totals.totalOneTimeInvestment,
    monthlyRecurringTotal: roadmap.totals.totalMonthlyRecurring,
    annualRecurringTotal: roadmap.totals.totalAnnualRecurring,
    investmentLineItems: [],
    categorySummaries: [
      { name: "Security & Compliance", score: 52, ratingLabel: "At Risk", hasRecommendations: true },
      { name: "Infrastructure", score: 61, ratingLabel: "Stable", hasRecommendations: true },
      { name: "Operations", score: 64, ratingLabel: "Stable", hasRecommendations: false },
      { name: "Business Continuity", score: 49, ratingLabel: "At Risk", hasRecommendations: true },
    ],
    businessOutcomes: [],
    journeyPhaseLabel: "Improve",
    journeyProgressPercent: 42,
    includeInternalDetails: false,
    ...buildExecutiveReportFields({
      categorySummaries: [
        { name: "Security & Compliance", score: 52, ratingLabel: "At Risk", hasRecommendations: true },
        { name: "Infrastructure", score: 61, ratingLabel: "Stable", hasRecommendations: true },
        { name: "Operations", score: 64, ratingLabel: "Stable", hasRecommendations: false },
        { name: "Business Continuity", score: 49, ratingLabel: "At Risk", hasRecommendations: true },
      ],
      recommendations,
      technologyRoadmap: roadmap,
      currentScore: 58,
      projectedScore: roadmap.totals.projectedFinalStackScore,
      assessmentDate: "June 15, 2026",
    }),
  };
}

const FIXTURES = [
  {
    name: "single-phase-short",
    data: buildFixture("single-phase-short", [
      phase("phase-1", "Critical Stabilization", "Phase 1", [
        initiative("r1", "Multi-Factor Authentication", "critical", 3500),
        initiative("r2", "Backup Validation Program", "high", 5200, 400),
      ], 8, 66),
    ]),
  },
  {
    name: "multi-phase-long-copy",
    data: buildFixture("multi-phase-long-copy", [
      phase("phase-1", "Critical Stabilization", "Phase 1", [
        initiative("r1", "Identity & Access Hardening", "critical", 4800),
        initiative("r2", "Endpoint Detection & Response", "critical", 6200, 850),
        initiative("r3", "Disaster Recovery Modernization", "high", 9100),
      ], 10, 68),
      phase("phase-2", "Operational Maturity", "Phase 2", [
        initiative("r4", "Microsoft 365 Governance", "high", 5400),
        initiative("r5", "Network Segmentation", "medium", 7800),
        initiative("r6", "Executive Technology Dashboard", "medium", 4200, 300),
      ], 9, 77),
      phase("phase-3", "Strategic Enhancement", "Phase 3", [
        initiative("r7", "Client Portal Modernization", "medium", 12500),
        initiative("r8", "Automation & Workflow Optimization", "low", 6800),
      ], 7, 84),
    ]),
  },
];

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const fixture of FIXTURES) {
    const buffer = await generateTipReportPdf(fixture.data);
    const outputPath = path.join(OUTPUT_DIR, `${fixture.name}.pdf`);
    writeFileSync(outputPath, buffer);
    console.log(`Wrote ${outputPath} (${buffer.length} bytes)`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
