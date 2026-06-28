import { SCORE_HISTORY_CATEGORY_FIELDS } from "@/lib/analytics/categories";
import { formatDisplayDate } from "@/lib/display";
import {
  buildCompletionBusinessImpactBullets,
  buildCompletionExecutiveSummary,
  DEFAULT_WARRANTY_NOTES,
} from "@/lib/reports/completion/executive-summary";
import type { CompletionReportData } from "@/lib/reports/completion/types";
import type { ProgressCategoryChange } from "@/lib/reports/progress/types";

type ScoreHistoryEntry = {
  recordedDate: Date;
  overallScore: unknown;
} & Record<string, unknown>;

function roundScore(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return Math.round(Number(value));
}

function scoreAtOrBefore(history: ScoreHistoryEntry[], date: Date): ScoreHistoryEntry | null {
  return (
    [...history]
      .filter((row) => row.recordedDate.getTime() <= date.getTime())
      .at(-1) ?? null
  );
}

function buildCategoryChanges(
  before: ScoreHistoryEntry | null,
  after: ScoreHistoryEntry | null,
): ProgressCategoryChange[] {
  if (!before || !after) return [];

  return SCORE_HISTORY_CATEGORY_FIELDS.map((category) => {
    const previousScore = roundScore(before[category.field]);
    const currentScore = roundScore(after[category.field]);
    const change =
      previousScore !== null && currentScore !== null ? currentScore - previousScore : null;

    return {
      categoryName: category.label,
      previousScore,
      currentScore,
      change,
    };
  }).filter((row) => row.previousScore !== null || row.currentScore !== null);
}

export type BuildCompletionReportInput = {
  clientId: string;
  clientName: string;
  project: {
    id: string;
    title: string;
    completedAt: Date;
    estimatedImpactPoints: number | null;
    actualImpactPoints: number | null;
    priority: CompletionReportData["priority"];
    createdAt: Date;
    category: { name: string };
    recommendation: {
      title: string;
      businessImpact: string;
    } | null;
  };
  currentStackScore: number | null;
  scoreHistory: ScoreHistoryEntry[];
  openRecommendations: Array<{ title: string }>;
  journeyPhaseLabel: string;
};

export function buildCompletionReportData(input: BuildCompletionReportInput): CompletionReportData {
  const baselineDate = input.project.createdAt;
  const beforeEntry = scoreAtOrBefore(input.scoreHistory, baselineDate);
  const afterEntry = input.scoreHistory.at(-1) ?? null;

  const scoreBefore = beforeEntry
    ? roundScore(beforeEntry.overallScore)
    : null;
  const scoreAfter =
    input.currentStackScore ??
    (afterEntry ? roundScore(afterEntry.overallScore) : null);
  const scoreChange =
    scoreBefore !== null && scoreAfter !== null ? scoreAfter - scoreBefore : null;

  const categoryChanges = buildCategoryChanges(beforeEntry, afterEntry);

  const nextSteps =
    input.openRecommendations.length > 0
      ? input.openRecommendations.slice(0, 5).map((row) => row.title)
      : ["Schedule reassessment to validate sustained improvement", "Review remaining roadmap priorities"];

  const draft: CompletionReportData = {
    clientId: input.clientId,
    clientName: input.clientName,
    projectId: input.project.id,
    projectTitle: input.project.title,
    completedAt: input.project.completedAt.toISOString(),
    generatedDateLabel: formatDisplayDate(input.project.completedAt),
    executiveSummary: "",
    businessImpactBullets: [],
    recommendationTitle: input.project.recommendation?.title ?? input.project.title,
    recommendationBusinessImpact: input.project.recommendation?.businessImpact ?? "",
    categoryName: input.project.category.name,
    priority: input.project.priority,
    estimatedImpactPoints: input.project.estimatedImpactPoints,
    actualImpactPoints: input.project.actualImpactPoints,
    scoreBefore,
    scoreAfter,
    scoreChange,
    categoryChanges,
    warrantyNotes: DEFAULT_WARRANTY_NOTES,
    nextSteps,
    journeyPhaseLabel: input.journeyPhaseLabel,
  };

  return {
    ...draft,
    executiveSummary: buildCompletionExecutiveSummary(draft),
    businessImpactBullets: buildCompletionBusinessImpactBullets(draft),
  };
}
