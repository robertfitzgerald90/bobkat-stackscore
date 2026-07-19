import type { LifecycleHealthBand } from "./types";

export const LIFECYCLE_HEALTH_LABELS: Record<LifecycleHealthBand, string> = {
  healthy: "Healthy",
  watch: "Watch",
  at_risk: "At Risk",
  critical: "Critical",
};

export function scoreToHealthBand(score: number | null): LifecycleHealthBand {
  if (score === null) return "watch";
  if (score >= 80) return "healthy";
  if (score >= 70) return "watch";
  if (score >= 60) return "at_risk";
  return "critical";
}

/** Business risk is the inverse framing of technology health. */
export function scoreToBusinessRisk(score: number | null): LifecycleHealthBand {
  return scoreToHealthBand(score);
}

export function trendLabel(
  trend: "improving" | "stable" | "declining" | null | undefined,
  scoreDelta: number | null,
): string {
  if (trend === "improving" || (scoreDelta !== null && scoreDelta > 0)) {
    return "Improving";
  }
  if (trend === "declining" || (scoreDelta !== null && scoreDelta < 0)) {
    return "Declining";
  }
  if (trend === "stable" || scoreDelta === 0) {
    return "Stable";
  }
  return "Insufficient history";
}
