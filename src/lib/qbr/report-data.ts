import { SCORE_HISTORY_CATEGORY_FIELDS } from "@/lib/analytics/categories";
import { formatDisplayDate } from "@/lib/display";
import { buildQbrExecutiveSummary } from "@/lib/qbr/executive-summary";
import { formatReviewPeriodLabel, isWithinReviewPeriod } from "@/lib/qbr/periods";
import type {
  QbrCategoryImprovement,
  QbrProjectSummary,
  QbrRecommendationSummary,
  QbrReportData,
  QbrRoadmapPhaseSummary,
} from "@/lib/qbr/types";
import type { JourneyTimelineEvent } from "@/lib/technology-profile/timeline";
import type { TipRoadmapPhaseView } from "@/lib/technology-improvement-plan/types";

type ScoreHistoryEntry = {
  recordedDate: Date;
  overallScore: unknown;
} & Record<string, unknown>;

type BuildQbrReportInput = {
  qbr: {
    id: string;
    clientId: string;
    title: string;
    reviewPeriodStart: Date;
    reviewPeriodEnd: Date;
    generatedAt: Date | null;
    executiveSummary: string | null;
  };
  clientName: string;
  currentStackScore: number | null;
  currentMaturityLabel: string | null;
  scoreHistory: ScoreHistoryEntry[];
  journeyEvents: JourneyTimelineEvent[];
  completedProjects: Array<{
    id: string;
    title: string;
    description: string | null;
    completedAt: Date | null;
    actualImpactPoints: number | null;
    estimatedImpactPoints: number | null;
  }>;
  resolvedRecommendations: Array<{
    id: string;
    title: string;
    priority: QbrRecommendationSummary["priority"];
    status: QbrRecommendationSummary["status"];
    categoryName: string;
    businessImpact: string;
    completedAt: Date | null;
    updatedAt: Date;
  }>;
  openRecommendations: Array<{
    id: string;
    title: string;
    priority: QbrRecommendationSummary["priority"];
    status: QbrRecommendationSummary["status"];
    categoryName: string;
    businessImpact: string;
  }>;
  assessmentsCompletedInPeriod: number;
  roadmapPhases: TipRoadmapPhaseView[];
  businessGoalLabel: string | null;
  technologyVision: string | null;
};

function roundScore(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return Math.round(Number(value));
}

function scoreAtOrBefore(history: ScoreHistoryEntry[], date: Date): number | null {
  const entry = [...history]
    .filter((row) => row.recordedDate.getTime() <= date.getTime())
    .at(-1);
  return entry ? roundScore(entry.overallScore) : null;
}

function buildCategoryImprovements(
  history: ScoreHistoryEntry[],
  periodStart: Date,
  periodEnd: Date,
): QbrCategoryImprovement[] {
  const beforePeriod = [...history]
    .filter((row) => row.recordedDate.getTime() < periodStart.getTime())
    .at(-1);
  const inPeriod = history.filter((row) => isWithinReviewPeriod(row.recordedDate, {
    start: periodStart,
    end: periodEnd,
  }));
  const startEntry = beforePeriod ?? inPeriod[0];
  const endEntry = inPeriod.at(-1) ?? beforePeriod;

  if (!startEntry || !endEntry) {
    return [];
  }

  return SCORE_HISTORY_CATEGORY_FIELDS.map((category) => {
    const previousScore = roundScore(startEntry[category.field]);
    const currentScore = roundScore(endEntry[category.field]);
    const change =
      previousScore !== null && currentScore !== null
        ? currentScore - previousScore
        : null;

    return {
      categoryName: category.label,
      previousScore,
      currentScore,
      change,
    };
  }).filter((row) => row.previousScore !== null || row.currentScore !== null);
}

function mapProject(project: BuildQbrReportInput["completedProjects"][number]): QbrProjectSummary {
  return {
    id: project.id,
    title: project.title,
    completedAt: project.completedAt!.toISOString(),
    impactPoints: project.actualImpactPoints ?? project.estimatedImpactPoints,
    description: project.description,
  };
}

function mapResolvedRecommendation(
  recommendation: BuildQbrReportInput["resolvedRecommendations"][number],
): QbrRecommendationSummary {
  return {
    id: recommendation.id,
    title: recommendation.title,
    priority: recommendation.priority,
    status: recommendation.status,
    categoryName: recommendation.categoryName,
    resolvedAt: (recommendation.completedAt ?? recommendation.updatedAt).toISOString(),
    businessImpact: recommendation.businessImpact,
  };
}

function mapOpenRecommendation(
  recommendation: BuildQbrReportInput["openRecommendations"][number],
): QbrRecommendationSummary {
  return {
    id: recommendation.id,
    title: recommendation.title,
    priority: recommendation.priority,
    status: recommendation.status,
    categoryName: recommendation.categoryName,
    resolvedAt: null,
    businessImpact: recommendation.businessImpact,
  };
}

const ROADMAP_TIMEFRAMES = ["Near term", "Mid term", "Long term"];

function buildRoadmapPhases(phases: TipRoadmapPhaseView[]): QbrRoadmapPhaseSummary[] {
  return phases.map((phase, index) => ({
    phaseName: phase.label,
    timeframe: ROADMAP_TIMEFRAMES[index] ?? `Phase ${index + 1}`,
    initiativeCount: phase.recommendations.length,
    summary:
      phase.recommendations
        .slice(0, 3)
        .map((item) => item.title)
        .join("; ") ||
      `${phase.recommendations.length} planned initiative${
        phase.recommendations.length === 1 ? "" : "s"
      }`,
  }));
}

