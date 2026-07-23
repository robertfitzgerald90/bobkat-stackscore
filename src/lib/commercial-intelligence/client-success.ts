import { computeRoadmapProgressMetrics } from "@/lib/client-roadmap/metrics";
import type { RecommendationStatus } from "@/generated/prisma/client";
import type { ClientSuccessMetrics } from "./types";
import { logCommercialInsightsFailure } from "./logging";

function decimalToNumber(
  value: { toNumber?: () => number } | number | null | undefined | unknown,
): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "object" && value !== null && "toNumber" in value) {
    const toNumber = (value as { toNumber?: () => number }).toNumber;
    if (typeof toNumber === "function") return toNumber();
  }
  return Number(value);
}

function roundScore(value: unknown): number | null {
  if (value == null) return null;
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return null;
  return Math.round(numeric);
}

type RoadmapPhaseRecord = {
  status: string;
  oneTimeInvestment: unknown;
  monthlyRecurringInvestment: unknown;
  name: string;
  sortOrder: number | null;
  initiatives: Array<{
    recommendationId: string;
    estimatedImpactPoints: number;
    recommendation: {
      status: string;
      estimatedImpactPoints: number;
      title: string;
      description: string;
      businessImpact: string;
      priority: string;
      category: { name: string } | null;
    } | null;
  }>;
};

type ClientSuccessInput = {
  id: string;
  companyName: string;
  scoreHistory: Array<{
    overallScore: unknown;
    securityScore: unknown;
    infrastructureScore: unknown;
    documentationScore: unknown;
  }>;
  clientRoadmaps: Array<{
    phases: RoadmapPhaseRecord[];
  }>;
};

export function buildClientSuccessMetrics(
  client: ClientSuccessInput,
  recurringServices: Array<{ clientId: string }>,
): ClientSuccessMetrics {
  try {
    const history = client.scoreHistory;
    const latest = roundScore(history[0]?.overallScore);
    const previous = roundScore(history[1]?.overallScore);
    const roadmap = client.clientRoadmaps[0];
    const phasesForClient = roadmap?.phases ?? [];
    const initiatives = phasesForClient.flatMap((phase) =>
      phase.initiatives.flatMap((initiative) => {
        const recommendation = initiative.recommendation;
        if (!recommendation) {
          logCommercialInsightsFailure("client_success_initiative", new Error("Missing recommendation"), {
            clientId: client.id,
            recommendationId: initiative.recommendationId,
          });
          return [];
        }

        return [
          {
            id: initiative.recommendationId,
            title: recommendation.title,
            description: recommendation.description,
            businessImpact: recommendation.businessImpact,
            suggestedService: null,
            priority: recommendation.priority as "low" | "medium" | "high" | "critical",
            estimatedImpactPoints: initiative.estimatedImpactPoints,
            categoryName: recommendation.category?.name ?? "General",
            status: recommendation.status as RecommendationStatus,
          },
        ];
      }),
    );
    const metrics = computeRoadmapProgressMetrics(
      phasesForClient.map((phase, index) => ({
        status: phase.status as "planned" | "approved" | "in_progress" | "completed" | "deferred" | "cancelled",
        oneTimeInvestment: decimalToNumber(phase.oneTimeInvestment),
        monthlyRecurringInvestment: decimalToNumber(phase.monthlyRecurringInvestment),
        name: phase.name,
        sortOrder: phase.sortOrder ?? index,
      })),
      initiatives,
    );
    const serviceAdoptionCount = recurringServices.filter(
      (service) => service.clientId === client.id,
    ).length;
    const securityImprovement =
      (roundScore(history[0]?.securityScore) ?? 0) - (roundScore(history[1]?.securityScore) ?? 0);
    const infrastructureImprovement =
      (roundScore(history[0]?.infrastructureScore) ?? 0) -
      (roundScore(history[1]?.infrastructureScore) ?? 0);
    const documentationImprovement =
      (roundScore(history[0]?.documentationScore) ?? 0) -
      (roundScore(history[1]?.documentationScore) ?? 0);
    const technologyScoreGrowth =
      latest !== null && previous !== null ? latest - previous : null;

    return {
      clientId: client.id,
      clientName: client.companyName,
      technologyScoreGrowth,
      roadmapCompletionPercent: metrics.completionPercent,
      serviceAdoptionCount,
      riskReductionPercent: metrics.riskReductionPercent,
      securityImprovement,
      infrastructureImprovement,
      documentationImprovement,
      overallOutcomeScore: Math.max(
        0,
        Math.min(
          100,
          Math.round(
            metrics.completionPercent * 0.4 +
              (technologyScoreGrowth != null ? Math.max(0, technologyScoreGrowth) * 4 : 10) +
              serviceAdoptionCount * 5 +
              metrics.riskReductionPercent * 0.2,
          ),
        ),
      ),
    };
  } catch (error) {
    logCommercialInsightsFailure("client_success", error, { clientId: client.id });
    return {
      clientId: client.id,
      clientName: client.companyName,
      technologyScoreGrowth: null,
      roadmapCompletionPercent: 0,
      serviceAdoptionCount: recurringServices.filter((service) => service.clientId === client.id)
        .length,
      riskReductionPercent: 0,
      securityImprovement: 0,
      infrastructureImprovement: 0,
      documentationImprovement: 0,
      overallOutcomeScore: 0,
    };
  }
}

export function getProposalPhaseSortOrder(proposal: {
  phase: { sortOrder: number } | null;
}): number | null {
  return proposal.phase?.sortOrder ?? null;
}
