import type { Priority } from "@/generated/prisma/client";
import { getPriorityTimeline, sortByRecommendationPriority } from "@/lib/recommendations/display";
import type { TipRecommendationView, TipRoadmapPhaseView } from "@/lib/technology-improvement-plan/types";
import { PDF_TARGET_SCORE } from "@/lib/pdf/shared/constants";

export { PDF_TARGET_SCORE as TIP_MATURITY_TARGET };

export function buildTipExecutiveFallback(
  clientName: string,
  currentScore: number,
  projectedScore: number,
): string {
  return `This Technology Improvement Plan presents a prioritized path for ${clientName} to strengthen technology resilience, reduce operational risk, and advance business outcomes. Based on the current StackScore of ${currentScore}, implementing the initiatives below is projected to reach a StackScore of ${projectedScore}.`;
}

export function getRoadmapPhaseTimeline(phase: TipRoadmapPhaseView): string {
  if (phase.recommendations.length === 0) {
    return phase.sortOrder === 0 ? "Immediate · 0–90 days" : "Planned delivery window";
  }
  const [lead] = sortByRecommendationPriority(phase.recommendations);
  return getPriorityTimeline(lead.priority);
}

export function getRoadmapPhaseObjectives(phase: TipRoadmapPhaseView): string[] {
  const seen = new Set<string>();
  const objectives: string[] = [];
  for (const rec of phase.recommendations) {
    const snippet = rec.businessImpact.trim();
    if (!snippet || seen.has(snippet)) continue;
    seen.add(snippet);
    objectives.push(snippet);
    if (objectives.length >= 2) break;
  }
  return objectives;
}

export function getHighestPhasePriority(
  recommendations: TipRecommendationView[],
): Priority | null {
  const sorted = sortByRecommendationPriority(recommendations);
  return sorted[0]?.priority ?? null;
}
