/**
 * SS-UX-004 — Pure customer Overview DTO builders (no Prisma / I/O).
 */

import type { Priority } from "@/generated/prisma/client";
import {
  CUSTOMER_TERM_STACKSCORE,
  getCustomerMaturityLabel,
  customerRoadmapProgressFootnote,
  isCustomerActiveOpportunityStatus,
} from "@/lib/assessments/customer-reporting";
import {
  MEANINGFUL_STRENGTH_MIN_PERCENT,
  selectDemonstratedAssessmentStrengths,
} from "@/lib/assessments/customer-trust";
import {
  clientExplorePillarPath,
  clientRecommendationDetailPath,
  clientWorkspaceRoadmapPath,
} from "@/lib/clients/paths";
import {
  deriveCustomerNextAction,
  type CustomerNextAction,
} from "@/lib/customer-portal/next-action";
import { PRIORITY_LABELS } from "@/lib/display";
import { conciseFocusTitle } from "@/lib/client-workspace";
import { takeTopRecommendations } from "@/lib/recommendations/sort";
import type { TechnologyProfileDetail } from "@/lib/technology-profile/types";
import {
  TECHNOLOGY_PILLARS,
  type TechnologyPillarCode,
} from "@/lib/technology-maturity/pillars";
import type { VcioAccessState } from "@/lib/vcio/entitlements";

function canUseOngoingVcioFeatures(accessState: VcioAccessState): boolean {
  return accessState === "FULL_ACCESS" || accessState === "GRACE_PERIOD";
}

export const CUSTOMER_OVERVIEW_PRIORITY_LIMIT = 5;
export const CUSTOMER_OVERVIEW_PRIORITY_MIN = 3;

export type CustomerOverviewPillar = {
  code: TechnologyPillarCode;
  name: string;
  businessQuestion: string;
  score: number | null;
  maturityLabel: string | null;
  href: string;
  status: "complete" | "incomplete";
};

export type CustomerOverviewOpportunity = {
  id: string;
  title: string;
  priority: Priority;
  priorityLabel: string;
  href: string;
};

export type CustomerOverviewStrength = {
  name: string;
  score: number;
  kind: "demonstrated" | "comparative";
};

export type CustomerOverviewVcioSummary = {
  show: boolean;
  accessState: VcioAccessState;
  canUseFeatures: boolean;
  title: string;
  description: string;
  href: string;
};

export type CustomerOverviewDto = {
  clientId: string;
  companyName: string;
  welcomeName: string;
  hasCompletedAssessment: boolean;
  assessmentInProgress: boolean;
  draftAssessmentId: string | null;
  stackScore: number | null;
  maturityLabel: string | null;
  maturityExplanation: string | null;
  assessedAt: string | null;
  assessedAtLabel: string | null;
  reportHref: string | null;
  pillars: CustomerOverviewPillar[];
  priorities: CustomerOverviewOpportunity[];
  activeOpportunityCount: number;
  demonstratedStrengths: CustomerOverviewStrength[];
  comparativeStrengths: CustomerOverviewStrength[];
  roadmap: {
    progressPercent: number;
    phaseLabel: string | null;
    hasRoadmap: boolean;
    href: string;
    footnote: string;
    stackScoreLabel: typeof CUSTOMER_TERM_STACKSCORE;
  };
  nextAction: CustomerNextAction | null;
  vcio: CustomerOverviewVcioSummary;
};

function maturityExplanationForScore(score: number, label: string): string {
  if (score >= 85) {
    return `${label} maturity means technology practices are largely consistent and supporting the business with manageable risk.`;
  }
  if (score >= 70) {
    return `${label} maturity means core practices are in place, with clear opportunities to strengthen consistency and resilience.`;
  }
  if (score >= 55) {
    return `${label} maturity means foundational capabilities exist, but important gaps still create operational or security exposure.`;
  }
  if (score >= 40) {
    return `${label} maturity means several foundational controls are incomplete — prioritizing remediation will reduce business risk.`;
  }
  return `${label} maturity means technology readiness is early-stage. Focused improvement opportunities can raise resilience after reassessment confirms progress.`;
}

