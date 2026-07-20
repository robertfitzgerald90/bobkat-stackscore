import type { TechnologyRoadmap } from "@/lib/technology-improvement-plan/roadmap-engine";
import type { TipRecommendationView } from "@/lib/technology-improvement-plan/types";
import {
  filterDistinctFromReference,
  dedupeTipStrings,
  areTipTextsIdentical,
} from "@/lib/reports/tip-text-normalize";
import {
  generateCategoryOpportunity,
  generateOpportunityFromRecommendation,
  generateRiskFromRecommendation,
} from "@/lib/reports/tip-category-content";
import { sortByRecommendationPriority } from "@/lib/recommendations/display";

function logTipContentWarning(message: string): void {
  if (process.env.NODE_ENV === "development") {
    console.warn(`[tip-content] ${message}`);
  }
}

export function buildTopBusinessRisks(recommendations: TipRecommendationView[]): string[] {
  const sorted = sortByRecommendationPriority(recommendations);
  const risks = dedupeTipStrings(
    sorted.slice(0, 8).map((rec) => generateRiskFromRecommendation(rec)),
  );

  return risks.slice(0, 5);
}

export function buildTopOpportunities(
  recommendations: TipRecommendationView[],
  roadmap: TechnologyRoadmap,
  categorySummaries: Array<{ name: string; score: number; hasRecommendations: boolean }>,
): string[] {
  const risks = buildTopBusinessRisks(recommendations);

  const fromOutcomes = roadmap.phases
    .flatMap((phase) => phase.businessOutcomes)
    .map((outcome) => {
      const text = (outcome.description || outcome.title).trim();
      if (/risk|exposure|without|fail|loss|disrupt|prevent/i.test(text)) {
        return generateOpportunityFromRecommendation({
          id: outcome.title,
          title: outcome.title,
          description: text,
          businessImpact: text,
          priority: "medium",
          suggestedService: null,
          estimatedImpactPoints: 3,
          categoryName: "Strategic Planning and Governance",
          consultantNote: "",
          executiveNote: "",
          sortOrder: 0,
        });
      }
      if (!/improve|strengthen|enable|increase|reduce|better|confidence|visibility|reliability|productivity|foundation/i.test(text)) {
        return generateOpportunityFromRecommendation({
          id: outcome.title,
          title: outcome.title,
          description: text,
          businessImpact: text,
          priority: "medium",
          suggestedService: null,
          estimatedImpactPoints: 3,
          categoryName: "Strategic Planning and Governance",
          consultantNote: "",
          executiveNote: text,
          sortOrder: 0,
        });
      }
      return text;
    })
    .filter(Boolean);

  const fromRecs = sortByRecommendationPriority(recommendations)
    .slice(0, 6)
    .map((rec) => generateOpportunityFromRecommendation(rec));

  const fromCategories = categorySummaries
    .filter((category) => category.hasRecommendations)
    .sort((left, right) => left.score - right.score)
    .slice(0, 4)
    .map((category) =>
      generateCategoryOpportunity({
        categoryName: category.name,
        score: category.score,
        ratingLabel: "",
        riskLevel: "Moderate",
        hasRecommendations: category.hasRecommendations,
        recommendations: recommendations.filter((rec) => rec.categoryName === category.name),
      }),
    );

  let candidates = dedupeTipStrings([...fromOutcomes, ...fromRecs, ...fromCategories]);
  candidates = filterDistinctFromReference(candidates, risks);

  if (candidates.length < 3) {
    const supplemental = sortByRecommendationPriority(recommendations)
      .slice(0, 8)
      .map((rec) => {
        const category = rec.categoryName.toLowerCase();
        if (/backup|recovery|continuity/.test(category)) {
          return "Improve recovery preparedness and leadership confidence during operational disruptions";
        }
        if (/security|identity|access/.test(category)) {
          return "Strengthen protective controls and reduce preventable security incidents";
        }
        if (/endpoint|infrastructure|network/.test(category)) {
          return "Increase operational reliability and reduce manual support effort";
        }
        return `Create a stronger ${category} foundation that supports scalable business operations`;
      });
    candidates = dedupeTipStrings([...candidates, ...filterDistinctFromReference(supplemental, risks)]);
  }

  const finalItems = candidates.slice(0, 5);

  for (const opportunity of finalItems) {
    for (const risk of risks) {
      if (areTipTextsIdentical(opportunity, risk)) {
        logTipContentWarning(
          `Duplicate risk/opportunity text detected and removed from opportunities: "${opportunity.slice(0, 80)}..."`,
        );
      }
    }
  }

  return filterDistinctFromReference(finalItems, risks).slice(0, 5);
}
