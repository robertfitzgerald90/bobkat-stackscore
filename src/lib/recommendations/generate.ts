import {
  calculateProjectionImpacts,
  evaluateTriggers,
  type GeneratedRecommendation,
  type TriggeredResponse,
} from "./engine";
import { calculateProjectedScore } from "@/lib/scoring";

type ResponseWithTrigger = {
  question: { code: string; weight: number };
  scoreEarned: number;
  selectedAnswerOption: {
    answerText: string;
    triggersRecommendation: boolean;
    triggersCriticalFlag: boolean;
    recommendationTemplate: { code: string } | null;
  };
};

/** Collect trigger payloads from saved assessment responses (DOC-112). */
export function collectTriggeredResponses(
  responses: ResponseWithTrigger[],
): TriggeredResponse[] {
  return responses
    .filter((response) => response.selectedAnswerOption.triggersRecommendation)
    .map((response) => ({
      questionCode: response.question.code,
      answerText: response.selectedAnswerOption.answerText,
      scoreValue: response.scoreEarned,
      weight: response.question.weight,
      templateCode: response.selectedAnswerOption.recommendationTemplate?.code ?? "",
      triggersCriticalFlag: response.selectedAnswerOption.triggersCriticalFlag,
    }))
    .filter((response) => response.templateCode);
}

export type RecommendationGenerationResult = {
  recommendations: GeneratedRecommendation[];
  projectionImpact: number;
  projectedScore: number;
};

/** Deterministic recommendation generation from assessment responses (DOC-112). */
export function generateRecommendations(
  responses: ResponseWithTrigger[],
  overallScore: number,
): RecommendationGenerationResult {
  const triggeredResponses = collectTriggeredResponses(responses);
  const recommendations = evaluateTriggers(triggeredResponses);
  const projectionImpact = calculateProjectionImpacts(recommendations);
  const projectedScore = calculateProjectedScore(overallScore, [projectionImpact]);

  return {
    recommendations,
    projectionImpact,
    projectedScore,
  };
}
