import type { TechnologyPillarCode } from "@/lib/technology-maturity/pillars";

export const V2_STANDARD_ANSWERS = ["Yes", "Partially", "No", "Not Applicable"] as const;

export type V2StandardAnswer = (typeof V2_STANDARD_ANSWERS)[number];

export type PillarCompletionStatus = "complete" | "incomplete";

export type V2QuestionInput = {
  id: string;
  pillarCode: TechnologyPillarCode;
  weight: number;
};

export type V2ResponseInput = {
  questionId: string;
  answerText: string;
};

export type PillarScoreResult = {
  pillarCode: TechnologyPillarCode;
  status: PillarCompletionStatus;
  percentScore: number | null;
  maturityLevel: ReturnType<typeof import("./maturity-level").getTechnologyMaturityLevel> | null;
  questionsTotal: number;
  questionsAnswered: number;
  scorableWeightTotal: number;
  weightedPointsEarned: number;
};

export type V2ScoringResult = {
  pillarScores: PillarScoreResult[];
  overallStackScore: number | null;
  overallMaturityLevel: ReturnType<typeof import("./maturity-level").getTechnologyMaturityLevel> | null;
  completePillarCount: number;
  totalPillarCount: number;
};

/** DOC-119 normalized response score (0–100). N/A returns null (excluded). */
export function normalizeAnswerScore(answerText: string): number | null {
  switch (answerText.trim()) {
    case "Yes":
      return 100;
    case "Partially":
      return 50;
    case "No":
      return 0;
    case "Not Applicable":
      return null;
    default:
      return null;
  }
}

export function isNotApplicableAnswer(answerText: string): boolean {
  return answerText.trim() === "Not Applicable";
}
