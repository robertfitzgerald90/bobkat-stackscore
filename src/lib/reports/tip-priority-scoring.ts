import type { Priority } from "@/generated/prisma/client";
import type { ExecutivePriorityLevel, ExecutiveRiskLevel } from "@/lib/pdf/types";
import { getRating } from "@/lib/scoring";
import { RECOMMENDATION_PRIORITY_ORDER } from "@/lib/recommendations/display";
import type { TipRecommendationView } from "@/lib/technology-improvement-plan/types";

function scoreToRiskLevel(score: number): ExecutiveRiskLevel {
  const rating = getRating(score);
  if (rating === "critical") return "Critical";
  if (rating === "at_risk") return "High";
  if (rating === "stable") return "Moderate";
  return "Low";
}

const PRIORITY_TIER_ORDER: ExecutivePriorityLevel[] = [
  "Immediate",
  "High",
  "Moderate",
  "Planned",
];

const DB_PRIORITY_WEIGHT: Record<Priority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const EXECUTIVE_RISK_WEIGHT: Record<ExecutiveRiskLevel, number> = {
  Critical: 4,
  High: 3,
  Moderate: 2,
  Low: 1,
};

export function computeInitiativeRiskLevel(
  rec: TipRecommendationView,
  categoryScore?: number,
): ExecutiveRiskLevel {
  const scoreRisk = categoryScore !== undefined ? scoreToRiskLevel(categoryScore) : "Moderate";
  const priorityRisk: ExecutiveRiskLevel =
    rec.priority === "critical"
      ? "Critical"
      : rec.priority === "high"
        ? "High"
        : rec.priority === "medium"
          ? "Moderate"
          : "Low";

  const scoreWeight = EXECUTIVE_RISK_WEIGHT[scoreRisk];
  const priorityWeight = EXECUTIVE_RISK_WEIGHT[priorityRisk];
  const combined = Math.max(scoreWeight, priorityWeight);
  return combined >= 4 ? "Critical" : combined >= 3 ? "High" : combined >= 2 ? "Moderate" : "Low";
}

export type InitiativePriorityInput = {
  recommendationId: string;
  rec: TipRecommendationView;
  categoryScore?: number;
  phaseSortOrder: number;
  initiativeSortOrder: number;
  hasBlockingDependency?: boolean;
  hasCompensatingControl?: boolean;
};

export function scoreInitiativePriority(input: InitiativePriorityInput): number {
  const riskLevel = computeInitiativeRiskLevel(input.rec, input.categoryScore);
  const riskWeight = EXECUTIVE_RISK_WEIGHT[riskLevel] * 3;
  const likelihoodWeight = input.categoryScore !== undefined ? Math.max(0, 80 - input.categoryScore) / 10 : 2;
  const dependencyWeight = input.hasBlockingDependency ? -2 : 1;
  const businessImpactWeight = input.rec.estimatedImpactPoints * 0.35;
  const easeWeight = input.rec.priority === "low" ? 1.5 : input.rec.priority === "medium" ? 1 : 0.5;
  const strategicValueWeight = DB_PRIORITY_WEIGHT[input.rec.priority] * 1.25;
  const disruptionPenalty = input.rec.priority === "critical" ? 0.5 : 0;
  const costPenalty = input.rec.estimatedImpactPoints <= 2 ? 0.25 : 0;
  const compensatingReduction = input.hasCompensatingControl ? 1.5 : 0;

  return (
    riskWeight +
    likelihoodWeight +
    dependencyWeight +
    businessImpactWeight +
    easeWeight +
    strategicValueWeight -
    disruptionPenalty -
    costPenalty -
    compensatingReduction
  );
}

