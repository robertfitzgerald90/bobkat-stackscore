import type { MaturityTier, Priority, RecommendationStatus } from "@/generated/prisma/client";
import {
  V2_CATEGORY_DISPLAY_ORDER,
  V2_CATEGORY_LABELS,
  type V2CategoryScore,
} from "@/lib/assessment-library/category-mapping";
import { ACTIVE_RECOMMENDATION_STATUSES } from "@/lib/recommendations/dedupe";
import { MATURITY_TIER_LABELS } from "@/lib/scoring/maturity";

export type ComparisonAssessmentSummary = {
  id: string;
  assessmentName: string;
  completedAt: string | null;
  overallScore: number;
  maturityTier: MaturityTier;
  maturityTierLabel: string;
  assessorName: string | null;
};

export type CategoryComparisonRow = {
  categoryCode: string;
  categoryName: string;
  previousScore: number | null;
  currentScore: number | null;
  change: number | null;
  trend: "improved" | "declined" | "unchanged" | "not_assessed";
  previousMaturityTier: string | null;
  currentMaturityTier: string | null;
};

export type ComparisonRecommendationItem = {
  id: string;
  dedupeKey: string;
  title: string;
  priority: Priority;
  status: RecommendationStatus;
  categoryName: string;
};

export type RecommendationComparison = {
  newRecommendations: ComparisonRecommendationItem[];
  resolvedRecommendations: ComparisonRecommendationItem[];
  stillOpenRecommendations: ComparisonRecommendationItem[];
  noLongerTriggeredRecommendations: ComparisonRecommendationItem[];
  criticalHighUnresolved: ComparisonRecommendationItem[];
};

export type QuestionAnswerChange = {
  questionId: string;
  questionCode: string;
  questionText: string;
  categoryName: string;
  previousAnswer: string;
  currentAnswer: string;
  previousScore: number;
  currentScore: number;
  scoreImpact: number;
};

export type AssessmentComparison = {
  clientId: string;
  clientName: string;
  previous: ComparisonAssessmentSummary;
  current: ComparisonAssessmentSummary;
  scoreChange: number;
  maturityChanged: boolean;
  categoryComparisons: CategoryComparisonRow[];
  recommendations: RecommendationComparison;
  questionChanges: QuestionAnswerChange[];
  executiveSummary: string;
};

type TriggeredRecommendation = ComparisonRecommendationItem;

function buildV2ScoreMap(scores: V2CategoryScore[]): Map<string, V2CategoryScore> {
  return new Map(scores.map((score) => [score.categoryCode, score]));
}

export function buildCategoryComparisons(
  previousV2: V2CategoryScore[],
  currentV2: V2CategoryScore[],
): CategoryComparisonRow[] {
  const previousMap = buildV2ScoreMap(previousV2);
  const currentMap = buildV2ScoreMap(currentV2);

  return V2_CATEGORY_DISPLAY_ORDER.map((categoryCode) => {
    const previous = previousMap.get(categoryCode);
    const current = currentMap.get(categoryCode);
    const previousScore = previous ? Math.round(previous.percentScore) : null;
    const currentScore = current ? Math.round(current.percentScore) : null;

    let change: number | null = null;
    let trend: CategoryComparisonRow["trend"] = "not_assessed";

    if (previousScore !== null && currentScore !== null) {
      change = currentScore - previousScore;
      if (change > 0) trend = "improved";
      else if (change < 0) trend = "declined";
      else trend = "unchanged";
    }

    return {
      categoryCode,
      categoryName: V2_CATEGORY_LABELS[categoryCode] ?? categoryCode,
      previousScore,
      currentScore,
      change,
      trend,
      previousMaturityTier: previous?.maturityTier ?? null,
      currentMaturityTier: current?.maturityTier ?? null,
    };
  });
}

export function classifyRecommendationChanges(
  baseline: TriggeredRecommendation[],
  comparison: TriggeredRecommendation[],
): RecommendationComparison {
  const baselineKeys = new Set(baseline.map((item) => item.dedupeKey));
  const comparisonKeys = new Set(comparison.map((item) => item.dedupeKey));
  const byDedupeKey = new Map<string, TriggeredRecommendation>();

  for (const item of [...baseline, ...comparison]) {
    byDedupeKey.set(item.dedupeKey, item);
  }

  const newRecommendations: TriggeredRecommendation[] = [];
  const resolvedRecommendations: TriggeredRecommendation[] = [];
  const stillOpenRecommendations: TriggeredRecommendation[] = [];
  const noLongerTriggeredRecommendations: TriggeredRecommendation[] = [];
  const criticalHighUnresolved: TriggeredRecommendation[] = [];

  for (const item of comparison) {
    if (!baselineKeys.has(item.dedupeKey)) {
      newRecommendations.push(item);
    }
  }

  for (const [dedupeKey, item] of byDedupeKey) {
    const inBaseline = baselineKeys.has(dedupeKey);
    const inComparison = comparisonKeys.has(dedupeKey);
    const isActive = ACTIVE_RECOMMENDATION_STATUSES.includes(item.status);

    if (inBaseline && item.status === "completed") {
      resolvedRecommendations.push(item);
    }

    if (inComparison && isActive) {
      stillOpenRecommendations.push(item);
      if (item.priority === "critical" || item.priority === "high") {
        criticalHighUnresolved.push(item);
      }
    }

    if (inBaseline && !inComparison && isActive) {
      noLongerTriggeredRecommendations.push(item);
    }
  }

  const sortByPriority = (items: TriggeredRecommendation[]) =>
    [...items].sort((left, right) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[left.priority] - order[right.priority];
    });

  return {
    newRecommendations: sortByPriority(newRecommendations),
    resolvedRecommendations: sortByPriority(resolvedRecommendations),
    stillOpenRecommendations: sortByPriority(stillOpenRecommendations),
    noLongerTriggeredRecommendations: sortByPriority(noLongerTriggeredRecommendations),
    criticalHighUnresolved: sortByPriority(criticalHighUnresolved),
  };
}

