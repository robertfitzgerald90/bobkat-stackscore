import {
  calculateV2Scores,
  isRecognizedV2Answer,
  type V2QuestionInput,
  type V2ResponseInput,
} from "@/lib/scoring/v2";

export type CompletionGuardFailure = {
  ok: false;
  message: string;
};

export type CompletionGuardSuccess = {
  ok: true;
  overallStackScore: number;
  scoring: ReturnType<typeof calculateV2Scores>;
};

export type CompletionGuardResult = CompletionGuardFailure | CompletionGuardSuccess;

/**
 * Server-side v2 completion rules (SS-OPT-002):
 * all active questions answered, recognized labels only, numeric overall required.
 */
export function evaluateV2CompletionGuards(input: {
  unansweredCount: number;
  responses: Array<{ questionCode: string; answerText: string }>;
  questions: V2QuestionInput[];
  scoringResponses: V2ResponseInput[];
}): CompletionGuardResult {
  if (input.unansweredCount > 0) {
    return {
      ok: false,
      message: `${input.unansweredCount} question${input.unansweredCount === 1 ? "" : "s"} remain unanswered. All active questions must be answered before completion.`,
    };
  }

  if (input.responses.length === 0) {
    return {
      ok: false,
      message:
        "At least one question must be answered before completion. All active questions must be answered before completion.",
    };
  }

  for (const response of input.responses) {
    if (!isRecognizedV2Answer(response.answerText)) {
      return {
        ok: false,
        message: `Unrecognized answer label for question ${response.questionCode}: "${response.answerText}". Expected Yes, Partially, No, or Not Applicable.`,
      };
    }
  }

  const scoring = calculateV2Scores({
    questions: input.questions,
    responses: input.scoringResponses,
  });

  if (scoring.overallStackScore === null) {
    return {
      ok: false,
      message:
        "Cannot complete assessment: no valid overall StackScore could be calculated. At least one Technology Pillar must have scorable (non-N/A) answers.",
    };
  }

  return {
    ok: true,
    overallStackScore: scoring.overallStackScore,
    scoring,
  };
}
