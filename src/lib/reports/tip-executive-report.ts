import type { Priority, Rating } from "@/generated/prisma/client";
import { BRAND } from "@/lib/branding";
import { getRating, RATING_LABELS } from "@/lib/scoring";
import type { PillarScoreSnapshot } from "@/lib/scoring/v2";
import type { RoadmapPhaseResult, TechnologyRoadmap } from "@/lib/technology-improvement-plan/roadmap-engine";
import { formatCurrency } from "@/lib/technology-improvement-plan/pricing";
import type { TipPlanDetail, TipRecommendationView } from "@/lib/technology-improvement-plan/types";
import type { RiskSummary } from "@/lib/technology-profile/types";
import type {
  TipBusinessValueMetric,
  TipCategoryFinding,
  TipPhaseInvestmentRow,
  TipStrategicInitiative,
  ExecutivePriorityLevel,
  ExecutiveRiskLevel,
} from "@/lib/pdf/types";
import {
  describeCategoryBusinessImpact,
  describeCategoryCurrentState,
} from "@/lib/reports/tip-category-content";
import { resolveInitiativeFields } from "@/lib/reports/tip-initiative-content";
import {
  assignExecutivePriorityTiers,
  buildCategoryScoreMap,
  categoryScoreForRecommendation,
  computeCategoryExecutivePriority,
  computeInitiativeRiskLevel,
  generatePriorityRationale,
  scoreInitiativePriority,
  shouldIncludePriorityRationale,
} from "@/lib/reports/tip-priority-scoring";
import { buildTopBusinessRisks, buildTopOpportunities } from "@/lib/reports/tip-risks-opportunities";

export type { ExecutiveRiskLevel, ExecutivePriorityLevel };

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
  if (priority === "critical") return "Immediate";
  if (priority === "high") return "High";
  if (priority === "medium") return "Moderate";
  return "Planned";
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
    const categoryRecs = recommendations.filter((rec) => rec.categoryName === category.name);
    const riskLevel = scoreToExecutiveRisk(category.score);
    const priority = computeCategoryExecutivePriority(recommendations, category.name);
    const context = {
      categoryName: category.name,
      score: category.score,
      ratingLabel: category.ratingLabel,
      riskLevel,
      hasRecommendations: category.hasRecommendations,
      recommendations: categoryRecs,
      businessQuestion: businessQuestions.get(category.name),
    };

    const findingRisk = riskLevel;
    const findingPriority = priority;
    const priorityRationale = shouldIncludePriorityRationale(findingRisk, findingPriority)
      ? generatePriorityRationale({
          riskLevel: findingRisk,
          priority: findingPriority,
          recommendedPhase: "this category",
          title: category.name,
          hasCompensatingControl: category.score >= 70 && findingRisk === "Critical",
        })
      : undefined;

    return {
      categoryName: category.name,
      currentState: describeCategoryCurrentState(context),
      businessImpact: describeCategoryBusinessImpact(context),
      riskLevel: findingRisk,
      priority: findingPriority,
      priorityRationale,
    };
  });
}

export function buildStrategicInitiatives(
  roadmap: TechnologyRoadmap,
  recommendations: TipRecommendationView[],
  categorySummaries: Array<{ name: string; score: number }>,
): TipStrategicInitiative[] {
  const recById = new Map(recommendations.map((rec) => [rec.id, rec]));
  const categoryScores = buildCategoryScoreMap(categorySummaries);
  const initiatives: TipStrategicInitiative[] = [];

  for (const phase of roadmap.phases) {
    const phaseInputs = phase.initiatives.map((initiative, initiativeSortOrder) => {
      const rec = recById.get(initiative.recommendationId);
      const categoryScore = rec
        ? categoryScoreForRecommendation(rec, categoryScores)
        : undefined;
      const riskLevel = rec
        ? computeInitiativeRiskLevel(rec, categoryScore)
        : scoreToExecutiveRisk(60);
      const score = rec
        ? scoreInitiativePriority({
            recommendationId: initiative.recommendationId,
            rec,
            categoryScore,
            phaseSortOrder: phase.sortOrder,
            initiativeSortOrder,
            hasBlockingDependency: phase.sortOrder > 0 && rec.priority === "critical",
            hasCompensatingControl: (categoryScore ?? 100) >= 75 && riskLevel === "Critical",
          })
        : 0;

      return {
        id: initiative.recommendationId,
        score,
        riskLevel,
        sortKey: initiative.recommendationId,
        initiative,
        rec,
      };
    });

    const priorityById = assignExecutivePriorityTiers(phaseInputs);

    for (const item of phaseInputs) {
      const rec = item.rec;
      const fields = rec
        ? resolveInitiativeFields(rec, item.riskLevel)
        : {
            businessObjective: `Improve ${item.initiative.title.toLowerCase()} to support business goals.`,
            whyItMatters:
              "Addressing this area reduces business risk and supports more reliable operations.",
            expectedBenefits: ["Improved operational reliability", "Reduced business risk"],
          };

      const priority = priorityById.get(item.id) ?? "Moderate";
      const priorityRationale = generatePriorityRationale({
        riskLevel: item.riskLevel,
        priority,
        recommendedPhase: phase.subtitle,
        title: item.initiative.title,
        hasBlockingDependency: phase.sortOrder > 0 && item.riskLevel === "Critical",
        hasCompensatingControl: item.rec ? (categoryScoreForRecommendation(item.rec, categoryScores) ?? 0) >= 75 && item.riskLevel === "Critical" : false,
      });

      initiatives.push({
        id: item.id,
        name: item.initiative.title,
        businessObjective: fields.businessObjective,
        whyItMatters: fields.whyItMatters,
        expectedBenefits: fields.expectedBenefits,
        recommendedPhase: phase.subtitle,
        estimatedInvestment: formatInitiativeInvestment(phase, item.initiative.costProfile),
        priority,
        riskLevel: item.riskLevel,
        priorityRationale,
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

export { buildTopBusinessRisks, buildTopOpportunities } from "@/lib/reports/tip-risks-opportunities";

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
    topOpportunities: buildTopOpportunities(input.recommendations, input.technologyRoadmap, input.categorySummaries),
    categoryFindings: buildCategoryFindings(
      input.categorySummaries,
      null,
      input.recommendations,
    ),
    strategicInitiatives: buildStrategicInitiatives(
      input.technologyRoadmap,
      input.recommendations,
      input.categorySummaries,
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
    topOpportunities: buildTopOpportunities(plan.recommendations, roadmap, categorySummaries),
    categoryFindings: buildCategoryFindings(
      categorySummaries,
      plan.profile?.profile.pillarSnapshots,
      plan.recommendations,
    ),
    strategicInitiatives: buildStrategicInitiatives(roadmap, plan.recommendations, categorySummaries),
    phaseInvestmentRows: buildPhaseInvestmentRows(roadmap),
    businessValueSnapshot: buildBusinessValueSnapshot(
      categorySummaries,
      currentScore,
      projectedScore,
    ),
  };
}
