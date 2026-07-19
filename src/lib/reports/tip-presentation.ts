import type { Priority } from "@/generated/prisma/client";
import { PRIORITY_LABELS } from "@/lib/pdf/types";
import { getPriorityTimeline, sortByRecommendationPriority } from "@/lib/recommendations/display";
import type { RoadmapPhaseResult, TechnologyRoadmap } from "@/lib/technology-improvement-plan/roadmap-engine";
import type { TipRecommendationView, TipRoadmapPhaseView } from "@/lib/technology-improvement-plan/types";
import { PDF_TARGET_SCORE } from "@/lib/pdf/shared/constants";

export { PDF_TARGET_SCORE as TIP_MATURITY_TARGET };

const RETAINER_SERVICE_PATTERNS = [/vcio/i, /strategic it consulting/i, /retainer/i];

const PHASE_WHY_FIRST: Record<string, string> = {
  "phase-critical-stabilization":
    "This phase comes first because unresolved critical gaps create immediate exposure. Stabilizing identity, recovery, and core controls reduces the likelihood of disruption before broader improvements begin.",
  "phase-high-priority":
    "These initiatives follow stabilization because they close material operational gaps that continue to elevate risk and support burden once the environment is safe enough to improve.",
  "phase-operational-maturity":
    "This phase builds repeatable operating capability. With urgent risks addressed, the focus shifts to consistency, visibility, and processes that keep day-to-day technology reliable.",
  "phase-strategic-enhancements":
    "These initiatives are sequenced last because they deliver longer-term advantage once foundational controls and operational maturity are in place.",
};

export const ROADMAP_NEXT_STEPS = [
  { label: "Technology Assessment", description: "Establish current maturity and prioritized opportunities" },
  { label: "Approve Phase 1", description: "Authorize the first implementation window independently" },
  { label: "Implementation", description: "Execute the approved initiatives with clear outcomes" },
  { label: "Measure Improvement", description: "Validate StackScore and operational gains" },
  { label: "Approve Next Phase", description: "Advance when priorities and budget allow" },
  { label: "Repeat", description: "Continue the roadmap at a pace that fits the business" },
] as const;

export function buildTipExecutiveFallback(
  clientName: string,
  currentScore: number,
  projectedScore: number,
): string {
  return `This Technology Improvement Plan presents a phased roadmap for ${clientName} to strengthen technology resilience, reduce operational risk, and advance measurable business outcomes. Based on the current StackScore of ${currentScore}, completing the recommended phases is projected to reach a StackScore of ${projectedScore}. Each phase may be approved and funded independently as priorities and budget allow.`;
}

export function getRoadmapPhaseTimeline(phase: TipRoadmapPhaseView): string {
  if (phase.timeline?.trim()) return phase.timeline;
  if (phase.recommendations.length === 0) {
    return phase.sortOrder === 0 ? "Immediate · 0–90 days" : "Planned delivery window";
  }
  const [lead] = sortByRecommendationPriority(phase.recommendations);
  return getPriorityTimeline(lead.priority);
}

export function getRoadmapPhaseObjectives(phase: TipRoadmapPhaseView): string[] {
  if (phase.businessOutcomes && phase.businessOutcomes.length > 0) {
    return phase.businessOutcomes.slice(0, 4).map((outcome) => outcome.description || outcome.title);
  }

  const seen = new Set<string>();
  const objectives: string[] = [];
  for (const rec of phase.recommendations) {
    const snippet = rec.businessImpact.trim();
    if (!snippet || seen.has(snippet)) continue;
    seen.add(snippet);
    objectives.push(snippet);
    if (objectives.length >= 4) break;
  }
  return objectives;
}

export function getHighestPhasePriority(
  recommendations: TipRecommendationView[],
): Priority | null {
  const sorted = sortByRecommendationPriority(recommendations);
  return sorted[0]?.priority ?? null;
}

export function getPhasePriorityLabel(phase: RoadmapPhaseResult): string {
  const priorities = phase.initiatives.map((initiative) => initiative.priority);
  if (priorities.length === 0) return "Planned";
  const highest = sortByRecommendationPriority(
    priorities.map((priority, index) => ({
      id: String(index),
      priority,
      estimatedImpactPoints: 0,
    })),
  )[0]?.priority;
  return highest ? PRIORITY_LABELS[highest] : "Planned";
}

