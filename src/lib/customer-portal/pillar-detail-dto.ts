/**
 * SS-UX-005 — Pure pillar detail DTO builders (no Prisma).
 */

import type { Priority, RecommendationStatus } from "@/generated/prisma/client";
import {
  getCustomerMaturityLabel,
  isCustomerActiveOpportunityStatus,
} from "@/lib/assessments/customer-reporting";
import { MEANINGFUL_STRENGTH_MIN_PERCENT } from "@/lib/assessments/customer-trust";
import {
  clientExplorePillarPath,
  clientRecommendationDetailPath,
  clientRecommendationsPath,
  clientWorkspaceRoadmapPath,
} from "@/lib/clients/paths";
import {
  COMPLEXITY_FOOTNOTE,
  resolveCustomerOpportunityComplexity,
  type CustomerOpportunityComplexity,
} from "@/lib/customer-portal/complexity";
import { PRIORITY_LABELS } from "@/lib/display";
import { conciseFocusTitle } from "@/lib/client-workspace";
import { takeTopRecommendations } from "@/lib/recommendations/sort";
import {
  TECHNOLOGY_PILLARS,
  type TechnologyPillarCode,
  type PillarScoreInsight,
} from "@/lib/technology-maturity/pillars";

export const PILLAR_NEXT_ACTION_LIMIT = 3;
export const PILLAR_OPPORTUNITY_DISPLAY_LIMIT = 8;

export type PillarEvidenceItem = {
  questionText: string;
  answerText: string;
  scoreEarned: number | null;
  isCritical: boolean;
};

export type CustomerPillarOpportunity = {
  id: string;
  title: string;
  priority: Priority;
  priorityLabel: string;
  status: RecommendationStatus;
  statusLabel: string;
  href: string;
  complexity: CustomerOpportunityComplexity;
};

export type CustomerPillarStrength = {
  kind: "demonstrated" | "comparative" | "none";
  summary: string;
  evidence: PillarEvidenceItem | null;
};

export type CustomerPillarWeakness = {
  summary: string;
  evidence: PillarEvidenceItem | null;
  relatedOpportunityId: string | null;
  relatedOpportunityHref: string | null;
};

export type CustomerPillarTile = {
  code: TechnologyPillarCode;
  name: string;
  businessQuestion: string;
  score: number | null;
  maturityLabel: string | null;
  href: string;
  status: "complete" | "incomplete";
};

export type CustomerPillarDetailDto = {
  code: TechnologyPillarCode;
  name: string;
  businessQuestion: string;
  score: number | null;
  maturityLabel: string | null;
  maturitySummary: string;
  strength: CustomerPillarStrength;
  weakness: CustomerPillarWeakness;
  opportunities: CustomerPillarOpportunity[];
  nextActions: CustomerPillarOpportunity[];
  opportunitiesHref: string;
  roadmapHref: string;
  complexityFootnote: string;
  hasCompletedAssessment: boolean;
};

export type CustomerExploreDto = {
  clientId: string;
  companyName: string;
  hasCompletedAssessment: boolean;
  assessmentInProgress: boolean;
  selectedPillarCode: TechnologyPillarCode | null;
  pillars: CustomerPillarTile[];
  detailsByCode: Record<TechnologyPillarCode, CustomerPillarDetailDto>;
};

export type PillarResponseEvidence = {
  questionText: string;
  answerText: string;
  scoreEarned: number;
  maxScore: number;
  isCritical: boolean;
  questionCode: string;
};

export type PillarRecommendationInput = {
  id: string;
  title: string;
  priority: Priority;
  status: RecommendationStatus;
  estimatedImpactPoints: number;
  suggestedService: string | null;
};

const STATUS_LABELS: Partial<Record<RecommendationStatus, string>> = {
  open: "Open",
  accepted: "Accepted",
  in_progress: "In progress",
  completed: "Completed",
  deferred: "Deferred",
};

