import type { Priority, Rating } from "@/generated/prisma/client";
import { BRAND } from "@/lib/branding";
import { getRating, RATING_LABELS } from "@/lib/scoring";
import type { PillarScoreSnapshot } from "@/lib/scoring/v2";
import { sortByRecommendationPriority } from "@/lib/recommendations/display";
import type { RoadmapPhaseResult, TechnologyRoadmap } from "@/lib/technology-improvement-plan/roadmap-engine";
import { formatCurrency } from "@/lib/technology-improvement-plan/pricing";
import type { TipPlanDetail, TipRecommendationView } from "@/lib/technology-improvement-plan/types";
import type { RiskSummary } from "@/lib/technology-profile/types";
import type {
  TipBusinessValueMetric,
  TipCategoryFinding,
  TipPhaseInvestmentRow,
  TipStrategicInitiative,
} from "@/lib/pdf/types";

export type ExecutiveRiskLevel = "Low" | "Moderate" | "High" | "Critical";
export type ExecutivePriorityLevel = "Low" | "Medium" | "High";

export function ratingToExecutiveRisk(rating: Rating): ExecutiveRiskLevel {
  switch (rating) {
    case "critical":
      return "Critical";
    case "at_risk":
      return "High";
    case "stable":
      return "Moderate";
    case "strong":
    case "exceptional":
      return "Low";
    default:
      return "Moderate";
  }
}

export function scoreToExecutiveRisk(score: number): ExecutiveRiskLevel {
  return ratingToExecutiveRisk(getRating(score));
}

export function priorityToExecutiveLevel(priority: Priority): ExecutivePriorityLevel {
  if (priority === "critical" || priority === "high") return "High";
  if (priority === "medium") return "Medium";
  return "Low";
}

export function computeOverallBusinessRisk(
  currentScore: number,
  riskSummary?: RiskSummary | null,
): ExecutiveRiskLevel {
  if (riskSummary?.criticalExposure || riskSummary?.critical) {
    return "Critical";
  }
  if ((riskSummary?.high ?? 0) >= 3) return "High";
  return scoreToExecutiveRisk(currentScore);
}

function highestPriorityInCategory(
  recommendations: TipRecommendationView[],
  categoryName: string,
): ExecutivePriorityLevel {
  const inCategory = recommendations.filter((rec) => rec.categoryName === categoryName);
  if (inCategory.length === 0) return "Low";
  const sorted = sortByRecommendationPriority(inCategory);
  return priorityToExecutiveLevel(sorted[0]!.priority);
}

function describeCurrentState(pillar: {
  name: string;
  score: number;
  ratingLabel: string;
  businessQuestion?: string;
}): string {
  if (pillar.score >= 80) {
    return `${pillar.name} demonstrates strong maturity (${pillar.score}/100, ${pillar.ratingLabel}). Core capabilities appear established, with opportunities to optimize rather than rebuild.`;
  }
  if (pillar.score >= 70) {
    return `${pillar.name} is functional but not yet optimized (${pillar.score}/100, ${pillar.ratingLabel}). The organization has baseline capability with gaps that may limit scalability or resilience.`;
  }
  if (pillar.score >= 60) {
    return `${pillar.name} shows material gaps (${pillar.score}/100, ${pillar.ratingLabel}). Current practices may not consistently support business continuity or growth expectations.`;
  }
  return `${pillar.name} requires executive attention (${pillar.score}/100, ${pillar.ratingLabel}). Observed maturity suggests elevated exposure that could affect operations, security, or strategic planning.`;
}

function describeBusinessImpact(
  score: number,
  riskLevel: ExecutiveRiskLevel,
  hasRecommendations: boolean,
): string {
  const impacts: string[] = [];

  if (score < 70 || riskLevel === "Critical" || riskLevel === "High") {
    impacts.push("Increased business risk and potential disruption to operations");
  }
  if (score < 75) {
    impacts.push("Higher operating costs from reactive support and inefficiency");
  }
  if (score < 80 && hasRecommendations) {
    impacts.push("Reduced productivity when technology creates friction for employees");
  }
  if (riskLevel === "Critical" || riskLevel === "High") {
    impacts.push("Potential compliance or cybersecurity exposure");
  }
  if (score < 70) {
    impacts.push("Limited scalability as the business grows");
  }

  if (impacts.length === 0) {
    return "Maintaining this domain at its current level supports operational stability. Targeted improvements can still strengthen resilience and executive visibility.";
  }

  return impacts.slice(0, 4).join(". ") + ".";
}

