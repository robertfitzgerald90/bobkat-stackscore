import type { TechnologyPillarCode } from "@/lib/technology-maturity/pillars";
import { TECHNOLOGY_PILLARS } from "@/lib/technology-maturity/pillars";
import { getTechnologyMaturityLevel } from "./maturity-level";
import type {
  PillarScoreResult,
  V2QuestionInput,
  V2ResponseInput,
  V2ScoringResult,
} from "./types";
import { normalizeAnswerScore } from "./types";

function roundScore(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculatePillarScore(
  pillarCode: TechnologyPillarCode,
  questions: V2QuestionInput[],
  responses: Map<string, V2ResponseInput>,
): PillarScoreResult {
  const pillarQuestions = questions.filter((q) => q.pillarCode === pillarCode);
  const questionsTotal = pillarQuestions.length;
  const questionsAnswered = pillarQuestions.filter((q) => responses.has(q.id)).length;
  const isComplete = questionsTotal > 0 && questionsAnswered === questionsTotal;

  if (!isComplete) {
    return {
      pillarCode,
      status: "incomplete",
      percentScore: null,
      maturityLevel: null,
      questionsTotal,
      questionsAnswered,
      scorableWeightTotal: 0,
      weightedPointsEarned: 0,
    };
  }

  let weightedSum = 0;
  let weightTotal = 0;

  for (const question of pillarQuestions) {
    const response = responses.get(question.id);
    if (!response) continue;

    const normalized = normalizeAnswerScore(response.answerText);
    if (normalized === null) continue;

    weightedSum += normalized * question.weight;
    weightTotal += question.weight;
  }

  const percentScore =
    weightTotal > 0 ? roundScore(weightedSum / weightTotal) : null;

  return {
    pillarCode,
    status: "complete",
    percentScore,
    maturityLevel: percentScore !== null ? getTechnologyMaturityLevel(percentScore) : null,
    questionsTotal,
    questionsAnswered,
    scorableWeightTotal: weightTotal,
    weightedPointsEarned: weightedSum,
  };
}

/** Equal weight (12.5%) renormalized over complete pillars only — DOC-119. */
export function calculateOverallStackScore(
  pillarScores: PillarScoreResult[],
): number | null {
  const complete = pillarScores.filter(
    (pillar) => pillar.status === "complete" && pillar.percentScore !== null,
  );
  if (complete.length === 0) return null;

  const sum = complete.reduce((total, pillar) => total + pillar.percentScore!, 0);
  return Math.round(sum / complete.length);
}

export function calculateV2Scores(input: {
  questions: V2QuestionInput[];
  responses: V2ResponseInput[];
  pillarCodes?: TechnologyPillarCode[];
}): V2ScoringResult {
  const responseMap = new Map(input.responses.map((r) => [r.questionId, r]));
  const pillars = input.pillarCodes ?? TECHNOLOGY_PILLARS.map((p) => p.code);

  const pillarScores = pillars.map((pillarCode) =>
    calculatePillarScore(pillarCode, input.questions, responseMap),
  );

  const overallStackScore = calculateOverallStackScore(pillarScores);
  const completePillarCount = pillarScores.filter((p) => p.status === "complete").length;

  return {
    pillarScores,
    overallStackScore,
    overallMaturityLevel:
      overallStackScore !== null ? getTechnologyMaturityLevel(overallStackScore) : null,
    completePillarCount,
    totalPillarCount: pillars.length,
  };
}
