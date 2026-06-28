import type { CategoryScoreResult } from "@/lib/scoring";

/** DOC-118 v1 category code → DOC-114 v2 category code */
export const V1_TO_V2_CATEGORY: Record<string, string> = {
  security: "security",
  backup: "business_continuity",
  infrastructure: "infrastructure",
  endpoint: "operations",
  documentation: "documentation",
  bcdr: "business_continuity",
  strategic: "strategic_it",
};

export const V2_CATEGORY_LABELS: Record<string, string> = {
  security: "Security",
  business_continuity: "Business Continuity",
  infrastructure: "Infrastructure",
  operations: "Operations",
  documentation: "Documentation",
  strategic_it: "Strategic IT",
  productivity: "Productivity",
};

/** DOC-110 target weights for v2 display (informational until Phase 5 cutover). */
export const V2_CATEGORY_WEIGHTS: Record<string, number> = {
  security: 20,
  business_continuity: 20,
  infrastructure: 15,
  operations: 15,
  documentation: 10,
  strategic_it: 10,
  productivity: 10,
};

export type V2CategoryScore = {
  categoryCode: string;
  categoryName: string;
  percentScore: number;
  maturityTier: string;
  pointsEarned: number;
  pointsPossible: number;
};

/**
 * Aggregates v1 category scores into DOC-114 v2 taxonomy.
 * Backup + BCDR merge into Business Continuity via weighted average.
 */
export function aggregateV2CategoryScores(
  v1Scores: CategoryScoreResult[],
): V2CategoryScore[] {
  const byV1 = new Map(v1Scores.map((score) => [score.categoryCode, score]));

  function directMap(v1Code: string, v2Code: string): V2CategoryScore | null {
    const score = byV1.get(v1Code);
    if (!score || score.pointsPossible === 0) return null;
    return {
      categoryCode: v2Code,
      categoryName: V2_CATEGORY_LABELS[v2Code],
      percentScore: score.percentScore,
      maturityTier: getMaturityLabel(score.percentScore),
      pointsEarned: score.pointsEarned,
      pointsPossible: score.pointsPossible,
    };
  }

  function mergeWeighted(
    v1Codes: string[],
    v2Code: string,
  ): V2CategoryScore | null {
    let earned = 0;
    let possible = 0;
    for (const code of v1Codes) {
      const score = byV1.get(code);
      if (!score) continue;
      earned += score.pointsEarned;
      possible += score.pointsPossible;
    }
    if (possible === 0) return null;
    const percentScore = Math.round((earned / possible) * 10000) / 100;
    return {
      categoryCode: v2Code,
      categoryName: V2_CATEGORY_LABELS[v2Code],
      percentScore,
      maturityTier: getMaturityLabel(percentScore),
      pointsEarned: earned,
      pointsPossible: possible,
    };
  }

  const results: V2CategoryScore[] = [];

  const security = directMap("security", "security");
  if (security) results.push(security);

  const businessContinuity = mergeWeighted(["backup", "bcdr"], "business_continuity");
  if (businessContinuity) results.push(businessContinuity);

  const infrastructure = directMap("infrastructure", "infrastructure");
  if (infrastructure) results.push(infrastructure);

  const operations = directMap("endpoint", "operations");
  if (operations) results.push(operations);

  const documentation = directMap("documentation", "documentation");
  if (documentation) results.push(documentation);

  const strategic = directMap("strategic", "strategic_it");
  if (strategic) results.push(strategic);

  return results;
}

export function calculateV2OverallScore(v2Scores: V2CategoryScore[]): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const score of v2Scores) {
    const weight = V2_CATEGORY_WEIGHTS[score.categoryCode] ?? 0;
    if (weight === 0) continue;
    weightedSum += score.percentScore * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round(weightedSum / totalWeight);
}

function getMaturityLabel(score: number): string {
  if (score >= 81) return "Optimized";
  if (score >= 61) return "Mature";
  if (score >= 41) return "Developing";
  if (score >= 21) return "Foundational";
  return "Nascent";
}

export const V2_CATEGORY_DISPLAY_ORDER = [
  "infrastructure",
  "security",
  "business_continuity",
  "productivity",
  "documentation",
  "strategic_it",
  "operations",
] as const;