function formatAssessedAt(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildPillars(detail: TechnologyProfileDetail): CustomerOverviewPillar[] {
  const byCode = new Map(detail.pillarInsights.map((p) => [p.pillarCode, p]));
  return TECHNOLOGY_PILLARS.map((pillar) => {
    const insight = byCode.get(pillar.code);
    const score = insight?.percentScore ?? null;
    return {
      code: pillar.code,
      name: pillar.name,
      businessQuestion: pillar.businessQuestion,
      score,
      maturityLabel: score !== null ? getCustomerMaturityLabel(score) : null,
      href: clientExplorePillarPath(detail.profile.clientId, pillar.code),
      status: insight?.status ?? (score !== null ? "complete" : "incomplete"),
    };
  });
}

function buildPriorities(detail: TechnologyProfileDetail): CustomerOverviewOpportunity[] {
  const active = detail.openRecommendations.filter((row) =>
    isCustomerActiveOpportunityStatus(row.status),
  );
  const ranked = takeTopRecommendations(
    active.length > 0 ? active : detail.openRecommendations,
    CUSTOMER_OVERVIEW_PRIORITY_LIMIT,
  );
  return ranked.map((row) => ({
    id: row.id,
    title: conciseFocusTitle(row.title),
    priority: row.priority,
    priorityLabel: PRIORITY_LABELS[row.priority],
    href: clientRecommendationDetailPath(detail.profile.clientId, row.id),
  }));
}

function buildStrengths(detail: TechnologyProfileDetail): {
  demonstrated: CustomerOverviewStrength[];
  comparative: CustomerOverviewStrength[];
} {
  const scored = detail.pillarInsights
    .filter((p): p is typeof p & { percentScore: number } => p.percentScore !== null)
    .map((p) => ({
      categoryName: p.pillarName,
      percentScore: p.percentScore,
      code: p.pillarCode,
    }));

  const demonstratedNames = selectDemonstratedAssessmentStrengths(scored, {
    limit: 3,
    minPercent: MEANINGFUL_STRENGTH_MIN_PERCENT,
  });
  const demonstrated = demonstratedNames.map((name) => {
    const match = scored.find((p) => p.categoryName === name)!;
    return {
      name,
      score: match.percentScore,
      kind: "demonstrated" as const,
    };
  });

  if (demonstrated.length > 0) {
    return { demonstrated, comparative: [] };
  }

  const comparative = [...scored]
    .sort((a, b) => b.percentScore - a.percentScore)
    .slice(0, 3)
    .filter((p) => p.percentScore > 0)
    .map((p) => ({
      name: p.categoryName,
      score: p.percentScore,
      kind: "comparative" as const,
    }));

  return { demonstrated: [], comparative };
}

export function buildVcioSummary(
  clientId: string,
  accessState: VcioAccessState,
): CustomerOverviewVcioSummary {
  const show = accessState !== "NO_ACCESS";
  const canUseFeatures = canUseOngoingVcioFeatures(accessState);
  const href = `/clients/${clientId}/vcio`;

  if (!show) {
    return {
      show: false,
      accessState,
      canUseFeatures: false,
      title: "vCIO Engagement",
      description: "",
      href,
    };
  }

  if (accessState === "FULL_ACCESS" || accessState === "GRACE_PERIOD") {
    return {
      show: true,
      accessState,
      canUseFeatures,
      title: "vCIO Engagement",
      description:
        accessState === "GRACE_PERIOD"
          ? "Your advisory workspace is available during the current grace period."
          : "Open your strategic advisory workspace for reviews, planning, and engagement progress.",
      href,
    };
  }

  if (accessState === "REQUIRES_PAYMENT_ACTION") {
    return {
      show: true,
      accessState,
      canUseFeatures,
      title: "vCIO Engagement",
      description: "A payment action is required to restore full advisory features.",
      href,
    };
  }

  return {
    show: true,
    accessState,
    canUseFeatures,
    title: "vCIO Engagement",
    description: "Historical advisory information remains available in read-only mode.",
    href,
  };
}

function enrichNextAction(
  detail: TechnologyProfileDetail,
  roadmapProgressPercent: number,
  hasRoadmap: boolean,
): CustomerNextAction | null {
  const base = deriveCustomerNextAction(detail);
  if (base) return base;

  if (detail.journey.assessmentsCompleted === 0) {
    return {
      label: "Start Assessment",
      description:
        "Complete the Technology Maturity Assessment to unlock your StackScore and priorities.",
      href: "/assessment/start",
    };
  }

  if (hasRoadmap && roadmapProgressPercent < 100) {
    return {
      label: "Continue Roadmap",
      description: "Review your living execution plan and next implementation priorities.",
      href: clientWorkspaceRoadmapPath(detail.profile.clientId),
    };
  }

  return null;
}

/** Pure presentation builder for tests and service composition — no I/O. */
export function buildCustomerOverviewFromDetail(input: {
  detail: TechnologyProfileDetail;
  companyName: string;
  roadmapProgressPercent?: number;
  hasRoadmap?: boolean;
  roadmapPhaseLabel?: string | null;
  vcioAccessState?: VcioAccessState;
}): CustomerOverviewDto {
  const { detail, companyName } = input;
  const hasRoadmap = input.hasRoadmap ?? false;
  const roadmapProgressPercent = input.roadmapProgressPercent ?? detail.journey.progressPercent;
  const score = detail.profile.overallStackScore;
  const maturityLabel = score !== null ? getCustomerMaturityLabel(score) : null;
  const { demonstrated, comparative } = buildStrengths(detail);

  return {
    clientId: detail.profile.clientId,
    companyName,
    welcomeName: detail.client.primaryContactName?.split(" ")[0] ?? "there",
    hasCompletedAssessment: detail.journey.assessmentsCompleted > 0,
    assessmentInProgress: Boolean(detail.draftAssessmentId),
    draftAssessmentId: detail.draftAssessmentId,
    stackScore: score,
    maturityLabel,
    maturityExplanation:
      score !== null && maturityLabel
        ? maturityExplanationForScore(score, maturityLabel)
        : null,
    assessedAt: detail.profile.lastAssessedAt
      ? new Date(detail.profile.lastAssessedAt).toISOString()
      : null,
    assessedAtLabel: formatAssessedAt(detail.profile.lastAssessedAt),
    reportHref: detail.profile.currentAssessmentId
      ? `/assessments/${detail.profile.currentAssessmentId}/report`
      : null,
    pillars: buildPillars(detail),
    priorities: buildPriorities(detail),
    activeOpportunityCount: detail.openRecommendations.filter((row) =>
      isCustomerActiveOpportunityStatus(row.status),
    ).length,
    demonstratedStrengths: demonstrated,
    comparativeStrengths: comparative,
    roadmap: {
      progressPercent: roadmapProgressPercent,
      phaseLabel: input.roadmapPhaseLabel ?? detail.journey.phaseLabel,
      hasRoadmap,
      href: clientWorkspaceRoadmapPath(detail.profile.clientId),
      footnote: customerRoadmapProgressFootnote(),
      stackScoreLabel: CUSTOMER_TERM_STACKSCORE,
    },
    nextAction: enrichNextAction(detail, roadmapProgressPercent, hasRoadmap),
    vcio: buildVcioSummary(detail.profile.clientId, input.vcioAccessState ?? "NO_ACCESS"),
  };
}