function maturitySummary(score: number | null, label: string | null, pillarName: string): string {
  if (score === null || !label) {
    return `${pillarName} does not yet have an official maturity score. Complete an assessment to measure this domain.`;
  }
  if (score >= 85) {
    return `${pillarName} is at ${label} maturity (${score}/100). Practices in this domain are largely consistent and support the business with manageable risk.`;
  }
  if (score >= 70) {
    return `${pillarName} is at ${label} maturity (${score}/100). Core practices are in place, with clear opportunities to strengthen consistency and resilience.`;
  }
  if (score >= 55) {
    return `${pillarName} is at ${label} maturity (${score}/100). Foundational capabilities exist, but important gaps may still create operational or security exposure.`;
  }
  if (score >= 40) {
    return `${pillarName} is at ${label} maturity (${score}/100). Several foundational controls are incomplete — prioritizing remediation will reduce business risk.`;
  }
  return `${pillarName} is at ${label} maturity (${score}/100). Technology readiness in this domain is early-stage. Focused improvement opportunities can raise resilience after reassessment confirms progress.`;
}

function toOpportunity(
  clientId: string,
  row: PillarRecommendationInput,
  pillarCode: string,
): CustomerPillarOpportunity {
  return {
    id: row.id,
    title: conciseFocusTitle(row.title),
    priority: row.priority,
    priorityLabel: PRIORITY_LABELS[row.priority],
    status: row.status,
    statusLabel: STATUS_LABELS[row.status] ?? row.status,
    href: clientRecommendationDetailPath(clientId, row.id, { pillarCode }),
    complexity: resolveCustomerOpportunityComplexity(row.suggestedService),
  };
}

function selectStrength(
  pillarScore: number | null,
  responses: PillarResponseEvidence[],
): CustomerPillarStrength {
  const noneMessage = "No demonstrated strength identified at the current maturity level.";

  if (pillarScore === null) {
    return { kind: "none", summary: noneMessage, evidence: null };
  }

  const highResponses = [...responses]
    .filter((r) => r.maxScore > 0 && r.scoreEarned / r.maxScore >= 0.7 && !r.isCritical)
    .sort((a, b) => b.scoreEarned / b.maxScore - a.scoreEarned / a.maxScore);

  if (pillarScore >= MEANINGFUL_STRENGTH_MIN_PERCENT) {
    const top = highResponses[0] ?? null;
    return {
      kind: "demonstrated",
      summary: top
        ? `Demonstrated strength: stronger evidence on “${top.questionText}”.`
        : `This pillar meets the demonstrated strength threshold (Developing / ${MEANINGFUL_STRENGTH_MIN_PERCENT}+).`,
      evidence: top
        ? {
            questionText: top.questionText,
            answerText: top.answerText,
            scoreEarned: top.scoreEarned,
            isCritical: top.isCritical,
          }
        : null,
    };
  }

  const comparative = highResponses[0] ?? [...responses].sort((a, b) => b.scoreEarned - a.scoreEarned)[0];
  if (comparative && comparative.scoreEarned > 0) {
    return {
      kind: "comparative",
      summary: `Relative performance only (not demonstrated maturity): comparatively stronger response on “${comparative.questionText}”.`,
      evidence: {
        questionText: comparative.questionText,
        answerText: comparative.answerText,
        scoreEarned: comparative.scoreEarned,
        isCritical: comparative.isCritical,
      },
    };
  }

  return { kind: "none", summary: noneMessage, evidence: null };
}