export function buildCategoryFindings(
  categorySummaries: Array<{
    name: string;
    score: number;
    ratingLabel: string;
    hasRecommendations: boolean;
  }>,
  pillarSnapshots: PillarScoreSnapshot[] | null | undefined,
  recommendations: TipRecommendationView[],
): TipCategoryFinding[] {
  const businessQuestions = new Map(
    (pillarSnapshots ?? []).map((pillar) => [pillar.pillarName, pillar.businessQuestion]),
  );

  return categorySummaries.map((category) => {
    const riskLevel = scoreToExecutiveRisk(category.score);
    return {
      categoryName: category.name,
      currentState: describeCurrentState({
        name: category.name,
        score: category.score,
        ratingLabel: category.ratingLabel,
        businessQuestion: businessQuestions.get(category.name),
      }),
      businessImpact: describeBusinessImpact(
        category.score,
        riskLevel,
        category.hasRecommendations,
      ),
      riskLevel,
      priority: highestPriorityInCategory(recommendations, category.name),
    };
  });
}

function executiveBenefitsForRecommendation(rec: TipRecommendationView): string[] {
  const benefits = new Set<string>();
  const impact = rec.businessImpact.toLowerCase();

  if (/downtime|continuity|recover|outage|backup/.test(impact)) {
    benefits.add("Reduced downtime and improved business continuity");
  }
  if (/security|cyber|threat|breach|protect/.test(impact)) {
    benefits.add("Improved security posture and risk reduction");
  }
  if (/visibility|report|executive|insight|dashboard/.test(impact)) {
    benefits.add("Better operational visibility for leadership");
  }
  if (/productiv|efficien|onboard|employee|workflow/.test(impact)) {
    benefits.add("Improved employee productivity and efficiency");
  }
  if (/cost|budget|spend|savings/.test(impact)) {
    benefits.add("Lower long-term IT operating costs");
  }

  if (benefits.size === 0) {
    benefits.add("Strengthened technology foundation aligned to business priorities");
    benefits.add("Reduced operational friction for employees and leadership");
  }

  return Array.from(benefits).slice(0, 4);
}

function formatInitiativeInvestment(
  phase: RoadmapPhaseResult,
  initiativeCost: { oneTimeInvestment: number; monthlyRecurringInvestment: number },
): string {
  const parts: string[] = [];
  if (initiativeCost.oneTimeInvestment > 0) {
    parts.push(formatCurrency(initiativeCost.oneTimeInvestment));
  }
  if (initiativeCost.monthlyRecurringInvestment > 0) {
    parts.push(`${formatCurrency(initiativeCost.monthlyRecurringInvestment)}/month`);
  }
  if (parts.length === 0 && phase.oneTimeInvestment > 0) {
    return "Included in phase investment";
  }
  return parts.length > 0 ? parts.join(" · ") : "Consulting engagement";
}

export function buildStrategicInitiatives(
  roadmap: TechnologyRoadmap,
  recommendations: TipRecommendationView[],
): TipStrategicInitiative[] {
  const recById = new Map(recommendations.map((rec) => [rec.id, rec]));
  const initiatives: TipStrategicInitiative[] = [];

  for (const phase of roadmap.phases) {
    for (const initiative of phase.initiatives) {
      const rec = recById.get(initiative.recommendationId);
      const businessObjective =
        rec?.executiveNote?.trim() ||
        rec?.businessImpact?.trim() ||
        `Improve ${initiative.title.toLowerCase()} to support business goals.`;
      const whyItMatters =
        rec?.businessImpact?.trim() ||
        "Addressing this area reduces business risk and supports more reliable operations.";

      initiatives.push({
        id: initiative.recommendationId,
        name: initiative.title,
        businessObjective,
        whyItMatters,
        expectedBenefits: rec ? executiveBenefitsForRecommendation(rec) : [
          "Improved operational reliability",
          "Reduced business risk",
        ],
        recommendedPhase: phase.subtitle,
        estimatedInvestment: formatInitiativeInvestment(phase, initiative.costProfile),
        priority: rec ? priorityToExecutiveLevel(rec.priority) : priorityToExecutiveLevel(initiative.priority),
      });
    }
  }

  return initiatives;
}

