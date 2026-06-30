import type { CategoryScoreResult } from "@/lib/scoring";
import { SCORE_HISTORY_CATEGORY_FIELDS } from "@/lib/analytics/categories";

export type TechnologyPillarCode =
  | "identity_access"
  | "endpoint_management"
  | "network_connectivity"
  | "data_protection_recovery"
  | "productivity_collaboration"
  | "security_operations"
  | "documentation_knowledge"
  | "technology_strategy";

export type TechnologyPillarDefinition = {
  code: TechnologyPillarCode;
  name: string;
  businessQuestion: string;
  v1CategoryCodes: string[];
};

export const TECHNOLOGY_PILLARS: TechnologyPillarDefinition[] = [
  {
    code: "identity_access",
    name: "Identity & Access",
    businessQuestion:
      "Can we trust that only the right people have access to our systems and data?",
    v1CategoryCodes: ["security"],
  },
  {
    code: "endpoint_management",
    name: "Endpoint Management",
    businessQuestion:
      "Are company devices secure, standardized, and consistently managed?",
    v1CategoryCodes: ["endpoint"],
  },
  {
    code: "network_connectivity",
    name: "Network & Connectivity",
    businessQuestion:
      "Is the network secure, reliable, and built to support business operations?",
    v1CategoryCodes: ["infrastructure"],
  },
  {
    code: "data_protection_recovery",
    name: "Data Protection & Recovery",
    businessQuestion:
      "Could the business recover from data loss, ransomware, or a major outage?",
    v1CategoryCodes: ["backup", "bcdr"],
  },
  {
    code: "productivity_collaboration",
    name: "Productivity & Collaboration",
    businessQuestion:
      "Does technology enable employees to work efficiently and securely?",
    v1CategoryCodes: [],
  },
  {
    code: "security_operations",
    name: "Security Operations",
    businessQuestion:
      "Can the business detect, respond to, and reduce security risks?",
    v1CategoryCodes: [],
  },
  {
    code: "documentation_knowledge",
    name: "Documentation & Knowledge",
    businessQuestion:
      "Could another trusted IT professional successfully support this environment tomorrow?",
    v1CategoryCodes: ["documentation"],
  },
  {
    code: "technology_strategy",
    name: "Technology Strategy",
    businessQuestion:
      "Is technology helping the business grow while reducing long-term risk?",
    v1CategoryCodes: ["strategic"],
  },
];

const V1_TO_PILLAR = new Map<string, TechnologyPillarCode>(
  TECHNOLOGY_PILLARS.flatMap((pillar) =>
    pillar.v1CategoryCodes.map((code) => [code, pillar.code] as const),
  ),
);

export type PillarScoreInsight = {
  pillarCode: TechnologyPillarCode;
  pillarName: string;
  businessQuestion: string;
  percentScore: number | null;
  maturityTier: string | null;
  trendDelta: number | null;
  openRecommendationCount: number;
};

type ScoreHistoryRow = Record<string, unknown>;

function getMaturityTierLabel(score: number): string {
  if (score >= 81) return "Optimized";
  if (score >= 61) return "Mature";
  if (score >= 41) return "Developing";
  if (score >= 21) return "Foundational";
  return "Nascent";
}

function roundScore(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return Math.round(Number(value));
}

function v1ScoresFromHistoryRow(row: ScoreHistoryRow): Map<string, number> {
  const scores = new Map<string, number>();
  for (const category of SCORE_HISTORY_CATEGORY_FIELDS) {
    const value = roundScore(row[category.field]);
    if (value !== null) scores.set(category.code, value);
  }
  return scores;
}

function scoreForPillarFromV1Map(
  pillar: TechnologyPillarDefinition,
  v1ByCode: Map<string, CategoryScoreResult | number>,
): number | null {
  if (pillar.v1CategoryCodes.length === 0) return null;

  let earned = 0;
  let possible = 0;

  for (const code of pillar.v1CategoryCodes) {
    const entry = v1ByCode.get(code);
    if (entry === undefined) continue;

    if (typeof entry === "number") {
      earned += entry;
      possible += 100;
      continue;
    }

    earned += entry.pointsEarned;
    possible += entry.pointsPossible;
  }

  if (possible === 0) return null;
  return Math.round((earned / possible) * 10000) / 100;
}

function countRecommendationsByPillar(
  recommendations: Array<{ categoryCode: string }>,
): Record<TechnologyPillarCode, number> {
  const counts = Object.fromEntries(
    TECHNOLOGY_PILLARS.map((pillar) => [pillar.code, 0]),
  ) as Record<TechnologyPillarCode, number>;

  for (const recommendation of recommendations) {
    const pillarCode = V1_TO_PILLAR.get(recommendation.categoryCode);
    if (pillarCode) counts[pillarCode] += 1;
  }

  return counts;
}

export function getPillarForV1CategoryCode(
  categoryCode: string,
): TechnologyPillarDefinition | null {
  const pillarCode = V1_TO_PILLAR.get(categoryCode);
  if (!pillarCode) return null;
  return TECHNOLOGY_PILLARS.find((pillar) => pillar.code === pillarCode) ?? null;
}

export function getPillarDisplayForV1CategoryCode(categoryCode: string): {
  pillarName: string;
  businessQuestion: string;
} | null {
  const pillar = getPillarForV1CategoryCode(categoryCode);
  if (!pillar) return null;
  return {
    pillarName: pillar.name,
    businessQuestion: pillar.businessQuestion,
  };
}

export function buildPillarInsights(input: {
  v1CategoryScores: CategoryScoreResult[];
  scoreHistory?: ScoreHistoryRow[];
  openRecommendations: Array<{ categoryCode: string }>;
}): PillarScoreInsight[] {
  const v1ByCode = new Map(input.v1CategoryScores.map((score) => [score.categoryCode, score]));
  const recCounts = countRecommendationsByPillar(input.openRecommendations);

  const previousV1 =
    input.scoreHistory && input.scoreHistory.length >= 2
      ? v1ScoresFromHistoryRow(input.scoreHistory.at(-2)!)
      : null;
  const currentV1 =
    input.scoreHistory && input.scoreHistory.length >= 1
      ? v1ScoresFromHistoryRow(input.scoreHistory.at(-1)!)
      : null;

  return TECHNOLOGY_PILLARS.map((pillar) => {
    const percentScore = scoreForPillarFromV1Map(pillar, v1ByCode);
    const previousScore = previousV1 ? scoreForPillarFromV1Map(pillar, previousV1) : null;
    const currentFromHistory = currentV1
      ? scoreForPillarFromV1Map(pillar, currentV1)
      : percentScore;
    const trendDelta =
      previousScore !== null && currentFromHistory !== null
        ? Math.round(currentFromHistory - previousScore)
        : null;

    return {
      pillarCode: pillar.code,
      pillarName: pillar.name,
      businessQuestion: pillar.businessQuestion,
      percentScore,
      maturityTier: percentScore !== null ? getMaturityTierLabel(percentScore) : null,
      trendDelta,
      openRecommendationCount: recCounts[pillar.code] ?? 0,
    };
  });
}

export function hasAnyPillarScore(insights: PillarScoreInsight[]): boolean {
  return insights.some((insight) => insight.percentScore !== null);
}