function selectWeakness(
  clientId: string,
  responses: PillarResponseEvidence[],
  opportunities: CustomerPillarOpportunity[],
): CustomerPillarWeakness {
  if (responses.length === 0 && opportunities.length === 0) {
    return {
      summary: "No documented weakness evidence is available for this pillar yet.",
      evidence: null,
      relatedOpportunityId: null,
      relatedOpportunityHref: null,
    };
  }

  const critical = responses
    .filter((r) => r.isCritical)
    .sort((a, b) => a.scoreEarned / Math.max(1, a.maxScore) - b.scoreEarned / Math.max(1, b.maxScore));
  const lowest = [...responses].sort(
    (a, b) => a.scoreEarned / Math.max(1, a.maxScore) - b.scoreEarned / Math.max(1, b.maxScore),
  );
  const pick = critical[0] ?? lowest[0] ?? null;
  const related = opportunities[0] ?? null;

  if (pick) {
    return {
      summary: pick.isCritical
        ? `Critical exposure identified for “${pick.questionText}”.`
        : `Lowest-scoring evidence in this pillar: “${pick.questionText}”.`,
      evidence: {
        questionText: pick.questionText,
        answerText: pick.answerText,
        scoreEarned: pick.scoreEarned,
        isCritical: pick.isCritical,
      },
      relatedOpportunityId: related?.id ?? null,
      relatedOpportunityHref: related?.href ?? null,
    };
  }

  return {
    summary: related
      ? `Priority opportunity in this pillar: ${related.title}.`
      : "No assessment response evidence is available; review improvement opportunities for this pillar.",
    evidence: null,
    relatedOpportunityId: related?.id ?? null,
    relatedOpportunityHref: related?.href ?? null,
  };
}

export function isTechnologyPillarCode(value: string | null | undefined): value is TechnologyPillarCode {
  return TECHNOLOGY_PILLARS.some((p) => p.code === value);
}

export function buildCustomerPillarTiles(
  clientId: string,
  insights: PillarScoreInsight[],
): CustomerPillarTile[] {
  const byCode = new Map(insights.map((p) => [p.pillarCode, p]));
  return TECHNOLOGY_PILLARS.map((pillar) => {
    const insight = byCode.get(pillar.code);
    const score = insight?.percentScore ?? null;
    return {
      code: pillar.code,
      name: pillar.name,
      businessQuestion: pillar.businessQuestion,
      score,
      maturityLabel: score !== null ? getCustomerMaturityLabel(score) : null,
      href: clientExplorePillarPath(clientId, pillar.code),
      status: insight?.status ?? (score !== null ? "complete" : "incomplete"),
    };
  });
}

export function buildCustomerPillarDetail(input: {
  clientId: string;
  pillarCode: TechnologyPillarCode;
  insight: PillarScoreInsight | null;
  responses: PillarResponseEvidence[];
  recommendations: PillarRecommendationInput[];
  hasCompletedAssessment: boolean;
}): CustomerPillarDetailDto {
  const definition = TECHNOLOGY_PILLARS.find((p) => p.code === input.pillarCode)!;
  const score = input.insight?.percentScore ?? null;
  const maturityLabel = score !== null ? getCustomerMaturityLabel(score) : null;

  const active = input.recommendations.filter((r) => isCustomerActiveOpportunityStatus(r.status));
  const ranked = takeTopRecommendations(
    active.length > 0 ? active : input.recommendations,
    PILLAR_OPPORTUNITY_DISPLAY_LIMIT,
  );
  const opportunities = ranked.map((row) =>
    toOpportunity(input.clientId, row, definition.code),
  );
  const nextActions = opportunities.slice(0, PILLAR_NEXT_ACTION_LIMIT);

  return {
    code: definition.code,
    name: definition.name,
    businessQuestion: definition.businessQuestion,
    score,
    maturityLabel,
    maturitySummary: maturitySummary(score, maturityLabel, definition.name),
    strength: selectStrength(score, input.responses),
    weakness: selectWeakness(input.clientId, input.responses, opportunities),
    opportunities,
    nextActions,
    opportunitiesHref: `${clientRecommendationsPath(input.clientId)}?pillar=${encodeURIComponent(definition.code)}`,
    roadmapHref: clientWorkspaceRoadmapPath(input.clientId),
    complexityFootnote: COMPLEXITY_FOOTNOTE,
    hasCompletedAssessment: input.hasCompletedAssessment,
  };
}