export function buildPhaseInvestmentRows(roadmap: TechnologyRoadmap): TipPhaseInvestmentRow[] {
  return roadmap.phases.map((phase) => ({
    phaseLabel: phase.subtitle,
    businessGoal: phase.name,
    estimatedInvestment: formatPhaseInvestment(phase),
  }));
}

export function formatPhaseInvestment(phase: RoadmapPhaseResult): string {
  const parts: string[] = [];
  if (phase.oneTimeInvestment > 0) {
    parts.push(formatCurrency(phase.oneTimeInvestment));
  }
  if (phase.monthlyRecurringInvestment > 0) {
    parts.push(`${formatCurrency(phase.monthlyRecurringInvestment)}/month`);
  }
  return parts.length > 0 ? parts.join(" · ") : "Scoped during engagement";
}

const BUSINESS_VALUE_DIMENSIONS = [
  { label: "Security", keywords: ["security", "identity", "access", "cyber"] },
  { label: "Operational Efficiency", keywords: ["endpoint", "productivity", "collaboration", "management"] },
  { label: "Business Continuity", keywords: ["backup", "recovery", "continuity", "disaster", "data protection"] },
  { label: "Visibility", keywords: ["documentation", "knowledge", "report", "visibility"] },
  { label: "Strategic Alignment", keywords: ["strategy", "strategic", "network", "planning"] },
] as const;

export function buildBusinessValueSnapshot(
  categorySummaries: Array<{ name: string; score: number; hasRecommendations: boolean }>,
  currentScore: number,
  projectedScore: number,
): TipBusinessValueMetric[] {
  const improvement = Math.max(0, projectedScore - currentScore);

  return BUSINESS_VALUE_DIMENSIONS.map((dimension) => {
    const matching = categorySummaries.filter((category) =>
      dimension.keywords.some((keyword) =>
        category.name.toLowerCase().includes(keyword),
      ),
    );

    const currentPercent =
      matching.length > 0
        ? Math.round(matching.reduce((sum, row) => sum + row.score, 0) / matching.length)
        : currentScore;

    const boost = matching.some((row) => row.hasRecommendations)
      ? Math.round(improvement * 0.85)
      : Math.round(improvement * 0.35);

    return {
      label: dimension.label,
      currentPercent,
      projectedPercent: Math.min(100, currentPercent + boost),
    };
  });
}

export function buildTopBusinessRisks(recommendations: TipRecommendationView[]): string[] {
  return sortByRecommendationPriority(recommendations)
    .slice(0, 5)
    .map((rec) => rec.businessImpact.trim())
    .filter(Boolean);
}

export function buildTopOpportunities(
  recommendations: TipRecommendationView[],
  roadmap: TechnologyRoadmap,
): string[] {
  const fromOutcomes = roadmap.phases
    .flatMap((phase) => phase.businessOutcomes)
    .map((outcome) => (outcome.description || outcome.title).trim())
    .filter(Boolean);

  const fromRecs = sortByRecommendationPriority(recommendations)
    .slice(0, 3)
    .map((rec) => rec.executiveNote.trim() || rec.businessImpact.trim())
    .filter(Boolean);

  const combined = [...fromOutcomes, ...fromRecs];
  const seen = new Set<string>();
  const results: string[] = [];

  for (const item of combined) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(item);
    if (results.length >= 5) break;
  }

  return results;
}

