/**
 * SS-UX-012 — Pure customer Projects DTO builders (no Prisma / I/O).
 * Reuses Project lifecycle statuses; does not invent tasks, milestones, or progress %.
 */

import type { Priority, ProjectStatus, RecommendationStatus } from "@/generated/prisma/client";
import {
  clientExplorePillarPath,
  clientProjectDetailPath,
  clientRecommendationDetailPath,
  clientRecommendationsPath,
  clientRoadmapPhasePath,
  clientWorkspaceProjectsPath,
  clientWorkspaceRoadmapPath,
} from "@/lib/clients/paths";
import { formatDisplayDate, PRIORITY_LABELS } from "@/lib/display";
import { PROJECT_STATUS_LABELS } from "@/lib/projects";
import { getPillarDisplayForCategoryCode } from "@/lib/technology-maturity/pillars";

/** Planned — committed but not yet in delivery. */
export const CUSTOMER_PLANNED_PROJECT_STATUSES: readonly ProjectStatus[] = [
  "proposed",
  "approved",
];

/** Active — scheduled or in progress. */
export const CUSTOMER_ACTIVE_PROJECT_STATUSES: readonly ProjectStatus[] = [
  "scheduled",
  "in_progress",
];

export type CustomerProjectViewFilter = "all" | "planned" | "active" | "completed";

export type CustomerProjectCardDto = {
  id: string;
  title: string;
  status: ProjectStatus;
  statusLabel: string;
  priority: Priority;
  priorityLabel: string;
  descriptionPreview: string | null;
  startDateLabel: string | null;
  targetCompletionDateLabel: string | null;
  pillarName: string | null;
  pillarHref: string | null;
  /** Always null until ProjectTask exists — never invent a percent. */
  progressPercent: number | null;
  href: string;
};

export type CustomerProjectsSummaryDto = {
  plannedCount: number;
  activeCount: number;
  completedCount: number;
  upcomingTargetDateCount: number;
};

export type CustomerProjectsExperienceDto = {
  clientId: string;
  companyName: string;
  summary: CustomerProjectsSummaryDto;
  view: CustomerProjectViewFilter;
  projects: CustomerProjectCardDto[];
  opportunitiesHref: string;
  roadmapHref: string;
};

export type CustomerProjectRecommendationDto = {
  id: string;
  title: string;
  status: RecommendationStatus;
  statusLabel: string;
  href: string;
};

export type CustomerProjectInitiativeDto = {
  id: string;
  title: string;
  phaseName: string;
  href: string;
};

export type CustomerProjectActivityDto = {
  id: string;
  title: string;
  description: string | null;
  occurredAtLabel: string;
  eventType: string;
};

export type CustomerProjectDetailDto = {
  clientId: string;
  companyName: string;
  id: string;
  title: string;
  status: ProjectStatus;
  statusLabel: string;
  priority: Priority;
  priorityLabel: string;
  description: string | null;
  expectedOutcome: string | null;
  startDateLabel: string | null;
  targetCompletionDateLabel: string | null;
  completedAtLabel: string | null;
  pillarName: string | null;
  pillarHref: string | null;
  progressPercent: number | null;
  recommendations: CustomerProjectRecommendationDto[];
  roadmapInitiatives: CustomerProjectInitiativeDto[];
  activity: CustomerProjectActivityDto[];
  completionReportHref: string | null;
  listHref: string;
  showTaskPlaceholder: boolean;
  showMilestonePlaceholder: boolean;
  showUpdatesPlaceholder: boolean;
};

export type CustomerProjectRowInput = {
  id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  priority: Priority;
  startDate: Date | string | null;
  targetCompletionDate: Date | string | null;
  completedAt: Date | string | null;
  categoryCode: string;
  categoryName: string;
  recommendation: {
    id: string;
    title: string;
    status: RecommendationStatus;
    businessImpact: string | null;
    templateCode: string | null;
  } | null;
};

export type CustomerProjectActivityInput = {
  id: string;
  title: string;
  description: string | null;
  occurredAt: Date | string;
  eventType: string;
  category: string;
  sourceRecordType: string | null;
  sourceRecordId: string | null;
};

export type CustomerProjectInitiativeInput = {
  id: string;
  title: string;
  phaseId: string;
  phaseName: string;
};

const CARD_DESCRIPTION_MAX = 160;

export function normalizeCustomerProjectViewFilter(
  value: string | null | undefined,
): CustomerProjectViewFilter {
  if (value === "planned" || value === "active" || value === "completed" || value === "all") {
    return value;
  }
  return "all";
}

export function isCustomerVisibleProjectStatus(status: ProjectStatus): boolean {
  return status !== "cancelled";
}

export function projectMatchesCustomerView(
  status: ProjectStatus,
  view: CustomerProjectViewFilter,
): boolean {
  if (!isCustomerVisibleProjectStatus(status)) return false;
  if (view === "all") return true;
  if (view === "planned") return CUSTOMER_PLANNED_PROJECT_STATUSES.includes(status);
  if (view === "active") return CUSTOMER_ACTIVE_PROJECT_STATUSES.includes(status);
  return status === "completed";
}

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateLabel(value: Date | string | null | undefined): string | null {
  const date = toDate(value);
  return date ? formatDisplayDate(date) : null;
}

function priorityLabel(priority: Priority): string {
  return PRIORITY_LABELS[priority] ?? priority;
}

function statusLabel(status: ProjectStatus): string {
  return PROJECT_STATUS_LABELS[status] ?? status;
}

