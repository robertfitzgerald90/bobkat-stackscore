import type { Priority, ProjectStatus, RecommendationStatus } from "@/generated/prisma/client";
import { clientProjectsPath, clientRecommendationsPath } from "@/lib/clients/paths";
import { countImmediateFocusItems } from "@/lib/portfolio/immediate-focus";
import { PORTFOLIO_OPEN_RECOMMENDATION_STATUSES } from "@/lib/portfolio/constants";
import { ACTIVE_PROJECT_STATUSES, OPEN_PROJECT_STATUSES } from "@/lib/projects";
import { RECOMMENDATION_STATUS_LABELS } from "@/lib/assessments/results-summary";
import { formatProjectStatus } from "@/lib/projects";
import { sortByRecommendationPriority } from "@/lib/recommendations/display";
import { getPillarDisplayForCategoryCode } from "@/lib/technology-maturity/pillars";
import type {
  ProfileProjectSummary,
  ProfileRecommendationSummary,
} from "@/lib/technology-profile/types";

export type ImmediateFocusItemKind = "project" | "recommendation";

export type ImmediateFocusItem = {
  id: string;
  kind: ImmediateFocusItemKind;
  title: string;
  pillarName: string;
  priority: Priority;
  estimatedImpactPoints: number | null;
  statusLabel: string;
  readinessLabel: string;
  href: string;
  relatedLabel: string | null;
};

export type ClientWorkspaceKpis = {
  stackScore: number | null;
  projectedScore: number | null;
  openProjectsCount: number;
  criticalRecommendationsCount: number;
  immediateFocusCount: number;
};

export type ClientWorkspaceSnapshot = {
  kpis: ClientWorkspaceKpis;
  items: ImmediateFocusItem[];
};

const MAX_FOCUS_ITEMS = 5;
const HIGH_VALUE_PRIORITIES: Priority[] = ["critical", "high"];

function pillarNameForCategory(categoryCode: string, categoryName: string): string {
  return getPillarDisplayForCategoryCode(categoryCode)?.pillarName ?? categoryName;
}

function projectReadinessLabel(status: ProjectStatus): string {
  if (ACTIVE_PROJECT_STATUSES.includes(status)) return "Ready";
  if (status === "proposed") return "Awaiting approval";
  return formatProjectStatus(status);
}

function recommendationReadinessLabel(
  recommendation: ProfileRecommendationSummary,
): string {
  if (!recommendation.project) return "Ready to start";
  if (recommendation.project.status === "proposed") return "Blocked — project proposed";
  if (ACTIVE_PROJECT_STATUSES.includes(recommendation.project.status)) return "In delivery";
  return formatProjectStatus(recommendation.project.status);
}

function isOpenRecommendation(status: RecommendationStatus): boolean {
  return PORTFOLIO_OPEN_RECOMMENDATION_STATUSES.includes(status);
}

function projectSortWeight(status: ProjectStatus): number {
  if (status === "in_progress") return 4;
  if (status === "scheduled") return 3;
  if (status === "approved") return 2;
  if (status === "proposed") return 1;
  return 0;
}

function priorityWeight(priority: Priority): number {
  const order: Priority[] = ["critical", "high", "medium", "low"];
  return order.length - order.indexOf(priority);
}

