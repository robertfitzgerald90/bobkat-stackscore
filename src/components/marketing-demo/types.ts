/**
 * Client-facing Technology Improvement Plan demo types.
 * Intentionally exclude consultant-only and financial fields.
 */

export type TipDemoStage =
  | "maturity-profile"
  | "recommendations"
  | "solution-playbooks"
  | "technology-roadmap"
  | "executive-report";

export type TipDemoAudience = "client";

export type TipDemoPriority = "critical" | "high" | "medium" | "low";

export type TipDemoPillarScore = {
  id: string;
  name: string;
  currentScore: number;
  projectedScore: number;
  summary: string;
};

export type TipDemoRecommendation = {
  id: string;
  title: string;
  priority: TipDemoPriority;
  pillar: string;
  whyThisMatters: string;
  businessBenefit: string;
  expectedOutcome: string;
  implementationPhase: string;
};

export type TipDemoPlaybook = {
  id: string;
  title: string;
  pillar: string;
  objective: string;
  outcomes: string[];
  relatedRecommendationIds: string[];
};

export type TipDemoRoadmapItem = {
  id: string;
  title: string;
  pillar: string;
  priority: TipDemoPriority;
};

export type TipDemoRoadmapPhase = {
  id: string;
  name: string;
  timeframe: string;
  focus: string;
  outcomes: string[];
  items: TipDemoRoadmapItem[];
};

export type TipDemoReportSection = {
  id: string;
  title: string;
  readiness: "ready" | "in-progress" | "planned";
  summary: string;
};

export type ClientImprovementPlanDemoData = {
  planTitle: string;
  clientName: string;
  assessmentName: string;
  currentScore: number;
  projectedScore: number;
  expectedImprovement: number;
  estimatedTimeline: string;
  recommendationsIncluded: number;
  maturityLevel: string;
  overallRiskReduction: string;
  businessReadiness: string;
  priorityBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  businessObjectives: string[];
  pillars: TipDemoPillarScore[];
  recommendations: TipDemoRecommendation[];
  playbooks: TipDemoPlaybook[];
  roadmapPhases: TipDemoRoadmapPhase[];
  reportSections: TipDemoReportSection[];
  executiveSummary: string;
};

export const TIP_DEMO_STAGES: TipDemoStage[] = [
  "maturity-profile",
  "recommendations",
  "solution-playbooks",
  "technology-roadmap",
  "executive-report",
];

export const TIP_DEMO_STAGE_LABELS: Record<TipDemoStage, string> = {
  "maturity-profile": "Maturity Profile",
  recommendations: "Recommendations",
  "solution-playbooks": "Solution Playbooks",
  "technology-roadmap": "Technology Roadmap",
  "executive-report": "Executive Report",
};

export function isTipDemoStage(value: string | null | undefined): value is TipDemoStage {
  return (
    value === "maturity-profile" ||
    value === "recommendations" ||
    value === "solution-playbooks" ||
    value === "technology-roadmap" ||
    value === "executive-report"
  );
}