function buildBusinessGoalProgress(goalLabel: string | null, scoreChange: number | null): string {
  if (!goalLabel) {
    return "Document the primary business goal in the Business Profile to align future reviews with executive priorities.";
  }
  if (scoreChange !== null && scoreChange > 0) {
    return `Progress this quarter supports "${goalLabel}" through measurable Technology Profile improvement.`;
  }
  if (scoreChange !== null && scoreChange < 0) {
    return `"${goalLabel}" remains the guiding priority; renewed focus is recommended next quarter.`;
  }
  return `"${goalLabel}" continues to guide technology planning and roadmap prioritization.`;
}

function buildVisionProgress(vision: string | null, maturityLabel: string | null): string {
  if (!vision) {
    return "Capture the technology vision in the Business Profile to track long-term alignment in future reviews.";
  }
  const maturityPhrase = maturityLabel ? ` Current maturity: ${maturityLabel}.` : "";
  return `${vision}${maturityPhrase}`;
}

function buildNextQuarterPriorities(
  openRecommendations: QbrRecommendationSummary[],
  roadmapPhases: QbrRoadmapPhaseSummary[],
): string[] {
  const priorities = openRecommendations.slice(0, 5).map((item) => item.title);
  const firstPhase = roadmapPhases[0];
  if (firstPhase && firstPhase.summary) {
    priorities.push(`Advance ${firstPhase.phaseName}: ${firstPhase.summary}`);
  }
  return [...new Set(priorities)].slice(0, 6);
}

export function buildQbrReportData(input: BuildQbrReportInput): QbrReportData {
  const { qbr, clientName } = input;
  const scoreAtPeriodStart = scoreAtOrBefore(input.scoreHistory, qbr.reviewPeriodStart);
  const scoreAtPeriodEnd =
    input.currentStackScore ??
    scoreAtOrBefore(input.scoreHistory, qbr.reviewPeriodEnd) ??
    scoreAtPeriodStart;
  const scoreChange =
    scoreAtPeriodStart !== null && scoreAtPeriodEnd !== null
      ? scoreAtPeriodEnd - scoreAtPeriodStart
      : null;

  const periodProjects = input.completedProjects
    .filter(
      (project) =>
        project.completedAt &&
        isWithinReviewPeriod(project.completedAt, {
          start: qbr.reviewPeriodStart,
          end: qbr.reviewPeriodEnd,
        }),
    )
    .map(mapProject);

  const periodResolved = input.resolvedRecommendations
    .filter((recommendation) =>
      isWithinReviewPeriod(recommendation.completedAt ?? recommendation.updatedAt, {
        start: qbr.reviewPeriodStart,
        end: qbr.reviewPeriodEnd,
      }),
    )
    .map(mapResolvedRecommendation);

  const remainingOpportunities = input.openRecommendations.map(mapOpenRecommendation);
  const categoryImprovements = buildCategoryImprovements(
    input.scoreHistory,
    qbr.reviewPeriodStart,
    qbr.reviewPeriodEnd,
  );
  const roadmapPhases = buildRoadmapPhases(input.roadmapPhases);
  const journeyEvents = input.journeyEvents.filter((event) =>
    isWithinReviewPeriod(new Date(event.occurredAt), {
      start: qbr.reviewPeriodStart,
      end: qbr.reviewPeriodEnd,
    }),
  );

  const generatedDateLabel = qbr.generatedAt
    ? formatDisplayDate(qbr.generatedAt)
    : formatDisplayDate(new Date());

  const draft: QbrReportData = {
    id: qbr.id,
    clientId: qbr.clientId,
    clientName,
    title: qbr.title,
    reviewPeriodLabel: formatReviewPeriodLabel(qbr.reviewPeriodStart, qbr.reviewPeriodEnd),
    reviewPeriodStart: qbr.reviewPeriodStart.toISOString(),
    reviewPeriodEnd: qbr.reviewPeriodEnd.toISOString(),
    generatedAt: qbr.generatedAt?.toISOString() ?? null,
    generatedDateLabel,
    executiveSummary: qbr.executiveSummary ?? "",
    currentStackScore: input.currentStackScore,
    currentMaturityLabel: input.currentMaturityLabel,
    scoreAtPeriodStart,
    scoreAtPeriodEnd,
    scoreChange,
    assessmentsCompletedInPeriod: input.assessmentsCompletedInPeriod,
    projectsCompletedInPeriod: periodProjects.length,
    recommendationsResolvedInPeriod: periodResolved.length,
    journeyEvents,
    completedProjects: periodProjects,
    categoryImprovements,
    resolvedRecommendations: periodResolved,
    remainingOpportunities,
    roadmapPhases,
    businessGoalLabel: input.businessGoalLabel,
    businessGoalProgress: buildBusinessGoalProgress(input.businessGoalLabel, scoreChange),
    technologyVision: input.technologyVision,
    visionProgress: buildVisionProgress(input.technologyVision, input.currentMaturityLabel),
    nextQuarterPriorities: [],
  };

  draft.executiveSummary =
    qbr.executiveSummary ?? buildQbrExecutiveSummary(draft);
  draft.nextQuarterPriorities = buildNextQuarterPriorities(
    remainingOpportunities,
    roadmapPhases,
  );

  return draft;
}