export function assignExecutivePriorityTiers(
  items: Array<{ id: string; score: number; riskLevel: ExecutiveRiskLevel; sortKey: string }>,
): Map<string, ExecutivePriorityLevel> {
  const result = new Map<string, ExecutivePriorityLevel>();
  if (items.length === 0) return result;

  const sorted = [...items].sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    const riskDiff = EXECUTIVE_RISK_WEIGHT[right.riskLevel] - EXECUTIVE_RISK_WEIGHT[left.riskLevel];
    if (riskDiff !== 0) return riskDiff;
    return left.sortKey.localeCompare(right.sortKey);
  });

  if (sorted.length === 1) {
    result.set(sorted[0]!.id, sorted[0]!.riskLevel === "Critical" ? "Immediate" : "High");
    return result;
  }

  const count = sorted.length;
  const immediateCount = Math.max(1, Math.round(count * 0.25));
  const highCount = Math.max(1, Math.round(count * 0.35));
  const moderateCount = Math.max(0, Math.round(count * 0.25));
  let plannedCount = count - immediateCount - highCount - moderateCount;
  if (plannedCount < 0) plannedCount = 0;

  let index = 0;
  for (; index < immediateCount && index < count; index += 1) {
    result.set(sorted[index]!.id, "Immediate");
  }
  for (; index < immediateCount + highCount && index < count; index += 1) {
    result.set(sorted[index]!.id, "High");
  }
  for (; index < immediateCount + highCount + moderateCount && index < count; index += 1) {
    result.set(sorted[index]!.id, "Moderate");
  }
  for (; index < count; index += 1) {
    result.set(sorted[index]!.id, "Planned");
  }

  return result;
}

export function computeCategoryExecutivePriority(
  recommendations: TipRecommendationView[],
  categoryName: string,
): ExecutivePriorityLevel {
  const inCategory = recommendations.filter((rec) => rec.categoryName === categoryName);
  if (inCategory.length === 0) return "Planned";

  const highestDbPriority = inCategory.reduce<Priority>((best, rec) => {
    return RECOMMENDATION_PRIORITY_ORDER.indexOf(rec.priority) <
      RECOMMENDATION_PRIORITY_ORDER.indexOf(best)
      ? rec.priority
      : best;
  }, "low");

  if (highestDbPriority === "critical") return "Immediate";
  if (highestDbPriority === "high") return "High";
  if (highestDbPriority === "medium") return "Moderate";
  return "Planned";
}

export function shouldIncludePriorityRationale(
  riskLevel: ExecutiveRiskLevel,
  priority: ExecutivePriorityLevel,
): boolean {
  const priorityRank = PRIORITY_TIER_ORDER.indexOf(priority);

  if (riskLevel === "Critical" && priorityRank >= PRIORITY_TIER_ORDER.indexOf("Moderate")) {
    return true;
  }
  if (riskLevel === "High" && priority === "Planned") {
    return true;
  }
  if ((riskLevel === "Moderate" || riskLevel === "Low") && priority === "Immediate") {
    return true;
  }
  return false;
}

export function generatePriorityRationale(input: {
  riskLevel: ExecutiveRiskLevel;
  priority: ExecutivePriorityLevel;
  recommendedPhase: string;
  title: string;
  hasCompensatingControl?: boolean;
  hasBlockingDependency?: boolean;
}): string | undefined {
  if (!shouldIncludePriorityRationale(input.riskLevel, input.priority)) {
    return undefined;
  }

  if (input.hasBlockingDependency) {
    return `Critical potential impact, but scheduled in ${input.recommendedPhase} because prerequisite identity and recovery controls must be established first.`;
  }
  if (input.hasCompensatingControl) {
    return `Critical potential impact, but scheduled after foundational controls because an existing compensating control reduces immediate likelihood.`;
  }
  if (input.riskLevel === "Critical" && input.priority === "Planned") {
    return `Severe potential impact, but planned for ${input.recommendedPhase} to avoid disrupting higher-priority stabilization work already underway.`;
  }
  if (input.riskLevel === "High" && input.priority === "Planned") {
    return `Material exposure remains, but ${input.title.toLowerCase()} is sequenced later to preserve focus on more time-sensitive stabilization initiatives.`;
  }
  if ((input.riskLevel === "Moderate" || input.riskLevel === "Low") && input.priority === "Immediate") {
    return `Lower overall category risk, but prioritized now because it unlocks dependent initiatives scheduled in later roadmap phases.`;
  }

  return `Risk severity and implementation timing diverge because ${input.recommendedPhase} sequencing balances business impact, dependencies, and operational disruption.`;
}

export function buildCategoryScoreMap(
  categories: Array<{ name: string; score: number }>,
): Map<string, number> {
  return new Map(categories.map((category) => [category.name, category.score]));
}

export function categoryScoreForRecommendation(
  rec: TipRecommendationView,
  categoryScores: Map<string, number>,
): number | undefined {
  return categoryScores.get(rec.categoryName);
}
