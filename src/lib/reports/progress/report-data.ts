import { SCORE_HISTORY_CATEGORY_FIELDS } from "@/lib/analytics/categories";
import { formatDisplayDate } from "@/lib/display";
import { buildProgressExecutiveSummary } from "@/lib/reports/progress/executive-summary";
import type {
  ProgressCategoryChange,
  ProgressProjectSummary,
  ProgressReportData,
} from "@/lib/reports/progress/types";

type ScoreHistoryEntry = {
  recordedDate: Date;
  overallScore: unknown;
} & Record<string, unknown>;

function roundScore(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return Math.round(Number(value));
}

function buildCategoryChanges(
  baseline: ScoreHistoryEntry | null,
  current: ScoreHistoryEntry | null,
): ProgressCategoryChange[] {
  if (!baseline || !current) return [];

  return SCORE_HISTORY_CATEGORY_FIELDS.map((category) => {
    const previousScore = roundScore(baseline[category.field]);
    const currentScore = roundScore(current[category.field]);
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

function buildNextSteps(input: {
  openRecommendations: Array<{ title: string; businessImpact: string }>;
  activeProjectCount: number;
}): string[] {
  const steps: string[] = [];

  if (input.activeProjectCount > 0) {
    steps.push("Continue delivery on active improvement projects");
  }

  for (const recommendation of input.openRecommendations.slice(0, 3)) {
    steps.push(recommendation.title);
  }

  if (steps.length === 0) {
    steps.push("Schedule the next reassessment to validate sustained improvement");
  }

  return steps.slice(0, 5);
}

export type BuildProgressReportInput = {
  clientId: string;
  clientName: string;
  generatedAt: Date;
  currentStackScore: number | null;
  currentMaturityLabel: string | null;
  lastAssessment: {
    assessmentName: string;
    completedAt: Date;
    overallScore: unknown;
  } | null;
  scoreHistory: ScoreHistoryEntry[];
  completedProjects: Array<{
    id: string;
    title: string;
    completedAt: Date | null;
    estimatedImpactPoints: number | null;
    actualImpactPoints: number | null;
    recommendation: { title: string } | null;
  }>;
  activeProjectCount: number;
  openRecommendations: Array<{ title: string; businessImpact: string }>;
  openRecommendationsCount: number;
  journeyPhaseLabel: string;
};

export function buildProgressReportData(input: BuildProgressReportInput): ProgressReportData {
  const baselineEntry = input.lastAssessment
    ? [...input.scoreHistory]
        .filter((row) => row.recordedDate.getTime() <= input.lastAssessment!.completedAt.getTime())
        .at(-1) ?? null
    : input.scoreHistory.at(-2) ?? null;
  const currentEntry = input.scoreHistory.at(-1) ?? null;

  const previousStackScore = baselineEntry
    ? roundScore(baselineEntry.overallScore)
    : input.lastAssessment
      ? roundScore(input.lastAssessment.overallScore)
      : null;
  const currentStackScore =
    input.currentStackScore ??
    (currentEntry ? roundScore(currentEntry.overallScore) : null);
  const scoreChange =
    previousStackScore !== null && currentStackScore !== null
      ? currentStackScore - previousStackScore
      : null;

  const reportPeriodLabel = input.lastAssessment
    ? `Since ${formatDisplayDate(input.lastAssessment.completedAt)}`
    : "Since last assessment";

  const completedProjectsSinceAssessment: ProgressProjectSummary[] = input.completedProjects
    .filter((project) => {
      if (!project.completedAt || !input.lastAssessment) return true;
      return project.completedAt.getTime() >= input.lastAssessment.completedAt.getTime();
    })
    .map((project) => ({
      id: project.id,
      title: project.title,
      completedAt: project.completedAt?.toISOString() ?? null,
      estimatedImpactPoints: project.estimatedImpactPoints,
      actualImpactPoints: project.actualImpactPoints,
      recommendationTitle: project.recommendation?.title ?? null,
    }));

  const categoryChanges = buildCategoryChanges(baselineEntry, currentEntry);
  const nextSteps = buildNextSteps({
    openRecommendations: input.openRecommendations,
    activeProjectCount: input.activeProjectCount,
  });

  const draft: ProgressReportData = {
    clientId: input.clientId,
    clientName: input.clientName,
    generatedAt: input.generatedAt.toISOString(),
    generatedDateLabel: formatDisplayDate(input.generatedAt),
    reportPeriodLabel,
    executiveSummary: "",
    currentStackScore,
    currentMaturityLabel: input.currentMaturityLabel,
    previousStackScore,
    scoreChange,
    lastAssessedAt: input.lastAssessment?.completedAt.toISOString() ?? null,
    lastAssessmentName: input.lastAssessment?.assessmentName ?? null,
    categoryChanges,
    completedProjectsSinceAssessment,
    activeProjectCount: input.activeProjectCount,
    openRecommendationsCount: input.openRecommendationsCount,
    journeyPhaseLabel: input.journeyPhaseLabel,
    nextSteps,
  };

  return {
    ...draft,
    executiveSummary: buildProgressExecutiveSummary(draft),
  };
}
