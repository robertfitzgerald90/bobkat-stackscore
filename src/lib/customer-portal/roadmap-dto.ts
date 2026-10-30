/**
 * SS-UX-007 — Pure customer roadmap experience DTO builders (no Prisma).
 * Reuses approved dashboard metrics; does not invent phases, progress, or projections.
 */

import type { ClientRoadmapStatus, RecommendationStatus } from "@/generated/prisma/client";
import {
  CUSTOMER_TERM_ROADMAP_PROGRESS,
  CUSTOMER_TERM_STACKSCORE,
  customerRoadmapProgressFootnote,
} from "@/lib/assessments/customer-reporting";
import type { ClientRoadmapDashboard, RoadmapInitiativeView, RoadmapPhaseView } from "@/lib/client-roadmap/types";
import {
  clientExplorePillarPath,
  clientProjectsPath,
  clientRecommendationDetailPath,
  clientRecommendationsPath,
  clientRoadmapPhasePath,
  clientWorkspaceRoadmapPath,
} from "@/lib/clients/paths";
import { conciseFocusTitle } from "@/lib/client-workspace";
import { PRIORITY_LABELS } from "@/lib/display";
import { getPillarDisplayForCategoryCode } from "@/lib/technology-maturity/pillars";
import type { Priority } from "@/generated/prisma/client";

export type CustomerRoadmapProjectSummary = {
  id: string;
  title: string;
  statusLabel: string;
  priorityLabel: string;
  recommendationTitle: string | null;
  href: string;
};

export type CustomerRoadmapInitiativeDto = {
  id: string;
  title: string;
  priority: string;
  priorityLabel: string;
  status: RecommendationStatus;
  statusLabel: string;
  pillarName: string | null;
  pillarHref: string | null;
  recommendationHref: string;
  implementationNotes: string | null;
  businessImpact: string | null;
  phaseId: string;
  phaseName: string;
};

export type CustomerRoadmapPhaseDto = {
  id: string;
  name: string;
  subtitle: string;
  purpose: string | null;
  timeline: string | null;
  status: string;
  statusLabel: string;
  initiativeCount: number;
  completedInitiativeCount: number;
  isCurrent: boolean;
  href: string;
};

export type CustomerRoadmapSummaryDto = {
  officialStackScore: number;
  stackScoreLabel: typeof CUSTOMER_TERM_STACKSCORE;
  progressPercent: number;
  progressLabel: typeof CUSTOMER_TERM_ROADMAP_PROGRESS;
  currentPhaseName: string | null;
  initiativesTotal: number;
  initiativesCompleted: number;
  initiativesRemaining: number;
  footnote: string;
};

export type CustomerRoadmapNextAction = {
  id: string;
  label: string;
  description: string;
  href: string;
  external?: boolean;
};

export type CustomerRoadmapExperienceDto = {
  clientId: string;
  title: string;
  status: ClientRoadmapStatus;
  isDraft: boolean;
  hasRoadmap: true;
  summary: CustomerRoadmapSummaryDto;
  phases: CustomerRoadmapPhaseDto[];
  initiatives: CustomerRoadmapInitiativeDto[];
  projects: CustomerRoadmapProjectSummary[];
  projectsHref: string;
  opportunitiesHref: string;
  nextActions: CustomerRoadmapNextAction[];
};

function priorityLabel(priority: string): string {
  if (priority in PRIORITY_LABELS) {
    return PRIORITY_LABELS[priority as Priority];
  }
  return priority;
}

function resolveCurrentPhaseId(dashboard: ClientRoadmapDashboard): string | null {
  const byName = dashboard.metrics.currentPhaseName;
  if (byName) {
    const match = dashboard.phases.find((phase) => phase.name === byName);
    if (match) return match.id;
  }
  const terminal = new Set(["completed", "deferred", "cancelled"]);
  const current = [...dashboard.phases]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .find((phase) => !terminal.has(phase.status));
  return current?.id ?? null;
}

function initiativeNotes(initiative: RoadmapInitiativeView): string | null {
  const outcome = initiative.businessOutcomeDescription?.trim();
  if (outcome) return outcome;
  return null;
}

function buildInitiativeDto(
  clientId: string,
  phase: RoadmapPhaseView,
  initiative: RoadmapInitiativeView,
): CustomerRoadmapInitiativeDto {
  const pillar = getPillarDisplayForCategoryCode(initiative.categoryCode);
  return {
    id: initiative.id,
    title: conciseFocusTitle(initiative.title),
    priority: initiative.priority,
    priorityLabel: priorityLabel(initiative.priority),
    status: initiative.status,
    statusLabel: initiative.statusLabel,
    pillarName: pillar?.pillarName ?? initiative.categoryName ?? null,
    pillarHref: initiative.categoryCode
      ? clientExplorePillarPath(clientId, initiative.categoryCode)
      : null,
    recommendationHref: clientRecommendationDetailPath(clientId, initiative.recommendationId, {
      pillarCode: initiative.categoryCode,
    }),
    implementationNotes: initiativeNotes(initiative),
    businessImpact: initiative.businessImpact?.trim() ? initiative.businessImpact.trim() : null,
    phaseId: phase.id,
    phaseName: phase.name,
  };
}

