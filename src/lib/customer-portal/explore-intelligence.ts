/**
 * SS-UX-016 — Pure Explore intelligence helpers (no Prisma / I/O).
 * Classifies assessment responses and selects strengths / attention items.
 * Does not recalculate official pillar scores.
 */

import { formatResponseAnswerLabel } from "@/lib/assessments/response-view";
import {
  isNotApplicableAnswer,
  isRecognizedV2Answer,
  normalizeAnswerScore,
} from "@/lib/scoring/v2/types";
import type { PillarResponseEvidence } from "@/lib/customer-portal/pillar-detail-dto";

export type CustomerAssessmentResultKind =
  | "satisfied"
  | "partial"
  | "unsatisfied"
  | "excluded";

export type CustomerAssessmentResultLabel =
  | "Satisfied"
  | "Partially satisfied"
  | "Not satisfied"
  | "Excluded from scoring";

const RESULT_LABEL: Record<CustomerAssessmentResultKind, CustomerAssessmentResultLabel> = {
  satisfied: "Satisfied",
  partial: "Partially satisfied",
  unsatisfied: "Not satisfied",
  excluded: "Excluded from scoring",
};

/** Cap list lengths so Explore stays readable. */
export const EXPLORE_STRENGTH_DISPLAY_LIMIT = 5;
export const EXPLORE_ATTENTION_DISPLAY_LIMIT = 8;

/**
 * Map a recorded answer to customer-facing result kind.
 * Prefer DOC-119 V2 labels; otherwise use earned/max ratio without inventing scores.
 */
export function classifyCustomerAssessmentResult(
  answerText: string,
  scoreEarned: number,
  maxScore: number,
): CustomerAssessmentResultKind {
  const trimmed = answerText.trim();
  if (isRecognizedV2Answer(trimmed)) {
    if (isNotApplicableAnswer(trimmed)) return "excluded";
    const normalized = normalizeAnswerScore(trimmed);
    if (normalized === 100) return "satisfied";
    if (normalized === 50) return "partial";
    if (normalized === 0) return "unsatisfied";
    return "excluded";
  }

  const label = formatResponseAnswerLabel(answerText).toLowerCase();
  if (label === "not applicable" || label === "n/a" || label === "na") return "excluded";
  if (label === "yes") return "satisfied";
  if (label.includes("partial")) return "partial";
  if (label === "no") return "unsatisfied";

  if (maxScore <= 0) return "excluded";
  const ratio = scoreEarned / maxScore;
  if (ratio >= 0.99) return "satisfied";
  if (ratio <= 0.01) return "unsatisfied";
  if (ratio > 0 && ratio < 1) return "partial";
  return "excluded";
}

export function customerAssessmentResultLabel(
  kind: CustomerAssessmentResultKind,
): CustomerAssessmentResultLabel {
  return RESULT_LABEL[kind];
}

export type ClassifiedPillarResponse = PillarResponseEvidence & {
  resultKind: CustomerAssessmentResultKind;
  resultLabel: CustomerAssessmentResultLabel;
  scoreRatio: number;
};

export function classifyPillarResponses(
  responses: PillarResponseEvidence[],
): ClassifiedPillarResponse[] {
  return responses.map((response) => {
    const resultKind = classifyCustomerAssessmentResult(
      response.answerText,
      response.scoreEarned,
      response.maxScore,
    );
    const scoreRatio =
      response.maxScore > 0 ? response.scoreEarned / response.maxScore : 0;
    return {
      ...response,
      resultKind,
      resultLabel: customerAssessmentResultLabel(resultKind),
      scoreRatio,
    };
  });
}

function byQuestionCode(a: ClassifiedPillarResponse, b: ClassifiedPillarResponse): number {
  return a.questionCode.localeCompare(b.questionCode);
}

/**
 * Positive findings (Satisfied). Deterministic: higher score ratio, then question code.
 * Excludes N/A. Never invents rows.
 */
export function selectExploreStrengths(
  classified: ClassifiedPillarResponse[],
  limit: number = EXPLORE_STRENGTH_DISPLAY_LIMIT,
): ClassifiedPillarResponse[] {
  return classified
    .filter((item) => item.resultKind === "satisfied")
    .sort((a, b) => {
      if (b.scoreRatio !== a.scoreRatio) return b.scoreRatio - a.scoreRatio;
      return byQuestionCode(a, b);
    })
    .slice(0, limit);
}

/**
 * Attention findings (Partially + Not satisfied).
 * Order: critical-flagged first, then unsatisfied, then partial, then ratio asc, then code.
 */
export function selectExploreAttentionItems(
  classified: ClassifiedPillarResponse[],
  limit: number = EXPLORE_ATTENTION_DISPLAY_LIMIT,
): ClassifiedPillarResponse[] {
  const rank = (item: ClassifiedPillarResponse) => {
    if (item.isCritical) return 0;
    if (item.resultKind === "unsatisfied") return 1;
    if (item.resultKind === "partial") return 2;
    return 9;
  };

  return classified
    .filter(
      (item) => item.resultKind === "partial" || item.resultKind === "unsatisfied",
    )
    .sort((a, b) => {
      const rankDelta = rank(a) - rank(b);
      if (rankDelta !== 0) return rankDelta;
      if (a.scoreRatio !== b.scoreRatio) return a.scoreRatio - b.scoreRatio;
      return byQuestionCode(a, b);
    })
    .slice(0, limit);
}

export function countScorableControls(classified: ClassifiedPillarResponse[]): number {
  return classified.filter((item) => item.resultKind !== "excluded").length;
}
