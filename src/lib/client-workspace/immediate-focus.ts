import type { Priority, ProjectStatus, RecommendationStatus } from "@/generated/prisma/client";
import {
  clientProjectDetailPath,
  clientRecommendationDetailPath,
} from "@/lib/clients/paths";
import { countImmediateFocusItems } from "@/lib/portfolio/immediate-focus";
import { PORTFOLIO_OPEN_RECOMMENDATION_STATUSES } from "@/lib/portfolio/constants";
import { ACTIVE_PROJECT_STATUSES, OPEN_PROJECT_STATUSES } from "@/lib/projects";
import { RECOMMENDATION_STATUS_LABELS } from "@/lib/assessments/results-summary";
import { formatProjectStatus } from "@/lib/projects";
import { sortByRecommendationPriority } from "@/lib/recommendations/display";
import { getPillarDisplayForCategoryCode } from "@/lib/technology-maturity/pillars";
import { conciseFocusTitle } from "@/lib/client-workspace/display";
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
  sourceLabel: string;
  href: string;
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
  // Blocked when a linked project is still awaiting approval (DOC-160 readiness).
  if (!recommendation.project) return "Ready";
  if (recommendation.project.status === "proposed") return "Blocked";
  if (ACTIVE_PROJECT_STATUSES.includes(recommendation.project.status)) return "Ready";
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

/**
 * Ranks top workspace focus items for a single client (DOC-160 Client Workspace).
 * Merges open projects and actionable recommendations, dedupes project-linked recs,
 * and returns up to five items by priority, status, and estimated impact.
 */
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

  const recommendationByProjectId = new Map(
    openRecommendations
      .filter((recommendation) => recommendation.project?.id)
      .map((recommendation) => [recommendation.project!.id, recommendation] as const),
  );

  const projectCandidates: Array<ImmediateFocusItem & { sortScore: number }> = [];

  for (const project of openProjects) {
    const isReady = ACTIVE_PROJECT_STATUSES.includes(project.status);
    const isHighValue =
      isReady || HIGH_VALUE_PRIORITIES.includes(project.priority) || project.status === "proposed";

    if (!isHighValue) continue;

    const linkedRecommendation = recommendationByProjectId.get(project.id);

    // Prefer specific recommendation/finding text over a generic project or pillar title.
    const displayTitle =
      linkedRecommendation?.title ?? project.recommendationTitle ?? project.title;

    projectCandidates.push({
      id: project.id,
      kind: "project",
      title: conciseFocusTitle(displayTitle),
      pillarName: linkedRecommendation
        ? pillarNameForCategory(
            linkedRecommendation.categoryCode,
            linkedRecommendation.categoryName,
          )
        : "Technology Improvement",
      priority: project.priority,
      estimatedImpactPoints: project.estimatedImpactPoints,
      statusLabel: formatProjectStatus(project.status),
      readinessLabel: projectReadinessLabel(project.status),
      sourceLabel: linkedRecommendation ? "From recommendation" : "Project",
      href: clientProjectDetailPath(input.clientId, project.id),
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
      title: conciseFocusTitle(recommendation.title),
      pillarName: pillarNameForCategory(recommendation.categoryCode, recommendation.categoryName),
      priority: recommendation.priority,
      estimatedImpactPoints: recommendation.estimatedImpactPoints,
      statusLabel: RECOMMENDATION_STATUS_LABELS[recommendation.status],
      readinessLabel: recommendationReadinessLabel(recommendation),
      sourceLabel: recommendation.project ? "From recommendation" : "Recommendation",
      href: recommendation.project
        ? clientProjectDetailPath(input.clientId, recommendation.project.id)
        : clientRecommendationDetailPath(input.clientId, recommendation.id),
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