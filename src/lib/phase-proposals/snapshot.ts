import { buildPhaseExecutiveNarrative } from "@/lib/reports/tip-presentation";
import type { RoadmapPhaseResult } from "@/lib/technology-improvement-plan/roadmap-engine";
import type { PhaseProposalSnapshot } from "./types";

const DEFAULT_ASSUMPTIONS = [
  "Existing infrastructure remains available during the implementation window",
  "Administrative access will be provided for required systems and tenants",
  "Approved maintenance windows will be scheduled for disruptive work",
  "Third-party vendors will cooperate for integrations and cutovers as needed",
  "Project scheduling will follow a reasonable shared calendar with the client",
];

const DEFAULT_OUT_OF_SCOPE = [
  "Initiatives assigned to other roadmap phases",
  "Unmanaged hardware refreshes not included in this phase",
  "Ongoing work outside the approved phase timeline",
];

const DEFAULT_DEPENDENCIES = [
  "Assessment findings and prioritized recommendations remain accurate",
  "Client stakeholders available for discovery and acceptance checkpoints",
];

type PhaseLoad = {
  id: string;
  phaseKey: string;
  name: string;
  subtitle: string;
  timeline: string;
  executiveSummary: string;
  expectedScoreImprovement: number;
  oneTimeInvestment: number;
  monthlyRecurringInvestment: number;
  annualRecurringInvestment: number;
  initiatives: Array<{
    recommendationId: string;
    title: string;
    estimatedImpactPoints: number;
    businessOutcomeTitle: string | null;
    businessOutcomeDescription: string | null;
    recommendation: {
      description: string;
      businessImpact: string;
      priority: string;
      category: { name: string };
    };
  }>;
};

export function buildPhaseProposalSnapshot(input: {
  phase: PhaseLoad;
  clientName: string;
  assessmentName: string | null;
  assessmentDate: string | null;
  preparedByName: string;
}): PhaseProposalSnapshot {
  const { phase } = input;

  const narrativePhase = {
    id: phase.phaseKey,
    name: phase.name,
    subtitle: phase.subtitle,
    timeline: phase.timeline,
    sortOrder: 0,
    executiveSummary: phase.executiveSummary,
    stackScoreImprovement: phase.expectedScoreImprovement,
    projectedScore: 0,
    oneTimeInvestment: phase.oneTimeInvestment,
    monthlyRecurringInvestment: phase.monthlyRecurringInvestment,
    annualRecurringInvestment: phase.annualRecurringInvestment,
    initiatives: phase.initiatives.map((initiative, index) => ({
      recommendationId: initiative.recommendationId,
      title: initiative.title,
      priority: initiative.recommendation.priority as "low" | "medium" | "high" | "critical",
      sortOrder: index,
      costProfile: {
        recommendationId: initiative.recommendationId,
        costType: "mixed" as const,
        oneTimeInvestment: 0,
        monthlyRecurringInvestment: 0,
        annualRecurringInvestment: 0,
      },
    })),
    businessOutcomes: phase.initiatives.map((initiative) => ({
      title: initiative.businessOutcomeTitle ?? initiative.title,
      description:
        initiative.businessOutcomeDescription ?? initiative.recommendation.businessImpact,
    })),
    recommendationIds: phase.initiatives.map((initiative) => initiative.recommendationId),
  } satisfies RoadmapPhaseResult;

  const executiveSummary = [
    buildPhaseExecutiveNarrative(narrativePhase),
    `This proposal covers ${phase.subtitle} only. Remaining roadmap phases may be approved separately as priorities and budget allow.`,
    `Expected StackScore improvement for this phase: +${phase.expectedScoreImprovement} points.`,
  ].join("\n\n");

  const initiatives = phase.initiatives.map((initiative) => ({
    recommendationId: initiative.recommendationId,
    title: initiative.title,
    description: initiative.recommendation.description,
    businessImpact: initiative.recommendation.businessImpact,
    categoryName: initiative.recommendation.category.name,
    priority: initiative.recommendation.priority,
    estimatedImpactPoints: initiative.estimatedImpactPoints,
    deliverable: `Completed ${initiative.title} with documented acceptance criteria`,
  }));

  return {
    phaseId: phase.id,
    phaseKey: phase.phaseKey,
    phaseName: phase.name,
    phaseSubtitle: phase.subtitle,
    timeline: phase.timeline,
    executiveSummary,
    businessOutcomes: narrativePhase.businessOutcomes,
    initiatives,
    scopeOfWork: {
      includedInitiatives: initiatives.map((item) => item.title),
      implementationActivities: [
        "Kickoff and discovery confirmation for this phase",
        "Configuration, deployment, and validation of included initiatives",
        "Knowledge transfer and acceptance review with client stakeholders",
      ],
      deliverables: initiatives.map((item) => item.deliverable),
      expectedTimeline: phase.timeline,
      dependencies: DEFAULT_DEPENDENCIES,
      outOfScope: DEFAULT_OUT_OF_SCOPE,
    },
    assumptions: DEFAULT_ASSUMPTIONS,
    oneTimeInvestment: phase.oneTimeInvestment,
    monthlyRecurringInvestment: phase.monthlyRecurringInvestment,
    annualRecurringInvestment: phase.annualRecurringInvestment,
    expectedScoreImprovement: phase.expectedScoreImprovement,
    clientName: input.clientName,
    assessmentName: input.assessmentName,
    assessmentDate: input.assessmentDate,
    preparedByName: input.preparedByName,
  };
}