function buildPhases(
  clientId: string,
  phases: RoadmapPhaseView[],
  currentPhaseId: string | null,
): CustomerRoadmapPhaseDto[] {
  return [...phases]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((phase) => {
      const completedInitiativeCount = phase.initiatives.filter(
        (item) => item.status === "completed",
      ).length;
      return {
        id: phase.id,
        name: phase.name,
        subtitle: phase.subtitle,
        purpose: phase.executiveSummary?.trim() ? phase.executiveSummary.trim() : null,
        timeline: phase.timeline?.trim() ? phase.timeline.trim() : null,
        status: phase.status,
        statusLabel: phase.statusLabel,
        initiativeCount: phase.initiatives.length,
        completedInitiativeCount,
        isCurrent: currentPhaseId === phase.id,
        href: clientRoadmapPhasePath(clientId, phase.id),
      };
    });
}

function buildNextActions(input: {
  clientId: string;
  dashboard: ClientRoadmapDashboard;
  currentPhaseId: string | null;
  projectCount: number;
  bookingHref: string | null;
}): CustomerRoadmapNextAction[] {
  const { clientId, dashboard, currentPhaseId, projectCount, bookingHref } = input;
  const actions: CustomerRoadmapNextAction[] = [];

  if (currentPhaseId) {
    const phase = dashboard.phases.find((item) => item.id === currentPhaseId);
    actions.push({
      id: "review-phase",
      label: phase ? `Review ${phase.name}` : "Review current phase",
      description: "Open the active implementation phase workspace.",
      href: clientRoadmapPhasePath(clientId, currentPhaseId),
    });
  }

  actions.push({
    id: "opportunities",
    label: "Explore related recommendations",
    description: "Browse customer-visible improvement opportunities tied to your assessment.",
    href: clientRecommendationsPath(clientId),
  });

  actions.push({
    id: "projects",
    label: projectCount > 0 ? "View existing projects" : "Open projects",
    description:
      projectCount > 0
        ? "Review delivery work linked from recommendations."
        : "Projects appear when recommendations become tracked delivery work.",
    href: `/clients/${clientId}/projects`,
  });

  if (bookingHref) {
    actions.push({
      id: "consultation",
      label: "Schedule a consultation",
      description: "Book time with Bobkat IT using the existing assessment review booking path.",
      href: bookingHref,
      external: !bookingHref.startsWith("/"),
    });
  } else {
    actions.push({
      id: "support",
      label: "Request implementation assistance",
      description: "Contact support for help with roadmap implementation.",
      href: "/support",
    });
  }

  return actions.slice(0, 4);
}

/**
 * Map an existing scrubbed dashboard (+ optional projects) into the customer roadmap DTO.
 */
export function buildCustomerRoadmapExperience(input: {
  dashboard: ClientRoadmapDashboard;
  projects: CustomerRoadmapProjectSummary[];
  bookingHref: string | null;
}): CustomerRoadmapExperienceDto {
  const { dashboard, projects, bookingHref } = input;
  const currentPhaseId = resolveCurrentPhaseId(dashboard);
  const initiatives = dashboard.phases.flatMap((phase) =>
    phase.initiatives.map((initiative) => buildInitiativeDto(dashboard.clientId, phase, initiative)),
  );

  return {
    clientId: dashboard.clientId,
    title: dashboard.title,
    status: dashboard.status,
    isDraft: dashboard.status === "draft",
    hasRoadmap: true,
    summary: {
      officialStackScore: dashboard.scoreJourney.baselineScore,
      stackScoreLabel: CUSTOMER_TERM_STACKSCORE,
      progressPercent: dashboard.metrics.completionPercent,
      progressLabel: CUSTOMER_TERM_ROADMAP_PROGRESS,
      currentPhaseName: dashboard.metrics.currentPhaseName,
      initiativesTotal: dashboard.metrics.initiativesTotal,
      initiativesCompleted: dashboard.metrics.initiativesCompleted,
      initiativesRemaining: dashboard.metrics.initiativesRemaining,
      footnote: customerRoadmapProgressFootnote(),
    },
    phases: buildPhases(dashboard.clientId, dashboard.phases, currentPhaseId),
    initiatives,
    projects,
    projectsHref: `/clients/${dashboard.clientId}/projects`,
    opportunitiesHref: clientRecommendationsPath(dashboard.clientId),
    nextActions: buildNextActions({
      clientId: dashboard.clientId,
      dashboard,
      currentPhaseId,
      projectCount: projects.length,
      bookingHref,
    }),
  };
}

export function buildCustomerRoadmapProjectSummary(
  clientId: string,
  project: {
    id: string;
    title: string;
    statusLabel: string;
    priorityLabel: string;
    recommendationTitle: string | null;
  },
): CustomerRoadmapProjectSummary {
  return {
    ...project,
    href: `${clientProjectsPath(clientId)}&selected=${project.id}`,
  };
}

export function emptyRoadmapHref(clientId: string): string {
  return clientWorkspaceRoadmapPath(clientId);
}