export function buildPhaseExecutiveNarrative(phase: RoadmapPhaseResult): string {
  const why =
    PHASE_WHY_FIRST[phase.id] ??
    `This phase groups related initiatives so ${phase.name.toLowerCase()} can be delivered as a coherent workstream within ${phase.timeline}.`;

  const initiativeCount = phase.initiatives.length;
  const initiativeLabel = initiativeCount === 1 ? "initiative" : "initiatives";
  const riskLine =
    initiativeCount > 0
      ? ` It includes ${initiativeCount} ${initiativeLabel} selected to reduce operational risk while improving technology maturity in a controlled sequence.`
      : "";

  const engineSummary = phase.executiveSummary?.trim();
  if (engineSummary && !engineSummary.toLowerCase().startsWith("complete ")) {
    return `${why}${riskLine} ${engineSummary}`.trim();
  }

  return `${why}${riskLine}`.trim();
}

export function buildPhaseOutcomeBullets(phase: RoadmapPhaseResult): string[] {
  return buildPhaseOutcomeBulletsInternal(phase, { truncate: true });
}

/** Full outcome text for executive PDF deliverables — no truncation. */
export function buildPhaseOutcomeBulletsFull(phase: RoadmapPhaseResult): string[] {
  return buildPhaseOutcomeBulletsInternal(phase, { truncate: false });
}

function buildPhaseOutcomeBulletsInternal(
  phase: RoadmapPhaseResult,
  options: { truncate: boolean },
): string[] {
  const bullets: string[] = [];
  const seen = new Set<string>();

  for (const outcome of phase.businessOutcomes) {
    const text = (outcome.description || outcome.title).trim();
    if (!text || seen.has(text.toLowerCase())) continue;
    seen.add(text.toLowerCase());
    bullets.push(options.truncate ? shortenOutcome(text) : text);
    if (bullets.length >= 8) break;
  }

  if (bullets.length < 3) {
    for (const initiative of phase.initiatives) {
      const text = initiative.title.trim();
      if (!text || seen.has(text.toLowerCase())) continue;
      seen.add(text.toLowerCase());
      bullets.push(text);
      if (bullets.length >= 8) break;
    }
  }

  return bullets;
}

export function buildPhaseCompletionOutcomes(phase: RoadmapPhaseResult): string[] {
  const outcomes = buildPhaseOutcomeBullets(phase);
  if (outcomes.length > 0) return outcomes.slice(0, 5);

  return [
    "Reduced operational risk",
    "Improved technology visibility",
    "Stronger foundation for the next phase",
  ];
}

function shortenOutcome(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 90) return cleaned;
  const sentence = cleaned.split(/(?<=[.!?])\s+/)[0] ?? cleaned;
  if (sentence.length <= 90) return sentence;
  return `${sentence.slice(0, 87).trimEnd()}…`;
}

export function isRetainerCoveredService(suggestedService: string | null | undefined): boolean {
  if (!suggestedService?.trim()) return false;
  return RETAINER_SERVICE_PATTERNS.some((pattern) => pattern.test(suggestedService));
}

export function isPhaseRecurringCoveredByRetainer(
  phase: RoadmapPhaseResult,
  recommendations: TipRecommendationView[],
): boolean {
  const recurringInitiatives = phase.initiatives.filter(
    (initiative) => initiative.costProfile.monthlyRecurringInvestment > 0,
  );
  if (recurringInitiatives.length === 0) return false;

  const recById = new Map(recommendations.map((rec) => [rec.id, rec]));
  return recurringInitiatives.every((initiative) => {
    const recommendation = recById.get(initiative.recommendationId);
    return isRetainerCoveredService(recommendation?.suggestedService);
  });
}

export type RoadmapOverviewMetrics = {
  currentScore: number;
  projectedScore: number;
  scoreImprovement: number;
  initiativeCount: number;
  phaseCount: number;
};

export function getRoadmapOverviewMetrics(
  currentScore: number,
  roadmap: TechnologyRoadmap,
  recommendations: TipRecommendationView[],
): RoadmapOverviewMetrics {
  return {
    currentScore,
    projectedScore: roadmap.totals.projectedFinalStackScore,
    scoreImprovement: roadmap.totals.projectedFinalStackScore - currentScore,
    initiativeCount: recommendations.length,
    phaseCount: roadmap.phases.length,
  };
}

export function findRecommendationForInitiative(
  recommendations: TipRecommendationView[],
  recommendationId: string,
): TipRecommendationView | undefined {
  return recommendations.find((rec) => rec.id === recommendationId);
}

export function buildApprovalIntro(clientName: string): string {
  return `By signing below, ${clientName} approves the selected implementation phase(s) of this Technology Roadmap. Remaining phases may be approved separately as priorities and budget allow. Approval of one phase does not obligate approval of subsequent phases.`;
}