function truncatePreview(text: string | null | undefined): string | null {
  const trimmed = text?.trim() ?? "";
  if (!trimmed) return null;
  if (trimmed.length <= CARD_DESCRIPTION_MAX) return trimmed;
  return `${trimmed.slice(0, CARD_DESCRIPTION_MAX - 1).trimEnd()}…`;
}

function pillarForCategory(clientId: string, categoryCode: string) {
  const display = getPillarDisplayForCategoryCode(categoryCode);
  if (!display) {
    return { pillarName: null as string | null, pillarHref: null as string | null };
  }

  return {
    pillarName: display.pillarName,
    pillarHref: clientExplorePillarPath(clientId, categoryCode),
  };
}

function countUpcomingTargetDates(
  rows: CustomerProjectRowInput[],
  now: Date,
): number {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  return rows.filter((row) => {
    if (!isCustomerVisibleProjectStatus(row.status)) return false;
    if (row.status === "completed") return false;
    const target = toDate(row.targetCompletionDate);
    if (!target) return false;
    return target.getTime() >= startOfToday.getTime();
  }).length;
}

export function buildCustomerProjectCard(
  clientId: string,
  row: CustomerProjectRowInput,
): CustomerProjectCardDto {
  const pillar = pillarForCategory(clientId, row.categoryCode);

  return {
    id: row.id,
    title: row.title,
    status: row.status,
    statusLabel: statusLabel(row.status),
    priority: row.priority,
    priorityLabel: priorityLabel(row.priority),
    descriptionPreview: truncatePreview(row.description),
    startDateLabel: dateLabel(row.startDate),
    targetCompletionDateLabel: dateLabel(row.targetCompletionDate),
    pillarName: pillar.pillarName ?? row.categoryName,
    pillarHref: pillar.pillarHref,
    progressPercent: null,
    href: clientProjectDetailPath(clientId, row.id),
  };
}

export function buildCustomerProjectsSummary(
  rows: CustomerProjectRowInput[],
  now: Date = new Date(),
): CustomerProjectsSummaryDto {
  const visible = rows.filter((row) => isCustomerVisibleProjectStatus(row.status));

  return {
    plannedCount: visible.filter((row) =>
      CUSTOMER_PLANNED_PROJECT_STATUSES.includes(row.status),
    ).length,
    activeCount: visible.filter((row) =>
      CUSTOMER_ACTIVE_PROJECT_STATUSES.includes(row.status),
    ).length,
    completedCount: visible.filter((row) => row.status === "completed").length,
    upcomingTargetDateCount: countUpcomingTargetDates(rows, now),
  };
}

export function buildCustomerProjectsExperience(input: {
  clientId: string;
  companyName: string;
  rows: CustomerProjectRowInput[];
  view?: CustomerProjectViewFilter;
  now?: Date;
}): CustomerProjectsExperienceDto {
  const view = input.view ?? "all";
  const summary = buildCustomerProjectsSummary(input.rows, input.now ?? new Date());
  const projects = input.rows
    .filter((row) => projectMatchesCustomerView(row.status, view))
    .map((row) => buildCustomerProjectCard(input.clientId, row));

  return {
    clientId: input.clientId,
    companyName: input.companyName,
    summary,
    view,
    projects,
    opportunitiesHref: clientRecommendationsPath(input.clientId),
    roadmapHref: clientWorkspaceRoadmapPath(input.clientId),
  };
}

export function buildCustomerProjectDetail(input: {
  clientId: string;
  companyName: string;
  row: CustomerProjectRowInput;
  recommendationVisible: boolean;
  initiatives: CustomerProjectInitiativeInput[];
  activity: CustomerProjectActivityInput[];
}): CustomerProjectDetailDto {
  const { row, clientId } = input;
  const pillar = pillarForCategory(clientId, row.categoryCode);
  const recommendations: CustomerProjectRecommendationDto[] = [];

  if (row.recommendation && input.recommendationVisible) {
    recommendations.push({
      id: row.recommendation.id,
      title: row.recommendation.title,
      status: row.recommendation.status,
      statusLabel: row.recommendation.status.replace(/_/g, " "),
      href: clientRecommendationDetailPath(clientId, row.recommendation.id),
    });
  }

  const expectedOutcome =
    input.recommendationVisible && row.recommendation?.businessImpact?.trim()
      ? row.recommendation.businessImpact.trim()
      : null;

  const activity = input.activity.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    occurredAtLabel: dateLabel(event.occurredAt) ?? "",
    eventType: event.eventType,
  }));

  return {
    clientId,
    companyName: input.companyName,
    id: row.id,
    title: row.title,
    status: row.status,
    statusLabel: statusLabel(row.status),
    priority: row.priority,
    priorityLabel: priorityLabel(row.priority),
    description: row.description?.trim() ? row.description.trim() : null,
    expectedOutcome,
    startDateLabel: dateLabel(row.startDate),
    targetCompletionDateLabel: dateLabel(row.targetCompletionDate),
    completedAtLabel: dateLabel(row.completedAt),
    pillarName: pillar.pillarName ?? row.categoryName,
    pillarHref: pillar.pillarHref,
    progressPercent: null,
    recommendations,
    roadmapInitiatives: input.initiatives.map((initiative) => ({
      id: initiative.id,
      title: initiative.title,
      phaseName: initiative.phaseName,
      href: clientRoadmapPhasePath(clientId, initiative.phaseId),
    })),
    activity,
    completionReportHref:
      row.status === "completed"
        ? `/clients/${clientId}/projects/${row.id}/completion-report`
        : null,
    listHref: clientWorkspaceProjectsPath(clientId),
    showTaskPlaceholder: true,
    showMilestonePlaceholder: true,
    showUpdatesPlaceholder: true,
  };
}