export function buildClientWorkspaceSnapshot(input: {
  clientId: string;
  stackScore: number | null;
  projectedScore: number | null;
  openRecommendations: ProfileRecommendationSummary[];
  activeProjects: ProfileProjectSummary[];
  draftAssessmentId?: string | null;
  nextRecommendedAssessmentAt?: string | null;
  now?: Date;
}): ClientWorkspaceSnapshot {
  const now = input.now ?? new Date();
  const openRecommendations = input.openRecommendations.filter((recommendation) =>
    isOpenRecommendation(recommendation.status),
  );
  const openProjects = input.activeProjects.filter((project) =>
    OPEN_PROJECT_STATUSES.includes(project.status),
  );

  const criticalRecommendationsCount = openRecommendations.filter(
    (recommendation) => recommendation.priority === "critical",
  ).length;

  const isReassessmentOverdue =
    input.nextRecommendedAssessmentAt !== null &&
    input.nextRecommendedAssessmentAt !== undefined &&
    new Date(input.nextRecommendedAssessmentAt).getTime() <= now.getTime();

  const immediateFocusCount = countImmediateFocusItems({
    recommendations: openRecommendations,
    hasDraftAssessment: Boolean(input.draftAssessmentId),
    isReassessmentOverdue,
  });

  const projectIdsFromRecommendations = new Set(
    openRecommendations
      .map((recommendation) => recommendation.project?.id)
      .filter((id): id is string => Boolean(id)),
  );

  const projectCandidates: Array<ImmediateFocusItem & { sortScore: number }> = [];

  for (const project of openProjects) {
    const isReady = ACTIVE_PROJECT_STATUSES.includes(project.status);
    const isHighValue =
      isReady || HIGH_VALUE_PRIORITIES.includes(project.priority) || project.status === "proposed";

    if (!isHighValue) continue;

    projectCandidates.push({
      id: project.id,
      kind: "project",
      title: project.title,
      pillarName: project.recommendationTitle ?? "Technology Improvement",
      priority: project.priority,
      estimatedImpactPoints: project.estimatedImpactPoints,
      statusLabel: formatProjectStatus(project.status),
      readinessLabel: projectReadinessLabel(project.status),
      href: `${clientProjectsPath(input.clientId)}&selected=${project.id}`,
      relatedLabel: project.recommendationTitle ? "From recommendation" : null,
      sortScore:
        priorityWeight(project.priority) * 100 +
        projectSortWeight(project.status) * 10 +
        (project.estimatedImpactPoints ?? 0),
    });
  }

  const recommendationCandidates: Array<ImmediateFocusItem & { sortScore: number }> = [];

  for (const recommendation of sortByRecommendationPriority(openRecommendations)) {
    if (recommendation.project && projectIdsFromRecommendations.has(recommendation.project.id)) {
      if (ACTIVE_PROJECT_STATUSES.includes(recommendation.project.status)) {
        continue;
      }
    }

    const isActionable =
      !recommendation.project ||
      recommendation.project.status === "proposed" ||
      HIGH_VALUE_PRIORITIES.includes(recommendation.priority);

    if (!isActionable) continue;

    if (
      !HIGH_VALUE_PRIORITIES.includes(recommendation.priority) &&
      recommendation.project?.status !== "proposed"
    ) {
      continue;
    }

    recommendationCandidates.push({
      id: recommendation.id,
      kind: "recommendation",
      title: recommendation.title,
      pillarName: pillarNameForCategory(recommendation.categoryCode, recommendation.categoryName),
      priority: recommendation.priority,
      estimatedImpactPoints: recommendation.estimatedImpactPoints,
      statusLabel: RECOMMENDATION_STATUS_LABELS[recommendation.status],
      readinessLabel: recommendationReadinessLabel(recommendation),
      href: clientRecommendationsPath(input.clientId),
      relatedLabel: recommendation.project
        ? `Project: ${recommendation.project.title}`
        : "Recommendation",
      sortScore:
        priorityWeight(recommendation.priority) * 100 +
        (recommendation.estimatedImpactPoints ?? 0) +
        (recommendation.project ? 0 : 5),
    });
  }

  const ranked = [...projectCandidates, ...recommendationCandidates]
    .sort((left, right) => right.sortScore - left.sortScore)
    .slice(0, MAX_FOCUS_ITEMS);

  const items = ranked.map(({ sortScore: _sortScore, ...item }) => item);

  return {
    kpis: {
      stackScore: input.stackScore,
      projectedScore: input.projectedScore,
      openProjectsCount: openProjects.length,
      criticalRecommendationsCount,
      immediateFocusCount,
    },
    items,
  };
}