export function buildExecutiveSummaryFallback(
  clientName: string,
  currentScore: number,
  projectedScore: number,
  maturityLabel: string | null,
): string {
  const rating = RATING_LABELS[getRating(currentScore)];
  return `${clientName} completed a Technology Maturity Assessment resulting in an overall StackScore of ${currentScore} (${rating}). This Technology Improvement Plan identifies strategic opportunities to strengthen business continuity, operational efficiency, and technology governance. Completing the recommended roadmap is projected to advance the organization's StackScore to ${projectedScore}, representing measurable progress toward a more resilient and scalable technology foundation. Implementation planning, product selection, and execution are intentionally reserved for an ongoing consulting partnership with ${BRAND.companyName}.`;
}

export function buildExecutiveReportFields(input: {
  categorySummaries: Array<{
    name: string;
    score: number;
    ratingLabel: string;
    hasRecommendations: boolean;
  }>;
  recommendations: TipRecommendationView[];
  technologyRoadmap: TechnologyRoadmap;
  currentScore: number;
  projectedScore: number;
  assessmentDate?: string | null;
  riskSummary?: RiskSummary | null;
}) {
  return {
    assessmentDate: input.assessmentDate ?? null,
    overallBusinessRisk: computeOverallBusinessRisk(input.currentScore, input.riskSummary),
    topBusinessRisks: buildTopBusinessRisks(input.recommendations),
    topOpportunities: buildTopOpportunities(input.recommendations, input.technologyRoadmap),
    categoryFindings: buildCategoryFindings(
      input.categorySummaries,
      null,
      input.recommendations,
    ),
    strategicInitiatives: buildStrategicInitiatives(
      input.technologyRoadmap,
      input.recommendations,
    ),
    phaseInvestmentRows: buildPhaseInvestmentRows(input.technologyRoadmap),
    businessValueSnapshot: buildBusinessValueSnapshot(
      input.categorySummaries,
      input.currentScore,
      input.projectedScore,
    ),
  };
}

export function enrichTipPlanForExecutiveReport(plan: TipPlanDetail) {
  const categorySummaries =
    plan.profile?.profile.pillarSnapshots?.map((pillar) => ({
      name: pillar.pillarName,
      score: pillar.percentScore !== null ? Math.round(pillar.percentScore) : 0,
      ratingLabel:
        pillar.maturityLevelLabel ??
        (pillar.percentScore !== null
          ? RATING_LABELS[getRating(pillar.percentScore)]
          : "Not assessed"),
      hasRecommendations: plan.recommendations.some((rec) => rec.categoryName === pillar.pillarName),
    })) ??
    plan.profile?.profile.categoryScores.map((category) => ({
      name: category.categoryName,
      score: Math.round(category.percentScore),
      ratingLabel: RATING_LABELS[getRating(category.percentScore)],
      hasRecommendations: plan.recommendations.some(
        (rec) => rec.categoryName === category.categoryName,
      ),
    })) ??
    [];

  const roadmap = plan.technologyRoadmap;
  const projectedScore = roadmap.totals.projectedFinalStackScore || plan.projectedScore;
  const currentScore = plan.currentScore;

  return {
    assessmentDate: plan.profile?.profile.lastAssessedAt
      ? new Date(plan.profile.profile.lastAssessedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : plan.assessmentName,
    overallBusinessRisk: computeOverallBusinessRisk(
      currentScore,
      plan.profile?.profile.riskSummary,
    ),
    topBusinessRisks: buildTopBusinessRisks(plan.recommendations),
    topOpportunities: buildTopOpportunities(plan.recommendations, roadmap),
    categoryFindings: buildCategoryFindings(
      categorySummaries,
      plan.profile?.profile.pillarSnapshots,
      plan.recommendations,
    ),
    strategicInitiatives: buildStrategicInitiatives(roadmap, plan.recommendations),
    phaseInvestmentRows: buildPhaseInvestmentRows(roadmap),
    businessValueSnapshot: buildBusinessValueSnapshot(
      categorySummaries,
      currentScore,
      projectedScore,
    ),
  };
}