export function diffQuestionResponses(
  baseline: Array<{
    questionId: string;
    scoreEarned: number;
    question: { code: string; questionText: string; category: { name: string } };
    selectedAnswerOption: { answerText: string };
  }>,
  comparison: Array<{
    questionId: string;
    scoreEarned: number;
    question: { code: string; questionText: string; category: { name: string } };
    selectedAnswerOption: { answerText: string };
  }>,
): QuestionAnswerChange[] {
  const baselineByQuestion = new Map(baseline.map((row) => [row.questionId, row]));

  const changes: QuestionAnswerChange[] = [];

  for (const current of comparison) {
    const previous = baselineByQuestion.get(current.questionId);
    if (!previous) continue;

    const previousAnswer = previous.selectedAnswerOption.answerText;
    const currentAnswer = current.selectedAnswerOption.answerText;
    if (previousAnswer === currentAnswer && previous.scoreEarned === current.scoreEarned) {
      continue;
    }

    changes.push({
      questionId: current.questionId,
      questionCode: current.question.code,
      questionText: current.question.questionText,
      categoryName: current.question.category.name,
      previousAnswer,
      currentAnswer,
      previousScore: previous.scoreEarned,
      currentScore: current.scoreEarned,
      scoreImpact: current.scoreEarned - previous.scoreEarned,
    });
  }

  return changes.sort((left, right) => {
    const impactDiff = Math.abs(right.scoreImpact) - Math.abs(left.scoreImpact);
    if (impactDiff !== 0) return impactDiff;
    return left.questionCode.localeCompare(right.questionCode);
  });
}

export function buildComparisonExecutiveSummary(
  comparison: Pick<
    AssessmentComparison,
    "scoreChange" | "categoryComparisons" | "recommendations" | "previous" | "current"
  >,
): string {
  const { scoreChange, categoryComparisons, recommendations, previous, current } = comparison;

  const improved = categoryComparisons
    .filter((row) => row.change !== null && row.change > 0)
    .sort((a, b) => (b.change ?? 0) - (a.change ?? 0));
  const declined = categoryComparisons
    .filter((row) => row.change !== null && row.change < 0)
    .sort((a, b) => (a.change ?? 0) - (b.change ?? 0));

  const scoredRows = categoryComparisons.filter((row) => row.currentScore !== null);
  const weakest = [...scoredRows].sort(
    (a, b) => (a.currentScore ?? 0) - (b.currentScore ?? 0),
  )[0];

  const pointsPhrase =
    scoreChange > 0
      ? `improved its Technology Profile by ${scoreChange} points`
      : scoreChange < 0
        ? `declined by ${Math.abs(scoreChange)} points`
        : "held steady with no net StackScore change";

  const improvementPhrase =
    improved.length > 0
      ? `primarily through stronger ${improved
          .slice(0, 2)
          .map((row) => row.categoryName.toLowerCase())
          .join(" and ")}`
      : declined.length > 0
        ? `with setbacks in ${declined
            .slice(0, 2)
            .map((row) => row.categoryName.toLowerCase())
            .join(" and ")}`
        : "with consistent performance across categories";

  const opportunityPhrase = weakest
    ? `${weakest.categoryName} remains the greatest opportunity for improvement`
    : "continued assessment will clarify the next priorities";

  const recommendationPhrase =
    recommendations.criticalHighUnresolved.length > 0
      ? ` ${recommendations.criticalHighUnresolved.length} critical or high-priority recommendation${
          recommendations.criticalHighUnresolved.length === 1 ? "" : "s"
        } still require attention.`
      : recommendations.resolvedRecommendations.length > 0
        ? ` ${recommendations.resolvedRecommendations.length} prior recommendation${
            recommendations.resolvedRecommendations.length === 1 ? " was" : "s were"
          } resolved since the earlier assessment.`
        : "";

  const maturityPhrase =
    previous.maturityTier !== current.maturityTier
      ? ` Maturity moved from ${MATURITY_TIER_LABELS[previous.maturityTier]} to ${MATURITY_TIER_LABELS[current.maturityTier]}.`
      : "";

  return `Since ${previous.assessmentName}, this organization ${pointsPhrase}, ${improvementPhrase}. ${opportunityPhrase}.${recommendationPhrase}${maturityPhrase}`;
}
