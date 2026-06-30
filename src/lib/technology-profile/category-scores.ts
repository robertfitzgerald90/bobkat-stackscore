import {
  aggregateV2CategoryScores,
  type V2CategoryScore,
} from "@/lib/assessment-library/category-mapping";
import type { CategoryScoreResult } from "@/lib/scoring";
import type { PillarScoreSnapshot } from "@/lib/scoring/v2";

export type StoredProfileCategoryScores =
  | V2CategoryScore[]
  | {
      scoringEngineVersion?: "v2";
      pillarScores?: PillarScoreSnapshot[];
    };

export type ParsedProfileCategoryScores = {
  categoryScores: V2CategoryScore[];
  pillarSnapshots: PillarScoreSnapshot[] | null;
  scoringEngineVersion: "v1" | "v2" | null;
};

function isV2StoredCategoryScores(
  raw: unknown,
): raw is { scoringEngineVersion?: "v2"; pillarScores?: PillarScoreSnapshot[] } {
  return (
    typeof raw === "object" &&
    raw !== null &&
    !Array.isArray(raw) &&
    "pillarScores" in raw
  );
}

/** Normalize profile JSON whether stored as v1 V2 categories or v2 pillar snapshots. */
export function parseStoredProfileCategoryScores(
  raw: unknown,
  v1CategoryScores: CategoryScoreResult[],
): ParsedProfileCategoryScores {
  if (isV2StoredCategoryScores(raw)) {
    return {
      categoryScores: [],
      pillarSnapshots: Array.isArray(raw.pillarScores) ? raw.pillarScores : null,
      scoringEngineVersion: "v2",
    };
  }

  if (Array.isArray(raw)) {
    return {
      categoryScores: raw as V2CategoryScore[],
      pillarSnapshots: null,
      scoringEngineVersion: "v1",
    };
  }

  return {
    categoryScores: aggregateV2CategoryScores(v1CategoryScores),
    pillarSnapshots: null,
    scoringEngineVersion: v1CategoryScores.length > 0 ? "v1" : null,
  };
}
