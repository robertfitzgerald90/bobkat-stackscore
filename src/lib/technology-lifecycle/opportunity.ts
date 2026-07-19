import type { Priority } from "@/generated/prisma/client";

export type OpportunityCandidate = {
  source:
    | "phase_complete"
    | "technology_aging"
    | "emerging_risk"
    | "refresh_cycle"
    | "reassessment";
  title: string;
  description: string;
  priority: Priority;
  estimatedImpactPoints: number;
  estimatedOneTimeInvestment: number;
  recommendationId?: string;
  relatedServiceKey?: string;
  metadata?: Record<string, unknown>;
};

type EvaluateOpportunityInput = {
  completedPhaseName: string;
  openRecommendations: Array<{
    id: string;
    title: string;
    description: string;
    priority: Priority;
    estimatedImpactPoints: number;
    alreadyOnRoadmap: boolean;
  }>;
  refreshEvents: Array<{
    title: string;
    eventType: string;
    urgency: "overdue" | "upcoming" | "planned";
    daysUntilDue: number;
  }>;
  criticalOpenCount: number;
};

/**
 * Pure opportunity evaluation after a phase completes.
 * Persisting candidates is handled by the service layer.
 */
export function evaluatePostPhaseOpportunities(
  input: EvaluateOpportunityInput,
): OpportunityCandidate[] {
  const candidates: OpportunityCandidate[] = [];

  for (const recommendation of input.openRecommendations) {
    if (recommendation.alreadyOnRoadmap) continue;
    if (recommendation.priority !== "critical" && recommendation.priority !== "high") {
      continue;
    }
    candidates.push({
      source: "phase_complete",
      title: recommendation.title,
      description: `Following completion of ${input.completedPhaseName}, this open recommendation remains a priority for the next planning cycle. ${recommendation.description}`,
      priority: recommendation.priority,
      estimatedImpactPoints: recommendation.estimatedImpactPoints,
      estimatedOneTimeInvestment: 0,
      recommendationId: recommendation.id,
      relatedServiceKey: "strategic_consulting",
      metadata: { trigger: "phase_complete" },
    });
  }

  for (const event of input.refreshEvents) {
    if (event.urgency === "planned") continue;
    candidates.push({
      source: event.eventType.includes("refresh") || event.eventType.includes("replacement")
        ? "refresh_cycle"
        : "technology_aging",
      title: `Lifecycle planning: ${event.title}`,
      description: `${event.title} requires attention (${event.eventType.replaceAll("_", " ")}, ${event.daysUntilDue} days). Include in the next roadmap refresh.`,
      priority: event.urgency === "overdue" ? "critical" : "high",
      estimatedImpactPoints: event.urgency === "overdue" ? 6 : 4,
      estimatedOneTimeInvestment: 0,
      relatedServiceKey: "virtual_cio",
      metadata: { eventType: event.eventType, daysUntilDue: event.daysUntilDue },
    });
  }

  if (input.criticalOpenCount >= 3) {
    candidates.push({
      source: "emerging_risk",
      title: "Emerging risk concentration",
      description: `${input.criticalOpenCount} critical recommendations remain open after ${input.completedPhaseName}. Schedule a focused risk-reduction planning session.`,
      priority: "critical",
      estimatedImpactPoints: 8,
      estimatedOneTimeInvestment: 0,
      relatedServiceKey: "quarterly_reviews",
      metadata: { criticalOpenCount: input.criticalOpenCount },
    });
  }

  return candidates.slice(0, 8);
}
