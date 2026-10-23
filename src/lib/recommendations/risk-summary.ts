import type { Priority } from "@/generated/prisma/client";

export type PriorityRiskSummary = {
  critical: number;
  high: number;
  medium: number;
  low: number;
  criticalExposure: boolean;
};

/** Builds Technology Profile risk counts from recommendation priorities (SS-OPT-002 DEF-005). */
export function buildRiskSummaryFromPriorities(
  recommendations: Array<{ priority: Priority }>,
  criticalExposure: boolean,
): PriorityRiskSummary {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };

  for (const recommendation of recommendations) {
    if (recommendation.priority === "critical") counts.critical += 1;
    else if (recommendation.priority === "high") counts.high += 1;
    else if (recommendation.priority === "medium") counts.medium += 1;
    else counts.low += 1;
  }

  return { ...counts, criticalExposure };
}
