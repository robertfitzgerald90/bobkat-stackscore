import type { TechnologyRoadmap } from "@/lib/technology-improvement-plan/roadmap-engine";
import type { TipRecommendationView } from "@/lib/technology-improvement-plan/types";
import type { TipInvestmentSummary } from "@/lib/pdf/types";
import { buildTipInvestmentSummary } from "@/lib/reports/tip-investment-summary";

export function createTestInvestmentSummary(
  roadmap: TechnologyRoadmap,
  recommendations: TipRecommendationView[] = [],
): TipInvestmentSummary {
  return buildTipInvestmentSummary(roadmap, recommendations);
}
